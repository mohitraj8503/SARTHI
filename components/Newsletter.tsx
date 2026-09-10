'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { triggerHaptic } from '@/lib/haptics';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setStatus('error');
      triggerHaptic('error');
      return;
    }
    
    // Simulate API call
    setTimeout(() => {
      console.log('Subscribed:', email);
      setStatus('success');
      triggerHaptic('success');
      setEmail('');
    }, 500);
  };

  return (
    <section className="py-24 lg:py-32 bg-slate-50 border-t border-slate-100">
      <div className="max-w-[1000px] mx-auto px-6 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight mb-4">
            Architect your <span className="text-orange-600">Success Story.</span>
          </h2>

          <p className="text-lg text-slate-500 font-medium mb-10 max-w-lg mx-auto leading-relaxed">
            Join 10,000+ graduates receiving weekly insights on tech careers and engineering.
          </p>
          
          <div className="max-w-md mx-auto">
            <AnimatePresence mode="wait">
              {status === 'success' ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-6 bg-green-50 border border-green-100 rounded-2xl flex flex-col items-center text-center"
                >
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-3">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h3 className="text-slate-900 font-bold mb-1">You&apos;re in!</h3>
                  <p className="text-sm text-slate-500">Check your inbox for the welcome kit.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="relative">
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setStatus('idle');
                      }}
                      placeholder="architect@company.com"
                      required
                      className={`w-full h-14 px-6 bg-white border ${status === 'error' ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10'} rounded-full text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all shadow-sm`}
                    />
                    {status === 'error' && (
                      <AlertCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500 animate-pulse" />
                    )}
                  </div>
                  <button
                    type="submit"
                    className="w-full mt-4 h-12 bg-orange-600 text-white rounded-full font-bold text-sm tracking-wide hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/20 active:scale-[0.98]"
                  >
                    Details Inside
                  </button>
                  <p className="mt-4 text-xs text-slate-400">
                    No spam. Unsubscribe anytime. <Link href="/privacy" className="underline hover:text-slate-600">Privacy Policy</Link>
                  </p>
                </form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

