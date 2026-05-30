import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { Zap, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        }
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || 'Google sign-in failed');
    }
  };

  return (
    <div className="min-h-screen pt-24 md:pt-32 pb-12 px-4 flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-accent/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[100px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-card p-8 md:p-10 border-white/5 relative z-10"
      >
        <div className="flex flex-col items-center text-center mb-10">
          <Link to="/" className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-accent/20 transition-transform hover:scale-105">
            <Zap className="text-white w-7 h-7 fill-current" />
          </Link>
          <h1 className="text-3xl font-black tracking-tight mb-2">Welcome Back</h1>
          <p className="text-secondary text-sm">Access your clinic's intelligent dashboard</p>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-5">
          <div className="space-y-4">
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/50 group-focus-within:text-accent transition-colors" />
              <input
                required
                type="email"
                placeholder="Work Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 pl-12 pr-4 bg-background border border-border rounded-xl focus:ring-2 focus:ring-accent transition outline-none text-sm"
              />
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/50 group-focus-within:text-accent transition-colors" />
              <input
                required
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 pl-12 pr-4 bg-background border border-border rounded-xl focus:ring-2 focus:ring-accent transition outline-none text-sm"
              />
            </div>
          </div>

          <button
            disabled={isLoading}
            type="submit"
            className="w-full h-12 bg-accent text-white rounded-xl font-bold hover:bg-blue-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent/20 active:scale-[0.98] disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Log In'}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-secondary/50 font-bold tracking-widest">Or continue with</span>
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          type="button"
          className="w-full h-12 border border-border bg-background rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-white/5 transition-all text-sm"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
          Sign in with Google
        </button>

        <p className="mt-8 text-center text-sm text-secondary">
          Don't have an account?{' '}
          <Link to="/signup" className="text-accent font-bold hover:underline">
            Start Free Trial
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
