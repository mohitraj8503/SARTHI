'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import BlogCard from '@/components/blogs/BlogCard';
import remarkGfm from 'remark-gfm';
import { 
  Calendar, Clock, User, ArrowLeft, Share2, 
  Bookmark, Twitter, Linkedin, Link as LinkIcon,
  Zap, BookOpen, Award, ShieldCheck, Share,
  ChevronRight, TrendingUp, ChevronDown, MessageSquare,
  ThumbsUp, ExternalLink, ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/AuthProvider';
import DOMPurify from 'isomorphic-dompurify';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  thumbnail: string;
  tags: string[];
  author: {
    name: string;
    avatar: string;
  };
  publishedAt: string;
  readTime: number;
  views: number;
  likes: number;
}

export default function BlogDetailClient({
  initialBlog,
  relatedStories = [],
}: {
  initialBlog?: BlogPost;
  relatedStories?: BlogPost[];
}) {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  
  const [blog, setBlog] = useState<BlogPost | null>(initialBlog || null);
  const [loading, setLoading] = useState(!initialBlog);
  const [relatedBlogs, setRelatedBlogs] = useState<BlogPost[]>(relatedStories);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  
  const { user } = useAuth();
  const [insiderEmail, setInsiderEmail] = useState('');
  const [joinedInsider, setJoinedInsider] = useState(false);
  const [showInsiderModal, setShowInsiderModal] = useState(false);
  const [toc, setToc] = useState<{ id: string; text: string; level: number }[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [blogImageError, setBlogImageError] = useState(false);
  const [trendingImageErrors, setTrendingImageErrors] = useState<Record<string, boolean>>({});
  const [recommendedImageErrors, setRecommendedImageErrors] = useState<Record<string, boolean>>({});

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const fetchBookmarkStatus = async (postId: string) => {
      try {
        const res = await fetch(`/api/blogs/${postId}/bookmark`);
        if (res.ok) {
          const data = await res.json();
          setIsBookmarked(data.bookmarked);
        } else {
          // Fallback to localStorage for guest/unsigned-in users
          const localBookmarks = JSON.parse(localStorage.getItem('saved_blogs') || '[]');
          setIsBookmarked(localBookmarks.includes(postId));
        }
      } catch (err) {
        console.error('Failed to fetch bookmark status:', err);
        // Fallback to localStorage on network error
        const localBookmarks = JSON.parse(localStorage.getItem('saved_blogs') || '[]');
        setIsBookmarked(localBookmarks.includes(postId));
      }
    };

    const fetchBlog = async () => {
      if (initialBlog && initialBlog.slug === slug) {
        setLoading(false);
        generateTOC(initialBlog.content);
        if (initialBlog.id) {
          fetchBookmarkStatus(initialBlog.id);
        }
        
        const fetchRelated = async (categoryName: string) => {
          try {
            const relatedRes = await fetch(`/api/blogs?category=${encodeURIComponent(categoryName)}&limit=10`);
            if (relatedRes.ok) {
              const relatedData = await relatedRes.json();
              let filtered = (relatedData.blogs || []).filter((b: BlogPost) => b.slug !== slug);
              
              if (filtered.length < 3) {
                const fallbackRes = await fetch(`/api/blogs?limit=10`);
                if (fallbackRes.ok) {
                  const fallbackData = await fallbackRes.json();
                  const extra = (fallbackData.blogs || []).filter((b: BlogPost) => b.slug !== slug && !filtered.some(f => f.id === b.id));
                  filtered = [...filtered, ...extra];
                }
              }
              setRelatedBlogs(filtered.slice(0, 3));
            }
          } catch (err) {
            console.error('Failed to fetch related blogs:', err);
          }
        };

        if (initialBlog.category) {
          fetchRelated(initialBlog.category);
        }

        // Sync live statistics (likes count) from the server in the background
        try {
          const res = await fetch(`/api/blogs/${slug}`);
          if (res.ok) {
            const data = await res.json();
            setBlog(data);
            if (data.category) {
              fetchRelated(data.category);
            }
          }
        } catch (err) {
          console.error('Failed to sync live blog data:', err);
        }
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`/api/blogs/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setBlog(data);
          if (data.id) fetchBookmarkStatus(data.id);
          generateTOC(data.content);
          
          if (data.category) {
            const relatedRes = await fetch(`/api/blogs?category=${encodeURIComponent(data.category)}&limit=10`);
            if (relatedRes.ok) {
              const relatedData = await relatedRes.json();
              let filtered = (relatedData.blogs || []).filter((b: BlogPost) => b.slug !== slug);
              
              if (filtered.length < 3) {
                const fallbackRes = await fetch(`/api/blogs?limit=10`);
                if (fallbackRes.ok) {
                  const fallbackData = await fallbackRes.json();
                  const extra = (fallbackData.blogs || []).filter((b: BlogPost) => b.slug !== slug && !filtered.some(f => f.id === b.id));
                  filtered = [...filtered, ...extra];
                }
              }
              setRelatedBlogs(filtered.slice(0, 3));
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch blog:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [slug, initialBlog]);

  useEffect(() => {
    if (blog?.id) {
      const likedBlogs = JSON.parse(localStorage.getItem('liked_blogs') || '[]');
      setIsLiked(likedBlogs.includes(blog.id));
    }
  }, [blog]);

  const processedContent = useMemo(() => {
    if (!blog?.content) return '';
    const isHtml = blog.content.includes('<p>') || blog.content.includes('</h2>') || blog.content.includes('</div>');
    if (!isHtml) return blog.content;
    
    let html = blog.content;
    // Convert <p><strong>Heading</strong></p> into <h2>Heading</h2> so it anchors and displays properly
    html = html.replace(/<p([^>]*)>\s*<strong>([\s\S]*?)<\/strong>\s*<\/p>/gi, (match, attrs, text) => {
      const cleanText = text.replace(/<[^>]*>/g, '').trim();
      if (cleanText.length > 0 && cleanText.length < 100) {
        return `<h2${attrs}>${text}</h2>`;
      }
      return match;
    });
    return html;
  }, [blog?.content]);

  const generateTOC = (content: string) => {
    if (!content) return;
    
    const isHtml = content.includes('<p>') || content.includes('</h2>') || content.includes('</div>');
    let tocItems: { id: string; text: string; level: number }[] = [];
    
    if (isHtml) {
      const headingRegex = /<h(2|3)[^>]*>([\s\S]*?)<\/h\1>|<p(?:[^>]*)>\s*<strong>([\s\S]*?)<\/strong>\s*<\/p>/gi;
      const matches = Array.from(content.matchAll(headingRegex));
      
      tocItems = matches.map((match, i) => {
        const text = (match[2] || match[3] || '').replace(/<[^>]*>/g, '').replace(/[#*`]/g, '').trim();
        return {
          id: `heading-${i}`,
          text: text,
          level: match[1] ? parseInt(match[1]) : 2
        };
      }).filter(item => item.text.length > 0 && item.text.length < 100);
    } else {
      const headingRegex = /^(#{2,3})\s+(.+)$/gm;
      const matches = Array.from(content.matchAll(headingRegex));
      tocItems = matches.map((match, i) => ({
        id: `heading-${i}`,
        text: match[2].replace(/[#*`]/g, '').trim(),
        level: match[1].length
      }));
    }
    
    setToc(tocItems);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -40% 0px', threshold: 0.5 }
    );

    const contentArea = document.querySelector('.blog-prose-container');
    if (contentArea) {
      const headings = contentArea.querySelectorAll('h2, h3');
      headings.forEach((h, i) => {
        h.id = `heading-${i}`;
        observer.observe(h);
      });
    }

    return () => observer.disconnect();
  }, [blog, loading]);

  const handleLike = async () => {
    if (!blog) return;
    const nextState = !isLiked;
    setIsLiked(nextState);

    // Optimistic UI updates
    setBlog(prev => prev ? { ...prev, likes: prev.likes + (nextState ? 1 : -1) } : null);

    // Save/Remove from localStorage
    try {
      const likedBlogs = JSON.parse(localStorage.getItem('liked_blogs') || '[]');
      if (nextState) {
        if (!likedBlogs.includes(blog.id)) {
          likedBlogs.push(blog.id);
        }
      } else {
        const index = likedBlogs.indexOf(blog.id);
        if (index > -1) {
          likedBlogs.splice(index, 1);
        }
      }
      localStorage.setItem('liked_blogs', JSON.stringify(likedBlogs));
    } catch (err) {
      console.error('Failed to update local likes:', err);
    }

    try {
      const res = await fetch(`/api/blogs/${blog.id}/like`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: nextState ? 'like' : 'unlike' })
      });
      if (res.ok) {
        const data = await res.json();
        setBlog(prev => prev ? { ...prev, likes: data.likes } : null);
      }
    } catch (err) {
      console.error('Failed to like blog:', err);
    }
  };

  const handleBookmark = async () => {
    if (!blog) return;
    const nextState = !isBookmarked;
    setIsBookmarked(nextState);

    // Save to localStorage regardless so guests can always use the feature
    try {
      const localBookmarks = JSON.parse(localStorage.getItem('saved_blogs') || '[]');
      if (nextState) {
        if (!localBookmarks.includes(blog.id)) {
          localBookmarks.push(blog.id);
        }
      } else {
        const index = localBookmarks.indexOf(blog.id);
        if (index > -1) {
          localBookmarks.splice(index, 1);
        }
      }
      localStorage.setItem('saved_blogs', JSON.stringify(localBookmarks));
    } catch (err) {
      console.error('Failed to update local bookmarks:', err);
    }

    try {
      const res = await fetch(`/api/blogs/${blog.id}/bookmark`, { method: 'POST' });
      if (!res.ok && !nextState) {
        // If server failed and we tried to unsave, let the server handle error or keep local state
      }
    } catch (err) {
      console.error('Failed to bookmark blog on server:', err);
    }
  };

  const handleShare = async (platform?: string) => {
    if (!blog) return;
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const title = blog.title.trim();
    const promoText = `"${title}"\n\n${blog.excerpt || ''}\n\nRead the blog now:\n${url}`;
    
    if (platform === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(promoText)}`, '_blank');
    } else if (platform === 'linkedin') {
      try {
        await navigator.clipboard.writeText(promoText);
        alert('Promotional post text has been copied to your clipboard!\n\nYou can paste it directly into the LinkedIn post creator that opens next.');
      } catch (err) {
        console.error('Failed to copy text before LinkedIn redirect', err);
      }
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(promoText);
        alert('Promotional text & link copied to clipboard!');
      } catch {
        console.error('Failed to copy');
      }
    }
    setShowShareMenu(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-[#1B4332] border-t-transparent rounded-full" 
        />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-6 p-6 text-center">
        <div className="text-6xl mb-6 opacity-20">✍️</div>
        <h1 className="text-4xl font-black text-[#1B4332] uppercase tracking-tighter">Insight Not Found</h1>
        <Link href="/blogs" className="px-8 py-4 bg-[#1B4332] text-white font-black rounded-2xl shadow-xl hover:bg-[#2D6A4F] transition-all uppercase tracking-widest text-xs">
          Return to Archive
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20 relative overflow-x-clip font-sans selection:bg-[#1B4332]/10 selection:text-[#1B4332]">
      <style>{`
        .blog-prose-container {
          color: #1F2937;
          line-height: 1.8;
          font-size: 1rem;
        }
        @media (min-width: 768px) {
          .blog-prose-container {
            font-size: 1.25rem;
          }
        }
        .blog-prose-container h2 {
          color: #111827;
          font-weight: 800;
          font-size: 1.5rem;
          margin: 2.5rem 0 1rem;
          letter-spacing: -0.02em;
          line-height: 1.2;
        }
        @media (min-width: 768px) {
          .blog-prose-container h2 {
            font-size: 2.5rem;
            margin: 4rem 0 1.5rem;
          }
        }
        .blog-prose-container h3 {
          color: #111827;
          font-weight: 700;
          font-size: 1.25rem;
          margin: 2rem 0 0.75rem;
          letter-spacing: -0.01em;
        }
        @media (min-width: 768px) {
          .blog-prose-container h3 {
            font-size: 1.875rem;
            margin: 3rem 0 1rem;
          }
        }
        .blog-prose-container p { margin-bottom: 1.5rem; }
        @media (min-width: 768px) {
          .blog-prose-container p { margin-bottom: 2rem; }
        }
        .blog-prose-container ul, .blog-prose-container ol { margin-bottom: 1.75rem; padding-left: 1.25rem; list-style-type: none; }
        @media (min-width: 768px) {
          .blog-prose-container ul, .blog-prose-container ol { margin-bottom: 2.5rem; padding-left: 1.5rem; }
        }
        .blog-prose-container li { margin-bottom: 0.75rem; position: relative; padding-left: 1.25rem; }
        @media (min-width: 768px) {
          .blog-prose-container li { margin-bottom: 1rem; padding-left: 1.5rem; }
        }
        .blog-prose-container ul li::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0.75em;
            width: 0.4rem;
            height: 0.4rem;
            background: #1B4332;
            border-radius: 50%;
        }
        @media (min-width: 768px) {
          .blog-prose-container ul li::before {
            width: 0.5rem;
            height: 0.5rem;
          }
        }
        .blog-prose-container blockquote {
          border-left: 6px solid #1B4332;
          padding: 1.25rem 1.5rem;
          background: #F9FAFB;
          font-style: italic;
          color: #111827;
          margin: 2.5rem 0;
          border-radius: 0 1rem 1rem 0;
          font-weight: 500;
          font-size: 1.125rem;
          line-height: 1.6;
        }
        @media (min-width: 768px) {
          .blog-prose-container blockquote {
            border-left: 8px solid #1B4332;
            padding: 2.5rem 3rem;
            margin: 4rem 0;
            border-radius: 0 1.5rem 1.5rem 0;
            font-size: 1.375rem;
          }
        }
        .blog-prose-container pre {
          background: #111827;
          color: #F3F4F6;
          padding: 1.25rem;
          border-radius: 1rem;
          overflow-x: auto;
          margin: 2rem 0;
          font-size: 0.8125rem;
          box-shadow: 0 15px 20px -5px rgba(0, 0, 0, 0.08);
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
        }
        @media (min-width: 768px) {
          .blog-prose-container pre {
            padding: 2rem;
            border-radius: 1.25rem;
            margin: 2.5rem 0;
            font-size: 0.9375rem;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          }
        }
        .blog-prose-container img {
          border-radius: 1rem;
          margin: 2rem 0;
          box-shadow: 0 15px 30px -10px rgba(0, 0, 0, 0.1);
          width: 100%;
        }
        @media (min-width: 768px) {
          .blog-prose-container img {
            border-radius: 1.5rem;
            margin: 4rem 0;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
          }
        }
        .blog-prose-container a {
          color: #1B4332;
          text-decoration: underline;
          text-underline-offset: 4px;
          font-weight: 600;
          transition: color 0.2s;
        }
        .blog-prose-container a:hover {
          color: #40916C;
        }
        .toc-item { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .toc-item.active { color: #1B4332; font-weight: 800; padding-left: 1rem; border-left: 3px solid #1B4332; }
        
        .premium-table {
            width: 100%;
            border-collapse: collapse;
            margin: 2rem 0;
            border-radius: 1rem;
            overflow: hidden;
            box-shadow: 0 5px 10px -3px rgba(0, 0, 0, 0.05);
            background: white;
            border: 1px solid #E5E7EB;
        }
        @media (min-width: 768px) {
          .premium-table {
            margin: 3rem 0;
            border-radius: 1.5rem;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          }
        }
        .premium-table th {
            background: #1B4332;
            color: white;
            text-align: left;
            padding: 0.75rem 1rem;
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        @media (min-width: 768px) {
          .premium-table th {
            padding: 1.25rem 1.5rem;
            font-size: 0.875rem;
          }
        }
        .premium-table td {
            padding: 0.75rem 1rem;
            border-bottom: 1px solid #F3F4F6;
            font-size: 0.875rem;
            color: #4B5563;
        }
        @media (min-width: 768px) {
          .premium-table td {
            padding: 1.25rem 1.5rem;
            font-size: 1rem;
          }
        }
        .premium-table tr:last-child td { border-bottom: none; }
        .premium-table tr:nth-child(even) { background: #F9FAFB; }
      `}</style>

      <div className="fixed top-0 left-0 w-full h-1.5 bg-slate-100 z-[100]">
        <motion.div 
          className="h-full bg-[#1B4332]"
          style={{ scaleX, originX: 0 }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-8 md:pt-12">
        <Link 
            href="/blogs" 
            className="group inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#1B4332] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Archive
        </Link>
      </div>

      <article className="max-w-7xl mx-auto px-4 md:px-6 pt-10 md:pt-16">
        <header className="max-w-4xl mx-auto text-center space-y-4 md:space-y-8 mb-10 md:mb-24">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-3"
            >
              <span className="px-4 py-1 bg-[#1B4332]/5 text-[#1B4332] rounded-full text-[11px] font-bold uppercase tracking-wider border border-[#1B4332]/10">
                {blog.category}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-sm font-medium text-slate-400">
                {blog.readTime} min read
              </span>
            </motion.div>

            <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-3xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] tracking-tight"
            >
              {blog.title}
            </motion.h1>

            <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-base md:text-xl text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto"
            >
              {blog.excerpt}
            </motion.p>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 pt-2 md:pt-4"
            >
                <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md">
                        <Image src={blog.author?.avatar || '/sarthi-logo.png'} alt={blog.author?.name || 'Author'} fill className="object-cover" />
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                          {blog.author?.name || 'SARTHI Editorial'}
                        </p>
                        <p className="text-xs text-slate-400 font-medium">
                          Published {blog.publishedAt ? format(new Date(blog.publishedAt), 'MMM dd, yyyy') : 'Recently'}
                        </p>
                    </div>
                </div>
                
                <div className="hidden sm:block h-8 w-px bg-slate-200" />
                
                <div className="flex items-center gap-2">
                    <button onClick={handleLike} className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 rounded-full transition-colors group">
                        <ThumbsUp className={cn("w-4 h-4 transition-colors duration-300", isLiked ? "fill-emerald-500 text-emerald-500 scale-110" : "text-slate-400 group-hover:scale-105")} />
                        <span className="text-sm font-bold text-slate-600">{blog.likes || 0}</span>
                    </button>
                    <button onClick={handleBookmark} className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 rounded-full transition-colors">
                        <Bookmark className={cn("w-4 h-4", isBookmarked ? "fill-slate-900 text-slate-900" : "text-slate-400")} />
                        <span className="text-sm font-bold text-slate-600">{isBookmarked ? 'Saved' : 'Save'}</span>
                    </button>
                    <div className="relative">
                        <button onClick={() => setShowShareMenu(!showShareMenu)} className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 rounded-full transition-colors">
                            <Share2 className="w-4 h-4 text-slate-400" />
                            <span className="text-sm font-bold text-slate-600">Share</span>
                        </button>
                        <AnimatePresence>
                            {showShareMenu && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute top-full right-0 mt-2 w-48 bg-white border border-slate-100 shadow-2xl rounded-2xl p-2 z-50 overflow-hidden"
                                >
                                    <button onClick={(e) => { e.stopPropagation(); handleShare('whatsapp'); }} className="flex items-center gap-3 w-full p-3 hover:bg-slate-50 rounded-xl transition-all text-sm font-bold text-slate-700">
                                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="text-[#25D366] shrink-0">
                                            <path d="M19.005 3.175C17.252 1.22 14.756 0 12.008 0 5.397 0 .06 5.348.06 12c0 2.102.547 4.148 1.588 5.946L0 24l6.163-1.687c1.766.963 3.734 1.453 5.833 1.453 6.611 0 12-5.348 12-12 0-3.204-1.242-6.216-3.991-8.591zm-7.007 19.38c-1.803 0-3.567-.478-5.114-1.39l-.368-.218-3.799.996.996-3.799-.218-.368c-.912-1.547-1.39-3.311-1.39-5.114 0-5.396 4.394-9.79 9.79-9.79 2.617 0 5.08 1.013 6.93 2.863 1.85 1.85 2.863 4.313 2.863 6.93 0 5.396-4.394 9.79-9.79 9.79zm5.357-7.447c-.292-.146-1.734-.855-2.001-.952-.268-.097-.463-.146-.66.146-.197.292-.76.952-.93 1.147-.171.195-.341.22-.633.073-1.65-.823-2.743-1.662-3.578-3.093-.217-.374.217-.348.623-.746.079-.079.16-.173.24-.251.09-.098.13-.166.198-.305.068-.14.034-.262-.017-.36-.051-.098-.463-1.12-.633-1.53-.165-.4-.34-.346-.463-.346-.12 0-.256 0-.39-.003-.134 0-.353.05-.54.25-.187.2-.712.697-.712 1.7 0 1 .73 1.97.83 2.1.1.135 1.43 2.2 3.47 3.08.48.2 1 .33 1.34.44.49.15.93.13 1.28.08.39-.05 1.73-.7 1.97-1.37.24-.67.24-1.24.17-1.37-.07-.13-.26-.2-.56-.34z"/>
                                        </svg> WhatsApp
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); handleShare('linkedin'); }} className="flex items-center gap-3 w-full p-3 hover:bg-slate-50 rounded-xl transition-all text-sm font-bold text-slate-700">
                                        <Linkedin size={16} className="text-[#0A66C2]" /> LinkedIn
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); handleShare('copy'); }} className="flex items-center gap-3 w-full p-3 hover:bg-slate-50 rounded-xl transition-all text-sm font-bold text-slate-700 border-t border-slate-50">
                                        <LinkIcon size={16} className="text-slate-400" /> Copy Link
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>
        </header>

        {/* Article Insights Horizontal Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto p-6 md:p-8 bg-slate-50/50 backdrop-blur-md rounded-[2rem] border border-slate-100/80 shadow-[0_8px_30px_rgb(0,0,0,0.015)] mb-10 md:mb-16">
          {[
            { label: "Level", value: "Strategic insight", icon: Zap },
            { label: "Complexity", value: "Architectural", icon: Award },
            { label: "Identity", value: "Verified Production", icon: ShieldCheck },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4 justify-center md:justify-start px-4 md:[&:not(:last-child)]:border-r border-slate-200/50">
              <div className="w-10 h-10 rounded-xl bg-[#1B4332]/5 flex items-center justify-center shrink-0">
                <item.icon className="text-[#1B4332] w-5 h-5" />
              </div>
              <div className="text-left leading-none">
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest block mb-1.5">{item.label}</span>
                <span className="text-xs font-black text-slate-800 tracking-tight">{item.value}</span>
              </div>
            </div>
          ))}
        </div>

        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative aspect-[16/10] md:aspect-[21/9] w-full rounded-2xl md:rounded-[4rem] overflow-hidden shadow-xl md:shadow-2xl mb-10 md:mb-24 bg-slate-50"
        >
          {blog.thumbnail && !blogImageError ? (
            <Image 
                src={blog.thumbnail} 
                alt={blog.title} 
                fill 
                priority
                className="object-cover object-[center_17%]"
                style={{ objectPosition: (blog as any).coverPosition || 'center 17%' }}
                sizes="100vw"
                onError={() => setBlogImageError(true)}
                unoptimized={blog.thumbnail.startsWith('data:')}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#1B4332] to-[#0B1E15] flex flex-col items-center justify-center p-12 text-center relative overflow-hidden">
                <div className="absolute w-[600px] h-[600px] rounded-full bg-white/5 -top-40 -left-40 pointer-events-none" />
                <div className="absolute w-[800px] h-[800px] rounded-full bg-white/5 -bottom-40 -right-40 pointer-events-none" />
                
                <BookOpen className="w-24 h-24 text-emerald-400/20 mb-6 relative z-10" />
                <span className="text-sm font-black uppercase tracking-[0.3em] text-emerald-400/60 relative z-10 mb-3">{blog.category}</span>
                <p className="text-xl font-bold text-white/50 max-w-lg relative z-10">SARTHI Architectural Briefing</p>
            </div>
          )}
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-8 md:gap-12 xl:gap-24">
          <aside className="lg:col-span-3 xl:col-span-2 hidden lg:block sticky top-24 h-fit">
            <div className="space-y-12">
              {toc.length > 0 && (
                <div className="space-y-6">
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-4">On This Page</h4>
                  <nav className="flex flex-col gap-4">
                    {toc.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          const element = document.getElementById(item.id);
                          if (element) {
                            window.scrollTo({
                                top: element.offsetTop - 100,
                                behavior: 'smooth'
                            });
                          }
                        }}
                        className={cn(
                          "toc-item block text-xs font-bold text-left transition-all leading-tight py-1",
                          item.level === 3 ? "pl-4 text-slate-400" : "text-slate-500",
                          activeId === item.id ? "active text-[#1B4332]" : "hover:text-slate-800"
                        )}
                      >
                        {item.text}
                      </button>
                    ))}
                  </nav>
                </div>
              )}
            </div>
          </aside>

          <main className="lg:col-span-9 xl:col-span-8 w-full overflow-hidden">
            {blog.content.includes('<p>') || blog.content.includes('</h2>') || blog.content.includes('</div>') ? (
              <div className="blog-prose-container mx-auto" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(processedContent) }} />
            ) : (
              <div className="blog-prose-container mx-auto prose max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{blog.content}</ReactMarkdown>
              </div>
            )}
          </main>

          <aside className="xl:col-span-2 hidden xl:block sticky top-24 h-fit">
            <div className="space-y-16">
              {relatedBlogs.length > 0 && (
                <div className="space-y-10">
                   <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-4">Trending Now</h4>
                   <div className="space-y-10">
                      {relatedBlogs.map((related, i) => {
                         const hasError = trendingImageErrors[related.id];
                         return (
                           <Link key={related.id} href={`/blogs/${related.slug}`} className="group block space-y-4">
                              <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-slate-50 border border-slate-100">
                                 {related.thumbnail && !hasError ? (
                                   <Image 
                                     src={related.thumbnail} 
                                     alt={related.title} 
                                     fill 
                                     className="object-cover transition-transform duration-500 group-hover:scale-110" 
                                     onError={() => setTrendingImageErrors(prev => ({ ...prev, [related.id]: true }))}
                                   />
                                 ) : (
                                   <div className="w-full h-full bg-gradient-to-br from-[#1B4332] to-[#0B1E15] flex flex-col items-center justify-center relative overflow-hidden">
                                     <BookOpen className="w-8 h-8 text-emerald-400/20" />
                                   </div>
                                 )}
                                 <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors" />
                              </div>
                              <div className="space-y-2">
                                 <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{related.category}</span>
                                 <h5 className="text-sm font-bold text-slate-800 leading-tight group-hover:text-[#1B4332] transition-colors">{related.title}</h5>
                              </div>
                           </Link>
                         );
                      })}
                   </div>
                </div>
              )}

            </div>
          </aside>
        </div>

        <footer className="mt-16 md:mt-24 pt-8 md:pt-12 border-t border-slate-100 max-w-4xl mx-auto">
            <div className="flex flex-wrap gap-2 mb-10 md:mb-16">
                {blog.tags?.map(tag => (
                    <span key={tag} className="px-3 py-1.5 md:px-4 md:py-2 bg-slate-50 text-slate-600 rounded-xl text-[10px] md:text-[11px] font-bold uppercase tracking-wider hover:bg-slate-100 transition-colors cursor-default">
                        #{tag}
                    </span>
                ))}
            </div>

            <div className="bg-slate-900 rounded-3xl md:rounded-[3rem] p-6 md:p-16 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl transition-transform group-hover:scale-125 duration-700" />
                
                <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-6 md:gap-12">
                    <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-2xl md:rounded-[2.5rem] overflow-hidden border-4 border-white/10 shrink-0 shadow-2xl">
                        <Image src={blog.author?.avatar || '/sarthi-logo.png'} alt={blog.author?.name || 'Author'} fill className="object-cover" />
                    </div>
                    <div className="space-y-4 md:space-y-6 flex-1">
                        <div>
                            <span className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-2 block">The Author</span>
                            <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center justify-center md:justify-start gap-2">
                              {blog.author?.name || 'SARTHI Editorial'}
                            </h3>
                            <p className="text-slate-300 font-medium mt-1 md:mt-2 text-sm md:text-base">Lead Technical Strategist @ SARTHI</p>
                        </div>
                        <p className="text-slate-300 leading-relaxed font-medium text-xs md:text-base">
                            Crafting the future of mission-based tech education. Mohit and the SARTHI team focus on project-driven learning that bridges the gap between theory and production-grade engineering.
                        </p>
                        <div className="flex items-center justify-center md:justify-start gap-4 md:gap-6">
                            <Link href="#" className="text-white/40 hover:text-white transition-colors"><Twitter size={20} /></Link>
                            <Link href="#" className="text-white/40 hover:text-white transition-colors"><Linkedin size={20} /></Link>
                            <Link href="#" className="text-white/40 hover:text-white transition-colors"><ArrowRight size={20} /></Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
      </article>

      <section className="max-w-7xl mx-auto px-4 md:px-6 mt-20 md:mt-48 pt-12 md:pt-24 border-t border-slate-100">
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 md:mb-16">
            <h2 className="text-2xl md:text-5xl font-extrabold text-slate-900 tracking-tight italic">Recommended Readings</h2>
            <Link href="/blogs" className="text-sm font-bold text-[#1B4332] hover:underline underline-offset-4">Browse All →</Link>
         </div>
         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-12">
            {relatedBlogs.map((related, i) => (
              <BlogCard key={related.id} blog={related} index={i} />
            ))}
         </div>
      </section>

      <AnimatePresence>
        {showInsiderModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInsiderModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-[2.5rem] p-8 md:p-12 max-w-md w-full shadow-2xl border border-slate-100 text-center z-10 space-y-6"
            >
              <button 
                onClick={() => setShowInsiderModal(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors text-sm font-bold"
              >
                ✕
              </button>
              <div className="w-16 h-16 bg-[#1B4332]/5 rounded-3xl flex items-center justify-center mx-auto">
                  <Zap className="w-8 h-8 text-[#1B4332]" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Stay Ahead in Tech</h3>
                <p className="text-slate-500 text-sm font-medium">Join 15,000+ tech learners receiving weekly strategic insights directly in their inbox.</p>
              </div>
              <div className="space-y-4">
                <input 
                  type="email" 
                  placeholder="Enter your email address" 
                  value={insiderEmail}
                  onChange={(e) => setInsiderEmail(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1B4332] focus:bg-white transition-all text-left"
                  required
                />
                <button 
                  onClick={() => {
                    if (insiderEmail.trim() && insiderEmail.includes('@')) {
                      setJoinedInsider(true);
                      setShowInsiderModal(false);
                    } else {
                      alert('Please enter a valid email address');
                    }
                  }}
                  className="w-full py-4 bg-[#1B4332] hover:bg-[#153527] text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg hover:shadow-xl"
                >
                  Subscribe Now
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
