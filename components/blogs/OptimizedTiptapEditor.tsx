'use client'

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { memo, useEffect, useMemo } from 'react';
import { MobileEditorToolbar } from './MobileEditorToolbar';
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';

interface EditorProps {
  content: string;
  onChange?: (html: string) => void;
  onSave?: () => void;
}

/**
 * Performance-Optimized Tiptap Editor
 * Implements memoization and debounced event handling to eliminate typing lag.
 */
export const OptimizedTiptapEditor = memo(function OptimizedTiptapEditor({
  content,
  onChange,
  onSave
}: EditorProps) {
  
  const extensions = useMemo(() => [
    StarterKit.configure({
      history: { depth: 50 }
    }),
    Placeholder.configure({
      placeholder: 'Write something amazing engineering related...',
    }),
    Image.configure({
      inline: true,
      allowBase64: true,
    }),
    Link.configure({
      openOnClick: false,
    }),
  ], []);

  const debouncedChange = useDebouncedCallback((html: string) => {
    onChange?.(html);
  }, 150);

  const editor = useEditor({
    extensions,
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[500px] pb-32 editor-input',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      debouncedChange(html);
    },
    // Prevent unmount re-renders
    immediatelyRender: false,
  });

  // Hotkey mapping
  useEffect(() => {
    if (!editor) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        onSave?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editor, onSave]);

  if (!editor) return null;

  return (
    <div className="relative bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Desktop Toolbar could go here */}
      
      <div className="p-8 md:p-12">
        <EditorContent editor={editor} />
      </div>

      <MobileEditorToolbar editor={editor} />
      
      <div className="absolute bottom-6 right-6 hidden md:flex gap-4">
        <div className="px-4 py-2 bg-slate-50 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Ctrl + S to Force Sync
        </div>
      </div>
    </div>
  );
});
