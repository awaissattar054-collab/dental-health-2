import { useState, ChangeEvent } from 'react';
import { Users, Search, Filter, Phone, Mail, MoreHorizontal, AlertCircle, CheckCircle, ArrowLeft, History, FileText, Activity, Calendar as CalendarIcon, ClipboardList, CreditCard, LayoutList, ChevronLeft, ChevronRight, Camera, Upload, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { Patient } from '../../types';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths 
} from 'date-fns';

const MOCK_PATIENTS: Patient[] = [
  { id: '1', name: 'James Wilson', email: 'james.w@example.com', phone: '(555) 123-4567', urgency: 'emergency', status: 'pending', createdAt: '2024-04-16T08:00:00Z' },
  { id: '2', name: 'Maria Garcia', email: 'm.garcia@example.com', phone: '(555) 987-6543', urgency: 'routine', status: 'scheduled', createdAt: '2024-04-15T14:30:00Z' },
  { id: '3', name: 'Robert Chen', email: 'rchen@example.com', phone: '(555) 456-7890', urgency: 'urgent', status: 'pending', createdAt: '2024-04-16T09:15:00Z' },
  { id: '4', name: 'Sarah Miller', email: 'sarah.m@example.com', phone: '(555) 321-0987', urgency: 'routine', status: 'completed', createdAt: '2024-04-14T11:00:00Z' },
];

const PATIENT_HISTORIES: Record<string, {
  appointments: { date: string, type: string, doctor: string }[];
  treatmentPlans: { item: string, status: 'Approved' | 'Pending' | 'Completed', cost: string }[];
  billing: { date: string, amount: string, status: 'Paid' | 'Unpaid' | 'Partial', invoiceId: string }[];
}> = {
  '1': {
    appointments: [
      { date: 'Nov 12, 2023', type: 'Routine Cleaning', doctor: 'Dr. Sterling' },
      { date: 'May 20, 2023', type: 'Filling (Tooth #14)', doctor: 'Dr. Sterling' }
    ],
    treatmentPlans: [
      { item: 'Deep Cleaning (SRP)', status: 'Approved', cost: '$450' },
      { item: 'Crown (Tooth #3)', status: 'Pending', cost: '$1,200' }
    ],
    billing: [
      { date: 'Nov 12, 2023', amount: '$150.00', status: 'Paid', invoiceId: 'INV-8821' },
      { date: 'May 20, 2023', amount: '$220.00', status: 'Paid', invoiceId: 'INV-7652' }
    ]
  },
  '2': {
    appointments: [
      { date: 'Mar 05, 2024', type: 'Consultation', doctor: 'Dr. Sterling' },
      { date: 'Dec 15, 2023', type: 'X-Ray Series', doctor: 'Dr. Miller' }
    ],
    treatmentPlans: [
      { item: 'Root Canal (Tooth #19)', status: 'Approved', cost: '$950' },
      { item: 'Night Guard', status: 'Completed', cost: '$300' }
    ],
    billing: [
      { date: 'Mar 05, 2024', amount: '$85.00', status: 'Paid', invoiceId: 'INV-9120' },
      { date: 'Dec 15, 2023', amount: '$150.00', status: 'Paid', invoiceId: 'INV-8211' }
    ]
  },
  '3': {
    appointments: [
      { date: 'Feb 10, 2024', type: 'Wisdom Tooth Consult', doctor: 'Dr. Sterling' }
    ],
    treatmentPlans: [
      { item: 'Wisdom Tooth Extraction', status: 'Pending', cost: '$1,800' }
    ],
    billing: [
      { date: 'Feb 10, 2024', amount: '$120.00', status: 'Paid', invoiceId: 'INV-8910' }
    ]
  },
  '4': {
    appointments: [
      { date: 'Apr 01, 2024', type: 'Annual Checkup', doctor: 'Dr. Miller' },
      { date: 'Oct 15, 2023', type: 'Routine Cleaning', doctor: 'Dr. Miller' },
      { date: 'Apr 10, 2023', type: 'Whitening Session', doctor: 'Dr. Sterling' }
    ],
    treatmentPlans: [
      { item: 'Veneers (Anterior)', status: 'Approved', cost: '$3,500' }
    ],
    billing: [
      { date: 'Apr 01, 2024', amount: '$120.00', status: 'Paid', invoiceId: 'INV-9001' },
      { date: 'Oct 15, 2023', amount: '$120.00', status: 'Paid', invoiceId: 'INV-8542' },
      { date: 'Apr 10, 2023', amount: '$450.00', status: 'Paid', invoiceId: 'INV-7123' }
    ]
  }
};

export default function PatientTriage() {
  const [patients, setPatients] = useState<Patient[]>(MOCK_PATIENTS);
  const [filter, setFilter] = useState<string>('all');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [patientPhotos, setPatientPhotos] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);

  const selectedPatient = patients.find(p => p.id === selectedPatientId);
  const selectedHistory = selectedPatientId ? PATIENT_HISTORIES[selectedPatientId] : null;

  const filteredPatients = patients.filter(p => 
    filter === 'all' ? true : p.urgency === filter
  );

  const scheduledPatients = patients.filter(p => p.status === 'scheduled');

  // Calendar Logic
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const handlePhotoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedPatientId) return;

    setIsUploading(true);
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPatientPhotos(prev => ({
        ...prev,
        [selectedPatientId]: reader.result as string
      }));
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <AnimatePresence mode="wait">
        {selectedPatient ? (
          <motion.div
            key="history-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSelectedPatientId(null)}
                className="p-2 hover:bg-card border border-border rounded-xl transition-all"
              >
                <ArrowLeft className="w-5 h-5 text-secondary" />
              </button>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Patient History</h1>
                <p className="text-secondary mt-1">Full clinical records for {selectedPatient.name}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-6">
                <div className="glass-card p-6 space-y-4">
                  <div className="relative group mx-auto w-fit">
                    <div className="w-24 h-24 bg-accent/10 rounded-3xl flex items-center justify-center text-accent border border-accent/20 overflow-hidden shadow-xl shadow-accent/5 ring-4 ring-background">
                      {patientPhotos[selectedPatient.id] ? (
                        <img 
                          src={patientPhotos[selectedPatient.id]} 
                          alt="Patient Profile" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <Users className="w-10 h-10" />
                      )}
                      
                      {isUploading && (
                        <div className="absolute inset-0 bg-background/80 flex items-center justify-center backdrop-blur-sm">
                          <Loader2 className="w-6 h-6 animate-spin text-accent" />
                        </div>
                      )}
                    </div>
                    
                    <label className="absolute -bottom-2 -right-2 bg-accent text-white p-2.5 rounded-2xl shadow-lg shadow-accent/20 cursor-pointer hover:scale-110 active:scale-95 transition-all border-2 border-background">
                      <Camera className="w-4 h-4" />
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handlePhotoUpload}
                      />
                    </label>
                  </div>
                  <div className="text-center space-y-1">
                    <h2 className="text-xl font-bold">{selectedPatient.name}</h2>
                    <p className="text-[10px] text-secondary font-mono tracking-widest uppercase py-1 px-2 bg-card rounded-lg border border-border w-fit mx-auto mt-2">Patient ID: {selectedPatient.id}</p>
                  </div>
                  <div className="space-y-3 pt-6 border-t border-border">
                    <div className="flex justify-between text-xs">
                      <span className="text-secondary">Email</span>
                      <span className="text-primary">{selectedPatient.email}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-secondary">Phone</span>
                      <span className="text-primary">{selectedPatient.phone}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-secondary">Last Visit</span>
                      <span className="text-primary">02/14/2024</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                  <p className="text-[10px] text-amber-500/80 leading-relaxed font-bold uppercase tracking-wider">
                    SYSTEM NOTE: This is a prototype view. Historical clinical data synchronization is currently offline.
                  </p>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-card p-4 rounded-xl border border-border flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">Imaging</p>
                      <p className="text-sm font-bold">X-Ray (Left Molar)</p>
                    </div>
                  </div>
                  <div className="bg-card p-4 rounded-xl border border-border flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">Vitals</p>
                      <p className="text-sm font-bold">Stable</p>
                    </div>
                  </div>
                </div>

                {/* Past Appointments */}
                <div className="glass-card overflow-hidden">
                  <div className="px-6 py-4 border-b border-border bg-card/50 flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-accent" />
                    <h3 className="text-xs font-bold uppercase tracking-widest">Past Appointments</h3>
                  </div>
                  <div className="divide-y divide-border">
                    {selectedHistory?.appointments.map((appt, i) => (
                      <div key={i} className="px-6 py-4 flex justify-between items-center hover:bg-accent/5 transition-colors">
                        <div>
                          <p className="text-sm font-bold">{appt.type}</p>
                          <p className="text-[10px] text-secondary uppercase tracking-wider">{appt.doctor}</p>
                        </div>
                        <p className="text-xs font-mono text-secondary">{appt.date}</p>
                      </div>
                    ))}
                    {(!selectedHistory || selectedHistory.appointments.length === 0) && (
                      <div className="px-6 py-8 text-center bg-card/10">
                        <p className="text-xs text-secondary italic">No appointment history found.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Active Treatment Plans */}
                <div className="glass-card overflow-hidden">
                  <div className="px-6 py-4 border-b border-border bg-card/50 flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-amber-500" />
                    <h3 className="text-xs font-bold uppercase tracking-widest">Treatment Plans</h3>
                  </div>
                  <div className="divide-y divide-border">
                    {selectedHistory?.treatmentPlans.map((plan, i) => (
                      <div key={i} className="px-6 py-4 flex justify-between items-center hover:bg-accent/5 transition-colors">
                        <div>
                          <p className="text-sm font-bold">{plan.item}</p>
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest",
                            plan.status === 'Approved' ? "bg-emerald-500/10 text-emerald-500" : 
                            plan.status === 'Completed' ? "bg-blue-500/10 text-blue-500" :
                            "bg-amber-500/10 text-amber-500"
                          )}>
                            {plan.status}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-primary">{plan.cost}</p>
                      </div>
                    ))}
                    {(!selectedHistory || selectedHistory.treatmentPlans.length === 0) && (
                      <div className="px-6 py-8 text-center bg-card/10">
                        <p className="text-xs text-secondary italic">No active treatment plans.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Billing History */}
                <div className="glass-card overflow-hidden">
                  <div className="px-6 py-4 border-b border-border bg-card/50 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-blue-500" />
                    <h3 className="text-xs font-bold uppercase tracking-widest">Billing Records</h3>
                  </div>
                  <div className="divide-y divide-border">
                    {selectedHistory?.billing.map((bill, i) => (
                      <div key={i} className="px-6 py-4 flex justify-between items-center hover:bg-accent/5 transition-colors">
                        <div>
                          <p className="text-[10px] text-secondary uppercase font-mono tracking-widest">Invoice #{bill.invoiceId}</p>
                          <p className="text-sm font-bold">{bill.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">{bill.amount}</p>
                          <p className="text-[9px] text-emerald-500 font-bold uppercase">
                            {bill.status}
                          </p>
                        </div>
                      </div>
                    ))}
                    {(!selectedHistory || selectedHistory.billing.length === 0) && (
                      <div className="px-6 py-8 text-center bg-card/10">
                        <p className="text-xs text-secondary italic">No billing records found.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="list-view"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-8"
          >
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Patient Lead Triage</h1>
                <p className="text-secondary mt-1">Intelligent categorization of incoming patient requests.</p>
              </div>
              <div className="flex gap-2">
                {['all', 'emergency', 'urgent', 'routine'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={cn(
                      "px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all border",
                      filter === f 
                        ? "bg-accent text-white border-accent shadow-lg shadow-accent/20" 
                        : "bg-card text-secondary border-border hover:border-accent/40"
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <div className="flex bg-card border border-border rounded-xl p-1 ml-4">
                <button 
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "p-1.5 rounded-lg transition-all",
                    viewMode === 'list' ? "bg-accent/10 text-accent" : "text-secondary hover:text-primary"
                  )}
                >
                  <LayoutList className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setViewMode('calendar')}
                  className={cn(
                    "p-1.5 rounded-lg transition-all",
                    viewMode === 'calendar' ? "bg-accent/10 text-accent" : "text-secondary hover:text-primary"
                  )}
                >
                  <CalendarIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {viewMode === 'list' ? (
              <div className="glass-card overflow-hidden">
                <div className="p-4 border-b border-border flex items-center justify-between bg-card/50">
                  <div className="flex items-center gap-3 px-3 py-1.5 bg-background rounded-xl w-1/3 border border-border">
                    <Search className="w-4 h-4 text-secondary" />
                    <input 
                      type="text" 
                      placeholder="Filter leads..." 
                      className="bg-transparent border-none text-sm focus:outline-none w-full text-primary"
                    />
                  </div>
                  <button className="p-2 text-secondary hover:text-primary transition-colors">
                    <Filter className="w-4 h-4" />
                  </button>
                </div>

                <table className="w-full text-left border-collapse">
                  <thead className="text-[10px] uppercase font-bold text-secondary bg-card">
                    <tr>
                      <th className="px-6 py-4 tracking-widest">Patient Info</th>
                      <th className="px-6 py-4 tracking-widest">Priority Status</th>
                      <th className="px-6 py-4 tracking-widest">Contact Details</th>
                      <th className="px-6 py-4 tracking-widest">Case Date</th>
                      <th className="px-6 py-4 text-right tracking-widest uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredPatients.map((patient) => (
                      <motion.tr 
                        layout
                        key={patient.id} 
                        className="hover:bg-accent/5 transition-colors group"
                      >
                        <td className="px-6 py-5">
                          <div 
                            className="cursor-pointer group/name"
                            onClick={() => setSelectedPatientId(patient.id)}
                          >
                            <p className="font-bold text-primary group-hover/name:text-accent group-hover/name:underline decoration-accent/30 underline-offset-4 transition-all">{patient.name}</p>
                            <p className="text-[10px] text-secondary uppercase font-mono mt-0.5">ID: {patient.id}</p>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border",
                              patient.urgency === 'emergency' ? "bg-rose-500/10 border-rose-500/20 text-rose-500" :
                              patient.urgency === 'urgent' ? "bg-amber-500/10 border-amber-500/20 text-amber-500" :
                              "bg-sky-500/10 border-sky-500/20 text-sky-500"
                            )}>
                              {patient.urgency}
                            </span>
                            {patient.status === 'scheduled' && (
                              <CheckCircle className="w-4 h-4 text-safe" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs text-secondary hover:text-accent cursor-pointer transition-colors">
                              <Phone className="w-3 h-3" />
                              {patient.phone}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-secondary hover:text-accent cursor-pointer transition-colors">
                              <Mail className="w-3 h-3" />
                              {patient.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-xs text-secondary font-mono">
                            {new Date(patient.createdAt).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <button className="p-2 text-secondary hover:text-accent transition-all hover:bg-accent/10 rounded-lg">
                            <MoreHorizontal className="w-5 h-5" />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>

                {filteredPatients.length === 0 && (
                  <div className="py-20 text-center space-y-4">
                    <Users className="w-12 h-12 text-slate-200 mx-auto" />
                    <p className="text-secondary font-medium">No patient leads found matching this criteria.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    {format(currentDate, 'MMMM yyyy')}
                  </h2>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                      className="p-2 hover:bg-card border border-border rounded-xl transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                      className="p-2 hover:bg-card border border-border rounded-xl transition-all"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-px bg-border rounded-2xl overflow-hidden border border-border">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="bg-card/50 p-4 text-[10px] font-bold uppercase tracking-widest text-secondary text-center">
                      {day}
                    </div>
                  ))}
                  {calendarDays.map((date, i) => {
                    const dayAppointments = scheduledPatients.filter(p => isSameDay(new Date(p.createdAt), date));
                    return (
                      <div 
                        key={i} 
                        className={cn(
                          "bg-background min-h-[140px] p-2 space-y-2",
                          !isSameMonth(date, monthStart) && "opacity-30"
                        )}
                      >
                        <p className={cn(
                          "text-xs font-mono ml-1",
                          isSameDay(date, new Date()) ? "text-accent font-bold" : "text-secondary"
                        )}>
                          {format(date, 'd')}
                        </p>
                        <div className="space-y-1">
                          {dayAppointments.map(patient => (
                            <div 
                              key={patient.id}
                              onClick={() => setSelectedPatientId(patient.id)}
                              className="px-2 py-1.5 bg-accent/10 border border-accent/20 rounded-lg cursor-pointer group hover:bg-accent/20 transition-all"
                            >
                              <p className="text-[10px] font-bold text-accent truncate">{patient.name}</p>
                              <p className="text-[9px] text-accent/60 font-mono">10:30 AM</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="glass-card p-6 border-l-4 border-rose-500 bg-rose-500/5">
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="w-5 h-5 text-rose-500" />
                  <h3 className="card-title text-rose-500">Urgent Action Required</h3>
                </div>
                <p className="text-sm text-secondary leading-relaxed">
                  There are <strong className="text-primary font-bold">2 emergency cases</strong> that haven't been responded to in the last 30 minutes. 
                  AI suggests immediate follow-up to prevent clinical escalation.
                </p>
                <button className="mt-4 text-[10px] font-bold text-rose-500 uppercase tracking-widest hover:text-rose-400 transition-colors">View Emergencies →</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
