'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, CheckCircle2, Clock, XCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  name?: string;
  blogAccessStatus: string;
}

interface BlogAccessGateProps {
  user: User;
  onStatusChange?: (newStatus: string) => void;
}

const BlogAccessGate: React.FC<BlogAccessGateProps> = ({ user, onStatusChange }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const status = user.blogAccessStatus || 'none';

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Enter a valid email');
      return;
    }

    if (email !== user.email) {
      setError('This email does not match your signed-in account');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/blogs/access/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name: user.name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      toast.success('Request sent successfully');
      if (onStatusChange) {
        onStatusChange('requested');
      }
      // Note: In a real app, you might want to refresh the page or update local state
      window.location.reload(); 
    } catch (err: any) {
      toast.error(err.message);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'requested':
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6 bg-yellow-50/50 p-8 rounded-[32px] border border-yellow-100 backdrop-blur-sm"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-100 text-yellow-600 mb-4 shadow-inner">
              <Clock className="w-10 h-10 animate-[spin_10s_linear_infinite]" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-yellow-900 tracking-tight uppercase font-outfit">Verification <span className="text-yellow-600 italic">Pending</span></h2>
              <p className="text-yellow-700/70 font-medium max-w-md mx-auto">
                Your application is currently being reviewed by our editorial team. 
                We&apos;ll unlock your specialized dashboard once your credentials are verified.
              </p>
            </div>
            <div className="pt-4">
              <div className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-white/50 text-yellow-700 font-black uppercase tracking-[0.2em] text-[10px] border border-yellow-200">
                <ShieldCheck className="w-4 h-4" />
                Awaiting Authorization
              </div>
            </div>
          </motion.div>
        );

      case 'rejected':
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6 bg-red-50/50 p-8 rounded-[32px] border border-red-100 backdrop-blur-sm"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 text-red-600 mb-4 shadow-inner">
              <XCircle className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-red-900 tracking-tight uppercase font-outfit">Request Denied</h2>
              <p className="text-red-700/70 font-medium max-w-md mx-auto">
                Unfortunately, your request for blog access was not approved at this time. 
                Please ensure your profile is complete and aligned with our editorial standards.
              </p>
            </div>
            <div className="pt-4">
              <button 
                onClick={() => {
                  // Local reset to allow re-submission
                  setEmail('');
                  setError(null);
                  // We need to tell the parent or just use local state override
                  // For now, reload is safest but we can just use a local state to override status
                  window.location.reload();
                }}
                className="px-10 py-4 rounded-2xl bg-red-600 text-white font-black uppercase tracking-[0.2em] hover:bg-red-700 transition-all flex items-center gap-2 mx-auto shadow-xl shadow-red-600/20 active:scale-95"
              >
                Try Again
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        );

      case 'approved':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-50 text-green-600 mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-forest">Access Granted!</h2>
              <p className="text-gray-600">Your blog portal is ready.</p>
            </div>
            <div className="pt-4">
              <button 
                onClick={() => window.location.href = '/student/blogs/dashboard'}
                className="px-8 py-3 rounded-full bg-forest text-white font-medium hover:bg-forest-light transition-all flex items-center gap-2 mx-auto shadow-lg shadow-forest/20"
              >
                Enter Blog Portal
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        );

      default:
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-lg mx-auto"
          >
            <div className="text-center mb-8 space-y-2">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-forest/5 text-forest mb-4">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-bold text-forest">Restricted Access</h2>
              <p className="text-gray-600">
                The SARTHI Blog is a curated space for verified creators. 
                Request access to start sharing your insights.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-forest transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Enter your email"
                  className={`w-full pl-12 pr-4 py-4 bg-white border-2 rounded-2xl outline-none transition-all ${
                    error ? 'border-red-200 focus:border-red-500' : 'border-gray-100 focus:border-forest'
                  }`}
                />
              </div>

              {error && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="text-red-500 text-sm pl-2 flex items-center gap-1"
                >
                  <XCircle className="w-4 h-4" />
                  {error}
                </motion.p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-forest text-white rounded-2xl font-bold text-lg hover:bg-forest-light active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-forest/20 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting Request...
                  </>
                ) : (
                  <>
                    Secure Access
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              Only @{user.email.split('@')[1]} domain emails or matching account emails are prioritized.
            </p>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 bg-cream">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-12 items-center bg-white rounded-[32px] p-8 md:p-12 shadow-soft border border-forest/5 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-forest/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-forest/5 rounded-full -ml-32 -mb-32 blur-3xl" />

        <div className="hidden md:block space-y-8">
          <div className="space-y-4">
            <span className="px-4 py-1.5 rounded-full bg-forest/10 text-forest text-sm font-bold tracking-wider uppercase">
              Exclusive Community
            </span>
            <h1 className="text-4xl lg:text-5xl font-black text-forest leading-tight">
              Share Your Tech <br /> 
              <span className="text-forest-accent">Tomorrow</span> Story.
            </h1>
          </div>
          
          <ul className="space-y-4">
            {[
              'Publish deep-dives and tutorials',
              'Build your authority in the community',
              'Unlock advanced editor tools',
              'Get featured on the homepage'
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-gray-600 font-medium">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-forest text-white flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10">
          <AnimatePresence mode="wait">
            {renderContent()}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default BlogAccessGate;
