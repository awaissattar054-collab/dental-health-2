import { useState } from 'react';
import { ShieldCheck, Upload, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

export default function InsuranceVerification() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);

  const simulateOCR = async () => {
    if (!file) return;
    setIsVerifying(true);
    setResult(null);

    try {
      const response = await fetch('/api/verify-insurance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: 'base64_placeholder' })
      });
      const data = await response.json();
      setResult(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Insurance OCR Verification</h1>
        <p className="text-secondary mt-1">AI-powered extraction of patient insurance benefits and eligibility.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div 
            className={cn(
              "glass-card p-12 border-2 border-dashed border-border flex flex-col items-center justify-center text-center transition-all cursor-pointer hover:border-accent group hover:bg-accent/5",
              file && "border-accent bg-accent/5 shadow-inner"
            )}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const droppedFile = e.dataTransfer.files[0];
              if (droppedFile) setFile(droppedFile);
            }}
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.onchange = (e: any) => setFile(e.target.files[0]);
              input.click();
            }}
          >
            <div className="p-4 bg-slate-800 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
              <Upload className="w-8 h-8 text-accent" />
            </div>
            {file ? (
              <div>
                <p className="font-bold text-accent tracking-tight">{file.name}</p>
                <p className="text-xs text-secondary font-mono mt-1">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            ) : (
              <div>
                <p className="font-bold text-primary">Drop Insurance Card</p>
                <p className="text-xs text-secondary mt-1">Front and back (PNG, JPG supported)</p>
              </div>
            )}
          </div>

          <button 
            disabled={!file || isVerifying}
            onClick={simulateOCR}
            className="w-full py-4 bg-accent text-white rounded-xl font-bold shadow-lg shadow-accent/20 hover:bg-blue-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]"
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing Claims...
              </>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5" />
                Run Verification
              </>
            )}
          </button>
        </div>

        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {!result && !isVerifying ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                tabIndex={0}
                className="h-full border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center p-12 text-center text-secondary bg-card/10"
              >
                <ShieldCheck className="w-12 h-12 mb-4 text-secondary/30" />
                <p className="font-medium text-primary">Intelligence Engine Ready</p>
                <p className="text-[10px] uppercase tracking-widest mt-2">Awaiting payload...</p>
              </motion.div>
            ) : isVerifying ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full border border-border rounded-2xl p-8 bg-card shadow-inner"
              >
                <div className="space-y-8 animate-pulse">
                  <div className="h-6 bg-slate-800 rounded-md w-1/2" />
                  <div className="space-y-5">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="h-4 bg-slate-800 rounded-md opacity-50" />
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-8 h-full shadow-2xl shadow-accent/5"
              >
                <div className="flex items-center gap-2 text-safe mb-8 font-bold text-sm tracking-tight">
                  <CheckCircle2 className="w-5 h-5" />
                  Benefits Extraction Successful
                </div>

                <div className="space-y-10">
                  <section>
                    <p className="card-title mb-6">Patient & Policy Intelligence</p>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                      <div>
                        <p className="text-[10px] text-secondary uppercase tracking-wider mb-1">Carrier</p>
                        <p className="font-bold text-primary">{result.provider}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-secondary uppercase tracking-wider mb-1 text-right">Status</p>
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-safe bg-safe/10 border border-safe/20 px-2.5 py-1 rounded-full inline-block">
                            {result.status}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] text-secondary uppercase tracking-wider mb-1">Member ID</p>
                        <p className="font-bold font-mono text-primary">{result.memberId}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-secondary uppercase tracking-wider mb-1">Group Number</p>
                        <p className="font-bold font-mono text-primary">{result.groupNumber}</p>
                      </div>
                    </div>
                  </section>

                  <section>
                    <p className="card-title mb-6">Coverage Breakdown</p>
                    <div className="space-y-1">
                      {Object.entries(result.coverage).map(([key, val]) => (
                        <div key={key} className="flex justify-between items-center py-3 border-b border-border/50 last:border-0 hover:bg-accent/[0.02] -mx-2 px-2 transition-colors rounded-lg">
                          <p className="text-sm font-medium capitalize text-secondary">{key}</p>
                          <p className="text-sm font-bold text-accent">{val as string}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
