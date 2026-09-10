'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle,
  MessageSquare,
  AlertTriangle,
  ShieldQuestion,
  ChevronDown,
  Send,
  FileText,
  LifeBuoy,
  CheckCircle2,
  PhoneCall,
  Mail,
  Zap,
  Clock,
  BookOpen,
  MessageCircle,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ToastProvider';
import { PageHeader, StatCard } from '@/components/ui/DashboardUI';

const categories = [
  { id: 'technical', name: 'Technical Issue', icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50' },
  { id: 'content', name: 'Course Content', icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 'billing', name: 'Billing & Payment', icon: HelpCircle, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { id: 'feedback', name: 'General Feedback', icon: MessageSquare, color: 'text-purple-500', bg: 'bg-purple-50' },
];

const faqs = [
  {
    q: "How do I access my certificates?",
    a: "Once you complete a course, your certificate will automatically appear in the 'Certificates' tab of your dashboard. You can download it as a high-quality PDF."
  },
  {
    q: "The video player is not loading properly.",
    a: "Try clearing your browser cache or switching to a different browser like Chrome or Firefox. Ensure your internet connection is stable."
  },
  {
    q: "Can I get a refund for a course?",
    a: "Refunds are subject to our 7-day refund policy, provided you haven't completed more than 10% of the course content."
  },
  {
    q: "How do I contact my instructor directly?",
    a: "You can use the 'Discussion' tab within each course lesson to ask questions. Instructors typically respond within 24-48 hours."
  }
];

export default function SupportClient() {
  const { addToast } = useToast();
  const [activeCategory, setActiveCategory] = useState('technical');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    priority: 'LOW'
  });

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => setUserProfile(data.user))
      .catch(() => { });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const response = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          category: activeCategory
        })
      });

      if (!response.ok) throw new Error('Failed to submit ticket');

      setSubmitted(true);
      addToast({
        type: 'success',
        title: 'Ticket Raised Successfully',
        message: 'Our support team will get back to you within 24 hours.'
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Submission Failed',
        message: 'Could not raise your ticket. Please try again later.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const studentName = userProfile?.name || 'Student';
  const whatsappMsg = encodeURIComponent(`Hello, this is ${studentName} and I'm getting a problem at SARTHI...`);
  const whatsappUrl = `https://wa.me/917654212171?text=${whatsappMsg}`;

  if (submitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto px-6 text-center"
        >
          <div className="w-24 h-24 bg-[#1B4332] rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-[#1B4332]/20">
            <CheckCircle2 className="w-12 h-12 text-white" strokeWidth={3} />
          </div>
          <h2 className="text-4xl font-black text-[#1B4332] uppercase tracking-tight mb-4 italic">Ticket Received</h2>
          <p className="text-gray-500 font-bold mb-10 text-lg">
            Ticket ID: #TT-{Math.floor(100000 + Math.random() * 900000)}<br />
            We&apos;ve logged your query and our specialized support team is reviewing it.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="bg-[#1B4332] text-white px-10 py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-[#1B4332]/20 hover:scale-105 transition-all italic text-sm"
          >
            Raise Another Ticket
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-24">
      {/* Unified Header */}
      <PageHeader
        title="HELP & SUPPORT"
        subtitle="We're here to ensure your learning journey is seamless."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-12 sm:mb-16">
          <StatCard
            icon={<Clock className="w-6 h-6 text-[#D4915C]" />}
            label="Response Time"
            value="< 24h"
            sublabel="Average Speed"
            index={0}
          />
          <StatCard
            icon={<Zap className="w-6 h-6 text-[#1B4332]" />}
            label="Support Status"
            value="Online"
            sublabel="Active Now"
            index={1}
          />
          <StatCard
            icon={<BookOpen className="w-6 h-6 text-emerald-600" />}
            label="Articles"
            value="50+"
            sublabel="Help Center"
            index={2}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8 lg:gap-12 items-start">
          {/* Left Column: Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] sm:rounded-[3rem] border border-gray-100 shadow-sm p-6 sm:p-10 md:p-14 overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#FDFBF7] rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />

            <h2 className="text-xl sm:text-2xl font-black text-[#1B4332] uppercase tracking-tight mb-8 sm:mb-12 italic flex items-center gap-4 relative z-10">
              <div className="w-2 h-8 bg-amber-400 rounded-full" />
              RAISE A NEW TICKET
            </h2>

            <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
              {/* Category */}
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">ISSUE CATEGORY</label>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActiveCategory(cat.id)}
                      className={cn(
                        "flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all group",
                        activeCategory === cat.id
                          ? "bg-[#1B4332] border-[#1B4332] text-white shadow-xl shadow-[#1B4332]/20 scale-105"
                          : "bg-white border-gray-50 text-gray-400 hover:border-[#1B4332]/20 hover:bg-gray-50/50"
                      )}
                    >
                      <cat.icon className={cn("w-8 h-8 mb-3 transition-transform group-hover:scale-110", activeCategory === cat.id ? "text-white" : cat.color)} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-center leading-tight">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1">SUMMARY</label>
                <input
                  type="text"
                  required
                  placeholder="E.g. Unable to access certificates..."
                  className="w-full px-8 py-5 bg-gray-50/50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#1B4332]/10 transition-all outline-none font-bold text-[#1B4332] placeholder-gray-300"
                  value={formData.subject}
                  onChange={e => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>

              {/* Description */}
              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1">DETAILED DESCRIPTION</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Tell us more about the issue..."
                  className="w-full px-8 py-6 bg-gray-50/50 border-2 border-transparent rounded-3xl focus:bg-white focus:border-[#1B4332]/10 transition-all outline-none font-bold text-[#1B4332] placeholder-gray-300 resize-none italic"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-6 bg-[#1B4332] hover:bg-[#2D6A4F] text-white rounded-[20px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-[#1B4332]/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-4 disabled:opacity-50 italic text-sm"
              >
                {isSubmitting ? (
                  <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>SUBMIT QUERY <Send className="w-5 h-5" /></>
                )}
              </button>
            </form>
          </motion.div>

          {/* Right Column: Contact Cards */}
          <aside className="space-y-8">
            {/* Contact Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-[#1B4332] rounded-[2.5rem] sm:rounded-[3rem] p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full group-hover:scale-150 transition-transform duration-1000" />
              <h3 className="text-xl font-black uppercase tracking-tight mb-8 italic relative z-10">DIRECT_CHANNELS</h3>

              <div className="space-y-10 relative z-10">
                {/* Email */}
                <a href="mailto:mohitraj8503@gmail.com" className="flex items-center gap-6 hover:translate-x-2 transition-transform group/link">
                  <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 group-hover/link:bg-white/20 transition-colors">
                    <Mail className="w-7 h-7 text-[#D4915C]" />
                  </div>
                  <div>
                    <div className="text-[12px] font-black text-white/50 uppercase tracking-[0.25em] mb-1.5">Email_Official</div>
                    <div className="text-[18px] font-black italic text-white leading-none">mohitraj8503@gmail.com</div>
                  </div>
                </a>

                {/* WhatsApp */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-6 hover:translate-x-2 transition-transform group/link"
                >
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 group-hover/link:bg-emerald-500/20 transition-colors">
                    <MessageCircle className="w-7 h-7 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-[12px] font-black text-emerald-400/70 uppercase tracking-[0.25em] mb-1.5">WhatsApp_Direct</div>
                    <div className="text-[20px] font-black italic text-white leading-none">+91 76542 12171</div>
                  </div>
                </a>
              </div>

              <div className="mt-14 pt-10 border-t border-white/10 flex justify-between items-center relative z-10">
                <div className="text-[12px] font-black text-white/40 uppercase tracking-[0.3em] italic">System_Online</div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_15px_rgba(52,211,153,1)]" />
                  <span className="text-[12px] font-black uppercase tracking-[0.2em] text-emerald-400">ACTIVE</span>
                </div>
              </div>
            </motion.div>

            {/* FAQ Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-[2.5rem] sm:rounded-[3rem] p-6 sm:p-10 border border-gray-100 shadow-sm"
            >
              <h3 className="text-xl font-black text-[#1B4332] uppercase tracking-tight mb-8 italic flex items-center gap-3">
                <ShieldQuestion className="w-6 h-6 text-[#D4915C]" />
                QUICK_FAQS
              </h3>
              <div className="space-y-4">
                {faqs.slice(0, 3).map((faq, i) => (
                  <div key={i} className="group border-b border-gray-50 last:border-0 pb-4 last:pb-0">
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                      className="w-full flex items-center justify-between py-2 text-left"
                    >
                      <span className={cn(
                        "text-xs font-black uppercase tracking-tight transition-colors",
                        expandedFaq === i ? "text-[#1B4332]" : "text-gray-400 group-hover:text-[#1B4332]"
                      )}>{faq.q}</span>
                      <ChevronDown className={cn("w-4 h-4 transition-transform", expandedFaq === i ? "rotate-180 text-[#D4915C]" : "text-gray-300")} />
                    </button>
                    <AnimatePresence>
                      {expandedFaq === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                        >
                          <p className="text-xs text-gray-400 font-bold italic py-3 leading-relaxed">
                            {faq.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </motion.div>
          </aside>
        </div>
      </div>
    </div>
  );
}

