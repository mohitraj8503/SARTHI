'use client';

/**
 * Full-page certificate viewer for /verify/interns/[id]/certificate
 *
 * Specification-compliant A4 portrait view (210 × 297 mm) matching Certificate Studio:
 * - Zoom controls (+ / - / reset)
 * - Optimal max width (860px) so paper fills screen comfortably without excessive side gaps
 * - Fixed standalone viewport over public layout (no header/footer overlay leakage)
 */

import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Download, ArrowLeft, ShieldCheck, ZoomIn, ZoomOut, Printer } from 'lucide-react';
import InternshipCertificateTemplate from '@/components/certificate/InternshipCertificateTemplate';
import { downloadCertificateAsPdf } from '@/lib/client-certificate-export';
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
}

export default function CertificateFullPageClient({ certData }: Props) {
  const certRef = useRef<HTMLDivElement>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [mobileScale, setMobileScale] = useState<number>(1);

  const { referenceId, recipientName } = certData;

  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.sarthi-woad.vercel.app';
    const verifyUrl = `${origin}/verify/interns/${encodeURIComponent(referenceId)}`;
    QRCode.toDataURL(verifyUrl, {
      width: 280,
      margin: 1,
      color: { dark: '#0F172A', light: '#FFFFFF' },
    })
      .then(setQrCodeDataUrl)
      .catch(err => console.error('QR generation error:', err));
  }, [referenceId]);

  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        const screenW = window.innerWidth;
        if (screenW < 920) {
          // Fit 880px wide container into screenW - 24px padding
          const fit = Math.max(0.35, Math.min(1, (screenW - 24) / 880));
          setMobileScale(fit);
        } else {
          setMobileScale(1);
        }
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleDownloadPdf = async () => {
    if (!certRef.current) return;
    const tid = toast.loading('Exporting Official A4 Certificate PDF (300 DPI)...');
    try {
      await downloadCertificateAsPdf(
        certRef.current,
        `Certificate_${referenceId}_${recipientName.replace(/\s+/g, '_')}`
      );
      toast.success('Official Certificate PDF downloaded!', { id: tid });
    } catch (err: any) {
      toast.error('PDF export failed: ' + (err?.message || err), { id: tid });
    }
  };

  const effectiveScale = zoomScale * mobileScale;
  const targetWidth = 880;
  const targetHeight = targetWidth * (297 / 210); // A4 ratio ~ 1244px
  const negativeMarginBottom = effectiveScale < 1 ? - (targetHeight * (1 - effectiveScale)) : 0;

  return (
    <div className="fixed inset-0 z-[60] bg-slate-100/95 overflow-y-auto flex flex-col font-sans text-slate-800 certificate-fullpage-viewport">
      {/* CLEAN FLOATING TOOLBAR WITH ZOOM CONTROLS */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-3 md:px-8 py-2.5 flex items-center justify-between shadow-xs gap-2 no-print print:hidden">
        <button
          onClick={() => {
            if (typeof window !== 'undefined' && window.history.length > 1) {
              window.history.back();
            } else {
              window.location.href = `/verify/interns/${encodeURIComponent(referenceId)}`;
            }
          }}
          className="inline-flex items-center gap-1.5 text-[11px] md:text-xs font-bold text-slate-700 hover:text-slate-900 uppercase tracking-wider transition-colors px-2.5 py-1.5 rounded-lg hover:bg-slate-100 shrink-0 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#0F9F8A]" />
          <span className="hidden sm:inline">Back to Verification</span>
          <span className="sm:hidden">Back</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200/80 rounded-full text-xs font-bold text-[#0F9F8A]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>OFFICIAL CREDENTIAL — {referenceId}</span>
          </div>

          {/* ZOOM CONTROLS */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-1 rounded-xl">
            <button
              onClick={() => setZoomScale(z => Math.max(0.6, z - 0.1))}
              className="p-1 hover:bg-slate-200 rounded text-slate-600 transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] sm:text-[11px] font-mono font-bold text-slate-700 px-1 min-w-[34px] text-center">
              {Math.round(effectiveScale * 100)}%
            </span>
            <button
              onClick={() => setZoomScale(z => Math.min(1.4, z + 0.1))}
              className="p-1 hover:bg-slate-200 rounded text-slate-600 transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ACTIONS: PRINT & DOWNLOAD PDF */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 md:px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[11px] md:text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer shrink-0"
            title="Print Certificate"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-400" />
            <span>Print</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            className="inline-flex items-center gap-1.5 px-3 md:px-5 py-2 bg-[#0F9F8A] hover:bg-[#0C8372] text-white font-extrabold text-[11px] md:text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer shrink-0"
            title="Download PDF"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download</span>
            <span>PDF</span>
          </button>
        </div>
      </header>

      {/* A4 CANVAS CONTAINER — AUTO-SCALES 100% TO MOBILE SCREENS */}
      <main className="flex-1 w-full overflow-x-hidden p-3 md:p-8 flex justify-center items-start certificate-fullpage-main">
        <div
          style={{
            width: `${targetWidth}px`,
            transform: `scale(${effectiveScale})`,
            transformOrigin: 'top center',
            marginBottom: `${negativeMarginBottom}px`,
            transition: 'transform 0.15s ease-out'
          }}
          className="shrink-0 certificate-scalable-box"
        >
          <InternshipCertificateTemplate
            innerRef={certRef}
            recipientName={certData.recipientName}
            recipientCollege={certData.recipientCollege}
            internshipTrack={certData.internshipTrack}
            referenceId={certData.referenceId}
            startDate={certData.startDate}
            endDate={certData.endDate}
            issueDate={certData.issueDate}
            customExposureBody={certData.customExposureBody}
            performanceBody={certData.performanceBody}
            closingStatement={certData.closingStatement}
            qrCodeDataUrl={qrCodeDataUrl}
            isQrEnabled={true}
          />
        </div>
      </main>

      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0 !important;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          header, .no-print, [role="toolbar"] {
            display: none !important;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            width: 210mm !important;
            height: 297mm !important;
            overflow: visible !important;
          }
          .certificate-fullpage-viewport {
            position: static !important;
            background: #ffffff !important;
            overflow: visible !important;
            width: 210mm !important;
            height: 297mm !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .certificate-fullpage-main {
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
            display: block !important;
            width: 210mm !important;
            height: 297mm !important;
          }
          .certificate-scalable-box {
            width: 210mm !important;
            height: 297mm !important;
            transform: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          #certificate-print-area {
            width: 210mm !important;
            height: 297mm !important;
            max-width: 210mm !important;
            max-height: 297mm !important;
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}</style>
    </div>
  );
}
