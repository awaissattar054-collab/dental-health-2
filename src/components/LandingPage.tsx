import React from 'react';
import { Activity, Shield, DollarSign, Calendar, Sparkles, Smile, ArrowRight, CheckCircle, Smartphone } from 'lucide-react';

interface LandingPageProps {
  onNavigateToAuth: (mode: 'login' | 'signup') => void;
}

export function LandingPage({ onNavigateToAuth }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-slate-900 text-white overflow-x-hidden selection:bg-cyan-500 selection:text-white">
      {/* Header / Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-tr from-cyan-400 to-blue-600 p-2 rounded-xl shadow-lg">
                <Smile className="h-6 w-6 text-white" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight bg-gradient-to-r from-cyan-400 to-blue-200 bg-clip-text text-transparent">
                DentalOS
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                id="landing-btn-login"
                onClick={() => onNavigateToAuth('login')}
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors duration-200"
              >
                Sign In
              </button>
              <button 
                id="landing-btn-signup"
                onClick={() => onNavigateToAuth('signup')}
                className="text-sm font-medium bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-cyan-505/20 transition-all duration-200 hover:scale-105"
              >
                Start Trial
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-8">
            <div className="inline-flex items-center space-x-2 bg-cyan-950/50 border border-cyan-800 px-3 py-1.5 rounded-full text-xs text-cyan-400 font-mono">
              <Sparkles className="h-3.5 w-3.5" />
              <span>THE ALL-IN-ONE CLINIC MANAGEMENT ENGINE</span>
            </div>
            
            <h1 className="font-display font-extrabold text-4xl sm:text-6xl tracking-tight text-white leading-tight">
              Transform Your <br />
              <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500 bg-clip-text text-transparent">
                Dental Practice
              </span>
            </h1>

            <p className="text-slate-400 text-lg sm:text-xl max-w-2xl leading-relaxed font-sans font-light">
              DentalOS is a clinical-grade operating system designed to elevate dentist workflows, schedule slots seamlessly, organize treatment stages, issue invoices, and securely track patient records with Supabase.
            </p>

            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                id="hero-btn-explore"
                onClick={() => onNavigateToAuth('signup')}
                className="flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-105 transition-all text-white font-medium px-8 py-4 rounded-2xl shadow-xl shadow-cyan-500/20"
              >
                <span>Deploy Clinic Workspace</span>
                <ArrowRight className="h-5 w-5" />
              </button>
              <button
                id="hero-btn-demo"
                onClick={() => onNavigateToAuth('login')}
                className="flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700/80 transition-all text-slate-300 hover:text-white border border-slate-700/60 font-medium px-8 py-4 rounded-2xl"
              >
                <span>Launch Demo Panel</span>
              </button>
            </div>

            {/* Micro badges */}
            <div className="grid grid-cols-3 gap-4 pt-10 border-t border-slate-800 max-w-lg text-slate-400 text-xs font-mono">
              <div>
                <span className="block text-2xl font-bold font-display text-white">99.9%</span>
                <span>Uptime SLA</span>
              </div>
              <div>
                <span className="block text-2xl font-bold font-display text-white">Supabase</span>
                <span>Data Core Vault</span>
              </div>
              <div>
                <span className="block text-2xl font-bold font-display text-white">HIPAA</span>
                <span>Compliance Level</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-3xl blur-2xl opacity-20"></div>
            <div className="relative bg-slate-800 border border-slate-700/50 rounded-3xl overflow-hidden p-6 shadow-2xl">
              {/* Fake UI preview inside landing page */}
              <div className="flex items-center justify-between border-b border-slate-700/60 pb-4 mb-6">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-red-500"></span>
                  <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                  <span className="w-3 h-3 rounded-full bg-green-500"></span>
                </div>
                <span className="text-slate-500 font-mono text-xs">dentalos_dashboard.app</span>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-700/30 flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-xl bg-cyan-950 flex items-center justify-center text-cyan-400">
                      <Activity className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="block text-xs text-slate-500 font-medium">ACTIVE CASES</span>
                      <span className="text-lg font-bold font-display">25 In-Progress</span>
                    </div>
                  </div>
                  <span className="text-xs bg-cyan-900/30 border border-cyan-800 text-cyan-400 px-2 py-1 rounded">Normal</span>
                </div>

                <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-700/30 flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-xl bg-teal-950 flex items-center justify-center text-teal-400">
                      <DollarSign className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="block text-xs text-slate-500 font-medium">REVENUE GENERATED</span>
                      <span className="text-lg font-bold font-display">PKR 245,000</span>
                    </div>
                  </div>
                  <span className="text-xs bg-green-900/30 border border-green-800 text-green-400 px-2.5 py-1 rounded">Paid</span>
                </div>

                <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-700/30 flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-xl bg-purple-950 flex items-center justify-center text-purple-400">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="block text-xs text-slate-500 font-medium">UPCOMING APPOINTMENTS</span>
                      <span className="text-lg font-bold font-display font-sans">14 Scheduled</span>
                    </div>
                  </div>
                  <span className="text-xs bg-purple-900/30 border border-purple-800 text-purple-400 px-2.5 py-1 rounded">Confirmed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="bg-slate-950 py-24 borders-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-20">
            <h2 className="font-display font-extrabold text-3xl sm:text-5xl">
              Fully Integrated Operations
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              Equipped with elite workflow optimization for high-density modern dental care.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-slate-900/50 hover:bg-slate-900 border border-slate-800 p-8 rounded-3xl transition-all duration-300 hover:-translate-y-1">
              <Smile className="h-10 w-10 text-cyan-400 mb-6" />
              <h3 className="font-display font-bold text-xl text-white mb-2">Patient Files</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Centralized profile details including medical history, CNIC validation, allergies, and contact details.
              </p>
            </div>

            <div className="bg-slate-900/50 hover:bg-slate-900 border border-slate-800 p-8 rounded-3xl transition-all duration-300 hover:-translate-y-1">
              <Activity className="h-10 w-10 text-teal-400 mb-6" />
              <h3 className="font-display font-bold text-xl text-white mb-2">Case Stage Planner</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Detail clinical cases (Root Canals, Crowns, Implants) broken down into visual, organized completion levels.
              </p>
            </div>

            <div className="bg-slate-900/50 hover:bg-slate-900 border border-slate-800 p-8 rounded-3xl transition-all duration-300 hover:-translate-y-1">
              <Calendar className="h-10 w-10 text-purple-400 mb-6" />
              <h3 className="font-display font-bold text-xl text-white mb-2">Smart Scheduler</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Eliminate overlapping slots with our live schedule booker. Monitor status indicators at first glance.
              </p>
            </div>

            <div className="bg-slate-900/50 hover:bg-slate-900 border border-slate-800 p-8 rounded-3xl transition-all duration-300 hover:-translate-y-1">
              <DollarSign className="h-10 w-10 text-emerald-400 mb-6" />
              <h3 className="font-display font-bold text-xl text-white mb-2">Bills & Payments</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Generate professional bills, track outstanding dues, accept multiple payment gateways (JazzCash, Cash, Card, Bank).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 py-12 border-t border-slate-900 text-center text-slate-500 font-mono text-xs">
        <p>© 2026 DentalOS. All rights reserved. Supported by resilient Supabase backend core.</p>
      </footer>
    </div>
  );
}
