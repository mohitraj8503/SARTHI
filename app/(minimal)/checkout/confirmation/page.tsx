'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  Mail,
  Home,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Star,
  PlayCircle,
} from 'lucide-react';
import Link from 'next/link';

interface PaymentDetails {
  courseTitle: string;
  transactionId: string;
  amount: number;
  submittedAt: string;
  status: string;
  courseId?: string;
}

function PaymentConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams?.get('orderId');
  const router = useRouter();

  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        const response = await fetch(`/api/payments/status?orderId=${orderId}`);
        const data = await response.json();
        setPaymentDetails(data);
      } catch (error) {
        console.error('Failed to fetch payment details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!orderId) {
      router.push('/dashboard');
      return;
    }

    fetchPaymentDetails();

    // Poll for payment status until it's completed
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/payments/status?orderId=${orderId}`);
        const data = await response.json();
        
        if (data.status === 'succeeded') {
          clearInterval(pollInterval);
          setPaymentDetails(data);
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(pollInterval);
  }, [orderId, router]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '...';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">
            Confirming Enrollment...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          {/* Main Success Message */}
          <div className="lg:col-span-12 mb-10 text-center space-y-4">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center justify-center w-24 h-24 bg-green-50 rounded-[2.5rem] border border-green-100 text-green-500 mb-6"
            >
              <CheckCircle className="w-12 h-12" />
            </motion.div>
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-black text-brand-dark tracking-tighter"
            >
              Enrollment <span className="text-brand-orange">Successful!</span>
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-gray-500 font-medium text-lg max-w-2xl mx-auto"
            >
              Welcome to the future of learning. Your access is now live and you can begin your
              journey immediately.
            </motion.p>
          </div>

          {/* Left: Stats & Info */}
          <div className="lg:col-span-7 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm space-y-8"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-black text-brand-dark leading-none">Order Digest</h3>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2 px-1">
                    ID: {orderId}
                  </p>
                </div>
                <div className="px-5 py-2 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100">
                  Verified In Real-time
                </div>
              </div>

              <div className="space-y-6 pt-8 border-t border-gray-50">
                <DetailRow label="Course Title" value={paymentDetails?.courseTitle || '...'} />
                <DetailRow
                  label="Transaction ID"
                  value={paymentDetails?.transactionId || '...'}
                  isMono
                />
                <DetailRow label="Investment" value={`₹${paymentDetails?.amount || 0}`} />
                <DetailRow
                  label="Date Issued"
                  value={formatDate(paymentDetails?.submittedAt || '')}
                />
              </div>

              <div className="pt-8">
                <Link
                  href={`/courses/${paymentDetails?.courseId || ''}/learn`}
                  className="w-full bg-brand-dark text-white py-6 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl hover:-translate-y-1 transition active:scale-95 flex items-center justify-center gap-3 text-xs"
                >
                  <PlayCircle className="w-5 h-5 text-brand-orange" />
                  Jump into Classroom
                </Link>
              </div>
            </motion.div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100/50 space-y-2">
                <Mail className="w-6 h-6 text-blue-500" />
                <h4 className="font-black text-brand-dark uppercase tracking-widest text-[10px]">
                  Receipt Sent
                </h4>
                <p className="text-gray-500 text-[10px] font-medium leading-tight">
                  A digital invoice has been sent to your registered email.
                </p>
              </div>
              <div className="bg-purple-50/50 p-6 rounded-[2rem] border border-purple-100/50 space-y-2">
                <ShieldCheck className="w-6 h-6 text-purple-500" />
                <h4 className="font-black text-brand-dark uppercase tracking-widest text-[10px]">
                  LMS Access
                </h4>
                <p className="text-gray-500 text-[10px] font-medium leading-tight">
                  Your student dashboard has been updated with new 24/7 access.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Next Steps */}
          <div className="lg:col-span-5 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-brand-orange text-white rounded-[3rem] p-10 shadow-2xl shadow-orange-100 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
              <div className="relative z-10 space-y-8">
                <div className="space-y-2">
                  <h3 className="text-2xl font-black leading-tight tracking-tight">
                    Start Your <br /> Mastery Today.
                  </h3>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-3 h-3 fill-current text-white/50" />
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <StepItem num="01" text="Complete your profile" />
                  <StepItem num="02" text="Introduce yourself in Forum" />
                  <StepItem num="03" text="Watch the intro module" />
                </div>

                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:translate-x-2 transition-transform"
                >
                  View My Learning <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>

            <div className="flex flex-col gap-4">
              <Link
                href="/dashboard"
                className="flex items-center justify-center gap-2 bg-white text-gray-400 p-8 rounded-[2.5rem] border border-gray-100 text-center font-black uppercase tracking-widest text-[10px] hover:text-brand-dark hover:border-brand-dark transition-all"
              >
                <BookOpen className="w-4 h-4" /> Return to Catalog
              </Link>
              <Link
                href="/"
                className="flex items-center justify-center gap-2 text-gray-400 hover:text-brand-dark font-black uppercase tracking-widest text-[10px] transition-all"
              >
                <Home className="w-4 h-4" /> Back to Homepage
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value, isMono }: { label: string; value: string; isMono?: boolean }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">{label}</span>
      <span
        className={`text-brand-dark font-black ${
          isMono ? 'font-mono bg-gray-50 px-3 py-1 rounded-lg text-xs' : ''
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function StepItem({ num, text }: { num: string; text: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-[10px] font-black bg-white/20 px-2 py-1 rounded-md">{num}</span>
      <p className="font-bold text-sm tracking-tight">{text}</p>
    </div>
  );
}

export default function PaymentConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-brand-orange border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <PaymentConfirmationContent />
    </Suspense>
  );
}

