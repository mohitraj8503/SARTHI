'use client';

/**
 * InternshipLORTemplate — Official Corporate Letter of Recommendation (LOR)
 *
 * Final Micro-Polish Specification (Frozen Visual Design):
 * 1. Main Title: ~1-2px larger (20pt / font-extrabold), centered.
 * 2. Subtle decorative dividers: shorter (w-5 / 20px) and subtle.
 * 3. Subtitle "INTERNSHIP RECOMMENDATION": 9pt with readable letter-spacing [0.22em] and font-semibold.
 * 4. "To Whom It May Concern,": reduced weight to medium/semibold (font-semibold text-slate-900).
 * 5. Subject line: only "Subject:" is bold; student's name is normal/medium.
 * 6. Paragraph spacing: increased by ~4-6px (space-y-5.5 / space-y-[22px]).
 * 7. Body font: exactly preserved (~11-12pt print scale / 13.5pt canvas / 1.45 leading).
 * 8. Whitespace before "Sincerely": slightly tightened (pt-2).
 * 9. Signature: authentic Dr. Mukul Pandey signature preserved.
 * 10. Footer verification URL: increased slightly to 9.2pt font-mono text-slate-500 for crisp print readability.
 * 11. Reference: strictly INTERN REFERENCE ID (no LOR reference ID, no QR).
 * 12. COMPLETION CERTIFICATE REMAINS 100% UNTOUCHED.
 */

import React from 'react';
import { MapPin, Mail, Globe, Building2 } from 'lucide-react';

export interface LORTemplateProps {
  recipientName: string;
  recipientCollege: string;
  internshipTrack: string;
  referenceId: string;
  startDate: string;
  endDate: string;
  issueDate: string;
  projectSummary?: string;
  performanceParagraph?: string;
  contributionParagraph?: string;
  recommendationStatement?: string;
  ceoName?: string;
  ceoDesignation?: string;
  innerRef?: React.RefObject<HTMLDivElement>;
}

export default function InternshipLORTemplate({
  recipientName,
  recipientCollege,
  internshipTrack,
  referenceId,
  startDate,
  endDate,
  issueDate,
  projectSummary,
  performanceParagraph,
  contributionParagraph,
  recommendationStatement,
  ceoName = 'Dr. Mukul Pandey',
  ceoDesignation = 'CEO & Founder',
  innerRef,
}: LORTemplateProps) {
  // 1. Opening — 2 lines
  const openingText = `I am pleased to recommend **${recipientName}**, who successfully completed an internship at **SARTHI** in **${internshipTrack}** from **${startDate} to ${endDate}**.`;

  // 2. Performance — 2–3 lines
  const performanceText = performanceParagraph || 
    `During the internship, ${recipientName} demonstrated strong problem-solving abilities, technical competence, teamwork, a willingness to learn, and a responsible approach to assigned tasks. The intern consistently showed professionalism and a positive attitude toward new challenges.`;

  // 3. Contribution — 2–3 lines
  const contributionText = contributionParagraph || 
    `${recipientName} made meaningful contributions to assigned projects and worked effectively with the team. Their ability to learn quickly, communicate clearly, and complete responsibilities with sincerity was appreciated throughout the internship.`;

  // 4. Recommendation — 2 lines
  const recommendationText = recommendationStatement || 
    `Based on the intern's performance and conduct, I am pleased to recommend **${recipientName}** for future academic and professional opportunities. I wish them continued success in their career.`;

  // Helper to render bold markdown (**name**) cleanly
  const renderFormattedParagraph = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-bold text-[#0F172A]">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div
      ref={innerRef}
      id="lor-print-area"
      className="relative bg-white text-[#1E293B] shadow-xl overflow-hidden flex flex-col justify-between border border-slate-200"
      style={{
        aspectRatio: '210 / 297',
        padding: '15mm 22mm 15mm 22mm',
        fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* EMBEDDED TYPOGRAPHY */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
      `}</style>

      {/* TOP & MAIN BODY CONTAINER */}
      <div className="relative z-10 flex flex-col justify-between flex-1">
        {/* ── 1. CORPORATE HEADER ── */}
        <div className="flex justify-between items-center border-b border-slate-250 pb-3 mb-2">
          {/* Left: Brand Identity */}
          <div className="flex items-center gap-3.5">
            <div className="h-[95px] w-auto relative flex items-center justify-center shrink-0">
              <img
                src="/sarthi-logo.png"
                alt="SARTHI Logo"
                className="h-[95px] max-h-[95px] w-auto object-contain"
                style={{ height: '95px', maxHeight: '95px', width: 'auto', maxWidth: '280px', objectFit: 'contain' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/sarthi-logo.png';
                }}
              />
            </div>
            <div>
              <h1 className="text-[21pt] font-extrabold tracking-tight text-[#0F172A] uppercase leading-none font-outfit">
                SARTHI
              </h1>
              <p className="text-[9.5pt] font-bold tracking-[0.22em] text-[#1B365D] uppercase mt-1">
                LEARN • BUILD • GET HIRED
              </p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="inline-flex items-center gap-1 text-[8.5pt] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-250">
                  <Building2 className="w-3 h-3 text-slate-600" />
                  MSME Certified • Govt. of India
                </span>
              </div>
            </div>
          </div>

          {/* Right: Date & Intern Reference No */}
          <div className="text-right flex flex-col justify-center space-y-1">
            <div>
              <span className="text-[9pt] uppercase tracking-wider text-slate-400 font-bold block">Issue Date</span>
              <span className="text-[12.5pt] font-bold text-slate-900 leading-tight">{issueDate}</span>
            </div>
            <div className="pt-1">
              <span className="text-[9pt] uppercase tracking-wider text-slate-400 font-bold block">Intern Reference ID</span>
              <span className="text-[11.5pt] font-mono font-bold text-[#1B365D] tracking-tight bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200 leading-tight inline-block">
                {referenceId}
              </span>
            </div>
          </div>
        </div>

        {/* ── 2. CENTERED MAIN TITLE (1-2px LARGER WITH SHORT SUBTLE DIVIDERS) ── */}
        <div className="pt-2 pb-1 text-center">
          <div className="flex items-center justify-center gap-2.5">
            <div className="w-5 h-[1px] bg-slate-300 rounded-full" />
            <h2 className="text-[20pt] font-extrabold tracking-tight text-[#0F172A] uppercase leading-tight font-outfit">
              LETTER OF RECOMMENDATION
            </h2>
            <div className="w-5 h-[1px] bg-slate-300 rounded-full" />
          </div>
          <p className="text-[9pt] font-semibold uppercase tracking-[0.22em] text-[#1B365D] mt-0.5">
            INTERNSHIP RECOMMENDATION
          </p>
        </div>

        {/* ── 3. SALUTATION & SUBJECT LINE (LEFT ALIGNED) ── */}
        <div className="pt-1.5 pb-1 space-y-1 text-left">
          <p className="text-[14.5pt] font-semibold text-[#0F172A]">
            To Whom It May Concern,
          </p>
          <p className="text-[13.5pt] text-slate-700 font-normal">
            <strong className="font-bold text-slate-900">Subject:</strong> Recommendation for <span className="text-slate-800 font-medium">{recipientName}</span>
          </p>
        </div>

        {/* ── 4. 4 CONCISE PARAGRAPHS (ENLARGED 14.5pt / LEADING 1.48) ── */}
        <div className="space-y-4.5 text-[14.5pt] leading-[1.48] text-[#334155] text-left font-normal my-auto font-sans">
          {/* Paragraph 1: Opening (2 lines) */}
          <p>
            {renderFormattedParagraph(openingText)}
          </p>

          {/* Paragraph 2: Performance (2-3 lines) */}
          <p>
            {renderFormattedParagraph(performanceText)}
          </p>

          {/* Paragraph 3: Contribution (2-3 lines) */}
          <p>
            {renderFormattedParagraph(contributionText)}
          </p>

          {/* Paragraph 4: Recommendation (2 lines) */}
          <p>
            {renderFormattedParagraph(recommendationText)}
          </p>
        </div>

        {/* ── 5. SIGNATORY SECTION (TIGHTENED TOP WHITESPACE / REAL SIGNATURE) ── */}
        <div className="pt-2 pb-1">
          <p className="text-[12.5pt] text-slate-700 font-medium mb-1">Sincerely,</p>
          <div className="space-y-0.5 text-left">
            <div className="h-16 flex items-start justify-start mb-0.5">
              <img
                src="/signature-mukul-pandey.png"
                alt="Dr. Mukul Pandey Signature"
                className="h-16 max-h-16 w-auto object-contain"
                style={{ height: '62px', maxHeight: '62px', width: 'auto', maxWidth: '230px', objectFit: 'contain' }}
              />
            </div>
            <div className="w-36 h-[1.5px] bg-[#1B365D]/30 my-1 rounded-full" />
            <h4 className="text-[15pt] font-black text-[#0F172A] leading-tight">
              {ceoName}
            </h4>
            <p className="text-[10.5pt] font-bold text-[#1B365D] uppercase tracking-wider leading-tight">
              {ceoDesignation}
            </p>
            <p className="text-[9.5pt] font-bold text-slate-500 uppercase tracking-wider">
              SARTHI
            </p>
          </div>
        </div>
      </div>

      {/* ── 6. OFFICIAL CORPORATE FOOTER WITH ENHANCED PRINT READABLE VERIFICATION URL ── */}
      <div className="relative z-10 pt-3 border-t border-slate-200 mt-2 font-sans">
        <div className="flex flex-wrap justify-between items-center text-[9pt] text-slate-600 gap-y-1">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-[#0F172A] tracking-wider uppercase">SARTHI</span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400" /> Jamshedpur, Jharkhand, India
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-slate-600">
              <Mail className="w-3 h-3 text-slate-400" /> admin@sarthi.in
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1 text-slate-600">
              <Globe className="w-3 h-3 text-slate-400" /> www.sarthi-woad.vercel.app
            </span>
          </div>

          <div>
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 font-mono font-bold rounded border border-emerald-200 text-[8pt]">
              UDYAM REG. NO.: UDYAM-JH-06-0070918
            </span>
          </div>
        </div>

        {/* Enhanced print-readable verification URL */}
        <div className="text-center pt-1.5">
          <p className="text-[9.2pt] text-slate-500 font-mono font-medium">
            Document verification: https://sarthi-woad.vercel.app/verify/interns/{referenceId}
          </p>
        </div>
      </div>
    </div>
  );
}
