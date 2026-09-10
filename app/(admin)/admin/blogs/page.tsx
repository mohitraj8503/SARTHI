'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FileEdit, Image as ImageIcon, User, Calendar, Check, X, Search, Filter, 
  ExternalLink, ChevronRight, PenTool, LayoutTemplate, MoreHorizontal, AlertCircle,
  TrendingUp, FileText, Clock, ShieldCheck, SearchIcon, Plus, Eye, ThumbsUp, MessageSquare,
  Trash2, LayoutGrid, List
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export default function AdminBlogs() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setFilter] = useState('all'); // all | pending_review | published | rejected | revision_requested
  const [sourceFilter, setSourceFilter] = useState('all'); // all | official | community
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    pending: 0,
    official: 0
  });

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/blogs?status=${activeFilter}&source=${sourceFilter}`, {
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (!res.ok) throw new Error(`Failed to fetch blogs: ${res.statusText}`);
      const data = await res.json();
      const blogList = data.blogs || data.data?.blogs || [];
      setBlogs(blogList);
      
      // Basic stats calculation (in a real app, this might come from the API)
      if (activeFilter === 'all' && sourceFilter === 'all') {
        setStats({
          total: blogList.length,
          published: blogList.filter((b: any) => b.status === 'published').length,
          pending: blogList.filter((b: any) => b.status === 'pending_review').length,
          official: blogList.filter((b: any) => 
            b.author?.role === 'ADMIN' || 
            b.author?.role === 'SUPERADMIN' || 
            b.author?.role === 'SUPER_ADMIN' || 
            b.adminNote === 'SARTHI_OFFICIAL'
          ).length
        });
      }
    } catch (err) {
      console.error('Failed to fetch blogs:', err);
      setError(err instanceof Error ? err.message : 'Failed to load blogs');
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  }, [activeFilter, sourceFilter]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const handleUpdateStatus = useCallback(async (blogId: string, action: string, withStrike: boolean = false) => {
    try {
      const res = await fetch(`/api/admin/blogs/${blogId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, adminNote: `Post ${action}ed${withStrike ? ' with strike' : ''}`, withStrike }),
      });
      if (res.ok) {
        fetchBlogs();
      }
    } catch (err) {
      console.error('Failed to update blog status:', err);
    }
  }, [fetchBlogs]);

  const handleDeleteBlog = useCallback(async (blogId: string) => {
    try {
      const res = await fetch(`/api/admin/blogs/${blogId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchBlogs();
      }
    } catch (err) {
      console.error('Failed to move blog post to trash:', err);
    }
  }, [fetchBlogs]);

  const handleRestoreBlog = useCallback(async (blogId: string) => {
    try {
      const res = await fetch(`/api/admin/blogs/${blogId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'restore' }),
      });
      if (res.ok) {
        fetchBlogs();
      }
    } catch (err) {
      console.error('Failed to restore blog post:', err);
    }
  }, [fetchBlogs]);

  const handlePermanentDeleteBlog = useCallback(async (blogId: string) => {
    try {
      const res = await fetch(`/api/admin/blogs/${blogId}?force=true`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchBlogs();
      }
    } catch (err) {
      console.error('Failed to permanently delete blog post:', err);
    }
  }, [fetchBlogs]);

  const filteredBlogs = blogs.filter(blog => 
    (blog.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (blog.author?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen pb-20 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto">
      {/* Premium Header */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6 lg:gap-8 border-b border-slate-100 pb-6 sm:pb-8 mb-6 sm:mb-8">
        <div className="space-y-1.5 text-left relative">
          <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
            <div className="h-1.5 w-5 bg-[#F97316] rounded-full" />
            <span className="text-[10px] sm:text-xs font-black text-[#F97316] uppercase tracking-[0.25em]">BLOG &amp; ARTICLES</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-[0.95]">
            BLOG <span className="text-[#F97316]">EDITOR</span>
          </h1>
          <p className="text-slate-500 font-medium text-xs sm:text-sm mt-1 sm:mt-1.5">
            Manage official publications and review community articles.
          </p>
        </div>

        <button 
          onClick={() => router.push('/admin/blogs/new')} 
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#0F172A] text-white px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#F97316] transition-all shadow-md active:scale-95 flex-shrink-0 min-h-[44px]"
        >
          <PenTool className="w-4 h-4" /> Create Official Post
        </button>
      </header>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8 sm:mb-12">
        {[
          { label: 'Total Articles', value: stats.total, icon: FileText, color: 'blue' },
          { label: 'Published Live', value: stats.published, icon: TrendingUp, color: 'emerald' },
          { label: 'Pending Review', value: stats.pending, icon: Clock, color: 'amber' },
          { label: 'Official Blogs', value: stats.official, icon: ShieldCheck, color: 'purple' },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-slate-100 rounded-[20px] sm:rounded-[32px] p-4 sm:p-8 shadow-sm group hover:border-[#D4A017]/20 transition-all">
            <div className="flex items-start justify-between mb-2 sm:mb-4">
              <div className={cn(
                "p-2.5 sm:p-3 rounded-xl sm:rounded-2xl group-hover:scale-110 transition-transform",
                stat.color === 'blue' && "bg-blue-50 text-blue-600",
                stat.color === 'emerald' && "bg-emerald-50 text-emerald-600",
                stat.color === 'amber' && "bg-amber-50 text-amber-600",
                stat.color === 'purple' && "bg-purple-50 text-purple-600",
              )}>
                <stat.icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-[9px] sm:text-[10px] font-black text-slate-300 uppercase tracking-widest hidden sm:inline">Live Data</span>
            </div>
            <p className="text-[9px] sm:text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1 truncate">{stat.label}</p>
            <h4 className="text-xl sm:text-3xl font-black text-slate-900">{stat.value}</h4>
          </div>
        ))}
      </div>

      {/* Advanced Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 mb-8 sm:mb-10 lg:items-center justify-between bg-white/50 backdrop-blur-md p-3 sm:p-4 rounded-[20px] sm:rounded-[32px] border border-slate-100 shadow-sm">
        <div className="flex flex-col sm:flex-row flex-wrap lg:flex-nowrap items-stretch sm:items-center gap-3 sm:gap-4 w-full lg:w-auto">
            {/* Source Switcher */}
            <div className="flex p-1 bg-slate-100/50 rounded-2xl border border-slate-200/60 w-full sm:w-auto overflow-x-auto no-scrollbar">
                {['all', 'official', 'community'].map(s => (
                    <button
                        key={s}
                        onClick={() => setSourceFilter(s)}
                        className={cn(
                            "flex-1 sm:flex-none px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all min-h-[38px]",
                            sourceFilter === s 
                                ? "bg-white text-slate-900 shadow-md shadow-slate-200/50" 
                                : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        {s}
                    </button>
                ))}
            </div>

            <div className="h-8 w-px bg-slate-200 hidden sm:block" />

            {/* Status Tabs */}
            <div className="flex gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0 w-full sm:w-auto">
                {['all', 'pending_review', 'published', 'rejected', 'trash'].map(s => (
                <button
                    key={s}
                    className={cn(
                        "flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap min-h-[38px]",
                        activeFilter === s 
                            ? "bg-[#D4A017] text-black font-bold" 
                            : "bg-white border border-slate-100 text-slate-400 hover:text-slate-900 hover:border-slate-300"
                    )}
                    onClick={() => setFilter(s)}
                >
                    {s.replace('_', ' ')}
                </button>
                ))}
            </div>
        </div>

        {/* Search & View Mode Toggle */}
        <div className="flex items-center gap-3 sm:gap-4 w-full lg:w-auto">
            <div className="relative w-full lg:w-[320px] group">
                <SearchIcon className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#D4A017] transition-colors" />
                <input 
                    type="text" 
                    placeholder="Search by title or author..." 
                    className="w-full bg-white border border-slate-100 rounded-2xl pl-11 sm:pl-14 pr-4 sm:pr-6 py-3 sm:py-4 text-xs font-bold placeholder:text-slate-300 focus:outline-none focus:border-[#D4A017]/40 focus:ring-4 focus:ring-[#D4A017]/5 transition-all min-h-[44px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="flex items-center p-1 bg-slate-100/50 rounded-2xl border border-slate-200/60 shrink-0">
                <button
                    onClick={() => setViewMode('grid')}
                    className={cn(
                        "p-2 sm:p-2.5 rounded-xl transition-all min-h-[38px] min-w-[38px] flex items-center justify-center",
                        viewMode === 'grid' 
                            ? "bg-white text-slate-900 shadow-md shadow-slate-200/50" 
                            : "text-slate-400 hover:text-slate-600"
                    )}
                    title="Grid View"
                >
                    <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                    onClick={() => setViewMode('list')}
                    className={cn(
                        "p-2 sm:p-2.5 rounded-xl transition-all min-h-[38px] min-w-[38px] flex items-center justify-center",
                        viewMode === 'list' 
                            ? "bg-white text-slate-900 shadow-md shadow-slate-200/50" 
                            : "text-slate-400 hover:text-slate-600"
                    )}
                    title="List View"
                >
                    <List className="w-4 h-4" />
                </button>
            </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-8 p-5 sm:p-8 bg-red-50 border border-red-100 rounded-[24px] sm:rounded-[32px] flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
          <div className="p-3 sm:p-4 bg-white rounded-2xl shadow-sm shrink-0"><AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" /></div>
          <div>
            <p className="text-red-500 font-black uppercase tracking-[0.2em] text-xs sm:text-sm mb-1">Service Disruption</p>
            <p className="text-slate-600 text-xs font-medium">We encountered an issue fetching the latest blog data: {error}</p>
          </div>
          <button onClick={() => fetchBlogs()} className="w-full sm:w-auto sm:ml-auto px-6 py-3 bg-red-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 min-h-[44px]">Retry Fetch</button>
        </div>
      )}

      {/* Main Grid or Table List */}
      {loading ? (
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-4 sm:px-0">
           {[...Array(6)].map((_, i) => <div key={i} className="h-[300px] bg-white border border-slate-100 rounded-[40px] animate-pulse" />)}
         </div>
      ) : filteredBlogs.length === 0 ? (
        <div className="py-40 flex flex-col items-center justify-center text-center opacity-40">
           <LayoutTemplate className="w-20 h-20 mb-6 stroke-[1]" />
           <p className="uppercase tracking-[0.4em] text-sm font-black text-slate-900">No Articles Found</p>
           <p className="text-xs font-bold mt-2">Adjust your filters or try a different search</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-4 sm:px-0">
          {filteredBlogs.map(blog => (
            <div key={blog.id} className="relative group bg-white border border-slate-100 rounded-[40px] overflow-hidden hover:border-[#D4A017]/40 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 flex flex-col h-full">
              {/* Thumbnail Area */}
              <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                {blog.thumbnail ? (
                    <Image src={blog.thumbnail} alt={blog.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" unoptimized={true} />
                ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-10"><ImageIcon className="w-16 h-16" /></div>
                )}
                
                {/* Overlay Badges */}
                <div className="absolute top-6 left-6 flex flex-col gap-2">
                    <span className="bg-slate-900/90 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">
                        {blog.category}
                    </span>
                    {blog.status === 'published' ? (
                      <span className="bg-emerald-500/90 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> Live
                      </span>
                    ) : blog.status === 'pending_review' ? (
                      <span className="bg-amber-500/90 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">
                        Pending
                      </span>
                    ) : (
                      <span className="bg-slate-500/90 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">
                        {blog.status}
                      </span>
                    )}
                </div>

                {/* Quick Stats Overlay */}
                <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-8">
                    <div className="text-center text-white">
                        <Eye className="w-5 h-5 mx-auto mb-2 opacity-60" />
                        <span className="text-xs font-black">{blog.views || 0}</span>
                    </div>
                    <div className="text-center text-white">
                        <ThumbsUp className="w-5 h-5 mx-auto mb-2 opacity-60" />
                        <span className="text-xs font-black">{blog.likes || 0}</span>
                    </div>
                    <div className="text-center text-white">
                        <MessageSquare className="w-5 h-5 mx-auto mb-2 opacity-60" />
                        <span className="text-xs font-black">0</span>
                    </div>
                </div>
              </div>

              {/* Content Area */}
              <div className="p-8 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden relative">
                        {blog.author.avatar ? (
                            <Image src={blog.author.avatar} alt={blog.author.name} fill className="object-cover" />
                        ) : (
                            <User className="w-5 h-5 text-slate-300 m-2.5" />
                        )}
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                          Author
                        </p>
                        <p className="text-xs font-bold text-slate-900 leading-none">
                          {blog.author.name}
                        </p>
                    </div>
                  </div>
                  {(blog.author.role === 'ADMIN' || blog.author.role === 'SUPERADMIN' || blog.author.role === 'SUPER_ADMIN') && (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#D4A017]/10 text-[#D4A017] rounded-xl">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span className="text-[8px] font-black uppercase tracking-widest">OFFICIAL</span>
                      </div>
                  )}
                </div>
                
                <h3 className="text-xl font-black text-slate-900 leading-tight mb-4 uppercase group-hover:text-[#D4A017] transition-colors line-clamp-2">{blog.title}</h3>
                <p className="text-slate-500 text-xs line-clamp-3 leading-relaxed mb-8 flex-1">{blog.excerpt}</p>

                <div className="mt-auto pt-8 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-300">
                       <Calendar className="w-4 h-4" /> {new Date(blog.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div className="flex gap-2">
                        {blog.status === 'pending_review' && (
                             <>
                                <button 
                                    onClick={(e) => { e.preventDefault(); handleUpdateStatus(blog.id, 'publish'); }}
                                    className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center"
                                    title="Approve & Publish"
                                >
                                    <Check className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={(e) => { e.preventDefault(); handleUpdateStatus(blog.id, 'reject', true); }}
                                    className="w-10 h-10 bg-red-50 text-red-600 rounded-2xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
                                    title="Reject with Strike"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                                <Link 
                                    href={`/admin/blogs/${blog.id}`}
                                    className="w-10 h-10 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center"
                                    title="Review Submission Layout"
                                >
                                    <LayoutTemplate className="w-4 h-4" />
                                </Link>
                             </>
                        )}
                        <Link 
                            href={`/admin/blogs/new?id=${blog.id}`}
                            className="w-10 h-10 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center"
                            title="Edit Post Completely"
                        >
                            <FileEdit className="w-4 h-4" />
                        </Link>
                        <Link 
                            href={`/blogs/${blog.slug}`}
                            target="_blank"
                            className="w-10 h-10 bg-slate-50 text-slate-400 rounded-2xl hover:bg-[#D4A017] hover:text-black transition-all flex items-center justify-center"
                        >
                            <ExternalLink className="w-4 h-4" />
                        </Link>
                        <button 
                            onClick={(e) => { e.preventDefault(); handleDeleteBlog(blog.id); }}
                            className="w-10 h-10 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
                            title="Delete Post"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm mx-4 sm:mx-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-150/80 bg-slate-50/50">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Article / Post</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Author</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Created Date</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Engagement</th>
                  <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBlogs.map((blog) => {
                  const isOfficial = blog.author.role === 'ADMIN' || blog.author.role === 'SUPERADMIN' || blog.author.role === 'SUPER_ADMIN' || blog.adminNote === 'SARTHI_OFFICIAL';
                  return (
                    <tr key={blog.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-10 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden relative shrink-0">
                            {blog.thumbnail ? (
                              <Image src={blog.thumbnail} alt={blog.title} fill className="object-cover" unoptimized={true} />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center opacity-10"><ImageIcon className="w-5 h-5" /></div>
                            )}
                          </div>
                          <div>
                            <Link href={`/blogs/${blog.slug}`} target="_blank" className="text-sm font-black text-slate-900 hover:text-[#D4A017] transition-colors leading-snug line-clamp-1 uppercase">
                              {blog.title}
                            </Link>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-[9px] font-extrabold text-[#D4A017] bg-[#D4A017]/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                {blog.category}
                              </span>
                              {isOfficial && (
                                <span className="text-[8px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                  OFFICIAL
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 overflow-hidden relative shrink-0">
                            {blog.author.avatar ? (
                              <Image src={blog.author.avatar} alt={blog.author.name} fill className="object-cover" />
                            ) : (
                              <User className="w-4 h-4 text-slate-300 m-2" />
                            )}
                          </div>
                          <span className="text-xs font-bold text-slate-800">{blog.author.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        {blog.status === 'published' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase tracking-wider rounded-full border border-emerald-100">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Live
                          </span>
                        ) : blog.status === 'pending_review' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-[9px] font-black uppercase tracking-wider rounded-full border border-amber-100">
                            Pending
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 text-[9px] font-black uppercase tracking-wider rounded-full border border-slate-200">
                            {blog.status}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-6">
                        <span className="text-xs font-bold text-slate-500">
                          {new Date(blog.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-4 text-slate-400">
                          <span className="flex items-center gap-1.5 text-xs font-bold" title="Views">
                            <Eye className="w-3.5 h-3.5 opacity-60" /> {blog.views || 0}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs font-bold" title="Likes">
                            <ThumbsUp className="w-3.5 h-3.5 opacity-60" /> {blog.likes || 0}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {blog.status === 'pending_review' && (
                            <>
                              <button 
                                onClick={() => handleUpdateStatus(blog.id, 'publish')}
                                className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center"
                                title="Approve & Publish"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => handleUpdateStatus(blog.id, 'reject', true)}
                                className="w-8 h-8 bg-red-50 text-red-600 rounded-xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
                                title="Reject with Strike"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                              <Link 
                                href={`/admin/blogs/${blog.id}`}
                                className="w-8 h-8 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center"
                                title="Review Submission Layout"
                              >
                                <LayoutTemplate className="w-3.5 h-3.5" />
                              </Link>
                            </>
                          )}
                          <Link 
                            href={`/admin/blogs/new?id=${blog.id}`}
                            className="w-8 h-8 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center"
                            title="Edit Post"
                          >
                            <FileEdit className="w-3.5 h-3.5" />
                          </Link>
                          <Link 
                            href={`/blogs/${blog.slug}`}
                            target="_blank"
                            className="w-8 h-8 bg-slate-50 text-slate-400 rounded-xl hover:bg-[#D4A017] hover:text-black transition-all flex items-center justify-center"
                            title="View Public Post"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          <button 
                            onClick={() => handleDeleteBlog(blog.id)}
                            className="w-8 h-8 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
                            title="Delete Post"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

