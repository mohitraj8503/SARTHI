'use client';

import { useRef, useState } from 'react';
import { importDocxToHtml, type DocxImportResult } from '@/lib/blog/importDocx';

interface ImportDocxButtonProps {
  onImport: (result: DocxImportResult) => void;
  disabled?: boolean;
  theme?: string;
}

export default function ImportDocxButton({ onImport, disabled, theme = 'dark' }: ImportDocxButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.docx') && file.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      setError('Only .docx files are supported. Please save your Word document as .docx first.');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File too large. Maximum size is 10MB.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await importDocxToHtml(file);
      onImport(result);
    } catch (err) {
      console.error('DOCX import error:', err);
      setError('Failed to import document. Make sure it is a valid .docx file.');
    } finally {
      setLoading(false);
      // Reset input so same file can be re-imported
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const isLight = theme === 'light';

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={handleFileChange}
        className="hidden"
        id="docx-import-input"
      />
      <label
        htmlFor="docx-import-input"
        className={`
          inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-medium cursor-pointer transition-all duration-200
          ${isLight 
            ? 'border-slate-250 bg-slate-150/70 hover:bg-slate-200/80 text-slate-600 hover:text-slate-900 shadow-sm' 
            : 'border-white/20 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white'}
          ${loading ? 'opacity-50 pointer-events-none' : ''}
          ${disabled ? 'opacity-30 pointer-events-none' : ''}
        `}
      >
        {loading ? (
          <>
            <span className={`w-3.5 h-3.5 border-2 rounded-full animate-spin ${isLight ? 'border-slate-350 border-t-slate-700' : 'border-white/30 border-t-white'}`} />
            Importing...
          </>
        ) : (
          <>
            {/* Word doc icon */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            Import from Word
          </>
        )}
      </label>

      {error && (
        <p className="text-red-450 text-[11px] mt-1.5 max-w-[200px] leading-relaxed">
          {error}
        </p>
      )}
    </div>
  );
}
