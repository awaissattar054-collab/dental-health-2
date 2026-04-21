import { Calendar, ShieldCheck, DollarSign, Users, AlertTriangle, TrendingUp, ArrowUpRight, Clock, MoreHorizontal } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const revenueData = [
  { name: 'Mon', revenue: 4000, newPatients: 12 },
  { name: 'Tue', revenue: 5200, newPatients: 15 },
  { name: 'Wed', revenue: 3800, newPatients: 10 },
  { name: 'Thu', revenue: 6100, newPatients: 22 },
  { name: 'Fri', revenue: 4900, newPatients: 18 },
  { name: 'Sat', revenue: 2500, newPatients: 8 },
];

export default function Dashboard() {
  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* Header with High-Precision Stats */}
      <div className="flex flex-col md:row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight tracking-tighter uppercase gradient-text">Practice Intel</h1>
          <p className="text-secondary font-medium tracking-tight mt-1 truncate">Dr. Sterling • Clinical Performance Dashboard</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-3 overflow-hidden">
            {[1, 2, 3, 4].map(i => (
              <img 
                key={i}
                className="inline-block h-8 w-8 rounded-full ring-2 ring-background bg-slate-800"
                src={`https://picsum.photos/seed/${i + 20}/32/32`}
                alt="Support Staff"
              />
            ))}
            <div className="flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-background bg-accent text-[10px] font-bold text-white uppercase">
              +2
            </div>
          </div>
          <button className="btn-primary">
            <Clock className="w-4 h-4" />
            Set Availability
          </button>
        </div>
      </div>

      {/* Top Level KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Revenue (MTD)', value: '$54,200', trend: '+12.5%', sub: 'vs last month', icon: DollarSign, color: 'text-accent' },
          { label: 'Active Patients', value: '1,284', trend: '+4%', sub: 'New +12 this week', icon: Users, color: 'text-safe' },
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

      {/* Main Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Revenue Analytics Chart */}
        <div className="lg:col-span-12 xl:col-span-8 glass-card p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
            <div>
              <h2 className="card-title">Revenue & Patient Trends</h2>
              <p className="text-xs text-secondary mt-1">Daily clinical output across all practitioners</p>
            </div>
            <div className="flex gap-2 p-1 bg-background border border-white/5 rounded-xl">
              <button className="px-3 py-1.5 text-[10px] font-black uppercase rounded-lg bg-accent text-white">Daily</button>
              <button className="px-3 py-1.5 text-[10px] font-black uppercase rounded-lg text-secondary hover:text-white">Monthly</button>
            </div>
          </div>
          
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748B', fontSize: 10, fontWeight: 700 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748B', fontSize: 10, fontWeight: 700 }}
                  tickFormatter={(val) => `$${val/1000}k`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '12px', fontSize: '12px' }}
                  itemStyle={{ color: '#F1F5F9' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="var(--color-accent)" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Action Center / Smart Tasks */}
        <div className="lg:col-span-12 xl:col-span-4 glass-card p-8 bg-gradient-to-br from-card to-background">
          <h2 className="card-title">Priority Appointments</h2>
          <div className="space-y-4">
            {[
              { name: 'Sarah Jenkins', type: 'Root Canal', time: '09:00 AM', status: 'Confirmed', icon: Clock, color: 'text-accent' },
              { name: 'Marcus Aurelius', type: 'Extraction', time: '10:30 AM', status: 'Urgent', icon: AlertTriangle, color: 'text-urgent' },
              { name: 'Alice Freeman', type: 'Hygiene', time: '11:45 AM', status: 'Arrived', icon: ShieldCheck, color: 'text-safe' },
              { name: 'Derek Shepherd', type: 'Consult', time: '02:00 PM', status: 'Pending', icon: Users, color: 'text-amber-400' },
            ].map((appt, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-all group border border-transparent hover:border-white/5">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center bg-background border border-white/5", appt.color)}>
                  <appt.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-bold truncate">{appt.name}</p>
                    <span className="text-[10px] font-black text-secondary">{appt.time}</span>
                  </div>
                  <p className="text-[10px] text-secondary/60 font-bold uppercase tracking-widest mt-0.5">{appt.type}</p>
                </div>
                <button className="p-2 text-secondary hover:text-white">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          
          <div className="mt-10 pt-10 border-t border-white/5">
            <h4 className="text-[10px] font-black text-secondary uppercase tracking-widest mb-6">Staff Performance</h4>
            <div className="space-y-4">
              {[
                { name: 'Dr. STERLING', score: 98, role: 'Lead Dentist' },
                { name: 'M. SCOTT', score: 82, role: 'Dental Assistant' },
              ].map((staff, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold">{staff.name}</span>
                      <span className="text-[10px] text-secondary font-medium tracking-tight uppercase">{staff.role}</span>
                    </div>
                    <span className="text-xs font-black text-accent">{staff.score}%</span>
                  </div>
                  <div className="h-1 w-full bg-background rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${staff.score}%` }}
                      className="h-full bg-accent"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
