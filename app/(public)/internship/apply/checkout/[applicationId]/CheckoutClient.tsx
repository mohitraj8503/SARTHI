'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import Link from 'next/link';
import ReceiptSuccessModal from '@/components/payments/ReceiptSuccessModal';
import {
  ArrowLeft,
  Shield,
  Lock,
  CreditCard,
  CheckCircle2,
  Clock,
  Award,
  BookOpen,
  Calendar,
  Users,
  Check
} from 'lucide-react';

interface CheckoutClientProps {
  application: any;
  config: any;
}

export default function CheckoutClient({ application, config }: CheckoutClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string>(
    application.paymentStatus || 'unpaid'
  );
  const [appStatus, setAppStatus] = useState<string>(application.status || 'pending');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{
    paymentId: string;
    orderId: string;
  } | null>(null);
  const [showWaitingState, setShowWaitingState] = useState(false);
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);

  // Live Timer State (Countdown)
  const [timeLeft, setTimeLeft] = useState('08H 00M 53S');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const hours = String(23 - now.getHours()).padStart(2, '0');
      const minutes = String(59 - now.getMinutes()).padStart(2, '0');
      const seconds = String(59 - now.getSeconds()).padStart(2, '0');
      setTimeLeft(`${hours}H ${minutes}M ${seconds}S`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const baseAmount = typeof config?.paymentAmountInr === 'number' ? config.paymentAmountInr : 2000;
  const amount = application.internshipTrack === 'learning' 
    ? 2500 
    : application.internshipTrack === 'experienced' 
      ? 1500 
      : baseAmount;
  const isPaymentRequired = config?.paymentRequired ?? (amount > 0);
  const isPaid =
    paymentStatus === 'paid' ||
    appStatus === 'accepted' ||
    appStatus === 'APPROVED' ||
    appStatus === 'OFFER_ACCEPTED';

  // Fee calculation (18% GST included)
  const originalFee = amount * 2;
  const discountSaved = amount;
  const baseFee = amount / 1.18;
  const gstAmount = amount - baseFee;

  const trackTitle = (config.trackSlug || application.domain || 'Software Development')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (l: string) => l.toUpperCase());

  const handlePayment = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      // 1. Call Create Order API
      const res = await fetch('/api/internship/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: application.id }),
      });

      const orderData = await res.json();

      if (!res.ok || orderData.error) {
        throw new Error(orderData.error || 'Failed to initialize payment');
      }

      // If track has paymentRequired === false, it auto-accepts without payment
      if (!orderData.paymentRequired) {
        setAppStatus('accepted');
        setPaymentStatus('paid');
        setLoading(false);
        return;
      }

      // 2. Launch Razorpay Modal
      const options = {
        key: orderData.keyId,
        amount: orderData.amount * 100,
        currency: orderData.currency || 'INR',
        name: 'SARTHI',
        description: `Internship Application Fee — ${trackTitle}`,
        image: '/sarthi-logo.png',
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            // 3. Call Server-Side Verification API
            const verifyRes = await fetch('/api/internship/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                applicationId: application.id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok && verifyData.success) {
              setPaymentStatus('paid');
              setAppStatus('accepted');
              setSuccessInfo({
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id
              });
            } else {
              setPaymentStatus('failed');
              setErrorMessage(verifyData.error || 'Payment signature verification failed');
            }
          } catch (err: any) {
            console.error('Verification error:', err);
            setPaymentStatus('failed');
            setErrorMessage('Network error during payment verification');
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            setPaymentStatus('unpaid');
          },
        },
        prefill: {
          name: application.name || '',
          email: application.email || '',
        },
        theme: {
          color: '#D97706',
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (resp: any) {
        console.error('Razorpay payment failed:', resp.error);
        setLoading(false);
        setPaymentStatus('failed');
        setErrorMessage(resp.error?.description || 'Payment failed or declined');
      });
      rzp.open();
    } catch (err: any) {
      console.error('Payment launch error:', err);
      setLoading(false);
      setErrorMessage(err.message || 'Unable to initiate payment');
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col justify-between p-4 md:p-8">
        <div className="max-w-6xl mx-auto w-full space-y-6">

          {/* Navigation & Progress Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200/80 pb-4 gap-4">
            <Link
              href="/internship"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all text-[10px] font-bold uppercase shadow-sm self-start"
            >
              <ArrowLeft size={12} />
              Back to Internship
            </Link>

            {/* Step Progress Indicator */}
            <div className="flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-wider bg-white border border-slate-200 px-4 py-2 rounded-full shadow-sm">
              <div className="flex items-center gap-1.5 text-emerald-600">
                <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-bold">
                  ✓
                </div>
                <span>Details</span>
              </div>
              <span className="text-slate-300">➔</span>

              <div className="flex items-center gap-1.5 text-[#1A3C2E]">
                <div className="w-4 h-4 rounded-full bg-[#1A3C2E] text-white flex items-center justify-center text-[9px] font-bold">
                  2
                </div>
                <span className="underline decoration-amber-500 decoration-2 underline-offset-4">
                  Checkout
                </span>
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

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-12 gap-8 items-stretch my-2">

            {/* Left Column: Internship Overview & Account Details */}
            <div className="lg:col-span-7 flex flex-col gap-6 text-left pr-2">

              <div className="space-y-3">
                <span className="text-amber-700 font-black text-[9px] uppercase tracking-widest bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 inline-block shadow-sm">
                  Premium Flagship Program
                </span>
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                  {trackTitle} — SARTHI Internship
                </h1>
                <p className="text-slate-600 text-xs md:text-sm leading-relaxed max-w-xl">
                  Unlock 1-month practical execution. Master key concepts with hands-on labs, live project deliverables, and placement-focused technical mentorship.
                </p>
              </div>

              {/* Checkout Account Details */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <h3 className="font-black text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#1A3C2E]" />
                    Checkout Account Details
                  </h3>
                  <span className="text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                    Logged In
                  </span>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-1 text-xs">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider mb-1">
                    Account Details
                  </p>
                  <p className="font-bold text-slate-800 text-sm">{application.name}</p>
                  <p className="font-semibold text-slate-600">{application.email}</p>
                  {application.college && (
                    <p className="text-[11px] text-slate-500 font-medium pt-1 border-t border-slate-200/60 mt-1">
                      College: <span className="text-slate-700 font-bold">{application.college}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* What's Included Card */}
              <div className="bg-white border border-slate-200/60 rounded-2xl p-5 space-y-3.5 shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
                <h3 className="font-bold text-slate-900 text-[11px] uppercase tracking-wider">
                  What&apos;s Included:
                </h3>
                <div className="grid grid-cols-2 gap-3 text-[11px] font-bold text-slate-700">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-600" />
                    <span>Live Industry Project</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-600" />
                    <span>Verified Certification & LOR</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <span>1:1 Technical Mentorship</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-600" />
                    <span>Premium Community Access</span>
                  </div>
                </div>
              </div>

              {/* Today's Enrollment Benefits */}
              <div className="space-y-2.5">
                <h3 className="font-black text-slate-950 text-[11px] uppercase tracking-wider text-left">
                  Today&apos;s Enrollment Benefits
                </h3>
                <div className="grid gap-2.5 text-xs text-slate-600">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="font-semibold">Lifetime Verified Certificate & Offer Letter</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="font-semibold">Government-recognized Certification</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="font-semibold">Dedicated Placement Support Assistance</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Order Summary & Razorpay Gateway */}
            <div className="lg:col-span-5 flex flex-col gap-5 lg:sticky lg:top-8 self-start">

              {/* Urgency Banner */}
              <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 flex items-center justify-between text-amber-800 text-[10px] font-black uppercase tracking-wider shadow-sm z-10 relative">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 animate-pulse text-amber-600" />
                  <span>Special Pricing offer ends today</span>
                </div>
                <span className="bg-[#1A3C2E] text-white px-2 py-0.5 rounded font-black font-mono">
                  {timeLeft}
                </span>
              </div>

              {/* Order Summary Box */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-[0_20px_40px_rgba(0,0,0,0.03)] flex flex-col justify-between relative space-y-4">
                <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Order Summary
                  </p>
                  <h2 className="font-black text-slate-900 text-xs md:text-sm truncate mb-2">
                    {trackTitle} — SARTHI Internship
                  </h2>
                  <div className="h-[1px] bg-slate-100" />
                </div>

                {/* Line Items */}
                <div className="space-y-2.5 text-[11px] font-bold text-slate-500">
                  <div className="flex justify-between">
                    <span>Base Course Price</span>
                    <span className="text-slate-800 line-through font-normal">
                      ₹{originalFee.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex justify-between text-emerald-600">
                    <span>Discount Saved (50% OFF)</span>
                    <span>-50% OFF — saved ₹{discountSaved.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Net Course Price</span>
                    <span className="text-slate-800">
                      ₹{baseFee.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex justify-between border-t border-slate-100 pt-2.5">
                    <span>GST (18% Included)</span>
                    <span className="text-slate-800">
                      ₹{gstAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Transaction & Platform Fee</span>
                    <span className="text-emerald-600 uppercase">FREE</span>
                  </div>
                </div>

                <div className="h-[1px] bg-slate-100" />

                {/* Total Payable */}
                <div className="flex justify-between items-baseline pt-1">
                  <span className="text-xs font-black uppercase text-slate-900">Total Payable</span>
                  <span className="text-2xl font-black text-slate-950">
                    ₹{amount.toLocaleString('en-IN')}
                  </span>
                </div>

                {errorMessage && (
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-rose-700 text-xs font-bold">
                    ⚠️ {errorMessage}
                  </div>
                )}

                {/* Secure Gateway Callout & Big Action Button */}
                <div className="space-y-3 pt-2">
                  <div className="text-center space-y-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                      Secure Checkout Gateway
                    </span>
                    <p className="text-xs font-black text-slate-700 flex items-center justify-center gap-1.5">
                      Pay with <span className="text-blue-700 font-extrabold tracking-tight">Razorpay</span>
                    </p>
                  </div>

                  {isPaid ? (
                    <div className="space-y-3">
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center space-y-1">
                        <span className="text-emerald-800 font-black text-xs uppercase block">
                          🎉 Application Accepted!
                        </span>
                        <p className="text-[11px] text-emerald-700 font-medium">
                          Your seat has been confirmed in the program.
                        </p>
                      </div>
                      <Link
                        href="/dashboard/internship"
                        className="block w-full py-3.5 bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold rounded-xl transition-all shadow-md text-center text-xs uppercase tracking-wider"
                      >
                        Go to Intern Portal →
                      </Link>
                    </div>
                  ) : !isPaymentRequired ? (
                    <div className="space-y-3">
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center space-y-1">
                        <span className="text-emerald-800 font-black text-xs uppercase block">
                          ✓ Free Auto-Accept Active
                        </span>
                      </div>
                      <Link
                        href="/dashboard/internship"
                        className="block w-full py-3.5 bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold rounded-xl transition-all shadow-md text-center text-xs uppercase tracking-wider"
                      >
                        Access Intern Portal →
                      </Link>
                    </div>
                  ) : (
                    <button
                      onClick={handlePayment}
                      disabled={loading}
                      className="w-full py-4 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-extrabold rounded-xl transition-all shadow-lg text-center text-xs md:text-sm uppercase tracking-wider flex justify-center items-center gap-2 cursor-pointer active:scale-98"
                    >
                      {loading ? (
                        <span>Processing Payment...</span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Lock className="w-4 h-4" /> Secure Payment ₹{amount.toLocaleString('en-IN')}
                        </span>
                      )}
                    </button>
                  )}

                  {/* 14-Day Guarantee */}
                  <div className="bg-emerald-50/60 border border-emerald-200/60 rounded-xl p-3 text-left space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-800 text-[10px] font-black uppercase">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>14-Day Satisfaction Guarantee</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-snug">
                      Not completely satisfied with the program? Request a support ticket within 14 days for a resolution.
                    </p>
                  </div>

                  {/* WhatsApp Assisted Checkout for IILM University & Offline/UPI Payment */}
                  <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-4 space-y-2 text-left shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-emerald-950 tracking-wider">
                        IILM University & Assisted Payment
                      </span>
                      <span className="bg-emerald-600 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full">
                        WhatsApp Help
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-700 font-bold leading-relaxed">
                      For IILM University, we have Rs. 500 offer for you.
                    </p>
                    <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                      Need offline UPI/bank payment assistance or applying from <strong>IILM University, Greater Noida</strong>? Contact this phone number or chat directly with our program coordinator on WhatsApp.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3 rounded-xl border border-slate-100 mt-2">
                      <div className="w-24 h-24 relative bg-slate-50 flex items-center justify-center border border-slate-200 rounded-lg shrink-0 overflow-hidden">
                        <img
                          src="/images/iilm-upi-qr.png"
                          alt="UPI QR Code"
                          className="w-full h-full object-contain p-1"
                        />
                      </div>
                      <div className="text-left space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Direct UPI Payment</p>
                        <p className="text-xs font-bold text-slate-800">Scan to Pay: ₹500</p>
                        <p className="text-[10px] text-slate-600 font-bold">UPI ID: <span className="font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">omprabhat21@ybl</span></p>
                        <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                          Scan the QR code or send payment to the UPI ID using any UPI app (GPay, PhonePe, Paytm) to complete payment. Post payment, click below to share receipt on WhatsApp.
                        </p>
                      </div>
                    </div>
                    {showWaitingState ? (
                      <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-4 space-y-2 text-left animate-fadeIn">
                        <div className="flex items-center gap-2 text-amber-800 text-[10px] font-black uppercase tracking-wider">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping shrink-0" />
                          <span>Awaiting Manual Verification</span>
                        </div>
                        <p className="text-[11px] text-slate-700 leading-relaxed font-semibold">
                          We are verifying your transaction receipt details in our backend. Your dashboard space will be created automatically shortly.
                        </p>
                        <p className="text-[10px] text-slate-500">
                          Usually takes 10 to 30 minutes. You can close this window now.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {/* Optional payment proof attachment */}
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Attach Payment Proof (Optional)</label>
                          <label className="flex items-center gap-2 cursor-pointer border border-dashed border-slate-300 rounded-lg px-3 py-2 bg-white hover:border-emerald-400 transition-colors">
                            <span className="text-base">📎</span>
                            <span className="text-[11px] text-slate-600 font-medium truncate">
                              {paymentProofFile ? paymentProofFile.name : 'Select screenshot or PDF (optional)'}
                            </span>
                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              className="hidden"
                              onChange={(e) => setPaymentProofFile(e.target.files?.[0] || null)}
                            />
                          </label>
                        </div>
                        <a
                          onClick={() => setShowWaitingState(true)}
                          href={`https://wa.me/917677973451?text=${encodeURIComponent(
                            `Hello, I'm ${application.name || 'Student'}${
                              application.college ? ` from ${application.college}` : ' from IILM University, Greater Noida'
                            }. I have completed the Rs. 500 payment for the ${trackTitle} Internship Program via UPI. Here is my payment receipt detail.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider rounded-lg transition-all shadow-sm active:scale-98 text-center"
                        >
                          <span>💬 Send Payment Receipt on WhatsApp</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>

        {/* Footer info bar */}
        <footer className="max-w-6xl mx-auto w-full pt-8 pb-4 border-t border-slate-200/80 flex flex-col md:flex-row justify-between items-center text-[10px] text-slate-400 font-medium gap-2">
          <span>Need Assistance? Support available 9AM-6PM</span>
          <div className="flex items-center gap-3">
            <span className="hover:text-slate-600">admin@sarthi.in</span>
            <span>•</span>
            <span className="hover:text-slate-600">Live Help Chat</span>
          </div>
        </footer>
      </div>

      <ReceiptSuccessModal
        isOpen={!!successInfo}
        onClose={() => router.push('/dashboard/internship')}
        title={`${trackTitle} Internship`}
        amount={`₹${amount.toLocaleString('en-IN')}`}
        actionLabel="Go to Intern Portal"
        onAction={() => router.push('/dashboard/internship')}
        details={[
          { label: "Candidate", value: application.name || "Applicant" },
          { label: "Email", value: application.email || "" },
          { label: "Payment ID", value: successInfo?.paymentId || "", isMono: true },
          { label: "Order ID", value: successInfo?.orderId || "", isMono: true },
          { label: "Track", value: trackTitle },
        ]}
      />
    </>
  );
}
