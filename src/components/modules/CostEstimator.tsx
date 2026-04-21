import { useState, useMemo } from 'react';
import { CDT_CODES, CDTCode } from '../../types';
import { Calculator, Plus, Trash2, Receipt, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function ProcedureTooltip({ content }: { content: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 5, scale: 0.95 }}
      className="absolute z-50 bottom-full left-0 mb-3 w-72 p-4 bg-slate-900/95 backdrop-blur-md text-white text-[11px] rounded-xl shadow-2xl pointer-events-none border border-white/10"
    >
      <div className="relative">
        <p className="leading-relaxed font-medium">{content}</p>
        <div className="absolute top-full left-4 -mt-px border-8 border-transparent border-t-slate-900" />
      </div>
    </motion.div>
  );
}

export default function CostEstimator() {
  const [selectedCodes, setSelectedCodes] = useState<(CDTCode & { quantity: number })[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredCode, setHoveredCode] = useState<string | null>(null);

  const filteredCodes = useMemo(() => {
    return CDT_CODES.filter(code => 
      code.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
      code.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const addCode = (code: CDTCode) => {
    const existing = selectedCodes.find(c => c.code === code.code);
    if (existing) {
      setSelectedCodes(selectedCodes.map(c => 
        c.code === code.code ? { ...c, quantity: c.quantity + 1 } : c
      ));
    } else {
      setSelectedCodes([...selectedCodes, { ...code, quantity: 1 }]);
    }
  };

  const removeCode = (code: string) => {
    setSelectedCodes(selectedCodes.filter(c => c.code !== code));
  };

  const total = selectedCodes.reduce((sum, c) => sum + (c.estimatedCost * c.quantity), 0);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Treatment Cost Estimator</h1>
        <p className="text-secondary mt-1">Generate transparent cost estimates using standard CDT codes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Selection Area */}
        <div className="space-y-6">
          <div className="glass-card p-6 space-y-4">
            <h2 className="text-lg font-semibold">Search CDT Codes</h2>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Code or description..."
                className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg focus:ring-2 focus:ring-accent transition"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Calculator className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            </div>

            <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2">
              {filteredCodes.map((code) => (
                <div 
                  key={code.code}
                  className="relative flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition group"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm text-accent">{code.code}</p>
                      <div className="relative">
                        <Info 
                          className="w-3 h-3 text-slate-300 group-hover:text-accent transition-colors cursor-help" 
                          onMouseEnter={() => setHoveredCode(code.code)}
                          onMouseLeave={() => setHoveredCode(null)}
                        />
                        <AnimatePresence>
                          {hoveredCode === code.code && (
                            <ProcedureTooltip content={code.details} />
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                    <p className="text-sm font-medium">{code.description}</p>
                    <p className="text-xs text-secondary mt-0.5">${code.estimatedCost}</p>
                  </div>
                  <button 
                    onClick={() => addCode(code)}
                    className="p-2 opacity-0 group-hover:opacity-100 bg-accent text-white rounded-lg transition shrink-0 ml-2"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Area */}
        <div className="space-y-6">
          <motion.div 
            layout
            className="glass-card p-6 h-full flex flex-col"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Receipt className="w-5 h-5 text-accent" />
                Estimate Summary
              </h2>
              <span className="text-xs uppercase font-bold tracking-widest text-slate-400">
                DentalOS Pro
              </span>
            </div>

            <div className="flex-1 space-y-4">
              {selectedCodes.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-secondary py-12">
                  <Calculator className="w-12 h-12 mb-4 opacity-20" />
                  <p>Add procedures to generate an estimate.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedCodes.map((c) => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={c.code} 
                      className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
                    >
                      <div className="flex-1">
                        <p className="font-bold text-sm">{c.description}</p>
                        <p className="text-xs text-secondary">{c.quantity} x ${c.estimatedCost}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-bold text-sm">${c.estimatedCost * c.quantity}</p>
                        <button 
                          onClick={() => removeCode(c.code)}
                          className="text-slate-300 hover:text-rose-500 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 space-y-4">
              <div className="flex justify-between items-end">
                <p className="text-secondary font-medium">Estimated Total</p>
                <div className="text-right">
                  <p className="text-3xl font-bold">${total}</p>
                  <p className="text-xs text-secondary italic">Excl. insurance coverage</p>
                </div>
              </div>
              <button 
                disabled={selectedCodes.length === 0}
                className="w-full py-3 bg-accent text-white rounded-xl font-bold shadow-lg shadow-sky-200 hover:bg-sky-700 disabled:opacity-50 disabled:shadow-none transition-all active:scale-[0.98]"
              >
                Print Professional Estimate
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
