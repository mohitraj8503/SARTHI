'use client';

import React from 'react';
import { Lock, FileText, ArrowRight, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface GatingOverlayProps {
  isRestricted: boolean;
  pendingCount: number;
  courseId?: string;
  onResolve?: () => void;
}

/**
 * AssignmentGatingOverlay
 * A high-fidelity, glassmorphic overlay to restrict access when assignments are pending.
 */
export default function AssignmentGatingOverlay({ 
  isRestricted, 
  pendingCount, 
  courseId 
}: GatingOverlayProps) {
  if (!isRestricted) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[12px] p-6"
      >
        <motion.div 
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="max-w-md w-full bg-white/10 border border-white/20 backdrop-blur-xl rounded-[2.5rem] p-10 shadow-2xl overflow-hidden relative"
        >
          {/* Neural Pulse background elements */}
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500 rounded-full blur-3xl" 
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.5, 1],
              x: [0, 50, 0],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{ duration: 15, repeat: Infinity, delay: 2 }}
            className="absolute -bottom-32 -left-32 w-80 h-80 bg-indigo-500 rounded-full blur-3xl" 
          />

          <div className="relative z-10 text-center space-y-8">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 rotate-3 transform hover:rotate-0 transition-transform duration-500">
              <Lock className="w-10 h-10 text-white" />
            </div>

            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <ShieldAlert className="w-3.5 h-3.5" /> Strict Gating Active
              </div>
              <h2 className="text-3xl font-black text-white italic uppercase font-outfit tracking-tighter leading-none">
                Access <span className="text-emerald-400">Restricted</span>
              </h2>
              <p className="text-white/60 text-[11px] font-bold uppercase tracking-widest leading-relaxed">
                You have <span className="text-white">{pendingCount} pending assignment{pendingCount > 1 ? 's' : ''}</span>. 
                Complete your work to restore full interactivity in this session.
              </p>
            </div>

            <div className="space-y-4">
              <Link 
                href={`/dashboard?tab=assignments${courseId ? `&courseId=${courseId}` : ''}`}
                className="w-full h-16 bg-white text-black rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-400 transition-colors group"
              >
                <FileText className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                Go to Assignments
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
              
              <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest">
                Real-time participation is paused for safety
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
