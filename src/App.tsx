import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster, toast } from 'react-hot-toast';
import { useAuth } from './hooks/useAuth';
import { LandingPage } from './components/LandingPage';
import { AuthPage } from './components/AuthPage';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { DashboardTabs } from './components/DashboardTabs';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function AppContent() {
  const { user, profile, clinic, loading, login, signup, logout, updateClinic } = useAuth();
  const [view, setView] = useState<'landing' | 'auth' | 'app'>(user ? 'app' : 'landing');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [activeTab, setActiveTab] = useState('overview');

  // Adjust routing state dynamically on auth load
  React.useEffect(() => {
    if (!loading) {
      if (user) {
        setView('app');
      } else if (view === 'app') {
        setView('landing');
      }
    }
  }, [user, loading]);

  // Loading Splash Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white select-none">
        <div className="flex flex-col items-center space-y-6">
          <div className="h-16 w-16 bg-gradient-to-tr from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center animate-spin text-white">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
          </div>
          <div>
            <span className="font-display font-bold text-xl block bg-gradient-to-r from-cyan-400 to-blue-200 bg-clip-text text-transparent">
              DentalOS
            </span>
            <span className="text-xs text-slate-500 font-mono text-center block mt-1 uppercase tracking-widest">Warming engine</span>
          </div>
        </div>
      </div>
    );
  }

  // Routing Handler
  if (view === 'landing') {
    return (
      <LandingPage 
        onNavigateToAuth={(mode) => {
          setAuthMode(mode);
          setView('auth');
        }} 
      />
    );
  }

  if (view === 'auth') {
    return (
      <AuthPage 
        initialMode={authMode}
        onBack={() => setView('landing')}
        onLogin={login}
        onSignup={signup}
        onSuccess={() => setView('app')}
      />
    );
  }

  // Determine synced state based on environment setup parameters
  const isSupabaseSynced = !!(import.meta as any).env.VITE_SUPABASE_ANON_KEY;

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-900 overflow-hidden font-sans select-none">
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        profile={profile} 
        clinic={clinic} 
        onLogout={async () => {
          await logout();
          setView('landing');
          toast.success('Terminated Practice Session.');
        }} 
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar clinic={clinic} supabaseSynced={isSupabaseSynced} />
        <DashboardTabs activeTab={activeTab} clinic={clinic} updateClinic={updateClinic} />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: '#0f172a',
            color: '#fff',
            fontFamily: 'Inter, sans-serif',
            fontSize: '13px',
            borderRadius: '16px',
            border: '1px solid #1e293b'
          }
        }} 
      />
    </QueryClientProvider>
  );
}
