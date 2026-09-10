'use client';

import React, { useState, useRef } from 'react';
import { X, Upload, FileText, CheckCircle2, Loader2 } from 'lucide-react';
import { importDocxToHtml, DocxImportResult } from '@/lib/blog/importDocx';

interface ImportDocxModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyImport: (data: {
    title: string;
    excerpt: string;
    content: string;
    thumbnail?: string;
  }) => void;
}

export default function ImportDocxModal({
  isOpen,
  onClose,
  onApplyImport,
}: ImportDocxModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DocxImportResult | null>(null);
  const [extractedTitle, setExtractedTitle] = useState('');
  const [extractedExcerpt, setExtractedExcerpt] = useState('');
  const [selectedCoverImage, setSelectedCoverImage] = useState<string | null>(null);
  const [useAsCover, setUseAsCover] = useState(true);
  const [imagesList, setImagesList] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.docx')) {
      alert('Please select a valid Word document (.docx)');
      return;
    }

    setLoading(true);
    try {
      const res = await importDocxToHtml(file);
      setResult(res);
      setExtractedTitle(res.title || file.name.replace(/\.docx$/i, ''));

      const firstP = res.html.match(/<p[^>]*>(.*?)<\/p>/i);
      if (firstP) {
        const plainP = firstP[1].replace(/<[^>]+>/g, '').trim();
        setExtractedExcerpt(plainP.slice(0, 160));
      }

      const imgMatches = [...res.html.matchAll(/<img[^>]+src="([^">]+)"/gi)].map(m => m[1]);
      setImagesList(imgMatches);
      if (imgMatches.length > 0) {
        setSelectedCoverImage(imgMatches[0]);
        setUseAsCover(true);
      }
    } catch (err) {
      console.error('Failed to import Word document:', err);
      alert('Failed to parse Word document. Please ensure it is a valid .docx file.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmImport = () => {
    if (!result) return;

    // Deduplicate: If useAsCover is enabled and a cover image is selected, use htmlWithoutFirstImage
    const finalHtml = (useAsCover && selectedCoverImage)
      ? result.htmlWithoutFirstImage
      : result.html;

    onApplyImport({
      title: extractedTitle,
      excerpt: extractedExcerpt,
      content: finalHtml,
      thumbnail: useAsCover && selectedCoverImage ? selectedCoverImage : undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 font-sans animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-50 text-amber-700 rounded-lg">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Import Word Document</h2>
              <p className="text-[11px] text-slate-400 font-medium">Preserves headings, lists, tables & deduplicates cover media</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".docx"
            onChange={handleFileChange}
          />

          {!result && !loading && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 hover:border-amber-500 rounded-2xl p-10 text-center cursor-pointer transition-all bg-slate-50/40 hover:bg-amber-50/10 space-y-3 group"
            >
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto text-slate-400 group-hover:text-amber-600 shadow-sm border border-slate-100">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Drag & Drop or Click to Upload Word (.docx)</h3>
                <p className="text-[11px] text-slate-400 font-medium mt-1">Extracts title, excerpt, headings, paragraphs, and embedded images</p>
              </div>
            </div>
          )}

          {loading && (
            <div className="py-16 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-amber-600 mx-auto" />
              <p className="text-xs font-semibold text-slate-700">Parsing Word Document Structure & Images...</p>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-5">
              {/* Import Summary Badge */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200/60 pb-2">
                  <span>Import Summary</span>
                  <span className="text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Structure Verified
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                  <div className="bg-white p-2 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 block uppercase">Words</span>
                    <span className="font-bold text-slate-900">{result.wordCount}</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 block uppercase">Images</span>
                    <span className="font-bold text-slate-900">{result.imageCount}</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 block uppercase">Clean Format</span>
                    <span className="font-bold text-slate-900">HTML5</span>
                  </div>
                </div>
              </div>

              {/* Title Input */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 block">Detected Article Title</label>
                <input
                  type="text"
                  value={extractedTitle}
                  onChange={e => setExtractedTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Excerpt Input */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 block">Detected Excerpt Summary</label>
                <textarea
                  rows={2}
                  value={extractedExcerpt}
                  onChange={e => setExtractedExcerpt(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Cover Image Selector & Deduplication Checkbox */}
              {imagesList.length > 0 && (
                <div className="space-y-3 bg-amber-50/50 border border-amber-200/60 p-3.5 rounded-xl">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-amber-900 block">Cover Media Identification</label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useAsCover}
                        onChange={e => setUseAsCover(e.target.checked)}
                        className="rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                      />
                      <span className="text-[11px] font-semibold text-amber-800">Use as Cover (Strips duplicate from body)</span>
                    </label>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {imagesList.map((imgSrc, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedCoverImage(imgSrc);
                          setUseAsCover(true);
                        }}
                        className={`relative w-20 h-14 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                          selectedCoverImage === imgSrc ? 'border-amber-600 shadow-md scale-105' : 'border-slate-200 opacity-60'
                        }`}
                      >
                        <img src={imgSrc} alt={`Docx img ${idx}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-medium text-amber-600 hover:underline block"
              >
                Choose a different file
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {result && !loading && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmImport}
              className="px-5 py-2 bg-[#0F172A] hover:bg-[#F97316] text-white rounded-xl text-xs font-semibold shadow-sm active:scale-95"
            >
              Apply to Workspace
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
