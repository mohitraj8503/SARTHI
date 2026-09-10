'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Save, Eye, Send, History, Share2, Upload,
  Image as ImageIcon, Clock, FileText, Tag, User, Globe,
  Link2, RefreshCw, X, MoreHorizontal, ChevronDown, ChevronUp,
  Maximize2, Minimize2, FileDown, Settings, Sliders, Check
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ToastProvider';
import PublishingReadinessPanel, { ReadinessCheckItem } from '@/components/blogs/PublishingReadinessPanel';
import RevisionHistoryModal from '@/components/blogs/RevisionHistoryModal';
import SocialPreviewModal from '@/components/blogs/SocialPreviewModal';
import { BlogPreviewModal } from '@/components/blogs/BlogPreviewModal';
import BlogLivePreview from '@/components/blogs/BlogLivePreview';
import ImportDocxModal from '@/components/blogs/ImportDocxModal';

const TiptapEditor = dynamic(() => import('@/components/blogs/TiptapEditor'), {
  ssr: false,
  loading: () => <div className="h-[350px] animate-pulse bg-slate-50 rounded-2xl border border-slate-100 w-full" />
});

const CATEGORY_OPTIONS = [
  'Technology', 'AI', 'Programming', 'Education', 'Cybersecurity',
  'Startups', 'Gadgets', 'Science', 'Culture', 'Career', 'Campus', 'Events'
];

interface BlogEditorWorkspaceProps {
  mode: 'admin' | 'student';
  blogId?: string;
}

export default function BlogEditorWorkspace({ mode, blogId: initialBlogId }: BlogEditorWorkspaceProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { addToast } = useToast();
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [blogId, setBlogId] = useState<string | null>(initialBlogId || null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Form State
  const [form, setForm] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    category: 'Technology',
    tags: '',
    thumbnail: '',
    coverAlt: '',
    coverCaption: '',
    coverCredit: '',
    status: 'draft', // 'draft' | 'scheduled' | 'published' | 'archived'
    scheduledAt: '',
    authorId: '',
    // SEO Fields
    seoTitle: '',
    metaDescription: '',
    focusKeyword: '',
    canonicalUrl: '',
    robotsIndex: true,
    robotsFollow: true,
    syncExcerptToMeta: true,
  });

  // UI Modes & Drawers State
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [activeDrawer, setActiveDrawer] = useState<'none' | 'details' | 'seo' | 'readiness'>('none');
  const [showImportDocxModal, setShowImportDocxModal] = useState(false);

  // Modals
  const [showMobileMoreSheet, setShowMobileMoreSheet] = useState(false);
  const [showRevisions, setShowRevisions] = useState(false);
  const [showSocialPreview, setShowSocialPreview] = useState(false);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showCoverDetails, setShowCoverDetails] = useState(false);

  // Load existing blog post if editing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const id = initialBlogId || params.get('id');
      if (id) {
        setBlogId(id);
        setLoading(true);
        const apiEndpoint = mode === 'admin' ? `/api/admin/blogs/${id}` : `/api/blogs/${id}`;
        fetch(apiEndpoint)
          .then(res => res.json())
          .then(data => {
            if (data && !data.error) {
              setForm({
                title: data.title || '',
                slug: data.slug || '',
                content: data.content || '',
                excerpt: data.excerpt || '',
                category: data.category || 'Technology',
                tags: Array.isArray(data.tags) ? data.tags.join(', ') : data.tags || '',
                thumbnail: data.thumbnail || '',
                coverAlt: data.coverAlt || '',
                coverCaption: data.coverCaption || '',
                coverCredit: data.coverCredit || '',
                status: data.status || 'draft',
                scheduledAt: data.scheduledAt ? new Date(data.scheduledAt).toISOString().slice(0, 16) : '',
                authorId: data.authorId || '',
                seoTitle: data.seoTitle || data.metaTitle || '',
                metaDescription: data.metaDescription || '',
                focusKeyword: data.focusKeyword || '',
                canonicalUrl: data.canonicalUrl || '',
                robotsIndex: data.robotsIndex ?? true,
                robotsFollow: data.robotsFollow ?? true,
                syncExcerptToMeta: false,
              });
            }
          })
          .catch(err => console.error('Failed to load blog post:', err))
          .finally(() => setLoading(false));
      }
    }
  }, [initialBlogId, mode]);

  // Auto-generate slug from title
  const handleTitleChange = (val: string) => {
    setForm(prev => {
      const autoSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      return {
        ...prev,
        title: val,
        slug: prev.slug === '' || prev.slug === autoSlug ? autoSlug : prev.slug,
        seoTitle: prev.seoTitle === '' || prev.seoTitle === prev.title ? val : prev.seoTitle,
      };
    });
  };

  // Sync Excerpt to Meta Description
  const handleExcerptChange = (val: string) => {
    setForm(prev => ({
      ...prev,
      excerpt: val,
      metaDescription: prev.syncExcerptToMeta ? val : prev.metaDescription,
    }));
  };

  // Real-time Content Analytics
  const analytics = useMemo(() => {
    const text = form.content.replace(/<[^>]*>/g, ' ').trim();
    const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
    const chars = text.length;
    const readTimeMinutes = Math.max(1, Math.ceil(words / 200));
    const headingsCount = (form.content.match(/<h[1-6]/gi) || []).length;
    const imagesCount = (form.content.match(/<img/gi) || []).length;
    const linksCount = (form.content.match(/<a/gi) || []).length;

    return { words, chars, readTimeMinutes, headingsCount, imagesCount, linksCount };
  }, [form.content]);

  // Readiness Checklist
  const readinessChecks: ReadinessCheckItem[] = useMemo(() => {
    const titleLen = form.title.trim().length;
    const titlePassed = titleLen > 0;
    const titleWarn = titleLen > 0 && (titleLen < 40 || titleLen > 80);

    const excerptLen = form.excerpt.trim().length;
    const excerptPassed = excerptLen > 0;
    const excerptWarn = excerptLen > 160;

    const coverPassed = !!form.thumbnail;
    const coverAltPassed = !!form.coverAlt;
    const bodyPassed = analytics.words >= 50;
    const categoryPassed = !!form.category;
    const slugPassed = !!form.slug && form.slug.length >= 3;
    const metaPassed = !!form.metaDescription && form.metaDescription.length <= 160;

    return [
      {
        id: 'title',
        label: 'Article Title',
        passed: titlePassed,
        warning: titleWarn,
        message: !titlePassed ? 'Title required' : titleWarn ? `${titleLen} chars (Recommended 50–65)` : 'Optimal title length',
      },
      {
        id: 'cover',
        label: 'Cover & Alt Text',
        passed: coverPassed && coverAltPassed,
        warning: coverPassed && !coverAltPassed,
        message: !coverPassed ? 'Cover image missing' : !coverAltPassed ? 'Alt Text missing' : 'Cover image & Alt Text ready',
      },
      {
        id: 'excerpt',
        label: 'Excerpt',
        passed: excerptPassed,
        warning: excerptWarn,
        message: !excerptPassed ? 'Excerpt required' : excerptWarn ? `${excerptLen} chars (Target <= 160)` : 'Excerpt set',
      },
      {
        id: 'body',
        label: 'Content Body',
        passed: bodyPassed,
        warning: analytics.words < 200,
        message: !bodyPassed ? `${analytics.words} words (Min 50)` : `${analytics.words} words written`,
      },
      {
        id: 'category',
        label: 'Category',
        passed: categoryPassed,
        message: categoryPassed ? form.category : 'Select category',
      },
      {
        id: 'slug',
        label: 'URL Slug',
        passed: slugPassed,
        message: slugPassed ? `/blogs/${form.slug}` : 'Valid slug required',
      },
      {
        id: 'meta',
        label: 'SEO Description',
        passed: metaPassed,
        message: metaPassed ? 'Meta description ready' : 'Meta description missing',
      },
    ];
  }, [form, analytics]);

  const passedChecksCount = readinessChecks.filter(c => c.passed).length;

  // Save / Update Handler
  const handleSaveDraft = async (overrideStatus?: string) => {
    if (!form.title.trim()) {
      addToast({ message: 'Title is required before saving draft.', type: 'error' });
      return false;
    }

    setSaving(true);
    try {
      const payload = {
        title: form.title,
        slug: form.slug,
        content: form.content,
        excerpt: form.excerpt,
        category: form.category,
        tags: form.tags,
        thumbnail: form.thumbnail,
        coverAlt: form.coverAlt,
        coverCaption: form.coverCaption,
        coverCredit: form.coverCredit,
        status: overrideStatus || form.status,
        scheduledAt: form.scheduledAt || null,
        seoTitle: form.seoTitle,
        metaDescription: form.metaDescription,
        focusKeyword: form.focusKeyword,
        canonicalUrl: form.canonicalUrl,
        robotsIndex: form.robotsIndex,
        robotsFollow: form.robotsFollow,
      };

      let res;
      const endpoint = mode === 'admin' ? '/api/admin/blogs' : '/api/blogs';
      if (blogId) {
        res = await fetch(`${endpoint}/${blogId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        const createEndpoint = mode === 'admin' ? '/api/admin/blogs/create' : '/api/blogs';
        res = await fetch(createEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (res.ok && (data.blog || data.id || data.success)) {
        const savedId = data.blog?.id || data.id || blogId;
        if (savedId && !blogId) {
          setBlogId(savedId);
          const redirectPath = mode === 'admin' ? `/admin/blogs/new?id=${savedId}` : `/dashboard/blogs/new?id=${savedId}`;
          window.history.replaceState(null, '', redirectPath);
        }
        setLastSaved(new Date());
        addToast({ message: overrideStatus === 'published' ? 'Article published live!' : 'Draft saved.', type: 'success' });
        return true;
      } else {
        throw new Error(data.error || 'Failed to save blog post');
      }
    } catch (err: any) {
      console.error('Save blog error:', err);
      addToast({ message: err?.message || 'Save failed', type: 'error' });
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Persistent Autosave every 30 seconds
  useEffect(() => {
    if (!form.title || saving) return;
    const interval = setInterval(() => {
      handleSaveDraft();
    }, 30000);
    return () => clearInterval(interval);
  }, [form.title, form.content, form.excerpt, saving]);

  // Image Upload Handler
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      addToast({ message: 'Invalid image format. Supported: JPG, PNG, WebP.', type: 'error' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      addToast({ message: 'File too large. Maximum size is 5MB.', type: 'error' });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/upload/blog-media', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setForm(prev => ({ ...prev, thumbnail: data.url }));
      setShowCoverDetails(true);
      addToast({ message: 'Cover image uploaded.', type: 'success' });
    } catch (err) {
      console.error(err);
      addToast({ message: 'Image upload failed.', type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] text-slate-400 text-xs font-medium">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />
          <span>Opening Editor...</span>
        </div>
      </div>
    );
  }

  const backLink = mode === 'admin' ? '/admin/blogs' : '/dashboard/blogs';

  return (
    <div className="min-h-screen pb-32 bg-[#FAFAFA] text-slate-900 font-sans selection:bg-amber-100 relative">
      {/* Top Header Control Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/60 px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={backLink}
            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all text-xs font-medium flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Articles</span>
          </Link>
          <div className="h-4 w-px bg-slate-200 hidden sm:block" />
          <span className="text-xs font-semibold text-slate-800 tracking-tight hidden sm:inline">
            {form.title ? form.title.slice(0, 30) + (form.title.length > 30 ? '...' : '') : 'New Article'}
          </span>
        </div>

        {/* Center: Invisible Subtle Status */}
        <div className="text-[11px] text-slate-400 font-normal">
          {saving ? 'Saving...' : lastSaved ? 'Saved' : 'Drafting'}
        </div>

        {/* Right Desktop Actions */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => setShowImportDocxModal(true)}
            className="px-3 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5"
            title="Import Word Document (.docx)"
          >
            <FileDown className="w-3.5 h-3.5" /> Word
          </button>

          <button
            onClick={() => setIsFocusMode(!isFocusMode)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              isFocusMode ? 'bg-amber-50 text-amber-700 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Toggle Distraction-Free Focus Mode"
          >
            {isFocusMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            {isFocusMode ? 'Exit Focus' : 'Focus'}
          </button>

          <button
            onClick={() => setActiveDrawer(activeDrawer === 'details' ? 'none' : 'details')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
              activeDrawer === 'details' ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" /> Details
          </button>

          <button
            onClick={() => setActiveDrawer(activeDrawer === 'seo' ? 'none' : 'seo')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
              activeDrawer === 'seo' ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Globe className="w-3.5 h-3.5" /> SEO
          </button>

          <button
            onClick={() => setShowRevisions(true)}
            disabled={!blogId}
            className="px-3 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-xs font-medium transition-all disabled:opacity-30"
          >
            Revisions
          </button>

          <button
            onClick={() => handleSaveDraft()}
            disabled={saving}
            className="px-3.5 py-1.5 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold transition-all"
          >
            Save
          </button>

          <button
            onClick={() => {
              if (readinessChecks.every(c => c.passed)) {
                handleSaveDraft('published');
              } else {
                setShowPublishModal(true);
              }
            }}
            className="px-4 py-1.5 bg-[#0F172A] hover:bg-[#F97316] text-white rounded-lg text-xs font-semibold transition-all shadow-sm active:scale-95"
          >
            Publish
          </button>
        </div>

        {/* Mobile Header Right: More Menu Sheet Trigger */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setShowMobileMoreSheet(true)}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className={`max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 grid grid-cols-1 gap-8 items-start transition-all ${
        isFocusMode ? 'lg:grid-cols-1 max-w-[760px]' : 'lg:grid-cols-12'
      }`}>
        {/* Left Writing Canvas */}
        <section className={`space-y-6 w-full ${
          isFocusMode ? 'col-span-1 mx-auto' : 'lg:col-span-6 xl:col-span-7'
        }`}>
          {/* Cover Media Header */}
          <div className="space-y-3">
            <input
              type="file"
              ref={coverInputRef}
              className="hidden"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleCoverUpload}
            />

            {form.thumbnail ? (
              <div className="space-y-2 group">
                <div className="relative aspect-[21/9] w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80">
                  <Image src={form.thumbnail} alt={form.coverAlt || 'Cover'} fill className="object-cover" />
                  <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end p-4 gap-2">
                    <button
                      onClick={() => setShowCoverDetails(!showCoverDetails)}
                      className="px-3 py-1.5 bg-white/90 text-slate-900 rounded-lg text-xs font-medium backdrop-blur-md"
                    >
                      {showCoverDetails ? 'Hide Alt' : 'Alt Text'}
                    </button>
                    <button
                      onClick={() => setForm(prev => ({ ...prev, thumbnail: '' }))}
                      className="px-3 py-1.5 bg-red-500/90 text-white rounded-lg text-xs font-medium backdrop-blur-md"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                {showCoverDetails && (
                  <div className="p-4 bg-white rounded-xl border border-slate-200/60 space-y-3 text-xs">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-500 block mb-1">Alt Text (Accessibility)</label>
                      <input
                        type="text"
                        placeholder="Describe the image..."
                        value={form.coverAlt}
                        onChange={e => setForm(prev => ({ ...prev, coverAlt: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-medium text-slate-800 focus:outline-none focus:border-slate-400"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-500 block mb-1">Caption</label>
                        <input
                          type="text"
                          placeholder="Image caption..."
                          value={form.coverCaption}
                          onChange={e => setForm(prev => ({ ...prev, coverCaption: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-medium text-slate-800 focus:outline-none focus:border-slate-400"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-500 block mb-1">Credit / Source</label>
                        <input
                          type="text"
                          placeholder="Source attribution..."
                          value={form.coverCredit}
                          onChange={e => setForm(prev => ({ ...prev, coverCredit: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-medium text-slate-800 focus:outline-none focus:border-slate-400"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => coverInputRef.current?.click()}
                className="text-xs font-medium text-slate-400 hover:text-slate-700 transition-colors flex items-center gap-1.5 py-1"
              >
                <ImageIcon className="w-3.5 h-3.5" /> + Add Cover Image
              </button>
            )}
          </div>

          {/* Title Input */}
          <div className="space-y-1">
            <textarea
              rows={1}
              placeholder="Article Title"
              value={form.title}
              onChange={e => {
                handleTitleChange(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              className="w-full text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 placeholder:text-slate-300 bg-transparent border-none focus:outline-none resize-none leading-tight py-1"
            />
          </div>

          {/* Excerpt Input */}
          <div className="space-y-1">
            <textarea
              rows={2}
              placeholder="Write a brief excerpt or summary..."
              value={form.excerpt}
              onChange={e => handleExcerptChange(e.target.value)}
              className="w-full text-base text-slate-600 placeholder:text-slate-300 bg-transparent border-none focus:outline-none resize-none leading-relaxed italic font-normal py-1"
            />
          </div>

          <div className="h-px bg-slate-200/60 my-4" />

          {/* Body Rich Text Editor */}
          <div className="min-h-[400px]">
            <TiptapEditor
              content={form.content}
              onChange={val => setForm(prev => ({ ...prev, content: val }))}
              theme="light"
            />
          </div>

          {/* Subtle Article Metrics Footer */}
          <div className="pt-6 border-t border-slate-200/60 text-[12px] text-slate-400 font-normal flex items-center gap-4">
            <span>{analytics.words} words</span>
            <span>·</span>
            <span>{analytics.readTimeMinutes} min read</span>
            <span>·</span>
            <span>{analytics.headingsCount} headings</span>
          </div>
        </section>

        {/* Right Section Desktop: Persistent Live Article Preview (Hidden in Focus Mode) */}
        {!isFocusMode && (
          <section className="hidden lg:block lg:col-span-6 xl:col-span-5 h-full">
            <BlogLivePreview
              title={form.title}
              excerpt={form.excerpt}
              content={form.content}
              category={form.category}
              thumbnail={form.thumbnail}
              coverAlt={form.coverAlt}
              coverCaption={form.coverCaption}
              coverCredit={form.coverCredit}
              authorName={user?.name || 'Dr. Mukul Pandey'}
              authorAvatar={user?.image || user?.avatar_url || '/sarthi-logo.png'}
              slug={form.slug}
              readTimeMinutes={analytics.readTimeMinutes}
            />
          </section>
        )}
      </main>

      {/* Slide-out Drawer: Article Details */}
      {activeDrawer === 'details' && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white border-l border-slate-200 shadow-2xl p-6 space-y-6 overflow-y-auto animate-in slide-in-from-right font-sans">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Article Details</h3>
            <button onClick={() => setActiveDrawer('none')} className="p-1 text-slate-400 hover:text-slate-800">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-500 block">Status</label>
              <select
                value={form.status}
                onChange={e => setForm(prev => ({ ...prev, status: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none"
              >
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {form.status === 'scheduled' && (
              <div className="space-y-1">
                <label className="font-semibold text-slate-500 block">Publish Date</label>
                <input
                  type="datetime-local"
                  value={form.scheduledAt}
                  onChange={e => setForm(prev => ({ ...prev, scheduledAt: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-medium text-slate-800"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="font-semibold text-slate-500 block">Category</label>
              <select
                value={form.category}
                onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none"
              >
                {CATEGORY_OPTIONS.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-500 block">Tags</label>
              <input
                type="text"
                placeholder="AI, Tech, Education"
                value={form.tags}
                onChange={e => setForm(prev => ({ ...prev, tags: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Slide-out Drawer: SEO Settings */}
      {activeDrawer === 'seo' && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white border-l border-slate-200 shadow-2xl p-6 space-y-6 overflow-y-auto animate-in slide-in-from-right font-sans">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">SEO & Search Metadata</h3>
            <button onClick={() => setActiveDrawer('none')} className="p-1 text-slate-400 hover:text-slate-800">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-500 block">Permalink Slug</label>
              <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                <span className="text-[11px] text-slate-400 select-none">/blogs/</span>
                <input
                  type="text"
                  placeholder="custom-slug"
                  value={form.slug}
                  onChange={e => setForm(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full bg-transparent font-mono text-xs font-semibold text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-500 block">SEO Title</label>
              <input
                type="text"
                placeholder="Defaults to Title"
                value={form.seoTitle}
                onChange={e => setForm(prev => ({ ...prev, seoTitle: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-500 block">Meta Description</label>
              <textarea
                rows={3}
                placeholder="Defaults to Excerpt"
                value={form.metaDescription}
                onChange={e => setForm(prev => ({ ...prev, metaDescription: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-medium text-slate-800 focus:outline-none text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-500 block">Focus Target Keyword</label>
              <input
                type="text"
                placeholder="e.g. Krishna Janmashtami 2026"
                value={form.focusKeyword}
                onChange={e => setForm(prev => ({ ...prev, focusKeyword: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white/90 backdrop-blur-lg border-t border-slate-200/80 px-4 py-3 md:hidden flex items-center justify-between gap-3 pb-[calc(12px+env(safe-area-inset-bottom))]">
        <button
          onClick={() => setShowFullPreview(true)}
          className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-all"
        >
          Preview
        </button>

        <button
          onClick={() => handleSaveDraft()}
          disabled={saving}
          className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-all"
        >
          Save
        </button>

        <button
          onClick={() => {
            if (readinessChecks.every(c => c.passed)) {
              handleSaveDraft('published');
            } else {
              setShowPublishModal(true);
            }
          }}
          className="flex-1 py-2.5 bg-[#0F172A] text-white rounded-xl text-xs font-semibold transition-all"
        >
          Publish
        </button>
      </div>

      {/* Mobile Apple Bottom Sheet for Settings (`⋯` Menu) */}
      {showMobileMoreSheet && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-end justify-center md:hidden animate-fade-in">
          <div className="bg-white rounded-t-3xl border-t border-slate-200 w-full max-h-[85vh] overflow-y-auto p-6 space-y-6 font-sans">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Article Settings</h3>
              <button onClick={() => setShowMobileMoreSheet(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <button
                onClick={() => {
                  setShowMobileMoreSheet(false);
                  setShowImportDocxModal(true);
                }}
                className="w-full text-left py-3 px-4 bg-slate-50 rounded-xl font-medium text-slate-800 flex items-center justify-between"
              >
                <span>Import Word (.docx)</span>
                <FileDown className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => {
                  setShowMobileMoreSheet(false);
                  setShowRevisions(true);
                }}
                className="w-full text-left py-3 px-4 bg-slate-50 rounded-xl font-medium text-slate-800 flex items-center justify-between"
              >
                <span>Revision History</span>
                <History className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => {
                  setShowMobileMoreSheet(false);
                  setShowSocialPreview(true);
                }}
                className="w-full text-left py-3 px-4 bg-slate-50 rounded-xl font-medium text-slate-800 flex items-center justify-between"
              >
                <span>Social & SERP Preview</span>
                <Share2 className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <button
              onClick={() => setShowMobileMoreSheet(false)}
              className="w-full py-3 bg-[#0F172A] text-white rounded-xl text-xs font-semibold"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Word (.docx) Import Modal */}
      <ImportDocxModal
        isOpen={showImportDocxModal}
        onClose={() => setShowImportDocxModal(false)}
        onApplyImport={data => {
          setForm(prev => ({
            ...prev,
            title: data.title || prev.title,
            excerpt: data.excerpt || prev.excerpt,
            content: data.content,
            thumbnail: data.thumbnail || prev.thumbnail,
          }));
          addToast({ message: 'Word document structure imported successfully.', type: 'success' });
        }}
      />

      {/* Revision History Modal */}
      <RevisionHistoryModal
        isOpen={showRevisions}
        onClose={() => setShowRevisions(false)}
        blogId={blogId || ''}
        onRestore={rev => {
          setForm(prev => ({
            ...prev,
            title: rev.title,
            content: rev.content,
            excerpt: rev.excerpt || prev.excerpt,
          }));
          addToast({ message: 'Revision restored.', type: 'success' });
        }}
      />

      {/* Social & Search Card Preview Modal */}
      <SocialPreviewModal
        isOpen={showSocialPreview}
        onClose={() => setShowSocialPreview(false)}
        title={form.title}
        excerpt={form.excerpt}
        slug={form.slug}
        coverImage={form.thumbnail}
        category={form.category}
      />

      {/* Full Article Page Rendering Preview Modal */}
      <BlogPreviewModal
        isOpen={showFullPreview}
        onClose={() => setShowFullPreview(false)}
        title={form.title || 'Untitled Article'}
        content={form.content}
        metadata={{
          category: form.category,
          thumbnail: form.thumbnail,
          excerpt: form.excerpt,
          slug: form.slug,
          readTime: analytics.readTimeMinutes
        }}
      />

      {/* Publish Confirmation Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 font-sans animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-sm p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Ready to Publish</h3>
              <button onClick={() => setShowPublishModal(false)} className="p-1 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {passedChecksCount} of {readinessChecks.length} quality checks passed. Would you like to publish this article live now?
            </p>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setShowPublishModal(false)}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  setShowPublishModal(false);
                  handleSaveDraft('published');
                }}
                className="flex-1 py-2.5 bg-[#0F172A] hover:bg-[#F97316] text-white rounded-xl text-xs font-semibold"
              >
                Publish Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
