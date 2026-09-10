'use client';

import { MessageCircle, Search, Filter, Loader2, Plus, ArrowUp, Clock, MessageSquareDashed, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ForumPost } from '@/types/dashboard';

export default function TabQA({ data: propData }: { data?: any }) {
  const [search, setSearch] = useState('');
  
  const { data: fetchedData, isLoading } = useQuery<{ posts: ForumPost[] }>({
    queryKey: ['community_posts'],
    queryFn: async () => {
      const res = await fetch('/api/student/dashboard?tab=qa');
      if (!res.ok) throw new Error('Failed to fetch posts');
      return res.json();
    },
    enabled: !propData // Only fetch if not provided via props
  });

  const posts = propData?.posts || fetchedData?.posts || [];
  const filteredPosts = posts.filter((p: any) => 
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
        <div className="flex flex-col items-center justify-center py-40">
            <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground font-bold">Connecting to community...</p>
        </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div>
            <h1 className="text-[32px] font-extrabold text-foreground tracking-tight">Community QA</h1>
            <p className="text-muted-foreground text-sm font-medium mt-1">Get answers from experts and peers in the community.</p>
        </div>
        
        <Link href="/dashboard?tab=qa/new" className="h-11 px-6 bg-primary text-primary-foreground rounded-xl flex items-center gap-2 text-sm font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
           <Plus className="w-4 h-4" />
           Ask Question
        </Link>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
         <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
                type="text" 
                placeholder="Search discussions..." 
                className="w-full h-11 pl-11 pr-4 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-foreground"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
         </div>
         <button className="h-11 px-4 border border-border bg-card rounded-xl text-foreground hover:bg-muted flex items-center gap-2 text-sm font-bold shadow-sm transition-colors shrink-0">
            <Filter className="w-4 h-4" />
            Sort by: Latest
         </button>
      </div>

      {/* Post List */}
      <AnimatePresence mode="popLayout">
        {filteredPosts.length > 0 ? (
            <div className="space-y-4">
            {filteredPosts.map((post) => (
                <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    key={post.id} 
                    className="group bg-card border border-border rounded-2xl p-5 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/[0.02] transition-all cursor-pointer"
                >
                    <div className="flex gap-5">
                       {/* Vote Column */}
                       <div className="hidden sm:flex flex-col items-center gap-1 shrink-0">
                          <button className="p-1 hover:bg-primary/10 rounded text-muted-foreground hover:text-primary transition-colors">
                             <ArrowUp className="w-5 h-5" />
                          </button>
                          <span className="text-sm font-extrabold text-foreground">{post.votes}</span>
                       </div>
        
                       {/* Content Column */}
                       <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                             <span className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-[6px] uppercase tracking-wider">{post.category || 'Community'}</span>
                             <span className="text-[12px] font-medium text-muted-foreground flex items-center gap-1.5 ml-auto">
                                <Clock className="w-3.5 h-3.5" />
                                {post.time ? formatDistanceToNow(new Date(post.time), { addSuffix: true }) : 'Just now'}
                             </span>
                          </div>
                          <h3 className="text-[17px] font-bold text-foreground mb-3 leading-tight group-hover:text-primary transition-colors">{post.title}</h3>
                          
                          <div className="flex items-center justify-between">
                             <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-muted overflow-hidden relative border border-border flex items-center justify-center">
                                   {post.avatar ? (
                                      <Image src={post.avatar} alt={post.author} fill className="object-cover" />
                                   ) : (
                                      <span className="text-[10px] font-bold text-muted-foreground">
                                         {post.author?.[0] || 'A'}
                                      </span>
                                   )}
                                </div>
                                <span className="text-[13px] font-bold text-foreground">{post.author || 'Anonymous'}</span>
                             </div>
                             
                             <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5 text-muted-foreground group-hover:text-primary transition-colors">
                                   <MessageCircle className="w-4 h-4" />
                                   <span className="text-[13px] font-bold">{post.answers}</span>
                                </div>
                                <Link href={`/dashboard?tab=qa&post=${post.id}`} className="text-primary hover:underline text-sm font-medium flex items-center gap-1">
                                  View <ArrowRight className="w-3 h-3" />
                                </Link>
                             </div>
                          </div>
                       </div>
                    </div>
                </motion.div>
            ))}
            </div>
        ) : (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-24 text-center bg-card rounded-3xl border border-dashed border-border"
            >
                <div className="w-20 h-20 bg-muted rounded-3xl flex items-center justify-center mx-auto mb-6 text-muted-foreground rotate-6">
                    <MessageSquareDashed className="w-10 h-10" />
                </div>
                <h3 className="text-[22px] font-extrabold text-foreground mb-2">Silence is Computing...</h3>
                <p className="text-muted-foreground font-medium mb-10 max-w-sm mx-auto">No questions found matching your search. Be the first to start a conversation!</p>
                <button 
                onClick={() => setSearch('')}
                className="px-10 py-4 bg-primary text-primary-foreground text-[15px] font-extrabold rounded-2xl transition-all shadow-xl shadow-primary/20 hover:scale-105 active:scale-95"
                >
                Reset Search
                </button>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

