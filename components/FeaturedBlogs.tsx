'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Clock, User } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function FeaturedBlogs() {
    const [blogs, setBlogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchBlogs() {
            try {
                const res = await fetch('/api/blogs?limit=3');
                const data = await res.json();
                setBlogs(data.blogs || []);
            } catch (error) {
                console.error('Failed to fetch blogs:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchBlogs();
    }, []);

    if (loading || blogs.length === 0) return null;

    return (
        <section className="py-10 lg:py-28 bg-white overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1280px]">
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 lg:gap-8 mb-8 lg:mb-20">
                    <div className="max-w-2xl relative">
                        <div className="flex items-center gap-3 mb-4 lg:mb-5">
                            <span className="w-10 h-[2px] bg-[#D4956A]"></span>
                            <span className="text-xs font-extrabold text-[#D4956A] uppercase tracking-[0.25em]">
                                Latest News
                            </span>
                        </div>
                        <h2 className="text-[22px] lg:text-[56px] font-bold text-[#1A3C2E] tracking-tight leading-[1.2] lg:leading-[1.05] mb-4 lg:mb-6 uppercase italic font-outfit">
                            Latest From Blog
                        </h2>
                        <p className="text-[#5F6E5F] font-medium text-[15px] lg:text-xl leading-relaxed max-w-xl">
                            Insights, tutorials, and career guidance written by industry veterans to keep you ahead of the curve.
                        </p>
                    </div>

                    <Link href="/blogs" className="inline-flex items-center gap-2 text-[#D4956A] font-bold text-sm uppercase tracking-widest hover:text-[#1A3C2E] transition-colors pb-1 border-b-2 border-[#D4956A]/20 hover:border-[#1A3C2E] group">
                        <span>Read All Articles</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-12">
                    {blogs.map((blog: any, idx: number) => (
                        <motion.article
                            key={blog.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            className="flex flex-col h-full group"
                        >
                            <Link href={`/blogs/${blog.slug}`} className="block aspect-[16/10] relative rounded-3xl overflow-hidden mb-6 bg-gray-100 shadow-sm group-hover:shadow-xl transition-all duration-500">
                                {blog.thumbnail ? (
                                    <Image
                                        src={blog.thumbnail}
                                        alt={blog.title}
                                        fill
                                        sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 400px"
                                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                ) : (
                                    <div className="absolute inset-0 bg-[#F5F0E8] flex items-center justify-center">
                                        <div className="text-[#D4956A]/30 font-black text-6xl italic opacity-20 uppercase tracking-tighter">SARTHI</div>
                                    </div>
                                )}
                                <div className="absolute top-4 left-4">
                                    <span className="px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest text-[#1A3C2E] shadow-sm">
                                        {blog.category}
                                    </span>
                                </div>
                            </Link>

                            <div className="flex flex-col flex-1">
                                <div className="flex items-center gap-4 text-[11px] font-bold text-[#D4956A] uppercase tracking-widest mb-4">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {new Date(blog.publishedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </div>
                                    <div className="w-1 h-1 bg-[#D4956A]/30 rounded-full" />
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5" />
                                        {blog.readTime} min read
                                    </div>
                                </div>

                                <Link href={`/blogs/${blog.slug}`}>
                                    <h3 className="text-2xl font-bold text-[#1A3C2E] leading-tight mb-4 group-hover:text-[#D4956A] transition-colors line-clamp-2 italic">
                                        {blog.title}
                                    </h3>
                                </Link>

                                <p className="text-[#5F6E5F] text-sm leading-relaxed mb-6 line-clamp-3 font-medium">
                                    {blog.excerpt}
                                </p>

                                <div className="mt-auto pt-6 border-t border-black/[0.04] flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-[#1A3C2E] flex items-center justify-center text-[10px] font-bold text-white overflow-hidden uppercase ring-2 ring-white shadow-sm">
                                            {blog.author?.avatar ? (
                                                <Image src={blog.author.avatar} alt={blog.author.name} width={32} height={32} className="object-cover" />
                                            ) : (
                                                blog.author?.name?.[0] || '?'
                                            )}
                                        </div>
                                        <span className="text-[12px] font-bold text-[#1A3C2E] tracking-tight">{blog.author?.name}</span>
                                    </div>
                                    <Link href={`/blogs/${blog.slug}`} className="w-10 h-10 rounded-full border border-[#D4956A]/20 flex items-center justify-center text-[#D4956A] hover:bg-[#D4956A] hover:text-white transition-all">
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        </motion.article>
                    ))}
                </div>
            </div>
        </section>
    );
}

