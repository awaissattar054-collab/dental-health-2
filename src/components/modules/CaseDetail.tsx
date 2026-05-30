import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, Shield, DollarSign, User, Activity, CheckCircle2, 
  Clock, AlertCircle, Camera, MessageSquare, Download, Sparkles, Send, 
  TrendingUp, RefreshCw, Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useClinic } from '../../context/ClinicContext';
import { MOCK_CASES, CaseItem } from './CaseJourney';
import toast from 'react-hot-toast';

interface Phase {
  id: number;
  name: string;
  durationRange: string;
  notes: string;
  status: 'Done' | 'Scheduled' | 'Pending' | 'Skipped';
  completedDate?: string;
  costInUSD: number;
  hasPhoto?: boolean;
}

export default function CaseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { formatPrice, currency } = useClinic();
  
  // Find active case from mock database
  const activeCase = MOCK_CASES.find(c => c.id === id) || MOCK_CASES[0];
  
  // Calculate relative prices for timeline and summary
  const getTreatmentCost = () => {
    if (activeCase.specValueKey === 'single_implant') {
      return { total: 180000, paid: 120000, remaining: 60000 };
    }
    if (activeCase.specValueKey === 'full_mouth') {
      return { total: 800000, paid: 500000, remaining: 300000 };
    }
    if (activeCase.specValueKey === 'veneers') {
      return { total: 140000, paid: 140000, remaining: 0 };
    }
    return { total: 50000, paid: 35000, remaining: 15000 };
  };

  const cost = getTreatmentCost();

  // State to simulate photo upload
  const [photosUploaded, setPhotosUploaded] = useState<Record<number, string>>({
    1: "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&q=80&w=400", // diagnostic imaging
    6: "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&q=80&w=400", // implant surgery
  });

  const handlePhotoUpload = (phaseId: number) => {
    const fakeUrls = [
      "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=400",
      "https://images.unsplash.com/photo-1579684389782-64d84b5e901a?auto=format&fit=crop&q=80&w=400"
    ];
    const pickedUrl = fakeUrls[Math.floor(Math.random() * fakeUrls.length)];
    setPhotosUploaded(prev => ({ ...prev, [phaseId]: pickedUrl }));
    toast.success('Clinical photograph uploaded successfully');
  };

  // Vertical treatment phases
  const [phases, setPhases] = useState<Phase[]>([
    { id: 1, name: "Initial Consultation", durationRange: "Day 0", notes: "Full oral assessment and basic treatment mapping complete.", status: "Done", completedDate: "2026-04-10", costInUSD: 1500 },
    { id: 2, name: "Diagnostic Imaging (3D CBCT)", durationRange: "Day 0-3", notes: "3D Conebeam computed tomography to measure high-resolution bone density.", status: "Done", completedDate: "2026-04-12", costInUSD: 5000 },
    { id: 3, name: "Digital Treatment Planning", durationRange: "Day 3-7", notes: "Surgical guide configured using digital impression design.", status: "Done", completedDate: "2026-04-15", costInUSD: 3000 },
    { id: 4, name: "Surgical Site Preparation", durationRange: "Day 7-14", notes: "Gentle extraction of failing root tooth #14 carried out.", status: "Done", completedDate: "2026-04-20", costInUSD: 8000 },
    { id: 5, name: "Bone Grafting & Membrane", durationRange: "3-4 Months", notes: "Synthetic socket grafting complete. Excellent structural containment.", status: "Done", completedDate: "2026-04-20", costInUSD: 25000 },
    { id: 6, name: "Implant Surgery (Placement)", durationRange: "Day 21", notes: "Premium Grade-5 Titanium implant placed. Stable torque registered at 38 Ncm.", status: "Done", completedDate: "2026-05-15", costInUSD: 85000 },
    { id: 7, name: "Osseointegration Period", durationRange: "3-6 Months", notes: "Implant integration in progress. Awaiting structural bone fusing.", status: "Scheduled", completedDate: "2026-08-15", costInUSD: 0 },
    { id: 8, name: "Healing Abutment Placement", durationRange: "Day 120", notes: "Exposing single screw and mounting custom contouring cap.", status: "Pending", costInUSD: 15000 },
    { id: 9, name: "Master Impression & Lab Work", durationRange: "2-3 Weeks", notes: "Digital scanning of abutment contouring for custom crown design.", status: "Pending", costInUSD: 10000 },
    { id: 10, name: "Crown Delivery & Occlusion", durationRange: "Day 140", notes: "Final cementation or screw retention adjust for perfect bite.", status: "Pending", costInUSD: 25000 }
  ]);

  const togglePhaseStatus = (id: number) => {
    setPhases(prev => prev.map(p => {
      if (p.id === id) {
        const statusCycle: Phase['status'][] = ['Pending', 'Scheduled', 'Done', 'Skipped'];
        const nextIdx = (statusCycle.indexOf(p.status) + 1) % statusCycle.length;
        return { ...p, status: statusCycle[nextIdx] };
      }
      return p;
    }));
    toast('Status cycled manually', { icon: '🔄' });
  };

  // Side-by-side comparison view state
  const [compareBefore, setCompareBefore] = useState("https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&q=80&w=600");
  const [compareAfter, setCompareAfter] = useState("https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=600");

  const triggerWhatsApp = () => {
    toast.success('WhatsApp outreach queued. Custom template compiled!');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-[1700px] mx-auto text-primary">
      {/* Back link */}
      <button 
        onClick={() => navigate('/dashboard/cases')}
        className="flex items-center gap-2 text-sm font-bold text-secondary hover:text-accent transition duration-200 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Case List
      </button>

      {/* Top Banner Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-6 md:p-8 border-white/5 flex flex-col md:flex-row gap-6 items-start justify-between relative overflow-hidden">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-accent to-blue-500 flex items-center justify-center font-black text-4xl shadow-xl shadow-accent/20 border border-white/10 text-white select-none self-start">
              {activeCase.patientName.charAt(0)}
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black tracking-tight">{activeCase.patientName}</h1>
                <span className="px-2.5 py-0.5 bg-yellow-500/10 text-yellow-500 border border-yellow-500/25 rounded-md text-[10px] font-black uppercase tracking-wider">MODERATE</span>
              </div>
              <p className="text-sm font-extrabold text-accent flex items-center gap-2">
                <Layers className="w-4 h-4" /> {activeCase.caseType} Journey Planning
              </p>
              <p className="text-xs text-secondary leading-relaxed max-w-xl">
                Primary treatment plan addresses single-tooth surgical titanium implantation to restore lost bite surface and prevent adjacent molar shifting. Guide-based computer aided prosthetic restoration.
              </p>
              <div className="flex items-center gap-4 text-xs font-bold pt-2 text-secondary">
                <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> Lead: {activeCase.dentistName}</span>
                <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> Assistants: Dr. Faiza Khan</span>
              </div>
            </div>
          </div>
        </div>

        {/* Currency summary card */}
        <div className="glass-card p-6 md:p-8 border-white/5 flex flex-col justify-between bg-gradient-to-br from-white/[0.01] via-transparent to-accent/[0.02]">
          <h2 className="text-sm font-black uppercase tracking-widest text-secondary">Treatment Financial Allocation</h2>
          
          <div className="space-y-4 my-6">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-bold text-secondary">Total Procedure Value:</span>
              <span className="text-2xl font-black text-primary">
                {currency === 'PKR' ? `₨ ${cost.total.toLocaleString()}` : formatPrice(cost.total / 278)}
              </span>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-accent rounded-full" style={{ width: `${(cost.paid / cost.total) * 100}%` }}></div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs pt-2">
              <div>
                <p className="text-secondary font-bold">Paid to Date</p>
                <p className="text-emerald-500 font-extrabold text-base mt-0.5">
                  {currency === 'PKR' ? `₨ ${cost.paid.toLocaleString()}` : formatPrice(cost.paid / 278)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-secondary font-bold">Remaining Balance</p>
                <p className="text-rose-500 font-extrabold text-base mt-0.5">
                  {currency === 'PKR' ? `₨ ${cost.remaining.toLocaleString()}` : formatPrice(cost.remaining / 278)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main timeline + sidebar panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Treatment phases timeline */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 md:p-8 border-white/5">
            <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
              <div>
                <h3 className="text-xl font-bold">Chronological Treatment Steps</h3>
                <p className="text-xs text-secondary mt-0.5">Click any stage badge to cycle status indicator manually</p>
              </div>
              <span className="text-xs font-mono font-bold text-secondary leading-none bg-white/5 px-2.5 py-1 rounded-md">
                {phases.filter(p => p.status === 'Done').length}/{phases.length} Phases Done
              </span>
            </div>

            {/* Vertical timeline */}
            <div className="relative border-l border-white/10 pl-6 space-y-12 ml-4">
              {phases.map((phase, idx) => {
                const isStepCompleted = phase.status === 'Done';
                const isStepActive = phase.status === 'Scheduled';
                return (
                  <motion.div 
                    key={phase.id} 
                    className="relative"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    {/* Circle Node indicator on the left line */}
                    <div className="absolute -left-[31px] top-1.5 flex items-center justify-center">
                      {isStepCompleted ? (
                        <div className="w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5 text-slate-950 stroke-[3]" />
                        </div>
                      ) : isStepActive ? (
                        <div className="w-4 h-4 bg-accent rounded-full border-2 border-slate-950 flex items-center justify-center shadow-lg shadow-accent/20 animate-pulse">
                          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                        </div>
                      ) : (
                        <div className="w-3.5 h-3.5 bg-slate-800 rounded-full border-2 border-slate-900 flex items-center justify-center"></div>
                      )}
                    </div>

                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className={`font-extrabold text-base ${isStepCompleted ? 'text-primary/70 line-through' : 'text-primary'}`}>
                            {phase.name}
                          </h4>
                          <span className="text-[10px] font-bold text-secondary bg-white/5 px-2 py-0.5 rounded-md">
                            {phase.durationRange}
                          </span>
                        </div>
                        <p className="text-xs text-secondary leading-relaxed max-w-xl">{phase.notes}</p>
                        
                        {/* Photo attachment placeholder in timeline */}
                        {photosUploaded[phase.id] ? (
                          <div className="mt-3 relative w-32 h-20 rounded-xl overflow-hidden border border-white/10 group-photo">
                            <img src={photosUploaded[phase.id]} alt="clinical_step" className="w-full h-full object-cover" />
                            <button 
                              onClick={() => handlePhotoUpload(phase.id)}
                              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center text-[10px] font-bold"
                            >
                              <RefreshCw className="w-4 h-4 mr-1 animate-spin-hover" /> Replace
                            </button>
                          </div>
                        ) : phase.status === 'Done' ? (
                          <button 
                            onClick={() => handlePhotoUpload(phase.id)}
                            className="mt-3 flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-accent/10 border border-white/5 hover:border-accent/25 rounded-xl text-[10px] font-black uppercase text-secondary hover:text-accent transition duration-200"
                          >
                            <Camera className="w-3.5 h-3.5" /> Attach Step Photo
                          </button>
                        ) : null}
                      </div>

                      <div className="flex md:flex-col items-end gap-2 text-right">
                        <button 
                          onClick={() => togglePhaseStatus(phase.id)}
                          className={`px-3 py-1 border rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
                            phase.status === 'Done' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/25' :
                            phase.status === 'Scheduled' ? 'bg-blue-500/10 text-blue-500 border-blue-500/25' :
                            phase.status === 'Skipped' ? 'bg-slate-700/20 text-secondary border-slate-700/40' :
                            'bg-slate-800 text-secondary border-white/5'
                          }`}
                        >
                          {phase.status}
                        </button>
                        {phase.costInUSD > 0 && (
                          <p className="text-xs font-bold text-secondary mt-1">Est: {currency === 'PKR' ? `₨ ${Math.round(phase.costInUSD * (180000 / 2500)).toLocaleString()}` : formatPrice(phase.costInUSD)}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: AI Insights Sidebar Panel */}
        <div className="space-y-6">
          <div className="glass-card p-6 md:p-8 border-white/5 relative overflow-hidden bg-gradient-to-b from-accent/[0.03] to-transparent">
            {/* Ambient Pulse */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent rounded-full filter blur-3xl opacity-10"></div>
            
            <div className="flex items-center gap-2 mb-6 text-accent">
              <Sparkles className="w-5 h-5 fill-current animate-pulse" />
              <h3 className="text-lg font-black uppercase tracking-widest">AI Clinical Guidance</h3>
            </div>

            <div className="space-y-6 leading-relaxed text-xs text-secondary font-medium">
              <div className="p-4 bg-white/5 border border-white/5 rounded-2xl relative space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-primary">
                  <Activity className="w-4 h-4 text-accent" /> Healing Period Monitoring
                </div>
                <p>
                  Patient is in phase **Osseointegration** for single implant #14. Clinical checklist recommends checking final bone fusion stability in **8 weeks**. High healing density target expected based on initial surgical torque.
                </p>
              </div>

              <div className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-primary">
                  <Clock className="w-4 h-4 text-cyan-400" /> Bone Density Overview
                </div>
                <p>
                  Bone quality classified as Class D2 (Excellent density/strength). Digital bone planning guide ensures safe placement, preventing load stress on subsequent abutment setup.
                </p>
              </div>

              <div className="p-4 bg-white/5 border border-accent/20 rounded-2xl space-y-3 bg-accent/5">
                <div className="flex items-center justify-between text-primary font-bold">
                  <span className="flex items-center gap-1.5"><MessageSquare className="w-4 h-4 text-accent" /> Customer Outreach</span>
                  <span className="text-[9px] font-black uppercase tracking-wider bg-accent/20 px-2 py-0.5 rounded-md text-accent">WhatsApp</span>
                </div>
                <p className="text-secondary">
                  Trigger automated post-surgical healing advice directly to patient's cell phone for optimal reassurance.
                </p>
                <button 
                  onClick={triggerWhatsApp}
                  className="w-full py-2 bg-accent text-white font-black uppercase rounded-lg text-[10.5px] hover:bg-blue-600 transition flex items-center justify-center gap-1.5 shadow-md shadow-accent/20"
                >
                  <Send className="w-3.5 h-3.5" /> Dispatch via WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Side-by-Side Documentation Grid */}
      <section className="glass-card p-6 md:p-8 border-white/5 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
          <div>
            <h3 className="text-xl font-bold">Aesthetic Photo Documentation</h3>
            <p className="text-xs text-secondary mt-0.5">Clinical comparison dashboard used for patient presentation and case history archives</p>
          </div>
          <button className="flex items-center gap-1.5 px-4 py-2 bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 rounded-xl text-xs font-bold text-primary transition duration-200">
            <Download className="w-4 h-4" /> Download High-Res Case ZIP
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          {/* Before view */}
          <div className="space-y-2">
            <p className="text-xs font-black uppercase tracking-widest text-secondary">Pre-Inductive Panoramic / Local</p>
            <div className="aspect-video relative rounded-2xl overflow-hidden border border-white/10 group">
              <img src={compareBefore} alt="before" className="w-full h-full object-cover transition group-hover:scale-105 duration-700" />
              <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider text-white">Before Treatment</div>
              <button 
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.onchange = (e: any) => setCompareBefore(URL.createObjectURL(e.target.files[0]));
                  input.click();
                }}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center text-xs font-bold gap-1"
              >
                <Camera className="w-4 h-4" /> Upload New Pre-Op Image
              </button>
            </div>
          </div>

          {/* After view */}
          <div className="space-y-2">
            <p className="text-xs font-black uppercase tracking-widest text-secondary">Post-Implantation Guide</p>
            <div className="aspect-video relative rounded-2xl overflow-hidden border border-white/10 group">
              <img src={compareAfter} alt="after" className="w-full h-full object-cover transition group-hover:scale-105 duration-700" />
              <div className="absolute top-4 left-4 bg-accent/95 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider text-white">Latest Implantation</div>
              <button 
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.onchange = (e: any) => setCompareAfter(URL.createObjectURL(e.target.files[0]));
                  input.click();
                }}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center text-xs font-bold gap-1"
              >
                <Camera className="w-4 h-4" /> Upload New Post-Op Image
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
