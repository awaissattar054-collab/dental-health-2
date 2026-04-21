import { useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  DollarSign, 
  MessageSquare, 
  ArrowUpRight, 
  Zap, 
  BarChart3,
  Settings,
  ChevronRight,
  Clock,
  Sparkles,
  Megaphone,
  Mail,
  Smartphone,
  CheckCircle,
  Loader2,
  FileText,
  Send,
  User,
  Bot,
  Heart,
  MessageCircle,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Minus,
  ClipboardCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { GoogleGenAI, Type } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;
function getAI() {
  if (!aiInstance) {
    const rawKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    const apiKey = (rawKey && rawKey !== 'undefined' && rawKey !== 'null') ? rawKey : null;

    if (!apiKey) {
      console.warn("Clinic Growth AI: Missing API Key. Practice Systems: Offline.");
      return null;
    }

    try {
      aiInstance = new GoogleGenAI(apiKey);
    } catch (e) {
      console.error("Clinic Growth AI Initialization Error:", e);
      return null;
    }
  }
  return aiInstance;
}

interface FeedItem {
  id: string;
  type: 'booking' | 'inquiry' | 'triage';
  patient: string;
  action: string;
  time: string;
  value?: number;
}

const MOCK_FEED: FeedItem[] = [
  { id: '1', type: 'booking', patient: 'Alice Freeman', action: 'booked Root Canal therapy', time: '2m ago', value: 1200 },
  { id: '2', type: 'inquiry', patient: 'Marcus Aurelius', action: 'asked about sedation options', time: '12m ago' },
  { id: '3', type: 'triage', patient: 'Sloan Riley', action: 'identified as High Urgency (Abscess)', time: '25m ago', value: 500 },
  { id: '4', type: 'booking', patient: 'Derek Shepherd', action: 'confirmed 6-month cleaning', time: '1h ago', value: 150 },
];

export default function ClinicGrowth() {
  const [activeSubTab, setActiveSubTab] = useState('leads');
  const [managementPrompt, setManagementPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  // Patient Feedback Intelligence State
  const [feedbackInput, setFeedbackInput] = useState('');
  const [isAnalyzingFeedback, setIsAnalyzingFeedback] = useState(false);
  const [analyzedFeedback, setAnalyzedFeedback] = useState<{
    themes: string[],
    actions: string[],
    sentiment: 'Positive' | 'Neutral' | 'Negative'
  } | null>(null);

  const stats = [
    { label: 'Conversion Rate', value: '68%', change: '+12%', icon: BarChart3 },
    { label: 'Active Leads', value: '142', change: '+24', icon: Users },
    { label: 'Response Time', value: '< 2m', change: '-45s', icon: Zap },
    { label: 'ROI (30d)', value: '14.2x', change: '+2.1x', icon: TrendingUp },
  ];

  const subNav = [
    { id: 'leads', label: 'Leads', icon: Users },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'campaigns', label: 'Campaigns', icon: Megaphone },
    { id: 'revenue', label: 'Revenue Insights', icon: DollarSign },
    { id: 'settings', label: 'AI Settings', icon: Settings },
  ];

  const [campaignStatus, setCampaignStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null);

  const handleSendCampaign = async (id: string) => {
    setActiveCampaignId(id);
    setCampaignStatus('sending');
    // Simulate network delay for bulk messaging service
    await new Promise(resolve => setTimeout(resolve, 2000));
    setCampaignStatus('sent');
    setTimeout(() => {
      setCampaignStatus('idle');
      setActiveCampaignId(null);
    }, 4000);
  };

  const handleManagementAi = async (prompt?: string) => {
    const finalPrompt = prompt || managementPrompt;
    if (!finalPrompt.trim()) return;

    setIsAiLoading(true);
    setAiResponse(null);

    try {
      const ai = getAI();
      if (!ai) throw new Error("Consultation Mode: Offline");
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: finalPrompt,
        config: {
          systemInstruction: "You are an expert Dental Office Management AI. Your goal is to help dental office staff with practice management tasks such as summarizing patient feedback, drafting internal memos, creating clinical documentation templates, and analyzing practice metrics. Be professional, concise, and helpful."
        }
      });

      setAiResponse(response.text || "No response received from AI.");
    } catch (error: any) {
      console.error("AI Assistant Error:", error);
      setAiResponse(error?.message === "Consultation Mode: Offline" ? error.message : "Consultation Mode: Offline - Analysis failed.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAnalyzeFeedback = async () => {
    if (!feedbackInput.trim()) return;
    setIsAnalyzingFeedback(true);
    setAnalyzedFeedback(null);

    try {
      const ai = getAI();
      if (!ai) throw new Error("Consultation Mode: Offline");

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: feedbackInput,
        config: {
          systemInstruction: "You are a clinical experience analyst. Analyze the provided patient feedback or reviews. Extract key clinical or administrative themes, define specific and measurable action items for the staff, and determine the overall sentiment. Format your response strictly as JSON.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              themes: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Key recurring themes found in the feedback"
              },
              actions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Specific action items or tasks for the clinic staff"
              },
              sentiment: {
                type: Type.STRING,
                enum: ["Positive", "Neutral", "Negative"],
                description: "Overall sentiment of the feedback"
              }
            },
            required: ["themes", "actions", "sentiment"]
          }
        }
      });

      if (response.text) {
        setAnalyzedFeedback(JSON.parse(response.text));
      }
    } catch (error: any) {
      console.error("Feedback Analysis Error:", error);
      // Fail silently or show minor indicator in UI if needed
    } finally {
      setIsAnalyzingFeedback(false);
    }
  };

  const commonTasks = [
    { label: "Summarize Patient Feedback", prompt: "Summarize the following patient feedback into key themes and action items: [PASTE FEEDBACK HERE]" },
    { label: "Draft Staff Memo", prompt: "Draft a professional internal memo to the clinic staff regarding new office hours starting next month." },
    { label: "Clinical Note Template", prompt: "Create a detailed clinical note template for a comprehensive dental exam including soft tissue check and periodontal charting." },
    { label: "Patient FAQ Response", prompt: "Draft a clear, friendly response to a patient inquiring about the difference between composite and amalgam fillings." }
  ];

  return (
    <div className="flex h-[calc(100vh-120px)] overflow-hidden">
      {/* Module Sidebar */}
      <div className="w-64 border-r border-border bg-card/30 flex flex-col pt-4">
        <div className="px-6 mb-8 mt-2">
          <h2 className="card-title">Practice Growth</h2>
          <p className="text-[10px] text-secondary mt-1 uppercase tracking-tighter">Performance Console</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          {subNav.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSubTab(item.id)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-sm group",
                activeSubTab === item.id 
                  ? "bg-accent/10 text-accent font-bold border border-accent/20" 
                  : "text-secondary hover:bg-white/5 hover:text-primary"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className={cn("w-4 h-4", activeSubTab === item.id ? "text-accent" : "text-secondary/50")} />
                {item.label}
              </div>
              <ChevronRight className={cn("w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity", activeSubTab === item.id && "opacity-100")} />
            </button>
          ))}
        </nav>

        <div className="p-6">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Live Optimization</p>
            </div>
            <p className="text-xs text-emerald-50/70 leading-relaxed">
              AI is currently nurturing <span className="text-emerald-400 font-bold">12 leads</span> at an average 98% efficiency.
            </p>
          </div>
        </div>
      </div>

      {/* Module Content */}
      <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
        <AnimatePresence mode="wait">
          {activeSubTab === 'settings' ? (
            <motion.div
              key="settings-tab"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-8 max-w-4xl mx-auto"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">AI Management Suite</h2>
                  <p className="text-secondary mt-1">Intelligent assistant for day-to-day practice operations.</p>
                </div>
                <div className="p-3 bg-accent/10 border border-accent/20 rounded-2xl">
                  <Bot className="w-6 h-6 text-accent" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                  {/* Feedback Intelligence Hub */}
                  <div className="glass-card overflow-hidden">
                    <div className="p-6 border-b border-border bg-card/50 flex justify-between items-center">
                      <h3 className="text-sm font-bold flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-accent" />
                        Feedback Intelligence Hub
                      </h3>
                      <div className="flex gap-2">
                        <span className="text-[9px] font-bold text-secondary uppercase tracking-widest px-2 py-0.5 bg-card border border-border rounded">Voice of Patient</span>
                      </div>
                    </div>
                    
                    <div className="p-6 space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-bold text-secondary uppercase tracking-widest">Paste Reviews or Feedback</label>
                          {feedbackInput && (
                            <button 
                              onClick={() => {
                                setFeedbackInput('');
                                setAnalyzedFeedback(null);
                              }}
                              className="text-[10px] font-bold text-rose-500 hover:text-rose-600"
                            >
                              Clear Input
                            </button>
                          )}
                        </div>
                        <textarea
                          value={feedbackInput}
                          onChange={(e) => setFeedbackInput(e.target.value)}
                          placeholder="Example: 'I waited 45 minutes for my cleaning and the front desk was a bit short with me, though the hygienist was wonderful...'"
                          className="w-full bg-background border border-border rounded-xl p-4 text-xs min-h-[120px] focus:ring-1 focus:ring-accent outline-none transition-all resize-none font-medium"
                        />
                        <button
                          onClick={handleAnalyzeFeedback}
                          disabled={isAnalyzingFeedback || !feedbackInput.trim()}
                          className={cn(
                            "w-full py-3 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all",
                            isAnalyzingFeedback ? "bg-accent/50 text-white cursor-wait" : "bg-accent text-white hover:bg-accent/90 shadow-md shadow-accent/10"
                          )}
                        >
                          {isAnalyzingFeedback ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Analyzing Sentiment & Themes...
                            </>
                          ) : (
                            <>
                              <Zap className="w-4 h-4" />
                              Extract Intelligence
                            </>
                          )}
                        </button>
                      </div>

                      <AnimatePresence>
                        {analyzedFeedback && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="pt-6 border-t border-border space-y-6"
                          >
                            <div className="flex items-center justify-between p-4 bg-background rounded-2xl border border-border">
                              <div className="flex items-center gap-3">
                                <div className={cn(
                                  "p-2 rounded-xl",
                                  analyzedFeedback.sentiment === 'Positive' ? "bg-emerald-500/10" :
                                  analyzedFeedback.sentiment === 'Negative' ? "bg-rose-500/10" : "bg-amber-500/10"
                                )}>
                                  {analyzedFeedback.sentiment === 'Positive' ? <ThumbsUp className="w-4 h-4 text-emerald-500" /> :
                                   analyzedFeedback.sentiment === 'Negative' ? <ThumbsDown className="w-4 h-4 text-rose-500" /> :
                                   <Minus className="w-4 h-4 text-amber-500" />}
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">Overall Sentiment</p>
                                  <p className={cn(
                                    "text-sm font-bold",
                                    analyzedFeedback.sentiment === 'Positive' ? "text-emerald-500" :
                                    analyzedFeedback.sentiment === 'Negative' ? "text-rose-500" : "text-amber-500"
                                  )}>
                                    {analyzedFeedback.sentiment}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">Confidence Score</p>
                                <p className="text-sm font-mono font-bold text-primary">98.4%</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                              <div className="space-y-3">
                                <h4 className="text-[10px] font-bold text-secondary uppercase tracking-widest flex items-center gap-2">
                                  <Sparkles className="w-3 h-3 text-accent" />
                                  Key Themes
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {analyzedFeedback.themes.map((theme, idx) => (
                                    <span key={idx} className="px-2.5 py-1 bg-card border border-border rounded-lg text-[10px] font-bold text-primary">
                                      {theme}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div className="space-y-3">
                                <h4 className="text-[10px] font-bold text-secondary uppercase tracking-widest flex items-center gap-2">
                                  <AlertCircle className="w-3 h-3 text-amber-500" />
                                  Proposed Actions
                                </h4>
                                <ul className="space-y-2">
                                  {analyzedFeedback.actions.map((action, idx) => (
                                    <li key={idx} className="flex gap-2 text-[10px] leading-relaxed group">
                                      <div className="mt-1 w-1 h-1 rounded-full bg-accent shrink-0 group-hover:scale-150 transition-transform" />
                                      <span className="text-secondary group-hover:text-primary transition-colors">{action}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            <button 
                              className="w-full py-3 bg-secondary/10 hover:bg-secondary/20 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                              onClick={() => {
                                console.log("Intelligence exported to clinic history");
                              }}
                            >
                              <ClipboardCheck className="w-4 h-4" />
                              Export Intelligence to EMR
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className="glass-card overflow-hidden">
                    <div className="p-6 border-b border-border bg-card/50 flex justify-between items-center">
                      <h3 className="text-sm font-bold flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-accent" />
                        AI Assistant Console
                      </h3>
                      <div className="flex gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Growth Engine Active</span>
                      </div>
                    </div>
                    
                    <div className="p-6 space-y-6">
                      <div className="space-y-4">
                        <label className="text-xs font-bold text-secondary uppercase tracking-widest">Your Request</label>
                        <div className="relative">
                          <textarea
                            value={managementPrompt}
                            onChange={(e) => setManagementPrompt(e.target.value)}
                            placeholder="Describe what you'd like the AI to do (e.g., 'Summarize these 5 reviews...', 'Draft a staff memo about...')"
                            className="w-full bg-background border border-border rounded-2xl p-4 text-sm min-h-[160px] focus:ring-2 focus:ring-accent/50 outline-none transition-all resize-none pr-12"
                          />
                          <button 
                            onClick={() => handleManagementAi()}
                            disabled={isAiLoading || !managementPrompt.trim()}
                            className="absolute bottom-4 right-4 p-3 bg-accent text-white rounded-xl hover:scale-110 active:scale-95 transition-all shadow-lg shadow-accent/20 disabled:opacity-50 disabled:scale-100 disabled:shadow-none"
                          >
                            {isAiLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      {aiResponse && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-4"
                        >
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-secondary uppercase tracking-widest">AI Output</label>
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(aiResponse);
                              }}
                              className="text-[10px] font-bold text-accent px-2 py-1 bg-accent/10 rounded border border-accent/20 hover:bg-accent/20"
                            >
                              Copy to Clipboard
                            </button>
                          </div>
                          <div className="p-5 bg-card/50 border border-border rounded-2xl text-sm leading-relaxed whitespace-pre-wrap max-h-[300px] overflow-y-auto custom-scrollbar">
                            {aiResponse}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="glass-card p-6 space-y-4">
                    <h3 className="text-xs font-bold text-secondary uppercase tracking-widest flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Common Tasks
                    </h3>
                    <div className="flex flex-col gap-3">
                      {commonTasks.map((task, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setManagementPrompt(task.prompt);
                            handleManagementAi(task.prompt);
                          }}
                          className="text-left p-3.5 bg-background border border-border rounded-xl text-xs font-medium hover:border-accent/40 hover:bg-accent/5 transition-all group"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-primary group-hover:text-accent font-bold transition-colors">{task.label}</span>
                            <ChevronRight className="w-3 h-3 text-secondary group-hover:text-accent opacity-0 group-hover:opacity-100 transition-all" />
                          </div>
                          <p className="text-[10px] text-secondary line-clamp-1">{task.prompt}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-accent to-blue-600 p-6 rounded-[32px] text-white shadow-xl shadow-accent/20">
                    <Zap className="w-8 h-8 mb-4 opacity-50" />
                    <h4 className="font-bold text-lg mb-2 leading-tight">Prompt Strategy</h4>
                    <p className="text-xs text-white/80 leading-relaxed">
                      Be specific about the tone and format you need. The AI can generate tables, bullet points, or formal letters depending on your request.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : activeSubTab === 'campaigns' ? (
            <motion.div
              key="campaigns-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">AI Outreach Center</h2>
                  <p className="text-secondary mt-1">Automated re-engagement and patient conversion campaigns.</p>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2 bg-card border border-border px-4 py-2 rounded-xl">
                    <Users className="w-4 h-4 text-accent" />
                    <span className="text-xs font-bold">2,104 Total Patients</span>
                  </div>
                  <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-400">842 Inactive Leads</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Active Campaign Card */}
                <div className="glass-card overflow-hidden border-accent/20">
                  <div className="p-6 border-b border-border bg-accent/5 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-accent/20 rounded-lg">
                        <Users className="w-4 h-4 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-bold">Inactive Patient Recovery</h3>
                        <p className="text-[10px] uppercase font-bold text-secondary tracking-widest mt-0.5">Campaign ID: RE-ENGAGE-01</p>
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full text-[9px] font-bold tracking-widest uppercase">
                      Recommended
                    </div>
                  </div>
                  <div className="p-8 space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-secondary">Target Audience</span>
                        <span className="font-bold">Patients inactive for 6+ months</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-secondary">Estimated Reach</span>
                        <span className="font-bold text-accent">342 Patients</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-secondary">Offer Applied</span>
                        <span className="font-bold text-emerald-500 font-mono italic">FREE_CHECKUP_PROMO</span>
                      </div>
                    </div>

                    <div className="bg-background/50 border border-border rounded-2xl p-6 relative">
                      <div className="absolute top-4 right-4 text-[9px] font-bold text-secondary/40 uppercase tracking-widest">Preview</div>
                      <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shrink-0">
                          <MessageSquare className="w-4 h-4 text-white" />
                        </div>
                        <div className="space-y-4">
                          <p className="text-sm leading-relaxed text-primary">
                            Hi 👋<br /><br />
                            We noticed you haven’t visited in a while.<br /><br />
                            We’re offering a free dental checkup this week.<br /><br />
                            Would you like to book your appointment?
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-1 p-3 bg-card border border-border rounded-xl flex items-center justify-center gap-3 opacity-50 cursor-not-allowed">
                        <Mail className="w-4 h-4" />
                        <span className="text-xs font-bold">Email Channel</span>
                      </div>
                      <div className="flex-1 p-3 bg-card border border-accent/40 rounded-xl flex items-center justify-center gap-3 text-accent border-dashed">
                        <Smartphone className="w-4 h-4" />
                        <span className="text-xs font-bold">SMS Channel</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleSendCampaign('RE-ENGAGE-01')}
                      disabled={campaignStatus !== 'idle'}
                      className={cn(
                        "w-full py-4 rounded-2xl font-bold uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-3 relative overflow-hidden",
                        campaignStatus === 'sent' ? "short-safe-success bg-emerald-500 text-white" : "bg-accent text-white shadow-lg shadow-accent/20 hover:scale-[1.02] active:scale-95"
                      )}
                    >
                      {campaignStatus === 'sending' ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Dispatching Messages...</span>
                        </>
                      ) : campaignStatus === 'sent' ? (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          <span>Campaign Launched Successfully</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          <span>Launch Target Campaign</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Growth Insights */}
                <div className="space-y-6">
                  <div className="glass-card p-6 border-l-4 border-emerald-500 bg-emerald-500/5">
                    <h4 className="font-bold flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                      Prediction Engine
                    </h4>
                    <p className="text-sm text-secondary leading-relaxed">
                      AI models predict a <strong className="text-primary font-bold">14.2% conversion rate</strong> for this re-engagement campaign based on historical response patterns for "Free Checkup" offers in this zip code.
                    </p>
                  </div>

                  <div className="glass-card p-8 space-y-6 bg-slate-800/20">
                    <h4 className="card-title text-sm">Campaign Pipeline Summary</h4>
                    <div className="space-y-5">
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-secondary">
                          <span>Patient Segmentation</span>
                          <span>92% Accurate</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: '92%' }} className="h-full bg-accent" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-secondary">
                          <span>Delivery Success Rate</span>
                          <span>99.8%</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: '99.8%' }} className="h-full bg-emerald-500" />
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-border grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-card rounded-2xl border border-border">
                        <p className="text-xl font-bold text-primary">3,200+</p>
                        <p className="text-[9px] uppercase font-bold text-secondary tracking-widest mt-1">Total API Dispatches</p>
                      </div>
                      <div className="text-center p-4 bg-card rounded-2xl border border-border">
                        <p className="text-xl font-bold text-accent">14.3%</p>
                        <p className="text-[9px] uppercase font-bold text-secondary tracking-widest mt-1">Avg Click Rate</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="main-growth-tab"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-10"
            >
              {/* Header Stats */}
              <div className="grid grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass-card p-6 border-b-2 border-b-transparent hover:border-b-accent transition-all group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <stat.icon className="w-5 h-5 text-secondary group-hover:text-accent transition-colors" />
                      <span className="text-[10px] font-bold py-1 px-2 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {stat.change}
                      </span>
                    </div>
                    <p className="text-[11px] uppercase font-bold text-secondary tracking-widest">{stat.label}</p>
                    <h3 className="text-2xl font-bold mt-1 text-primary tracking-tight">{stat.value}</h3>
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Main Chart/Insight Area */}
                <div className="lg:col-span-2 space-y-8">
                  <div className="glass-card p-8 min-h-[400px]">
                    <div className="flex justify-between items-start mb-10">
                      <div>
                        <h3 className="text-lg font-bold flex items-center gap-3">
                          <BarChart3 className="text-accent w-5 h-5" />
                          Revenue Projections
                        </h3>
                        <p className="text-xs text-secondary mt-1 italic">Based on AI-nurtured conversion patterns</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-3 py-1.5 text-[10px] bg-slate-800 border border-border rounded-lg text-secondary">7 Days</button>
                        <button className="px-3 py-1.5 text-[10px] bg-accent text-white rounded-lg">30 Days</button>
                      </div>
                    </div>

                    {/* Mock Chart Area */}
                    <div className="h-64 flex items-end gap-3 px-2">
                      {[45, 62, 58, 75, 90, 82, 95, 88, 100, 110, 105, 125].map((val, i) => (
                        <motion.div
                          key={i}
                          initial={{ height: 0 }}
                          animate={{ height: `${val}%` }}
                          transition={{ delay: i * 0.05, duration: 0.8 }}
                          className="flex-1 bg-accent/20 border-t-2 border-accent group relative cursor-pointer"
                        >
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-accent text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            ${(val * 450).toLocaleString()}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    <div className="flex justify-between mt-4 text-[10px] font-mono text-secondary px-2">
                      <span>01 APR</span>
                      <span>15 APR</span>
                      <span>30 APR</span>
                    </div>
                  </div>

                  {/* Revenue Saved Widget */}
                  <div className="glass-card p-1 bg-gradient-to-r from-accent/20 to-emerald-500/20">
                    <div className="bg-card p-8 rounded-[15px] flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                          <DollarSign className="w-8 h-8 text-emerald-400" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-emerald-400">$12,450.00</h3>
                          <p className="text-xs text-secondary mt-1 uppercase font-bold tracking-[0.15em]">AI Pipeline Value Saved</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-primary font-bold">42 Patients Re-engaged</p>
                        <p className="text-[10px] text-secondary mt-1 italic italic-serif">Calculated via automated lead follow-up logic</p>
                      </div>
                      <button className="bg-white/5 hover:bg-white/10 px-6 py-3 rounded-xl border border-white/5 text-xs font-bold transition-all">
                        Generate Report
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sidebar Area: Live AI Feed */}
                <div className="space-y-8">
                  <div className="glass-card p-8 flex flex-col h-full ring-1 ring-white/5 shadow-2xl">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="card-title">Live AI Feed</h3>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Real-time</span>
                      </div>
                    </div>

                    <div className="space-y-6 flex-1">
                      <AnimatePresence initial={false}>
                        {MOCK_FEED.map((item, i) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="group"
                          >
                            <div className="flex gap-4">
                              <div className={cn(
                                "w-2 mt-1.5 rounded-full shrink-0",
                                item.type === 'booking' ? "bg-emerald-500" :
                                item.type === 'triage' ? "bg-rose-500" : "bg-accent"
                              )} />
                              <div>
                                <p className="text-sm font-bold text-primary flex items-center gap-2">
                                  {item.patient}
                                  {item.value && (
                                    <span className="text-[9px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/10 px-1.5 py-0.5 rounded italic">
                                      +${item.value}
                                    </span>
                                  )}
                                </p>
                                <p className="text-xs text-secondary mt-1 leading-relaxed">
                                  {item.action}
                                </p>
                                <div className="flex items-center gap-1.5 mt-2 text-[10px] text-secondary/60">
                                  <Clock className="w-3 h-3" />
                                  {item.time}
                                </div>
                              </div>
                            </div>
                            {i !== MOCK_FEED.length - 1 && <div className="ml-5 h-8 border-l border-border mt-1" />}
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>

                    <button className="mt-8 w-full py-4 bg-slate-800 border border-border text-secondary hover:text-primary hover:bg-slate-700 transition-all text-xs font-bold rounded-xl flex items-center justify-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      View All Interactions
                    </button>
                  </div>

                  {/* Conversion Insight Card */}
                  <div className="glass-card p-6 bg-accent">
                    <div className="flex justify-between items-start mb-4">
                      <Zap className="text-white w-6 h-6" />
                      <ArrowUpRight className="text-white/50 w-5 h-5" />
                    </div>
                    <h4 className="text-lg font-bold text-white leading-tight">Conversion Efficiency has peaked.</h4>
                    <p className="text-xs text-white/70 mt-3 leading-relaxed">
                      The AI Receptionist is currently handling 92% of new patient queries without human intervention.
                    </p>
                    <div className="mt-6 pt-6 border-t border-white/10">
                      <div className="flex justify-between items-end">
                        <p className="text-sm font-bold text-white">Top Channel</p>
                        <p className="text-xs text-white/80">Google Maps (82%)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
