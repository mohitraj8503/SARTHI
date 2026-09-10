'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { TrendingUp, BookOpen, User, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import DOMPurify from 'isomorphic-dompurify';
import BlogHeroSection from './BlogHeroSection';

interface BlogRendererProps {
  blog: {
    title: string;
    excerpt: string;
    content: string;
    thumbnail: string;
    category: string;
    tags: string[];
    author: {
      name: string;
      avatar: string;
    };
  };
  mode?: 'preview' | 'production';
  layoutMode?: 'card' | 'full';
  isEditing?: boolean;
  onTitleChange?: (val: string) => void;
  onSummaryChange?: (val: string) => void;
}

export default function BlogRenderer({ 
  blog, 
  mode = 'production', 
  layoutMode = 'card',
  isEditing = false,
  onTitleChange,
  onSummaryChange
}: BlogRendererProps) {
  const sanitizedContent = DOMPurify.sanitize(blog.content);
  const isSimulation = mode === 'preview';
  const isFullLayout = layoutMode === 'full';

  return (
    <motion.div 
      layout
      className={cn(
        "w-full bg-transparent animate-in fade-in duration-1000",
        isSimulation ? "min-h-screen" : "rounded-[3rem] overflow-hidden bg-white/5 backdrop-blur-[40px] border border-white/10 shadow-2xl"
      )}
    >
      {isFullLayout ? (
        /* Full Layout Hero Section */
        <BlogHeroSection 
          coverUrl={blog.thumbnail}
          title={blog.title}
          summary={blog.excerpt}
          authorName={blog.author.name}
          authorAvatar={blog.author.avatar}
          tags={blog.tags}
          isEditing={isEditing}
          onTitleChange={onTitleChange}
          onSummaryChange={onSummaryChange}
          lightMode={false}
        />
      ) : (
        /* Card Layout - Original Cover Media Area */
        <motion.div 
            layoutId="blog-cover"
            className={cn(
              "relative w-full overflow-hidden transition-all duration-1000",
              blog.thumbnail 
                ? (isSimulation ? "aspect-[21/9]" : "aspect-[16/9]") 
                : (isSimulation ? "h-[120px] bg-white/5" : "h-[200px] bg-white/5")
            )}
        >
          {blog.thumbnail ? (
            <Image src={blog.thumbnail} alt={blog.title} fill priority className="object-cover transition-transform duration-1000 hover:scale-105" unoptimized={true} />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-white/10">
              <ImageIcon size={isSimulation ? 32 : 48} className="opacity-10" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent pointer-events-none" />
        </motion.div>
      )}

      {/* 2. Content Workspace */}
      <div className={cn(
          "mx-auto px-6 md:px-12 py-12 md:py-24",
          isSimulation ? "max-w-4xl" : "w-full"
      )}>
        <div className="space-y-16">
          {/* Metadata, Title, Author - Only show in card layout mode */}
          {!isFullLayout && (
            <>
              {/* Metadata */}
              <motion.div layoutId="blog-category" className="flex flex-wrap gap-4">
                <div className="px-6 py-3 bg-orange-500 text-white rounded-full flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-orange-500/30">
                  <TrendingUp className="w-4 h-4" />
                  {isSimulation ? 'NEURAL PREVIEW' : 'STRATEGIC INSIGHT'}
                </div>
                <div className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-full flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-xl">
                   <BookOpen className="w-4 h-4 text-orange-500" />
                   {blog.category || 'Tech'}
                </div>
              </motion.div>

              {/* Title & Hook */}
              <div className="space-y-10">
                <motion.h1 
                  layoutId="blog-title"
                  className={cn(
                    "font-black text-white leading-[0.9] tracking-tighter uppercase italic font-outfit",
                    isSimulation ? "text-5xl md:text-7xl lg:text-8xl" : "text-4xl md:text-5xl"
                  )}
                >
                  {blog.title || 'Your Insight Title Awaits'}
                </motion.h1>

                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xl lg:text-2xl text-white/60 font-bold leading-relaxed italic border-l-[6px] border-orange-500/20 pl-8"
                >
                  {blog.excerpt || 'Write a compelling summary to hook your readers...'}
                </motion.p>
              </div>

              {/* Author Identity */}
              <motion.div layoutId="blog-author" className="flex items-center gap-6 py-10 border-y border-white/5">
                <div className="relative group/author">
                    <div className="absolute inset-0 bg-orange-500/20 blur-xl rounded-2xl opacity-40 group-hover/author:opacity-100 transition-opacity" />
                    <div className="w-16 h-16 rounded-2xl bg-white/5 overflow-hidden relative shadow-2xl border border-white/10 transition-transform group-hover/author:scale-105">
                    {blog.author.avatar ? (
                        <Image src={blog.author.avatar} alt="Author" fill className="object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/10">
                        <User size={28} />
                        </div>
                    )}
                    </div>
                </div>
                <div>
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-2">Curated By</p>
                  <p className="text-xl font-black text-white uppercase tracking-tight leading-none font-outfit italic">{blog.author.name || 'Anonymous'}</p>
                </div>
              </motion.div>
            </>
          )}

          {/* Prose Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="blog-prose-container py-12"
            dangerouslySetInnerHTML={{ __html: sanitizedContent || '<p class="text-white/20 italic text-2xl font-bold uppercase tracking-widest text-center py-20 border-2 border-dashed border-white/5 rounded-[3rem]">The heart of your story begins here...</p>' }}
          />

          {/* Tag Cloud */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="pt-16 border-t border-white/5 flex flex-wrap gap-4">
              {blog.tags.map(tag => (
                <span key={tag} className="px-6 py-3 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-orange-500 hover:bg-orange-500/5 hover:border-orange-500/20 transition-all cursor-default">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
