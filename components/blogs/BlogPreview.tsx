'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { User, BookOpen, ArrowRight, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import BlogRenderer from './BlogRenderer';

interface BlogPreviewProps {
  form: {
    title: string;
    content: string;
    excerpt: string;
    category: string;
    thumbnail: string;
    tags: string;
  };
  author: any;
  mode: 'full' | 'card';
  theme?: 'light' | 'dark';
  onTitleChange?: (val: string) => void;
  onSummaryChange?: (val: string) => void;
}

export default function BlogPreview({ 
  form, 
  author, 
  mode,
  theme = 'dark',
  onTitleChange,
  onSummaryChange
}: BlogPreviewProps) {
  const tagsArray = form.tags.split(',').map(t => t.trim()).filter(Boolean);

  return (
    <AnimatePresence mode="wait">
      {mode === 'card' ? (
        <motion.div 
          key="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full flex justify-center py-6 px-4"
        >
          <div className={cn("w-full max-w-[340px] rounded-[2.5rem] overflow-hidden border shadow-2xl group relative flex flex-col transition-colors duration-500", theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#0F172A]/60 border-slate-800/80')}>
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/40 via-transparent to-transparent pointer-events-none" />
            
            {/* 1. Cover with Badge */}
            <motion.div 
              layoutId="blog-cover"
              className={cn("relative aspect-[16/9] overflow-hidden border-b transition-colors duration-500", theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800')}
            >
              {form.thumbnail ? (
                <Image src={form.thumbnail} alt="Preview" fill className="object-cover transition-transform duration-1000 group-hover:scale-110" />
              ) : (
                <Image src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop" alt="Preview Placeholder" fill className="object-cover opacity-60 transition-transform duration-1000 group-hover:scale-110" />
              )}
              <motion.div layoutId="blog-category" className="absolute top-4 left-4">
                <span className="px-4 py-2 bg-orange-500 text-white rounded-full text-[8px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-orange-500/20">
                   {form.category || 'Insight'}
                </span>
              </motion.div>
            </motion.div>
            
            {/* 2. Content Zone */}
            <div className="p-6 space-y-4 flex-1 relative z-10">
              <div className="space-y-3">
                <motion.h3 
                  layoutId="blog-title" 
                  className={cn("text-lg font-black leading-tight uppercase line-clamp-2 font-outfit italic tracking-tight min-h-[3rem] transition-colors duration-500", theme === 'light' ? 'text-slate-900' : 'text-white')}
                >
                  {form.title || 'Drafting your masterpiece...'}
                </motion.h3>
                <motion.p 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className={cn("text-[11px] leading-relaxed line-clamp-3 font-medium italic transition-colors duration-500", theme === 'light' ? 'text-slate-500' : 'text-slate-400')}
                >
                  {form.excerpt || 'The summary of your story will capture hearts here.'}
                </motion.p>
              </div>
              
              {/* 3. Footer / Author */}
              <div className={cn("pt-4 border-t flex items-center justify-between transition-colors duration-500", theme === 'light' ? 'border-slate-200' : 'border-slate-800')}>
                <motion.div layoutId="blog-author" className="flex items-center gap-4">
                   <div className="relative group/avatar">
                      <div className="absolute inset-0 bg-orange-500/10 blur-md rounded-xl opacity-0 group-hover/avatar:opacity-100 transition-opacity" />
                      <div className={cn("w-10 h-10 rounded-xl overflow-hidden relative border shadow-sm transition-transform group-hover/avatar:scale-105 transition-colors duration-500", theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800')}>
                        {author?.avatar ? (
                          <Image src={author.avatar} alt="Author" fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-500">
                             <User size={18} />
                          </div>
                        )}
                      </div>
                   </div>
                    <div>
                        <p className={cn("text-[8px] font-black uppercase tracking-[0.2em] transition-colors duration-500", theme === 'light' ? 'text-slate-400' : 'text-slate-555 text-slate-500')}>
                          {author?.name?.toLowerCase().includes('mukul pandey') ? 'Author' : 'Architect'}
                        </p>
                        <p className={cn("text-[10px] font-black uppercase tracking-tight leading-none mt-1 transition-colors duration-500 flex items-center gap-1.5", theme === 'light' ? 'text-slate-900' : 'text-slate-200')}>
                          {author?.name?.toLowerCase().includes('mukul pandey') ? (
                            <>
                              <span className="text-amber-600 dark:text-amber-500 font-black text-[9px] uppercase tracking-wider bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 px-1.5 py-0.5 rounded">CEO</span>
                              <span>Dr. Mukul Pandey</span>
                            </>
                          ) : (
                            author?.name || 'Inquisitive Mind'
                          )}
                        </p>
                    </div>
                </motion.div>
                <button className={cn("w-10 h-10 rounded-full flex items-center justify-center border group-hover:bg-[#174F3A] group-hover:text-white group-hover:scale-110 group-hover:rotate-[-45deg] transition-all duration-500 shadow-md", theme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-900 border-slate-800 text-slate-405 text-slate-400')}>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          key="full"
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          className={cn("w-full h-full bg-transparent overflow-y-auto custom-scrollbar relative", theme === 'light' ? 'text-slate-900' : 'text-white')}
        >
          <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-3xl -z-10" />
          <BlogRenderer 
            mode="preview"
            layoutMode="full"
            isEditing={true}
            onTitleChange={onTitleChange}
            onSummaryChange={onSummaryChange}
            blog={{
              title: form.title,
              excerpt: form.excerpt,
              content: form.content,
              thumbnail: form.thumbnail,
              category: form.category,
              tags: tagsArray,
              author: author
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
