import React from 'react';
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  MoreVertical,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { motion } from 'motion/react';
import { useStore } from '../lib/store';

const data = [
  { name: 'Mon', revenue: 4000, patients: 24 },
  { name: 'Tue', revenue: 3000, patients: 18 },
  { name: 'Wed', revenue: 4500, patients: 32 },
  { name: 'Thu', revenue: 2780, patients: 21 },
  { name: 'Fri', revenue: 4890, patients: 28 },
  { name: 'Sat', revenue: 2390, patients: 12 },
  { name: 'Sun', revenue: 0, patients: 0 },
];

export default function Dashboard() {
  const { patients } = useStore();

  const stats = [
    { label: 'Total Patients', value: '2,842', change: '+12.5%', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Appointments', value: '42', change: '+18.2%', icon: Calendar, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Revenue', value: '$45,231', change: '+4.3%', icon: DollarSign, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Growth', value: '24%', change: '-2.1%', icon: TrendingUp, color: 'text-rose-500', bg: 'bg-rose-500/10', negative: true },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6 border-white/5"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className={`flex items-center gap-1 text-sm font-bold ${stat.negative ? 'text-rose-500' : 'text-emerald-500'}`}>
                {stat.negative ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                {stat.change}
              </div>
            </div>
            <h3 className="text-secondary text-sm font-bold uppercase tracking-widest">{stat.label}</h3>
            <p className="text-3xl font-black mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 glass-card p-6 md:p-8 border-white/5">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold">Revenue Analytics</h3>
              <p className="text-sm text-secondary">Weekly performance overview</p>
            </div>
            <select className="bg-background border border-border rounded-lg px-3 py-1 text-xs font-bold outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }} 
                  tickFormatter={(val) => `$${val/1000}k`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Patient Volume */}
        <div className="glass-card p-6 md:p-8 border-white/5">
          <h3 className="text-xl font-bold mb-8">Patient Volume</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }} 
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                />
                <Bar dataKey="patients" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Appointments */}
      <div className="glass-card border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-xl font-bold">Recent Appointments</h3>
          <button className="text-accent text-sm font-bold hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-secondary text-xs font-bold uppercase tracking-widest">
                <th className="px-6 py-4">Patient</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Time</th>
                <th className="px-6 py-4">Reminders</th>
                <th className="px-6 py-4">Procedure</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {patients.slice(0, 5).map((patient) => (
                <tr key={patient.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold">
                        {patient.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold">{patient.name}</p>
                        <p className="text-xs text-secondary">{patient.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      patient.urgency === 'urgent' 
                        ? 'bg-rose-500/10 text-rose-500' 
                        : 'bg-emerald-500/10 text-emerald-500'
                    }`}>
                      {patient.urgency === 'urgent' ? <AlertCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                      {patient.urgency}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-secondary">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      09:30 AM
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                      <span className="text-[10px] font-bold text-secondary uppercase tracking-tight">Scheduled</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">Root Canal Therapy</td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                      <MoreVertical className="w-4 h-4 text-secondary" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
