'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import BlogCard from '@/components/blogs/BlogCard';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, ArrowRight, TrendingUp, Loader2, Award, ChevronDown, BookOpen
} from 'lucide-react';

export default function BlogsClient({ 
  initialBlogs = [], 
  initialTotal = 0,
  featured = null,
  user = null,
  title = "Insights for the Modern Architect.",
  subtitle = "Deep technical explorations, architectural breakdowns, and perspectives on the future of production engineering.",
  badgeText = "SARTHI Archive",
  hideFeatured = false
}: { 
  initialBlogs?: any[], 
  initialTotal?: number,
  featured?: any,
  user?: any,
  title?: string,
  subtitle?: string,
  badgeText?: string,
  hideFeatured?: boolean
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  const currentCategory = searchParams.get('category') || 'All';
  const currentQuery = searchParams.get('q') || '';
  const currentPage = parseInt(searchParams.get('page') || '1');

  const [blogs, setBlogs] = useState<any[]>(initialBlogs);
  const [featuredImageError, setFeaturedImageError] = useState(false);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState(currentQuery);

  const [activeTab, setActiveTab] = useState('All');

  // Synchronize activeTab state with route on mount or pathname change
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    const catParam = params.get('category');
    
    if (pathname.includes('/trending') || tabParam === 'trending') {
      setActiveTab('Trending');
    } else if (pathname.includes('/news') || tabParam === 'tech-news') {
      setActiveTab('Tech News');
    } else if (pathname.includes('/success-stories') || tabParam === 'success-stories') {
      setActiveTab('Success Stories');
    } else if (catParam) {
      setActiveTab(catParam);
    } else {
      setActiveTab('All');
    }
  }, [pathname]);

  const tabList = useMemo(() => {
    return [
      { name: 'All', type: 'category', categoryName: 'All' },
      { name: 'Tech', type: 'category', categoryName: 'Tech' },
      { name: 'Tech News', type: 'category', categoryName: 'Tech News' },
      { name: 'Official Product', type: 'category', categoryName: 'Official Product' },
      { name: 'Success Stories', type: 'category', categoryName: 'Success Stories' },
      { name: 'Trending', type: 'category', categoryName: 'Trending' }
    ];
  }, []);

  const isTabActive = (tab: any) => {
    return activeTab === tab.name;
  };

  const handleTabClick = (tab: any) => {
    setActiveTab(tab.name);
    
    // Smoothly update URL using pushState to keep it snappy and instantaneous (0ms reload)
    const url = new URL(window.location.href);
    url.pathname = '/blogs';
    url.searchParams.delete('tab');
    if (tab.name === 'All') {
      url.searchParams.delete('category');
    } else {
      url.searchParams.set('category', tab.name);
    }
    window.history.pushState({}, '', url.toString());
  };

  const visibleBlogs = useMemo(() => {
    let list = [...blogs];
    
    // 1. Filter by category
    if (activeTab === 'Tech News') {
      list = list.filter(b => b.category === 'Tech News' || b.category === 'News');
    } else if (activeTab === 'Success Stories') {
      list = list.filter(b => b.category === 'Success Stories');
    } else if (activeTab !== 'All' && activeTab !== 'Trending') {
      list = list.filter(b => b.category === activeTab);
    }
    
    // 2. Filter by search query
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(b => 
        b.title.toLowerCase().includes(q) || 
        b.excerpt.toLowerCase().includes(q) || 
        b.tags.some((t: string) => t.toLowerCase().includes(q))
      );
    }
    
    // 3. Sort
    if (activeTab === 'Trending') {
      list.sort((a, b) => (b.views || 0) - (a.views || 0) || (b.likes || 0) - (a.likes || 0));
    } else {
      list.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    }
    
    return list;
  }, [blogs, activeTab, search]);

  const dynamicHeader = useMemo(() => {
    switch (activeTab) {
      case 'Trending':
        return {
          title: "Trending Insights",
          subtitle: "Explore the most read, liked, and discussed articles written by engineers and student builders.",
          badgeText: "Hot & Popular",
          hideFeatured: true
        };
      case 'Tech News':
        return {
          title: "Tech News Hub",
          subtitle: "Get live broadcasts on programming frameworks, core software infrastructure updates, and AI breakthroughs.",
          badgeText: "Tech & Code Broadcast",
          hideFeatured: true
        };
      case 'Success Stories':
        return {
          title: "Student Spotlight & Success Stories",
          subtitle: "Read about real career transitions, building foundations, and placements of SARTHI learners.",
          badgeText: "Community Milestones",
          hideFeatured: true
        };
      case 'All':
      default:
        return {
          title: title,
          subtitle: subtitle,
          badgeText: badgeText,
          hideFeatured: hideFeatured
        };
    }
  }, [activeTab, title, subtitle, badgeText, hideFeatured]);



  // Access Request State
  const [requestEmail, setRequestEmail] = useState(user?.email || '');
  const [requestStatus, setRequestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [requestMessage, setRequestMessage] = useState('');

  useEffect(() => {
    if (user?.email && !requestEmail) {
      setRequestEmail(user.email);
    }
  }, [user, requestEmail]);

  const handleAccessRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login?callbackUrl=/blogs');
      return;
    }

    setRequestStatus('loading');
    try {
      const res = await fetch('/api/blog-access-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: requestEmail }),
      });
      const data = await res.json();
      
      if (res.ok) {
        setRequestStatus('success');
        setRequestMessage(data.message);
      } else {
        setRequestStatus('error');
        setRequestMessage(data.error);
      }
    } catch (e) {
      setRequestStatus('error');
      setRequestMessage('Something went wrong. Please try again.');
    }
  };

  useEffect(() => {
    setBlogs(initialBlogs);
    setLoading(false);
  }, [initialBlogs]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/blogs/categories');
        const data = await res.json();
        if (Array.isArray(data)) setCategories(['All', ...data.filter(c => c !== 'All')]);
      } catch (e) {
        console.error('Failed to fetch blog categories');
      }
    }
    fetchCategories();
  }, []);

  const updateFilters = useCallback((updates: Record<string, string | null>) => {
    setLoading(true);
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === 'All' || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    
    if (!updates.page) params.delete('page');
    router.push(`/blogs?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ q: search });
  };

  const handleLoadMore = async () => {
    setLoadingMore(true);
    const nextPage = currentPage + 1;
    try {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', nextPage.toString());
      const res = await fetch(`/api/blogs?${params.toString()}`);
      const data = await res.json();
      if (data.blogs) {
        setBlogs(prev => [...prev, ...data.blogs]);
        const newUrl = window.location.pathname + '?' + params.toString();
        window.history.pushState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
      }
    } catch (e) {
      console.error('Failed to load more blogs');
    } finally {
      setLoadingMore(false);
    }
  };

  const hasMore = blogs.length < initialTotal;

  return (
    <div className="blogs-page-wrapper">
        <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
            
            .blogs-page-wrapper {
                font-family: 'Plus Jakarta Sans', sans-serif;
                background-color: #FDFBF7;
                color: #1F2937;
                min-height: 100vh;
                position: relative;
                overflow-x: hidden;
            }

            .blogs-orbs { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
            .blogs-orb {
                position: absolute; border-radius: 50%; opacity: 0.08;
                animation: blogs-orb-drift 20s infinite ease-in-out;
            }
            .orb-1 { width: 600px; height: 600px; background: #1B4332; top: -100px; right: -100px; }
            .orb-2 { width: 500px; height: 500px; background: #40916C; bottom: -100px; left: -100px; }

            @keyframes blogs-orb-drift {
                0%, 100% { transform: translate(0, 0) scale(1); }
                33% { transform: translate(30px, -50px) scale(1.05); }
                66% { transform: translate(-20px, 30px) scale(0.95); }
            }

            .blogs-shell {
                position: relative; z-index: 10;
                max-width: 1600px; margin: 0 auto;
                padding: 10rem 2rem 6rem;
            }

            .hero-badge {
                display: inline-flex; align-items: center; gap: 0.625rem;
                padding: 0.75rem 1.25rem; background: rgba(27, 67, 50, 0.08);
                color: #1B4332; border-radius: 50px; font-weight: 700;
                font-size: 0.85rem; letter-spacing: 0.5px; margin-bottom: 2rem;
                text-transform: uppercase;
            }

            .hero-title {
                font-size: clamp(2.5rem, 5vw, 4rem); font-weight: 800;
                color: #1B4332; line-height: 1.1; letter-spacing: -1px;
                margin-bottom: 1.5rem;
            }

            .hero-subtitle {
                font-size: 1.2rem; color: #6B7280; max-width: 600px;
                line-height: 1.6; margin-bottom: 4rem; opacity: 0.9;
            }

            .controls-container {
                display: flex; flex-direction: column; gap: 2rem; margin-bottom: 4rem;
            }

            /* Standardized Pills */
            .pills-container {
                display: flex; gap: 0.75rem; overflow-x: auto; padding-bottom: 0.5rem;
                scrollbar-width: none;
            }
            .pills-container::-webkit-scrollbar { display: none; }
            
            .pill {
                padding: 0.875rem 1.5rem; border-radius: 14px;
                border: 2px solid #E5E7EB; background: white;
                color: #6B7280; font-weight: 700; font-size: 0.9rem;
                cursor: pointer; transition: all 0.3s ease;
                white-space: nowrap; display: flex; align-items: center; gap: 0.5rem;
            }
            .pill:hover { border-color: #1B4332; color: #1B4332; }
            .pill.is-active {
                background: #1B4332; border-color: #1B4332; color: white;
                box-shadow: 0 8px 20px rgba(27, 67, 50, 0.2);
            }

            .search-row {
                background: white; border: 2px solid #E5E7EB;
                border-radius: 20px; padding: 6px 6px 6px 24px;
                display: flex; align-items: center; gap: 1rem;
                box-shadow: 0 4px 15px rgba(0,0,0,0.02);
                transition: all 0.3s ease;
            }
            .search-row:focus-within { border-color: #1B4332; box-shadow: 0 10px 30px rgba(27, 67, 50, 0.08); }
            
            .search-input {
                flex: 1; border: none; outline: none; font-size: 1.1rem;
                font-family: inherit; color: #374151; font-weight: 500;
            }
            .search-btn {
                background: #1B4332; color: white; padding: 1rem 2.5rem;
                border: none; border-radius: 16px; font-weight: 800;
                text-transform: uppercase; letter-spacing: 1px; font-size: 0.8rem;
                cursor: pointer; transition: all 0.2s ease;
            }
            .search-btn:hover { background: #2D6A4F; transform: translateY(-1px); }

            .blogs-grid {
                display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
                gap: 2.5rem; position: relative; z-index: 10;
            }

                @media (max-width: 640px) {
                    .orb-1 {
                        width: 250px;
                        height: 250px;
                        top: -50px;
                        right: -50px;
                        opacity: 0.04;
                    }
                    .orb-2 {
                        width: 200px;
                        height: 200px;
                        bottom: -50px;
                        left: -50px;
                        opacity: 0.04;
                    }
                    .blogs-grid { grid-template-columns: 1fr; }
                    .blogs-shell { padding: 8rem 1.5rem 4rem; }
                }

                .featured-card {
                    display: grid;
                    grid-template-columns: 1.2fr 1fr;
                    background: white;
                    border-radius: 40px;
                    overflow: hidden;
                    border: 1px solid white;
                    box-shadow: 0 40px 100px -20px rgba(27,67,50,0.15);
                    margin-bottom: 6rem;
                    position: relative;
                }
                
                @media (max-width: 1024px) {
                    .featured-card { grid-template-columns: 1fr; }
                }

                .featured-image-box {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    overflow: hidden;
                }
                
                @media (max-width: 1024px) {
                    .featured-image-box {
                        aspect-ratio: 16/10;
                        height: auto;
                    }
                }

                .featured-content {
                    padding: 4rem;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    background: linear-gradient(135deg, #FFFFFF 0%, #F9F8F6 100%);
                }

                @media (max-width: 640px) {
                    .featured-content { padding: 2rem; }
                }
            `}</style>

        <div className="blogs-orbs">
            <div className="blogs-orb orb-1"></div>
            <div className="blogs-orb orb-2"></div>
        </div>

        <main className="blogs-shell">
            <header className="hero-header">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="hero-badge">
                        <TrendingUp className="w-4 h-4" /> 
                        <span>{dynamicHeader.badgeText}</span>
                    </div>
                    <h1 className="hero-title">{dynamicHeader.title}</h1>
                    <p className="hero-subtitle">
                        {dynamicHeader.subtitle}
                    </p>
                </motion.div>
            </header>

            {!dynamicHeader.hideFeatured && featured && currentCategory === 'All' && !currentQuery && currentPage === 1 && (
                <motion.section 
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="featured-card group"
                >
                    <div className="featured-image-box">
                        {featured.thumbnail && !featuredImageError ? (
                            <Image 
                                src={featured.thumbnail} 
                                alt={featured.title} 
                                fill 
                                className="object-cover" 
                                onError={() => setFeaturedImageError(true)}
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[#1B4332] to-[#0B1E15] flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
                                <div className="absolute w-64 h-64 rounded-full bg-white/5 -top-20 -left-20 pointer-events-none" />
                                <div className="absolute w-80 h-80 rounded-full bg-white/5 -bottom-20 -right-20 pointer-events-none" />
                                <BookOpen className="w-20 h-20 text-emerald-400/20 mb-6 relative z-10" />
                                <span className="text-xs font-black uppercase tracking-[0.3em] text-emerald-400/60 relative z-10 mb-2">{featured.category}</span>
                                <p className="text-sm font-semibold text-white/40 max-w-xs relative z-10">Production Telemetry Archives</p>
                            </div>
                        )}
                        <div className="absolute top-8 left-8 z-20">
                             <div className="px-6 py-2 bg-[#1B4332]/80 backdrop-blur-md text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl flex items-center gap-2 border border-white/10">
                                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Spotlight
                             </div>
                        </div>
                    </div>
                    <div className="featured-content">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em]">{featured.category}</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{featured.readTime} MIN READ</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black text-[#1B4332] leading-[1.1] tracking-tight uppercase italic mb-6">
                            {featured.title}
                        </h2>
                        <p className="text-lg text-slate-500 font-medium leading-relaxed mb-10 line-clamp-3 italic opacity-80">
                            &quot;{featured.excerpt}&quot;
                        </p>
                        <div className="flex flex-wrap items-center gap-8">
                            <Link 
                                href={`/blogs/${featured.slug}`}
                                className="px-10 py-5 bg-[#1B4332] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#2D6A4F] transition-all shadow-xl shadow-[#1B4332]/20 flex items-center gap-3 active:scale-95"
                            >
                                Read Full Insight <ArrowRight className="w-4 h-4" />
                            </Link>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden relative border border-white shadow-sm">
                                    {featured.author?.avatar ? (
                                        <Image src={featured.author.avatar} alt={featured.author?.name || 'Author'} fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-[#1B4332] text-white flex items-center justify-center text-[10px] font-black uppercase">
                                            {featured.author?.name?.[0] || 'T'}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Author</p>
                                    <p className="text-sm font-black text-[#1B4332] uppercase tracking-tighter flex items-center gap-1">
                                        {featured.author?.name || 'SARTHI Expert'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.section>
            )}

            <div className="controls-container">
                <div className="pills-container">
                    {tabList.map((tab) => (
                        <button
                            key={tab.name}
                            onClick={() => handleTabClick(tab)}
                            className={`pill ${isTabActive(tab) ? 'is-active' : ''}`}
                        >
                            {tab.name}
                        </button>
                    ))}
                </div>

                <form className="search-row" onSubmit={handleSearch}>
                    <Search className="w-6 h-6 text-[#9CA3AF]" />
                    <input 
                        type="text" 
                        value={search}
                        placeholder="Search articles, topics, tech stacks..."
                        onChange={(e) => setSearch(e.target.value)}
                        className="search-input"
                    />
                    <button type="submit" className="search-btn">Discover</button>
                </form>
            </div>

             <section className="blogs-grid">
                <AnimatePresence mode="popLayout">
                    {visibleBlogs
                      .filter(blog => featured?.id !== blog.id || currentQuery || currentCategory !== 'All')
                      .map((blog, index) => (
                        <motion.div
                            key={blog.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: (index % 3) * 0.1 }}
                        >
                            <BlogCard blog={blog} index={index} />
                        </motion.div>
                    ))}
                </AnimatePresence>

                {loading && (
                    <div className="col-span-full py-24 flex flex-col items-center justify-center">
                        <Loader2 className="w-12 h-12 animate-spin text-[#1B4332] mb-4" />
                        <span className="text-[#1B4332] font-black uppercase text-[10px] tracking-widest">Archive Sync...</span>
                    </div>
                )}
            </section>

            {!loading && visibleBlogs.length === 0 && (
                <div className="text-center py-32 bg-white/40 backdrop-blur-xl rounded-[40px] border border-white">
                    <div className="text-6xl mb-6 opacity-20">✍️</div>
                    <h3 className="text-3xl font-black text-[#1B4332]">Signal Lost.</h3>
                    <p className="text-[#6B7280] mt-3 max-w-md mx-auto text-lg leading-relaxed">No articles match your current frequency. Try resetting your filters.</p>
                    <button 
                        onClick={() => { setSearch(''); updateFilters({ category: 'All', q: '', page: null }); }}
                        className="mt-10 px-10 py-4 bg-[#1B4332] text-white font-black rounded-2xl shadow-xl hover:bg-[#2D6A4F] transition-all transform active:scale-95 uppercase tracking-widest text-[0.7rem]"
                    >
                        Reset Waveform
                    </button>
                </div>
            )}

            {hasMore && (
                <div className="mt-20 flex justify-center pb-20">
                    <button
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        className="group flex items-center gap-4 bg-[#1B4332] text-white px-12 py-6 rounded-2xl font-black text-[0.9rem] uppercase tracking-widest hover:bg-[#2D6A4F] transition-all shadow-2xl disabled:opacity-50 active:scale-95"
                    >
                        {loadingMore ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Sync More Insights'}
                        {!loadingMore && <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />}
                    </button>
                </div>
            )}
        </main>
    </div>
  );
}

