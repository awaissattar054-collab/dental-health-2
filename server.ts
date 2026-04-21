import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "DentalOS API is active" });
  });

  // Simulated OCR Endpoint
  app.post("/api/verify-insurance", async (req, res) => {
    const { image } = req.body;
    // simulating a delay for OCR
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock response for high-end feel
    res.json({
      success: true,
      data: {
        provider: "BlueCross BlueShield",
        memberId: "BCX-987654321",
        groupNumber: "GRP-DENTAL-PRO",
        status: "Active",
        coverage: {
          preventative: "100%",
          basic: "80%",
          major: "50%",
          ortho: "50%"
        }
      }
    });
  });

  // Clinical Brain API - AI Diagnosis & Triage Logic
  app.post("/api/clinical-brain", async (req, res) => {
    const { complaint } = req.body;

    if (!complaint) {
      return res.status(400).json({ error: "Patient complaint is required" });
    }

    try {
      const { GoogleGenAI, Type } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze this dental patient complaint: "${complaint}"`,
        config: {
          systemInstruction: `You are the 'Clinical Brain' for a high-end dental automation system. 
          Analyze patient complaints and return a structured JSON response.
          
          RULES:
          - Explain the condition and treatment in simple words. 
          - Avoid complex medical jargon.
          - Be accurate but naturally cautious.
          - Mention that early treatment can prevent serious complications and reduce costs if relevant.
          - Always include the mandatory safety disclaimer.

          Fields to return:
          1. possibleCondition: The name of the likely issue.
          2. suggestedTreatment: The recommended dental procedure.
          3. priorityLevel: 1-5 (5 = Critical/Life Threatening).
          4. urgency: "Routine", "Urgent", or "Emergency".
          5. explanation: Short, simple reasoning for this suggestion.
          6. estimatedCostRange: Min and Max fee benchmark (US Avg).
          7. disclaimer: "⚠️ This is an AI-based estimation. Final diagnosis requires clinical examination."`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              possibleCondition: { type: Type.STRING },
              suggestedTreatment: { type: Type.STRING },
              priorityLevel: { type: Type.INTEGER, description: "Scale of 1-5" },
              urgency: { type: Type.STRING, enum: ["Routine", "Urgent", "Emergency"] },
              explanation: { type: Type.STRING },
              disclaimer: { type: Type.STRING },
              estimatedCostRange: {
                type: Type.OBJECT,
                properties: {
                  min: { type: Type.NUMBER },
                  max: { type: Type.NUMBER },
                  currency: { type: Type.STRING }
                },
                required: ["min", "max", "currency"]
              }
            },
            required: ["possibleCondition", "suggestedTreatment", "priorityLevel", "urgency", "explanation", "disclaimer", "estimatedCostRange"]
          }
        }
      });

      const analysis = JSON.parse(response.text || "{}");
      res.json({ success: true, analysis });
    } catch (error) {
      console.error("Clinical Brain Error:", error);
      res.status(500).json({ error: "Failed to process clinical analysis" });
    }
  });

  // Appointment Confirmation Endpoint (Simulated SMS/Email)
  app.post("/api/book-appointment", async (req, res) => {
    const { name, date, time, procedure } = req.body;
    
    // Simulate DB operation
    await new Promise(resolve => setTimeout(resolve, 800));

    console.log(`[Booking Engine] Appointment Booked:
      Patient: ${name}
      Procedure: ${procedure}
      Date: ${date}
      Time: ${time}`);

    res.json({ 
      success: true, 
      bookingId: `BK-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      status: 'confirmed'
    });
  });

  app.post("/api/confirm-appointment", async (req, res) => {
    const { patientName, date, time, procedure, channel } = req.body;

    if (!patientName || !date || !time) {
      return res.status(400).json({ error: "Missing scheduling details" });
    }

    // Simulate network latency for external notification services (Twilio/SendGrid)
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log(`[Notification Service] Sending ${channel} to ${patientName}: 
      Confirmed appointment for ${procedure} on ${date} at ${time}.`);

    res.json({ 
      success: true, 
      message: `${channel} sent successfully to ${patientName}`,
      receiptId: `NTF-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    });
  });

  app.post("/api/schedule-reminder", async (req, res) => {
    const { patientName, appointmentDate, reminderLeadTime, channels } = req.body;
    
    // Simulate scheduling logic
    await new Promise(resolve => setTimeout(resolve, 800));

    console.log(`[Automation Engine] Scheduled reminders for ${patientName}:
      Time: ${reminderLeadTime} before ${appointmentDate}
      Channels: ${channels.join(', ')}`);

    res.json({ 
      success: true, 
      jobId: `JOB-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      status: 'scheduled'
    });
  });

  app.post("/api/cancel-appointment", async (req, res) => {
    const { name, date, time } = req.body;
    
    // Simulate DB operation
    await new Promise(resolve => setTimeout(resolve, 800));

    console.log(`[Booking Engine] Appointment CANCELLED:
      Patient: ${name}
      Date: ${date}
      Time: ${time}`);

    res.json({ 
      success: true, 
      message: 'Appointment successfully cancelled',
      status: 'cancelled'
    });
  });

  app.post("/api/reschedule-appointment", async (req, res) => {
    const { name, oldDate, oldTime, newDate, newTime } = req.body;
    
    // Simulate DB operation
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log(`[Booking Engine] Appointment RESCHEDULED:
      Patient: ${name}
      From: ${oldDate} at ${oldTime}
      To: ${newDate} at ${newTime}`);

    res.json({ 
      success: true, 
      message: 'Appointment successfully rescheduled',
      rescheduleId: `RSCH-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      status: 'rescheduled'
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`DentalOS Server running on http://localhost:${PORT}`);
  });
}

startServer();
