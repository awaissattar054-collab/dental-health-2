import React, { useState } from 'react';
import { 
  Plus, Search, Filter, TrendingUp, Calendar, AlertCircle, Clock, 
  ChevronRight, Sparkles, CheckCircle2, Award, Zap, Activity
} from 'lucide-react';
import { motion } from 'motion/react';
import { useClinic } from '../../context/ClinicContext';
import { useNavigate } from 'react-router-dom';

export interface CaseItem {
  id: string;
  patientName: string;
  patientPhoto?: string;
  caseType: 'Single Implant' | 'Full Arch' | 'Full Mouth Rehab' | 'Veneers' | 'Crown' | 'RCT + Crown';
  currentStageName: string;
  progress: number; // 0 - 100
  daysActive: number;
  nextAppointment: string;
  totalValue: number; // baseline USD
  specValueKey: string;
  status: 'In Progress' | 'Healing' | 'Awaiting Patient' | 'Completed';
   dentistName: string;
}

export const MOCK_CASES: CaseItem[] = [
  {
    id: 'CS-001',
    patientName: 'Muhammad Ali',
    caseType: 'Single Implant',
    currentStageName: 'Osseointegration Period',
    progress: 50,
    daysActive: 45,
    nextAppointment: '2026-06-15',
    totalValue: 650, // baseline USD, maps to PKR 180,000 for single implant
    specValueKey: 'single_implant',
    status: 'Healing',
    dentistName: 'Dr. Saqib Minhas'
  },
  {
    id: 'CS-002',
    patientName: 'Fatima Bhutto',
    caseType: 'Full Mouth Rehab',
    currentStageName: 'Impression & Lab Work',
    progress: 75,
    daysActive: 90,
    nextAppointment: '2026-06-02',
    totalValue: 2800, // maps to PKR 800,000
    specValueKey: 'full_mouth',
    status: 'In Progress',
    dentistName: 'Dr. Saqib Minhas'
  },
  {
    id: 'CS-003',
    patientName: 'Zainab Malik',
    caseType: 'Veneers',
    currentStageName: 'Crown/Prosthesis Fitting',
    progress: 90,
    daysActive: 14,
    nextAppointment: '2026-05-30',
    totalValue: 1250, // maps to PKR 35,000 per Veneer
    specValueKey: 'veneers',
    status: 'In Progress',
    dentistName: 'Dr. Saqib Minhas'
  },
  {
    id: 'CS-004',
    patientName: 'Kashif Abbasi',
    caseType: 'RCT + Crown',
    currentStageName: 'Initial Consultation',
    progress: 15,
    daysActive: 2,
    nextAppointment: '2026-06-01',
    totalValue: 215, // RCT PK-04 + PFM PK-05
    specValueKey: 'rct_crown',
    status: 'Awaiting Patient',
    dentistName: 'Dr. Saqib Minhas'
  },
  {
    id: 'CS-005',
    patientName: 'Ayesha Khan',
    caseType: 'Single Implant',
    currentStageName: '3-Month Follow-Up',
    progress: 100,
    daysActive: 120,
    nextAppointment: '2026-08-10',
    totalValue: 650,
    specValueKey: 'single_implant',
    status: 'Completed',
    dentistName: 'Dr. Saqib Minhas'
  }
];

export default function CaseJourney() {
  const { formatPrice } = useClinic();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Realistic currency conversion override for premium items
  const resolvePrice = (item: CaseItem) => {
    if (item.specValueKey === 'single_implant') {
      return formatPrice(180000 / 278, 'single_implant_pkr'); // will format correctly
    }
    if (item.specValueKey === 'full_mouth') {
      return formatPrice(800000 / 278);
    }
    if (item.specValueKey === 'veneers') {
      return formatPrice(35000 / 278);
    }
    if (item.specValueKey === 'rct_crown') {
      return formatPrice(50000 / 278);
    }
    return formatPrice(item.totalValue);
  };

  const filteredCases = MOCK_CASES.filter(c => {
    const matchesSearch = c.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.caseType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: CaseItem['status']) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'Healing': return 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20';
      case 'In Progress': return 'bg-accent/10 text-accent border-accent/20';
      case 'Awaiting Patient': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Upper header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold leading-none bg-accent/10 text-accent border border-accent/20 px-2 py-1 rounded-md uppercase tracking-wider">PREMIUM MODULE</span>
            <span className="text-xs font-bold text-secondary">• Multi-Stage Clinical Planner</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter uppercase gradient-text">Case Journey Tracker</h1>
          <p className="text-secondary mt-1 font-medium">Advanced tracking of long-term implantologies, restorations, and cosmetic conversions</p>
        </div>
        <button 
          onClick={() => navigate('/dashboard/estimator')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create New Plan
        </button>
      </div>

      {/* KPI Overviews */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Active Treatments', value: '4 Cases', trend: '3 Implants active', icon: Activity, color: 'text-accent', bg: 'bg-accent/5' },
          { label: 'Patient Healing Cycle', value: '1 Patient', trend: 'Awaiting Abutment', icon: Clock, color: 'text-cyan-400', bg: 'bg-cyan-500/5' },
          { label: 'Avg Journey duration', value: '62 Days', trend: 'On Track with clinic avg', icon: Calendar, color: 'text-emerald-400', bg: 'bg-emerald-500/5' },
          { label: 'Case Value pipeline', value: MOCK_CASES.reduce((acc, curr) => acc + (curr.specValueKey === 'single_implant' ? 180000 : curr.specValueKey === 'full_mouth' ? 800000 : curr.specValueKey === 'veneers' ? 35000 : 50000), 0), isCurrency: true, icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-500/5' }
        ].map((kpi, i) => (
          <div key={i} className="glass-card p-6 border-white/5 relative overflow-hidden group">
            <div className={`absolute -right-2 -bottom-2 w-24 h-24 rounded-full opacity-10 transition-transform group-hover:scale-110 duration-500 ${kpi.color}`}></div>
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${kpi.bg}`}>
                <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-secondary">REAL-TIME</span>
            </div>
            <p className="text-xs font-bold text-secondary uppercase tracking-widest">{kpi.label}</p>
            <p className="text-3xl font-black tracking-tight mt-1">
              {kpi.isCurrency ? formatPrice(Number(kpi.value) / 278) : kpi.value}
            </p>
            <p className="text-xs text-secondary mt-1 font-medium">{kpi.trend || 'Updated minutes ago'}</p>
          </div>
        ))}
      </div>

      {/* Actions Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
        <div className="relative w-full md:w-96">
          <input 
            type="text" 
            placeholder="Search active patients or treatment journeys..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold outline-none focus:border-accent transition"
          />
          <Search className="absolute left-3 top-3 w-4 h-4 text-secondary" />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          <span className="text-xs font-bold text-secondary flex items-center gap-1 shrink-0"><Filter className="w-3 h-3" /> Filter Status:</span>
          {['All', 'In Progress', 'Healing', 'Awaiting Patient', 'Completed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition shrink-0 ${
                statusFilter === tab 
                  ? 'bg-accent text-white shadow-md shadow-accent/20' 
                  : 'bg-white/5 text-secondary hover:text-primary hover:bg-white/10'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Treatment Journeys */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCases.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => navigate(`/dashboard/cases/${item.id}`)}
            className="glass-card border-white/5 p-6 flex flex-col justify-between hover:bg-white/[0.04] transition duration-300 cursor-pointer relative group"
          >
            {/* Spotlight Accent */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent/0 via-accent/50 to-accent/0 opacity-0 group-hover:opacity-100 transition duration-500"></div>

            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-extrabold text-lg group-hover:text-accent transition">{item.patientName}</h3>
                  <p className="text-xs text-secondary font-semibold mt-0.5">{item.caseType}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[9px] font-black border uppercase tracking-widest ${getStatusColor(item.status)}`}>
                  {item.status}
                </span>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5 my-5">
                <div className="flex justify-between text-xs">
                  <span className="text-secondary font-bold">Stage: <span className="text-primary font-bold">{item.currentStageName}</span></span>
                  <span className="font-extrabold text-accent">{item.progress}%</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-accent rounded-full transition-all duration-1000"
                    style={{ width: `${item.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Core Details metadata */}
              <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4 text-xs font-bold text-secondary">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-secondary/70">Days Since Start</p>
                  <p className="text-primary font-black mt-0.5">{item.daysActive} Days</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-secondary/70">Next Appointment</p>
                  <p className="text-primary font-black mt-0.5">{item.nextAppointment}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-white/5 pt-4 mt-6 flex justify-between items-center">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-secondary/70">Estimated Value</p>
                <p className="text-xl font-black text-primary tracking-tight mt-0.5">{resolvePrice(item)}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-secondary group-hover:bg-accent group-hover:text-white transition duration-300">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </motion.div>
        ))}

        {filteredCases.length === 0 && (
          <div className="col-span-full border border-dashed border-white/5 rounded-3xl p-16 text-center text-secondary">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-secondary/30" />
            <p className="text-lg font-bold text-primary">No clinical cases matched your search</p>
            <p className="text-sm mt-1">Try tweaking your search keywords or filter settings</p>
          </div>
        )}
      </div>
    </div>
  );
}
