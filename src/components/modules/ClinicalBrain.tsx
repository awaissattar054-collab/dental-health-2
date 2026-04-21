import { useState } from 'react';
import { Brain, Sparkles, AlertTriangle, DollarSign, Info, Loader2, Send, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type } from "@google/genai";
import { cn } from '../../lib/utils';

let clinicalAiInstance: GoogleGenAI | null = null;
function getClinicalAI() {
  if (!clinicalAiInstance) {
    const rawKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    const apiKey = (rawKey && rawKey !== 'undefined' && rawKey !== 'null') ? rawKey : null;

    if (!apiKey) {
      console.warn("Clinical Brain: Missing API Key. Consultation Mode: Offline.");
      return null;
    }

    try {
      clinicalAiInstance = new GoogleGenAI(apiKey);
    } catch (e) {
      console.error("Clinical Brain Initialization Error:", e);
      return null;
    }
  }
  return clinicalAiInstance;
}

interface ClinicalAnalysis {
  possibleCondition: string;
  suggestedTreatment: string;
  priorityLevel: number;
  urgency: 'Routine' | 'Urgent' | 'Emergency';
  explanation: string;
  disclaimer: string;
  estimatedCostRange: {
    min: number;
    max: number;
    currency: string;
  };
}

export default function ClinicalBrain() {
  const [complaint, setComplaint] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ClinicalAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeComplaint = async () => {
    if (!complaint.trim() || isAnalyzing) return;
    
    setIsAnalyzing(true);
    setAnalysis(null);
    setError(null);

    const ai = getClinicalAI();
    if (!ai) {
      setError('Consultation Mode: Offline');
      setIsAnalyzing(false);
      return;
    }

    try {
      const ai = getClinicalAI();
      if (!ai) throw new Error('Consultation Mode: Offline');

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

      const data = JSON.parse(response.text || "{}");
      setAnalysis(data);
    } catch (err) {
      console.error("Clinical Brain Error:", err);
      setError('Consultation Mode: Offline');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Brain className="text-accent w-8 h-8" />
            Clinical Brain
          </h1>
          <p className="text-secondary mt-1">AI-driven patient triage & diagnostic suggestion engine.</p>
        </div>
        <div className="px-4 py-2 bg-accent/10 text-accent rounded-full text-xs font-bold uppercase tracking-widest border border-accent/20">
          Supervised AI Mode
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Input Pane */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 space-y-4">
            <h2 className="card-title">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Patient Complaint
            </h2>
            <textarea 
              className="w-full h-40 p-4 bg-background border border-border rounded-xl focus:ring-2 focus:ring-accent transition resize-none text-sm leading-relaxed text-primary placeholder:text-secondary/30 shadow-inner"
              placeholder="Example: My back molar hurts when I drink cold water..."
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
            />
            <button 
              onClick={analyzeComplaint}
              disabled={isAnalyzing || !complaint.trim()}
              className="w-full py-4 bg-accent text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-600 disabled:opacity-50 transition-all shadow-lg shadow-accent/20 active:scale-[0.98]"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Neural Analysis...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Process Lead
                </>
              )}
            </button>
          </div>

          <div className="p-6 bg-card border border-border rounded-2xl">
            <h3 className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] mb-4">Clinical Guidance</h3>
            <p className="text-[11px] text-secondary leading-relaxed italic">
              "AI suggestions are statistical models based on US national averages. Diagnostic finality requires clinical examination and radiographic evidence."
            </p>
          </div>
        </div>

        {/* Analysis Result Pane */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {error ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full border-2 border-rose-500/20 border-dashed rounded-2xl flex flex-col items-center justify-center p-12 text-center text-rose-500 bg-rose-500/5 shadow-inner"
              >
                <div className="p-5 bg-card border border-rose-500/20 rounded-2xl mb-4 shadow-sm">
                  <WifiOff className="w-12 h-12 text-rose-500/40" />
                </div>
                <p className="font-bold text-rose-500">{error}</p>
                <p className="text-[10px] uppercase tracking-widest mt-2 text-rose-500/60">System key mismatch or network issues</p>
                <button 
                  onClick={analyzeComplaint}
                  className="mt-6 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl text-xs font-bold transition-all"
                >
                  Retry Analysis
                </button>
              </motion.div>
            ) : !analysis && !isAnalyzing ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center p-12 text-center text-secondary bg-card/10"
              >
                <div className="p-5 bg-card border border-border rounded-2xl mb-4 shadow-sm">
                  <Brain className="w-12 h-12 text-accent/30" />
                </div>
                <p className="font-bold text-primary">Intelligence Standby</p>
                <p className="text-[10px] uppercase tracking-widest mt-2">Neural processor ready</p>
              </motion.div>
            ) : isAnalyzing ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card p-10 h-full space-y-8"
              >
                <div className="flex items-center gap-4 animate-pulse">
                  <div className="w-12 h-12 bg-slate-800 border border-border rounded-xl" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-slate-800 rounded w-1/4" />
                    <div className="h-6 bg-slate-800 rounded w-3/4" />
                  </div>
                </div>
                <div className="space-y-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-4 bg-slate-800 rounded w-full animate-pulse opacity-50" />
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-10 h-full space-y-10 overflow-hidden relative shadow-2xl shadow-accent/5 hover:border-accent/40"
              >
                {/* Visual Accent */}
                <div className={cn(
                  "absolute top-0 right-0 w-64 h-64 blur-[120px] opacity-20 -mr-32 -mt-32 rounded-full transition-colors duration-500",
                  analysis.urgency === 'Emergency' ? "bg-rose-500" : 
                  analysis.urgency === 'Urgent' ? "bg-amber-500" : "bg-sky-500"
                )} />

                <div className="space-y-8 relative">
                  <div className="flex justify-between items-start">
                    <div className="space-y-4 flex-1">
                      <div className="space-y-1">
                        <p className="card-title uppercase">Possible Condition</p>
                        <h2 className="text-2xl font-bold text-primary tracking-tight leading-none">{analysis.possibleCondition}</h2>
                      </div>
                      <div className="space-y-1">
                        <p className="card-title uppercase">Suggested Treatment</p>
                        <h3 className="text-xl font-medium text-accent/90">{analysis.suggestedTreatment}</h3>
                      </div>
                    </div>
                    <div className={cn(
                      "px-5 py-2.5 rounded-xl text-center border shadow-sm transition-colors shrink-0",
                      analysis.urgency === 'Emergency' ? "bg-rose-500/10 border-rose-500/20 text-rose-500" : 
                      analysis.urgency === 'Urgent' ? "bg-amber-500/10 border-amber-500/20 text-amber-500" : 
                      "bg-sky-500/10 border-sky-500/20 text-sky-500"
                    )}>
                      <p className="text-[10px] uppercase font-bold tracking-widest opacity-60">Urgency</p>
                      <p className="text-sm font-bold">{analysis.urgency}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-6 bg-background rounded-2xl border border-border group hover:border-accent/30 transition-colors">
                      <div className="flex items-center gap-2 mb-3 text-secondary">
                        <AlertTriangle className="w-4 h-4 text-accent/50" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Priority Index</span>
                      </div>
                      <p className="text-3xl font-bold flex items-baseline gap-1">
                        {analysis.priorityLevel}
                        <span className="text-sm font-medium text-secondary">/ 5.0</span>
                      </p>
                    </div>
                    <div className="p-6 bg-background rounded-2xl border border-border group hover:border-accent/30 transition-colors">
                      <div className="flex items-center gap-2 mb-3 text-secondary">
                        <DollarSign className="w-4 h-4 text-accent/50" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Fee Benchmark</span>
                      </div>
                      <p className="text-3xl font-bold">${analysis.estimatedCostRange.min.toLocaleString()}</p>
                      <p className="text-[10px] text-secondary mt-1 uppercase tracking-tight">to ${analysis.estimatedCostRange.max.toLocaleString()} (US Avg)</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-secondary">
                      <Info className="w-4 h-4 text-accent/50" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Clinical Logic</span>
                    </div>
                    <div className="text-sm text-secondary leading-relaxed italic bg-background p-6 rounded-2xl border border-border shadow-inner">
                      "{analysis.explanation}"
                    </div>
                    <p className="text-[10px] text-amber-500/80 font-medium px-2">
                      {analysis.disclaimer}
                    </p>
                  </div>

                  <div className="pt-8 border-t border-border flex gap-4">
                    <button className="flex-1 py-4 bg-accent text-white rounded-xl font-bold shadow-lg shadow-accent/20 hover:bg-blue-600 transition-all active:scale-[0.98]">
                      Schedule Appointment
                    </button>
                    <button className="px-8 py-4 border border-border text-secondary rounded-xl font-bold hover:bg-card hover:text-primary transition-all">
                      Sync to EHR
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
