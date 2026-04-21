import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useStore } from './lib/store';
import { 
  Calendar, 
  ShieldCheck, 
  Calculator, 
  Users, 
  LayoutDashboard, 
  Settings,
  Bell,
  Search,
  UserCircle,
  ShieldAlert,
  Loader2,
  Presentation,
  Brain,
  TrendingUp
} from 'lucide-react';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import ErrorBoundary from './components/ErrorBoundary';

// To be moved to separate files later
import Dashboard from './components/modules/Dashboard';
import AIReceptionist from './components/modules/AIReceptionist';
import InsuranceVerification from './components/modules/InsuranceVerification';
import CostEstimator from './components/modules/CostEstimator';
import PatientTriage from './components/modules/PatientTriage';
import ClinicalBrain from './components/modules/ClinicalBrain';
import ClinicGrowth from './components/modules/ClinicGrowth';
import LandingPage from './components/LandingPage';

export default function App() {
  const [activeTab, setActiveTab] = useState('marketing');
  const [isBooting, setIsBooting] = useState(true);
  const { searchQuery, setSearchQuery } = useStore();

  useEffect(() => {
    // Simulate system initialization check
    const timer = setTimeout(() => {
      setIsBooting(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  if (isBooting) {
    return (
      <div className="min-h-screen bg-[#0B0E14] flex flex-col items-center justify-center space-y-6">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative"
        >
          <div className="w-20 h-20 bg-accent/10 rounded-3xl flex items-center justify-center border border-accent/20">
            <ShieldCheck className="text-accent w-10 h-10" />
          </div>
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-2 border-2 border-transparent border-t-accent/40 rounded-[2rem]"
          />
        </motion.div>
        <div className="text-center space-y-2">
          <h1 className="text-primary font-bold tracking-widest text-sm uppercase">Initializing DentalOS</h1>
          <div className="flex items-center gap-2 justify-center text-secondary text-[10px] uppercase font-bold tracking-tighter">
            <Loader2 className="w-3 h-3 animate-spin" />
            Verifying Core Kernel...
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: 'marketing', label: 'Marketing Page', icon: Presentation },
    { id: 'dashboard', label: 'Doctor Dashboard', icon: LayoutDashboard },
    { id: 'growth', label: 'Clinic Growth', icon: TrendingUp },
    { id: 'clinical-brain', label: 'Clinical Brain', icon: Brain },
    { id: 'receptionist', label: 'AI Receptionist', icon: Calendar },
    { id: 'insurance', label: 'Insurance Verify', icon: ShieldCheck },
    { id: 'estimator', label: 'Cost Estimator', icon: Calculator },
    { id: 'triage', label: 'Patient Triage', icon: Users },
  ];

  return (
    <ErrorBoundary>
      <Toaster position="top-right" />
      <div className="flex min-h-screen bg-background text-primary">
      {/* Sidebar - Don't show on marketing page for "clean" look or show minimized */}
      <aside className={cn(
        "w-[72px] border-r border-border bg-card flex flex-col hidden lg:flex shrink-0 transition-opacity duration-500",
        activeTab === 'marketing' ? "opacity-40 hover:opacity-100" : "opacity-100"
      )}>
        <div className="py-8 flex justify-center">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center shadow-lg shadow-accent/20">
            <ShieldCheck className="text-white w-5 h-5" />
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-6 mt-4 flex flex-col items-center">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={item.label}
              className={cn(
                "p-3 rounded-xl transition-all duration-300",
                activeTab === item.id 
                  ? "bg-accent/10 text-accent ring-1 ring-accent/30" 
                  : "text-secondary hover:text-primary hover:bg-slate-800"
              )}
            >
              <item.icon className="w-5 h-5" />
            </button>
          ))}
        </nav>

        <div className="pb-8 border-t border-border/50 space-y-6 flex flex-col items-center pt-6 text-secondary">
          <button className="hover:text-primary cursor-not-allowed opacity-50 p-3">
            <Settings className="w-5 h-5" />
          </button>
          <div className="relative group">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center border border-border overflow-hidden">
               <UserCircle className="w-8 h-8" />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-background">
        {/* Top bar - Hide on marketing */}
        {activeTab !== 'marketing' && (
          <header className="h-16 border-b border-border bg-background/50 backdrop-blur-md flex items-center justify-between px-8 z-10 shrink-0">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold tracking-tight">
                DentalOS <span className="text-secondary font-medium ml-2">/ {navItems.find(i => i.id === activeTab)?.label}</span>
              </h1>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 bg-card border border-white/5 px-4 py-2 rounded-xl w-80">
                <Search className="w-4 h-4 text-secondary" />
                <input 
                  type="text" 
                  placeholder="Global search (CMD+K)..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none text-sm focus:outline-none w-full text-primary placeholder:text-secondary/50"
                />
              </div>
              <div className="flex items-center gap-4 border-l border-white/5 pl-6">
                <button className="p-2.5 text-secondary hover:text-primary bg-card border border-white/5 rounded-xl relative transition-all">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-card" />
                </button>
                <div className="px-3 py-1 bg-accent/10 text-accent border border-accent/20 rounded-full text-[10px] font-bold tracking-widest uppercase">
                  AI Active
                </div>
              </div>
            </div>
          </header>
        )}

        {/* Dynamic Viewport */}
        <div className={cn(
          "flex-1 overflow-y-auto scroll-smooth",
          activeTab === 'marketing' ? "p-0" : "p-6"
        )}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {activeTab === 'marketing' && <LandingPage />}
              <div className={cn(
                "max-w-[1600px] mx-auto",
                activeTab === 'marketing' ? "hidden" : "block"
              )}>
                {activeTab === 'dashboard' && <Dashboard />}
                {activeTab === 'growth' && <ClinicGrowth />}
                {activeTab === 'clinical-brain' && <ClinicalBrain />}
                {activeTab === 'receptionist' && <AIReceptionist />}
                {activeTab === 'insurance' && <InsuranceVerification />}
                {activeTab === 'estimator' && <CostEstimator />}
                {activeTab === 'triage' && <PatientTriage />}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
    </ErrorBoundary>
  );
}

