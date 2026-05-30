import React, { useState, useEffect, useRef } from 'react';
// @ts-ignore AnimatePresence is exported from motion/react
import { motion, AnimatePresence } from 'motion/react';
import { X, Loader2, Calendar, User, Building2, Mail, Phone, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { saveDemoRequest } from '../lib/demoService';

interface BookDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BookDemoModal({ isOpen, onClose }: BookDemoModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    clinicName: '',
    email: '',
    phone: '',
    preferredDate: '',
  });

  // Handle Body Scroll Lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Trap focus
      firstInputRef.current?.focus();
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle Escape Key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await saveDemoRequest(formData);
      if (result.success) {
        setIsSuccess(true);
        toast.success('Demo Request Submitted!');
        setTimeout(() => {
          onClose();
          setIsSuccess(false);
          setFormData({ name: '', clinicName: '', email: '', phone: '', preferredDate: '' });
        }, 3000);
      }
    } catch (error) {
      toast.error('Submission failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-black/60 backdrop-blur-sm transition-all"
          onClick={handleBackdropClick}
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-xl bg-card border border-border md:rounded-3xl shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]"
          >
            {/* Sticky Header */}
            <div className="sticky top-0 z-20 p-6 border-b border-border flex items-center justify-between shrink-0 bg-card/80 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 id="modal-title" className="text-xl font-bold text-primary">Book Clinical Demo</h3>
                  <p className="text-xs text-secondary">See DentalOS in action for your clinic.</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-accent/10 rounded-full transition-colors group"
                id="close-modal-btn"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-secondary group-hover:text-accent" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto flex-1 custom-scrollbar">
              <div className="p-6 md:p-8">
                {isSuccess ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-12 text-center space-y-4"
                  >
                    <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
                      <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h4 className="text-2xl font-bold text-primary">Request Received!</h4>
                    <p className="text-secondary max-w-xs mx-auto">
                      A clinical specialist will reach out within 24 hours to confirm your session.
                    </p>
                  </motion.div>
                ) : (
                  <form id="demo-form" onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-5">
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/50 group-focus-within:text-accent transition-colors" />
                        <input
                          ref={firstInputRef}
                          required
                          type="text"
                          placeholder="Full Name"
                          value={formData.name}
                          onChange={e => setFormData({ ...formData, name: e.target.value })}
                          className="w-full h-14 pl-12 pr-4 bg-background border border-border rounded-xl focus:ring-2 focus:ring-accent transition outline-none text-sm"
                        />
                      </div>
                      <div className="relative group">
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/50 group-focus-within:text-accent transition-colors" />
                        <input
                          required
                          type="text"
                          placeholder="Clinic Name"
                          value={formData.clinicName}
                          onChange={e => setFormData({ ...formData, clinicName: e.target.value })}
                          className="w-full h-14 pl-12 pr-4 bg-background border border-border rounded-xl focus:ring-2 focus:ring-accent transition outline-none text-sm"
                        />
                      </div>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/50 group-focus-within:text-accent transition-colors" />
                        <input
                          required
                          type="email"
                          placeholder="Work Email"
                          value={formData.email}
                          onChange={e => setFormData({ ...formData, email: e.target.value })}
                          className="w-full h-14 pl-12 pr-4 bg-background border border-border rounded-xl focus:ring-2 focus:ring-accent transition outline-none text-sm"
                        />
                      </div>
                      <div className="relative group">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/50 group-focus-within:text-accent transition-colors" />
                        <input
                          required
                          type="tel"
                          placeholder="Phone Number"
                          value={formData.phone}
                          onChange={e => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full h-14 pl-12 pr-4 bg-background border border-border rounded-xl focus:ring-2 focus:ring-accent transition outline-none text-sm"
                        />
                      </div>
                      <div className="relative group shadow-sm shadow-accent/5">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/50 group-focus-within:text-accent transition-colors" />
                        <input
                          required
                          type="date"
                          value={formData.preferredDate}
                          onChange={e => setFormData({ ...formData, preferredDate: e.target.value })}
                          className="w-full h-14 pl-12 pr-4 bg-background border border-border rounded-xl focus:ring-2 focus:ring-accent transition outline-none text-sm"
                        />
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Sticky Footer */}
            {!isSuccess && (
              <div className="sticky bottom-0 z-20 p-6 border-t border-border bg-card/80 backdrop-blur-md flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 h-12 border border-border text-secondary rounded-xl font-bold hover:bg-white/5 transition-all outline-none focus:ring-2 focus:ring-border"
                >
                  Cancel
                </button>
                <button
                  form="demo-form"
                  disabled={isLoading}
                  type="submit"
                  className="flex-[2] h-12 bg-accent text-white rounded-xl font-bold hover:bg-blue-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent/20 cursor-pointer active:scale-[0.98] outline-none focus:ring-2 focus:ring-accent"
                  id="submit-demo-btn"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Scheduling...
                    </>
                  ) : (
                    'Confirm Registration'
                  )}
                </button>
              </div>
            )}

            {isSuccess && (
              <div className="p-6 border-t border-border bg-card text-center">
                <button 
                  onClick={onClose}
                  className="w-full h-12 bg-accent text-white rounded-xl font-bold"
                >
                  Close
                </button>
              </div>
            )}
            
            {/* Bottom Disclaimer */}
            {!isSuccess && (
              <div className="bg-card px-8 pb-4">
                <p className="text-[10px] text-center text-secondary leading-relaxed">
                  By clicking confirm, you agree to our Terms of Service and Privacy Policy. We process data under HIPAA guidelines.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
