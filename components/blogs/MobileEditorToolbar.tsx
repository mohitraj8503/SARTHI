'use client'

import { useState } from 'react';
import { Editor } from '@tiptap/react';
import { 
  Bold, Italic, Heading2, List, ListOrdered, Quote, 
  ChevronUp, ChevronDown, Link as LinkIcon, Image as ImageIcon 
} from 'lucide-react';

/**
 * Touch-Optimized Mobile Editor Toolbar
 * Features large 44px+ tap targets and an expandable drawer for power formatting.
 */
export function MobileEditorToolbar({ editor }: { editor: Editor }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!editor) return null;

  const ToolbarButton = ({ onClick, active, children, label }: any) => (
    <button
      onClick={onClick}
      aria-label={label}
      className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all active:scale-90 ${
        active ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-600 border border-slate-100'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 md:hidden p-4 bg-white/80 backdrop-blur-xl border-t border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between gap-2 overflow-x-auto scrollbar-hide pb-2">
        <div className="flex gap-2">
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
            label="Bold"
          >
            <Bold size={20} />
          </ToolbarButton>
          
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
            label="Italic"
          >
            <Italic size={20} />
          </ToolbarButton>
          
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive('heading', { level: 2 })}
            label="Heading"
          >
            <Heading2 size={20} />
          </ToolbarButton>
        </div>

        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-900 text-white"
        >
          {isExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
        </button>
      </div>

      {isExpanded && (
        <div className="grid grid-cols-4 gap-4 pt-4 border-t border-slate-50 mt-2 animate-in slide-in-from-bottom-4">
          <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} label="Bullets">
            <List size={20} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} label="Numbers">
            <ListOrdered size={20} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} label="Quote">
            <Quote size={20} />
          </ToolbarButton>
          <ToolbarButton onClick={() => {/* image logic */}} label="Image">
            <ImageIcon size={20} />
          </ToolbarButton>
        </div>
      )}
    </div>
  );
}
