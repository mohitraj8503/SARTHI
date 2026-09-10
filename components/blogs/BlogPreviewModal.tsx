'use client'

import { X, ExternalLink, Rocket } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface PreviewProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  metadata?: any;
}

/**
 * High-Fidelity Blog Preview
 * Renders content exactly as it will appear on the live site for WYSIWYG validation.
 */
export function BlogPreviewModal({ isOpen, onClose, title, content, metadata }: PreviewProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-full animate-in zoom-in-95 duration-300">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
              <Rocket size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 leading-none">Publication Preview</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">What the world will see</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-50 rounded-2xl text-slate-400 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Preview Content */}
        <div className="flex-1 overflow-y-auto p-8 md:p-16 selection:bg-emerald-100">
          <article className="max-w-3xl mx-auto space-y-12">
            <header className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                {title || 'Untitled Engineering Masterpiece'}
              </h1>
              <div className="flex items-center gap-4 text-xs font-black text-slate-400 uppercase tracking-widest">
                <span>By {metadata?.authorName || 'Expert Author'}</span>
                <span>•</span>
                <span>{metadata?.category || 'Uncategorized'}</span>
              </div>
            </header>

            <div className="prose prose-slate prose-lg max-w-none 
                            prose-headings:font-black prose-headings:tracking-tight 
                            prose-p:leading-relaxed prose-p:font-medium
                            prose-img:rounded-3xl prose-img:shadow-xl">
              {/* If content is HTML (from Tiptap), we might need to convert or just dangerouslySetInnerHTML */}
              <div dangerouslySetInnerHTML={{ __html: content }} />
            </div>
          </article>
        </div>

        {/* Action Footer */}
        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Draft v{metadata?.version || 1.0} • Final Review
          </div>
          <div className="flex gap-4">
            <button onClick={onClose} className="px-6 py-3 text-xs font-black text-slate-600 uppercase tracking-widest">
              Back to Editor
            </button>
            <button className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 active:scale-95 transition-all">
              Schedule Publish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
