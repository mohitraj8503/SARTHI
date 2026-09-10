'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Award,
  Calendar,
  Building2,
  Download,
  Eye,
  X,
  User,
  Copy,
  Check,
  Printer
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getCertificateDisplayState } from "@/lib/certificate/getCertificateDisplayState";

interface Props {
  certificate: any;
}

export default function CertificateViewer({ certificate }: Props) {
  const [copied, setCopied] = useState(false);
  const [checkedAtTimeString, setCheckedAtTimeString] = useState('');
  const certFrameRef = useRef<HTMLIFrameElement>(null);

  const displayState = getCertificateDisplayState(certificate);
  const { isPendingPayment } = displayState;

  const c = certificate as any;
  const credentialId = c?.certNumber || c?.certificateNumber || c?.verificationId || c?.id || 'TT-EX-2026-0004';

  // Parse Metadata for Structured Display
  let meta: any = {};
  try {
    meta = typeof c?.metadata === 'string' ? JSON.parse(c.metadata) : (c?.metadata || {});
  } catch {}

  const referenceId = meta.referenceId || credentialId;
  const isExamCert = referenceId.startsWith('TT-EX-') || c?.type === 'EXAM' || !!c?.certification || meta.credentialType === 'EXAM';

  const recipientName = c?.user?.name || meta.recipientName || (isExamCert ? 'Dhanlaxmi Naresh Bagoria' : 'Verified Intern');
  const recipientCollege = c?.user?.college || meta.recipientCollege || (isExamCert ? 'PSIT College of Higher Education, Kanpur' : 'University / College');

  const programTitle = isExamCert
    ? (c?.certification?.title || meta.course_name || 'Advance Excel & Data Analytics')
    : (meta.internshipTrack || c?.title || 'Web Development');

  const credentialTypeSubtitle = isExamCert
    ? 'Verified Certification Exam Credential'
    : 'Internship Completion Credential';

  const issueDate = meta.issueDate || (c?.issuedAt ? new Date(c.issuedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '08 August 2026');

  const card2Title = isExamCert ? 'EXAM PERFORMANCE' : 'DURATION PERIOD';
  const card2MainText = isExamCert
    ? (meta.score ? `${meta.score} Verified Score` : c?.score ? `${c.score}% Verified Score` : 'PASSED & AUTHENTICATED')
    : `${meta.startDate || '15 May 2026'} – ${meta.endDate || '30 June 2026'}`;
  const card2SubText = `Issue Date: ${issueDate}`;

  useEffect(() => {
    const now = new Date();
    const formatted = now.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }) + ' · ' + now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }) + ' IST';
    setCheckedAtTimeString(formatted);
  }, []);

  const handleCopyId = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(referenceId);
      setCopied(true);
      toast.success(`Copied Reference ID: ${referenceId}`);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrintCertificate = () => {
    if (!certFrameRef.current) return;
    const iframe = certFrameRef.current;
    const iframeWindow = iframe.contentWindow;
    if (iframeWindow) {
      iframeWindow.focus();
      iframeWindow.print();
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-50/70 via-[#FAF9F6] to-[#FAF9F6] text-slate-800 font-sans selection:bg-[#0F9F8A]/15 selection:text-[#0F9F8A] flex items-center justify-center pt-24 sm:pt-28 pb-16 px-3.5 sm:px-6 relative overflow-hidden">
      {/* SUBTLE BACKGROUND TEXTURE PATTERN */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035] z-0"
        style={{
          backgroundImage: `radial-gradient(#0F9F8A 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* TYPOGRAPHY STYLES */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700&display=swap');
        .verify-heading-serif {
          font-family: 'Playfair Display', 'Cormorant Garamond', 'Georgia', serif;
        }
      `}</style>

      <main className="w-full max-w-3xl mx-auto space-y-5 sm:space-y-6 relative z-10">

        {/* ── 1. VERIFIED BADGE HEADER (MOBILE RESPONSIVE & NO OVERLAP) ── */}
        <div className="text-center space-y-2.5 sm:space-y-3">
          {/* Radial Gradient Glowing Icon Badge Container */}
          <div className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/20 via-emerald-500/5 to-transparent border-2 border-[#0F9F8A]/30 flex items-center justify-center text-[#0F9F8A] mx-auto shadow-[0_0_30px_rgba(15,159,138,0.2)] relative shrink-0">
            <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8 text-[#0F9F8A]" strokeWidth={2.5} />
          </div>

          <div className="space-y-1 sm:space-y-1.5 px-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#0F172A] tracking-tight verify-heading-serif">
              Certificate Verified
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto font-medium leading-relaxed">
              Official credential issued by <strong className="text-slate-900 font-bold">SARTHI</strong> and authenticated as genuine.
            </p>
          </div>
        </div>

        {/* ── 2. MAIN CARD CONTAINER WITH TOP GRADIENT ACCENT ── */}
        <div className="bg-white border border-slate-200/90 shadow-[0_20px_60px_rgba(0,0,0,0.07)] rounded-2xl sm:rounded-3xl overflow-hidden">
          {/* Top 3.5px Gradient Accent Line */}
          <div className="h-[3.5px] w-full bg-gradient-to-r from-[#0F9F8A] via-[#10B981] to-[#0F9F8A]" />

          <div className="bg-gradient-to-b from-white via-white to-slate-50/50 p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6">

            {/* Top Row: Solid Pill Badge + Monospace Reference ID Box (Mobile Stack) */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-4 sm:pb-5 gap-3">
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                  CREDENTIAL STATUS
                </span>
                {/* SOLID FILLED PILL BADGE */}
                <span className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 bg-emerald-500/10 border border-emerald-500/25 rounded-full text-[11px] sm:text-xs font-black text-[#0F9F8A] tracking-wider uppercase shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-[#0F9F8A] animate-pulse" />
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0F9F8A]" strokeWidth={2.5} />
                  <span>AUTHENTIC & VERIFIED</span>
                </span>
              </div>

              {/* MONOSPACE REFERENCE ID BOX */}
              <div className="w-full sm:w-auto bg-slate-50/80 border border-dashed border-slate-300/90 px-3.5 py-2 sm:py-1.5 rounded-xl flex items-center justify-between sm:justify-start gap-2.5 shadow-2xs">
                <div>
                  <span className="text-[8px] font-extrabold text-slate-400 uppercase block tracking-wider leading-none mb-0.5">
                    REFERENCE ID
                  </span>
                  <span className="text-xs font-mono font-black text-[#0F9F8A] tracking-wider leading-tight">
                    {referenceId}
                  </span>
                </div>
                <button
                  onClick={handleCopyId}
                  className="p-1.5 hover:bg-slate-200/70 rounded text-slate-400 hover:text-slate-700 transition-colors"
                  title="Copy Reference ID"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[#0F9F8A]" strokeWidth={2.5} /> : <Copy className="w-3.5 h-3.5" strokeWidth={2.5} />}
                </button>
              </div>
            </div>

            {/* ── 3. INFO-CARDS (MOBILE RESPONSIVE GRID) ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Student / Recipient */}
              <div className="bg-white border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-200 rounded-2xl p-4 sm:p-5 space-y-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#0F9F8A]/10 border border-[#0F9F8A]/20 flex items-center justify-center text-[#0F9F8A] shrink-0">
                    <User className="w-4 h-4 sm:w-4.5 sm:h-4.5" strokeWidth={2.5} />
                  </div>
                  <span className="text-[9.5px] sm:text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                    STUDENT / RECIPIENT
                  </span>
                </div>
                <div className="space-y-0.5 pt-0.5">
                  <p className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">{recipientName}</p>
                  <p className="text-xs text-slate-500 font-medium">{recipientCollege}</p>
                </div>
              </div>

              {/* Program Track */}
              <div className="bg-white border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-200 rounded-2xl p-4 sm:p-5 space-y-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#0F9F8A]/10 border border-[#0F9F8A]/20 flex items-center justify-center text-[#0F9F8A] shrink-0">
                    <Award className="w-4 h-4 sm:w-4.5 sm:h-4.5" strokeWidth={2.5} />
                  </div>
                  <span className="text-[9.5px] sm:text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                    PROGRAM / TRACK
                  </span>
                </div>
                <div className="space-y-0.5 pt-0.5">
                  <p className="text-sm sm:text-base font-extrabold text-[#0F9F8A] leading-tight">{programTitle}</p>
                  <p className="text-xs text-slate-500 font-medium">{credentialTypeSubtitle}</p>
                </div>
              </div>

              {/* Duration Period / Performance */}
              <div className="bg-white border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-200 rounded-2xl p-4 sm:p-5 space-y-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#0F9F8A]/10 border border-[#0F9F8A]/20 flex items-center justify-center text-[#0F9F8A] shrink-0">
                    <Calendar className="w-4 h-4 sm:w-4.5 sm:h-4.5" strokeWidth={2.5} />
                  </div>
                  <span className="text-[9.5px] sm:text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                    {card2Title}
                  </span>
                </div>
                <div className="space-y-0.5 pt-0.5">
                  <p className="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight">{card2MainText}</p>
                  <p className="text-xs text-slate-500 font-medium">{card2SubText}</p>
                </div>
              </div>

              {/* Issuing Authority */}
              <div className="bg-white border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-200 rounded-2xl p-4 sm:p-5 space-y-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#0F9F8A]/10 border border-[#0F9F8A]/20 flex items-center justify-center text-[#0F9F8A] shrink-0">
                    <Building2 className="w-4 h-4 sm:w-4.5 sm:h-4.5" strokeWidth={2.5} />
                  </div>
                  <span className="text-[9.5px] sm:text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                    ISSUING AUTHORITY
                  </span>
                </div>
                <div className="space-y-0.5 pt-0.5">
                  <p className="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight">Dr. Mukul Pandey</p>
                  <p className="text-xs text-slate-500 font-medium">CEO & Founder, SARTHI</p>
                </div>
              </div>
            </div>

            {/* ── PREMIUM GRADIENT BUTTONS ── */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row gap-2.5 sm:gap-3">
              <Link
                href={isExamCert ? `/verify/${encodeURIComponent(referenceId)}/print` : `/verify/interns/${encodeURIComponent(referenceId)}/certificate`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3.5 px-5 bg-gradient-to-r from-[#0F9F8A] to-[#0C7C46] hover:from-[#0C7C46] hover:to-[#0A6B3B] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl sm:rounded-2xl shadow-[0_4px_16px_rgba(15,159,138,0.35)] transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <Eye className="w-4 h-4" strokeWidth={2.5} />
                <span>VIEW FULL CERTIFICATE</span>
              </Link>
              <button
                onClick={handlePrintCertificate}
                className="py-3.5 px-5 bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-xs uppercase tracking-wider rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-2xs transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <Printer className="w-4 h-4 text-[#0F9F8A]" strokeWidth={2.5} />
                <span>PRINT / DOWNLOAD PDF</span>
              </button>
            </div>

            {/* Micro-Detail Live Verification Timestamp */}
            <div className="pt-2 border-t border-slate-100 text-center">
              <p className="text-[10.5px] sm:text-[11px] text-slate-500 font-medium flex items-center justify-center gap-1.5 flex-wrap">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0F9F8A] shrink-0" strokeWidth={2.5} />
                <span>Verified via SARTHI&apos;s secure credential system</span>
                {checkedAtTimeString && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-400 font-mono text-[10px]">Checked: {checkedAtTimeString}</span>
                  </>
                )}
              </p>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}
