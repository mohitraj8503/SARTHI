'use client';

import React, { useState } from 'react';
import { X, Mail, User, ShieldCheck } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ToastProvider';

interface InviteTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InviteTeacherModal = ({ isOpen, onClose }: InviteTeacherModalProps) => {
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'invite', ...formData }),
      });

      if (!res.ok) throw new Error('Failed to send invite');

      addToast({
        type: 'success',
        title: 'Invitation Dispatched',
        message: `Instructor invite sent to ${formData.email} successfully.`,
      });

      queryClient.invalidateQueries({ queryKey: ['admin-teachers'] });
      onClose();
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Network Error',
        message: 'Unable to communicate with the faculty node.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-sm">
      <div className="absolute inset-0 bg-[#0F172A]/40" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden animate-zoom-in">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-500 to-orange-500" />
        
        <div className="p-12">
          <div className="flex items-center justify-between mb-10">
            <div className="space-y-1">
              <h2 className="text-3xl font-black text-[#0F172A] tracking-tighter uppercase">Invite <span className="text-amber-500">Instructor</span></h2>
              <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Enroll new faculty into the ecosystem</p>
            </div>
            <button onClick={onClose} className="p-3 hover:bg-slate-50 rounded-2xl transition-all text-slate-300 hover:text-slate-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Full Name</label>
              <div className="relative group">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-amber-500 transition-colors" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Dr. Robert Oppenheimer"
                  className="w-full pl-12 pr-6 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-[14px] font-bold placeholder-slate-300 focus:bg-white focus:border-amber-200 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-amber-500 transition-colors" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="robert@sarthi.edu"
                  className="w-full pl-12 pr-6 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-[14px] font-bold placeholder-slate-300 focus:bg-white focus:border-amber-200 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-5 flex items-start gap-4">
               <ShieldCheck className="w-5 h-5 text-amber-600 mt-0.5" />
               <p className="text-[11px] font-medium text-amber-800 leading-relaxed">
                 An automated invitation will be dispatched to this address. The instructor will be required to complete their profile before verification.
               </p>
            </div>

            <div className="pt-4 flex items-center gap-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-4 text-[12px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all"
              >
                Cancel
              </button>
              <button
                disabled={isSubmitting}
                className="flex-[2] py-4 bg-[#0F172A] text-white rounded-2xl text-[12px] font-black uppercase tracking-widest hover:bg-amber-500 transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
              >
                {isSubmitting ? 'Processing...' : 'Send Invitation'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

