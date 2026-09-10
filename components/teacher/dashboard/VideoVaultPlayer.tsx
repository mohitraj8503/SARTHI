'use client';

import { useState } from 'react';
import { Play, X, Info, Shield, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VideoVaultPlayerProps {
  videoUrl: string;
  title: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function VideoVaultPlayer({ videoUrl, title, isOpen, onClose }: VideoVaultPlayerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[100]"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-10 lg:inset-20 z-[101] flex flex-col pointer-events-none"
          >
            <div className="bg-slate-900 w-full max-w-6xl mx-auto rounded-[32px] overflow-hidden border border-slate-800 shadow-2xl flex flex-col pointer-events-auto h-full">
              
              {/* Player Header */}
              <div className="px-8 py-6 flex items-center justify-between border-b border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 mb-1">
                     <Shield className="w-3.5 h-3.5 text-blue-400" />
                     <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Secure Organization Stream</span>
                  </div>
                  <h3 className="text-xl font-black text-white tracking-tight">{title}</h3>
                </div>
                
                <div className="flex items-center gap-4">
                  <button className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 hover:text-white transition-colors">
                     <Info className="w-4 h-4" />
                     Lecture Notes
                  </button>
                  <button 
                    onClick={onClose}
                    className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Video Viewport */}
              <div className="flex-1 bg-black relative flex items-center justify-center">
                 {videoUrl ? (
                   <iframe 
                     src={videoUrl}
                     className="w-full h-full border-none"
                     allow="autoplay; fullscreen; picture-in-picture"
                     title={title}
                   />
                 ) : (
                   <div className="flex flex-col items-center justify-center text-center p-10">
                      <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6">
                         <Play className="w-8 h-8 text-slate-600" />
                      </div>
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px]">Stream link is being decrypted...</p>
                   </div>
                 )}
              </div>

              {/* Player Footer */}
              <div className="px-8 py-6 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="flex -space-x-2">
                       {[1, 2, 3].map(i => (
                         <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-black text-white">
                           {i}
                         </div>
                       ))}
                    </div>
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">34 Students Watching Now</span>
                 </div>

                 <button className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest flex items-center gap-2 hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 active:scale-95">
                    <ExternalLink className="w-4 h-4" />
                    Open in OneDrive
                 </button>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

