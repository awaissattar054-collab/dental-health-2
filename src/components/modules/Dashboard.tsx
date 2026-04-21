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
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useStore } from '../../lib/store';
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
  const { patients, addPatient, searchQuery } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Modal Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    urgency: 'routine' as const,
    status: 'pending' as const,
  });

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    addPatient(formData);
    toast.success('Patient record added successfully!');
    setIsModalOpen(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      urgency: 'routine',
      status: 'pending',
    });
  };

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase gradient-text">Practice Intel</h1>
          <p className="text-secondary font-medium tracking-tight mt-1">Dr. Sterling • Clinical Performance Dashboard</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              setIsModalOpen(true);
              toast('Opening patient intake form', { icon: '📝' });
            }}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            Add Patient
          </button>
        </div>
      </div>

      {/* Top Level KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Revenue (MTD)', value: '$54,200', trend: '+12.5%', sub: 'vs last month', icon: DollarSign, color: 'text-accent' },
          { label: 'Active Patients', value: patients.length.toString(), trend: '+4%', sub: 'Real-time count', icon: Users, color: 'text-safe' },
          { label: 'Avg Case Value', value: '$2,850', trend: '+8.2%', sub: 'Optimized by AI', icon: TrendingUp, color: 'text-blue-400' },
          { label: 'Wait Time', value: '8.5m', trend: '-15%', sub: 'Improved throughput', icon: Clock, color: 'text-purple-400' },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6 group cursor-default"
          >
            <div className="flex justify-between items-start mb-6">
              <div className={cn("p-2 rounded-xl bg-background border border-white/5", stat.color)}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div className={cn(
                "flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full",
                stat.trend.startsWith('+') ? "bg-safe/10 text-safe" : "bg-urgent/10 text-urgent"
              )}>
                {stat.trend}
                <ArrowUpRight className="w-3 h-3" />
              </div>
            </div>
            <h3 className="text-3xl font-black tracking-tighter mb-1">{stat.value}</h3>
            <p className="text-[10px] font-black text-secondary uppercase tracking-[0.15em] mb-1">{stat.label}</p>
            <p className="text-[10px] text-secondary/40 font-medium">{stat.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Patient Table */}
        <div className="xl:col-span-8 glass-card overflow-hidden">
          <div className="p-8 border-b border-white/5 flex justify-between items-center">
            <div>
              <h2 className="card-title mb-0">Patient Registry</h2>
              <p className="text-xs text-secondary mt-1">
                {searchQuery ? `Searching: "${searchQuery}"` : 'Manage your practice directory'}
              </p>
            </div>
            <span className="text-[10px] font-black text-accent bg-accent/10 px-2 py-1 rounded-lg">
              {filteredPatients.length} RECORDS
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[10px] font-black text-secondary uppercase tracking-widest">
                  <th className="px-8 py-4">Patient Name</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4">Urgency</th>
                  <th className="px-8 py-4">Phone</th>
                  <th className="px-8 py-4 text-right">Action</th>
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
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-xs">
                            {patient.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold">{patient.name}</p>
                            <p className="text-[10px] text-secondary">{patient.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <span className={cn(
                          "text-[10px] font-black uppercase px-2 py-1 rounded-lg",
                          patient.status === 'completed' ? "bg-safe/10 text-safe" : "bg-accent/10 text-accent"
                        )}>
                          {patient.status}
                        </span>
                      </td>
                      <td className="px-8 py-4">
                        <span className={cn(
                          "text-[11px] font-bold",
                          patient.urgency === 'urgent' ? "text-urgent" : "text-secondary"
                        )}>
                          {patient.urgency === 'urgent' ? 'High' : 'Normal'}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-sm font-medium text-secondary">
                        {patient.phone}
                      </td>
                      <td className="px-8 py-4 text-right">
                        <button className="p-2 text-secondary hover:text-white transition-colors">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
                {filteredPatients.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center text-secondary">
                      <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      <p className="font-bold">No patients found matching your search</p>
                      <p className="text-sm">Try adjusting your filters or add a new record.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="xl:col-span-4 space-y-8">
          <div className="glass-card p-8">
            <h2 className="card-title">Analytics</h2>
            <div className="h-[200px] mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="revenue" stroke="var(--color-accent)" fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="glass-card p-8 bg-accent/5 border-accent/20">
            <h3 className="text-accent font-black uppercase text-[10px] tracking-widest mb-4">Quick Insights</h3>
            <p className="text-sm leading-relaxed font-medium">
              You have <span className="text-accent">4 new patients</span> joining this week. 
              Efficiency is up <span className="text-safe">12%</span> today due to automated reminders.
            </p>
            <button 
              onClick={() => toast.success('Insight report generated!')}
              className="mt-6 w-full py-2 rounded-xl bg-accent text-white font-bold text-xs transition-transform active:scale-95"
            >
              Generate AI Report
            </button>
          </div>
        </div>
      </div>

      {/* Add Patient Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-card w-full max-w-md relative z-10 overflow-hidden"
            >
              <div className="p-8 border-b border-white/5 flex justify-between items-center bg-card">
                <h2 className="text-xl font-black tracking-tighter uppercase">New Patient Intake</h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-lg text-secondary hove:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1 block">Full Name</label>
                    <input 
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent/50 transition-colors"
                      placeholder="e.g. John Doe"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1 block">Phone</label>
                      <input 
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent/50 transition-colors"
                        placeholder="(555) 000-0000"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1 block">Urgency</label>
                      <select 
                        value={formData.urgency}
                        onChange={(e) => setFormData({...formData, urgency: e.target.value as any})}
                        className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent/50 transition-colors"
                      >
                        <option value="routine">Routine</option>
                        <option value="urgent">Urgent</option>
                        <option value="emergency">Emergency</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1 block">Email Address</label>
                    <input 
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent/50 transition-colors"
                      placeholder="patient@example.com"
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 rounded-xl border border-white/10 font-bold text-sm hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-accent text-white font-bold text-sm hover:bg-accent-hover transition-colors shadow-lg shadow-accent/20"
                  >
                    Save Record
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
