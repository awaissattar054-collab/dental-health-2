import React from 'react';
import { Shield, Sparkles, AlertCircle, RefreshCw, Layers } from 'lucide-react';
import { Clinic } from '../types';

interface NavbarProps {
  clinic: Clinic | null;
  supabaseSynced: boolean;
}

export function Navbar({ clinic, supabaseSynced }: NavbarProps) {
  return (
    <header className="h-16 border-b border-gray-200 bg-white shadow-xs px-6 flex items-center justify-between shrink-0 select-none">
      <div className="flex items-center space-x-3">
        <h1 className="font-display font-bold text-gray-900 tracking-tight text-lg">
          {clinic?.name || 'Bright Smiles Dental Clinic'}
        </h1>
        {clinic?.market_mode && (
          <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full font-bold tracking-wider ${
            clinic.market_mode === 'pakistan' 
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
              : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
          }`}>
            {clinic.market_mode === 'pakistan' ? 'Pakistan Sector' : 'Global Sector'}
          </span>
        )}
      </div>

      <div className="flex items-center space-x-4">
        {/* Realtime / Database Sync status indicator */}
        <div className={`hidden sm:flex items-center space-x-2 text-xs font-mono px-3.5 py-1.5 rounded-xl border ${
          supabaseSynced 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
            : 'bg-amber-50 text-amber-800 border-amber-200'
        }`}>
          <span className={`w-2 h-2 rounded-full ${supabaseSynced ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400 animate-pulse'}`}></span>
          <span className="font-semibold">{supabaseSynced ? 'SUPABASE BACKEND ONLINE' : 'LOCAL FALLBACK DEV DATA'}</span>
        </div>

        {/* Security level badge */}
        <div className="flex items-center space-x-1.5 text-xs text-cyan-800 bg-cyan-50 border border-cyan-100 px-3 py-1.5 rounded-xl font-mono">
          <Shield className="h-4 w-4 text-cyan-600" />
          <span className="font-bold">AES-256</span>
        </div>
      </div>
    </header>
  );
}
