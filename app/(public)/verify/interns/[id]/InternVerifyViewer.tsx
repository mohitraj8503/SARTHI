'use client';

/**
 * InternVerifyViewer — Official Verification Status Card for /verify/interns/[id]
 *
 * Minimal, highly-trustworthy design following government/institutional credential verification standards:
 * - Single consistent brand teal accent color (#0F9F8A)
 * - Refined serif header typography matching certificate style
 * - Official verification seal badge icon
 * - Generous whitespace & structured 2x2 data grid
 * - Direct link to full-page A4 certificate view
 * - Live verification timestamp micro-detail
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Award,
  Calendar,
  Building2,
  ExternalLink,
  User,
  Copy,
  Check,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface CertData {
  referenceId: string;
  recipientName: string;
  recipientCollege: string;
  internshipTrack: string;
  startDate: string;
  endDate: string;
  issueDate: string;
  customExposureBody?: string;
  performanceBody?: string;
  closingStatement?: string;
}

interface Props {
  certData: CertData;
  hasPublishedLor?: boolean;
}

export default function InternVerifyViewer({ certData, hasPublishedLor = false }: Props) {
  const [copied, setCopied] = useState(false);
  const [checkedAtTimeString, setCheckedAtTimeString] = useState('');

  const {
    referenceId,
    recipientName,
    recipientCollege,
    internshipTrack,
    startDate,
    endDate,
    issueDate,
  } = certData;

  useEffect(() => {
    // Generate real-time live check timestamp (e.g., "20 Aug 2026, 02:05 IST")
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
      toast.success(`Copied: ${referenceId}`);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isLor = referenceId.startsWith('TT-LOR-');
  const docTitle = isLor ? 'Letter of Recommendation Verified' : 'Certificate Verified';

  return (
    <div className="induction-page-wrapper selection:bg-[#1B4332]/15 selection:text-[#1B4332]">
      {/* Floating background orbs - EXACT MATCH TO /VERIFY */}
      <div className="induction-orbs">
        <div className="verify-orb induction-orb-1" />
        <div className="verify-orb induction-orb-2" />
      </div>

      {/* TYPOGRAPHY & PAGE STYLES - EXACT MATCH TO /VERIFY */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        
        .induction-page-wrapper {
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: linear-gradient(135deg, #FDFBF7 0%, #F8F5F0 100%);
          color: #1F2937;
          min-height: calc(100vh - 72px);
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .induction-orbs {
          position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden;
        }

        .verify-orb {
          position: absolute; border-radius: 50%; opacity: 0.08;
          animation: induction-float 20s infinite ease-in-out;
          transition: transform 0.1s ease-out;
        }

        .induction-orb-1 { width: 600px; height: 600px; background: #1B4332; top: -200px; right: -100px; }
        .induction-orb-2 { width: 400px; height: 400px; background: #40916C; bottom: -100px; left: -100px; }

        @keyframes induction-float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 30px) scale(0.9); }
        }

        .induction-shell {
          position: relative; z-index: 10;
          max-width: 900px; width: 100%; margin: 0 auto;
          padding: 7.5rem 1.5rem 5rem;
        }

        .induction-hero { margin-bottom: 2.5rem; text-align: center; }

        .induction-badge {
          display: inline-flex; align-items: center; gap: 0.5rem;
          background: linear-gradient(135deg, rgba(27, 67, 50, 0.1) 0%, rgba(45, 106, 79, 0.1) 100%);
          color: #1B4332; padding: 0.625rem 1.25rem; border-radius: 50px;
          font-size: 0.875rem; font-weight: 600; margin-bottom: 1.25rem; letter-spacing: 0.5px;
        }

        .induction-title {
          font-size: clamp(2.2rem, 4.5vw, 3.5rem); font-weight: 800; color: #1B4332;
          line-height: 1.15; margin-bottom: 1rem; letter-spacing: -1px;
        }

        .induction-subtitle {
          font-size: 1.125rem; color: #6B7280; max-width: 620px; margin: 0 auto; line-height: 1.6; font-weight: 500;
        }
      `}</style>

      <div className="induction-shell">
        {/* ── 1. HEADER SECTION ── */}
        <div className="induction-hero">
          <div className="induction-badge">
            <ShieldCheck className="w-4 h-4 text-[#1B4332]" />
            <span>SECURE VERIFICATION RESULT</span>
          </div>
          <h1 className="induction-title">{docTitle}</h1>
          <p className="induction-subtitle">
            Official credential issued by <strong className="text-slate-900 font-bold">SARTHI</strong> and authenticated as genuine.
          </p>
        </div>

        {/* ── 2. MAIN CARD CONTAINER ── */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl p-6 sm:p-10 space-y-6 overflow-hidden">

          {/* Top Row: Status Pill with Blue Tick + Monospace Reference ID Box */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-5 gap-3">
            <div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                CREDENTIAL STATUS
              </span>
              {/* BLUE TICK BADGE */}
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-50 border border-blue-200/80 rounded-full text-xs font-black text-blue-950 tracking-wider uppercase shadow-2xs">
                <svg className="w-4 h-4 text-[#1D9BF0] fill-[#1D9BF0] shrink-0" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
                </svg>
                <span>AUTHENTIC & VERIFIED</span>
              </span>
            </div>

            <div className="w-full sm:w-auto bg-[#FAF9F6] border border-slate-200 px-4 py-2 rounded-2xl flex items-center justify-between sm:justify-start gap-3">
              <div>
                <span className="text-[8px] font-extrabold text-slate-400 uppercase block tracking-wider leading-none mb-0.5">
                  REFERENCE ID
                </span>
                <span className="text-xs font-mono font-black text-[#1B4332] tracking-wider leading-tight">
                  {referenceId}
                </span>
              </div>
              <button
                onClick={handleCopyId}
                className="p-1.5 hover:bg-slate-200/70 rounded text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                title="Copy Reference ID"
              >
                {copied ? <Check className="w-4 h-4 text-[#1B4332]" strokeWidth={2.5} /> : <Copy className="w-4 h-4" strokeWidth={2.5} />}
              </button>
            </div>
          </div>

          {/* ── 3. INFO-CARDS (2x2 GRID MATCHING /VERIFY) ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Student / Recipient */}
            <div className="bg-[#FAF9F6] border border-slate-200/90 hover:border-[#1B4332]/30 transition-all duration-200 rounded-2xl p-5 space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#1B4332]/10 border border-[#1B4332]/20 flex items-center justify-center text-[#1B4332] shrink-0">
                  <User className="w-4.5 h-4.5" strokeWidth={2.5} />
                </div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  STUDENT / RECIPIENT
                </span>
              </div>
              <div className="space-y-0.5 pt-0.5">
                <p className="text-base font-extrabold text-slate-900 leading-tight">{recipientName}</p>
                <p className="text-xs text-slate-500 font-medium">{recipientCollege}</p>
              </div>
            </div>

            {/* Program Track */}
            <div className="bg-[#FAF9F6] border border-slate-200/90 hover:border-[#1B4332]/30 transition-all duration-200 rounded-2xl p-5 space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#1B4332]/10 border border-[#1B4332]/20 flex items-center justify-center text-[#1B4332] shrink-0">
                  <Award className="w-4.5 h-4.5" strokeWidth={2.5} />
                </div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  PROGRAM / TRACK
                </span>
              </div>
              <div className="space-y-0.5 pt-0.5">
                <p className="text-base font-extrabold text-[#1B4332] leading-tight">{internshipTrack}</p>
                <p className="text-xs text-slate-500 font-medium">Internship Completion Credential</p>
              </div>
            </div>

            {/* Duration Period */}
            <div className="bg-[#FAF9F6] border border-slate-200/90 hover:border-[#1B4332]/30 transition-all duration-200 rounded-2xl p-5 space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#1B4332]/10 border border-[#1B4332]/20 flex items-center justify-center text-[#1B4332] shrink-0">
                  <Calendar className="w-4.5 h-4.5" strokeWidth={2.5} />
                </div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  DURATION PERIOD
                </span>
              </div>
              <div className="space-y-0.5 pt-0.5">
                <p className="text-sm font-extrabold text-slate-900 leading-tight">{startDate} – {endDate}</p>
                <p className="text-xs text-slate-500 font-medium">Issue Date: {issueDate}</p>
              </div>
            </div>

            {/* Issuing Authority */}
            <div className="bg-[#FAF9F6] border border-slate-200/90 hover:border-[#1B4332]/30 transition-all duration-200 rounded-2xl p-5 space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#1B4332]/10 border border-[#1B4332]/20 flex items-center justify-center text-[#1B4332] shrink-0">
                  <Building2 className="w-4.5 h-4.5" strokeWidth={2.5} />
                </div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  ISSUING AUTHORITY
                </span>
              </div>
              <div className="space-y-0.5 pt-0.5">
                <p className="text-sm font-extrabold text-slate-900 leading-tight">Dr. Mukul Pandey</p>
                <p className="text-xs text-slate-500 font-medium">CEO & Founder, SARTHI</p>
              </div>
            </div>
          </div>

          {/* ── PRIMARY DARK GREEN BUTTON MATCHING /VERIFY ── */}
          <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
            <Link
              href={`/verify/interns/${encodeURIComponent(referenceId)}/certificate`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 bg-[#1B4332] hover:bg-[#143326] text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-md transition-all flex items-center justify-center gap-2.5 active:scale-[0.98] cursor-pointer"
            >
              <ExternalLink className="w-4.5 h-4.5" strokeWidth={2.5} />
              <span>VIEW FULL CERTIFICATE</span>
            </Link>

            {/* ── SECONDARY CONTEXTUAL LOR SECTION (ONLY WHEN PUBLISHED LOR EXISTS) ── */}
            {hasPublishedLor && (
              <div className="bg-[#FAF9F6] border border-blue-200/80 rounded-2xl p-4.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 mt-2">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-black text-[#1B365D] uppercase tracking-widest block">
                    ADDITIONAL DOCUMENT
                  </span>
                  <h4 className="text-xs font-bold text-slate-900">Letter of Recommendation</h4>
                  <p className="text-[11px] text-slate-500">
                    A formal recommendation letter has been issued by SARTHI for this intern.
                  </p>
                </div>
                <Link
                  href={`/verify/interns/${encodeURIComponent(referenceId)}/recommendation`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-[#1B365D] hover:bg-[#142642] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center gap-2 shrink-0 cursor-pointer"
                >
                  <span>VIEW LETTER OF RECOMMENDATION</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* Micro-Detail Live Verification Timestamp */}
          <div className="pt-2 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500 font-medium flex items-center justify-center gap-1.5 flex-wrap">
              <ShieldCheck className="w-4 h-4 text-[#1B4332] shrink-0" strokeWidth={2.5} />
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
    </div>
  );
}
