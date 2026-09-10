'use client';

/**
 * InternshipCertificateTemplate — THE SINGLE SOURCE OF TRUTH
 *
 * This is the EXACT certificate design used by Certificate Studio.
 * Both Certificate Studio and the /verify/interns/[id] page import
 * this component directly so they always render identically.
 * Do NOT duplicate or recreate this template anywhere else.
 */

import React from 'react';
import { MapPin, Mail, Globe, Building2, QrCode as QrIcon } from 'lucide-react';

export interface CertificateTemplateProps {
  recipientName: string;
  recipientCollege: string;
  internshipTrack: string;
  referenceId: string;
  startDate: string;
  endDate: string;
  issueDate: string;
  customExposureBody?: string;
  performanceBody?: string;
  closingStatement?: string;
  ceoName?: string;
  ceoDesignation?: string;
  qrCodeDataUrl?: string;
  isQrEnabled?: boolean;
  /** Optional ref forwarded so Studio/verify page can capture the DOM for PDF/snapshot */
  innerRef?: React.RefObject<HTMLDivElement>;
}

export default function InternshipCertificateTemplate({
  recipientName,
  recipientCollege,
  internshipTrack,
  referenceId,
  startDate,
  endDate,
  issueDate,
  customExposureBody,
  performanceBody,
  closingStatement,
  ceoName = 'Dr. Mukul Pandey',
  ceoDesignation = 'CEO & Founder',
  qrCodeDataUrl,
  isQrEnabled = true,
  innerRef,
}: CertificateTemplateProps) {
  const exposureText = customExposureBody
    ?? `During the internship, the intern was exposed to various activities in the ${internshipTrack} domain, including relevant tools, technologies, and professional practices.`;

  const performanceText = performanceBody
    ?? 'Throughout the internship, the intern demonstrated sincerity, discipline, and a willingness to learn and contribute to assigned responsibilities.';

  const closingText = closingStatement
    ?? "We appreciate the intern's efforts and contribution during the internship and wish the intern continued success in future academic and professional pursuits.";

  return (
    <div
      ref={innerRef}
      id="certificate-print-area"
      className="relative bg-white text-[#0F172A] shadow-xl overflow-hidden flex flex-col justify-between border border-slate-200"
      style={{
        aspectRatio: '210 / 297',
        padding: '14mm 20mm 14mm 20mm',
        fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
      }}
    >
      {/* EMBEDDED GOOGLE TYPOGRAPHY */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@800;900&family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .certificate-heading-serif {
          font-family: 'Playfair Display', 'Cormorant Garamond', 'Georgia', serif;
        }
      `}</style>

      {/* TOP-RIGHT DECORATIVE TEAL CORNER */}
      <div
        className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-[#0F9F8A]/30 via-[#DDF7F2]/50 to-transparent pointer-events-none z-0"
        style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}
      />

      {/* MAIN DOCUMENT BODY */}
      <div className="relative z-10 space-y-4">
        {/* ── BRAND HEADER ── */}
        <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-0.5">
          {/* Left: Brand Identity */}
          <div className="flex items-center gap-4">
            <div className="h-[112px] w-auto relative flex items-center justify-center shrink-0">
              <img
                src="/sarthi-logo.png"
                alt="SARTHI Logo"
                className="h-[112px] max-h-[112px] w-auto object-contain"
                style={{ height: '112px', maxHeight: '112px', width: 'auto', maxWidth: '310px', objectFit: 'contain' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/sarthi-logo.png';
                }}
              />
            </div>
            <div className="space-y-1">
              <h2 className="text-[26pt] font-black tracking-tight text-[#0F172A] leading-normal mb-0.5 uppercase whitespace-nowrap font-outfit">
                SARTHI
              </h2>
              <p className="text-[11.5pt] font-extrabold tracking-[0.15em] text-[#0F9F8A] uppercase whitespace-nowrap block pt-0.5">
                LEARN • BUILD • GET HIRED
              </p>
              <p className="text-[10.5pt] font-semibold text-slate-600 leading-normal block">
                MSME Certified · Govt. of India
              </p>
            </div>
          </div>

          {/* Right: Issue Date + Reference ID */}
          <div className="text-right space-y-2 z-10 shrink-0">
            <div className="leading-tight">
              <span className="text-[9.5pt] font-bold uppercase text-[#475569] block tracking-wider">ISSUE DATE</span>
              <span className="text-[12.5pt] font-extrabold text-[#0F172A]">{issueDate}</span>
            </div>
            <div className="leading-tight pt-0.5">
              <span className="text-[9.5pt] font-bold uppercase text-[#475569] block tracking-wider">REFERENCE ID</span>
              <span className="text-[12.5pt] font-mono font-black text-[#0F9F8A] tracking-wider bg-slate-50 px-3.5 py-1.5 rounded-md border border-slate-200 inline-block whitespace-nowrap">
                {referenceId}
              </span>
            </div>
          </div>
        </div>

        {/* ── MAIN TITLE ── */}
        <div className="text-center space-y-3.5 pt-8 pb-5 my-3">
          <h1
            className="text-[32pt] font-black tracking-[0.07em] text-[#0F172A] uppercase certificate-heading-serif mb-1"
            style={{ fontFamily: "'Playfair Display', 'Cormorant Garamond', 'Georgia', serif" }}
          >
            TO WHOM IT MAY CONCERN
          </h1>
          <h3 className="text-[13.5pt] font-extrabold tracking-[0.26em] text-[#475569] uppercase font-sans pt-1">
            INTERNSHIP COMPLETION LETTER
          </h3>
          <div className="w-[70mm] h-[4px] bg-[#0F9F8A] mx-auto mt-4 rounded-full" />
        </div>

        {/* ── BODY PARAGRAPHS ── */}
        <div className="space-y-4.5 text-[17.5pt] leading-[1.8] text-[#334155] text-justify pt-2 max-w-[190mm] mx-auto font-sans">
          <p>
            This is to certify that{' '}
            <strong className="font-bold text-[#0F172A] underline decoration-[#0F9F8A]/40 underline-offset-4">
              {recipientName}
            </strong>{' '}
            from <strong className="font-bold text-[#0F172A]">{recipientCollege}</strong> has successfully
            completed the internship at{' '}
            <strong className="font-bold text-[#0F172A]">SARTHI</strong> from{' '}
            <strong className="font-bold text-[#0F172A]">{startDate}</strong> to{' '}
            <strong className="font-bold text-[#0F172A]">{endDate}</strong>.
          </p>
          <p>{exposureText}</p>
          <p>{performanceText}</p>
          <p>{closingText}</p>
        </div>
      </div>

      {/* ── LOWER SECTION: STACKED QR + CEO SIGNATURE + CORPORATE FOOTER ── */}
      <div className="relative z-10 pt-4 border-t border-slate-200 font-sans space-y-4 mt-2">
        <div className="flex justify-between items-end pb-0.5">
          {/* QR Block */}
          {isQrEnabled ? (
            <div className="flex flex-col items-start gap-1.5">
              {qrCodeDataUrl ? (
                <div className="relative p-1.5 bg-white rounded-xl border border-slate-200 shadow-2xs shrink-0">
                  {/* Branded corner ticks */}
                  <div className="absolute -top-0.5 -left-0.5 w-4 h-4 border-t-2 border-l-2 border-[#0F9F8A] rounded-tl-sm pointer-events-none" />
                  <div className="absolute -top-0.5 -right-0.5 w-4 h-4 border-t-2 border-r-2 border-[#0F9F8A] rounded-tr-sm pointer-events-none" />
                  <div className="absolute -bottom-0.5 -left-0.5 w-4 h-4 border-b-2 border-l-2 border-[#0F9F8A] rounded-bl-sm pointer-events-none" />
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 border-b-2 border-r-2 border-[#0F9F8A] rounded-br-sm pointer-events-none" />
                  <img
                    src={qrCodeDataUrl}
                    alt="Scan to Verify QR Code"
                    className="w-[100px] h-[100px] object-contain rounded-lg"
                    style={{ width: '100px', height: '100px', objectFit: 'contain' }}
                  />
                </div>
              ) : (
                <div className="w-[100px] h-[100px] bg-[#174F3A]/10 animate-pulse rounded-xl flex items-center justify-center shrink-0 border border-slate-200">
                  <QrIcon className="w-8.5 h-8.5 text-[#174F3A]" />
                </div>
              )}
              <div className="space-y-0.5 text-left pt-0.5">
                <span className="text-[10.5pt] font-black tracking-widest text-[#0F9F8A] uppercase block">
                  SCAN TO VERIFY
                </span>
                <span className="text-[10pt] font-mono font-bold text-[#0F172A] block">
                  Certificate ID: {referenceId}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-[10pt] text-amber-700 font-semibold italic">
              (Verification QR Disabled)
            </div>
          )}

          {/* CEO Signature Block */}
          <div className="space-y-1 text-right">
            <div className="h-18 flex items-end justify-end mb-0.5">
              <img
                src="/signature-mukul-pandey.png"
                alt="Dr. Mukul Pandey Signature"
                className="h-18 max-h-18 w-auto object-contain"
                style={{ height: '70px', maxHeight: '70px', width: 'auto', maxWidth: '250px', objectFit: 'contain' }}
              />
            </div>
            <div className="w-50 h-[2px] bg-[#0F9F8A]/40 ml-auto my-0.5 rounded-full" />
            <h4 className="text-[15.5pt] font-black text-[#0F172A] leading-tight tracking-tight">{ceoName}</h4>
            <p className="text-[10.5pt] font-extrabold tracking-[0.18em] text-[#0F9F8A] uppercase leading-tight font-sans">
              {ceoDesignation}
            </p>
          </div>
        </div>

        {/* ── CORPORATE FOOTER ── */}
        <div className="border-t border-slate-200 pt-3 mt-2 pb-0 font-sans space-y-2">
          {/* Row 1: Company name + MSME badge */}
          <div className="flex items-center justify-between text-[11.5pt] font-extrabold text-[#0F172A] tracking-wider uppercase">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#0F9F8A] shrink-0" />
              <span>SARTHI</span>
            </div>
            <span className="text-[9.5pt] font-extrabold text-[#0F9F8A] tracking-wider bg-emerald-50 px-3 py-0.5 rounded border border-emerald-200">
              UDYAM REG. NO.: UDYAM-JH-06-0070918
            </span>
          </div>

          {/* Row 2: Address · Email · Website */}
          <div className="flex items-center justify-between text-[9.5pt] text-slate-600 font-semibold tracking-wide whitespace-nowrap">
            <span className="inline-flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#0F9F8A] shrink-0" />
              <span>Jamshedpur, Jharkhand, India</span>
            </span>
            <span className="inline-flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-[#0F9F8A] shrink-0" />
              <span>admin@sarthi.in</span>
            </span>
            <span className="inline-flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-[#0F9F8A] shrink-0" />
              <span>www.sarthi-woad.vercel.app</span>
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}
