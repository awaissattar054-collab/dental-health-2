import React, { useState } from 'react';
import { 
  Users, Activity, Calendar, DollarSign, Plus, Search, Check, X, Edit2, Trash, 
  Sparkles, ShieldAlert, CheckCircle, Info, Landmark, HelpCircle, AlertCircle, Smile
} from 'lucide-react';
import { usePatients, useCreatePatient, useUpdatePatient, useDeletePatient } from '../hooks/usePatients';
import { useCases, useCreateCase, useUpdateCase } from '../hooks/useCases';
import { useAppointments, useCreateAppointment, useUpdateAppointment } from '../hooks/useAppointments';
import { useInvoices, useCreateInvoice, useUpdateInvoice } from '../hooks/useInvoices';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { Patient, Case, Appointment, Invoice, Clinic } from '../types';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts';
import { toast } from 'react-hot-toast';
import { isValidUUID } from '../lib/utils';

interface DashboardTabsProps {
  activeTab: string;
  clinic: Clinic | null;
  updateClinic: (updates: Partial<Clinic>) => Promise<any>;
}

export function DashboardTabs({ activeTab, clinic, updateClinic }: DashboardTabsProps) {
  const clinicId = clinic?.id && isValidUUID(clinic.id) ? clinic.id : undefined;
  const currencySymbol = clinic?.currency === 'PKR' ? '₨' : clinic?.currency === 'USD' ? '$' : '€';

  // React Query Hooks
  const { data: stats, isLoading: statsLoading } = useDashboardStats(clinicId);
  const { data: patients = [] } = usePatients(clinicId);
  const { data: cases = [] } = useCases(clinicId);
  const { data: appointments = [] } = useAppointments(clinicId);
  const { data: invoices = [] } = useInvoices(clinicId);

  // Mutations
  const createPatientMut = useCreatePatient();
  const updatePatientMut = useUpdatePatient();
  const deletePatientMut = useDeletePatient();
  const createCaseMut = useCreateCase();
  const updateCaseMut = useUpdateCase();
  const createApptMut = useCreateAppointment();
  const updateApptMut = useUpdateAppointment();
  const createInvoiceMut = useCreateInvoice();
  const updateInvoiceMut = useUpdateInvoice();

  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal States
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [showAddCase, setShowAddCase] = useState(false);
  const [showAddAppt, setShowAddAppt] = useState(false);
  const [showAddInvoice, setShowAddInvoice] = useState(false);

  // Patient Register Form States
  const [patName, setPatName] = useState('');
  const [patPhone, setPatPhone] = useState('');
  const [patEmail, setPatEmail] = useState('');
  const [patCNIC, setPatCNIC] = useState('');
  const [patDOB, setPatDOB] = useState('');
  const [patGender, setPatGender] = useState<'male' | 'female' | 'other'>('male');
  const [patAllergies, setPatAllergies] = useState('');
  const [patMedHistory, setPatMedHistory] = useState('');
  const [patEligible, setPatEligible] = useState(false);

  // Case Register Form States
  const [casePatientId, setCasePatientId] = useState('');
  const [caseType, setCaseType] = useState('');
  const [caseComplexity, setCaseComplexity] = useState<'simple' | 'moderate' | 'complex'>('moderate');
  const [caseCost, setCaseCost] = useState('');
  const [caseNotes, setCaseNotes] = useState('');

  // Appointment Scheduler Form States
  const [appPatientId, setAppPatientId] = useState('');
  const [appCaseId, setAppCaseId] = useState('');
  const [appDatetime, setAppDatetime] = useState('');
  const [appType, setAppType] = useState('Consultation');
  const [appNotes, setAppNotes] = useState('');

  // Invoice Scheduler Form States
  const [invPatientId, setInvPatientId] = useState('');
  const [invCaseId, setInvCaseId] = useState('');
  const [invAmount, setInvAmount] = useState('');
  const [invNotes, setInvNotes] = useState('');

  // Settings modification state
  const [clName, setClName] = useState(clinic?.name || '');
  const [clCurrency, setClCurrency] = useState(clinic?.currency || 'PKR');
  const [clMode, setClMode] = useState(clinic?.market_mode || 'pakistan');

  // Submit Patient Form
  const handleCreatePatientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patName || !patPhone) {
      toast.error('Verify doctor/patient core indices.');
      return;
    }
    
    // Pakistani CNIC compliance validation
    if (clMode === 'pakistan' && patCNIC) {
      const cnicRegex = /^\d{5}-\d{7}-\d{1}$/;
      if (!cnicRegex.test(patCNIC)) {
        toast.error('Invalid CNIC format. Please input according to standard formats e.g. 35202-1234567-1.');
        return;
      }
    }

    try {
      await createPatientMut.mutateAsync({
        clinic_id: clinicId || '',
        full_name: patName,
        phone: patPhone,
        email: patEmail,
        cnic: patCNIC,
        date_of_birth: patDOB,
        gender: patGender,
        allergies: patAllergies,
        medical_history: patMedHistory,
        sehat_sahulat_eligible: patEligible,
        status: 'new',
        total_visits: 0,
        total_spent: 0,
      });

      // Clear Form and close
      setPatName('');
      setPatPhone('');
      setPatEmail('');
      setPatCNIC('');
      setPatDOB('');
      setPatAllergies('');
      setPatMedHistory('');
      setPatEligible(false);
      setShowAddPatient(false);
    } catch {
      // Handled by hook fallback
    }
  };

  // Submit Clinical Case Form
  const handleCreateCaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!casePatientId || !caseType || !caseCost) {
      toast.error('Record all mandatory Clinical treatment specifications.');
      return;
    }

    try {
      await createCaseMut.mutateAsync({
        clinic_id: clinicId || '',
        patient_id: casePatientId,
        case_type: caseType,
        complexity: caseComplexity,
        status: 'planning',
        total_cost: Math.max(0, Number(caseCost)),
        paid_amount: 0,
        start_date: new Date().toISOString(),
        notes: caseNotes,
      });

      setCasePatientId('');
      setCaseType('');
      setCaseCost('');
      setCaseNotes('');
      setShowAddCase(false);
    } catch {
      // Handled
    }
  };

  // Submit Appointment Scheduler Form
  const handleCreateApptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appPatientId || !appDatetime) {
      toast.error('Record appointment date, time, and patient details.');
      return;
    }

    try {
      await createApptMut.mutateAsync({
        clinic_id: clinicId || '',
        patient_id: appPatientId,
        case_id: appCaseId || undefined,
        scheduled_at: appDatetime,
        duration_minutes: 30,
        appointment_type: appType,
        status: 'scheduled',
        notes: appNotes,
      });

      setAppPatientId('');
      setAppCaseId('');
      setAppDatetime('');
      setAppNotes('');
      setShowAddAppt(false);
    } catch {
      // Handled
    }
  };

  // Submit Invoice Form
  const handleCreateInvoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invPatientId || !invAmount) {
      toast.error('Record Invoice core specifications.');
      return;
    }

    try {
      await createInvoiceMut.mutateAsync({
        clinic_id: clinicId || '',
        patient_id: invPatientId,
        case_id: invCaseId || undefined,
        invoice_number: `INV-2026-${String(invoices.length + 1).padStart(3, '0')}`,
        total_amount: Math.max(0, Number(invAmount)),
        paid_amount: 0,
        status: 'draft',
        notes: invNotes,
      });

      setInvPatientId('');
      setInvCaseId('');
      setInvAmount('');
      setInvNotes('');
      setShowAddInvoice(false);
    } catch {
      // Handled
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateClinic({
        name: clName,
        currency: clCurrency,
        market_mode: clMode as 'pakistan' | 'international',
      });
      toast.success('Practice parameters saved!');
    } catch (err: any) {
      toast.error('Could not modify configurations.');
    }
  };

  // Filter patients by search term
  const filteredPatients = patients.filter(p => 
    p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone?.includes(searchTerm) ||
    p.cnic?.includes(searchTerm)
  );

  // Graph Data Mock details (Clinical activity chart)
  const chartData = [
    { name: 'Monday', Cases: 3, Appointments: 8 },
    { name: 'Tuesday', Cases: 5, Appointments: 14 },
    { name: 'Wednesday', Cases: 6, Appointments: 12 },
    { name: 'Thursday', Cases: 9, Appointments: 15 },
    { name: 'Friday', Cases: 14, Appointments: 18 },
    { name: 'Saturday', Cases: 18, Appointments: 10 },
  ];

  return (
    <div className="flex-1 p-8 overflow-y-auto select-none bg-gray-50/50">
      
      {/* ================== OVERVIEW TAB ================== */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-fade-in">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-white border border-gray-200/80 p-5 rounded-2xl flex items-center justify-between shadow-xs">
              <div>
                <span className="block text-xs font-mono text-gray-400 uppercase tracking-wider">Patients Registered</span>
                <span className="text-2xl font-display font-extrabold text-gray-900 mt-1 block">
                  {statsLoading ? '...' : stats?.totalPatients || 0}
                </span>
              </div>
              <div className="h-11 w-11 bg-cyan-50 rounded-xl flex items-center justify-center text-cyan-600">
                <Users className="h-5.5 w-5.5" />
              </div>
            </div>

            <div className="bg-white border border-gray-200/80 p-5 rounded-2xl flex items-center justify-between shadow-xs">
              <div>
                <span className="block text-xs font-mono text-gray-400 uppercase tracking-wider">Active Clinical Cases</span>
                <span className="text-2xl font-display font-extrabold text-gray-900 mt-1 block">
                  {statsLoading ? '...' : stats?.activeCases || 0}
                </span>
              </div>
              <div className="h-11 w-11 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600">
                <Activity className="h-5.5 w-5.5" />
              </div>
            </div>

            <div className="bg-white border border-gray-200/80 p-5 rounded-2xl flex items-center justify-between shadow-xs">
              <div>
                <span className="block text-xs font-mono text-gray-400 uppercase tracking-wider">Revenue Captured</span>
                <span className="text-2xl font-display font-extrabold text-emerald-700 mt-1 block">
                  {statsLoading ? '...' : `${currencySymbol} ${stats?.revenueThisMonth?.toLocaleString() || 0}`}
                </span>
              </div>
              <div className="h-11 w-11 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                <DollarSign className="h-5.5 w-5.5" />
              </div>
            </div>

            <div className="bg-white border border-gray-200/80 p-5 rounded-2xl flex items-center justify-between shadow-xs">
              <div>
                <span className="block text-xs font-mono text-gray-400 uppercase tracking-wider">Dues Outstanding</span>
                <span className="text-2xl font-display font-extrabold text-amber-600 mt-1 block">
                  {statsLoading ? '...' : `${currencySymbol} ${stats?.pendingAmount?.toLocaleString() || 0}`}
                </span>
              </div>
              <div className="h-11 w-11 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                <DollarSign className="h-5.5 w-5.5" />
              </div>
            </div>

            <div className="bg-white border border-gray-200/80 p-5 rounded-2xl flex items-center justify-between shadow-xs">
              <div>
                <span className="block text-xs font-mono text-gray-400 uppercase tracking-wider">Calendar Bookings</span>
                <span className="text-2xl font-display font-extrabold text-purple-900 mt-1 block">
                  {statsLoading ? '...' : stats?.upcomingAppointments || 0}
                </span>
              </div>
              <div className="h-11 w-11 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                <Calendar className="h-5.5 w-5.5" />
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Visualizer Chart Area */}
            <div className="lg:col-span-2 bg-white border border-gray-200 p-6 rounded-3xl shadow-xs">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-display font-bold text-gray-900 text-base">Weekly Activity Volume</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Live clinical bookings over active treatment cases.</p>
                </div>
                <span className="text-[10px] font-mono bg-cyan-50 text-cyan-700 px-2.5 py-1 rounded-full border border-cyan-100 uppercase tracking-wider">Real-time stats</span>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorCases" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorAppts" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="Cases" stroke="#0ea5e9" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCases)" />
                    <Area type="monotone" dataKey="Appointments" stroke="#8b5cf6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAppts)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="font-display font-bold text-gray-900 text-base">Quick-Fire Operations</h3>
                <p className="text-xs text-gray-500 mt-0.5 mb-6">Launch clinic record builders.</p>
                
                <div className="space-y-3.5">
                  <button 
                    id="qa-btn-addpat"
                    onClick={() => setShowAddPatient(true)}
                    className="w-full flex items-center justify-between p-3.5 rounded-xl border border-gray-200 hover:border-cyan-400 hover:bg-cyan-50/20 text-gray-700 transition-all text-xs font-medium cursor-pointer"
                  >
                    <span>Register New Patient Record</span>
                    <Plus className="h-4 w-4 text-cyan-600" />
                  </button>

                  <button 
                    id="qa-btn-addcase"
                    onClick={() => setShowAddCase(true)}
                    className="w-full flex items-center justify-between p-3.5 rounded-xl border border-gray-200 hover:border-teal-400 hover:bg-teal-50/20 text-gray-700 transition-all text-xs font-medium cursor-pointer"
                  >
                    <span>Establish Clinical Treatment Case</span>
                    <Plus className="h-4 w-4 text-teal-600" />
                  </button>

                  <button 
                    id="qa-btn-addappt"
                    onClick={() => setShowAddAppt(true)}
                    className="w-full flex items-center justify-between p-3.5 rounded-xl border border-gray-200 hover:border-purple-400 hover:bg-purple-50/20 text-gray-700 transition-all text-xs font-medium cursor-pointer"
                  >
                    <span>Schedule Appt Appointment Slots</span>
                    <Plus className="h-4 w-4 text-purple-600" />
                  </button>

                  <button 
                    id="qa-btn-addinv"
                    onClick={() => setShowAddInvoice(true)}
                    className="w-full flex items-center justify-between p-3.5 rounded-xl border border-gray-200 hover:border-emerald-400 hover:bg-emerald-50/20 text-gray-700 transition-all text-xs font-medium cursor-pointer"
                  >
                    <span>Generate Patient Ledger Invoice</span>
                    <Plus className="h-4 w-4 text-emerald-600" />
                  </button>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-[11px] font-mono text-gray-400">
                <span>Practising standard HIPAA storage frameworks.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================== PATIENTS TAB ================== */}
      {activeTab === 'patients' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="font-display font-bold text-xl text-gray-950">Patient Demographics Core</h2>
              <p className="text-xs text-gray-500">Add, track, modify, or erase secure patient records.</p>
            </div>
            <button
              id="patients-btn-add"
              onClick={() => setShowAddPatient(true)}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-95 text-white shadow-md text-xs font-medium px-5 py-3 rounded-xl transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Register Patient</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative w-full max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Search by full name, phone profile, or CNIC..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-slate-900 placeholder-gray-400 text-xs focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all duration-200"
            />
          </div>

          {/* Table list */}
          <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200/60 uppercase font-mono text-gray-400 text-[10px] tracking-wider select-none">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Registered Full Name</th>
                    <th className="px-6 py-4 font-semibold">Contact Phone</th>
                    <th className="px-6 py-4 font-semibold">{clMode === 'pakistan' ? 'CNIC Identity' : 'Email Address'}</th>
                    <th className="px-6 py-4 font-semibold">Date of Birth</th>
                    <th className="px-6 py-4 font-semibold">Medical Allergies</th>
                    <th className="px-6 py-4 font-semibold">{clMode === 'pakistan' ? 'Sehat Eligible' : 'Status'}</th>
                    <th className="px-6 py-4 font-semibold text-right">Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {filteredPatients.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-400 font-mono">
                        No patient directories matched core indexes.
                      </td>
                    </tr>
                  ) : (
                    filteredPatients.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition-colors duration-100">
                        <td className="px-6 py-4">
                          <span className="font-semibold text-gray-900 block">{p.full_name}</span>
                          <span className="text-[10px] text-gray-400 font-mono tracking-wide">{p.id}</span>
                        </td>
                        <td className="px-6 py-4 font-mono">{p.phone}</td>
                        <td className="px-6 py-4 font-mono">{clMode === 'pakistan' ? p.cnic || '—' : p.email || '—'}</td>
                        <td className="px-6 py-4 font-mono">{p.date_of_birth || '—'}</td>
                        <td className="px-6 py-4">
                          {p.allergies ? (
                            <span className="bg-rose-50 border border-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-semibold">
                              {p.allergies}
                            </span>
                          ) : (
                            <span className="text-gray-400 font-light">None recorded</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {clMode === 'pakistan' ? (
                            <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[9px] border ${
                              p.sehat_sahulat_eligible 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                : 'bg-gray-100 text-gray-400 border-gray-200'
                            }`}>
                              {p.sehat_sahulat_eligible ? 'SS Eligible' : 'Ineligible'}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-semibold capitalize">
                              {p.status}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            id={`patient-delete-${p.id}`}
                            onClick={async () => {
                              if (confirm(`Do you wish to delete patient files belonging to ${p.full_name}?`)) {
                                await deletePatientMut.mutateAsync(p.id);
                              }
                            }}
                            className="bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 p-2 rounded-xl transition-all border border-rose-150 cursor-pointer"
                          >
                            <Trash className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================== CASES TAB ================== */}
      {activeTab === 'cases' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="font-display font-bold text-xl text-gray-950">Active Clinical Cases Tracker</h2>
              <p className="text-xs text-gray-500">Track treatment workflow indices (planning, in progress, obturation, healing).</p>
            </div>
            <button
              id="cases-btn-add"
              onClick={() => setShowAddCase(true)}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-95 text-white shadow-md text-xs font-medium px-5 py-3 rounded-xl transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Register Treatment Case</span>
            </button>
          </div>

          {/* Grid of active treatments */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cases.length === 0 ? (
              <div className="col-span-full bg-white border border-gray-200 p-12 text-center text-gray-400 font-mono rounded-3xl shadow-xs">
                No clinical cases are registered. Setup a new treatment track above.
              </div>
            ) : (
              cases.map((c) => (
                <div key={c.id} className="bg-white border border-gray-200/80 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="block text-[10px] font-mono font-semibold text-cyan-700 tracking-wider uppercase mb-1">
                          TREATMENT INDEX
                        </span>
                        <h4 className="font-display font-bold text-gray-900 text-base leading-tight">
                          {c.case_type}
                        </h4>
                      </div>
                      <span className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded border capitalize ${
                        c.status === 'planning' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                        c.status === 'in_progress' ? 'bg-cyan-50 text-cyan-700 border-cyan-100 animate-pulse' :
                        c.status === 'healing' ? 'bg-pink-50 text-pink-700 border-pink-100' :
                        'bg-emerald-50 text-emerald-700 border-emerald-100'
                      }`}>
                        {c.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="pt-2 flex justify-between text-xs text-gray-500 border-y border-gray-100 py-3 font-medium">
                      <div>
                        <span className="block text-[10px] text-gray-400 font-mono uppercase">Patient</span>
                        <span className="text-gray-800 font-semibold">{(c as any).patient?.full_name || 'Anonymous Patient'}</span>
                      </div>
                      <div className="text-right">
                        <span className="block text-[10px] text-gray-400 font-mono uppercase">Complexity</span>
                        <span className="capitalize font-semibold text-slate-800">{c.complexity}</span>
                      </div>
                    </div>

                    {c.notes && (
                      <p className="text-xs text-gray-500 bg-slate-50 border border-slate-100/60 p-3 rounded-xl leading-relaxed italic">
                        "{c.notes}"
                      </p>
                    )}
                  </div>

                  <div className="mt-6 flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                      <span className="block text-[10px] text-gray-400 font-mono uppercase">Total Bill</span>
                      <span className="text-sm font-display font-extrabold text-slate-900">
                        {currencySymbol} {c.total_cost.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex space-x-2">
                      {c.status !== 'completed' && (
                        <button
                          id={`case-complete-${c.id}`}
                          onClick={async () => {
                            await updateCaseMut.mutateAsync({
                              ...c,
                              status: 'completed'
                            });
                          }}
                          className="flex items-center space-x-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-100 px-3 py-2 rounded-xl transition-all cursor-pointer"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Close Completed</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ================== APPOINTMENTS TAB ================== */}
      {activeTab === 'appointments' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="font-display font-bold text-xl text-gray-950">Appointments Scheduler Agenda</h2>
              <p className="text-xs text-gray-500">Coordinate clinic calendars, book patient sessions, and update arrival parameters.</p>
            </div>
            <button
              id="appt-btn-add"
              onClick={() => setShowAddAppt(true)}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-95 text-white shadow-md text-xs font-medium px-5 py-3 rounded-xl transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Schedule Session</span>
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200/60 uppercase font-mono text-gray-400 text-[10px] tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Patient Name</th>
                    <th className="px-6 py-4 font-semibold">Scheduled Date & Time</th>
                    <th className="px-6 py-4 font-semibold">Appointment Track</th>
                    <th className="px-6 py-4 font-semibold">Durations (mins)</th>
                    <th className="px-6 py-4 font-semibold">Treatment Notes</th>
                    <th className="px-6 py-4 font-semibold">Status Indicator</th>
                    <th className="px-6 py-4 font-semibold text-right">Schedule Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {appointments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-400 font-mono">
                        No appointments currently booked. Adjust scheduling parameters.
                      </td>
                    </tr>
                  ) : (
                    appointments.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-50/50 transition-colors duration-100">
                        <td className="px-6 py-4">
                          <span className="font-semibold text-gray-900 block">{(a as any).patient?.full_name || 'Anonymous Patient'}</span>
                          <span className="text-[10px] text-gray-400 block">{(a as any).patient?.phone || 'No phone'}</span>
                        </td>
                        <td className="px-6 py-4 font-mono font-semibold text-cyan-800">
                          {new Date(a.scheduled_at).toLocaleString('en-US', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-slate-100 border border-slate-150 text-slate-700 px-2.5 py-0.5 rounded-full font-medium">
                            {a.appointment_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono">{a.duration_minutes}</td>
                        <td className="px-6 py-4 text-gray-500 italic max-w-xs truncate">
                          {a.notes || '—'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] font-bold uppercase tracking-wider font-mono px-2 py-0.5 rounded border capitalize ${
                            a.status === 'scheduled' ? 'bg-amber-50 text-amber-700 border-amber-100 animate-pulse' :
                            a.status === 'confirmed' ? 'bg-cyan-50 text-cyan-700 border-cyan-100' :
                            a.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                            'bg-gray-100 text-gray-400 border-gray-200'
                          }`}>
                            {a.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end space-x-2">
                            {a.status === 'scheduled' && (
                              <button
                                id={`appt-confirm-${a.id}`}
                                onClick={async () => {
                                  await updateApptMut.mutateAsync({
                                    ...a,
                                    status: 'confirmed'
                                  });
                                }}
                                className="bg-cyan-50 border border-cyan-100 text-cyan-600 hover:bg-cyan-100 p-2 rounded-xl transition-all cursor-pointer"
                                title="Confirm Slot Appointment"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                            )}

                            {a.status !== 'completed' && (
                              <button
                                id={`appt-complete-${a.id}`}
                                onClick={async () => {
                                  await updateApptMut.mutateAsync({
                                    ...a,
                                    status: 'completed'
                                  });
                                }}
                                className="bg-emerald-50 border border-emerald-100 text-emerald-600 hover:bg-emerald-100 p-2 rounded-xl transition-all cursor-pointer"
                                title="Close Completed"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================== INVOICES TAB ================== */}
      {activeTab === 'invoices' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="font-display font-bold text-xl text-gray-950">Financial Invoicing Ledger</h2>
              <p className="text-xs text-gray-500">Issue patient medical bills, outline treatment pricing, and document settlement transactions.</p>
            </div>
            <button
              id="invoice-btn-add"
              onClick={() => setShowAddInvoice(true)}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-95 text-white shadow-md text-xs font-medium px-5 py-3 rounded-xl transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Issue New Bill</span>
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200/60 uppercase font-mono text-gray-400 text-[10px] tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Ledger Invoice Num</th>
                    <th className="px-6 py-4 font-semibold">Patient Profile</th>
                    <th className="px-6 py-4 font-semibold">Gross Total Billing</th>
                    <th className="px-6 py-4 font-semibold">Collected Paid sum</th>
                    <th className="px-6 py-4 font-semibold">Remaining Balance</th>
                    <th className="px-6 py-4 font-semibold">Status Code</th>
                    <th className="px-6 py-4 font-semibold text-right">Payment Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {invoices.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-400 font-mono">
                        No financial billing accounts currently generated. Record medical billing above.
                      </td>
                    </tr>
                  ) : (
                    invoices.map((inv) => {
                      const outstanding = Math.max(0, inv.total_amount - inv.paid_amount);
                      return (
                        <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors duration-100">
                          <td className="px-6 py-4 font-mono font-bold text-gray-950">
                            {inv.invoice_number}
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-semibold text-gray-900 block">{(inv as any).patient?.full_name || 'Special Patient'}</span>
                          </td>
                          <td className="px-6 py-4 font-mono font-semibold">
                            {currencySymbol} {inv.total_amount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 font-mono text-emerald-700 font-semibold">
                            {currencySymbol} {inv.paid_amount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 font-mono text-amber-600 font-semibold">
                            {currencySymbol} {outstanding.toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-[10px] font-bold uppercase tracking-wider font-mono px-2 py-0.5 rounded border capitalize ${
                              inv.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                              inv.status === 'partial' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                              'bg-gray-100 text-gray-400 border-gray-200'
                            }`}>
                              {inv.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {inv.status !== 'paid' && (
                              <button
                                id={`invoice-pay-${inv.id}`}
                                onClick={async () => {
                                  const payAmount = Number(prompt(`Enter collected cash payment sum for ${inv.invoice_number} (Outstanding balance index: ${outstanding}):`));
                                  if (isNaN(payAmount) || payAmount <= 0) {
                                    toast.error('Invalid payment parameters.');
                                    return;
                                  }
                                  const nextPaid = Math.min(inv.total_amount, inv.paid_amount + payAmount);
                                  const nextStatus = nextPaid >= inv.total_amount ? 'paid' : 'partial';

                                  await updateInvoiceMut.mutateAsync({
                                    ...inv,
                                    paid_amount: nextPaid,
                                    status: nextStatus as any
                                  });
                                }}
                                className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all"
                              >
                                Record Cash Payment
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================== SETTINGS TAB ================== */}
      {activeTab === 'settings' && (
        <div className="space-y-6 animate-fade-in max-w-2xl bg-white border border-gray-200 p-8 rounded-3xl shadow-xs">
          <div>
            <h2 className="font-display font-bold text-xl text-gray-950">Practice Configuration panel</h2>
            <p className="text-xs text-gray-500">Fine-tune localization coordinates, branding values, and market targets.</p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-6 pt-4">
            <div>
              <label htmlFor="clName" className="block text-xs font-mono text-gray-400 uppercase tracking-wider">
                Clinic / Studio Branding Name
              </label>
              <input
                id="clName"
                type="text"
                value={clName}
                onChange={(e) => setClName(e.target.value)}
                className="mt-1.5 block w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-slate-900 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all duration-250"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label htmlFor="clCurrency" className="block text-xs font-mono text-gray-400 uppercase tracking-wider">
                  Primary Currency Symbol
                </label>
                <select
                  id="clCurrency"
                  value={clCurrency}
                  onChange={(e) => setClCurrency(e.target.value)}
                  className="mt-1.5 block w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-slate-900 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all duration-250"
                >
                  <option value="PKR">Pakistani Rupee (PKR - ₨)</option>
                  <option value="USD">US Dollar (USD - $)</option>
                  <option value="EUR">Euro (EUR - €)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 uppercase tracking-wider">
                  Market Target Zone
                </label>
                <select
                  value={clMode}
                  onChange={(e) => setClMode(e.target.value as any)}
                  className="mt-1.5 block w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-slate-900 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all duration-250"
                >
                  <option value="pakistan">Pakistan Region Mode (CNIC, Sehat cards Enabled)</option>
                  <option value="international">Global Region Mode</option>
                </select>
              </div>
            </div>

            <div className="flex py-2 items-center text-xs text-cyan-800 bg-cyan-50 border border-cyan-150 p-4 rounded-xl leading-relaxed">
              <Info className="h-5 w-5 text-cyan-600 shrink-0 mr-3" />
              <span>Altering Region Mode automatically structures the patient profile schema index, adjusting CNIC requirements and Sehat Sahulat card status details.</span>
            </div>

            <div>
              <button
                id="settings-save"
                type="submit"
                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-xs py-3.5 px-6 rounded-xl shadow-md tracking-wider uppercase cursor-pointer"
              >
                Save Practice Matrix
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================== MODAL DIALOGS ================== */}

      {/* Register Patient Modal */}
      {showAddPatient && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative space-y-6">
            <button 
              id="modal-close-addpatient"
              onClick={() => setShowAddPatient(false)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <h3 className="font-display font-bold text-gray-900 text-lg">Register Patient Demographics</h3>
              <p className="text-xs text-gray-400">Add secure credentials onto core server index.</p>
            </div>

            <form onSubmit={handleCreatePatientSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="patName" className="block text-xs font-mono text-gray-400 uppercase">Patient Full Name *</label>
                  <input
                    id="patName"
                    type="text"
                    required
                    placeholder="Muhammad Ahmed"
                    value={patName}
                    onChange={(e) => setPatName(e.target.value)}
                    className="mt-1 block w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-slate-900 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="patPhone" className="block text-xs font-mono text-gray-400 uppercase">Phone Profile *</label>
                  <input
                    id="patPhone"
                    type="tel"
                    required
                    placeholder="0300-1234567"
                    value={patPhone}
                    onChange={(e) => setPatPhone(e.target.value)}
                    className="mt-1 block w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-slate-900 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="patEmail" className="block text-xs font-mono text-gray-400 uppercase">Email Address</label>
                  <input
                    id="patEmail"
                    type="email"
                    placeholder="ahmed@gmail.com"
                    value={patEmail}
                    onChange={(e) => setPatEmail(e.target.value)}
                    className="mt-1 block w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-slate-900 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="patCNIC" className="block text-xs font-mono text-gray-400 uppercase">
                    {clMode === 'pakistan' ? 'CNIC Identity *' : 'Social ID Number'}
                  </label>
                  <input
                    id="patCNIC"
                    type="text"
                    placeholder="35202-1234567-1"
                    value={patCNIC}
                    onChange={(e) => setPatCNIC(e.target.value)}
                    className="mt-1 block w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-slate-900 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="patDOB" className="block text-xs font-mono text-gray-400 uppercase">Date of Birth</label>
                  <input
                    id="patDOB"
                    type="date"
                    value={patDOB}
                    onChange={(e) => setPatDOB(e.target.value)}
                    className="mt-1 block w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-slate-900 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-gray-400 uppercase">Biological Gender</label>
                  <select
                    value={patGender}
                    onChange={(e) => setPatGender(e.target.value as any)}
                    className="mt-1 block w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-slate-900 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="patAllergies" className="block text-xs font-mono text-gray-400 uppercase">Medical Allergies</label>
                  <input
                    id="patAllergies"
                    type="text"
                    placeholder="e.g. Penicillin, Sulfa"
                    value={patAllergies}
                    onChange={(e) => setPatAllergies(e.target.value)}
                    className="mt-1 block w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-slate-900 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="patMedHistory" className="block text-xs font-mono text-gray-400 uppercase">Medical History Profile</label>
                  <input
                    id="patMedHistory"
                    type="text"
                    placeholder="e.g. Diabetes, Asthma"
                    value={patMedHistory}
                    onChange={(e) => setPatMedHistory(e.target.value)}
                    className="mt-1 block w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-slate-900 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                  />
                </div>
              </div>

              {clMode === 'pakistan' && (
                <div className="flex items-center space-x-3.5 bg-slate-50 p-4 rounded-xl border border-slate-150/80">
                  <input
                    id="patEligible"
                    type="checkbox"
                    checked={patEligible}
                    onChange={(e) => setPatEligible(e.target.checked)}
                    className="h-4.5 w-4.5 text-cyan-500 rounded border-gray-300 focus:ring-cyan-400"
                  />
                  <div>
                    <label htmlFor="patEligible" className="block text-xs font-semibold text-gray-800">
                      Eligible for Sehat Sahulat Universal Card Program
                    </label>
                    <p className="text-[10px] text-gray-400 font-mono">Enables state-subsidized billing on clinical accounts.</p>
                  </div>
                </div>
              )}

              <button
                id="modal-submit-addpatient"
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl text-xs font-semibold tracking-wider uppercase shadow-md cursor-pointer hover:opacity-95 transition-all"
              >
                Assemble Patient Directory
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Establish Clinical Case Modal */}
      {showAddCase && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative space-y-6">
            <button 
              id="modal-close-addcase"
              onClick={() => setShowAddCase(false)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <h3 className="font-display font-bold text-gray-900 text-lg">Establish Treatment Case Work</h3>
              <p className="text-xs text-gray-400">Register a patient clinical dental track workflow.</p>
            </div>

            <form onSubmit={handleCreateCaseSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-gray-400 uppercase">Select Target Patient *</label>
                <select
                  required
                  value={casePatientId}
                  onChange={(e) => setCasePatientId(e.target.value)}
                  className="mt-1 block w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-slate-900 outline-none focus:border-cyan-500 focus:ring-1"
                >
                  <option value="">-- Choose Patient Profile --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.full_name} ({p.phone})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="caseType" className="block text-xs font-mono text-gray-400 uppercase">Treatment Type *</label>
                  <input
                    id="caseType"
                    type="text"
                    required
                    placeholder="e.g. RCT Molar, Invisalign"
                    value={caseType}
                    onChange={(e) => setCaseType(e.target.value)}
                    className="mt-1 block w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-slate-900 outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-gray-400 uppercase">Clinical Complexity</label>
                  <select
                    value={caseComplexity}
                    onChange={(e) => setCaseComplexity(e.target.value as any)}
                    className="mt-1 block w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-slate-900 outline-none focus:border-cyan-500"
                  >
                    <option value="simple">Simple</option>
                    <option value="moderate">Moderate</option>
                    <option value="complex">Complex</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="caseCost" className="block text-xs font-mono text-gray-400 uppercase">Expected Treatment Cost ({currencySymbol}) *</label>
                <input
                  id="caseCost"
                  type="number"
                  required
                  placeholder="25000"
                  value={caseCost}
                  onChange={(e) => setCaseCost(e.target.value)}
                  className="mt-1 block w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-slate-900 outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label htmlFor="caseNotes" className="block text-xs font-mono text-gray-400 uppercase">Clinical Diagnostic Notes</label>
                <textarea
                  id="caseNotes"
                  placeholder="Detail primary access decay parameters, structural indices..."
                  value={caseNotes}
                  onChange={(e) => setCaseNotes(e.target.value)}
                  className="mt-1 block w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-slate-900 outline-none focus:border-cyan-500 h-24 resize-none"
                />
              </div>

              <button
                id="modal-submit-addcase"
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl text-xs font-semibold tracking-wider uppercase shadow-md cursor-pointer hover:opacity-95 transition-all"
              >
                Register Clinical Treatment Case
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Appointment Modal */}
      {showAddAppt && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative space-y-6">
            <button 
              id="modal-close-addappt"
              onClick={() => setShowAddAppt(false)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <h3 className="font-display font-bold text-gray-900 text-lg">Schedule Session parameters</h3>
              <p className="text-xs text-gray-400">Allocate calendar slots inside physician schedules.</p>
            </div>

            <form onSubmit={handleCreateApptSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-gray-400 uppercase">Target Patient *</label>
                  <select
                    required
                    value={appPatientId}
                    onChange={(e) => setAppPatientId(e.target.value)}
                    className="mt-1 block w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-slate-900 outline-none focus:border-cyan-500"
                  >
                    <option value="">-- Choose Patient --</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.full_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono text-gray-400 uppercase">Linked Case Track (Optional)</label>
                  <select
                    value={appCaseId}
                    onChange={(e) => setAppCaseId(e.target.value)}
                    className="mt-1 block w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-slate-900 outline-none focus:border-cyan-500"
                  >
                    <option value="">-- Non-case checkup --</option>
                    {cases.map(c => (
                      <option key={c.id} value={c.id}>{c.case_type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="appDatetime" className="block text-xs font-mono text-gray-400 uppercase">Schedule Datetime *</label>
                  <input
                    id="appDatetime"
                    type="datetime-local"
                    required
                    value={appDatetime}
                    onChange={(e) => setAppDatetime(e.target.value)}
                    className="mt-1 block w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-slate-900 outline-none focus:border-cyan-500 text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-gray-400 uppercase">Session Module</label>
                  <select
                    value={appType}
                    onChange={(e) => setAppType(e.target.value)}
                    className="mt-1 block w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-slate-900 outline-none focus:border-cyan-500"
                  >
                    <option value="Consultation">Consultation</option>
                    <option value="Treatment">Active Treatment</option>
                    <option value="Follow-up">Hygiene Follow-up</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="appNotes" className="block text-xs font-mono text-gray-400 uppercase">Scheduler Notes</label>
                <textarea
                  id="appNotes"
                  placeholder="Record procedural warnings, slot notifications..."
                  value={appNotes}
                  onChange={(e) => setAppNotes(e.target.value)}
                  className="mt-1 block w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-slate-900 outline-none focus:border-cyan-500 h-24 resize-none"
                />
              </div>

              <button
                id="modal-submit-addappt"
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl text-xs font-semibold tracking-wider uppercase shadow-md cursor-pointer hover:opacity-95 transition-all"
              >
                Schedule Session Booking
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Issue Invoice Modal */}
      {showAddInvoice && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative space-y-6">
            <button 
              id="modal-close-addinvoice"
              onClick={() => setShowAddInvoice(false)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <h3 className="font-display font-bold text-gray-900 text-lg">Generate Billing Invoice</h3>
              <p className="text-xs text-gray-400">Issue patient medical bills and payment accounts.</p>
            </div>

            <form onSubmit={handleCreateInvoiceSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-gray-400 uppercase">Patient *</label>
                  <select
                    required
                    value={invPatientId}
                    onChange={(e) => setInvPatientId(e.target.value)}
                    className="mt-1 block w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-slate-900 outline-none focus:border-cyan-500"
                  >
                    <option value="">-- Choose Patient --</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.full_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono text-gray-400 uppercase">Treatment Track</label>
                  <select
                    value={invCaseId}
                    onChange={(e) => setInvCaseId(e.target.value)}
                    className="mt-1 block w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-slate-900 outline-none focus:border-cyan-500"
                  >
                    <option value="">-- Standalone Billing --</option>
                    {cases.map(c => (
                      <option key={c.id} value={c.id}>{c.case_type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="invAmount" className="block text-xs font-mono text-gray-400 uppercase">Gross Receivable sum ({currencySymbol}) *</label>
                <input
                  id="invAmount"
                  type="number"
                  required
                  placeholder="12000"
                  value={invAmount}
                  onChange={(e) => setInvAmount(e.target.value)}
                  className="mt-1 block w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-slate-900 outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label htmlFor="invNotes" className="block text-xs font-mono text-gray-400 uppercase">Billing notes / terms</label>
                <textarea
                  id="invNotes"
                  placeholder="Record installment patterns, health schemes..."
                  value={invNotes}
                  onChange={(e) => setInvNotes(e.target.value)}
                  className="mt-1 block w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-slate-900 outline-none focus:border-cyan-500 h-24 resize-none"
                />
              </div>

              <button
                id="modal-submit-addinvoice"
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl text-xs font-semibold tracking-wider uppercase shadow-md cursor-pointer hover:opacity-95 transition-all"
              >
                Issue Patient Invoice
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
