import { formatInTimeZone } from 'date-fns-tz';

interface WhatsAppReminderOptions {
  patientName: string;
  appointmentTime: Date; // UTC date
  clinicAddress: string;
  patientPhone: string;
  clinicTimeZone: string; // e.g. 'America/New_York'
}

/**
 * Sends an automated WhatsApp reminder using the Meta Cloud API.
 * This logic handles timezone conversion to ensure the patient sees their local clinic time.
 */
export async function sendWhatsAppReminder({
  patientName,
  appointmentTime,
  clinicAddress,
  patientPhone,
  clinicTimeZone
}: WhatsAppReminderOptions) {
  // 1. Format the time according to the clinic's local timezone
  const formattedTime = formatInTimeZone(
    appointmentTime,
    clinicTimeZone,
    'eeee, MMMM doooo @ h:mm a'
  );

  const WHATSAPP_API_URL = `https://graph.facebook.com/v17.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
  const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!ACCESS_TOKEN || !process.env.WHATSAPP_PHONE_NUMBER_ID) {
    console.error('WhatsApp credentials missing in environment variables.');
    return { success: false, error: 'Configuration Error' };
  }

  const payload = {
    messaging_product: "whatsapp",
    to: patientPhone,
    type: "template",
    template: {
      name: "appointment_reminder",
      language: { code: "en_US" },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: patientName },
            { type: "text", text: formattedTime },
            { type: "text", text: clinicAddress }
          ]
        }
      ]
    }
  };

  try {
    const response = await fetch(WHATSAPP_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error?.message || 'Failed to send WhatsApp message');
    }

    console.log(`Reminder sent to ${patientName} for ${formattedTime}`);
    return { success: true, messageId: result.messages?.[0]?.id };
  } catch (error) {
    console.error('WhatsApp Cloud API Error:', error);
    return { success: false, error };
  }
}
