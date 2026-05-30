import React from 'react';
import { Smile, LayoutDashboard, Users, Activity, Calendar, DollarSign, Settings, LogOut, User } from 'lucide-react';
import { Profile, Clinic } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  profile: Profile | null;
  clinic: Clinic | null;
  onLogout: () => void;
}

export function Sidebar({ activeTab, setActiveTab, profile, clinic, onLogout }: SidebarProps) {
  const menuItems = [
    { id: 'overview', name: 'Overview Panel', icon: LayoutDashboard },
    { id: 'patients', name: 'Patient Database', icon: Users },
    { id: 'cases', name: 'Clinical Case Planner', icon: Activity },
    { id: 'appointments', name: 'Scheduler Agenda', icon: Calendar },
    { id: 'invoices', name: 'Financial Invoicing', icon: DollarSign },
    { id: 'settings', name: 'Clinic Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-white flex flex-col h-screen select-none shrink-0">
      {/* Brand area */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800 space-x-3">
        <div className="bg-gradient-to-tr from-cyan-400 to-blue-600 p-1.5 rounded-xl shadow-lg">
          <Smile className="h-5 w-5 text-white" />
        </div>
        <div>
          <span className="font-display font-bold tracking-tight text-lg block bg-gradient-to-r from-cyan-400 to-blue-200 bg-clip-text text-transparent">
            DentalOS
          </span>
          <span className="text-[10px] text-slate-500 font-mono tracking-wider uppercase">Practitioner Suite</span>
        </div>
      </div>

      {/* Practitioner identity */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/40">
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-full bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
            <User className="h-4.5 w-4.5" />
          </div>
          <div className="overflow-hidden">
            <span className="text-xs font-semibold text-slate-200 block truncate leading-none">
              {profile?.full_name || 'Dr. Administrator'}
            </span>
            <span className="text-[9px] text-slate-500 block font-mono truncate uppercase mt-0.5">
              {clinic?.name || 'Bright Smiles Studio'}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation items */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              id={`sidebar-item-${item.id}`}
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-xs font-medium tracking-wide transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/10 border-l-4 border-cyan-400 text-cyan-300'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* Action footer (Logout) */}
      <div className="p-4 border-t border-slate-800">
        <button
          id="sidebar-logout"
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-xs font-mono text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 transition-all duration-150 cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span>TERMINATE SESSION</span>
        </button>
      </div>
    </aside>
  );
}
