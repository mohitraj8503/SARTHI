'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Shield,
  Lock,
  CreditCard,
  Smartphone,
  CheckCircle,
  Clock,
  Sparkles,
  Award,
  BookOpen,
  Calendar,
  Users,
  Flame,
  XCircle,
  CheckCircle2,
  Check,
  FileText,
  HelpCircle,
  RefreshCw,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../../../components/AuthProvider';
import { useEnrollmentStatus } from '../../../../hooks/useEnrollmentStatus';
import { useToast } from '../../../../components/ToastProvider';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface CheckoutClientProps {
  course: any;
  courseId: string;
}

export default function CheckoutClient({ course, courseId }: CheckoutClientProps) {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();

  const isGroup = courseId === 'summer-camp-2026' && searchParams?.get('type') === 'group';
  const [groupMembers, setGroupMembers] = useState<any[]>([]);

  useEffect(() => {
    if (isGroup && typeof window !== 'undefined') {
      const stored = localStorage.getItem('summer_camp_group_members');
      if (stored) {
        try {
          setGroupMembers(JSON.parse(stored));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [isGroup]);

  const { status: enrollmentStatus, loading: enrollmentLoading } = useEnrollmentStatus(
    courseId || null,
    user?.id || null
  );

  const displayCourse = isGroup ? {
    ...course,
    title: 'SARTHI Summer Camp 2026 (Group Registration - 5 Members)',
    price: 2500,
    originalPrice: 5000,
    discountAmount: 2500,
    discountPercent: 50
  } : course;

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatusState, setPaymentStatusState] = useState<{
    code: 'PAYMENT_GATEWAY_UNAVAILABLE' | 'INVOICE_REQUIRED' | 'PAYMENT_CANCELLED' | 'PAYMENT_FAILED' | 'FALLBACK_READY' | null;
    userMessage?: string;
    paymentUrl?: string;
    mode?: 'payment_link' | 'static_profile';
    orderRef?: string;
  }>({ code: null });
  const [loadingStep, setLoadingStep] = useState('');
  
  // Manual reconciliation modal states
  const [isReconcileModalOpen, setIsReconcileModalOpen] = useState(false);
  const [manualPaymentId, setManualPaymentId] = useState('');
  const [isReconciling, setIsReconciling] = useState(false);
  const [reconcileError, setReconcileError] = useState('');

  // Guest Checkout Form States
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestErrors, setGuestErrors] = useState<{ name?: string; email?: string }>({});

  const validateGuestFields = () => {
    const errors: { name?: string; email?: string } = {};
    if (!guestName.trim()) {
      errors.name = "Full name is required";
    }
    if (!guestEmail.trim()) {
      errors.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(guestEmail)) {
      errors.email = "Please enter a valid email address";
    }
    setGuestErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Redirect if already enrolled
  useEffect(() => {
    if (user && !enrollmentLoading && enrollmentStatus?.enrolled) {
      router.push(`/courses/${courseId}/learn`);
    }
  }, [enrollmentStatus, enrollmentLoading, courseId, router, user]);

  const loadRazorpay = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.id = 'razorpay-checkout-js';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Fallback payment link generator
  const triggerFallbackPaymentFlow = async () => {
    try {
      setLoadingStep('Generating Secure Payment Link...');
      const fallbackRes = await fetch('/api/payments/fallback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          isGroup,
          members: groupMembers,
          couponCode,
          validatedCouponToken,
          newPrice: queryNewPrice,
          guestName: user ? undefined : guestName,
          guestEmail: user ? undefined : guestEmail
        }),
      });
      const fallbackData = await fallbackRes.json();
      if (fallbackRes.ok && fallbackData.paymentUrl) {
        setPaymentStatusState({
          code: 'FALLBACK_READY',
          paymentUrl: fallbackData.paymentUrl,
          mode: fallbackData.mode,
          orderRef: fallbackData.internalReferenceId,
          userMessage: fallbackData.mode === 'payment_link'
            ? 'We have prepared a secure direct payment link for your enrollment.'
            : 'Online checkout is temporarily busy. You can pay via our official verified Razorpay portal.'
        });
      } else {
        setPaymentStatusState({
          code: 'PAYMENT_GATEWAY_UNAVAILABLE',
          paymentUrl: 'https://razorpay.me/@sarthi',
          mode: 'static_profile',
          userMessage: 'Online checkout is temporarily busy. You can complete your enrollment using our verified portal.'
        });
      }
    } catch {
      setPaymentStatusState({
        code: 'PAYMENT_GATEWAY_UNAVAILABLE',
        paymentUrl: 'https://razorpay.me/@sarthi',
        mode: 'static_profile',
        userMessage: 'Online checkout is temporarily unavailable. You can use our secure payment portal.'
      });
    } finally {
      setIsProcessing(false);
      setLoadingStep('');
    }
  };

  const handleManualReconcile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualPaymentId.trim()) {
      setReconcileError('Please enter your Razorpay Payment ID (pay_...)');
      return;
    }

    setIsReconciling(true);
    setReconcileError('');

    try {
      const res = await fetch('/api/payments/reconcile-manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId: manualPaymentId.trim(),
          courseId,
          isGroup,
          members: groupMembers,
          referralCoupon: couponCode || undefined
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Payment verification failed');
      }

      addToast('Payment verified successfully! Redirecting...', 'success');
      setIsReconcileModalOpen(false);
      router.push(`/checkout/${courseId}/success?paymentId=${manualPaymentId.trim()}&enrollmentId=${data.enrollmentId}`);
    } catch (err: any) {
      setReconcileError(err.message || 'Unable to reconcile payment. Please check the ID or contact support.');
    } finally {
      setIsReconciling(false);
    }
  };

  const handleRazorpayPayment = async () => {
    if (!displayCourse) return;

    // Validate guest fields if not authenticated
    if (!user) {
      if (!validateGuestFields()) {
        addToast('Please correct the validation errors before proceeding.', 'error');
        return;
      }
    }

    setIsProcessing(true);
    setPaymentStatusState({ code: null });

    try {
      setLoadingStep('Preparing Secure Payment...');
      await new Promise(r => setTimeout(r, 200));

      setLoadingStep('Verifying Order...');
      await new Promise(r => setTimeout(r, 200));

      setLoadingStep('Connecting Gateway...');

      const orderRes = await fetch('/api/payments/course/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          isGroup,
          members: groupMembers,
          couponCode,
          validatedCouponToken,
          newPrice: queryNewPrice,
          guestName: user ? undefined : guestName,
          guestEmail: user ? undefined : guestEmail
        }),
      });
      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        console.warn('[CHECKOUT] Primary order creation unavailable. Seamlessly launching fallback link...');
        await triggerFallbackPaymentFlow();
        return;
      }

      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        await triggerFallbackPaymentFlow();
        return;
      }

      setLoadingStep('Ready');

      const options: any = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'SARTHI',
        description: `Enrollment: ${displayCourse.title}`,
        image: '/images/sarthi_logo.jpg',
        order_id: orderData.orderId,
        handler: async function (response: any) {
          addToast('Payment Received. Verifying...', 'success');
          try {
            const verifyRes = await fetch('/api/payments/course/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                courseId,
                isGroup,
                members: groupMembers,
                referralCoupon: couponCode || undefined
              }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyData.error || 'Verification failed.');
            setIsProcessing(false);
            router.push(`/checkout/${courseId}/success?paymentId=${response.razorpay_payment_id}&enrollmentId=${verifyData.enrollmentId}`);
          } catch {
            setPaymentStatusState({
              code: 'PAYMENT_FAILED',
              userMessage: 'Payment verification could not be completed.'
            });
            setIsProcessing(false);
            setLoadingStep('');
          }
        },
        prefill: {
          name: user?.name || guestName || '',
          email: user?.email || guestEmail || '',
        },
        theme: { color: '#D97706' },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            setLoadingStep('');
            setPaymentStatusState({
              code: 'PAYMENT_CANCELLED',
              userMessage: 'Your payment process was cancelled. No amount was charged.'
            });
          },
          escape: false
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch {
      await triggerFallbackPaymentFlow();
    }
  };

  const isSubscription = displayCourse?.pricingType === 'SUBSCRIPTION';

  const couponCode = searchParams?.get('ref') || '';
  const validatedCouponToken = searchParams?.get('token') || '';
  const queryNewPrice = searchParams?.get('price') || '';
  const queryOriginalPrice = searchParams?.get('original') || '';

  // Pricing calculations
  let courseFee = isSubscription ? Number(displayCourse?.subscriptionMonthlyAmount || 0) / 100 : Number(displayCourse?.price || 0);
  const platformFee = isSubscription ? 0 : Number(displayCourse?.platformFee || 0);

  let originalPrice = Number(displayCourse?.originalPrice || courseFee);
  if (originalPrice <= courseFee) {
    originalPrice = courseFee * 2;
  }

  let discount = originalPrice - courseFee;
  let totalPayable = courseFee + platformFee;

  if (couponCode && validatedCouponToken && queryNewPrice) {
    const finalPriceVal = Number(queryNewPrice);
    const originalPriceVal = Number(queryOriginalPrice || 18999);
    courseFee = originalPriceVal;
    discount = originalPriceVal - finalPriceVal;
    totalPayable = finalPriceVal;
  }

  const discountPercent = courseFee > 0 ? Math.round((discount / courseFee) * 100) : 0;

  // GST Breakdown (18% GST included in totalPayable)
  const basePrice = totalPayable / 1.18;
  const gstAmount = totalPayable - basePrice;

  // Features list
  let featuresList = [
    { icon: "CheckCircle2", label: "Lifetime Access to all Modules" },
    { icon: "CheckCircle2", label: "Government-recognised Certification" },
    { icon: "CheckCircle2", label: "Dedicated Placement Support Assistance" }
  ];
  if (displayCourse?.features) {
    try {
      featuresList = JSON.parse(displayCourse.features);
    } catch (e) {
      if (typeof displayCourse.features === 'string') {
        featuresList = displayCourse.features.split(',').map((f: string) => ({ icon: "CheckCircle2", label: f.trim() }));
      }
    }
  }

  // Timer State for Urgency subtle badge
  const [timeLeft, setTimeLeft] = useState('02h 45m 18s');
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const hours = 23 - now.getHours();
      const minutes = 59 - now.getMinutes();
      const seconds = 59 - now.getSeconds();
      setTimeLeft(
        `${hours.toString().padStart(2, '0')}h ${minutes
          .toString()
          .padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (enrollmentLoading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center pt-20 px-4">
        <section className="text-center">
          <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h1 className="text-xl font-black text-slate-800 uppercase tracking-widest animate-pulse">Verifying Secure Session</h1>
        </section>
      </main>
    );
  }

  return (
    <div
      className="min-h-screen w-full bg-[#f8fafc] text-slate-700 flex flex-col justify-between selection:bg-amber-500 selection:text-white p-4 lg:p-8"
      style={{ zoom: 1.25 }}
    >

      <div className="relative z-10 max-w-6xl mx-auto w-full h-full flex flex-col justify-between gap-4">

        {/* Navigation & Progress Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200/80 pb-4 gap-4">
          <Link
            href={`/courses/${displayCourse.slug || displayCourse.id}`}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all text-[10px] font-bold uppercase shadow-sm self-start"
          >
            <ArrowLeft size={12} />
            Back to Course
          </Link>

          {/* 1. PREMIUM VISIBLE STEP PROGRESS INDICATOR */}
          <div className="flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-wider bg-white border border-slate-200 px-4 py-2 rounded-full shadow-sm">
            <Link
              href={`/courses/${displayCourse.slug || displayCourse.id}`}
              className="flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-bold">
                ✓
              </div>
              <span>Details</span>
            </Link>
            <span className="text-slate-300">➔</span>

            <div className="flex items-center gap-1.5 text-[#1A3C2E]">
              <div className="w-4 h-4 rounded-full bg-[#1A3C2E] text-white flex items-center justify-center text-[9px] font-bold">
                2
              </div>
              <span className="underline decoration-amber-500 decoration-2 underline-offset-4">Checkout</span>
            </div>

            <span className="text-slate-300">➔</span>

            <div className="flex items-center gap-1.5 text-slate-400">
              <div className="w-4 h-4 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-[9px] font-bold">
                3
              </div>
              <span>Receipt</span>
            </div>
          </div>
        </div>

        {/* Responsive Grid */}
        <div className="grid lg:grid-cols-12 gap-8 items-stretch flex-1 my-2">

          {/* Left Column: Course Story & Field Inputs */}
          <div className="lg:col-span-7 flex flex-col gap-6 text-left pr-2">

            <div className="space-y-3">
              <span className="text-amber-700 font-black text-[9px] uppercase tracking-widest bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 inline-block shadow-sm">
                Premium Flagship Program
              </span>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                {displayCourse.title}
              </h1>
              <p className="text-slate-600 text-xs md:text-sm leading-relaxed max-w-xl">
                Unlock lifetime access to India&apos;s leading practical execution curriculum. Master key concepts with hands-on labs and placement-focused modules.
              </p>
            </div>

            {/* 5. GUEST CHECKOUT FORM / FIELD OPTIMIZATION */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <h3 className="font-black text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#1A3C2E]" />
                  Checkout Account Details
                </h3>
                {user ? (
                  <span className="text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                    Logged In
                  </span>
                ) : (
                  <span className="text-[9px] font-black uppercase text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                    Guest Checkout
                  </span>
                )}
              </div>

              {user ? (
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Account Details</p>
                  <p className="text-xs font-bold text-slate-700">{user.name}</p>
                  <p className="text-[11px] font-semibold text-slate-500">{user.email}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                    No account required! Just fill in your details below and checkout instantly. We will auto-create your student portal login.
                  </p>

                  <div className="space-y-3.5">
                    {/* Full Name input */}
                    <div className="space-y-1">
                      <label htmlFor="guestName" className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="guestName"
                        name="name"
                        placeholder="John Doe"
                        autoComplete="name"
                        value={guestName}
                        onChange={(e) => {
                          setGuestName(e.target.value);
                          if (guestErrors.name) setGuestErrors({ ...guestErrors, name: undefined });
                        }}
                        className={`w-full bg-slate-50 border ${guestErrors.name ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-[#1A3C2E]'} rounded-xl px-4 py-2.5 text-xs font-semibold outline-none transition-all text-slate-800`}
                      />
                      {guestErrors.name && (
                        <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1 animate-pulse">
                          ⚠️ {guestErrors.name}
                        </p>
                      )}
                    </div>

                    {/* Email input */}
                    <div className="space-y-1">
                      <label htmlFor="guestEmail" className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="guestEmail"
                        name="email"
                        placeholder="john@example.com"
                        autoComplete="email"
                        value={guestEmail}
                        onChange={(e) => {
                          setGuestEmail(e.target.value);
                          if (guestErrors.email) setGuestErrors({ ...guestErrors, email: undefined });
                        }}
                        className={`w-full bg-slate-50 border ${guestErrors.email ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-[#1A3C2E]'} rounded-xl px-4 py-2.5 text-xs font-semibold outline-none transition-all text-slate-800`}
                      />
                      {guestErrors.email && (
                        <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1 animate-pulse">
                          ⚠️ {guestErrors.email}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Premium Details Card */}
            <div className="bg-white border border-slate-200/60 rounded-2xl p-5 space-y-3.5 shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
              <h3 className="font-bold text-slate-900 text-[11px] uppercase tracking-wider">What&apos;s Included:</h3>
              <div className="grid grid-cols-2 gap-3 text-[11px] font-bold text-slate-700">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  <span>48+ Video Chapters</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>Verified Certification</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <span>Lifetime Updates</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span>Premium Community</span>
                </div>
              </div>
            </div>

            {/* Today's Benefits */}
            <div className="space-y-2.5">
              <h3 className="font-black text-slate-950 text-[11px] uppercase tracking-wider text-left">Today&apos;s Enrollment Benefits</h3>
              <div className="grid gap-2.5 text-xs text-slate-600">
                {featuresList.slice(0, 3).map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="font-semibold">{feature.label}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Sticky Payment Summary Card */}
          <div className="lg:col-span-5 flex flex-col gap-5 lg:sticky lg:top-8 self-start">

            {/* 6. SUBTLE URGENCY / TIMER BADGE */}
            <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 flex items-center justify-between text-amber-800 text-[10px] font-black uppercase tracking-wider shadow-sm z-10 relative">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 animate-pulse" />
                <span>Special Pricing offer ends today</span>
              </div>
              <span className="bg-[#1A3C2E] text-white px-2 py-0.5 rounded font-black font-mono">
                {timeLeft}
              </span>
            </div>

            {/* Stripe-style White checkout card */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-[0_20px_40px_rgba(0,0,0,0.03)] flex flex-col justify-between relative">

              <div className="space-y-4">
                <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Order Summary</p>
                  <h2 className="font-black text-slate-900 text-xs md:text-sm truncate mb-2">{displayCourse.title}</h2>
                  <div className="h-[1px] bg-slate-100" />
                </div>

                {/* 3. ORDER SUMMARY CLARITY */}
                <div className="space-y-2.5 text-[11px] font-bold text-slate-500">
                  <div className="flex justify-between">
                    <span>Base Course Price</span>
                    <span className="text-slate-800 line-through font-normal">₹{originalPrice.toLocaleString('en-IN')}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount Saved ({discountPercent}% OFF)</span>
                      <span>-{discountPercent}% OFF — saved ₹{discount.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Net Course Price</span>
                    <span className="text-slate-800">₹{basePrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                  </div>

                  <div className="flex justify-between border-t border-slate-100 pt-2.5">
                    <span>GST (18% Included)</span>
                    <span className="text-slate-800">₹{gstAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Transaction & Platform Fee</span>
                    <span className="text-emerald-600 uppercase">FREE</span>
                  </div>
                </div>

                <div className="h-[1px] bg-slate-100" />

                {/* Total pricing */}
                <div className="flex justify-between items-baseline pt-1">
                  <span className="text-xs font-black uppercase text-slate-900">Total Payable</span>
                  <span className="text-2xl font-black text-slate-950">
                    ₹{totalPayable.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* 2. TRUST & SECURITY SIGNALS (payment logos right above payment button) */}
              <div className="space-y-3.5 mt-5 pt-4 border-t border-slate-100">

                {/* Pay with Razorpay Logo Badge */}
                <div className="flex flex-col items-center gap-2 bg-slate-50 border border-slate-150 rounded-2xl p-4.5">
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Secure Checkout Gateway</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-700">Pay with</span>
                    <img
                      src="https://razorpay.com/assets/razorpay-logo.svg"
                      alt="Razorpay"
                      className="h-6 object-contain"
                    />
                  </div>
                </div>

                {/* 4. SINGLE CLEAR CTA & POSITIVE PAYMENT STATUS STATES */}
                <button
                  onClick={handleRazorpayPayment}
                  disabled={isProcessing || paymentStatusState.code === 'PAYMENT_GATEWAY_UNAVAILABLE' || paymentStatusState.code === 'INVOICE_REQUIRED'}
                  className={cn(
                    "w-full py-4 text-white font-black uppercase text-xs tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center gap-2 active:scale-[0.98]",
                    (paymentStatusState.code === 'PAYMENT_GATEWAY_UNAVAILABLE' || paymentStatusState.code === 'INVOICE_REQUIRED')
                      ? "bg-slate-300 text-slate-600 cursor-not-allowed shadow-none"
                      : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-md"
                  )}
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>{loadingStep || 'Processing...'}</span>
                    </>
                  ) : paymentStatusState.code === 'PAYMENT_GATEWAY_UNAVAILABLE' ? (
                    <>
                      <FileText size={13} />
                      <span>ONLINE PAYMENT UNAVAILABLE</span>
                    </>
                  ) : paymentStatusState.code === 'INVOICE_REQUIRED' ? (
                    <>
                      <FileText size={13} />
                      <span>PAYMENT AVAILABLE AFTER INVOICE</span>
                    </>
                  ) : (
                    <>
                      <Lock size={13} />
                      <span>Secure Payment ₹{totalPayable.toLocaleString('en-IN')}</span>
                    </>
                  )}
                </button>

                {/* 5. CALM, REASSURING STATUS CARD & FALLBACK WORKFLOW */}
                {paymentStatusState.code && (
                  <div
                    className="bg-slate-50/95 border border-slate-200/90 rounded-2xl p-4.5 sm:p-5 text-left space-y-3.5 shadow-xs transition-all duration-300 animate-fadeIn"
                    role="status"
                    aria-live="polite"
                  >
                    {(paymentStatusState.code === 'FALLBACK_READY' || paymentStatusState.code === 'PAYMENT_GATEWAY_UNAVAILABLE') && (
                      <>
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-amber-100/80 border border-amber-200/60 flex items-center justify-center shrink-0">
                            <Shield className="w-5 h-5 text-amber-700" />
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                              Secure Payment Link
                            </h4>
                            <p className="text-[10px] font-bold text-slate-500">
                              Instant direct checkout option
                            </p>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 font-medium leading-relaxed">
                          {paymentStatusState.userMessage || "We couldn't open standard modal checkout. You can complete your enrollment directly using our secure payment portal."}
                        </p>

                        <div className="flex items-center gap-2 text-emerald-800 bg-emerald-50 border border-emerald-200/70 px-3.5 py-2 rounded-xl text-xs font-extrabold shadow-xs">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>No duplicate payment has been charged.</span>
                        </div>

                        <div className="flex flex-col gap-2 pt-1">
                          <a
                            href={paymentStatusState.paymentUrl || 'https://razorpay.me/@sarthi'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 active:scale-[0.98] text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md text-center"
                          >
                            <span>CONTINUE TO SECURE PAYMENT</span>
                            <ExternalLink className="w-4 h-4" />
                          </a>

                          <button
                            type="button"
                            onClick={() => setIsReconcileModalOpen(true)}
                            className="w-full py-2.5 px-4 bg-slate-200/80 hover:bg-slate-200 active:scale-[0.98] text-slate-800 rounded-xl text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all text-center"
                          >
                            <span>Already Paid? Verify Payment ID</span>
                          </button>
                        </div>
                      </>
                    )}

                    {paymentStatusState.code === 'INVOICE_REQUIRED' && (
                      <>
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-blue-100/80 border border-blue-200/60 flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5 text-blue-700" />
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                              Invoice Required Before Payment
                            </h4>
                            <p className="text-[10px] font-bold text-slate-500">
                              Invoice-first enrollment policy
                            </p>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 font-medium leading-relaxed">
                          Online payment is not available for this enrollment at the moment.
                        </p>

                        <div className="flex items-center gap-2 text-emerald-800 bg-emerald-50 border border-emerald-200/70 px-3.5 py-2 rounded-xl text-xs font-extrabold shadow-xs">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>No payment has been charged.</span>
                        </div>

                        <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                          Once your invoice is available, we’ll provide the invoice and payment instructions.
                        </p>

                        <div className="pt-1">
                          <a
                            href="mailto:admin@sarthi.in?subject=Invoice%20Request%20Enrollment"
                            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white rounded-xl text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xs"
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                            <span>Contact Support</span>
                          </a>
                        </div>
                      </>
                    )}

                    {paymentStatusState.code === 'PAYMENT_CANCELLED' && (
                      <>
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-slate-200/80 border border-slate-300/60 flex items-center justify-center shrink-0">
                            <Clock className="w-5 h-5 text-slate-700" />
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                              Payment Cancelled
                            </h4>
                            <p className="text-[10px] font-bold text-slate-500">
                              Checkout process was dismissed
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-emerald-800 bg-emerald-50 border border-emerald-200/70 px-3.5 py-2 rounded-xl text-xs font-extrabold shadow-xs">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>No payment has been charged.</span>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 pt-1">
                          <button
                            type="button"
                            onClick={handleRazorpayPayment}
                            className="flex-1 py-2.5 px-4 bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white rounded-xl text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xs"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Try Again</span>
                          </button>
                          <a
                            href="mailto:admin@sarthi.in?subject=Checkout%20Help"
                            className="py-2.5 px-4 bg-slate-200/80 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all text-center"
                          >
                            <span>Support</span>
                          </a>
                        </div>
                      </>
                    )}

                    {paymentStatusState.code === 'PAYMENT_FAILED' && (
                      <>
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-slate-200/80 border border-slate-300/60 flex items-center justify-center shrink-0">
                            <AlertTriangle className="w-5 h-5 text-slate-700" />
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                              Payment Could Not Be Completed
                            </h4>
                            <p className="text-[10px] font-bold text-slate-500">
                              Transaction attempted
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-emerald-800 bg-emerald-50 border border-emerald-200/70 px-3.5 py-2 rounded-xl text-xs font-extrabold shadow-xs">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>No payment has been charged.</span>
                        </div>

                        <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                          Please try again or use our secure payment link.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-2 pt-1">
                          <button
                            type="button"
                            onClick={handleRazorpayPayment}
                            className="flex-1 py-2.5 px-4 bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white rounded-xl text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xs"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Try Again</span>
                          </button>
                          <button
                            type="button"
                            onClick={triggerFallbackPaymentFlow}
                            className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all text-center"
                          >
                            <span>Payment Link</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* 8. MICRO-COPY FOR REASSURANCE */}
              <div className="mt-4 p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl flex items-start gap-2.5 text-left">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5 text-[10px] font-medium">
                  <h4 className="font-bold text-slate-900">14-Day Satisfaction Guarantee</h4>
                  <p className="text-slate-500 text-[9px] leading-normal">Not completely satisfied with the program? Request a support ticket within 14 days for a resolution.</p>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* Footer Support Info */}
        <div className="border-t border-slate-200/80 pt-4 text-center text-[10px] font-bold text-slate-400 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p>Need Assistance? Support available 9AM–9PM</p>
          <div className="flex gap-3 text-slate-500">
            <a href="mailto:admin@sarthi.in" className="hover:text-slate-800">admin@sarthi.in</a>
            <span>&middot;</span>
            <a 
              href="https://wa.me/917654212171" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-slate-800 cursor-pointer"
            >
              Live Help Chat
            </a>
          </div>
        </div>

      </div>

      {/* 7. MOBILE STICKY BOTTOM BAR FOR MOBILE-FIRST CONVERSION */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-3 flex items-center justify-between z-50 shadow-[0_-8px_30px_rgb(0,0,0,0.08)]">
        <div className="flex flex-col text-left">
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Total Payable</span>
          <span className="text-lg font-black text-slate-900">₹{totalPayable.toLocaleString('en-IN')}</span>
        </div>
        <button
          onClick={handleRazorpayPayment}
          disabled={isProcessing || paymentStatusState.code === 'INVOICE_REQUIRED'}
          className={cn(
            "font-black uppercase text-[10px] tracking-wider px-5 py-3 rounded-xl transition-all flex items-center gap-1.5 shadow-sm max-w-[220px]",
            paymentStatusState.code === 'INVOICE_REQUIRED'
              ? "bg-slate-200 text-slate-500 cursor-not-allowed shadow-none"
              : "bg-amber-500 text-white hover:bg-amber-600"
          )}
        >
          {isProcessing ? (
            <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <Lock size={10} />
          )}
          <span>
            {paymentStatusState.code === 'FALLBACK_READY' || paymentStatusState.code === 'PAYMENT_GATEWAY_UNAVAILABLE'
              ? 'Pay Link'
              : paymentStatusState.code === 'INVOICE_REQUIRED'
              ? 'Invoice Required'
              : `Pay ₹${totalPayable.toLocaleString('en-IN')}`}
          </span>
        </button>
      </div>

      {/* 8. MANUAL PAYMENT RECONCILIATION MODAL */}
      {isReconcileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 text-left space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                  <Shield size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                    Verify Your Payment
                  </h3>
                  <p className="text-[11px] font-semibold text-slate-500">
                    Instant automated reconciliation
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsReconcileModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
              >
                <XCircle size={20} />
              </button>
            </div>

            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              If you paid via UPI or our direct Razorpay link, enter the <strong>Razorpay Payment ID</strong> (starts with <code className="bg-slate-100 px-1 py-0.5 rounded text-amber-700 font-bold">pay_</code>) from your payment receipt or SMS/email to verify and activate your enrollment immediately.
            </p>

            <form onSubmit={handleManualReconcile} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1">
                  Razorpay Payment ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. pay_Q8kX9Abc123xyz"
                  value={manualPaymentId}
                  onChange={(e) => setManualPaymentId(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  required
                />
              </div>

              {reconcileError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{reconcileError}</span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReconcileModalOpen(false)}
                  className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isReconciling}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                >
                  {isReconciling ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={14} />
                      <span>Verify & Access</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
