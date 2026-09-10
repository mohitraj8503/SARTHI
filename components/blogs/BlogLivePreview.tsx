'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { Monitor, Smartphone, ExternalLink } from 'lucide-react';
import DOMPurify from 'isomorphic-dompurify';

interface BlogLivePreviewProps {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  thumbnail?: string;
  coverAlt?: string;
  coverCaption?: string;
  coverCredit?: string;
  authorName?: string;
  authorAvatar?: string;
  slug?: string;
  status?: string;
  scheduledAt?: string;
  publishedAt?: string;
  readTimeMinutes?: number;
}

export default function BlogLivePreview({
  title,
  excerpt,
  content,
  category,
  thumbnail,
  coverAlt,
  coverCaption,
  coverCredit,
  authorName = 'Dr. Mukul Pandey',
  authorAvatar = '/sarthi-logo.png',
  slug = 'article-preview',
  status = 'draft',
  scheduledAt,
  publishedAt,
  readTimeMinutes = 5,
}: BlogLivePreviewProps) {
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop');

  const displayTitle = title.trim() || 'Krishna Janmashtami 2026: What Lord Krishna’s Teachings Mean in the Age of AI';
  const displayExcerpt = excerpt.trim() || 'Discover how the timeless teachings of Lord Krishna offer ethical clarity, focus, and leadership principles for modern engineering and AI students.';
  const displayCategory = category || 'Technology';
  const displayAuthor = authorName || 'Dr. Mukul Pandey';
  const displayAvatar = authorAvatar || '/sarthi-logo.png';

  const previewUrl = `/blogs/${slug || 'preview'}`;

  // Clean body content HTML: strip any leading image matching thumbnail so cover image NEVER renders twice
  const sanitizedBodyHtml = useMemo(() => {
    if (!content) {
      return '<p class="text-slate-400 italic">Start writing article content on the left...</p>';
    }

    let cleanHtml = content;

    // If thumbnail is provided, remove duplicate leading image block matching thumbnail from body
    if (thumbnail && cleanHtml.includes('src=')) {
      try {
        if (thumbnail.startsWith('data:')) {
          const base64Head = thumbnail.slice(0, 50);
          if (cleanHtml.includes(base64Head)) {
            cleanHtml = cleanHtml
              .replace(/<p[^>]*>\s*<img[^>]+src=["']data:image[^"']+["'][^>]*>\s*<\/p>/i, '')
              .replace(/<img[^>]+src=["']data:image[^"']+["'][^>]*>/i, '');
          }
        } else {
          const firstImgMatch = cleanHtml.match(/<img[^>]+src=["']([^"']+)["']/i);
          if (firstImgMatch && (firstImgMatch[1] === thumbnail || thumbnail.includes(firstImgMatch[1]))) {
            cleanHtml = cleanHtml
              .replace(/<p[^>]*>\s*<img[^>]+>\s*<\/p>/i, '')
              .replace(/<img[^>]+>/i, '');
          }
        }
      } catch (err) {
        console.error('Safe image deduplication error:', err);
      }
    }

    return DOMPurify.sanitize(cleanHtml);
  }, [content, thumbnail]);

  // Format Status Subtitle (Draft Preview vs Scheduled vs Published)
  const dateSubtitle = useMemo(() => {
    if (status === 'published' && publishedAt) {
      return `Published ${new Date(publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    if (status === 'scheduled' && scheduledAt) {
      return `Scheduled for ${new Date(scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    return 'Draft Preview';
  }, [status, publishedAt, scheduledAt]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col h-full max-h-[85vh] sticky top-20 font-sans">
      {/* Header Bar: Device Switcher & External Link */}
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200/70 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Live Preview</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-200/60 p-1 rounded-lg">
          <button
            onClick={() => setDeviceMode('desktop')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1.5 transition-all ${
              deviceMode === 'desktop' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" /> Desktop
          </button>
          <button
            onClick={() => setDeviceMode('mobile')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1.5 transition-all ${
              deviceMode === 'mobile' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" /> Mobile
          </button>
        </div>

        <button
          onClick={() => window.open(previewUrl, '_blank')}
          className="p-1.5 text-slate-400 hover:text-slate-800 transition-colors"
          title="Open in new tab"
        >
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>

      {/* Frame Container */}
      <div className="flex-1 overflow-y-auto bg-slate-100/50 p-4 sm:p-6 flex justify-center">
        <div className={`bg-white shadow-sm border border-slate-200/60 transition-all duration-300 ${
          deviceMode === 'mobile'
            ? 'w-[375px] rounded-3xl p-6 my-2 min-h-[600px] border-slate-300 shadow-md'
            : 'w-full max-w-2xl rounded-2xl p-6 sm:p-8'
        }`}>
          {/* Category Pill */}
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-[10px] font-bold uppercase tracking-wider border border-amber-200/60">
              {displayCategory}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">{readTimeMinutes} min read</span>
          </div>

          {/* Article Title */}
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight tracking-tight mb-3">
            {displayTitle}
          </h1>

          {/* Excerpt Summary */}
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-4 pb-4 border-b border-slate-100 font-normal">
            {displayExcerpt}
          </p>

          {/* Author Byline */}
          <div className="flex items-center gap-3 mb-6">
            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-slate-200 shrink-0">
              <Image src={displayAvatar} alt={displayAuthor} fill className="object-cover" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">{displayAuthor}</span>
              <span className="text-[10px] text-slate-400 font-medium block">
                {dateSubtitle}
              </span>
            </div>
          </div>

          {/* HERO COVER MEDIA (Renders EXACTLY ONCE as header banner) */}
          {thumbnail && (
            <div className="mb-6 space-y-1.5">
              <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                <Image src={thumbnail} alt={coverAlt || displayTitle} fill className="object-cover" />
              </div>
              {(coverCaption || coverCredit) && (
                <div className="text-[10px] text-slate-400 text-center font-medium italic">
                  {coverCaption} {coverCredit && <span>(Credit: {coverCredit})</span>}
                </div>
              )}
            </div>
          )}

          {/* Article Body Content HTML (Cover Image is stripped so it never duplicates) */}
          <div
            className="prose prose-slate max-w-none text-xs sm:text-sm leading-relaxed space-y-4"
            dangerouslySetInnerHTML={{ __html: sanitizedBodyHtml }}
          />
        </div>
      </div>
    </div>
  );
}
