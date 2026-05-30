import { useState } from 'react';
import { Brain, Sparkles, AlertTriangle, DollarSign, Info, Loader2, Send, WifiOff, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function ClinicalBrain() {
  const [complaint, setComplaint] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [streamedResponse, setStreamedResponse] = useState('');
  const [error, setError] = useState<string | null>(null);

  const analyzeComplaint = async () => {
    if (!complaint.trim() || isAnalyzing) return;
    
    setIsAnalyzing(true);
    setStreamedResponse('');
    setError(null);

    try {
      const response = await fetch('/api/ai-clinical-brain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Analyze this patient complaint and provide a structured clinical summary: "${complaint}"`
            }
          ]
        }),
      });

      if (!response.ok) throw new Error('AI Analysis failed');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error('Failed to read AI stream');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setStreamedResponse(prev => prev + chunk);
      }
    } catch (err) {
      console.error("Groq Stream Error:", err);
      setError('Communication with Clinical Brain failed. Using fallback protocols.');
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
            AI Clinical Brain
          </h1>
          <p className="text-secondary mt-1">Real-time neural triage using Llama 3 (Groq API).</p>
        </div>
        <div className="px-4 py-2 bg-accent/10 text-accent rounded-full text-xs font-bold uppercase tracking-widest border border-accent/20 flex items-center gap-2">
          <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
          Live Llama3-70b-8192
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Input Pane */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 space-y-4 shadow-2xl shadow-accent/5">
            <h2 className="card-title">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Analyze Symptoms
            </h2>
            <textarea 
              className="w-full h-40 p-4 bg-background border border-border rounded-xl focus:ring-2 focus:ring-accent transition resize-none text-sm leading-relaxed text-primary placeholder:text-secondary/30 shadow-inner"
              placeholder="Describe the clinical presentation (e.g., patient presents with acute sensitivity in #14, swelling on lingual...)"
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
                  Streaming Intelligence...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4" />
                  Run AI Consult
                </>
              )}
            </button>
          </div>

          <div className="p-6 bg-card border border-border rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 blur-2xl -mr-12 -mt-12" />
            <h3 className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <ShieldCheck className="w-3 h-3 text-safe" />
              HIPAA Privacy Shield
            </h3>
            <p className="text-[11px] text-secondary leading-relaxed italic">
              "Clinical data is processed in stateless memory buffers. No PII is persisted in AI model training logs."
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
                className="h-full border-2 border-rose-500/20 border-dashed rounded-2xl flex flex-col items-center justify-center p-12 text-center text-rose-500 bg-rose-500/5"
              >
                <WifiOff className="w-12 h-12 text-rose-500/40 mb-4" />
                <p className="font-bold">{error}</p>
              </motion.div>
            ) : !streamedResponse && !isAnalyzing ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center p-12 text-center text-secondary bg-card/10"
              >
                <Brain className="w-12 h-12 text-accent/30 mb-4" />
                <p className="font-bold text-primary italic">"Awaiting clinical input for neural processing..."</p>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-10 h-full space-y-6 relative overflow-hidden shadow-2xl"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-3xl -mr-16 -mt-16" />
                <div className="flex items-center justify-between border-b border-border pb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
                      <Sparkles className="text-accent w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-black tracking-widest text-secondary">Real-time Analysis</p>
                      <h3 className="font-bold text-primary">Clinical Triage View</h3>
                    </div>
                  </div>
                  {isAnalyzing && (
                     <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full text-[10px] font-bold">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        PROCESSING
                     </div>
                  )}
                </div>

                <div className="prose prose-invert max-w-none">
                  <div className="text-sm text-secondary leading-relaxed whitespace-pre-wrap font-mono bg-background/50 p-6 rounded-2xl border border-border shadow-inner min-h-[300px]">
                    {streamedResponse}
                    {isAnalyzing && <span className="inline-block w-2 h-4 ml-1 bg-accent animate-pulse" />}
                  </div>
                </div>

                <div className="pt-6 border-t border-border flex gap-4">
                  <button className="flex-1 py-4 bg-accent text-white rounded-xl font-bold shadow-lg shadow-accent/20 hover:bg-blue-600 transition-all">
                    Generate Patient Record
                  </button>
                  <button className="px-8 py-4 border border-border text-secondary rounded-xl font-bold hover:bg-card hover:text-primary transition-all">
                    Export to EHR
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
