'use client';

import React, { useRef, useEffect } from 'react';
import Image from 'next/image';

interface BlogHeroSectionProps {
  coverUrl: string | null;
  title: string;
  summary: string;
  authorName: string;
  authorAvatar: string;
  tags: string[];
  isEditing?: boolean;
  onTitleChange?: (val: string) => void;
  onSummaryChange?: (val: string) => void;
  lightMode?: boolean;
}

export default function BlogHeroSection({
  coverUrl,
  title,
  summary,
  authorName,
  authorAvatar,
  tags,
  isEditing = false,
  onTitleChange,
  onSummaryChange,
  lightMode = false,
}: BlogHeroSectionProps) {
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const summaryRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height to fit content
  useEffect(() => {
    if (isEditing && titleRef.current) {
      titleRef.current.style.height = 'auto';
      titleRef.current.style.height = `${titleRef.current.scrollHeight}px`;
    }
  }, [title, isEditing]);

  useEffect(() => {
    if (isEditing && summaryRef.current) {
      summaryRef.current.style.height = 'auto';
      summaryRef.current.style.height = `${summaryRef.current.scrollHeight}px`;
    }
  }, [summary, isEditing]);

  return (
    <div className="w-full space-y-10 md:space-y-16 py-10 md:py-16">
      {/* 1. Header Area: Centered Title, Excerpt, and Author */}
      <header className="max-w-4xl mx-auto text-center space-y-4 md:space-y-8 px-4 flex flex-col items-center">
        {/* Category/Tags */}
        <div className="flex items-center justify-center gap-3">
          <span className={lightMode 
            ? "px-4 py-1 bg-[#174F3A]/5 !text-[#174F3A] rounded-full text-[11px] font-bold uppercase tracking-wider border border-[#174F3A]/10" 
            : "px-4 py-1 bg-emerald-500/10 !text-emerald-400 rounded-full text-[11px] font-bold uppercase tracking-wider border border-emerald-500/20"}
          >
            {tags && tags.length > 0 ? tags[0] : 'Tech News'}
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-sm font-medium text-slate-400">
            5 min read
          </span>
        </div>

        {/* Title */}
        {isEditing ? (
          <textarea
            ref={titleRef}
            value={title}
            onChange={(e) => onTitleChange?.(e.target.value)}
            placeholder="YOUR TITLE HERE"
            rows={1}
            className={`w-full text-center bg-transparent border-none outline-none focus:ring-2 focus:ring-emerald-500/50 rounded p-1 transition-all text-5xl md:text-7xl lg:text-8xl font-outfit font-black italic uppercase leading-[0.95] tracking-tighter resize-none ${lightMode ? '!text-slate-900' : '!text-white'}`}
          />
        ) : (
          <h1 className={`text-5xl md:text-7xl lg:text-8xl font-outfit font-black italic uppercase leading-[0.95] tracking-tighter resize-none ${lightMode ? '!text-slate-900' : '!text-white'}`}>
            {title || 'YOUR TITLE HERE'}
          </h1>
        )}

        {/* Summary */}
        {isEditing ? (
          <textarea
            ref={summaryRef}
            value={summary}
            onChange={(e) => onSummaryChange?.(e.target.value)}
            placeholder="Write a compelling summary to hook your readers..."
            rows={1}
            className={`w-full text-center bg-transparent border-none outline-none focus:ring-1 focus:ring-white/20 rounded p-1 text-base md:text-xl font-medium leading-relaxed max-w-2xl mx-auto resize-none ${lightMode ? '!text-slate-600' : '!text-slate-400'}`}
          />
        ) : (
          <p className={`text-base md:text-xl font-medium leading-relaxed max-w-2xl mx-auto ${lightMode ? '!text-slate-600' : '!text-slate-400'}`}>
            {summary || 'Write a compelling summary to hook your readers...'}
          </p>
        )}

        {/* Author Byline */}
        <div className="flex items-center justify-center gap-4 pt-2 md:pt-4">
          <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white/10 shadow-md">
            {authorAvatar ? (
              <Image src={authorAvatar} alt={authorName} fill className="object-cover" />
            ) : (
              <div className="w-full h-full bg-white/10 flex items-center justify-center text-white/40 font-bold">
                U
              </div>
            )}
          </div>
          <div className="text-left">
            <p className={`text-sm font-bold ${lightMode ? '!text-slate-900' : '!text-white'}`}>{authorName || 'Anonymous'}</p>
            <p className="text-xs text-slate-400 font-medium">Recently Published</p>
          </div>
        </div>
      </header>

      {/* 2. Cover Image Area (Aspect Ratio 21:9 with Rounded Corners) */}
      <div className="relative aspect-[16/10] md:aspect-[21/9] w-full rounded-2xl md:rounded-[4rem] overflow-hidden shadow-2xl bg-slate-900 border border-white/5">
        {coverUrl && coverUrl.trim() !== '' ? (
          <Image
            src={coverUrl}
            alt={title || "Blog cover"}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1B4332]/20 to-[#0B1E15]/20 flex flex-col items-center justify-center p-12 text-center relative overflow-hidden">
            <div className="absolute w-[600px] h-[600px] rounded-full bg-white/5 -top-40 -left-40 pointer-events-none" />
            <span className="text-sm font-black uppercase tracking-[0.3em] text-emerald-400/40 relative z-10 mb-3">No Cover Image</span>
          </div>
        )}
      </div>
    </div>
  );
}
