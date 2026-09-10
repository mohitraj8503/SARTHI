'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Eye, Printer, Download } from 'lucide-react';
import CertificateTemplate from '@/components/certificate/CertificateTemplate';
import { downloadCertificateAsPdf, downloadCertificateAsPng } from '@/lib/client-certificate-export';

interface CertificateData {
  verificationId: string;
  issuedAt: string | Date;
  score: number;
  user: {
    name: string;
    email: string;
  };
  certification: {
    title: string;
    description: string;
  };
  htmlSnapshot?: string | null;
}

interface Props {
  certificate: CertificateData;
}

export default function CertificateVerificationClient({ certificate }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const certRootRef = useRef<HTMLDivElement | null>(null);
  const credentialId = certificate.verificationId;
  const issuedDateStr = typeof certificate.issuedAt === 'string' ? certificate.issuedAt : new Date(certificate.issuedAt).toISOString();

  const htmlSnapshot = certificate.htmlSnapshot;

  const handlePrint = () => {
    if (htmlSnapshot) {
      downloadCertificateAsPdf(htmlSnapshot);
      return;
    }

    if (!certRootRef.current) {
      window.print();
      return;
    }

    const printContainer = document.getElementById('cert-verify-print-portal');
    if (!printContainer) return;

    printContainer.innerHTML = '';
    const clone = certRootRef.current.cloneNode(true) as HTMLElement;
    clone.style.width = '297mm';
    clone.style.height = '210mm';
    clone.style.boxShadow = 'none';
    clone.style.transform = 'none';
    clone.style.margin = '0';
    clone.style.padding = '0';
    clone.style.overflow = 'hidden';
    printContainer.appendChild(clone);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.print();
      });
    });
  };


  const [pngLoading, setPngLoading] = useState(false);

  const handleDownloadPng = async () => {
    if (!htmlSnapshot) {
      console.warn('PNG download is only available when certificate HTML snapshot exists.');
      return;
    }

    setPngLoading(true);
    try {
      // Attempt client-side image generation first to bypass server Playwright limitations
      await downloadCertificateAsPng(htmlSnapshot, `certificate-${credentialId}.png`);
    } catch (clientErr) {
      console.warn('Client-side PNG generation failed, falling back to server-side render:', clientErr);
      try {
        // Server-side Playwright render fallback
        const res = await fetch(`/api/certificates/${credentialId}/png`);
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `certificate-${credentialId}.png`;
        link.click();
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error('Failed to download certificate PNG from server:', err);
      }
    } finally {
      setPngLoading(false);
    }
  };


  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-3 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-505 text-white font-black rounded-lg transition-all shadow-xl shadow-emerald-900/30 active:scale-95 group no-print cursor-pointer"
      >
        VIEW CERTIFICATE
        <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
      </button>

      {/* Modal Overlay */}
      {isOpen && mounted && createPortal(
        <div
          className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[99999] flex flex-col items-center justify-start p-4 md:p-8 overflow-y-auto animate-in fade-in duration-200 no-print-backdrop"
          style={{
            backgroundImage: "linear-gradient(rgba(15, 23, 42, 0.88), rgba(15, 23, 42, 0.88)), url('https://cdn.pixabay.com/photo/2022/06/28/10/04/graduation-7289345_960_720.png')",
            backgroundSize: '150%',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >

          <div className="w-full max-w-5xl flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-4 border-b border-slate-800 mb-6 sticky top-0 bg-slate-950/95 backdrop-blur-md z-20 pt-2 -mt-2">
            <div className="space-y-2">
              <h3 className="text-lg font-black text-slate-100 uppercase tracking-wider">Certificate Viewer</h3>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900/90 text-slate-100 text-sm font-bold uppercase rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-emerald-400" />
                  Print Certificate
                </button>
                <button
                  type="button"
                  onClick={handleDownloadPng}
                  disabled={!htmlSnapshot || pngLoading}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold uppercase rounded-xl transition-all disabled:bg-slate-600 disabled:cursor-not-allowed cursor-pointer"
                >
                  {pngLoading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Generating…
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Download PNG
                    </>
                  )}
                </button>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 rounded-xl transition-all cursor-pointer self-end md:self-center"
              aria-label="Close Viewer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Certificate Display Area */}
          <div className="w-full flex justify-center">
            <div className="w-full animate-in zoom-in-95 duration-200">
              {htmlSnapshot ? (
                /* Fixed 1050×787.5 iframe scaled to fit the available width */
                <div
                  className="w-full"
                  style={{
                    position: 'relative',
                    paddingBottom: `${(787.5 / 1050) * 100}%`,
                    height: 0,
                    overflow: 'hidden',
                  }}
                >
                  <iframe
                    srcDoc={htmlSnapshot}
                    title="Certificate preview"
                    sandbox="allow-scripts allow-same-origin allow-popups"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: '50%',
                      width: '1050px',
                      height: '787.5px',
                      border: 'none',
                      background: 'transparent',
                      transformOrigin: 'top center',
                      transform: 'translateX(-50%) scale(1)',
                    }}
                    ref={(el) => {
                      if (!el) return;
                      const setScale = () => {
                        const containerW = el.parentElement?.offsetWidth || 1050;
                        const scale = Math.min(1, containerW / 1050);
                        el.style.transform = `translateX(-50%) scale(${scale})`;
                        // Adjust parent height to match scaled certificate height
                        const parent = el.parentElement as HTMLElement;
                        if (parent) {
                          parent.style.height = `${787.5 * scale}px`;
                          parent.style.paddingBottom = '0';
                        }
                      };
                      setScale();
                      window.addEventListener('resize', setScale);
                    }}
                  />
                </div>
              ) : (
                <div ref={certRootRef} className="rounded-[32px] overflow-hidden shadow-2xl print-container">
                  <CertificateTemplate
                    template={(certificate as any).templateConfig || null}
                    recipient={{
                      studentName: certificate.user?.name,
                      issueDate: issuedDateStr,
                      certificateId: credentialId,
                      verificationUrl: `https://sarthi-woad.vercel.app/certification-exams/verify/${credentialId}`
                    }}
                    courseName={certificate.certification?.title}
                  />
                </div>
              )}
            </div>
          </div>

        </div>,
        document.body
      )}

      {mounted && createPortal(<div id="cert-verify-print-portal" />, document.body)}

      <style jsx global>{`
        #cert-verify-print-portal { display: none; }
        @media print {
          @page {
            size: 297mm 210mm; /* A4 Landscape */
            margin: 0;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          body > *:not(#cert-verify-print-portal) {
            display: none !important;
          }
          html {
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
          }
          body {
            margin: 0 !important;
            padding: 0 !important;
            height: 0 !important;
            overflow: hidden !important;
            background: white !important;
          }
          #cert-verify-print-portal {
            display: block !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            width: 100% !important;
            height: 100% !important;
            overflow: hidden !important;
            margin: 0 !important;
            padding: 0 !important;
            z-index: 2147483647 !important;
          }
          #cert-verify-print-portal #professional-certificate-root {
            display: block !important;
            position: static !important;
            width: 100% !important;
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            transform: none !important;
            zoom: 1 !important;
            overflow: hidden !important;
          }
        }
      `}</style>
    </>
  );
}
