'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ReceiptSuccessModal from '@/components/payments/ReceiptSuccessModal';
import { isIilmUniversity } from '@/lib/utils/iilm';
import { CheckCircle2, Clock, ShieldCheck, ArrowRight, UserCheck, Check, Loader2, AlertCircle } from 'lucide-react';

interface StatusViewProps {
  application: {
    id: string;
    name: string;
    email: string;
    college: string;
    course: string;
    semester?: string;
    domain?: string;
    status: string;
    submittedAt: string | Date;
    offerAcceptedAt?: string | Date | null;
  };
}

export default function ApplicationStatusView({ application }: StatusViewProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isPaidLocally, setIsPaidLocally] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{
    amount: number;
    track: string;
  } | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const handleExistingAppPayment = () => {
    router.push(`/internship/apply/checkout/${application.id}`);
  };

  const isAccepted =
    isPaidLocally ||
    application.status === 'OFFER_ACCEPTED' ||
    application.status === 'ACCEPTED' ||
    application.status === 'APPROVED' ||
    application.status === 'accepted' ||
    (application as any).paymentStatus === 'paid' ||
    !!application.offerAcceptedAt;

  if (successInfo) {
    const trackLabel = successInfo.track === 'experienced' ? 'Experienced Track' : 'Learning & Development Track';
    const referenceId = `APP-2026-${application.id.slice(-4).toUpperCase()}`;

    return (
      <div className="max-w-2xl mx-auto my-8 p-8 md:p-10 bg-white border border-emerald-200 rounded-[2.5rem] shadow-xl text-center space-y-6 relative overflow-hidden font-sans text-slate-800">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
          <Check className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 text-[10px] font-black uppercase tracking-widest">
            ✓ Enrollment Confirmed
          </span>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight">
            Application Submitted & Enrollment Confirmed
          </h2>
          <p className="text-slate-500 text-xs leading-relaxed max-w-sm mx-auto">
            Your SARTHI internship enrollment is confirmed successfully.
          </p>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left text-xs space-y-2 max-w-md mx-auto">
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Internship Track</span>
            <span className="font-bold text-slate-800">{trackLabel}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Amount Paid</span>
            <span className="font-black text-slate-900">₹{successInfo.amount}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Application Reference</span>
            <span className="font-mono font-bold text-slate-800 uppercase">{referenceId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Status</span>
            <span className="font-black text-emerald-700 uppercase">Enrolled & Approved</span>
          </div>
        </div>

        {successInfo.track === 'learning' && (
          <p className="text-[11px] text-indigo-700 font-extrabold bg-indigo-50 border border-indigo-100 p-3 rounded-xl leading-relaxed max-w-md mx-auto">
            Your Learning Internship + Placement Support pathway is now active. Placement support begins after successful internship completion, subject to eligibility.
          </p>
        )}

        <div className="pt-2 max-w-md mx-auto">
          <Link
            href="/dashboard/internship"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#1B4332] hover:bg-[#143326] text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg hover:shadow-xl active:scale-98 w-full"
          >
            <span>Go to Intern Dashboard</span>
            <ArrowRight className="w-4 h-4 text-emerald-355" />
          </Link>
        </div>

        <ReceiptSuccessModal
          isOpen={isReceiptOpen}
          onClose={() => setIsReceiptOpen(false)}
          title={`${successInfo.track === 'experienced' ? 'Experienced' : 'Learning'} Internship Track`}
          amount={`₹${successInfo.amount}`}
          actionLabel="Go to Intern Dashboard"
          onAction={() => router.push('/dashboard/internship')}
          details={[
            { label: "Candidate", value: application.name },
            { label: "Email", value: application.email },
            { label: "Reference", value: referenceId, isMono: true },
            { label: "Track", value: trackLabel },
          ]}
        />
      </div>
    );
  }

  if (isAccepted) {
    return (
      <div className="max-w-2xl mx-auto my-8 p-8 md:p-10 bg-white border border-emerald-200/80 rounded-[2.5rem] shadow-xl text-center space-y-6 relative overflow-hidden font-sans">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
          <UserCheck className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 text-[10px] font-black uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            Official Intern
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tight">
            You're Already an Intern!
          </h2>
          <p className="text-slate-500 text-xs max-w-md mx-auto leading-relaxed">
            Your internship application for <strong>{application.name}</strong> has been accepted and your official offer letter is issued. Access your personal workspace below.
          </p>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left text-xs grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Recipient</span>
            <p className="font-bold text-slate-800">{application.name}</p>
          </div>
          <div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Track</span>
            <p className="font-bold text-slate-800">{application.domain || 'Software Development'}</p>
          </div>
          <div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Status</span>
            <p className="font-black text-emerald-700 uppercase">Offer Accepted</p>
          </div>
        </div>

        <div className="pt-2">
          <Link
            href="/dashboard/internship"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#1B4332] hover:bg-[#143326] text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg hover:shadow-xl active:scale-98"
          >
            <span>Go to Dashboard</span>
            <ArrowRight className="w-4 h-4 text-emerald-300" />
          </Link>
        </div>
      </div>
    );
  }

  // Pending / Unpaid State (Requires Payment for IILM students only)
  const isIilm = isIilmUniversity(application.college);

  if (!isIilm) {
    return (
      <div className="max-w-2xl mx-auto my-8 p-8 md:p-10 bg-white border border-slate-200 rounded-[2.5rem] shadow-xl text-center space-y-6 relative overflow-hidden font-sans">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
          <Clock className="w-8 h-8 animate-pulse text-emerald-600" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-amber-800 text-xs font-extrabold uppercase tracking-wider">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
            Application Under Review
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tight">
            Submitted & Under Evaluation
          </h2>
          <p className="text-slate-600 text-xs max-w-md mx-auto leading-relaxed">
            Your application for <strong>{application.name}</strong> from <strong>{application.college}</strong> is under review by our evaluation team. You will be notified on your email once approved.
          </p>
        </div>

        {/* Submitted Details Grid */}
        <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl text-left text-xs grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Reference ID</span>
            <p className="font-mono font-bold text-slate-800 uppercase">APP-2026-{application.id.slice(-4).toUpperCase()}</p>
          </div>
          <div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Applicant</span>
            <p className="font-bold text-slate-800">{application.name}</p>
          </div>
          <div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Applied Date</span>
            <p className="font-bold text-slate-700">{new Date(application.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
          </div>
          <div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">College</span>
            <p className="font-bold text-slate-800">{application.college}</p>
          </div>
          <div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Preferred Track</span>
            <p className="font-bold text-slate-800">{application.domain || 'N/A'}</p>
          </div>
          <div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Current Status</span>
            <p className="font-black text-amber-600 uppercase">Under Review</p>
          </div>
        </div>

        <div className="pt-2 space-y-3">
          <Link
            href="/dashboard/internship"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#1B4332] hover:bg-[#143326] text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg hover:shadow-xl active:scale-98 w-full sm:w-auto"
          >
            <span>Go to Intern Dashboard</span>
            <ArrowRight className="w-4 h-4 text-emerald-300" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto my-8 p-8 md:p-10 bg-white border border-amber-200 rounded-[2.5rem] shadow-xl text-center space-y-6 relative overflow-hidden font-sans">
      <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
        <Clock className="w-8 h-8 animate-pulse" />
      </div>

      <div className="space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-amber-800 text-xs font-extrabold uppercase tracking-wider">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
          Please Pay to Continue
        </span>
        <h2 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tight">
          Checkout Required
        </h2>
        <p className="text-slate-600 text-xs max-w-md mx-auto leading-relaxed">
          Your application for <strong>{application.name}</strong> is registered. Please complete the application fee payment to auto-accept your seat into the program.
        </p>
      </div>

      {/* Submitted Details Grid */}
      <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl text-left text-xs grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Reference ID</span>
          <p className="font-mono font-bold text-slate-800 uppercase">APP-2026-{application.id.slice(-4).toUpperCase()}</p>
        </div>
        <div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Applicant</span>
          <p className="font-bold text-slate-800">{application.name}</p>
        </div>
        <div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Applied Date</span>
          <p className="font-bold text-slate-700">{new Date(application.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
        </div>
        <div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">College</span>
          <p className="font-bold text-slate-800">{application.college}</p>
        </div>
        <div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Preferred Track</span>
          <p className="font-bold text-slate-800">{application.domain || 'N/A'}</p>
        </div>
        <div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Current Status</span>
          <p className="font-black text-amber-600 uppercase">Awaiting Payment</p>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-xs font-bold max-w-md mx-auto mb-4">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="pt-2 space-y-3">
        <button
          onClick={handleExistingAppPayment}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg hover:shadow-xl active:scale-98 w-full sm:w-auto disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-emerald-200" />
              <span>Processing Payment...</span>
            </>
          ) : (
            <>
              <span>Please Pay to Continue</span>
              <ArrowRight className="w-4 h-4 text-emerald-200" />
            </>
          )}
        </button>
        <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Secure Razorpay Payment & Instant Auto-Acceptance</span>
        </div>
      </div>
    </div>
  );
}
