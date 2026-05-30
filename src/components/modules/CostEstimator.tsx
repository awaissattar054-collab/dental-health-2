import { useState, useMemo } from 'react';
import { CDT_CODES, PAKISTANI_TREATMENTS, CDTCode } from '../../types';
import { Calculator, Plus, Trash2, Receipt, Info, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useClinic } from '../../context/ClinicContext';

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
  const { marketMode, formatPrice } = useClinic();
  const [selectedCodes, setSelectedCodes] = useState<(CDTCode & { quantity: number })[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredCode, setHoveredCode] = useState<string | null>(null);

  const activeCodesList = useMemo(() => {
    return marketMode === 'Pakistan' ? PAKISTANI_TREATMENTS : CDT_CODES;
  }, [marketMode]);

  const filteredCodes = useMemo(() => {
    return activeCodesList.filter(code => 
      code.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
      code.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (code.category && code.category.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, activeCodesList]);

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

  const isPak = marketMode === 'Pakistan';

  // Format base prices for CDT or PKR codes
  const displayCost = (amount: number) => {
    if (isPak) {
      // In pak mode, estimatedCost is already in PKR (e.g. 1500, 25000), format directly
      const formatter = new Intl.NumberFormat('en-PK', {
        style: 'currency',
        currency: 'PKR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
      return formatter.format(amount).replace('PKR', '₨');
    }
    return formatPrice(amount);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 text-primary">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {isPak ? "Treatment Cost Planning Hub" : "Treatment Cost Estimator"}
        </h1>
        <p className="text-secondary mt-1">
          {isPak 
            ? "Generate high-fidelity, transparent cost estimations customized for Pakistan dental services." 
            : "Generate transparent cost estimates using standard CDT codes."}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Selection Area */}
        <div className="space-y-6">
          <div className="glass-card p-6 space-y-4">
            <h2 className="text-lg font-semibold">
              {isPak ? "Browse Pakistan Dental Catalog" : "Search American CDT Codes"}
            </h2>
            <div className="relative">
              <input 
                type="text" 
                placeholder={isPak ? "Search checkups, canals, ceramic braces..." : "Code or description..."}
                className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl focus:border-accent text-sm font-semibold transition outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            </div>

            <div className="max-h-[460px] overflow-y-auto space-y-2 pr-2">
              {filteredCodes.map((code) => (
                <div 
                  key={code.code}
                  className="relative flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.04] border border-white/5 hover:border-white/10 transition group"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-extrabold text-sm text-accent">{code.code}</p>
                      {code.category && (
                        <span className="text-[9px] font-black uppercase tracking-wider bg-white/5 text-secondary px-1.5 py-0.5 rounded-md">
                          {code.category}
                        </span>
                      )}
                      <div className="relative">
                        <Info 
                          className="w-3.5 h-3.5 text-slate-400 hover:text-accent transition-colors cursor-help" 
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
                    <p className="text-sm font-bold mt-1 text-primary">{code.description}</p>
                    <p className="text-xs text-secondary mt-1 font-mono">{displayCost(code.estimatedCost)}</p>
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
            className="glass-card p-6 h-full flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-accent" />
                  Planned Procedures
                </h2>
                <span className="text-[10px] uppercase font-black tracking-widest text-secondary">
                  Clinical Estimate
                </span>
              </div>

              <div className="space-y-4">
                {selectedCodes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-secondary py-20 text-center">
                    <Calculator className="w-12 h-12 mb-4 opacity-20" />
                    <p className="font-bold">Estimate is currently empty</p>
                    <p className="text-xs mt-1">Select from procedures on the left to start mapping fees.</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
                    {selectedCodes.map((c) => (
                      <motion.div 
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={c.code} 
                        className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                      >
                        <div className="flex-1">
                          <p className="font-bold text-sm text-primary">{c.description}</p>
                          <p className="text-xs text-secondary font-semibold">{c.quantity} x {displayCost(c.estimatedCost)}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="font-extrabold text-sm text-primary">{displayCost(c.estimatedCost * c.quantity)}</p>
                          <button 
                            onClick={() => removeCode(c.code)}
                            className="text-slate-500 hover:text-rose-500 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
              <div className="flex justify-between items-end">
                <p className="text-secondary font-bold">Estimated Treatment Cost</p>
                <div className="text-right">
                  <p className="text-3xl font-black tracking-tight text-accent">{displayCost(total)}</p>
                  <p className="text-[10px] text-secondary mt-1 font-medium">Subject to in-person diagnostic exams</p>
                </div>
              </div>
              <button 
                disabled={selectedCodes.length === 0}
                className="btn-primary w-full py-3.5 bg-accent text-white rounded-xl font-bold shadow-lg shadow-accent/20 hover:bg-blue-600 disabled:opacity-30 disabled:shadow-none transition-all active:scale-[0.98] uppercase tracking-wider text-xs"
              >
                Assemble Professional Estimate PDF
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
