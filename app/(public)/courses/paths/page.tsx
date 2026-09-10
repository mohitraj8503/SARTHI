'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Zap, Clock, ShieldCheck, ArrowRight, Loader2, Sparkles, Check, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface Roadmap {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  duration: string;
  difficulty: number;
  projectsCount: number;
  salaryRange: string;
  bestFor: string;
  timeline: { name: string; unlocked: boolean }[];
  projects: string[];
  careers: string[];
  companies: string[];
  slug: string;
  icon: string;
}

const ROADMAPS: Roadmap[] = [
  {
    id: 'ai-engineer',
    title: 'AI Engineer',
    subtitle: 'Advanced AI & Data Science Roadmap',
    category: 'AI',
    duration: '38 Hours',
    difficulty: 3,
    projectsCount: 24,
    salaryRange: '₹6–18 LPA',
    bestFor: 'Class 9+ & College',
    timeline: [
      { name: 'Python Foundations', unlocked: true },
      { name: 'Data Analytics & SQL', unlocked: true },
      { name: 'Machine Learning Algorithms', unlocked: false },
      { name: 'Deep Learning & Neural Networks', unlocked: false },
      { name: 'Generative AI & LLM APIs', unlocked: false },
      { name: 'Capstone AI Project Deployment', unlocked: false }
    ],
    projects: ['AI Conversational Chatbot', 'Deep Learning Image Classifier', 'Predictive Housing Model', 'Neural Style Transfer App'],
    careers: ['AI Engineer', 'Machine Learning Developer', 'Data Scientist', 'Research Engineer'],
    companies: ['Google', 'Microsoft', 'Amazon', 'Meta'],
    slug: 'python-beginners',
    icon: '🤖'
  },
  {
    id: 'finance-tax',
    title: 'Finance & Tax Practitioner',
    subtitle: 'Certified GST & taxation filing path',
    category: 'Business',
    duration: '42 Hours',
    difficulty: 2,
    projectsCount: 15,
    salaryRange: '₹4–12 LPA',
    bestFor: 'Commerce & Professionals',
    timeline: [
      { name: 'Double-Entry Accounting Core', unlocked: true },
      { name: 'GST Law & Live Filing return', unlocked: true },
      { name: 'Income Tax Return E-filing', unlocked: false },
      { name: 'Advanced Audit Case Studies', unlocked: false },
      { name: 'Corporate Compliance reporting', unlocked: false }
    ],
    projects: ['Live GST Return Submission', 'ITR Computation Worksheets', 'Balance Sheet Analysis', 'Audit Compliance Checklists'],
    careers: ['Tax Consultant', 'GST Practitioner', 'Accountant', 'Finance Manager'],
    companies: ['Deloitte', 'EY', 'PwC', 'KPMG'],
    slug: 'gst-filing',
    icon: '💰'
  },
  {
    id: 'web-developer',
    title: 'Full Stack Web Developer',
    subtitle: 'Next-Gen Web Architecture Pipeline',
    category: 'Technology',
    duration: '55 Hours',
    difficulty: 3,
    projectsCount: 20,
    salaryRange: '₹5–15 LPA',
    bestFor: 'Class 10+ & Aspiring Devs',
    timeline: [
      { name: 'Semantic HTML5, CSS3 & JS Core', unlocked: true },
      { name: 'React & Next.js SSR Frameworks', unlocked: true },
      { name: 'Express APIs & Relational Databases', unlocked: false },
      { name: 'Docker Orchestration & AWS Clouds', unlocked: false },
      { name: 'Production Pipeline CI/CD', unlocked: false }
    ],
    projects: ['SaaS Analytics Dashboard', 'Real-time Chat App', 'E-commerce platform API', 'Dockerized Cloud Deployment'],
    careers: ['Frontend Developer', 'Backend Developer', 'Full Stack Engineer', 'DevOps Administrator'],
    companies: ['Stripe', 'Vercel', 'Notion', 'Framer'],
    slug: 'python-beginners',
    icon: '💻'
  }
];

export default function CareerRoadmapsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get('category') || 'All';
  const currentQuery = searchParams.get('q') || '';

  const [search, setSearch] = useState(currentQuery);
  const [loading, setLoading] = useState(false);

  // Standardized Parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const orbs = document.querySelectorAll('.induction-orb');
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;

      orbs.forEach((orb, index) => {
        const speed = (index + 1) * 20;
        const xOffset = (0.5 - x) * speed;
        const yOffset = (0.5 - y) * speed;
        (orb as HTMLElement).style.transform = `translate(${xOffset}px, ${yOffset}px)`;
      });
    };
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Search Sync
  useEffect(() => {
    setSearch(currentQuery);
  }, [currentQuery]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (search !== currentQuery) {
        const params = new URLSearchParams(searchParams.toString());
        if (search) params.set('q', search);
        else params.delete('q');
        router.push(`/courses/paths?${params.toString()}`, { scroll: false });
      }
    }, 400);
    return () => clearTimeout(t);
  }, [search, currentQuery, router, searchParams]);

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
    router.push(`/courses/paths?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  useEffect(() => {
    setLoading(false);
  }, [searchParams]);

  const filterTabs = [
    { label: '🎯 All Careers', value: 'All' },
    { label: '💻 Technology', value: 'Technology' },
    { label: '📈 Business', value: 'Business' },
    { label: '🤖 AI', value: 'AI' }
  ];

  const filteredRoadmaps = useMemo(() => {
    return ROADMAPS.filter(r => {
      const matchSearch = !currentQuery || 
        (r.title?.toLowerCase() || '').includes(currentQuery.toLowerCase()) || 
        (r.category?.toLowerCase() || '').includes(currentQuery.toLowerCase());
      const matchCategory = currentCategory === 'All' || r.category === currentCategory;
      return matchSearch && matchCategory;
    });
  }, [currentQuery, currentCategory]);

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
          padding: 8rem 2rem 6rem;
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

        .filter-tab.is-active { background: #1B4332; color: white; }

        .induction-grid {
          display: grid; grid-template-cols: repeat(auto-fill, minmax(420px, 1fr)); gap: 3rem;
        }
      `}</style>

      {/* Floating background orbs */}
      <div className="induction-orbs">
        <div className="induction-orb induction-orb-1" />
        <div className="induction-orb induction-orb-2" />
      </div>

      <div className="induction-shell">
        {/* Hero Section */}
        <section className="induction-hero text-left">
          <div className="induction-badge">
            <span>⚡</span>
            <span>CHOOSE YOUR FUTURE</span>
          </div>
          <h1 className="induction-title">Career Roadmaps</h1>
          <p className="induction-subtitle">
            Explore step-by-step roadmaps designed to take you from complete beginner to industry-ready professional. Includes 95+ projects, 15 tracks, and placement credentials.
          </p>
        </section>

        {/* Search & Filter Controls */}
        <div className="induction-controls">
          <div className="search-container">
            <Search className="search-icon w-5 h-5" />
            <input 
              type="text" 
              className="search-input"
              placeholder="What do you want to become?"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-tabs">
            {filterTabs.map(tab => (
              <button
                key={tab.value}
                className={`filter-tab${currentCategory === tab.value ? ' is-active' : ''}`}
                onClick={() => updateFilters({ category: tab.value })}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Roadmaps Grid */}
        <div className="induction-grid">
          {loading ? (
            <div className="col-span-full py-20 flex items-center justify-center">
              <Loader2 className="w-10 h-10 animate-spin text-[#1B4332]" />
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredRoadmaps.length > 0 ? (
                filteredRoadmaps.map((r, index) => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ 
                      duration: 0.8,
                      ease: [0.16, 1, 0.3, 1],
                      delay: (index % 2) * 0.1 
                    }}
                    layout
                    className="group bg-white rounded-[2.5rem] overflow-hidden shadow-[0_20px_60px_-15px_rgba(27,67,50,0.1)] hover:shadow-[0_30px_80px_-20px_rgba(27,67,50,0.2)] transition-all duration-500 border border-white flex flex-col h-full text-left"
                  >
                    <div className="p-6 md:p-8 lg:p-10 flex flex-col flex-1 justify-between gap-6">
                      
                      {/* Title & Metadata Specifications */}
                      <div>
                        <div className="flex items-center gap-4 mb-4">
                          <span className="text-4xl">{r.icon}</span>
                          <div>
                            <h3 className="text-xl font-extrabold text-[#1B4332] leading-tight">
                              {r.title}
                            </h3>
                            <span className="text-xs font-semibold text-gray-400 block mt-0.5">{r.subtitle}</span>
                          </div>
                        </div>

                        {/* Difficulty Specifications bar */}
                        <div className="grid grid-cols-3 gap-3 mb-6 bg-[#FCFBF8] border border-gray-100 p-4 rounded-2xl text-[11px] font-bold text-gray-500">
                          <div>
                            <span className="block text-[8px] font-black uppercase tracking-wider text-gray-400">Difficulty</span>
                            <span className="text-[#1B4332] font-black">{"★".repeat(r.difficulty)}{"☆".repeat(5-r.difficulty)}</span>
                          </div>
                          <div>
                            <span className="block text-[8px] font-black uppercase tracking-wider text-gray-400">Duration</span>
                            <span className="text-[#1B4332] font-black">{r.duration}</span>
                          </div>
                          <div>
                            <span className="block text-[8px] font-black uppercase tracking-wider text-gray-400">Projects</span>
                            <span className="text-[#1B4332] font-black">{r.projectsCount} Built</span>
                          </div>
                        </div>

                        {/* Roadmap Interactive Step Timeline Pipeline */}
                        <div className="space-y-2 mb-6 border-t border-b border-gray-100 py-6">
                          <span className="text-[9px] font-black uppercase text-gray-400 tracking-wider block mb-4">Guided Timeline Route:</span>
                          {r.timeline.map((step, sIdx) => (
                            <div key={step.name}>
                              <div className="flex items-center justify-between text-xs font-bold text-gray-700 bg-[#FCFBF8] p-3 border border-gray-50 rounded-xl">
                                <div className="flex items-center gap-2">
                                  {step.unlocked ? (
                                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[9px] font-black flex items-center justify-center shrink-0">✓</span>
                                  ) : (
                                    <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-400 text-[9px] font-black flex items-center justify-center shrink-0">{sIdx + 1}</span>
                                  )}
                                  <span className={step.unlocked ? "text-gray-800" : "text-gray-400"}>{step.name}</span>
                                </div>
                                {!step.unlocked && <Lock className="w-3.5 h-3.5 text-gray-300" />}
                              </div>
                              {sIdx < r.timeline.length - 1 && (
                                <div className="flex justify-start pl-5.5 py-0.5 text-gray-300">
                                  <span className="text-sm font-semibold">↓</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* You&apos;ll Build Projects Checklist */}
                        <div className="mb-6">
                          <span className="text-[9px] font-black uppercase text-gray-400 tracking-wider block mb-3">You&apos;ll Build:</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {r.projects.map(proj => (
                              <div key={proj} className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span className="truncate">{proj}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Opportunities */}
                        <div className="mb-6">
                          <span className="text-[9px] font-black uppercase text-gray-400 tracking-wider block mb-3">Career Opportunities:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {r.careers.map(job => (
                              <span key={job} className="text-[10px] font-black uppercase border border-gray-200 bg-white px-3 py-1 rounded-full text-gray-600">
                                {job}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Bottom row metrics */}
                      <div className="pt-4 border-t border-[#F3F4F6] flex items-center justify-between gap-4">
                        <div>
                          <span className="text-[8px] font-black uppercase text-gray-400 tracking-wider block">Salary Range</span>
                          <span className="text-base font-black text-[#1B4332]">{r.salaryRange}</span>
                          <span className="text-[8px] text-gray-400 block mt-0.5">Top: {r.companies.join(', ')}</span>
                        </div>
                        
                        <Link href={`/courses/${r.slug}`}>
                          <button 
                            onClick={() => triggerHaptic('medium')}
                            className="flex items-center justify-center gap-1.5 px-6 py-4 bg-[#1B4332] text-white font-bold rounded-xl text-[10px] uppercase tracking-widest hover:bg-[#2D6A4F] active:scale-95 transition-all shadow-lg shadow-[#1B4332]/20"
                          >
                            <span>Start Roadmap</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </Link>
                      </div>

                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-24 bg-white/40 backdrop-blur-sm rounded-[3rem] border border-white text-center">
                  <Search className="w-12 h-12 text-[#1B4332]/20 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-[#1B4332]">No results found</h3>
                  <p className="text-[#6B7280] mt-2">Try adjusting your filters or search query.</p>
                </div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
