import React, { useState } from 'react';
import { CertificateStatusType } from '@/hooks/useCertificateStatus';
import { Lock, Printer, Eye, Link as LinkIcon, Share2, CheckCircle2, AlertCircle } from 'lucide-react';

export interface CertificateActionsProps {
  status: CertificateStatusType;
  certificateNumber?: string | null;
  courseTitle?: string;
  isUnlocking?: boolean;
  onUnlockClick?: () => void;
  onPrintClick?: () => void;
  onViewClick?: () => void;
  onCopyLinkClick?: () => void;
  onLinkedInClick?: () => void;
  onShareXClick?: () => void;
  onCopyMessageClick?: () => void;
}

export default function CertificateActions({
  status,
  certificateNumber,
  courseTitle = 'Professional Certification',
  isUnlocking = false,
  onUnlockClick,
  onPrintClick,
  onViewClick,
  onCopyLinkClick,
  onLinkedInClick,
  onShareXClick,
  onCopyMessageClick,
}: CertificateActionsProps) {
  const [isCopied, setIsCopied] = useState(false);
  const isPaid = status === 'VALID';
  const isPending = status === 'PENDING_PAYMENT';

  const defaultCopyLink = () => {
    if (certificateNumber && typeof window !== 'undefined') {
      const isEx = certificateNumber.startsWith('TT-EX-');
      const verifyUrl = `${window.location.origin}${isEx ? '/certification-exams/verify' : '/verify'}/${certificateNumber}`;
      navigator.clipboard.writeText(verifyUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    }
  };

  const defaultLinkedInShare = () => {
    if (typeof window !== 'undefined') {
      const isEx = (certificateNumber || '').startsWith('TT-EX-');
      const verifyUrl = `${window.location.origin}${isEx ? '/certification-exams/verify' : '/verify'}/${certificateNumber || ''}`;
      const url = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(courseTitle)}&organizationId=92716075&certUrl=${encodeURIComponent(verifyUrl)}&certId=${encodeURIComponent(certificateNumber || '')}`;
      window.open(url, '_blank');
    }
  };

  const defaultShareX = () => {
    if (typeof window !== 'undefined') {
      const isEx = (certificateNumber || '').startsWith('TT-EX-');
      const verifyUrl = `${window.location.origin}${isEx ? '/certification-exams/verify' : '/verify'}/${certificateNumber || ''}`;
      const tweet = `I just earned the SARTHI ${courseTitle}! Verify at: ${verifyUrl}`;
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}`, '_blank');
    }
  };

  return (
    <div className="space-y-5 font-sans text-left">
      {/* 1. Status Indicator Badge */}
      {isPaid ? (
        <div className="flex items-center gap-2 text-emerald-400">
          <span className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-[10px] font-black">✓</span>
          <span className="text-xs font-black uppercase tracking-wider">Credential Activated Successfully</span>
        </div>
      ) : isPending ? (
        <div className="flex items-center gap-2 text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2">
          <Lock className="w-4 h-4 shrink-0 text-amber-400" />
          <span className="text-xs font-bold uppercase tracking-wider">
            Credential Pending Activation — Payment Required (₹2000)
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-slate-400 bg-slate-800/40 border border-slate-700/30 rounded-xl px-3 py-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-slate-400" />
          <span className="text-xs font-bold uppercase tracking-wider">
            Complete Assessment Milestones to Unlock Certification
          </span>
        </div>
      )}

      {/* 2. Action Buttons */}
      {isPaid ? (
        <>
          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={onPrintClick || (() => window.print())}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-wider rounded-xl cursor-pointer transition-colors shadow-sm flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Certificate
            </button>
            <button
              type="button"
              onClick={onViewClick}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 font-black text-[10px] uppercase tracking-wider rounded-xl cursor-pointer transition-colors flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              View Credential
            </button>
            <button
              type="button"
              onClick={onCopyLinkClick || defaultCopyLink}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 font-black text-[10px] uppercase tracking-wider rounded-xl cursor-pointer transition-colors flex items-center gap-1.5"
            >
              <LinkIcon className="w-3.5 h-3.5" />
              Copy Verification Link
            </button>
          </div>

          <div className="border-t border-slate-800/80 pt-4 space-y-3">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Share Achievement</span>
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-3.5 space-y-3">
              <p className="text-[11.5px] font-medium text-slate-300 leading-snug">
                &quot;I Successfully Earned The SARTHI {courseTitle}&quot;
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={onLinkedInClick || defaultLinkedInShare}
                  className="py-1.5 px-3 bg-[#0077b5] hover:bg-[#006097] text-white font-extrabold text-[9px] uppercase tracking-wider rounded-lg cursor-pointer transition-colors"
                >
                  LinkedIn
                </button>
                <button
                  type="button"
                  onClick={onShareXClick || defaultShareX}
                  className="py-1.5 px-3 bg-slate-950 hover:bg-slate-900 text-white font-extrabold text-[9px] uppercase tracking-wider rounded-lg cursor-pointer border border-slate-800 transition-colors"
                >
                  Share on X
                </button>
                <button
                  type="button"
                  onClick={onCopyMessageClick || (() => {
                    if (typeof window !== 'undefined') {
                      const isEx = (certificateNumber || '').startsWith('TT-EX-');
                      const verifyUrl = `${window.location.origin}${isEx ? '/certification-exams/verify' : '/verify'}/${certificateNumber || ''}`;
                      navigator.clipboard.writeText(`I successfully completed the ${courseTitle}! Verify here: ${verifyUrl}`);
                      toast.success("Achievement message copied!");
                    }
                  })}
                  className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold text-[9px] uppercase tracking-wider rounded-lg cursor-pointer transition-colors"
                >
                  Copy Message
                </button>
              </div>
            </div>
          </div>
        </>
      ) : isPending ? (
        <div className="space-y-3">
          <p className="text-xs text-slate-400 leading-relaxed font-medium">
            Your certification is complete and ready. Activate your lifetime digital credential record, secure verification link, and PDF downloads.
          </p>

          <button
            type="button"
            onClick={onUnlockClick}
            disabled={isUnlocking}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/10 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 border border-emerald-500/20"
          >
            {isUnlocking ? 'Activating...' : 'Activate Now - ₹2000'}
          </button>
        </div>
      ) : null}
    </div>
  );
}
