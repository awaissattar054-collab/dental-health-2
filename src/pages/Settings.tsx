import React, { useState } from 'react';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Shield, 
  Smartphone,
  Save,
  Loader2,
  Building,
  User,
  Globe,
  Coins
} from 'lucide-react';
import { motion } from 'motion/react';
import { useStore } from '../lib/store';
import { updateReminderSettings } from '../lib/api';
import { useClinic, CurrencyType, MarketModeType } from '../context/ClinicContext';
import toast from 'react-hot-toast';

export default function Settings() {
  const { reminderSettings, setReminderSettings } = useStore();
  const { 
    clinicName, 
    practiceName, 
    currency, 
    marketMode, 
    setClinicName, 
    setPracticeName, 
    setCurrency, 
    setMarketMode 
  } = useClinic();

  const [isSaving, setIsSaving] = useState(false);
  
  // Local state for immediate typing responsiveness
  const [internalClinicName, setInternalClinicName] = useState(clinicName);
  const [internalPracticeName, setInternalPracticeName] = useState(practiceName);

  const handleToggleReminders = async (enabled: boolean) => {
    setReminderSettings({ enabled });
  };

  const handleToggleChannel = (channel: 'email' | 'sms') => {
    const channels = reminderSettings.channels.includes(channel)
      ? reminderSettings.channels.filter(c => c !== channel)
      : [...reminderSettings.channels, channel];
    setReminderSettings({ channels });
  };

  const handleToggleTiming = (time: '24h' | '1h') => {
    const advanceReminders = reminderSettings.advanceReminders.includes(time)
      ? reminderSettings.advanceReminders.filter(t => t !== time)
      : [...reminderSettings.advanceReminders, time];
    setReminderSettings({ advanceReminders });
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      // Sync personalization inputs to Context/localStorage
      setClinicName(internalClinicName);
      setPracticeName(internalPracticeName);
      
      // Save reminders to simulated API
      await updateReminderSettings(reminderSettings);
      toast.success('All preferences saved successfully');
    } catch (error) {
      toast.error('An error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-primary">Settings</h1>
        <p className="text-secondary mt-2">Manage your clinic preferences, localization, and automated systems</p>
      </div>

      <div className="space-y-6">
        {/* Clinic Personalization Section */}
        <section className="glass-card p-6 md:p-8 border-white/5 space-y-6">
          <div className="flex items-center gap-4 border-b border-white/5 pb-4">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center">
              <Building className="text-indigo-500 w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-primary">Clinic Branding & Profile</h2>
              <p className="text-sm text-secondary">Set clinic and dentist titles for dashboards and printables</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-secondary flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                Principal Dentist / Owner Name
              </label>
              <input 
                type="text" 
                value={internalClinicName}
                onChange={(e) => setInternalClinicName(e.target.value)}
                placeholder="e.g. Dr. Saqib Minhas"
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:border-accent text-sm font-semibold transition outline-none text-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-secondary flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5" />
                Clinic / Practice Name
              </label>
              <input 
                type="text" 
                value={internalPracticeName}
                onChange={(e) => setInternalPracticeName(e.target.value)}
                placeholder="e.g. Saqib Dental Clinic"
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:border-accent text-sm font-semibold transition outline-none text-primary"
              />
            </div>
          </div>
        </section>

        {/* Global Market Mode & Currency Localization */}
        <section className="glass-card p-6 md:p-8 border-white/5 space-y-8">
          <div className="flex items-center gap-4 border-b border-white/5 pb-4">
            <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center">
              <Globe className="text-amber-500 w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-primary">Market Specifics & Currency</h2>
              <p className="text-sm text-secondary">Toggle Pakistan localized features or use international standards</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Market Mode */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-secondary flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                Active Market Optimization
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setMarketMode('Pakistan');
                    setCurrency('PKR');
                  }}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    marketMode === 'Pakistan'
                      ? 'border-accent bg-accent/5 ring-1 ring-accent/30 text-primary'
                      : 'border-border bg-slate-850 text-secondary hover:bg-slate-800'
                  }`}
                >
                  <p className="font-extrabold text-sm text-primary">Pakistan Mode</p>
                  <p className="text-[10px] text-secondary mt-1 leading-relaxed">CNIC scans, Pakistani treatments (PK-XX), PKR Lakh/Crore formatting</p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMarketMode('International');
                    setCurrency('USD');
                  }}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    marketMode === 'International'
                      ? 'border-accent bg-accent/5 ring-1 ring-accent/30 text-primary'
                      : 'border-border bg-slate-850 text-secondary hover:bg-slate-800'
                  }`}
                >
                  <p className="font-extrabold text-sm text-primary">International</p>
                  <p className="text-[10px] text-secondary mt-1 leading-relaxed">Insurance OCR scans, American CDT code listings, USD formatting</p>
                </button>
              </div>
            </div>

            {/* Currency */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-secondary flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5" />
                Dashboard Base Currency
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {(['PKR', 'USD', 'AED', 'GBP'] as CurrencyType[]).map((cur) => (
                  <button
                    key={cur}
                    type="button"
                    onClick={() => setCurrency(cur)}
                    className={`py-3 px-4 rounded-xl border font-bold text-sm transition-all text-center ${
                      currency === cur
                        ? 'border-accent bg-accent/5 text-accent ring-1 ring-accent/30'
                        : 'border-border bg-slate-850 text-secondary hover:bg-slate-800'
                    }`}
                  >
                    {cur === 'PKR' && 'PKR — ₨'}
                    {cur === 'USD' && 'USD — $'}
                    {cur === 'AED' && 'AED — د.إ'}
                    {cur === 'GBP' && 'GBP — £'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Automated Reminders Section */}
        <section className="glass-card p-6 md:p-8 border-white/5 space-y-8">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center">
                <Bell className="text-blue-500 w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-primary">Automated Reminders</h2>
                <p className="text-sm text-secondary">Reduce no-shows with smart patient notifications</p>
              </div>
            </div>
            <button 
              onClick={() => handleToggleReminders(!reminderSettings.enabled)}
              className={`relative w-14 h-7 rounded-full transition-colors duration-200 outline-none ${
                reminderSettings.enabled ? 'bg-accent' : 'bg-slate-700'
              }`}
            >
              <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                reminderSettings.enabled ? 'translate-x-7' : 'translate-x-0'
              }`} />
            </button>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 pt-2 transition-opacity duration-300 ${
            reminderSettings.enabled ? 'opacity-100' : 'opacity-40 pointer-events-none'
          }`}>
            {/* Communication Channels */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-secondary">Channels</h3>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-4 bg-background border border-border rounded-xl cursor-pointer hover:border-accent/50 transition-colors text-primary">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-secondary" />
                    <span className="font-bold text-sm">Email Reminders</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={reminderSettings.channels.includes('email')}
                    onChange={() => handleToggleChannel('email')}
                    className="w-5 h-5 rounded border-border bg-slate-800 text-accent focus:ring-accent"
                  />
                </label>
                <label className="flex items-center justify-between p-4 bg-background border border-border rounded-xl cursor-pointer hover:border-accent/50 transition-colors text-primary">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-secondary" />
                    <span className="font-bold text-sm">SMS Notifications</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={reminderSettings.channels.includes('sms')}
                    onChange={() => handleToggleChannel('sms')}
                    className="w-5 h-5 rounded border-border bg-slate-800 text-accent focus:ring-accent"
                  />
                </label>
              </div>
            </div>

            {/* Timing */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-secondary">Timing</h3>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-4 bg-background border border-border rounded-xl cursor-pointer hover:border-accent/50 transition-colors text-primary">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-secondary" />
                    <span className="font-bold text-sm">24 Hours Before</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={reminderSettings.advanceReminders.includes('24h')}
                    onChange={() => handleToggleTiming('24h')}
                    className="w-5 h-5 rounded border-border bg-slate-800 text-accent focus:ring-accent"
                  />
                </label>
                <label className="flex items-center justify-between p-4 bg-background border border-border rounded-xl cursor-pointer hover:border-accent/50 transition-colors text-primary">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-secondary" />
                    <span className="font-bold text-sm">1 Hour Before</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={reminderSettings.advanceReminders.includes('1h')}
                    onChange={() => handleToggleTiming('1h')}
                    className="w-5 h-5 rounded border-border bg-slate-800 text-accent focus:ring-accent"
                  />
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* Security / System */}
        <section className="glass-card p-6 md:p-8 border-white/5">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
              <Shield className="text-emerald-500 w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-primary">System Integrity</h2>
              <p className="text-sm text-secondary">Security and performance audit logs</p>
            </div>
          </div>
          <button className="text-sm font-bold text-accent hover:underline">Download Audit Logs</button>
        </section>

        {/* Save Button Container */}
        <div className="flex justify-end pt-4">
          <button 
            onClick={saveSettings}
            disabled={isSaving}
            className="flex items-center gap-2 px-8 py-3 bg-accent text-white rounded-xl font-black shadow-lg shadow-accent/20 hover:bg-blue-600 transition-all disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save All Changes
          </button>
        </div>
      </div>
    </div>
  );
}
