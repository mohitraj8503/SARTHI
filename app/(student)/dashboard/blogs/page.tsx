'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChevronRight, LayoutTemplate, FileText, Eye, 
  Clock, CheckCircle, XCircle, AlertCircle, Send,
  Plus, Loader2, Trash2, Edit, CheckCircle2, Globe, Zap, Sparkles, ArrowRight, Search
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import UserAvatar from '@/components/ui/UserAvatar';
import { useAuth } from '@/components/AuthProvider';
import BlogAccessOverlay from '@/components/blogs/BlogAccessOverlay';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  status: string;
  views: number;
  likes: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  submittedAt: string | null;
}

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  draft: { label: 'Draft', color: 'text-gray-400', bg: 'bg-gray-100', icon: FileText },
  pending_review: { label: 'Under Review', color: 'text-amber-600', bg: 'bg-amber-50', icon: Clock },
  published: { label: 'Published', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'text-red-600', bg: 'bg-red-50', icon: XCircle },
  revision_requested: { label: 'Needs Revision', color: 'text-orange-600', bg: 'bg-orange-50', icon: AlertCircle },
};

export default function WriterBlogsPage() {
  const router = useRouter();
  const { user, loading: authLoading, refreshUser } = useAuth();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const isApproved = user?.blogAccessStatus === 'approved' || 
                   ['ADMIN', 'TEACHER', 'SUPER_ADMIN'].includes(user?.role || '');

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/blogs/submit?status=${activeFilter}`);
      if (!res.ok) throw new Error('Failed to fetch blogs');
      const data = await res.json();
      setBlogs(data.blogs || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    if (isApproved) {
      fetchBlogs();
    }
  }, [fetchBlogs, isApproved]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    try {
      const res = await fetch(`/api/blogs/submit/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete');
      }
      setBlogs(blogs.filter(b => b.id !== id));
      setDeleteId(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  return (
    <div className="w-full bg-transparent p-4 lg:p-10 pb-20 space-y-12 min-h-screen">
      <div className={cn(
        "animate-in fade-in slide-in-from-bottom-8 duration-1000 space-y-12 max-w-[1600px] mx-auto",
        !isApproved && "pointer-events-none select-none opacity-40 scale-[0.99] blur-[2px]"
      )}>
        
        {/* Minimal Header */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-8 border-b border-slate-200/80 pb-6">
          <div className="space-y-1.5 text-left relative">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-1.5 w-5 bg-emerald-500 rounded-full" />
              <span className="text-[10px] sm:text-xs font-black text-emerald-600 uppercase tracking-[0.25em]">WRITER STUDIO</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-[0.95]">
              ARTICLES &amp; <span className="text-emerald-500">BLOGS</span>
            </h1>
            <p className="text-slate-500 font-medium text-xs sm:text-sm mt-1.5">
              Manage and publish your technical articles &amp; publications
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-6 px-6 py-3 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="text-center border-r border-slate-100 pr-6">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Trust Score</p>
                <p className={cn("text-xl font-black font-outfit uppercase", (user?.blogTrustScore || 0) >= 50 ? "text-[#174F3A]" : "text-amber-500")}>
                  {user?.blogTrustScore || 0}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Strikes</p>
                <p className={cn("text-xl font-black font-outfit uppercase", (user?.blogStrikes || 0) > 0 ? "text-red-500" : "text-slate-400")}>
                  {user?.blogStrikes || 0}
                </p>
              </div>
            </div>

            <Link 
              href="/dashboard/blogs/new"
              className="px-8 py-3.5 bg-[#174F3A] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-[#174F3A]/10 hover:scale-105 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> New Post
            </Link>
          </div>
        </header>

        {/* Filter Hub */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-200/80 pb-8">
            <div className="flex items-center gap-2 bg-white p-1.5 rounded-[2rem] border border-slate-200 overflow-x-auto no-scrollbar max-w-full shadow-sm">
                {['all', 'draft', 'pending_review', 'published', 'rejected'].map(filter => (
                <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={cn(
                    "px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                    activeFilter === filter 
                        ? "bg-[#174F3A] text-white" 
                        : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/50"
                    )}
                >
                    {filter === 'all' ? 'All Posts' : statusConfig[filter]?.label || filter}
                </button>
                ))}
            </div>
            <div className="flex items-center gap-3">
                <div className="relative hidden md:block">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input 
                        type="text" 
                        placeholder="Search posts..." 
                        className="w-64 pl-12 pr-4 py-3 bg-white rounded-2xl border border-slate-200 outline-none transition-all text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:ring-4 focus:ring-slate-100 shadow-sm"
                    />
                </div>
            </div>
        </div>

        {/* Blog Grid */}
        <AnimatePresence mode="wait">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {[1,2,3].map(i => (
                  <div key={i} className="h-64 bg-slate-100/50 rounded-[2.5rem] animate-pulse border border-slate-200" />
                ))}
              </div>
            ) : error ? (
              <div className="p-12 rounded-[2.5rem] bg-rose-50/50 border border-rose-100 text-rose-600 text-center font-black text-xs uppercase tracking-widest">
                {error}
              </div>
            ) : blogs.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-32 text-center space-y-6"
              >
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-10 h-10 text-gray-200" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight uppercase font-outfit">Archive Empty</h3>
                  <p className="text-gray-400 max-w-sm mx-auto font-bold text-xs uppercase tracking-widest">Start sharing your insights with the world.</p>
                </div>
                <Link href="/dashboard/blogs/new" className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#174F3A] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-[#174F3A]/10 hover:scale-105 transition-all">
                    Create First Post <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
              >
                {blogs.map((blog, idx) => (
                  <MinimalBlogCard key={blog.id} blog={blog} index={idx} formatDate={formatDate} statusConfig={statusConfig} handleDelete={handleDelete} />
                ))}
              </motion.div>
            )}
        </AnimatePresence>
      </div>

      {!isApproved && user && (
        <BlogAccessOverlay 
          user={user as any} 
          onStatusChange={async (newStatus) => {
            if (newStatus === 'approved') {
              await refreshUser();
            }
          }} 
        />
      )}
    </div>
  );
}

function MinimalBlogCard({ blog, index, formatDate, statusConfig, handleDelete }: any) {
    const status = statusConfig[blog.status] || statusConfig.draft;
    const StatusIcon = status.icon;
    
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group bg-white rounded-[2.5rem] border border-slate-200/80 shadow-sm hover:shadow-md overflow-hidden transition-all duration-500 flex flex-col"
        >
            <div className="p-8 pb-0 flex items-start justify-between">
                <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm",
                    status.bg, status.color
                )}>
                    <StatusIcon className="w-7 h-7" />
                </div>
                <div className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-black border flex items-center gap-2 uppercase tracking-widest",
                    status.bg, status.color, "border-current/10"
                )}>
                    {status.label}
                </div>
            </div>
 
            <div className="p-8 flex-1 flex flex-col">
                <div className="space-y-1 mb-6">
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{blog.category || 'Uncategorized'}</span>
                    <h3 className="text-xl font-black text-gray-900 leading-tight group-hover:text-[#174F3A] transition-colors uppercase font-outfit">
                        {blog.title}
                    </h3>
                    {blog.excerpt && (
                        <p className="text-xs text-gray-400 font-bold italic mt-2 line-clamp-2 opacity-70 leading-relaxed">{blog.excerpt}</p>
                    )}
                </div>
 
                <div className="mt-auto space-y-6">
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                <Clock className="w-3.5 h-3.5" />
                                {formatDate(blog.createdAt)}
                            </div>
                            <div className="flex items-center gap-2 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                <Eye className="w-3.5 h-3.5 text-amber-500" />
                                {blog.views || 0} Views
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                              {/* Edit Button: allowed if not published, or if published and within 7 days */}
                              {(blog.status !== 'published' || (Date.now() - new Date(blog.createdAt).getTime() <= 7 * 24 * 60 * 60 * 1000)) && (
                                   <Link
                                       href={`/dashboard/blogs/${blog.id}`}
                                       className="p-2.5 bg-slate-50 rounded-xl text-slate-400 hover:bg-[#174F3A] hover:text-white transition-all shadow-sm border border-slate-100"
                                       title="Edit Blog"
                                   >
                                       <Edit size={16} />
                                   </Link>
                              )}
                              
                              {/* Delete Button: always allowed for the author */}
                              <button
                                  onClick={() => handleDelete(blog.id)}
                                  className="p-2.5 bg-slate-50 rounded-xl text-slate-400 hover:bg-rose-500 hover:text-white transition-all shadow-sm border border-slate-100"
                                  title="Delete Blog"
                              >
                                  <Trash2 size={16} />
                              </button>

                              {/* View Link: allowed for published blogs */}
                              {blog.status === 'published' && (
                                 <Link
                                     href={`/blogs/${blog.slug}`}
                                     target="_blank"
                                     className="p-2.5 bg-slate-50 rounded-xl text-slate-400 hover:bg-[#174F3A] hover:text-white transition-all shadow-sm border border-slate-100"
                                     title="View Live Blog"
                                 >
                                     <Globe size={16} />
                                 </Link>
                              )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
