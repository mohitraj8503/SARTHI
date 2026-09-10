'use client';

import React, { useState } from 'react';
import { X, Search, Share2, Globe, MessageSquare } from 'lucide-react';
import Image from 'next/image';

interface SocialPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  excerpt: string;
  slug: string;
  coverImage?: string;
  category?: string;
}

export default function SocialPreviewModal({
  isOpen,
  onClose,
  title,
  excerpt,
  slug,
  coverImage,
  category = 'Tech',
}: SocialPreviewModalProps) {
  const [activeTab, setActiveTab] = useState<'google' | 'facebook' | 'x' | 'whatsapp'>('google');

  if (!isOpen) return null;

  const displayTitle = title || 'Krishna Janmashtami 2026: What Lord Krishna’s Teachings Mean in the Age of AI';
  const displayExcerpt = excerpt || 'Discover how the timeless teachings of Lord Krishna offer ethical clarity, focus, and leadership principles for modern engineering and AI students.';
  const displaySlug = slug || 'krishna-janmashtami-2026-teachings-ai';
  const displayImage = coverImage || '/sarthi-logo.png';
  const baseUrl = 'https://sarthi-woad.vercel.app';
  const fullUrl = `${baseUrl}/blogs/${displaySlug}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 font-nunito animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">Social & Search Preview</h2>
              <p className="text-xs font-medium text-slate-400">See how your article will look on Google, OpenGraph, X, & WhatsApp</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Platform Tabs */}
        <div className="flex p-2 bg-slate-100/60 border-b border-slate-200/50 overflow-x-auto no-scrollbar gap-2">
          {[
            { id: 'google', label: 'Google SERP', icon: Search },
            { id: 'facebook', label: 'Facebook / OpenGraph', icon: Globe },
            { id: 'x', label: 'X (Twitter) Card', icon: Share2 },
            { id: 'whatsapp', label: 'WhatsApp Card', icon: MessageSquare },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 min-w-[120px] py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Preview Container */}
        <div className="p-8 bg-slate-50/40 flex items-center justify-center min-h-[300px]">
          {activeTab === 'google' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm w-full max-w-xl space-y-1.5 font-sans">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span className="w-5 h-5 bg-[#0F172A] text-white rounded-full flex items-center justify-center font-black text-[9px]">TT</span>
                <div className="flex flex-col">
                  <span className="font-medium text-slate-800">SARTHI</span>
                  <span className="text-[11px] text-slate-400 truncate">{fullUrl}</span>
                </div>
              </div>
              <h3 className="text-xl text-[#1a0dab] font-normal hover:underline cursor-pointer leading-snug line-clamp-2 mt-1">
                {displayTitle} | SARTHI
              </h3>
              <p className="text-sm text-[#4d5156] line-clamp-2 leading-normal">
                {displayExcerpt}
              </p>
            </div>
          )}

          {activeTab === 'facebook' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-md w-full max-w-md overflow-hidden font-sans">
              <div className="relative aspect-[16/9] bg-slate-100 w-full overflow-hidden">
                {coverImage ? (
                  <Image src={coverImage} alt={displayTitle} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs uppercase font-bold">Cover Preview</div>
                )}
              </div>
              <div className="p-4 bg-[#F2F4F7] border-t border-slate-200/80 space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">SARTHI.IN</span>
                <h4 className="text-sm font-bold text-slate-900 line-clamp-2 leading-tight">{displayTitle}</h4>
                <p className="text-xs text-slate-500 line-clamp-2">{displayExcerpt}</p>
              </div>
            </div>
          )}

          {activeTab === 'x' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-md w-full max-w-md overflow-hidden font-sans">
              <div className="relative aspect-[1.91/1] bg-slate-100 w-full overflow-hidden">
                {coverImage ? (
                  <Image src={coverImage} alt={displayTitle} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs uppercase font-bold">X Card Preview</div>
                )}
              </div>
              <div className="p-3.5 space-y-0.5 border-t border-slate-100">
                <span className="text-[11px] text-slate-400">sarthi-woad.vercel.app</span>
                <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{displayTitle}</h4>
                <p className="text-xs text-slate-500 line-clamp-2">{displayExcerpt}</p>
              </div>
            </div>
          )}

          {activeTab === 'whatsapp' && (
            <div className="bg-[#E5DDD5] p-6 rounded-2xl border border-slate-300 shadow-inner w-full max-w-md font-sans">
              <div className="bg-white rounded-xl p-2.5 shadow-sm border border-slate-200 space-y-2 max-w-[85%] ml-auto">
                <div className="bg-slate-100 rounded-lg overflow-hidden border border-slate-200/60">
                  <div className="relative aspect-[16/9] w-full bg-slate-200">
                    {coverImage && <Image src={coverImage} alt={displayTitle} fill className="object-cover" />}
                  </div>
                  <div className="p-2 space-y-0.5">
                    <h5 className="text-xs font-bold text-slate-900 line-clamp-2 leading-tight">{displayTitle}</h5>
                    <p className="text-[10px] text-slate-500 line-clamp-2">{displayExcerpt}</p>
                    <span className="text-[9px] text-slate-400 block pt-1 uppercase">sarthi-woad.vercel.app</span>
                  </div>
                </div>
                <div className="text-xs text-blue-600 underline break-all font-mono text-[11px]">
                  {fullUrl}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
