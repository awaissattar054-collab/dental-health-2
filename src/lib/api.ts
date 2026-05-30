import toast from 'react-hot-toast';

export interface DemoRequest {
  name: string;
  clinicName: string;
  email: string;
  phone: string;
  preferredDate: string;
}

export interface AIAnalysisRequest {
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[];
}

/**
 * Helper to handle fetch responses
 */
async function handleResponse(response: Response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Something went wrong');
  }
  return response.json();
}

/**
 * Submit a demo request
 */
export async function submitDemoRequest(data: DemoRequest) {
  try {
    const response = await fetch('/api/demo-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Demo Request Error:', error);
    toast.error(error instanceof Error ? error.message : 'Failed to submit demo request');
    throw error;
  }
}

/**
 * AI Clinical Brain Streaming Analysis
 * Note: Since this is streaming, we use a different approach than standard fetch
 */
export async function streamAIAnalysis(
  messages: AIAnalysisRequest['messages'],
  onChunk: (chunk: string) => void,
  onComplete: () => void,
  onError: (error: any) => void
) {
  try {
    const response = await fetch('/api/ai-clinical-brain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      throw new Error('AI analysis failed');
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('ReadableStream not supported');

    const decoder = new TextDecoder();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value, { stream: true });
      onChunk(chunk);
    }
    
    onComplete();
  } catch (error) {
    console.error('AI Stream Error:', error);
    onError(error);
  }
}

/**
 * Verify Insurance (Simulated OCR)
 */
export async function verifyInsurance(imageUrl: string) {
  try {
    const response = await fetch('/api/verify-insurance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imageUrl }),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Insurance Verification Error:', error);
    toast.error('Failed to verify insurance');
    throw error;
  }
}

/**
 * Update Reminder Settings
 */
export async function updateReminderSettings(settings: any) {
  try {
    const response = await fetch('/api/settings/reminders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Settings Update Error:', error);
    toast.error('Failed to update reminder settings');
    throw error;
  }
}

/**
 * Book Appointment
 */
export async function bookAppointment(data: any) {
  try {
    const response = await fetch('/api/book-appointment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Booking Error:', error);
    toast.error('Failed to book appointment');
    throw error;
  }
}
