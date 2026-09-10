'use client';

/**
 * Full-page recommendation viewer for /verify/interns/[id]/recommendation
 *
 * Read-only official A4 portrait view (210 × 297 mm) of the Letter of Recommendation:
 * - Clean top action bar with "Back to Verification"
 * - Zoom controls (+ / - / reset)
 * - Optimal centered paper container
 * - Renders published immutable LOR snapshot
 * - ZERO QR CODE on the recommendation document
 */

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, ZoomIn, ZoomOut, FileText } from 'lucide-react';
import InternshipLORTemplate from '@/components/certificate/InternshipLORTemplate';

interface LORData {
  referenceId: string;
  recipientName: string;
  recipientCollege: string;
  internshipTrack: string;
  startDate: string;
  endDate: string;
  issueDate: string;
  projectSummary?: string;
  performanceParagraph?: string;
  contributionParagraph?: string;
  recommendationStatement?: string;
  ceoName?: string;
  ceoDesignation?: string;
}

interface Props {
  lorData: LORData;
}

export default function RecommendationFullPageClient({ lorData }: Props) {
  const lorRef = useRef<HTMLDivElement>(null);
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [mobileScale, setMobileScale] = useState<number>(1);

  const { referenceId, recipientName } = lorData;

  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        const screenW = window.innerWidth;
        if (screenW < 920) {
          const fitScale = Math.max(0.35, Math.min(1, (screenW - 32) / 880));
          setMobileScale(fitScale);
        } else {
          setMobileScale(1);
        }
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const effectiveScale = zoomScale * mobileScale;

  return (
    <div className="min-h-screen bg-[#F0F4F8] text-slate-800 flex flex-col items-center py-6 px-3 sm:px-6 relative selection:bg-[#1B365D]/15 selection:text-[#1B365D]">
      {/* Top Floating Control Bar */}
      <div className="w-full max-w-4xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-sm rounded-2xl px-4 py-3 mb-6 flex flex-wrap items-center justify-between gap-3 sticky top-4 z-50">
        <Link
          href={`/verify/interns/${encodeURIComponent(referenceId)}`}
          className="inline-flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Verification</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 hidden sm:inline">Document:</span>
          <span className="px-2.5 py-1 bg-blue-50 text-[#1B365D] border border-blue-200 text-xs font-mono font-bold rounded-lg flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-[#1B365D]" />
            Letter of Recommendation ({referenceId})
          </span>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setZoomScale(z => Math.max(0.5, z - 0.1))}
            className="p-1.5 hover:bg-white rounded-lg text-slate-600 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono font-bold text-slate-700 px-2">
            {Math.round(zoomScale * 100)}%
          </span>
          <button
            onClick={() => setZoomScale(z => Math.min(1.4, z + 0.1))}
            className="p-1.5 hover:bg-white rounded-lg text-slate-600 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomScale(1)}
            className="px-2 py-1 text-[10px] font-bold text-slate-500 hover:bg-white rounded-lg transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* A4 Centered Viewport Container */}
      <div className="w-full flex justify-center items-start overflow-hidden pb-12">
        <div
          style={{
            width: '880px',
            minWidth: '880px',
            transform: `scale(${effectiveScale})`,
            transformOrigin: 'top center',
            marginBottom: `calc(-1250px * ${1 - effectiveScale})`,
            transition: 'transform 0.15s ease-out, margin-bottom 0.15s ease-out'
          }}
          className="shrink-0"
        >
          <InternshipLORTemplate
            innerRef={lorRef}
            recipientName={lorData.recipientName}
            recipientCollege={lorData.recipientCollege}
            internshipTrack={lorData.internshipTrack}
            referenceId={lorData.referenceId}
            startDate={lorData.startDate}
            endDate={lorData.endDate}
            issueDate={lorData.issueDate}
            projectSummary={lorData.projectSummary}
            performanceParagraph={lorData.performanceParagraph}
            contributionParagraph={lorData.contributionParagraph}
            recommendationStatement={lorData.recommendationStatement}
            ceoName={lorData.ceoName || 'Dr. Mukul Pandey'}
            ceoDesignation={lorData.ceoDesignation || 'CEO & Founder'}
          />
        </div>
      </div>
    </div>
  );
}
