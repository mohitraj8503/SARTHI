'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Clock, ArrowRight, PenBox, Lock, CheckCircle2, XCircle, Zap, Shield, Globe, Cpu, Edit, PenLine } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';
import Logo from '@/components/Logo';

interface User {
  id: string;
  email: string;
  name?: string;
  blogAccessStatus: string;
}

interface BlogAccessOverlayProps {
  user: User;
  onStatusChange?: (newStatus: string) => void;
}

const BlogAccessOverlay: React.FC<BlogAccessOverlayProps> = ({ user, onStatusChange }) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [logoSrc, setLogoSrc] = useState('/logo-premium.png');
  const status = user.blogAccessStatus || 'none';

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleOptIn = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/blogs/access/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, name: user.name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      toast.success('Access Granted! Redirecting...');
      if (onStatusChange) {
        onStatusChange('approved');
      }
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderModalContent = () => {
    switch (status) {
      case 'requested':
        return (
          <motion.div 
            key="requested"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto text-gray-900 border border-gray-100">
              <Clock className="w-10 h-10 animate-[spin_10s_linear_infinite]" />
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-black text-white tracking-tighter uppercase font-outfit">
                Identity <span className="text-emerald-400 italic">Pending</span>
              </h3>
              <p className="text-white/40 font-bold text-[10px] leading-relaxed max-w-[260px] mx-auto uppercase tracking-widest">
                Our team is verifying your credentials for the creator ecosystem.
              </p>
            </div>
            
            <div className="flex items-center justify-center gap-3 pt-4">
              <div className="px-6 py-3 rounded-xl bg-slate-50 border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Lock className="w-3.5 h-3.5" /> Awaiting Authorization
              </div>
            </div>
          </motion.div>
        );

      case 'rejected':
        return (
          <motion.div 
            key="rejected"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <div className="w-20 h-20 bg-red-50 rounded-[2rem] flex items-center justify-center mx-auto text-red-500 border border-red-100">
              <XCircle className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-black text-red-900 tracking-tighter uppercase font-outfit">
                Request <span className="italic">Denied</span>
              </h3>
              <p className="text-red-900/40 font-bold text-[10px] leading-relaxed max-w-[260px] mx-auto uppercase tracking-widest">
                Your profile alignment failed to meet our creator standards.
              </p>
            </div>
            <button 
              onClick={handleOptIn}
              disabled={isSubmitting}
              className="w-full py-5 bg-[#174F3A] text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] transition-all flex items-center justify-center gap-3 active:scale-95 shadow-lg shadow-[#174F3A]/20"
            >
              RE-INITIATE REQUEST
            </button>
          </motion.div>
        );

      default: // 'none'
        return (
          <motion.div 
            key="none"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-10"
          >
            <div className="relative mx-auto w-28 h-28">
              <div className="w-28 h-28 bg-white/8 backdrop-blur-xl rounded-3xl flex items-center justify-center mx-auto shadow-none border border-white/12 relative overflow-hidden group">
                <Image 
                  src={logoSrc} 
                  alt="SARTHI" 
                  width={80}
                  height={80}
                  className="w-20 h-20 object-contain group-hover:scale-110 transition-transform duration-700" 
                  onError={() => setLogoSrc('/sarthi-logo.png')}
                />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-emerald-600 text-white p-2.5 rounded-2xl shadow-none border-4 border-[#1E293B]">
                <PenLine className="w-5 h-5" />
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-[40px] font-black text-white tracking-tighter uppercase leading-[0.9] font-outfit">
                Start Writing for <br/>
                <span className="text-emerald-400 italic">SARTHI</span>
              </h3>
              <p className="text-white/40 font-bold text-[11px] leading-relaxed max-w-[340px] mx-auto uppercase tracking-widest">
                Join the circle of technical writers. Build authority, share insights, and dominate the feed.
              </p>
            </div>

            <div className="space-y-6">
              <motion.button 
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleOptIn}
                disabled={isSubmitting}
                className="w-full py-6 bg-[#174F3A] text-white rounded-2xl font-black uppercase tracking-[0.3em] text-[12px] transition-all flex items-center justify-center gap-4 shadow-xl shadow-[#174F3A]/20"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Opt for Blogs 
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
              
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
                  Activation: <span className="text-[#174F3A]">Instant</span>
                </p>
                <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em]">
                  Secure Link & No Extra Data Required.
                </p>
              </div>
            </div>
          </motion.div>
        );
    }
  };

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 z-[50] flex items-center justify-center p-6 overflow-hidden">
      {/* Semi-transparent overlay without blur to keep sidebar clear */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-[4px]"
      />
      
      {/* Minimalist Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.02 }}
        className="relative z-10 w-full max-w-[500px] bg-white/9 backdrop-blur-2xl rounded-[2.5rem] p-16 shadow-none border border-white/14 overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {renderModalContent()}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default BlogAccessOverlay;

