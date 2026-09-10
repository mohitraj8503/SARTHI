'use client';

import React, { useState, useEffect } from 'react';
import { X, Search, Link as LinkIcon, ExternalLink, Loader2 } from 'lucide-react';

interface ArticleResult {
  id: string;
  title: string;
  slug: string;
  url: string;
  category?: string;
}

interface InternalLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUrl: (url: string, title: string) => void;
}

export default function InternalLinkModal({
  isOpen,
  onClose,
  onSelectUrl,
}: InternalLinkModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ArticleResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [customUrl, setCustomUrl] = useState('');

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(() => {
      setLoading(true);
      fetch(`/api/blogs/internal-search?q=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data.results)) {
            setResults(data.results);
          }
        })
        .catch(err => console.error('Internal link search error:', err))
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 font-nunito animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <LinkIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">Insert Internal or External Link</h2>
              <p className="text-[11px] font-medium text-slate-400">Search SARTHI articles or enter custom URL</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 rounded-xl">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Custom URL Input */}
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">Custom URL / External Link</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="https://..."
                value={customUrl}
                onChange={e => setCustomUrl(e.target.value)}
                className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={() => {
                  if (customUrl) {
                    onSelectUrl(customUrl, customUrl);
                    onClose();
                  }
                }}
                disabled={!customUrl}
                className="px-4 py-2.5 bg-[#0F172A] hover:bg-amber-500 text-white rounded-xl text-xs font-black uppercase tracking-wider disabled:opacity-40"
              >
                Apply
              </button>
            </div>
          </div>

          <div className="h-px bg-slate-100" />

          {/* Internal Article Search */}
          <div className="space-y-3">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">Search SARTHI Articles</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-300 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Type keyword (e.g. AI, Python, Career)..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-xs font-bold focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="max-h-48 overflow-y-auto space-y-2 pt-1">
              {loading ? (
                <div className="py-6 flex items-center justify-center text-slate-400 text-xs">
                  <Loader2 className="w-4 h-4 animate-spin mr-2 text-amber-500" /> Searching...
                </div>
              ) : results.length > 0 ? (
                results.map(art => (
                  <button
                    key={art.id}
                    onClick={() => {
                      onSelectUrl(art.url, art.title);
                      onClose();
                    }}
                    className="w-full text-left p-3 rounded-xl border border-slate-100 hover:border-amber-500/30 hover:bg-amber-50/20 transition-all flex items-center justify-between group"
                  >
                    <div>
                      <span className="text-[9px] font-black text-amber-600 uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded">
                        {art.category || 'General'}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-600 transition-colors mt-1">{art.title}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">{art.url}</span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-amber-600 transition-colors" />
                  </button>
                ))
              ) : query.length >= 2 ? (
                <div className="py-6 text-center text-slate-400 text-xs italic">No matching articles found.</div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
