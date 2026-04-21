import React from 'react';
import { ShieldCheck, Zap, Bell, Users, BarChart3, Clock } from 'lucide-react';
import { motion } from 'motion/react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-primary selection:bg-accent/30 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <Zap className="text-white w-5 h-5 fill-current" />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase">DentalOS</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-secondary">
            <a href="#features" className="hover:text-accent transition-colors">Features</a>
            <a href="#pricing" className="hover:text-accent transition-colors">Pricing</a>
            <button className="btn-primary">Book Demo</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-40 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none opacity-20">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-accent/30 rounded-full blur-[120px] mix-blend-screen" />
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-block px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-black uppercase tracking-widest mb-6"
          >
            The Future of Practice Management
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black tracking-tighter leading-[1.1] mb-8"
          >
            Stop Losing Revenue to <span className="text-accent underline decoration-accent/30 underline-offset-8">No-Shows</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-secondary max-w-2xl mx-auto leading-relaxed mb-12"
          >
            Automate your clinical records, intelligent patient reminders, and revenue cycle in one high-precision platform designed exclusively for busy dentists.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button className="btn-primary text-lg px-8 py-4 shadow-2xl shadow-accent/20">
              Get Started for Free
            </button>
            <button className="px-8 py-4 rounded-xl border border-border text-primary font-bold hover:bg-white/5 transition-all">
              Watch Product Tour
            </button>
          </motion.div>
        </div>
      </header>

      {/* Pain Points Section */}
      <section className="py-32 px-6 bg-card/30 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl font-black uppercase tracking-tight mb-4">Why Manual isn't Enough</h2>
            <p className="text-secondary max-w-xl mx-auto">Running a clinic with legacy software or paper leads to massive invisible losses.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-card p-10 relative overflow-hidden group">
              <div className="w-12 h-12 bg-rose-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Clock className="text-rose-500 w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-4">Manual Appointment Chase</h3>
              <p className="text-secondary text-sm leading-relaxed">Your staff spends 12+ hours a week calling patients just to confirm slots. DentalOS automates reminders via WhatsApp Cloud API.</p>
            </div>
            
            <div className="glass-card p-10 relative overflow-hidden group">
              <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="text-amber-500 w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-4">Missing Clinical Context</h3>
              <p className="text-secondary text-sm leading-relaxed">Patient history is fragmented across files. Our AI Clinical Brain centralizes every symptom, xray, and prescription instantly.</p>
            </div>
            
            <div className="glass-card p-10 relative overflow-hidden group">
              <div className="w-12 h-12 bg-accent/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BarChart3 className="text-accent w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-4">The No-Show Revenue Gap</h3>
              <p className="text-secondary text-sm leading-relaxed">Empty chairs cost an average clinic $2,400/month. intelligent rescheduling fills gaps before they happen.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust/Security Section */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="w-16 h-16 bg-safe/20 rounded-full flex items-center justify-center mx-auto mb-8">
            <ShieldCheck className="text-safe w-8 h-8" />
          </div>
          <h2 className="text-4xl font-black mb-8">Medical Grade Security as Standard</h2>
          <div className="grid md:grid-cols-2 gap-12 text-left">
            <div>
              <h4 className="font-bold text-accent mb-2">HIPAA Compliant Privacy</h4>
              <p className="text-secondary text-sm leading-relaxed">Military-grade encryption for all data at rest and in transit. Your patient records are for your eyes only.</p>
            </div>
            <div>
              <h4 className="font-bold text-accent mb-2">Role-Based Access (RBAC)</h4>
              <p className="text-secondary text-sm leading-relaxed">Granular permissions: Front-desk sees schedules, Dentists see clinical notes, but only You see the financial reports.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5 bg-background">
        <div className="max-w-7xl mx-auto flex flex-col md:row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Zap className="text-accent w-6 h-6" />
            <span className="text-lg font-black tracking-tighter uppercase">DentalOS</span>
          </div>
          <p className="text-secondary text-xs font-bold uppercase tracking-widest">© 2026 High-Symmetry Dental Lab. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}
