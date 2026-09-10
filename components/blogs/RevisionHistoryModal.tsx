'use client';

import React, { useEffect, useState } from 'react';
import { X, History, RotateCcw, Clock, FileText, Loader2 } from 'lucide-react';
import { SafeDate } from '@/components/admin/SafeDate';

interface Revision {
  id: string;
  blogId: string;
  title: string;
  content: string;
  excerpt?: string;
  createdAt: string;
}

interface RevisionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  blogId: string;
  onRestore: (revision: Revision) => void;
}

export default function RevisionHistoryModal({
  isOpen,
  onClose,
  blogId,
  onRestore,
}: RevisionHistoryModalProps) {
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRevision, setSelectedRevision] = useState<Revision | null>(null);

  useEffect(() => {
    if (isOpen && blogId) {
      setLoading(true);
      fetch(`/api/admin/blogs/revisions?blogId=${blogId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.revisions)) {
            setRevisions(data.revisions);
            if (data.revisions.length > 0) {
              setSelectedRevision(data.revisions[0]);
            }
          }
        })
        .catch(err => console.error('Failed to load revisions:', err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, blogId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 font-nunito animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">Revision History</h2>
              <p className="text-xs font-medium text-slate-400">Review past versions and restore previous drafts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          {/* Revision List */}
          <div className="p-4 overflow-y-auto max-h-[500px] space-y-2">
            <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-400 px-2 mb-2">Saved Snapshots</h3>
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin mb-2 text-amber-500" />
                <span className="text-xs font-medium">Loading history...</span>
              </div>
            ) : revisions.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs font-medium italic">
                No previous revisions recorded yet.
              </div>
            ) : (
              revisions.map((rev, idx) => (
                <button
                  key={rev.id}
                  onClick={() => setSelectedRevision(rev)}
                  className={`w-full text-left p-3.5 rounded-2xl transition-all border ${
                    selectedRevision?.id === rev.id
                      ? 'bg-amber-500/10 border-amber-500/30 text-slate-900 shadow-sm'
                      : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-black uppercase text-slate-400 mb-1">
                    <span>Snapshot #{revisions.length - idx}</span>
                    <Clock className="w-3 h-3" />
                  </div>
                  <p className="text-xs font-bold text-slate-900 line-clamp-1">{rev.title || 'Untitled Draft'}</p>
                  <div className="text-[10px] font-medium text-slate-400 mt-1">
                    <SafeDate date={rev.createdAt} options={{ month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }} />
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Revision Preview Area */}
          <div className="md:col-span-2 p-6 overflow-y-auto max-h-[500px] flex flex-col justify-between space-y-6 bg-slate-50/30">
            {selectedRevision ? (
              <div className="space-y-4 flex-1">
                <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md">
                      Selected Revision
                    </span>
                    <h3 className="text-lg font-black text-slate-900 mt-2">{selectedRevision.title}</h3>
                  </div>
                  <button
                    onClick={() => {
                      onRestore(selectedRevision);
                      onClose();
                    }}
                    className="px-4 py-2.5 bg-[#0F172A] hover:bg-amber-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all shadow-md active:scale-95 shrink-0"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Restore Version
                  </button>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Excerpt</span>
                  <p className="text-xs text-slate-600 italic bg-white p-3 rounded-xl border border-slate-100">
                    {selectedRevision.excerpt || 'No excerpt provided'}
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Article Content Snapshot</span>
                  <div
                    className="prose prose-slate max-w-none text-xs bg-white p-4 rounded-2xl border border-slate-100 max-h-[250px] overflow-y-auto"
                    dangerouslySetInnerHTML={{ __html: selectedRevision.content || '<p class="text-slate-400 italic">Empty body content</p>' }}
                  />
                </div>
              </div>
            ) : (
              <div className="py-24 text-center text-slate-400 text-xs font-medium">
                Select a revision snapshot from the left list to view.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
