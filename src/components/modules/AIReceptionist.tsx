import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Calendar, Clock, MapPin, CheckCircle, Mail, Smartphone, Bell, BellRing, Settings2, FileText, Activity, HeartPulse, Sparkles, Stethoscope, WifiOff } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

let genAIInstance: GoogleGenAI | null = null;
function getGenAI() {
  if (!genAIInstance) {
    const rawKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    // Strict verification to prevent "stringified" undefined/null from triggering initialization
    const apiKey = (rawKey && rawKey !== 'undefined' && rawKey !== 'null') ? rawKey : null;

    if (!apiKey) {
      console.warn("AI Receptionist: Missing API Key. Entering offline consultation mode.");
      return null;
    }
    
    try {
      genAIInstance = new GoogleGenAI(apiKey);
    } catch (e) {
      console.error("Failed to initialize GoogleGenAI:", e);
      return null;
    }
  }
  return genAIInstance;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  slots?: { date: string, time: string }[];
  followUps?: { label: string, id: string, status?: 'Pending' | 'Sending' | 'Sent' | 'Failed' }[];
}

interface BookingDetails {
  name: string;
  date: string;
  time: string;
  procedure: string;
}

export default function AIReceptionist() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello! I'm your AI Dental Receptionist. How can I help you manage your practice today? I can help with patient scheduling, basic procedure info, or general inquiries." }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [pendingBooking, setPendingBooking] = useState<BookingDetails | null>(null);
  const [notificationStatus, setNotificationStatus] = useState<{ status: 'idle' | 'sending' | 'sent', channel?: string }>({ status: 'idle' });
  const [reminderLeadTime, setReminderLeadTime] = useState('24h');
  const [automationStatus, setAutomationStatus] = useState<'idle' | 'scheduling' | 'scheduled'>('idle');
  const [showReminderSettings, setShowReminderSettings] = useState(false);
  const [scheduledInfo, setScheduledInfo] = useState<{ time: string, channels: string[] } | null>(null);
  const [intakeStatus, setIntakeStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const selectSlot = (date: string, time: string) => {
    setInput(`I'd like to book for ${date} at ${time}`);
    setTimeout(() => {
      handleSend(`I'd like to book for ${date} at ${time}`);
    }, 100);
  };

  const handleFollowUp = async (label: string, id: string, messageIndex: number) => {
    // Update status to Sending
    setMessages(prev => prev.map((msg, i) => {
      if (i === messageIndex && msg.followUps) {
        return {
          ...msg,
          followUps: msg.followUps.map(f => f.id === id ? { ...f, status: 'Sending' } : f)
        };
      }
      return msg;
    }));

    if (id === 'intake') {
      setIntakeStatus('sending');
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const success = Math.random() > 0.05; // 95% success rate
      
      setMessages(prev => prev.map((msg, i) => {
        if (i === messageIndex && msg.followUps) {
          return {
            ...msg,
            followUps: msg.followUps.map(f => f.id === id ? { ...f, status: success ? 'Sent' : 'Failed' } : f)
          };
        }
        return msg;
      }));
      
      if (success) {
        setIntakeStatus('sent');
        console.log(`[Clinical Engine] Dispatched Pre-Appointment Intake Form`);
      } else {
        setIntakeStatus('idle');
      }
    } else {
      // Simulate generic action
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const success = Math.random() > 0.1; // 90% success rate
      
      setMessages(prev => prev.map((msg, i) => {
        if (i === messageIndex && msg.followUps) {
          return {
            ...msg,
            followUps: msg.followUps.map(f => f.id === id ? { ...f, status: success ? 'Sent' : 'Failed' } : f)
          };
        }
        return msg;
      }));

      // Also trigger AI response for context if it's not a background silent action
      if (success) {
        setInput(`I've processed the ${label.toLowerCase()}`);
        setTimeout(() => {
          handleSend(`I've processed the ${label.toLowerCase()}`);
        }, 100);
      }
    }
  };

  const handleSend = async (overrideMessage?: string) => {
    if ((!input.trim() && !overrideMessage) || isTyping) return;

    const userMessage = overrideMessage || input.trim();
    if (!overrideMessage) setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsTyping(true);

    try {
      const genAI = getGenAI();
      if (!genAI) {
        throw new Error("Consultation Mode: Offline");
      }
      const chat = genAI.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: `You are a highly professional AI Receptionist for a premium dental clinic called Sterling Dental. 
          Your goals are to understand patient problems, guide them clearly, and convert them into booked appointments.

          ### CONVERSATION FLOW:
          1. INITIAL TRIAGE:
             If a patient mentions a problem/pain, ask:
             - What issue are you facing?
             - Since when?
             - Pain level (1-10)?

          2. RESPONSE & REASSURANCE:
             Once the user provides details:
             - Explain the possible issue in simple, human-like words.
             - Suggest the likely treatment.
             - ALWAYS include: "This is a common issue and can be treated."
             - ALWAYS include: "I recommend booking an appointment as soon as possible."
             - ALWAYS include: "Delaying treatment may worsen the condition."
             - ALWAYS include: "Early treatment can prevent serious complications and reduce costs."
             - ALWAYS ask: "Would you like me to book your appointment now or connect you with a dentist?"

          3. BOOKING (If they say YES):
             Once they agree to book:
             - Ask them to select the type of appointment.
             - EXPLICITLY PRESENT these options: [Cleaning, Check-up, Emergency, Consultation].
             - ALWAYS include the [SELECT_TYPE] marker when asking them to choose a procedure.
             - Once the type is selected, you MUST confirm it back to the patient first (e.g., "Got it, a [TYPE] appointment. That's a great choice for your oral health.") and then ask for their Full Name to proceed.
             - When presenting slots, ALWAYS use the following marker immediately after your text response:
               [OFFER_SLOTS: [{"date": "Monday, April 20", "time": "9:00 AM"}, {"date": "Monday, April 20", "time": "11:30 AM"}, {"date": "Tuesday, April 21", "time": "10:00 AM"}, {"date": "Wednesday, April 22", "time": "3:00 PM"}, {"date": "Thursday, April 23", "time": "2:00 PM"}]]
             - The text part of your response should say something like: "I have some openings this week. Which of these works best for you?"
             - Do not list the slots in the text if you use the marker.

             Once they select a slot and provide their name, confirm definitively with: 
             "Perfect! I have officially booked your appointment for [DATE] at [TIME]. You are all set!"

             AFTER booking is confirmed, ALWAYS suggest follow-up actions using this marker:
             [FOLLOW_UP: [{"label": "Send Intake Form", "id": "intake"}, {"label": "Request Insurance Info", "id": "insurance"}, {"label": "Book Referral Call", "id": "referral"}]]
             
             The text part of your response should say: "Appointment confirmed! Would you like me to handle any of these follow-up actions for you?"

          4. CANCELLATION:
             If a patient wants to cancel, you MUST verify their details before processing.
             If details are missing, say: "I can help with that. To locate your appointment, I'll need your full name and the scheduled date/time please."
             - Ask for: Full Name
             - Ask for: Appointment Date & Time
             
             Once they provide these, confirm with: "I've successfully cancelled your appointment for [DATE] at [TIME]. We hope to see you again soon!"
             And ALWAYS include the [CANCEL_READY] marker.

          5. RESCHEDULING:
             If a patient wants to reschedule, ask for:
             - Full Name
             - CURRENT Appointment Date & Time
             - NEW Preferred Date & Time
             Confirm with: "Perfect! I have rescheduled your appointment. Your old slot on [OLD_DATE] is now moved to [NEW_DATE] at [NEW_TIME]. See you then!"
             And ALWAYS include the [RESCHEDULE_READY] marker.

          6. CRITICAL LOGIC:
             Once booking details are complete:
             [BOOKING_READY: {"name": "PATIENT_NAME", "date": "APPOINTMENT_DATE", "time": "APPOINTMENT_TIME", "procedure": "PROCEDURE_NAME"}]

             Once cancellation details (Name, Date, Time) are confirmed:
             [CANCEL_READY: {"name": "PATIENT_NAME", "date": "APPOINTMENT_DATE", "time": "APPOINTMENT_TIME"}]

             Once rescheduling details are confirmed:
             [RESCHEDULE_READY: {"name": "PATIENT_NAME", "oldDate": "OLD_DATE", "oldTime": "OLD_TIME", "newDate": "NEW_DATE", "newTime": "NEW_TIME"}]

          ### GUIDELINES:
          - Keep responses short, empathetic, and human-like.
          - DO NOT give final medical advice.
          - ALWAYS append this safety line to clinical suggestions: "⚠️ This is an AI suggestion. Final diagnosis must be confirmed by a licensed dentist."
          `,
          temperature: 0.7,
        },
        history: messages.map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }]
        }))
      });

      const result = await chat.sendMessage({ message: userMessage });
      let aiResponse = result.text || "I'm sorry, I'm having trouble processing that request right now. Could you try again?";
      let offeredSlots: { date: string, time: string }[] | undefined = undefined;
      let followUps: { label: string, id: string }[] | undefined = undefined;

      // Clean [SELECT_TYPE] marker for display but keep in content for conditional rendering
      const hasSelectType = aiResponse.includes("[SELECT_TYPE]");
      // aiResponse = aiResponse.replace("[SELECT_TYPE]", "").trim(); // We'll keep it in the string for the conditional check in JSX

      // Check for slot offering marker
      const slotsMatch = aiResponse.match(/\[OFFER_SLOTS: (.*?)\]/);
      if (slotsMatch) {
        try {
          offeredSlots = JSON.parse(slotsMatch[1]);
          aiResponse = aiResponse.replace(/\[OFFER_SLOTS: .*?\]/, "").trim();
        } catch (e) {
          console.error("Failed to parse slots", e);
        }
      }

      // Check for follow-up marker
      const followUpMatch = aiResponse.match(/\[FOLLOW_UP: (.*?)\]/);
      if (followUpMatch) {
        try {
          followUps = JSON.parse(followUpMatch[1]);
          aiResponse = aiResponse.replace(/\[FOLLOW_UP: .*?\]/, "").trim();
        } catch (e) {
          console.error("Failed to parse follow-ups", e);
        }
      }
      
      // Check for booking marker
      const bookingMatch = aiResponse.match(/\[BOOKING_READY: (.*?)\]/);
      if (bookingMatch) {
        try {
          const details = JSON.parse(bookingMatch[1]);
          setPendingBooking(details);
          setNotificationStatus({ status: 'idle' });
          
          // Auto-trigger backend booking
          fetch('/api/book-appointment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(details)
          }).then(res => res.json())
            .then(data => {
              if (data.success) {
                console.log("Appointment officially booked in backend", data.bookingId);
              }
            }).catch(console.error);

          // Clean up response text for users
          aiResponse = aiResponse.replace(/\[BOOKING_READY: .*?\]/, "").trim();
        } catch (e) {
          console.error("Failed to parse booking details", e);
        }
      }

      // Check for cancellation marker
      const cancelMatch = aiResponse.match(/\[CANCEL_READY: (.*?)\]/);
      if (cancelMatch) {
        try {
          const details = JSON.parse(cancelMatch[1]);
          // Auto-trigger backend cancellation
          fetch('/api/cancel-appointment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(details)
          }).then(res => res.json())
            .then(data => {
              if (data.success) {
                console.log("Appointment officially cancelled in backend");
              }
            }).catch(console.error);

          // Clean up response text for users
          aiResponse = aiResponse.replace(/\[CANCEL_READY: .*?\]/, "").trim();
        } catch (e) {
          console.error("Failed to parse cancellation details", e);
        }
      }

      // Check for reschedule marker
      const rescheduleMatch = aiResponse.match(/\[RESCHEDULE_READY: (.*?)\]/);
      if (rescheduleMatch) {
        try {
          const details = JSON.parse(rescheduleMatch[1]);
          // Auto-trigger backend reschedule
          fetch('/api/reschedule-appointment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(details)
          }).then(res => res.json())
            .then(data => {
              if (data.success) {
                console.log("Appointment officially rescheduled in backend");
              }
            }).catch(console.error);

          // Clean up response text for users
          aiResponse = aiResponse.replace(/\[RESCHEDULE_READY: .*?\]/, "").trim();
        } catch (e) {
          console.error("Failed to parse reschedule details", e);
        }
      }

      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse, slots: offeredSlots, followUps }]);
    } catch (error: any) {
      console.error("AI Assistant Error:", error);
      const errorMsg = error?.message === "Consultation Mode: Offline" 
        ? "Consultation Mode: Offline - AI processor is standby. Please check credentials."
        : "Consultation Mode: Offline - Technical interference detected. Please try again.";
      setMessages(prev => [...prev, { role: 'assistant', content: errorMsg }]);
    } finally {
      setIsTyping(false);
    }
  };

  const sendIntakeForm = async () => {
    if (!pendingBooking || intakeStatus === 'sending') return;
    
    setIntakeStatus('sending');
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIntakeStatus('sent');
    console.log(`[Clinical Engine] Dispatched Pre-Appointment Intake Form to ${pendingBooking.name}`);
    
    // Auto-reset or dismiss after a while
    setTimeout(() => {
      if (automationStatus !== 'scheduled') {
        // Only clear if everything is done
        // For now let's just keep 'sent' status visible
      }
    }, 3000);
  };

  const sendConfirmation = async (channel: 'SMS' | 'Email') => {
    if (!pendingBooking || notificationStatus.status === 'sending') return;
    
    setNotificationStatus({ status: 'sending', channel });
    
    try {
      const response = await fetch('/api/confirm-appointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: pendingBooking.name,
          date: pendingBooking.date,
          time: pendingBooking.time,
          procedure: pendingBooking.procedure,
          channel
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setNotificationStatus({ status: 'sent', channel });
        // Don't clear pendingBooking immediately if they might want to schedule reminders too
      }
    } catch (error) {
      console.error(error);
      setNotificationStatus({ status: 'idle' });
    }
  };

  const scheduleAutomation = async () => {
    if (!pendingBooking || automationStatus === 'scheduling') return;

    setAutomationStatus('scheduling');

    try {
      const response = await fetch('/api/schedule-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: pendingBooking.name,
          appointmentDate: `${pendingBooking.date} at ${pendingBooking.time}`,
          reminderLeadTime,
          channels: ['SMS', 'Email']
        })
      });

      const data = await response.json();
      if (data.success) {
        // Calculate detailed timing string
        let timingDisplay = '';
        if (reminderLeadTime === '2h') timingDisplay = '2 hours prior';
        else if (reminderLeadTime === '24h') timingDisplay = '24 hours prior';
        else if (reminderLeadTime === '48h') timingDisplay = '48 hours prior';
        else if (reminderLeadTime === '1w') timingDisplay = '1 week prior';

        setAutomationStatus('scheduled');
        setScheduledInfo({
          time: `${timingDisplay} (${pendingBooking.date})`,
          channels: ['SMS', 'Email']
        });
        
        // We extend the timeout to 10 seconds so the user can actually see the detailed feedback
        setTimeout(() => {
          setPendingBooking(null);
          setAutomationStatus('idle');
          setScheduledInfo(null);
          setShowReminderSettings(false);
        }, 10000); 
      }
    } catch (error) {
      console.error(error);
      setAutomationStatus('idle');
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto h-[calc(100vh-8rem)] flex flex-col space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Virtual Receptionist</h1>
          <p className="text-secondary mt-1">Natural language scheduling and patient support assistant.</p>
        </div>
        <AnimatePresence>
          {pendingBooking && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-accent/10 border border-accent/20 rounded-2xl p-4 flex flex-col gap-4 shadow-lg shadow-accent/5 w-fit"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-white">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="pr-4 border-r border-accent/10">
                  <p className="text-[10px] uppercase font-bold text-accent tracking-widest">Appointment Detected</p>
                  <p className="text-sm font-bold text-primary">{pendingBooking.name}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => sendConfirmation('SMS')}
                    disabled={notificationStatus.status !== 'idle'}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-bold transition-all",
                      notificationStatus.status === 'sent' && notificationStatus.channel === 'SMS'
                        ? "bg-emerald-500 text-white"
                        : "bg-card border border-border text-secondary hover:text-accent hover:border-accent"
                    )}
                  >
                    {notificationStatus.status === 'sending' && notificationStatus.channel === 'SMS' ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : notificationStatus.status === 'sent' && notificationStatus.channel === 'SMS' ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : (
                      <Smartphone className="w-3 h-3" />
                    )}
                    {notificationStatus.status === 'sent' && notificationStatus.channel === 'SMS' ? 'SMS SENT' : 'SEND SMS'}
                  </button>
                  <button 
                    onClick={() => sendConfirmation('Email')}
                    disabled={notificationStatus.status !== 'idle'}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-bold transition-all",
                      notificationStatus.status === 'sent' && notificationStatus.channel === 'Email'
                        ? "bg-emerald-500 text-white"
                        : "bg-card border border-border text-secondary hover:text-accent hover:border-accent"
                    )}
                  >
                    {notificationStatus.status === 'sending' && notificationStatus.channel === 'Email' ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : notificationStatus.status === 'sent' && notificationStatus.channel === 'Email' ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : (
                      <Mail className="w-3 h-3" />
                    )}
                    {notificationStatus.status === 'sent' && notificationStatus.channel === 'Email' ? 'EMAIL SENT' : 'SEND EMAIL'}
                  </button>
                  <button 
                    onClick={() => setShowReminderSettings(!showReminderSettings)}
                    className={cn(
                      "p-2 rounded-lg transition-all border",
                      showReminderSettings ? "bg-accent/20 border-accent/40 text-accent" : "bg-card border-border text-secondary hover:border-accent/40"
                    )}
                  >
                    <Settings2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Follow-up Action: Intake Form */}
              <div className="px-4 pb-4 border-t border-accent/10 pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">Follow-up Action</span>
                    <span className="text-[11px] font-medium text-primary">Pre-appointment Intake Form</span>
                  </div>
                  <button
                    onClick={sendIntakeForm}
                    disabled={intakeStatus !== 'idle'}
                    className={cn(
                      "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2",
                      intakeStatus === 'sent' 
                        ? "bg-emerald-500 text-white" 
                        : "bg-background border border-border text-secondary hover:text-accent hover:border-accent"
                    )}
                  >
                    {intakeStatus === 'sending' ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : intakeStatus === 'sent' ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : (
                      <FileText className="w-3 h-3" />
                    )}
                    {intakeStatus === 'sent' ? 'FORM SENT' : 'SEND FORM'}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {showReminderSettings && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-accent/10 pt-4 flex flex-col gap-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BellRing className="w-3 h-3 text-accent" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">Automated Reminders</span>
                      </div>
                      <select 
                        value={reminderLeadTime}
                        onChange={(e) => setReminderLeadTime(e.target.value)}
                        className="bg-card border border-border rounded-lg text-[10px] font-bold px-2 py-1 outline-none text-primary focus:border-accent"
                      >
                        <option value="2h">2 Hours Before</option>
                        <option value="24h">24 Hours Before</option>
                        <option value="48h">48 Hours Before</option>
                        <option value="1w">1 Week Before</option>
                      </select>
                    </div>
                    <button 
                      onClick={scheduleAutomation}
                      disabled={automationStatus !== 'idle'}
                      className={cn(
                        "w-full py-2.5 rounded-xl text-[10px] font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2",
                        automationStatus === 'scheduled' 
                          ? "bg-emerald-500 text-white" 
                          : "bg-accent text-white hover:bg-blue-600 shadow-md shadow-accent/10"
                      )}
                    >
                      {automationStatus === 'scheduling' ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : automationStatus === 'scheduled' ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <Bell className="w-3 h-3" />
                      )}
                      {automationStatus === 'scheduled' ? 'Reminders Scheduled' : 'Schedule Automation'}
                    </button>
                    {automationStatus === 'scheduled' && scheduledInfo && (
                      <motion.div 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-3"
                      >
                        <div className="flex items-center gap-2 pb-2 border-b border-emerald-500/10">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">
                            Live Automation Queue
                          </p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-secondary">Est. Delivery:</span>
                            <span className="text-[10px] font-bold text-primary px-2 py-0.5 bg-card rounded-md border border-border">
                              {scheduledInfo.time}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-secondary">Active Channels:</span>
                            <div className="flex gap-1">
                              {scheduledInfo.channels.map(c => (
                                <span key={c} className="text-[9px] font-bold text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                  {c}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex justify-between items-center pt-1">
                            <span className="text-[10px] text-secondary">Sync Status:</span>
                            <span className="text-[9px] font-mono text-emerald-500 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" /> VERIFIED
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex-1 glass-card flex flex-col overflow-hidden">
        {/* Chat Area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-8 space-y-6 scroll-smooth bg-card/30"
        >
          {messages.map((m, i) => (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              key={i}
              className={cn(
                "flex gap-4 max-w-[85%]",
                m.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border",
                m.role === 'user' ? "bg-accent border-accent text-white shadow-lg shadow-accent/20" : "bg-card border-border text-secondary"
              )}>
                {m.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>
              <div className={cn(
                "px-5 py-3.5 rounded-2xl text-sm leading-relaxed border shadow-sm",
                m.role === 'user' 
                  ? "bg-accent/10 border-accent/20 text-primary rounded-tr-none" 
                  : "bg-slate-800/50 border-border text-primary rounded-tl-none font-medium"
              )}>
                <p>{m.content.replace("[SELECT_TYPE]", "").trim()}</p>
                {m.content.includes("[SELECT_TYPE]") && (
                  <div className="mt-4 flex flex-col gap-2">
                    <p className="text-[10px] font-bold text-accent uppercase tracking-widest mb-1">Select Procedure:</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: 'Cleaning', icon: Sparkles },
                        { label: 'Check-up', icon: Stethoscope },
                        { label: 'Emergency', icon: Activity },
                        { label: 'Consultation', icon: HeartPulse }
                      ].map((type, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(`I'd like a ${type.label} appointment`)}
                          className="px-4 py-2 bg-accent/10 border border-accent/20 rounded-xl text-xs font-bold text-accent hover:bg-accent hover:text-white transition-all flex items-center gap-2 group shadow-sm"
                        >
                          <type.icon className="w-3 h-3 group-hover:scale-110 transition-transform" />
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {m.slots && (
                  <div className="mt-4 flex flex-col gap-2">
                    <p className="text-[10px] font-bold text-accent uppercase tracking-widest mb-1">Available Slots:</p>
                    <div className="flex flex-wrap gap-2">
                      {m.slots.map((slot, idx) => (
                        <button
                          key={idx}
                          onClick={() => selectSlot(slot.date, slot.time)}
                          className="px-3 py-2 bg-accent/20 border border-accent/30 rounded-xl text-xs font-bold text-accent hover:bg-accent hover:text-white transition-all flex items-center gap-2 group"
                        >
                          <Clock className="w-3 h-3 group-hover:scale-110 transition-transform" />
                          {slot.date} @ {slot.time}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {m.followUps && (
                  <div className="mt-4 flex flex-col gap-2 p-4 bg-accent/5 rounded-xl border border-accent/10">
                    <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Recommended Follow-up Actions:</p>
                    <div className="flex flex-col gap-2">
                      {m.followUps.map((action, idx) => (
                        <button
                          key={idx}
                          disabled={action.status === 'Sending' || action.status === 'Sent'}
                          onClick={() => handleFollowUp(action.label, action.id, i)}
                          className={cn(
                            "w-full text-left px-4 py-2 bg-card border rounded-xl text-xs font-bold transition-all flex items-center justify-between group",
                            action.status === 'Sent' ? "border-emerald-500/30 text-emerald-500 bg-emerald-500/5 cursor-default" :
                            action.status === 'Failed' ? "border-rose-500/30 text-rose-500 bg-rose-500/5" :
                            "border-border text-primary hover:border-accent hover:text-accent"
                          )}
                        >
                          <span className="flex items-center gap-2">
                            {action.id === 'intake' ? <FileText className="w-3 h-3" /> : <Smartphone className="w-3 h-3" />}
                            {action.label}
                          </span>
                          <div className="flex items-center gap-2">
                            {(!action.status || action.status === 'Pending') && (
                              <p className="text-[8px] font-bold text-secondary/40 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">Execute</p>
                            )}
                            {action.status === 'Sending' && <Loader2 className="w-3 h-3 animate-spin text-accent" />}
                            {action.status === 'Sent' && <CheckCircle className="w-3 h-3 text-emerald-500" />}
                            {action.status === 'Failed' && <Activity className="w-3 h-3 text-rose-500 animate-pulse" />}
                            
                            <span className={cn(
                              "text-[9px] font-bold uppercase",
                              action.status === 'Sent' ? "text-emerald-500/70" :
                              action.status === 'Failed' ? "text-rose-500/70" :
                              action.status === 'Sending' ? "text-accent/70" :
                              "text-secondary/30"
                            )}>
                              {action.status || 'Pending'}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center">
                <Bot className="w-5 h-5 text-secondary animate-pulse" />
              </div>
              <div className="px-5 py-3.5 rounded-2xl bg-slate-800/50 border border-border flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-accent/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-accent/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-accent/40 rounded-full animate-bounce" />
              </div>
            </div>
          )}
        </div>

        {/* Action Suggestion Bar */}
        <div className="px-8 pb-4 flex flex-wrap gap-2">
          {[
            { label: 'Cleaning', icon: Sparkles, type: 'booking' },
            { label: 'Check-up', icon: Stethoscope, type: 'booking' },
            { label: 'Emergency', icon: Activity, type: 'booking' },
            { label: 'Consultation', icon: HeartPulse, type: 'booking' },
            { label: 'Cancel Appointment', icon: CheckCircle, type: 'danger' },
            { label: 'Offices', icon: MapPin, type: 'general' },
          ].map((btn, i) => (
            <button 
              key={i}
              onClick={() => {
                if (btn.type === 'danger') {
                  handleSend("I'd like to cancel my appointment");
                } else {
                  setInput(`I'd like to book a ${btn.label}`);
                }
              }}
              className={cn(
                "px-4 py-2 bg-card border border-border hover:border-accent/40 text-[10px] font-bold rounded-xl flex items-center gap-2 transition-all active:scale-95 shadow-sm",
                btn.type === 'booking' ? "text-accent border-accent/20" : 
                btn.type === 'danger' ? "text-rose-500 border-rose-500/20 hover:bg-rose-500/5" :
                "text-secondary"
              )}
            >
              <btn.icon className="w-3 h-3" />
              {btn.label}
            </button>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-6 border-t border-border bg-card">
          <div className="relative flex items-center gap-4 max-w-4xl mx-auto">
            <input 
              type="text" 
              placeholder="Ask me anything..."
              className="flex-1 px-6 py-4 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-accent transition shadow-inner text-sm text-primary placeholder:text-secondary/50"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button 
              onClick={() => handleSend()}
              disabled={isTyping || !input.trim()}
              className="w-12 h-12 bg-accent text-white rounded-2xl flex items-center justify-center hover:bg-blue-600 transition shadow-lg shadow-accent/20 disabled:opacity-50 active:scale-95 shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-[10px] text-center text-secondary/40 mt-4 uppercase tracking-[0.2em] font-bold">
            DentalOS Intelligence Logic 3.0
          </p>
        </div>
      </div>
    </div>
  );
}
