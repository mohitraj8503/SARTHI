'use client';

import React, { useEffect, useState } from 'react';

export interface CertificateTemplateConfig {
  mainTitle?: string;
  subTitle?: string;
  certifiesText?: string;
  descriptionText?: string;
  courseName?: string;
  specialization?: string;
  brandName?: string;
  tagline?: string;
  directorName?: string;
  directorTitle?: string;
  bgImage?: string;
  logoUrl?: string;
  signatureUrl?: string;
  completionDate?: string;
}

export interface CertificateRecipientData {
  studentName?: string;
  enrollmentNo?: string;
  issueDate?: string;
  certificateId?: string;
  verificationUrl?: string;
}

export interface CertificateTemplateProps {
  template?: CertificateTemplateConfig;
  recipient?: CertificateRecipientData;
  // Legacy prop overrides for backward compatibility
  organization?: string;
  organizationTagline?: string;
  studentName?: string;
  courseName?: string;
  supportingLineTop?: string;
  supportingLineBottom?: string;
  issueDate?: string;
  certificateId?: string;
  verificationUrl?: string;
  signatureName?: string;
  signatureRole?: string;
  logoUrl?: string;
  enrollmentNo?: string;
}

export default function CertificateTemplate({
  template,
  recipient,
  organization,
  organizationTagline,
  studentName: legacyStudentName,
  courseName: legacyCourseName,
  supportingLineTop,
  supportingLineBottom,
  issueDate: legacyIssueDate,
  certificateId: legacyCertId,
  verificationUrl: legacyVerifyUrl,
  signatureName: legacySigName,
  signatureRole: legacySigRole,
  logoUrl: legacyLogoUrl,
  enrollmentNo: legacyEnrollmentNo,
}: CertificateTemplateProps) {
  // Merge props (template config takes precedence over defaults, recipient data takes precedence)
  const brandName = template?.brandName || organization || 'SARTHI';
  const tagline = template?.tagline || organizationTagline || 'INNOVATE TODAY';
  const student = recipient?.studentName || legacyStudentName || 'John Doe';
  const course = template?.courseName || legacyCourseName || 'Artificial Intelligence';
  const spec = template?.specialization || course;
  const certId = recipient?.certificateId || legacyCertId || 'TT-PE-2026-08503';
  const dateStr = template?.completionDate || recipient?.issueDate || legacyIssueDate || '13.06.2025';
  const verifyUrl = recipient?.verificationUrl || legacyVerifyUrl || 'https://sarthi-woad.vercel.app/verify/';
  const sigName = template?.directorName || legacySigName || 'Dr. Mukul Pandey';
  const sigRole = template?.directorTitle || legacySigRole || 'CEO & FOUNDER';
  const logo = template?.logoUrl || legacyLogoUrl || '/sarthi-logo.png';
  const sigImgRaw = template?.signatureUrl || '/signature-mukul-pandey.png';
  const sigImg = sigImgRaw.startsWith('/') ? `https://sarthi-woad.vercel.app${sigImgRaw}` : sigImgRaw;

  // Normalize date to DD.MM.YYYY when possible
  function normalizeDate(d?: string) {
    if (!d) return d;
    // If already in DD.MM.YYYY format return as-is
    if (/^\d{2}\.\d{2}\.\d{4}$/.test(d)) return d;
    const parsed = new Date(d);
    if (!isNaN(parsed.getTime())) {
      const dd = String(parsed.getDate()).padStart(2, '0');
      const mm = String(parsed.getMonth() + 1).padStart(2, '0');
      const yyyy = parsed.getFullYear();
      return `${dd}.${mm}.${yyyy}`;
    }
    return d;
  }

  const displayDate = normalizeDate(dateStr);

  function normalizeCertificateTitle(raw: string) {
    const clean = raw.split('—')[0].split('-')[0].trim().toUpperCase();
    if (/\b(CERTIFICATE|CERTIFICATION|EXAM|AWARD)\b/.test(clean)) return clean;
    return `${clean} CERTIFICATE`;
  }

  const certTitle = normalizeCertificateTitle(template?.mainTitle || course);

  const subTitleText = template?.subTitle !== undefined ? template.subTitle : 'OF COMPLETION';
  const certifiesHeader = template?.certifiesText || supportingLineTop || 'THIS CERTIFIES THAT';
  const description = template?.descriptionText || supportingLineBottom || `has successfully completed a comprehensive program in ${course}, covering core and advanced modules in machine learning, data analysis, neural networks, and real-world AI applications.`;

  function resolveBgImage(): string {
    const normalizedCourse = course?.toLowerCase() || '';
    const normalizedTitle = certTitle.toLowerCase();
    const normalizedCertId = certId?.toLowerCase() || '';
    const combined = `${normalizedCourse} ${normalizedTitle} ${normalizedCertId}`;

    if (combined.includes('best intern') || combined.includes('tt-bia') || combined.includes('award')) {
      return '/best-intern-award-bg.jpg';
    }

    if (template?.bgImage && template.bgImage !== '/certificate-bg.png') return template.bgImage;

    if (combined.includes('excel') || combined.includes('tt-ex') || combined.includes('excel mastery')) {
      return '/excel-bg.jpg';
    }
    if (combined.includes('python') || combined.includes('tt-py') || combined.includes('python professional developer')) {
      return '/python-bg.jpg';
    }
    return template?.bgImage || '/certificate-bg.png';
  }

  const bgImg = resolveBgImage();

  const [zoom, setZoom] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const shouldScale = window.innerWidth < 1050;
      setIsMobile(shouldScale);
      if (shouldScale) {
        const containerWidth = window.innerWidth - 32;
        const calculatedZoom = Math.min(1, Math.max(0.35, containerWidth / 850));
        setZoom(calculatedZoom);
      } else {
        setZoom(1);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600;1,700&family=Outfit:wght@600;800&display=swap" rel="stylesheet" />

      <div 
        className="certificate-mobile-wrapper relative w-full flex justify-center"
        style={{
          overflow: isMobile ? 'auto' : 'visible',
          WebkitOverflowScrolling: 'touch',
          height: isMobile ? `${601 * zoom}px` : 'auto',
        }}
      >
        <div
          id="professional-certificate-root"
          className="certificate-page print-certificate-root relative overflow-hidden bg-cover bg-center bg-no-repeat text-[#0f2d5c] select-none flex items-center justify-center shadow-2xl rounded-3xl"
          style={{
            backgroundImage: bgImg.startsWith('/') || bgImg.startsWith('http') ? `url('${bgImg}')` : 'none',
            backgroundColor: bgImg.startsWith('#') ? bgImg : '#ffffff',
            containerType: 'inline-size',
            fontFamily: '"Montserrat", sans-serif',
            printColorAdjust: 'exact',
            WebkitPrintColorAdjust: 'exact',
            transform: isMobile ? `scale(${zoom})` : 'none',
            transformOrigin: 'top left',
            width: isMobile ? '850px' : '1050px',
            height: isMobile ? 'auto' : '787.5px',
            padding: '0',
            minWidth: isMobile ? undefined : '1050px',
            minHeight: isMobile ? undefined : '787.5px',
          } as React.CSSProperties}
        >
          <div 
            className="certificate-glass-card bg-white/80 rounded-[28px] flex flex-col justify-between relative shadow-2xl shadow-slate-900/10"
            style={{
              width: '930px',
              height: '685px',
              backgroundColor: 'rgba(255, 255, 255, 0.65)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '2.5px solid rgba(255, 255, 255, 0.88)',
              borderRadius: '28px',
              padding: '42px 52px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.08)',
              printColorAdjust: 'exact',
              WebkitPrintColorAdjust: 'exact',
            } as React.CSSProperties}
          >
            <div className="flex items-center justify-between pb-[5px]">
              <div className="flex items-center gap-[12px]">
                <img src={logo.startsWith('/') ? ('https://sarthi-woad.vercel.app' + logo) : logo} alt={brandName} width={42} height={42} className="h-[42px] w-auto object-contain" />
                <div className="flex flex-col">
                  <span style={{ fontSize: '14px', fontWeight: 800, letterSpacing: '1.2px', color: '#0f172a', lineHeight: 1.2, textTransform: 'uppercase', fontFamily: 'Montserrat, sans-serif' }}>
                    {brandName}
                  </span>
                  <span style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '4px', color: '#64748b', lineHeight: 1.2, textTransform: 'uppercase', fontFamily: 'Montserrat, sans-serif' }}>
                    {tagline}
                  </span>
                </div>
              </div>

              <img src="https://sarthi-woad.vercel.app/msme-logo.png" alt="Ministry of MSME" width={136} height={68} className="h-[68px] w-auto object-contain" />
            </div>

            <div className="text-center" style={{ marginTop: '2px' }}>
              <h1 style={{ fontSize: '46px', fontWeight: 900, letterSpacing: '2px', color: '#0f172a', lineHeight: 1, textTransform: 'uppercase', marginBottom: '2px' }}>
                {certTitle}
              </h1>
              <div className="flex items-center justify-center gap-[16px]" style={{ width: '460px', margin: '4px auto 0' }}>
                <div style={{ height: '1.5px', flex: 1, background: 'linear-gradient(to right, rgba(15,23,42,0), rgba(15,23,42,0.6))' }} />
                <span style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '4.5px', color: '#334155', textTransform: 'uppercase' }}>
                  {subTitleText}
                </span>
                <div style={{ height: '1.5px', flex: 1, background: 'linear-gradient(to right, rgba(15,23,42,0.6), rgba(15,23,42,0))' }} />
              </div>

              <div className="relative flex items-center justify-center" style={{ width: '280px', margin: '14px auto 0' }}>
                <div style={{ width: '100%', height: '1.5px', background: 'linear-gradient(90deg, transparent 0%, #cbd5e1 25%, #f97316 50%, #cbd5e1 75%, transparent 100%)' }} />
                <div style={{ position: 'absolute', width: '7px', height: '7px', borderRadius: '9999px', backgroundColor: '#f97316', boxShadow: '0 0 10px rgba(249,115,22,0.6)' }} />
              </div>
            </div>

            <div className="text-center" style={{ marginTop: '10px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', letterSpacing: '2.5px', textTransform: 'uppercase', marginBottom: '8px' }}>
                {certifiesHeader}
              </div>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '46px', fontWeight: 700, color: '#0f172a', lineHeight: 1.15, margin: '4px 0 14px', letterSpacing: '0.5px' }}>
                {student}
              </div>
              <p style={{ fontSize: '13px', fontWeight: 500, color: '#475569', lineHeight: 1.75, maxWidth: '640px', margin: '0 auto' }}>
                {description}
              </p>
            </div>

            <div className="text-center" style={{ marginTop: '12px', fontSize: '13.5px', color: '#334155' }}>
              <strong style={{ fontWeight: 700, color: '#0f172a' }}>Specialization:</strong> <span style={{ fontWeight: 600, color: '#475569' }}>{spec}</span>
            </div>

            <div className="flex justify-between items-end mt-[15px] pt-[10px] px-[10px] border-t border-slate-200/80" style={{ marginTop: '15px' }}>
              <div className="flex flex-col items-start" style={{ minWidth: '190px' }}>
                <div style={{ height: '44px', display: 'flex', alignItems: 'flex-end', marginBottom: '2px', fontSize: '14px', fontWeight: 800, color: '#0f172a', letterSpacing: '0.3px', fontFamily: 'Montserrat, sans-serif' }}>
                  {displayDate}
                </div>
                <div style={{ width: '100%', height: '1.5px', backgroundColor: '#cbd5e1', margin: '2px 0 6px 0' }} />
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', letterSpacing: '1.5px', textTransform: 'uppercase', marginTop: '2px' }}>
                  DATE OF ISSUE
                </div>
              </div>

              <div className="flex flex-col items-center text-center" style={{ minWidth: '190px' }}>
                <div style={{ height: '44px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginBottom: '2px', fontSize: '14px', fontWeight: 800, color: '#0f172a', letterSpacing: '0.3px', fontFamily: 'Montserrat, sans-serif' }}>
                  {certId}
                </div>
                <div style={{ width: '100%', height: '1.5px', backgroundColor: '#cbd5e1', margin: '2px 0 6px 0' }} />
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', letterSpacing: '1.5px', textTransform: 'uppercase', marginTop: '2px' }}>
                  CERTIFICATE ID
                </div>
              </div>

              <div className="flex flex-col items-end text-right" style={{ minWidth: '190px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', marginBottom: '2px', minHeight: '44px' }}>
                  <img src={sigImg} alt={sigName} style={{ height: '48px', width: 'auto', objectFit: 'contain', mixBlendMode: 'multiply' }} />
                </div>
                <div style={{ width: '100%', height: '1.5px', backgroundColor: '#cbd5e1', margin: '2px 0 6px 0' }} />
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', fontFamily: 'Outfit, sans-serif' }}>
                  {sigName}
                </div>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.5px', marginTop: '2px' }}>
                  {sigRole}
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'center', marginTop: '15px', fontSize: '8px', color: '#64748b', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', fontFamily: 'Montserrat, sans-serif' }}>
              Verify this credential at: {typeof window !== 'undefined' ? window.location.origin : 'https://sarthi-woad.vercel.app'}/verify/{certId}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
