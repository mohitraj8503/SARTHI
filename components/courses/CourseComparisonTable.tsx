'use client';

import React, { useState } from 'react';
import { Check, X, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ComparisonRow {
  feature: string;
  techTomorrow: {
    value: string;
    type: 'positive' | 'negative' | 'neutral';
  };
  generic: {
    value: string;
    type: 'positive' | 'negative' | 'neutral';
  };
  traditional: {
    value: string;
    type: 'positive' | 'negative' | 'neutral';
  };
}

const comparisonData: ComparisonRow[] = [
  {
    feature: 'Price',
    techTomorrow: { value: '₹1,000 / Month', type: 'positive' },
    generic: { value: '₹8,000–15,000', type: 'negative' },
    traditional: { value: '₹20,000+', type: 'negative' }
  },
  {
    feature: 'Live Doubt Solving',
    techTomorrow: { value: 'Yes', type: 'positive' },
    generic: { value: 'No', type: 'negative' },
    traditional: { value: 'Yes (limited hours)', type: 'neutral' }
  },
  {
    feature: 'Hands-on Filing Practice (real GST/IT portal simulation)',
    techTomorrow: { value: 'Yes', type: 'positive' },
    generic: { value: 'Rare', type: 'negative' },
    traditional: { value: 'Sometimes', type: 'neutral' }
  },
  {
    feature: 'Updated for Latest Tax Rules',
    techTomorrow: { value: 'Always updated', type: 'positive' },
    generic: { value: 'Often outdated', type: 'neutral' },
    traditional: { value: 'Depends', type: 'neutral' }
  },
  {
    feature: 'Certificate of Completion',
    techTomorrow: { value: 'Yes', type: 'positive' },
    generic: { value: 'Yes', type: 'positive' },
    traditional: { value: 'Yes', type: 'positive' }
  },
  {
    feature: 'Lifetime Access',
    techTomorrow: { value: 'Yes', type: 'positive' },
    generic: { value: 'Usually time-limited', type: 'negative' },
    traditional: { value: 'No', type: 'negative' }
  },
  {
    feature: 'Mobile + TV Access',
    techTomorrow: { value: 'Yes', type: 'positive' },
    generic: { value: 'Varies', type: 'neutral' },
    traditional: { value: 'No', type: 'negative' }
  },
  {
    feature: 'Internship/Job Assistance',
    techTomorrow: { value: 'Yes', type: 'positive' },
    generic: { value: 'No', type: 'negative' },
    traditional: { value: 'Rare', type: 'negative' }
  },
  {
    feature: 'Self-Paced + Flexible',
    techTomorrow: { value: 'Yes', type: 'positive' },
    generic: { value: 'Yes', type: 'positive' },
    traditional: { value: 'No', type: 'negative' }
  }
];

export default function CourseComparisonTable() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeMobileCard, setActiveMobileCard] = useState<'techTomorrow' | 'generic' | 'traditional' | null>('techTomorrow');

  const visibleRows = isExpanded ? comparisonData : comparisonData.slice(0, 4);

  const renderIcon = (type: 'positive' | 'negative' | 'neutral', text: string) => {
    // If it's a currency/price value, don't show prefix icons unless they are boolean-like values
    if (text.includes('₹')) return null;

    switch (type) {
      case 'positive':
        return (
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-50 text-[#1A3C2E] mr-2 shrink-0">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </span>
        );
      case 'negative':
        return (
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-50 text-red-600 mr-2 shrink-0">
            <X className="w-3.5 h-3.5 stroke-[3]" />
          </span>
        );
      case 'neutral':
      default:
        return (
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-50 text-amber-600 mr-2 shrink-0">
            <AlertCircle className="w-3.5 h-3.5 stroke-[3]" />
          </span>
        );
    }
  };

  return (
    <section className="pt-[60px] border-t border-[#F0EDE6] mt-12 w-full text-left font-plus-jakarta">
      <h2 className="text-[24px] font-semibold text-[#1C1C1A] mb-2 font-plus-jakarta">
        Why SARTHI?
      </h2>
      <p className="text-[15px] text-[#6B6860] font-normal mb-8">
        See how we compare to generic online courses and traditional coaching institutes.
      </p>

      {/* DESKTOP TABLE VIEW */}
      <div className="hidden sm:block overflow-hidden rounded-[20px] border border-[#E0DDD6] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-[#F0EDE6] bg-[#FBFBFA]">
              <th className="p-5 text-[14px] font-semibold text-[#6B6860] w-1/4">Features</th>
              <th className="p-5 text-[14px] font-bold text-[#1A3C2E] w-1/4 bg-[#f0f9f0]/40 relative border-x border-[#E2F0E2]">
                <div className="flex items-center gap-2">
                  <span>SARTHI</span>
                  <span className="inline-block bg-[#1A3C2E] text-white text-[10px] px-2 py-0.5 rounded-[4px] font-semibold tracking-wide uppercase">
                    Recommended
                  </span>
                </div>
              </th>
              <th className="p-5 text-[14px] font-semibold text-[#6B6860] w-1/4">Generic Online Course</th>
              <th className="p-5 text-[14px] font-semibold text-[#6B6860] w-1/4">Traditional Coaching</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0EDE6]">
            {comparisonData.map((row, idx) => (
              <tr key={idx} className="hover:bg-[#FBFBFA]/50 transition-colors">
                <td className="p-5 text-[14px] font-semibold text-[#1C1C1A] leading-normal">
                  {row.feature}
                </td>
                <td className="p-5 text-[14px] font-bold text-[#1A3C2E] bg-[#f0f9f0]/30 border-x border-[#E2F0E2] shadow-[inset_1px_0_0_rgba(0,0,0,0.01)]">
                  <div className="flex items-center">
                    {renderIcon(row.techTomorrow.type, row.techTomorrow.value)}
                    <span>{row.techTomorrow.value}</span>
                  </div>
                </td>
                <td className="p-5 text-[14px] font-medium text-[#6B6860]">
                  <div className="flex items-center">
                    {renderIcon(row.generic.type, row.generic.value)}
                    <span>{row.generic.value}</span>
                  </div>
                </td>
                <td className="p-5 text-[14px] font-medium text-[#6B6860]">
                  <div className="flex items-center">
                    {renderIcon(row.traditional.type, row.traditional.value)}
                    <span>{row.traditional.value}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MOBILE CARD VIEW */}
      <div className="block sm:hidden space-y-4">
        {/* Competitor Selector Tabs */}
        <div className="flex gap-2 p-1 bg-gray-100/80 rounded-xl border border-gray-200/50">
          {(['techTomorrow', 'generic', 'traditional'] as const).map((tab) => {
            const isTT = tab === 'techTomorrow';
            const label = isTT ? 'SARTHI' : tab === 'generic' ? 'Generic Course' : 'Coaching';
            const isActive = activeMobileCard === tab;

            return (
              <button
                key={tab}
                onClick={() => setActiveMobileCard(tab)}
                className={cn(
                  "flex-1 text-center py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 outline-none",
                  isActive
                    ? isTT
                      ? "bg-[#1A3C2E] text-white shadow-sm"
                      : "bg-white text-gray-900 border border-gray-200 shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
                )}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Competitor Details Card */}
        <div
          className={cn(
            "rounded-2xl border p-5 bg-white shadow-sm transition-all duration-300",
            activeMobileCard === 'techTomorrow' 
              ? "border-[#E2F0E2] bg-[#f0f9f0]/10 shadow-[0_10px_30px_rgba(26,60,46,0.04)]" 
              : "border-gray-200"
          )}
        >
          {activeMobileCard === 'techTomorrow' && (
            <div className="flex items-center justify-between mb-4 border-b border-[#E2F0E2] pb-3">
              <span className="text-sm font-bold text-[#1A3C2E]">SARTHI Advantage</span>
              <span className="bg-[#1A3C2E] text-white text-[9px] px-2 py-0.5 rounded-[4px] font-black uppercase tracking-wider">
                Recommended
              </span>
            </div>
          )}

          <div className="space-y-4">
            {visibleRows.map((row, idx) => {
              const details = 
                activeMobileCard === 'techTomorrow' 
                  ? row.techTomorrow 
                  : activeMobileCard === 'generic' 
                  ? row.generic 
                  : row.traditional;

              return (
                <div key={idx} className="flex flex-col gap-1 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                  <span className="text-[12px] font-medium text-gray-400 uppercase tracking-wider">
                    {row.feature}
                  </span>
                  <div className="flex items-center text-[14px] font-semibold text-gray-800 mt-1">
                    {renderIcon(details.type, details.value)}
                    <span className={cn(activeMobileCard === 'techTomorrow' && "text-[#1A3C2E] font-bold")}>
                      {details.value}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Toggle Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-center gap-1 mt-6 text-[#1A3C2E] hover:text-[#153025] hover:underline text-xs font-bold transition-all"
          >
            <span>{isExpanded ? 'Show less comparison' : 'Show full comparison'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </section>
  );
}
