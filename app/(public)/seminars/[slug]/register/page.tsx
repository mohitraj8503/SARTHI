'use client';

import { useState, useEffect, useCallback, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar, Clock, User, ArrowLeft, CheckCircle2, Sparkles,
  ShieldCheck, Loader2, CreditCard, Check, Lock, AlertCircle,
  Copy, Share2, ChevronDown, Phone, Mail, MapPin, Briefcase,
  ExternalLink, Star, Building2, ChevronRight, Zap, ArrowRight, CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';

/* ─── Types ─────────────────────────────────────────────────────────── */
interface Seminar {
  id: string;
  title: string;
  description: string | null;
  scheduledAt: string | null;
  date?: string | null;
  price?: number | null;
  speakerName: string | null;
  thumbnail: string | null;
  thumbnailUrl?: string | null;
  duration?: number | null;
  durationMinutes?: number | null;
  slug?: string | null;
}

interface FormData {
  name: string; email: string; phone: string; city: string;
  profession: string; referralSource: string;
}

interface FormErrors { [k: string]: string }

type DashboardUser = {
  name?: string;
  email?: string;
  phone?: string;
  city?: string;
  profession?: string;
};

type DashboardResponse = {
  user?: DashboardUser;
};

type RegistrationCheck = {
  registered?: boolean;
  registrationId?: string;
};

/* ─── Constants ──────────────────────────────────────────────────────── */
const PRICE = 499;
const ORIGINAL_PRICE = 2000;
const STEPS = [
  { n: 1, label: 'Details' },
  { n: 2, label: 'Payment' },
  { n: 3, label: 'Confirm' },
];
const PROFESSIONS = ['Student', 'Entrepreneur', 'Working Professional', 'Freelancer', 'Other'];
const REFERRALS = ['YouTube', 'Instagram', 'Google', 'Friend Referral', 'LinkedIn', 'Other'];
const BANKS = ['HDFC Bank', 'SBI', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra', 'Yes Bank'];

/* ─── Animation Variants ─────────────────────────────────────────────── */
const slideVariants: Variants = {
  enter: (dir: number) => ({ x: dir > 0 ? '60%' : '-60%', opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { type: 'spring' as const, stiffness: 300, damping: 30 } },
  exit: (dir: number) => ({ x: dir > 0 ? '-60%' : '60%', opacity: 0, transition: { duration: 0.2 } }),
};

/* ─── Sub-components ─────────────────────────────────────────────────── */
function TimerBadge() {
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(prev => prev > 0 ? prev - 1 : 0), 1000);
    return () => clearInterval(timer);
  }, []);
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  return (
    <div className="flex items-center gap-2 bg-[#1C3A2F]/5 border border-[#1C3A2F]/10 rounded-full px-4 py-2 mb-8 w-fit mx-auto shadow-sm">
        <Clock className="w-3.5 h-3.5 text-[#1C3A2F]" />
        <span className="text-[10px] font-black text-[#1C3A2F] uppercase tracking-[0.15em]">
            EXPIRES IN: <span className="text-[#C8A96A]">{mins}:{secs < 10 ? `0${secs}` : secs}</span>
        </span>
    </div>
  );
}

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-12">
      {STEPS.map((s, i) => (
        <div key={s.n} className="flex items-center">
          <div className="flex flex-col items-center gap-2.5">
            <motion.div
              animate={{
                scale: current === s.n ? 1.1 : 1,
                backgroundColor: current > s.n ? '#1C3A2F' : current === s.n ? '#1C3A2F' : '#FFFFFF',
                borderColor: current >= s.n ? 'transparent' : '#E8E2D9',
                color: current >= s.n ? '#FFFFFF' : '#5D705C',
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="w-10 h-10 rounded-full flex items-center justify-center text-[12px] font-black border-2 transition-all shadow-sm"
            >
              {current > s.n
                ? <Check className="w-5 h-5 text-white stroke-[3px]" />
                : <span>{s.n}</span>
              }
            </motion.div>
            <span className={cn('text-[9px] font-black uppercase tracking-[0.2em] transition-colors',
              current === s.n ? 'text-[#1C3A2F]' : 'text-[#5D705C]'
            )}>{s.label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className="w-10 sm:w-20 h-[2px] mx-1 mb-6 rounded-full overflow-hidden bg-[#E8E2D9]">
              <motion.div
                className="h-full bg-[#1C3A2F]"
                animate={{ width: current > i + 1 ? '100%' : '0%' }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function FieldInput({ label, id, value, onChange, error, icon: Icon, type = "text", placeholder }: any) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // When Enter is pressed, move focus to next input field
    if (e.key === 'Enter') {
      e.preventDefault();
      const form = inputRef.current?.closest('div');
      if (form) {
        const inputs = form.querySelectorAll('input, select');
        const currentIndex = Array.from(inputs).indexOf(inputRef.current as Element);
        const nextInput = inputs[currentIndex + 1] as HTMLInputElement | HTMLSelectElement;
        if (nextInput) {
          nextInput.focus();
        }
      }
    }
  };
  
  return (
    <div className="group relative">
      <label 
        htmlFor={id} 
        className={cn(
          "block text-[11px] font-black uppercase tracking-[0.15em] mb-2.5 transition-all ml-1",
          focused ? 'text-[#1C3A2F]' : 'text-[#5D705C]'
        )}>
        {label}
      </label>
      <div className={cn(
        'flex items-center gap-4 bg-white border-2 rounded-2xl px-5 py-4 transition-all duration-300 relative overflow-hidden',
        focused ? 'border-[#1C3A2F] shadow-md shadow-[#1C3A2F]/5' : error ? 'border-red-400' : 'border-[#E8E2D9] hover:border-[#D1C8B8]'
      )}>
        {Icon && <Icon className={cn('w-[18px] h-[18px] shrink-0 transition-colors duration-300', focused ? 'text-[#1C3A2F]' : 'text-[#5D705C]')} />}
        <input
          ref={inputRef}
          id={id} type={type} value={value} onChange={onChange} placeholder={placeholder}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent text-[15px] font-bold text-[#1A1A18] outline-none placeholder:text-[#C5D5C0] tracking-tight"
        />
      </div>
      <AnimatePresence>
        {error && (
            <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                 className="text-red-500 text-[10px] font-black uppercase tracking-wider mt-2.5 flex items-center gap-1.5 ml-2">
                <AlertCircle className="w-3.5 h-3.5" /> {error}
            </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function FieldSelect({ label, id, value, onChange, error, options, icon: Icon }: any) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="group relative">
      <label 
        htmlFor={id} 
        className={cn(
          "block text-[11px] font-black uppercase tracking-[0.15em] mb-2.5 transition-all ml-1",
          focused ? 'text-[#1C3A2F]' : 'text-[#5D705C]'
        )}>
        {label}
      </label>
      <div className={cn(
        'flex items-center gap-4 bg-white border-2 rounded-2xl px-5 py-4 transition-all duration-300 relative overflow-hidden',
        focused ? 'border-[#1C3A2F] shadow-md shadow-[#1C3A2F]/5' : error ? 'border-red-400' : 'border-[#E8E2D9] hover:border-[#D1C8B8]'
      )}>
        {Icon && <Icon className={cn('w-[18px] h-[18px] shrink-0 transition-colors duration-300', focused ? 'text-[#1C3A2F]' : 'text-[#5D705C]')} />}
        <select
          id={id} value={value} onChange={onChange}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          className="flex-1 bg-transparent text-[15px] font-bold text-[#1A1A18] outline-none appearance-none cursor-pointer tracking-tight"
        >
          <option value="" disabled className="text-[#C5D5C0]">Select Option</option>
          {options.map((o: string) => <option key={o} value={o} className="text-[#1A1A18] font-bold">{o}</option>)}
        </select>
        <ChevronDown className={cn("w-4 h-4 text-[#5D705C] shrink-0 transition-transform duration-300", focused && "text-[#1C3A2F] rotate-180")} />
      </div>
      <AnimatePresence>
        {error && (
            <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                 className="text-red-500 text-[10px] font-black uppercase tracking-wider mt-2.5 flex items-center gap-1.5 ml-2">
                <AlertCircle className="w-3.5 h-3.5" /> {error}
            </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function PriceBanner({ seminar }: { seminar: Seminar }) {
  const isFree = seminar.price === 0 || seminar.price === null || seminar.price === undefined;
  const displayPrice = isFree ? 'FREE' : `₹${seminar.price}`;
  const displayDate = seminar.scheduledAt || seminar.date;

  return (
    <motion.div 
        whileHover={{ y: -4 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="relative mb-10 overflow-hidden rounded-[32px] group"
    >
        <div className="bg-[#1C3A2F] p-8 shadow-xl relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/[0.03] rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#C8A96A]/[0.1] rounded-full blur-2xl -ml-24 -mb-24 pointer-events-none" />

            <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                <div className="text-center md:text-left">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full mb-4 border border-white/10">
                        <Sparkles className="w-3 h-3 text-[#C8A96A] fill-[#C8A96A]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
                          {isFree ? 'Sponsored 100% Free' : 'Exclusive Access'}
                        </span>
                    </div>
                    <h4 className="text-2xl font-black text-white tracking-tight leading-none mb-3">
                      {seminar.title}
                    </h4>
                    <div className="flex items-center justify-center md:justify-start gap-4">
                        <div className="flex items-center gap-2 text-white/70 text-[11px] font-bold uppercase tracking-wider">
                            <Calendar className="w-4 h-4 text-[#C8A96A]" />
                            {displayDate ? new Date(displayDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Upcoming'}
                        </div>
                        <div className="w-1.5 h-1.5 bg-[#C8A96A] rounded-full" />
                        <span className="text-[10px] text-white/50 font-black uppercase tracking-[0.2em]">Live Session</span>
                    </div>
                </div>
                
                <div className="flex flex-col items-center md:items-end">
                    <span className="text-white/30 text-sm font-bold line-through mb-1">₹{ORIGINAL_PRICE}</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black text-white tracking-tighter">{displayPrice}</span>
                    </div>
                </div>
            </div>
        </div>
    </motion.div>
  );
}

export default function SeminarRegistrationPage(props: { params: Promise<{ slug: string }> }) {
  const params = use(props.params);
  const router = useRouter();
  const [seminar, setSeminar] = useState<Seminar | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);
  const [form, setForm] = useState<FormData>({
    name: '', email: '', phone: '', city: '', profession: '', referralSource: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [registrationId, setRegistrationId] = useState('');
  const [payTab, setPayTab] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('');
  const [upiError, setUpiError] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState('');
  const [copied, setCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const hasAutoPaidRef = useRef(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const fetchSeminar = useCallback(async () => {
    try {
      const res = await fetch(`/api/seminars/${params.slug}`);
      if (res.ok) setSeminar(await res.json());
    } catch { /* ignore */ } finally { setPageLoading(false); }
  }, [params.slug]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Auto-fill from user profile and check for existing registration
  useEffect(() => {
    let isInitial = true;
    fetchSeminar();

    const bootstrapRegistration = async () => {
      try {
        const authRes = await fetch('/api/auth/me');
        const authData = authRes.ok ? await authRes.json() : {};
        const userData = (authData?.user
          ? await fetch('/api/student/dashboard').then(r => r.ok ? r.json() : {})
          : {}) as DashboardResponse;
        const regData = (await fetch(`/api/seminars/check-registration?seminarId=${params.slug}`)
          .then(r => r.ok ? r.json() : {})
          .catch(() => ({}))) as RegistrationCheck;

        if (!isInitial) return;

        const authUser = authData?.user;
        const studentUser = (userData as any)?.user;
        const currentUser = authUser || studentUser;

        if ((regData as any).registered) {
          setRegistrationId((regData as any).registrationId || '');
          setStep(3);
          return;
        }

        if (currentUser) {
          setIsSignedIn(true);
          setForm({
            name: currentUser.name || studentUser?.name || 'User',
            email: currentUser.email || studentUser?.email || '',
            phone: currentUser.phone || studentUser?.phone || '',
            city: studentUser?.city || currentUser.city || 'Not Specified',
            profession: studentUser?.profession || currentUser.profession || 'Student',
            referralSource: 'Direct',
          });
        }
      } catch {
        // Keep public registration usable even when auth-prefill calls fail.
      }
    };

    bootstrapRegistration();

    return () => { isInitial = false; };
  }, [fetchSeminar, params.slug]);

  // Real-time validation function
  const validateField = useCallback((name: string, value: string): string => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Name is required';
        if (value.trim().length < 2) return 'Name too short';
        return '';
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format';
        return '';
      case 'phone':
        if (!value.trim()) return 'Phone is required';
        if (!/^\d{10,}$/.test(value.replace(/\D/g, ''))) return 'Enter 10-digit phone number';
        return '';
      case 'city':
        if (!value.trim()) return 'City is required';
        return '';
      case 'profession':
        if (!value) return 'Select your profession';
        return '';
      case 'referralSource':
        if (!value) return 'Select how you found us';
        return '';
      default:
        return '';
    }
  }, []);

  // Handle field change with real-time validation
  const handleFieldChange = useCallback((field: keyof FormData, value: string) => {
    setForm(f => ({ ...f, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(e => ({ ...e, [field]: '' }));
    }
  }, [errors]);


  const goTo = (n: number) => { setDir(n > step ? 1 : -1); setStep(n); };

  // Simplified validation - check all required fields
  const validateStep1 = (): boolean => {
    const e: FormErrors = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    if (!form.phone.trim()) e.phone = 'Phone is required';
    if (!form.city.trim()) e.city = 'City is required';
    if (!form.profession) e.profession = 'Select your profession';
    if (!form.referralSource) e.referralSource = 'How did you find us?';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Check if form is ready to submit (visual feedback)
  const isFormComplete = useCallback(() => {
    return form.name.trim() && 
           form.email.trim() && 
           form.phone.trim() && 
           form.city.trim() && 
           form.profession && 
           form.referralSource;
  }, [form]);

  const handleContinue = async () => {
    if (!validateStep1() || !seminar) return;
    setSaving(true);
    try {
      const res = await fetch('/api/seminars/save-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seminarId: seminar.id, ...form }),
      });
      const data = await res.json();
      setRegistrationId(data.registrationId || `reg_${Date.now()}`);

      const isFree = seminar.price === 0 || seminar.price === null || data.isFree;
      if (isFree) {
        // Free seminar -> Directly to Step 3 (Confirmation Success)
        goTo(3);
      } else {
        // Paid seminar -> Step 2 (Payment)
        goTo(2);
      }
    } catch { 
      setRegistrationId(`reg_${Date.now()}`);
      goTo(3); 
    } finally { 
      setSaving(false); 
    }
  };

  const handlePay = useCallback(async (overrideForm?: FormData) => {
    if (!seminar) return;
    setPaying(true);
    setPayError('');
    
    const validOverride = (overrideForm && typeof overrideForm === 'object' && 'name' in overrideForm && typeof overrideForm.name === 'string') 
      ? overrideForm 
      : undefined;
    const activeForm = validOverride || form;

    try {
      // 1. Create Order with Guest/User Details
      const orderRes = await fetch('/api/seminars/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          seminarId: seminar.id,
          ...activeForm
        }),
      });

      if (!orderRes.ok) {
        const err = await orderRes.json();
        throw new Error(err.details ? `${err.error}: ${err.details}` : (err.error || 'Failed to initiate payment'));
      }

      const orderData = await orderRes.json();

      // 2. Load Razorpay SDK
      const loadRazorpay = (): Promise<boolean> => {
        return new Promise((resolve) => {
          if (typeof window !== 'undefined' && (window as any).Razorpay) {
            resolve(true);
            return;
          }
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.async = true;
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });
      };

      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
      }

      // 3. Open Razorpay
      const options: any = {
        key: orderData.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount || 49900,
        currency: orderData.currency || "INR",
        name: "SARTHI",
        description: `Registration for ${seminar.title}`,
        prefill: {
          name: activeForm.name,
          email: activeForm.email,
          contact: activeForm.phone,
        },
        theme: { color: "#1C3A2F" },
        handler: async (response: any) => {
          try {
            // 3. Verify Payment
            const verifyRes = await fetch('/api/seminars/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response?.razorpay_order_id || orderData.orderId || `order_sem_${Date.now()}`,
                razorpay_payment_id: response?.razorpay_payment_id || `pay_sem_${Date.now()}`,
                razorpay_signature: response?.razorpay_signature || 'fallback_sig',
                seminarId: seminar.id,
                email: activeForm.email
              }),
            });

            if (verifyRes.ok) {
              setStep(3);
            } else {
              const err = await verifyRes.json();
              setPayError(err.error || 'Payment verification failed');
            }
          } catch (err) {
            setPayError('Verification failed. Please contact support.');
          } finally {
            setPaying(false);
          }
        },
        modal: {
          onhighlight: function() {},
          ondismiss: function() {
            setPaying(false);
            setPayError('Payment was cancelled. You can try again or use manual payment.');
          }
        }
      };

      if (orderData.orderId && !orderData.orderId.startsWith('order_sem_')) {
        options.order_id = orderData.orderId;
      }

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (err: any) {
      console.error('Payment error:', err);
      setPayError(err.message || 'Could not initiate payment');
      setPaying(false);
    }
  }, [seminar, form]);

  const handleCalendar = (type: 'google' | 'outlook' | 'apple') => {
    if (!seminar?.scheduledAt) return;
    const start = new Date(seminar.scheduledAt);
    const duration = seminar.durationMinutes ?? seminar.duration ?? 60;
    const end = new Date(start.getTime() + duration * 60 * 1000);
    
    const formatDate = (d: Date) => d.toISOString().replace(/-|:|\.\d{3}/g, '');
    const formatApple = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const title = encodeURIComponent(seminar.title);
    const desc = encodeURIComponent(`Join the SARTHI seminar: ${window.location.origin}/seminars/${params.slug}/live`);
    
    if (type === 'google') {
      window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formatDate(start)}/${formatDate(end)}&description=${desc}`, '_blank');
    } else if (type === 'outlook') {
      window.open(`https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&body=${desc}&startdt=${formatDate(start)}&enddt=${formatDate(end)}`, '_blank');
    } else {
      const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${formatApple(start)}
DTEND:${formatApple(end)}
SUMMARY:${seminar.title}
DESCRIPTION:${desc}
URL:${window.location.origin}/seminars/${params.slug}/live
END:VEVENT
END:VCALENDAR`;
      const blob = new Blob([icsContent], { type: 'text/calendar' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'seminar.ics';
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  if (pageLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F0E8]">
      <Loader2 className="w-10 h-10 animate-spin text-[#1C3A2F]" />
    </div>
  );

  if (!seminar) return (
    <div className="min-h-screen bg-[#F5F0E8] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md bg-[#FDFAF7] p-12 rounded-[48px] shadow-2xl border border-[#E8E2D9]">
        <AlertCircle className="w-16 h-16 text-[#C8A96A] mx-auto mb-6" />
        <h1 className="text-3xl font-black text-[#1C3A2F] mb-4 uppercase tracking-tighter">Event Not Found</h1>
        <p className="text-[#5D705C] font-semibold mb-10 leading-relaxed">
          The seminar you are looking for is either completed or the link has expired.
        </p>
        <Link href="/seminars" className="inline-block w-full py-5 bg-[#1C3A2F] text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-[#1C3A2F]/20 hover:bg-[#254D3E] transition-all">
          BROWSE UPCOMING EVENTS
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F0E8] py-20 px-6 font-sans text-[#1A1A18]">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div>
          <Image 
            src={seminar?.thumbnailUrl || seminar?.thumbnail || '/seminar-thumbnails/stand-out-on-linkedin.png'} 
            alt="banner" width={600} height={400} 
            className="rounded-[40px] shadow-2xl mb-12 border-8 border-white/50 object-cover" 
          />
          <div className="inline-flex items-center gap-2 bg-[#1C3A2F]/5 px-4 py-2 rounded-full mb-6 border border-[#1C3A2F]/10">
            <Zap className="w-4 h-4 text-[#C8A96A] fill-[#C8A96A]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1C3A2F]">Live Skill Mastery Webclass</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[#1C3A2F] mb-8 leading-[1.05] tracking-tight">
            Level Up Your <br />
            <span className="text-[#C8A96A]">Professional Skills</span>
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed mb-10 max-w-xl font-medium">
            Join thousands of professionals in this exclusive live session. Master the latest industry trends and boost your career growth.
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-3 bg-[#FDFAF7] px-6 py-4 rounded-3xl border border-[#E8E2D9] shadow-sm">
              <Calendar className="w-5 h-5 text-[#C8A96A]" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Date</span>
                <span className="font-bold text-[#1A1A18] text-sm">
                  {seminar?.scheduledAt || seminar?.date ? new Date(seminar.scheduledAt || seminar.date!).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' }) : '5 September'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-[#FDFAF7] px-6 py-4 rounded-3xl border border-[#E8E2D9] shadow-sm">
              <User className="w-5 h-5 text-[#C8A96A]" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Speaker</span>
                <span className="font-bold text-[#1A1A18] text-sm">{seminar?.speakerName || 'Dr. Mukul Pandey'}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="relative">
          {/* Form Panel */}
          <div ref={panelRef} className="bg-[#FDFAF7] rounded-[48px] shadow-2xl border border-[#E8E2D9] w-full flex flex-col overflow-hidden">
            <div className="p-8 md:p-12">
              <TimerBadge />
              <StepIndicator current={step} />
              <div style={{ position: 'relative', minHeight: step === 1 ? 580 : 500 }}>
                <AnimatePresence mode="wait" custom={dir}>
                  {step === 1 && (
                    <motion.div key="step1" custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit">
                      {seminar && <PriceBanner seminar={seminar} />}
                      <div className="space-y-5 mb-7">
                        <FieldInput 
                          label="Full Name" 
                          id="name" 
                          value={form.name} 
                          icon={User} 
                          onChange={(e: any) => handleFieldChange('name', e.target.value)} 
                          error={errors.name} 
                          placeholder="Enter your full name"
                        />
                        <FieldInput 
                          label="Email Address" 
                          id="email" 
                          value={form.email} 
                          icon={Mail} 
                          onChange={(e: any) => handleFieldChange('email', e.target.value)} 
                          error={errors.email} 
                          placeholder="your@email.com"
                        />
                        <FieldInput 
                          label="Phone Number" 
                          id="phone" 
                          value={form.phone} 
                          icon={Phone} 
                          onChange={(e: any) => handleFieldChange('phone', e.target.value)} 
                          error={errors.phone} 
                          placeholder="10-digit mobile number"
                        />
                        <FieldInput 
                          label="City" 
                          id="city" 
                          value={form.city} 
                          icon={MapPin} 
                          onChange={(e: any) => handleFieldChange('city', e.target.value)} 
                          error={errors.city} 
                          placeholder="Your city"
                        />
                        <FieldSelect 
                          label="Profession" 
                          id="profession" 
                          value={form.profession} 
                          options={PROFESSIONS} 
                          icon={Briefcase} 
                          onChange={(e: any) => handleFieldChange('profession', e.target.value)} 
                          error={errors.profession} 
                        />
                        <FieldSelect 
                          label="How did you find us?" 
                          id="source" 
                          value={form.referralSource} 
                          options={REFERRALS} 
                          icon={Share2} 
                          onChange={(e: any) => handleFieldChange('referralSource', e.target.value)} 
                          error={errors.referralSource} 
                        />
                      </div>
                      
                      {/* Form Progress Indicator */}
                      <div className="mb-6">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-[#5D705C] mb-2">
                          <span>Fill Details</span>
                          <span>{isFormComplete() ? '✓ Ready' : `${Object.values(form).filter(v => v).length}/6 fields`}</span>
                        </div>
                        <div className="h-1.5 bg-[#F0F2F8] rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-gradient-to-r from-[#2D6A4F] to-[#1A3C2E] rounded-full"
                            initial={{ width: '0%' }}
                            animate={{ width: `${(Object.values(form).filter(v => v).length / 6) * 100}%` }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                          />
                        </div>
                      </div>

                      <motion.button 
                        onClick={handleContinue} 
                        disabled={saving || !isFormComplete()}
                        whileHover={{ scale: saving || !isFormComplete() ? 1 : 1.02 }}
                        whileTap={{ scale: saving || !isFormComplete() ? 1 : 0.98 }}
                        className={cn(
                          "w-full py-6 rounded-2xl font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 text-sm",
                          saving ? "bg-[#1C3A2F] cursor-wait" : 
                          isFormComplete() ? "bg-[#1C3A2F] text-white hover:bg-[#254D3E] shadow-xl shadow-[#1C3A2F]/20" : 
                          "bg-gray-100 text-gray-400 cursor-not-allowed"
                        )}
                      >
                        {saving ? (
                          <><Loader2 className="w-5 h-5 animate-spin" /> Please Wait...</>
                        ) : (
                          <>
                            {isFormComplete() ? 'REGISTER FOR MASTERCLASS' : 'COMPLETE ALL FIELDS'}
                            <ArrowRight className="w-5 h-5" />
                          </>
                        )}
                      </motion.button>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div key="step2" custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit">
                      {/* Success indicator */}
                      <div className="bg-[#10B981]/5 p-5 rounded-3xl mb-8 flex items-center gap-4 border border-[#10B981]/10">
                        <div className="w-12 h-12 bg-[#10B981] rounded-full flex items-center justify-center shadow-lg shadow-[#10B981]/20">
                          <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-[11px] font-black text-[#10B981] uppercase tracking-[0.2em] mb-0.5">Details Locked</p>
                          <p className="text-xs text-gray-500 font-medium">Proceed to confirm your registration</p>
                        </div>
                      </div>

                      {seminar && <PriceBanner seminar={seminar} />}

                      {/* Simplified Payment - Single CTA */}
                      <div className="mb-8 p-6 bg-white border border-[#E8E2D9] rounded-3xl shadow-sm">
                        <div className="flex items-center gap-3 text-[#1C3A2F] mb-4">
                          <div className="w-8 h-8 rounded-full bg-[#1C3A2F]/5 flex items-center justify-center">
                            <ShieldCheck className="w-5 h-5 text-[#1C3A2F]" />
                          </div>
                          <span className="text-sm font-black uppercase tracking-wider">Secure Checkout</span>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed font-medium">
                          Secure processing via Razorpay. Pay once and get instant lifetime access to the seminar recording, materials, and certificates.
                        </p>
                      </div>

                      <div className="mt-6 text-center">
                        <a 
                          href="https://razorpay.me/@sarthi" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-[#C8A96A] hover:text-[#1C3A2F] transition-colors text-[11px] font-black uppercase tracking-[0.2em] group"
                        >
                          <Zap className="w-3.5 h-3.5 fill-[#C8A96A] group-hover:fill-[#1C3A2F] transition-all" /> 
                          Manual Flexible Payment (Enter Amount)
                        </a>
                      </div>

                      <motion.button 
                        onClick={() => handlePay()} 
                        disabled={paying}
                        whileHover={{ scale: paying ? 1 : 1.02 }}
                        whileTap={{ scale: paying ? 1 : 0.98 }}
                        className="w-full py-6 bg-[#1C3A2F] text-white rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-[#254D3E] transition-all flex items-center justify-center gap-3 shadow-xl shadow-[#1C3A2F]/20 text-sm"
                      >
                        {paying ? (
                          <><Loader2 className="w-5 h-5 animate-spin" /> Finalizing...</>
                        ) : (
                          <><CreditCard className="w-5 h-5" /> COMPLETE PAYMENT</>
                        )}
                      </motion.button>

                      {/* Back button */}
                      <button 
                        onClick={() => goTo(1)} 
                        disabled={paying}
                        className="w-full mt-3 py-3 text-[#5D705C] text-xs font-bold uppercase tracking-wider hover:text-[#1A3C2E] transition-colors"
                      >
                        ← Back to Details
                      </button>
                    </motion.div>
                  )}


                  {step === 3 && (
                    <motion.div key="step3" custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit" className="text-center py-8">
                      <div className="w-24 h-24 bg-[#10B981]/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-[#10B981]/20">
                        <CheckCircle className="w-12 h-12 text-[#10B981]" />
                      </div>
                      <h2 className="text-3xl font-black text-[#1C3A2F] mb-4">Registration Success!</h2>
                      <p className="text-gray-500 font-medium mb-10 max-w-sm mx-auto leading-relaxed">
                        Excellent! Your spot has been secured. We&apos;ve sent the session link and materials to <span className="text-[#1C3A2F] font-bold">{form.email}</span>.
                      </p>
                      <div className="space-y-4">
                        <div className="flex gap-2">
                          <button onClick={() => handleCalendar('google')} className="flex-1 py-4 bg-white border-2 border-[#E8E2D9] text-[#1C3A2F] rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-50 transition-all text-xs">
                            Google
                          </button>
                          <button onClick={() => handleCalendar('outlook')} className="flex-1 py-4 bg-white border-2 border-[#E8E2D9] text-[#1C3A2F] rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-50 transition-all text-xs">
                            Outlook
                          </button>
                          <button onClick={() => handleCalendar('apple')} className="flex-1 py-4 bg-white border-2 border-[#E8E2D9] text-[#1C3A2F] rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-50 transition-all text-xs">
                            Apple
                          </button>
                        </div>
                        <Link href="/dashboard" className="w-full py-5 bg-[#1C3A2F] text-white rounded-2xl font-black uppercase tracking-[0.2em] block shadow-xl shadow-[#1C3A2F]/20 hover:bg-[#254D3E] transition-all">
                          GO TO MY DASHBOARD
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
          
          <AnimatePresence>
            {payError && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="absolute -bottom-24 left-0 right-0 bg-white p-6 rounded-[32px] border border-red-100 shadow-2xl z-50 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-red-500" />
                <div className="flex items-start gap-4 mb-4">
                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                    </div>
                    <div className="text-left">
                        <p className="text-[11px] font-black text-red-500 uppercase tracking-widest mb-1">Payment Interaction Error</p>
                        <p className="text-xs text-gray-600 font-bold leading-tight">{payError}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                   <button onClick={() => setPayError('')} className="flex-1 py-3 bg-gray-50 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all text-gray-400">Dismiss</button>
                   <a href="https://razorpay.me/@sarthi" target="_blank" rel="noopener noreferrer" className="flex-[2] py-3 bg-[#1C3A2F] text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#254D3E] shadow-lg shadow-[#1C3A2F]/20">
                       <ExternalLink className="w-3 h-3" /> SWITCH TO MANUAL
                   </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
