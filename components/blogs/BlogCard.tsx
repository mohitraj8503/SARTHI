"use client";

import { forwardRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, ArrowRight, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

interface Blog {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  thumbnail: string;
  category: string;
  readTime: number;
  publishedAt: string;
  author: {
    name: string;
    avatar: string;
  };
}

const BlogCard = forwardRef<HTMLDivElement, { blog: Blog, index?: number }>(({ blog, index }, ref) => {
  const authorInitials = (blog.author?.name || 'TT').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ 
            duration: 0.6,
            ease: [0.16, 1, 0.3, 1],
            delay: index !== undefined ? (index % 3) * 0.08 : 0 
        }}
        className="group bg-white rounded-[2rem] overflow-hidden border border-slate-100/80 shadow-[0_10px_35px_-10px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_-15px_rgba(27,67,50,0.06)] transition-all duration-500 flex flex-col h-full"
    >
        {/* Visual Header Image */}
        <div className="relative w-full aspect-[16/10] overflow-hidden shrink-0 bg-slate-50/50 border-b border-slate-100 rounded-t-[2rem]">
            {blog.thumbnail ? (
                <Image 
                    src={blog.thumbnail} 
                    alt={blog.title} 
                    fill 
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    unoptimized={true}
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <BookOpen className="w-16 h-16" />
                </div>
            )}
        </div>

        <div className="p-8 flex flex-col flex-1 relative z-30 space-y-4">
            {/* Metadata Line */}
            <div className="flex items-center justify-between text-[10px] font-semibold tracking-wider uppercase">
                <div className="flex items-center gap-2 text-slate-400">
                    <span>{new Date(blog.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-200" />
                    <span className="text-[#40916C] font-bold">{blog.category}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400 bg-slate-50/80 px-2.5 py-1 rounded-full border border-slate-100/50 text-[9px]">
                    <Clock className="w-3 h-3 text-[#40916C]" />
                    <span>{blog.readTime} MIN READ</span>
                </div>
            </div>

            <Link href={`/blogs/${blog.slug}`}>
                <h3 className="text-lg md:text-xl font-bold text-slate-800 leading-snug line-clamp-2 min-h-[56px] tracking-tight hover:text-[#1B4332] transition-colors">
                    {blog.title}
                </h3>
            </Link>

            <p className="text-xs md:text-sm text-slate-500 leading-relaxed line-clamp-2 min-h-[40px] font-normal">
                {blog.excerpt}
            </p>

            <div className="h-[1px] bg-gradient-to-r from-transparent via-slate-100 to-transparent w-full" />

            <div className="mt-auto pt-2 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full ring-2 ring-emerald-50/50 overflow-hidden bg-[#F3F4F6] border border-[#E5E7EB] shrink-0">
                        {blog.author?.avatar ? (
                            <Image src={blog.author.avatar} alt={blog.author?.name || 'Author'} width={32} height={32} className="object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] font-black bg-[#1B4332] text-white">
                                {authorInitials}
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[8px] uppercase tracking-widest text-[#D4915C] font-black leading-none mb-1">
                          Author
                        </span>
                        <span className="text-xs font-semibold text-slate-600 tracking-tight leading-none flex items-center gap-1">
                          {blog.author?.name?.toLowerCase().includes('mukul pandey') ? (
                            <>
                              <span className="text-amber-600 dark:text-amber-500 font-black text-[9px] uppercase tracking-wider bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 px-1 py-0.5 rounded">CEO</span>
                              <span>Dr. Mukul Pandey</span>
                            </>
                          ) : (
                            blog.author?.name || 'SARTHI Expert'
                          )}
                        </span>
                    </div>
                </div>
                
                <Link 
                    href={`/blogs/${blog.slug}`}
                    className="relative inline-flex items-center justify-start h-10 pl-2 pr-5 py-2 bg-[#1B4332] text-white border-2 border-[#1B4332] rounded-full overflow-hidden transition-all duration-300 hover:bg-transparent hover:text-[#1B4332] group/btn active:scale-95 shrink-0"
                >
                    {/* Left Icon (Normal State) */}
                    <span className="w-6 h-6 rounded-full bg-white text-[#1B4332] flex items-center justify-center transition-all duration-300 group-hover/btn:w-0 group-hover/btn:h-0 group-hover/btn:opacity-0 group-hover/btn:mr-0 mr-2 shrink-0">
                        <ArrowRight className="w-3.5 h-3.5" />
                    </span>

                    <span className="text-[10px] font-black uppercase tracking-widest transition-transform duration-300">
                        Read
                    </span>

                    {/* Right Icon (Hover State) */}
                    <span className="w-0 opacity-0 group-hover/btn:w-3.5 group-hover/btn:opacity-100 transition-all duration-300 flex items-center justify-center ml-0 group-hover/btn:ml-2 shrink-0">
                        <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                </Link>
            </div>
        </div>
    </motion.div>
  );
});

BlogCard.displayName = 'BlogCard';
export default BlogCard;

