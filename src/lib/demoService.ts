import { supabase } from './supabase';

export interface DemoRequest {
  name: string;
  clinicName: string;
  email: string;
  phone: string;
  preferredDate: string;
  createdAt?: any;
}

/**
 * Saves a demo request to the Supabase database.
 * Falls back to internal API if Supabase is not fully configured.
 */
export async function saveDemoRequest(data: DemoRequest) {
  try {
    const { data: inserted, error } = await supabase
      .from('demo_requests')
      .insert({
        name: data.name,
        clinic_name: data.clinicName,
        email: data.email,
        phone: data.phone,
        preferred_date: data.preferredDate
      })
      .select()
      .single();

    if (error) throw error;
    console.log("Demo request saved with ID:", inserted?.id);
    return { success: true, id: inserted?.id };
  } catch (error: any) {
    console.error("Supabase Save Error:", error);
    
    // Fallback to our internal API
    const response = await fetch('/api/demo-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) throw new Error('Backend failed to process request');
    return await response.json();
  }
}

