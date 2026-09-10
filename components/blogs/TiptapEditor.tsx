'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table';
import Underline from '@tiptap/extension-underline';
import { 
  Bold, Italic, List, ListOrdered, 
  Quote, Undo, Redo, Code, Heading1, 
  Heading2, Heading3, Link as LinkIcon, 
  Image as ImageIcon, Terminal, Loader2,
  BarChart2, X, Trash2
} from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import InternalLinkModal from '@/components/blogs/InternalLinkModal';

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  theme?: string;
}

const MenuBar = ({ editor, theme = 'dark' }: { editor: any; theme?: string }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  
  // Chart builder states
  const [showChartModal, setShowChartModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [chartType, setChartType] = useState('bar');
  const [chartLayout, setChartLayout] = useState('standard'); // 'standard' | 'premium'
  const [chartTitle, setChartTitle] = useState('');
  const [chartLabels, setChartLabels] = useState('Q1, Q2, Q3, Q4');
  const [datasetLabel, setDatasetLabel] = useState('Growth');
  const [chartData, setChartData] = useState('40, 60, 45, 80');

  if (!editor) return null;

  const handleInsertChart = () => {
    const labels = chartLabels.split(',').map(l => l.trim()).filter(Boolean);
    const dataValues = chartData.split(',').map(v => Number(v.trim()) || 0);
    const colors = ['#3A86C8', '#F4A261', '#2A9D8F', '#E76F51', '#FF6B00', '#174F3A'];

    const chartConfig = {
      type: chartType,
      data: {
        labels: labels,
        datasets: [{
          label: datasetLabel || 'Performance',
          data: dataValues,
          backgroundColor: ['pie', 'doughnut', 'polarArea'].includes(chartType)
            ? colors.slice(0, dataValues.length)
            : 'rgba(23, 79, 58, 0.75)',
          borderColor: ['pie', 'doughnut', 'polarArea'].includes(chartType) ? '#1e293b' : '#174F3A',
          borderWidth: 2
        }]
      },
      options: {
        title: {
          display: chartLayout === 'standard' && !!chartTitle,
          text: chartTitle,
          fontColor: '#ffffff',
          fontSize: 16
        },
        legend: {
          display: chartLayout === 'standard',
          labels: {
            fontColor: '#ffffff'
          }
        },
        scales: ['pie', 'doughnut', 'radar', 'polarArea'].includes(chartType) ? undefined : {
          yAxes: [{
            ticks: {
              fontColor: '#ffffff'
            }
          }],
          xAxes: [{
            ticks: {
              fontColor: '#ffffff'
            }
          }]
        }
      }
    };

    const chartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chartConfig))}&bkg=transparent`;

    if (chartLayout === 'premium') {
      const htmlContent = `
        <div class="my-12 p-8 md:p-10 rounded-[2rem] bg-slate-900/60 border border-slate-800 text-white flex flex-col md:flex-row items-center gap-8 max-w-3xl mx-auto shadow-2xl backdrop-blur-xl">
          <div class="w-48 h-48 shrink-0 flex items-center justify-center">
            <img src="${chartUrl}" class="max-w-full max-h-full object-contain" alt="${chartTitle || 'Chart'}" />
          </div>
          <div class="space-y-4 flex-1">
            ${chartTitle ? `<h4 class="text-sm font-black uppercase tracking-widest text-emerald-500 font-outfit italic">${chartTitle}</h4>` : ''}
            <ul class="space-y-3">
              ${labels.map((lbl, idx) => `
                <li class="flex items-center gap-3 text-xs font-bold text-slate-350">
                  <span class="w-3 h-3 rounded-full shrink-0 block" style="background-color: ${colors[idx % colors.length]}"></span>
                  <span>${lbl} (${dataValues[idx] || 0})</span>
                </li>
              `).join('')}
            </ul>
          </div>
        </div>
      `;
      editor.chain().focus().insertContent(htmlContent).run();
    } else {
      editor.chain().focus().setImage({ src: chartUrl }).run();
    }
    setShowChartModal(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload/blog-media', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      
      editor.chain().focus().setImage({ src: data.url }).run();
    } catch (err) {
      console.error('Image upload failed', err);
      alert('Failed to upload image. Please check size and type.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleApplyLink = (url: string) => {
    if (!url) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const isLight = theme === 'light';

  // Dynamic Tailwind styling classes based on theme
  const containerClass = isLight 
    ? "flex flex-wrap items-center gap-2 p-3 mb-10 bg-slate-100/90 rounded-[2rem] border border-slate-200 sticky top-4 z-30 shadow-md backdrop-blur-md"
    : "flex flex-wrap items-center gap-2 p-3 mb-10 bg-white/5 backdrop-blur-3xl rounded-[2rem] border border-white/10 sticky top-4 z-30 shadow-2xl";
    
  const buttonGroupClass = isLight
    ? "flex items-center gap-1.5 bg-slate-200/50 p-1.5 rounded-2xl border border-slate-300/30"
    : "flex items-center gap-1.5 bg-white/5 p-1.5 rounded-2xl border border-white/5";

  const getButtonClass = (isActive: boolean) => {
    if (isActive) {
      return isLight 
        ? "p-2.5 rounded-xl transition-all active:scale-95 bg-emerald-700 text-white shadow-md font-bold"
        : "p-2.5 rounded-xl transition-all active:scale-95 bg-white text-[#174F3A] shadow-xl";
    } else {
      return isLight
        ? "p-2.5 rounded-xl transition-all active:scale-95 text-slate-500 hover:text-slate-800 hover:bg-slate-300/50"
        : "p-2.5 rounded-xl transition-all active:scale-95 text-white/40 hover:text-white hover:bg-white/10";
    }
  };

  const getActionBtnClass = (disabled = false) => {
    return cn(
      "p-2.5 rounded-xl transition-all active:scale-95",
      isLight
        ? "text-slate-500 hover:text-slate-800 hover:bg-slate-300/50"
        : "text-white/40 hover:text-white hover:bg-white/10",
      disabled && "opacity-50 pointer-events-none"
    );
  };

  const getUndoRedoBtnClass = () => {
    return isLight
      ? "p-2.5 rounded-xl transition-all active:scale-95 text-slate-400 hover:text-slate-700 hover:bg-slate-300/30"
      : "p-2.5 rounded-xl transition-all active:scale-95 text-white/20 hover:text-white hover:bg-white/10";
  };

  return (
    <div className="w-full relative">
      <div className={containerClass}>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*"
          onChange={handleFileUpload}
        />
        <div className={buttonGroupClass}>
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={getButtonClass(editor.isActive('bold'))}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={getButtonClass(editor.isActive('italic'))}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
        </div>

        <div className={buttonGroupClass}>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={getButtonClass(editor.isActive('heading', { level: 1 }))}
            title="H1"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={getButtonClass(editor.isActive('heading', { level: 2 }))}
            title="H2"
          >
            <Heading2 className="w-4 h-4" />
          </button>
        </div>

        <div className={buttonGroupClass}>
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={getButtonClass(editor.isActive('bulletList'))}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={getButtonClass(editor.isActive('blockquote'))}
            title="Quote"
          >
            <Quote className="w-4 h-4" />
          </button>
        </div>

        <div className={buttonGroupClass}>
          <button
            onClick={() => setShowLinkModal(true)}
            className={getButtonClass(editor.isActive('link'))}
            title="Add Link"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className={getActionBtnClass(uploading)}
            title="Upload Image"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setShowChartModal(true)}
            className={getActionBtnClass()}
            title="Add Chart"
          >
            <BarChart2 className="w-4 h-4" />
          </button>
          {editor.isActive('image') && editor.getAttributes('image').src?.includes('quickchart.io') && (
            <button
              onClick={() => editor.chain().focus().deleteSelection().run()}
              className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all active:scale-95 border border-rose-500/25"
              title="Delete Selected Chart"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <button
            onClick={() => editor.chain().focus().undo().run()}
            className={getUndoRedoBtnClass()}
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().redo().run()}
            className={getUndoRedoBtnClass()}
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showChartModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[250] p-4">
          <div className="bg-[#0F172A] border border-slate-800 rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl relative space-y-6 text-white font-inter text-left">
            <button 
              onClick={() => setShowChartModal(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-800 transition-all text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="space-y-2">
              <h3 className="text-xl font-black font-outfit uppercase italic text-emerald-500 tracking-wide">Interactive Chart Builder</h3>
              <p className="text-xs text-slate-450">Insert responsive static chart engines to visualise your blog metrics.</p>
            </div>
            
            <div className="space-y-4">
              {/* Chart Type Selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Chart Type</label>
                <select 
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs outline-none focus:border-emerald-500 transition-colors text-white"
                  value={chartType}
                  onChange={(e) => setChartType(e.target.value)}
                >
                  <option value="bar">Bar Chart</option>
                  <option value="line">Line Chart</option>
                  <option value="pie">Pie Chart</option>
                  <option value="doughnut">Doughnut Chart</option>
                  <option value="radar">Radar Chart</option>
                  <option value="polarArea">Polar Area Chart</option>
                </select>
              </div>

              {/* Chart Layout Selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Chart Layout Style</label>
                <select 
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs outline-none focus:border-emerald-500 transition-colors text-white"
                  value={chartLayout}
                  onChange={(e) => setChartLayout(e.target.value)}
                >
                  <option value="standard">Standard Full-width (Basic Legend)</option>
                  <option value="premium">Premium Dashboard Card (Split Column + Indicators)</option>
                </select>
              </div>

              {/* Chart Title */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Chart Title (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Developer Trends" 
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs outline-none focus:border-emerald-500 transition-colors text-white placeholder:text-slate-650"
                  value={chartTitle}
                  onChange={(e) => setChartTitle(e.target.value)}
                />
              </div>

              {/* Dataset Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Dataset Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Growth" 
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs outline-none focus:border-emerald-500 transition-colors text-white placeholder:text-slate-650"
                  value={datasetLabel}
                  onChange={(e) => setDatasetLabel(e.target.value)}
                />
              </div>

              {/* Labels (Comma-separated) */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Labels (Comma-separated)</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs outline-none focus:border-emerald-500 transition-colors text-white"
                  value={chartLabels}
                  onChange={(e) => setChartLabels(e.target.value)}
                />
              </div>

              {/* Data Values (Comma-separated) */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Data Values (Comma-separated)</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs outline-none focus:border-emerald-500 transition-colors text-white"
                  value={chartData}
                  onChange={(e) => setChartData(e.target.value)}
                />
              </div>
            </div>

            <button 
              onClick={handleInsertChart}
              className="w-full py-4 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl uppercase font-black tracking-widest text-xs cursor-pointer transition-all active:scale-95 shadow-lg"
            >
              Insert Chart
            </button>
          </div>
        </div>
      )}

      <InternalLinkModal
        isOpen={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        onSelectUrl={handleApplyLink}
      />
    </div>
  );
};

const TiptapEditor = ({ content, onChange, placeholder, theme = 'dark' }: TiptapEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-[3rem] border border-white/10 shadow-2xl max-w-full h-auto my-16 mx-auto block',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-orange-500 font-black underline underline-offset-8 decoration-orange-500/20 hover:decoration-orange-500 transition-all',
        },
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Underline,
    ],
    content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-sm md:prose-base lg:prose-lg xl:prose-2xl focus:outline-none max-w-none min-h-[500px] font-sans text-slate-800 leading-relaxed selection:bg-amber-100 selection:text-slate-900',
      },
      transformPastedHTML(html) {
        // Strip Microsoft Word inline styles and garbage wrappers
        return html
          .replace(/<!--[\s\S]*?-->/g, '')
          .replace(/<style[\s\S]*?<\/style>/gi, '')
          .replace(/\s*style="[^"]*mso-[^"]*"/gi, '')
          .replace(/\s*style="[^"]*font-family:[^"]*"/gi, '')
          .replace(/\s*class="Mso[^"]*"/gi, '')
          .replace(/<span[^>]*>\s*<\/span>/gi, '');
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, false);
    }
  }, [content, editor]);

  return (
    <div className="w-full relative">
      <MenuBar editor={editor} theme={theme} />
      <style>{`
        /* Dark Mode */
        .blog-editor-dark .ProseMirror h1 { font-weight: 900; color: #FFFFFF; font-family: 'Outfit', sans-serif; text-transform: uppercase; letter-spacing: -0.05em; line-height: 0.9; margin-bottom: 3rem; font-style: italic; font-size: 5rem; }
        .blog-editor-dark .ProseMirror h2 { font-weight: 900; color: #FFFFFF; text-transform: uppercase; letter-spacing: -0.02em; margin-top: 5rem; font-family: 'Outfit', sans-serif; font-style: italic; }
        .blog-editor-dark .ProseMirror h3 { font-weight: 800; color: #FFFFFF; text-transform: uppercase; margin-top: 4rem; letter-spacing: 0.1em; font-size: 0.9rem; }
        .blog-editor-dark .ProseMirror p { margin-bottom: 2rem; font-size: 1.15rem; line-height: 1.8; color: rgba(255,255,255,0.8); }
        .blog-editor-dark .ProseMirror blockquote { border-left: 8px solid #174F3A; padding: 3rem; font-style: italic; color: #FFFFFF; font-weight: 600; background: rgba(255,255,255,0.03); border-radius: 0 3rem 3rem 0; margin: 4rem 0; border-top: 1px solid rgba(255,255,255,0.05); border-right: 1px solid rgba(255,255,255,0.05); border-bottom: 1px solid rgba(255,255,255,0.05); backdrop-blur-xl; }
        
        /* Light Mode */
        .blog-editor-light .ProseMirror h1 { font-weight: 900; color: #0F172A; font-family: 'Outfit', sans-serif; text-transform: uppercase; letter-spacing: -0.05em; line-height: 0.9; margin-bottom: 3rem; font-style: italic; font-size: 5rem; }
        .blog-editor-light .ProseMirror h2 { font-weight: 900; color: #0F172A; text-transform: uppercase; letter-spacing: -0.02em; margin-top: 5rem; font-family: 'Outfit', sans-serif; font-style: italic; }
        .blog-editor-light .ProseMirror h3 { font-weight: 800; color: #1E293B; text-transform: uppercase; margin-top: 4rem; letter-spacing: 0.1em; font-size: 0.9rem; }
        .blog-editor-light .ProseMirror p { margin-bottom: 2rem; font-size: 1.15rem; line-height: 1.8; color: #334155; }
        .blog-editor-light .ProseMirror blockquote { border-left: 8px solid #174F3A; padding: 3rem; font-style: italic; color: #0F172A; font-weight: 600; background: rgba(0,0,0,0.03); border-radius: 0 3rem 3rem 0; margin: 4rem 0; border-top: 1px solid rgba(0,0,0,0.05); border-right: 1px solid rgba(0,0,0,0.05); border-bottom: 1px solid rgba(0,0,0,0.05); backdrop-blur-xl; }

        .ProseMirror ul { list-style-type: disc; padding-left: 2rem; margin-bottom: 3rem; }
        .ProseMirror ol { list-style-type: decimal; padding-left: 2rem; margin-bottom: 3rem; }
        .ProseMirror li { margin-bottom: 1rem; }
        .ProseMirror img { transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1); }
        .ProseMirror img:hover { transform: scale(1.02); }
      `}</style>
      <div className={theme === 'light' ? 'blog-editor-light' : 'blog-editor-dark'}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default TiptapEditor;
