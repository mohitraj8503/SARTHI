'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Trophy, Clock, Star, Zap, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChallengesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState('');
  
  const currentCategory = searchParams.get('category') || 'All';

  const setCurrentCategory = useCallback((cat: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (cat === 'All') {
      params.delete('category');
    } else {
      params.set('category', cat);
    }
    router.push(`/challenges?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  const hackathons = useMemo(() => [
    {
      id: 'ai-ideathon',
      title: 'AI & Machine Learning Ideathon',
      desc: 'Pitch innovative AI solutions to industry experts. Ideal for future founders and developers. 100% FREE Registration.',
      category: 'Ideathons',
      badge: 'FEATURED',
      color: 'bg-blue-50 text-blue-700 border-blue-200/60',
      border: 'border-t-4 border-t-blue-500',
      image: '/images/ai-machine-learning-ideathon-thumbnail.png',
      href: '/challenges',
      cta: 'Register Now',
      duration: '24 Hours'
    },
    {
      id: 'kids-coding-olympiad',
      title: 'Kids National Coding Olympiad',
      desc: 'National level coding competition for students till 9 - 10 Class. Learn Scratch, Python & HTML, solve coding puzzles and win national honors. 100% FREE Registration.',
      category: 'Olympiads',
      badge: 'TILL 9 - 10 CLASS',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-250/60',
      border: 'border-t-4 border-t-emerald-500',
      image: '/images/kids-coding-olympiad-thumbnail.jpg',
      href: '/challenges',
      cta: 'Register Free Now',
      duration: 'Online Event'
    },
    {
      id: 'coding-olympiad',
      title: 'National Coding Olympiad',
      desc: 'National level coding competition. Test your algorithmic & problem-solving speed. Win certificates, placement recommendations and national honors. 100% FREE Registration.',
      category: 'Olympiads',
      badge: 'NATIONAL LEVEL',
      color: 'bg-amber-50 text-amber-700 border-amber-250/60',
      border: 'border-t-4 border-t-amber-500',
      image: '/images/national-coding-olympiad-thumbnail.jpg',
      href: '/challenges',
      cta: 'Register Free Now',
      duration: 'Online Event'
    }
  ], []);

  const filterTabs = useMemo(() => {
    const counts = new Map<string, number>();
    hackathons.forEach(h => {
      const cat = h.category;
      counts.set(cat, (counts.get(cat) || 0) + 1);
    });

    const distinct = Array.from(counts.keys()).sort();
    return [
      { label: 'All', value: 'All', count: hackathons.length },
      ...distinct.map(cat => ({
        label: cat,
        value: cat,
        count: counts.get(cat) || 0
      }))
    ];
  }, [hackathons]);

  const filteredHackathons = useMemo(() => {
    return hackathons.filter(h => {
      const matchSearch = !search || h.title.toLowerCase().includes(search.toLowerCase()) || 
                          h.desc.toLowerCase().includes(search.toLowerCase()) || 
                          h.category.toLowerCase().includes(search.toLowerCase());
      const matchCategory = currentCategory === 'All' || h.category === currentCategory;
      return matchSearch && matchCategory;
    });
  }, [hackathons, search, currentCategory]);

  return (
    <div className="induction-page-wrapper">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        
        .induction-page-wrapper {
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: linear-gradient(135deg, #FDFBF7 0%, #F8F5F0 100%);
          color: #1F2937;
          min-height: calc(100vh - 60px);
          position: relative;
        }

        .induction-orbs {
          position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden;
        }

        .induction-orb {
          position: absolute; border-radius: 50%; opacity: 0.08;
          animation: induction-float 20s infinite ease-in-out;
          transition: transform 0.1s ease-out;
        }

        .induction-orb-1 { width: 600px; height: 600px; background: #1B4332; top: -200px; right: -100px; }
        .induction-orb-2 { width: 400px; height: 400px; background: #40916C; bottom: -100px; left: -100px; }

        @keyframes induction-float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 30px) scale(0.9); }
        }

        .induction-shell {
          position: relative; z-index: 10;
          max-width: 1600px; margin: 0 auto;
          padding: 10rem 2rem 6rem;
        }

        .induction-hero { margin-bottom: 3rem; }

        .induction-badge {
          display: inline-flex; align-items: center; gap: 0.5rem;
          background: linear-gradient(135deg, rgba(27, 67, 50, 0.1) 0%, rgba(45, 106, 79, 0.1) 100%);
          color: #1B4332; padding: 0.625rem 1.25rem; border-radius: 50px;
          font-size: 0.875rem; font-weight: 600; margin-bottom: 1.5rem; letter-spacing: 0.5px;
        }

        .induction-title {
          font-size: clamp(2.5rem, 5vw, 4rem); font-weight: 800; color: #1B4332;
          line-height: 1.1; margin-bottom: 1.5rem; letter-spacing: -1px;
        }

        .induction-subtitle {
          font-size: 1.25rem; color: #6B7280; max-width: 650px; line-height: 1.7;
        }

        .induction-controls {
          display: flex; flex-wrap: wrap; align-items: center; gap: 2rem;
          margin-bottom: 4rem;
        }

        .search-container { position: relative; flex: 1; min-width: 300px; }

        .search-input {
          width: 100%; padding: 1.25rem 1.5rem 1.25rem 3.5rem;
          border: 2px solid #E5E7EB; border-radius: 16px;
          font-size: 1rem; font-family: inherit; background: white;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
        }

        .search-input:focus {
          outline: none; border-color: #40916C;
          box-shadow: 0 0 0 4px rgba(64, 145, 108, 0.1), 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .search-icon { position: absolute; left: 1.25rem; top: 50%; transform: translateY(-50%); color: #6B7280; }

        .filter-tabs {
          display: flex; gap: 0.75rem; overflow-x: auto; padding: 0.5rem;
          background: white; border-radius: 16px;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          scrollbar-width: none;
        }

        .filter-tab {
          border: none; background: transparent; color: #6B7280;
          padding: 0.875rem 1.75rem; border-radius: 12px;
          font-size: 0.95rem; font-weight: 600; cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex; align-items: center; gap: 0.5rem;
          white-space: nowrap;
        }

        .filter-tab:hover { background: #F8F5F0; color: #1B4332; }

        .filter-tab.is-active {
          background: #1B4332; color: white;
          box-shadow: 0 4px 12px rgba(27, 67, 50, 0.3);
        }

        .tab-count {
          display: inline-flex; align-items: center; justify-content: center;
          min-width: 1.5rem; height: 1.5rem; padding: 0 0.5rem;
          border-radius: 50px; background: rgba(255, 255, 255, 0.25);
          font-size: 0.75rem; font-weight: 700;
        }

        .filter-tab.is-active .tab-count { background: rgba(255, 255, 255, 0.2); }

        .induction-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
          gap: 2.5rem;
        }

        .opportunity-card {
          background: white;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 20px 50px rgba(27, 67, 50, 0.03);
          border: 1px solid rgba(229, 231, 235, 0.5);
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
        }

        .opportunity-card:hover {
          border-color: rgba(27, 67, 50, 0.2);
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(27, 67, 50, 0.06);
        }

        @media (max-width: 768px) {
          .induction-orb-1 { width: 250px; height: 250px; top: -50px; right: -50px; opacity: 0.04; }
          .induction-orb-2 { width: 200px; height: 200px; bottom: -50px; left: -50px; opacity: 0.04; }
          .induction-shell { padding: 8rem 1.5rem 4rem; }
          .induction-controls { flex-direction: column; align-items: stretch; }
          .induction-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="induction-orbs">
        <div className="induction-orb induction-orb-1"></div>
        <div className="induction-orb induction-orb-2"></div>
      </div>

      <div className="induction-shell">
        <section className="induction-hero">
          <div className="induction-badge">🏆 NATIONWIDE CHALLENGES</div>
          <h1 className="induction-title">Coding Challenges</h1>
          <p className="induction-subtitle">
            Compete, innovate and build production-grade projects. Join coding challenges, pitch ideas to panels, and unlock placements.
          </p>
        </section>

        <div className="induction-controls">
          <div className="search-container">
            <Search className="search-icon w-5 h-5" />
            <input 
              type="text" 
              className="search-input"
              placeholder="Search challenges..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-tabs">
            {filterTabs.map(tab => (
              <button
                key={tab.value}
                className={`filter-tab${currentCategory === tab.value ? ' is-active' : ''}`}
                onClick={() => setCurrentCategory(tab.value)}
              >
                {tab.label}
                <span className="tab-count">{tab.count}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="induction-grid">
          <AnimatePresence mode="popLayout">
            {filteredHackathons.length > 0 ? (
              filteredHackathons.map((item, index) => (
                <motion.article 
                  key={item.id} 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`opportunity-card flex flex-col relative group ${item.border}`}
                >
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                    />
                    {item.badge && (
                      <span className="absolute top-4 right-4 bg-emerald-600 text-white px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase shadow-sm">
                        {item.badge}
                      </span>
                    )}
                  </div>

                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${item.color}`}>
                        {item.category}
                      </span>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                        <Trophy className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                        <span className="text-slate-600">Open</span>
                      </div>
                    </div>

                    <h3 className="text-base font-black text-slate-900 tracking-tight leading-snug mb-2 group-hover:text-[#1B4332] transition-colors">
                      {item.title}
                    </h3>

                    <p className="text-xs text-slate-500 leading-relaxed mb-5 line-clamp-2">
                      {item.desc}
                    </p>

                    <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 mb-6 mt-auto">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                        <Zap size={12} className="text-[#1B4332]" />
                        <span className="font-black text-emerald-600 text-sm tracking-wide bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/50">FREE (₹0)</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold justify-end">
                        <Clock size={12} className="text-[#1B4332]/60" />
                        <span>{item.duration}</span>
                      </div>
                    </div>

                    <Link href={`/challenges/register?challenge=${item.id}`} className="block mt-auto">
                      <button className="w-full py-3 text-white bg-gradient-to-r from-[#1B4332] to-[#2D6A4F] hover:from-[#2D6A4F] hover:to-[#40916C] active:scale-[0.98] transition-all rounded-xl font-black uppercase text-[10px] tracking-widest shadow-md flex items-center justify-center gap-2 group/btn">
                        <span>Register Now</span>
                        <ArrowRight size={12} className="transition-transform duration-300 group-hover/btn:translate-x-1" />
                      </button>
                    </Link>
                  </div>
                </motion.article>
              ))
            ) : (
              <div className="col-span-full py-24 bg-white/40 backdrop-blur-sm rounded-[3rem] border border-white text-center">
                <Search className="w-12 h-12 text-[#1B4332]/20 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-[#1B4332]">No results found</h3>
                <p className="text-[#6B7280] mt-2">Try adjusting your filters or search query.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
