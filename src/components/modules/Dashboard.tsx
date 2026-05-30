import { useState } from 'react';
import { 
  Calendar, 
  ShieldCheck, 
  DollarSign, 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  ArrowUpRight, 
  Clock, 
  MoreHorizontal, 
  Plus, 
  X,
  Search,
  CheckCircle2,
  Trash2,
  UploadCloud,
  FileCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { ResponsiveContainer, AreaChart, Area, Tooltip } from 'recharts';
import { useStore } from '../../lib/store';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const revenueData = [
  { name: 'Mon', revenue: 4000 },
  { name: 'Tue', revenue: 5200 },
  { name: 'Wed', revenue: 3800 },
  { name: 'Thu', revenue: 6100 },
  { name: 'Fri', revenue: 4900 },
  { name: 'Sat', revenue: 2500 },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { patients, addPatient, removePatient, searchQuery } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  
  // Modal Form State aligned with Pakistani dental market
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '+92 ',
    cnic: '',
    dob: '',
    gender: 'Male',
    address: '',
    notes: '',
    urgency: 'routine' as const,
    status: 'pending' as const,
  });

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.phone && p.phone.includes(searchQuery)) ||
    (p.cnic && p.cnic.includes(searchQuery))
  );

  // Auto formats CNIC string as typed: 12345-1234567-1
  const handleCnicChange = (val: string) => {
    const clean = val.replace(/\D/g, '');
    let formatted = clean;
    if (clean.length > 5 && clean.length <= 12) {
      formatted = `${clean.slice(0, 5)}-${clean.slice(5)}`;
    } else if (clean.length > 12) {
      formatted = `${clean.slice(0, 5)}-${clean.slice(5, 12)}-${clean.slice(12, 13)}`;
    }
    setFormData(prev => ({ ...prev, cnic: formatted }));
  };

  // Safe phone numbering
  const handlePhoneChange = (val: string) => {
    let formatted = val;
    if (!formatted.startsWith('+92 ')) {
      const numeric = formatted.replace(/\D/g, '');
      const suffix = numeric.startsWith('92') ? numeric.slice(2) : numeric;
      formatted = '+92 ' + suffix;
    }
    setFormData(prev => ({ ...prev, phone: formatted }));
  };

  // Mock document parsing on drop/upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setTimeout(() => {
        setIsUploading(false);
        setUploadedFileName(file.name);
        toast.success(`CNIC scanned: Document "${file.name}" recognized and parsed!`);
        // Mock autofill based on filename
        setFormData(prev => ({
          ...prev,
          cnic: '35201-8974533-5',
          gender: 'Female',
          address: 'Gulberg III, Lahore, Pakistan',
          notes: 'CNIC scanner autofilled location & CNIC ID.'
        }));
      }, 1500);
    }
  };

  const handleDeletePatient = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete patient "${name}"?`)) {
      removePatient(id);
      toast.success(`Deleted patient record for "${name}"`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.replace('+92 ', '').trim()) {
      toast.error('Patient Name and Phone Number are required.');
      return;
    }

    if (formData.cnic && !/^\d{5}-\d{7}-\d{1}$/.test(formData.cnic)) {
      toast.error('Please specify a valid 13-digit CNIC in formats like 35201-1234567-1');
      return;
    }

    // Call store action
    addPatient({
      name: formData.name,
      email: formData.email || 'no-email@practice.com',
      phone: formData.phone,
      urgency: formData.urgency,
      status: formData.status,
      cnic: formData.cnic,
      dob: formData.dob,
      gender: formData.gender,
      address: formData.address,
      notes: formData.notes,
      cnicFile: uploadedFileName || undefined
    });

    toast.success(`Patient "${formData.name}" added to list!`);
    setIsModalOpen(false);
    setUploadedFileName(null);
    setFormData({
      name: '',
      email: '',
      phone: '+92 ',
      cnic: '',
      dob: '',
      gender: 'Male',
      address: '',
      notes: '',
      urgency: 'routine',
      status: 'pending',
    });
  };

  // Handle clickable KPI navigations
  const handleKpiClick = (type: string) => {
    if (type === 'revenue') {
      navigate('/dashboard/growth');
      toast.success('Navigating to Clinical Revenue analysis');
    } else if (type === 'patients') {
      document.getElementById('patient-registry-card')?.scrollIntoView({ behavior: 'smooth' });
      toast.success('Viewing patient database registry');
    } else if (type === 'case-value') {
      navigate('/dashboard/cases');
      toast.success('Navigating to Patient Restorations & Cases');
    } else if (type === 'wait-time') {
      navigate('/dashboard/receptionist');
      toast.success('Opening virtual conversational receptionist');
    }
  };

  return (
    <div className="p-3 lg:p-4 space-y-6 max-w-[1600px] mx-auto pb-24 lg:pb-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black tracking-tighter uppercase gradient-text">Practice Intel</h1>
          <p className="text-secondary font-medium tracking-tight mt-1">Dr. Sterling • Clinical Performance (PKR & USD)</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
          <button 
            onClick={() => {
              setIsModalOpen(true);
              toast('Opening dental intake register', { icon: '📝' });
            }}
            className="btn-primary w-full md:w-auto flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Patient
          </button>
        </div>
      </div>

      {/* Top Level KPIs - 2x2 on Mobile/Tablet, 4 columns on Desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { id: 'revenue', label: 'Revenue (MTD)', value: 'PKR 12.5M', trend: '+12.5%', sub: 'vs last month', icon: DollarSign, color: 'text-accent' },
          { id: 'patients', label: 'Active Patients', value: patients.length.toString(), trend: '+4%', sub: 'Ecosystem total', icon: Users, color: 'text-safe' },
          { id: 'case-value', label: 'Avg Case Value', value: 'PKR 85,000', trend: '+8.2%', sub: 'Optimized by AI', icon: TrendingUp, color: 'text-blue-400' },
          { id: 'wait-time', label: 'Avg Wait Time', value: '8.5 Min', trend: '-15%', sub: 'Improved scheduling', icon: Clock, color: 'text-purple-400' },
        ].map((stat) => (
          <motion.div 
            key={stat.id}
            whileHover={{ scale: 1.02 }}
            onClick={() => handleKpiClick(stat.id)}
            className="glass-card p-4 md:p-6 group cursor-pointer hover:border-accent/40 active:scale-95 transition-all"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={cn("p-1.5 md:p-2 rounded-xl bg-background border border-white/5", stat.color)}>
                <stat.icon className="w-4 h-4 md:w-5 md:h-5" />
              </div>
              <div className={cn(
                "flex items-center gap-0.5 text-[8px] md:text-[10px] font-black px-1.5 md:px-2 py-0.5 rounded-full",
                stat.trend.startsWith('+') ? "bg-safe/10 text-safe" : "bg-urgent/10 text-urgent"
              )}>
                {stat.trend}
                <ArrowUpRight className="w-2.5 h-2.5" />
              </div>
            </div>
            <h3 className="text-xl md:text-3xl font-black tracking-tighter mb-0.5">{stat.value}</h3>
            <p className="text-[8px] md:text-[10px] font-black text-secondary uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-[8px] md:text-[9px] text-secondary/40 font-medium">{stat.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">
        
        {/* Patient Registry Card */}
        <div id="patient-registry-card" className="xl:col-span-8 glass-card overflow-hidden">
          <div className="p-5 lg:p-6 border-b border-white/5 flex justify-between items-center bg-card/10">
            <div>
              <h2 className="card-title mb-0.5">Patient Registry</h2>
              <p className="text-xs text-secondary">
                {searchQuery ? `Searching for "${searchQuery}"` : 'Manage your local practice directory'}
              </p>
            </div>
            <span className="text-[9px] md:text-[10px] font-black text-accent bg-accent/10 px-2 py-1 rounded-lg">
              {filteredPatients.length} CLINICAL RECORDS
            </span>
          </div>
          
          {/* Mobile representation (<768px): Card layout */}
          <div className="md:hidden p-4 space-y-4 max-h-[600px] overflow-y-auto w-full">
            {filteredPatients.map((patient) => (
              <div key={patient.id} className="p-4 rounded-xl border border-white/5 bg-white/[0.01] space-y-3 relative group">
                <div className="flex items-center justify-between">
                  {/* Name + email */}
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center font-bold text-xs text-accent">
                      {patient.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-primary">{patient.name}</h4>
                      <p className="text-[10px] text-secondary break-all">{patient.email}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <button 
                    onClick={() => handleDeletePatient(patient.id, patient.name)}
                    className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                    title="Delete Patient"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>

                {/* Patient specifics */}
                <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-white/5 text-center text-[10px]">
                  <div>
                    <span className="block text-[8px] font-black tracking-widest text-secondary uppercase">Status</span>
                    <span className={cn(
                      "inline-block rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase mt-1",
                      patient.status === 'completed' ? "bg-safe/10 text-safe" : "bg-accent/10 text-accent"
                    )}>
                      {patient.status}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[8px] font-black tracking-widest text-secondary uppercase">Priority</span>
                    <span className={cn(
                      "block font-bold mt-1.5",
                      patient.urgency === 'urgent' ? "text-urgent" : "text-secondary"
                    )}>
                      {patient.urgency === 'urgent' ? 'High' : 'Normal'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[8px] font-black tracking-widest text-secondary uppercase">Phone</span>
                    <span className="block font-medium text-secondary truncate mt-1.5">{patient.phone}</span>
                  </div>
                </div>

                {/* Additional localization parameters if filled */}
                {(patient.cnic || patient.gender) && (
                  <div className="pt-2 text-[9px] text-secondary/70 flex justify-between border-t border-dashed border-white/5">
                    {patient.cnic && <span>CNIC: {patient.cnic}</span>}
                    {patient.gender && <span>Gender: {patient.gender}</span>}
                  </div>
                )}
              </div>
            ))}

            {filteredPatients.length === 0 && (
              <div className="py-12 text-center text-secondary">
                <Search className="w-10 h-10 mx-auto opacity-10 mb-2" />
                <p className="font-bold">No patients identified</p>
                <p className="text-xs">Refine search criteria or add new record.</p>
              </div>
            )}
          </div>

          {/* Tablet & Desktop representation (>=768px): Table layout */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[9px] font-black text-secondary uppercase tracking-widest bg-card/5">
                  <th className="px-6 py-4">Patient Details</th>
                  <th className="px-6 py-4">CNIC / ID</th>
                  <th className="px-6 py-4">Clinical Status</th>
                  <th className="px-6 py-4">Urgency</th>
                  <th className="px-6 py-4">Phone Number</th>
                  <th className="px-6 py-4 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence>
                  {filteredPatients.map((patient) => (
                    <motion.tr 
                      key={patient.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="group hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-800 border border-white/5 flex items-center justify-center font-bold text-xs">
                            {patient.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-primary">{patient.name}</p>
                            <p className="text-[10px] text-secondary">{patient.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-secondary">
                        {patient.cnic || 'Non-Specified'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "text-[9px] font-black uppercase px-2 py-0.5 rounded-md",
                          patient.status === 'completed' ? "bg-safe/20 text-safe border border-safe/20" : "bg-accent/10 text-accent border border-accent/20"
                        )}>
                          {patient.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "text-[10px] font-bold",
                          patient.urgency === 'urgent' ? "text-urgent" : "text-secondary"
                        )}>
                          {patient.urgency === 'urgent' ? 'High' : 'Normal'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-secondary">
                        {patient.phone}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleDeletePatient(patient.id, patient.name)}
                          className="p-1.5 text-secondary hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                          title="Delete Patient Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
                {filteredPatients.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center text-secondary">
                      <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      <p className="font-bold">No patients identified</p>
                      <p className="text-sm">Refine your search parameters or insert a new clinical record.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="xl:col-span-4 space-y-6 lg:space-y-8">
          <div className="glass-card p-6 lg:p-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="card-title">Analytics</h2>
              <span className="text-[8px] border border-white/5 px-2 py-0.5 rounded font-mono uppercase text-secondary">PKR MTD</span>
            </div>
            
            {/* Fully responsive container */}
            <div className="h-[200px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 5, left: 5, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.35}/>
                      <stop offset="95%" stopColor="#00E5FF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#131A26', borderColor: '#1E293B', borderRadius: '12px' }}
                    labelStyle={{ color: '#00E5FF', fontWeight: 'bold', fontSize: '11px' }}
                    itemStyle={{ color: '#fff', fontSize: '11px' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#00E5FF" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="glass-card p-6 lg:p-8 bg-accent/5 border-accent/20">
            <h3 className="text-accent font-black uppercase text-[10px] tracking-widest mb-4">Quick Insights</h3>
            <p className="text-sm leading-relaxed font-medium">
              You have <span className="text-accent">4 new patients</span> joining this week. 
              Efficiency is up <span className="text-safe">12%</span> today due to automated reminders.
            </p>
            <button 
              onClick={() => toast.success('Ecosystem report finalized!')}
              className="mt-6 w-full py-3 rounded-xl bg-accent text-white font-bold text-xs hover:bg-blue-600 transition-transform active:scale-95"
            >
              Generate AI Report
            </button>
          </div>
        </div>
      </div>

      {/* Add Patient Modal: transforms into responsive bottom sheet on mobile */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6">
            
            {/* Backdrop wrapper */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            
            {/* Modal Box / Bottom Sheet Wrapper */}
            <motion.div 
              initial={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.95, y: 20 }}
              animate={isMobile ? { y: 0 } : { opacity: 1, scale: 1, y: 0 }}
              exit={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className={cn(
                "bg-card w-full max-h-[92vh] sm:max-h-none overflow-y-auto relative z-10 border-t sm:border border-white/10 shadow-2xl",
                "sm:max-w-2xl sm:rounded-2xl rounded-t-3xl"
              )}
            >
              {/* Form header */}
              <div className="p-6 md:p-8 border-b border-white/5 flex justify-between items-center sticky top-0 bg-card/95 backdrop-blur-md z-30">
                <div>
                  <h2 className="text-xl font-black tracking-tighter uppercase text-primary">Add Patient Record</h2>
                  <p className="text-[10px] font-bold text-accent uppercase tracking-widest mt-1">DentalOS • Lahore Practice Hub Locale</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-full text-secondary hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Responsive intake form */}
              <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
                
                {/* Visual Section Break */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase text-secondary tracking-widest border-b border-white/5 pb-2">1. Demographic Identification</h3>
                  
                  {/* Row: Name and Email */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1.5 block">Full Patient Name *</label>
                      <input 
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent/50 text-primary placeholder-secondary transition-colors"
                        placeholder="e.g., Sarah Jenkins"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1.5 block">Email Address (Optional)</label>
                      <input 
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent/50 text-primary placeholder-secondary transition-colors"
                        placeholder="e.g., patient@domain.pk"
                      />
                    </div>
                  </div>

                  {/* Row: Phone (+92 prefix formatting) and CNIC (with hyphens) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1.5 block">Mobile Phone Number *</label>
                      <input 
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-accent/50 text-primary transition-colors"
                        placeholder="+92 300 1234567"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1.5 block">CNIC / ID (13 Digits)</label>
                      <input 
                        type="text"
                        value={formData.cnic}
                        onChange={(e) => handleCnicChange(e.target.value)}
                        className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-accent/50 text-primary transition-colors"
                        placeholder="35201-1234567-1"
                        maxLength={15}
                      />
                    </div>
                  </div>

                  {/* Row: Date of Birth and Gender */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1.5 block">Date of Birth</label>
                      <input 
                        type="date"
                        value={formData.dob}
                        onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                        className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent/50 text-primary transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1.5 block">Gender Selector</label>
                      <select 
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent/50 text-secondary transition-colors"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Field: Address */}
                  <div>
                    <label className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1.5 block">Residential Address (Pakistan)</label>
                    <input 
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent/50 text-primary placeholder-secondary transition-colors"
                      placeholder="e.g., sector, block, house or local society in city"
                    />
                  </div>
                </div>

                {/* Section: Clinical & Scans */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-black uppercase text-secondary tracking-widest border-b border-white/5 pb-2">2. Clinical Prioritization & Document Upload</h3>
                  
                  {/* Row: Intake Urgency & Patient Status */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1.5 block">Clinical Prioritization</label>
                      <select 
                        value={formData.urgency}
                        onChange={(e) => setFormData({...formData, urgency: e.target.value as any})}
                        className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent/50 text-secondary transition-colors"
                      >
                        <option value="routine">Routine Checkup / Scaling</option>
                        <option value="urgent">Urgent Pain / RCT</option>
                        <option value="emergency">Severe Swelling / Trauma</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1.5 block">Initial Case Status</label>
                      <select 
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                        className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent/50 text-secondary transition-colors"
                      >
                        <option value="pending">Pending Examination (Consult)</option>
                        <option value="scheduled">Scheduled Treatment / Case Lock</option>
                        <option value="completed">Completed / Discharged</option>
                      </select>
                    </div>
                  </div>

                  {/* ID Scan File upload (CNIC/Insurance Card) */}
                  <div>
                    <label className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1.5 block">
                      ID Document / CNIC Scan Upload (Drag & Drop or Click)
                    </label>
                    <div className="relative border border-dashed border-white/10 hover:border-accent/40 rounded-2xl p-6 bg-background/50 hover:bg-white/[0.02] transition-all flex flex-col items-center justify-center text-center cursor-pointer">
                      <input 
                        type="file" 
                        accept="image/*,.pdf" 
                        onChange={handleFileUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full"
                      />
                      {isUploading ? (
                        <div className="space-y-2">
                          <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
                          <p className="text-xs text-accent font-black">AI Extracting CNIC Demographics...</p>
                        </div>
                      ) : uploadedFileName ? (
                        <div className="space-y-2">
                          <FileCheck className="w-10 h-10 text-safe mx-auto animate-bounce" />
                          <p className="text-xs text-safe font-bold">Successfully Documented!</p>
                          <p className="text-[10px] text-secondary font-mono bg-background px-2 py-0.5 rounded inline-block max-w-[200px] truncate">{uploadedFileName}</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <UploadCloud className="w-10 h-10 text-secondary mx-auto" />
                          <p className="text-xs font-bold text-primary">Upload CNIC Card Front/Back</p>
                          <p className="text-[10px] text-secondary">Supports PNG, JPG, JPEG, and PDF up to 10MB</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1.5 block">Clinical Chief Complaints & Notes</label>
                    <textarea 
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent/50 text-primary placeholder-secondary transition-colors h-24 resize-none"
                      placeholder="e.g., Experiencing severe tooth pain in lower right molar, bleeding gums, or other clinical summaries..."
                    />
                  </div>
                </div>

                {/* Submit buttons */}
                <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="w-full sm:flex-1 py-3.5 rounded-xl border border-white/10 font-bold text-sm hover:bg-white/5 active:scale-[0.98] transition-all min-h-[44px]"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="w-full sm:flex-1 py-3.5 rounded-xl bg-accent text-white font-bold text-sm hover:bg-opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-accent/20 min-h-[44px]"
                  >
                    Save Clinical Record
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
