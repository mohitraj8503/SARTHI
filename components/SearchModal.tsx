'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowLeft, X, Clock, TrendingUp } from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';

export default function SearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-search', handleOpen);
    return () => window.removeEventListener('open-search', handleOpen);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  const popularSearches = [
    'Python', 'JavaScript', 'React Native', 'UI Design', 'Web Development', 'AI/ML'
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="fixed inset-0 bg-background/80 backdrop-blur-3xl z-[10000] flex flex-col pt-safe lg:pt-0"
        >
          {/* Header */}
          <div className="flex items-center gap-6 px-8 py-6 border-b border-border/40">
            <button 
              onClick={() => setIsOpen(false)}
              className="p-3 hover:bg-muted/50 rounded-full transition-all active:scale-90"
            >
              <ArrowLeft className="w-6 h-6 text-foreground" />
            </button>
            <div className="flex-1 relative">
              <input
                autoFocus
                type="text"
                placeholder="What do you want to learn?"
                className="w-full h-[60px] bg-muted/40 border-none rounded-2xl px-6 pl-14 text-[18px] font-medium text-foreground focus:ring-4 focus:ring-primary/10 outline-none placeholder:text-muted-foreground/40 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/60" />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-5 top-1/2 -translate-y-1/2 p-2 hover:bg-muted round-full transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground/60" />
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-8 py-10 custom-scrollbar">
            <div className="max-w-[800px] mx-auto space-y-14">
              {/* Popular Searches */}
              <section>
                <div className="flex items-center gap-3 mb-8">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <h3 className="text-[13px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Trending Skills</h3>
                </div>
                <div className="flex flex-wrap gap-4">
                  {popularSearches.map((term) => (
                    <button
                      key={term}
                      onClick={() => {
                        triggerHaptic('light');
                        setSearchQuery(term);
                      }}
                      className="px-6 py-3 bg-muted/50 hover:bg-primary/10 hover:text-primary hover:border-primary/20 border border-transparent rounded-2xl text-[15px] font-bold text-foreground transition-all active:scale-[0.98]"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </section>

              {/* Recent History */}
              <section>
                 <div className="flex items-center gap-3 mb-6">
                  <Clock className="w-5 h-5 text-muted-foreground/40" />
                  <h3 className="text-[13px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Recent Researches</h3>
                </div>
                <div className="space-y-4">
                  {['Beginners Python', 'Mastering ReactJS'].map((recent) => (
                    <div key={recent} className="flex items-center justify-between p-5 bg-muted/20 hover:bg-muted/40 rounded-2xl border border-transparent hover:border-border/40 group cursor-pointer active:opacity-60 transition-all duration-300">
                      <span className="text-[16px] font-semibold text-foreground/80 group-hover:text-foreground transition-colors">{recent}</span>
                      <X className="w-4 h-4 text-muted-foreground/30 hover:text-red-500 transition-colors" />
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>

          {/* Search Button (Mobile Optimized) */}
          <div className="p-8 bg-background/50 backdrop-blur-md border-t border-border/40">
            <button 
              onClick={() => {
                triggerHaptic('success');
                setIsOpen(false);
              }}
              className="w-full max-w-[800px] mx-auto h-[64px] bg-primary text-white rounded-2xl text-[18px] font-bold shadow-2xl shadow-primary/30 hover:shadow-primary/40 active:scale-[0.98] transition-all flex items-center justify-center"
            >
              Start Searching
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

