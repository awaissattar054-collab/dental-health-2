import { GoogleGenAI } from "@google/genai";

// Initialize Gemini for Clinical Brain features
// We use Gemini 3 Flash for speed and clinical reasoning accuracy
const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "" 
});

export const clinicalBrain = {
  /**
   * Generates a patient summary for clinical oversight.
   * HIPAA NOTE: Ensure no raw PII is logged in non-encrypted transient buffers.
   */
  async generatePatientSummary(patientData: any, treatmentNotes: string[]) {
    const prompt = `
      CONTEXT: You are a Dental Clinical AI Assistant.
      TASK: Summarize the following patient's clinical history and identify potential risks.
      
      PATIENT DATA:
      ${JSON.stringify(patientData)}
      
      RECENT NOTES:
      ${treatmentNotes.join('\n---\n')}
      
      OUTPUT FORMAT:
      1. Clinical Snapshot (2 sentences)
      2. Key Risks/Watchlist Items
      3. Suggested Next Procedures
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          temperature: 0.1, // High deterministic for medical summaries
        }
      });

      return response.text;
    } catch (error) {
      console.error("Clinical Brain Error:", error);
      throw new Error("AI Analysis Failed. Please review manually.");
    }
  },

  /**
   * Streaming dental assistant for real-time triage.
   */
  async *streamTriageAdvice(symptoms: string) {
    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: "You are a dental receptionist assistant. Help triage patient urgency. If bleeding or sharp pain, flag as EMERGENCY."
      }
    });

    const result = await chat.sendMessageStream({ message: symptoms });
    
    for await (const chunk of result) {
      yield chunk.text;
    }
  }
};
