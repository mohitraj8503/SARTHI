'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Zap, ArrowRight, Loader2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import InductionCard from './components/InductionCard';

import InternshipHero from '@/components/internship/InternshipHero';

export default function InductionClient({ 
  initialProgrammes = []
}: { 
  initialProgrammes?: any[]
}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const currentCategory = searchParams.get('category') || 'All';
    const currentSort = searchParams.get('sort') || 'newest';
    const currentQuery = searchParams.get('q') || '';
    
    const [search, setSearch] = useState(currentQuery);
    const [loading, setLoading] = useState(false);

    // 🧠 Standardized Parallax
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

    // 🧠 Search Sync
    useEffect(() => {
        setSearch(currentQuery);
    }, [currentQuery]);

    useEffect(() => {
        const t = setTimeout(() => {
            if (search !== currentQuery) {
                const params = new URLSearchParams(searchParams.toString());
                if (search) params.set('q', search);
                else params.delete('q');
                router.push(`/internship?${params.toString()}`, { scroll: false });
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
        router.push(`/internship?${params.toString()}`, { scroll: false });
    }, [router, searchParams]);

    useEffect(() => {
        setLoading(false);
    }, [initialProgrammes]);

    const filterTabs = useMemo(() => {
        const counts = new Map<string, number>();
        initialProgrammes.forEach(p => {
            const cat = p.category || 'Engineering';
            counts.set(cat, (counts.get(cat) || 0) + 1);
        });

        const distinct = Array.from(counts.keys()).sort();
        return [
            { label: 'All', value: 'All', count: initialProgrammes.length },
            ...distinct.map(cat => ({
                label: cat,
                value: cat,
                count: counts.get(cat) || 0
            }))
        ];
    }, [initialProgrammes]);

    const filteredProgrammes = useMemo(() => {
        let result = initialProgrammes.filter(p => {
            const matchSearch = !currentQuery || (p.title?.toLowerCase() || '').includes(currentQuery.toLowerCase()) || 
                               (p.category?.toLowerCase() || '').includes(currentQuery.toLowerCase());
            const matchCategory = currentCategory === 'All' || p.category === currentCategory;
            return matchSearch && matchCategory;
        });

        if (currentSort === 'newest') {
            result = [...result].sort((a, b) => b.id.localeCompare(a.id));
        }
        
        return result;
    }, [initialProgrammes, currentQuery, currentCategory, currentSort]);

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

                @media (max-width: 768px) {
                    .induction-orb-1 {
                        width: 250px;
                        height: 250px;
                        top: -50px;
                        right: -50px;
                        opacity: 0.04;
                    }
                    .induction-orb-2 {
                        width: 200px;
                        height: 200px;
                        bottom: -50px;
                        left: -50px;
                        opacity: 0.04;
                    }
                    .induction-shell { padding: 8rem 1.5rem 4rem; }
                    .induction-controls { flex-direction: column; align-items: stretch; }
                    .induction-grid { grid-template-columns: 1fr; }
                }
            `}</style>

            <div className="induction-orbs">
                <div className="induction-orb induction-orb-1"></div>
                <div className="induction-orb induction-orb-2"></div>
            </div>

            <InternshipHero onApplyClick={() => {
                const el = document.getElementById('internship-tracks');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
            }} />

            <div className="induction-shell" id="internship-tracks">
                <div className="induction-controls">
                    <div className="search-container">
                        <Search className="search-icon w-5 h-5" />
                        <input 
                            type="text" 
                            className="search-input"
                            placeholder="Search internship tracks..."
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
                                <span className="tab-count">{tab.count}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="induction-grid">
                    <AnimatePresence mode="popLayout">
                        {filteredProgrammes.length > 0 ? (
                            filteredProgrammes.map((p, i) => (
                                <InductionCard 
                                    key={p.id} 
                                    programme={p as any} 
                                    index={i} 
                                    onJoin={(p) => router.push(`/internship/${p.id}`)} 
                                />
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

                {/* Comprehensive Types of Internships Offered Section */}
                <motion.div 
                   initial={{ opacity: 0, y: 30 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   className="mt-24 space-y-16"
                >
                    <div className="text-center max-w-3xl mx-auto space-y-4">
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#1B4332]/10 rounded-full text-xs font-bold text-[#1B4332] uppercase tracking-wider">
                            Explore All Pathways
                        </span>
                        <h2 className="text-3xl md:text-5xl font-extrabold text-[#1B4332] tracking-tight">
                            Types of Internships We Offer
                        </h2>
                        <p className="text-[#6B7280] text-base md:text-lg leading-relaxed">
                            Whether you belong to an engineering stream or non-tech background (BBA, B.Com, BA, MBA), SARTHI provides tailored 4-month industry-grade internships.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Track 1: Software & Web Development */}
                        <div className="bg-white p-8 rounded-3xl border border-[#E5E7EB] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
                            <div className="space-y-4">
                                <div className="w-14 h-14 rounded-2xl bg-[#1B4332]/10 flex items-center justify-center text-[#1B4332] font-black text-xl">
                                    💻
                                </div>
                                <h3 className="text-xl font-extrabold text-[#1A3C2E]">Software & Full Stack Engineering</h3>
                                <p className="text-sm text-[#6B7280] leading-relaxed">
                                    Build scalable production applications with React, Next.js, Node.js, Python, and PostgreSQL. Learn Git collaboration, code reviews, and cloud deployment.
                                </p>
                            </div>
                            <div className="pt-6 mt-6 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-[#16A34A]">
                                <span>Tech Track</span>
                                <span>3 Months • Mentored</span>
                            </div>
                        </div>

                        {/* Track 2: AI, Data & Automation */}
                        <div className="bg-white p-8 rounded-3xl border border-[#E5E7EB] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
                            <div className="space-y-4">
                                <div className="w-14 h-14 rounded-2xl bg-[#3B82F6]/10 flex items-center justify-center text-[#3B82F6] font-black text-xl">
                                    🤖
                                </div>
                                <h3 className="text-xl font-extrabold text-[#1A3C2E]">AI, Machine Learning & Computer Vision</h3>
                                <p className="text-sm text-[#6B7280] leading-relaxed">
                                    Work on real-time face detection, object tracking, NLP algorithms, and IoT automation systems. Hands-on OpenCV, PyTorch, and model deployment pipelines.
                                </p>
                            </div>
                            <div className="pt-6 mt-6 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-[#3B82F6]">
                                <span>Tech Track</span>
                                <span>3 Months • Mentored</span>
                            </div>
                        </div>

                        {/* Track 3: Digital Marketing & Reels Production */}
                        <div className="bg-white p-8 rounded-3xl border border-[#E5E7EB] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
                            <div className="space-y-4">
                                <div className="w-14 h-14 rounded-2xl bg-[#F59E0B]/10 flex items-center justify-center text-[#F59E0B] font-black text-xl">
                                    🎬
                                </div>
                                <h3 className="text-xl font-extrabold text-[#1A3C2E]">Digital Marketing & Video Production</h3>
                                <p className="text-sm text-[#6B7280] leading-relaxed">
                                    Designed for BBA, BA, B.Com & MBA students. Learn short-form video editing, Instagram Reels strategy, brand storytelling, and performance ad campaigns.
                                </p>
                            </div>
                            <div className="pt-6 mt-6 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-[#F59E0B]">
                                <span>Non-Tech Track</span>
                                <span>3 Months • Hands-on</span>
                            </div>
                        </div>

                        {/* Track 4: Tech Blogging & Content Marketing */}
                        <div className="bg-white p-8 rounded-3xl border border-[#E5E7EB] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
                            <div className="space-y-4">
                                <div className="w-14 h-14 rounded-2xl bg-[#8B5CF6]/10 flex items-center justify-center text-[#8B5CF6] font-black text-xl">
                                    ✍️
                                </div>
                                <h3 className="text-xl font-extrabold text-[#1A3C2E]">Technical Blogging & SEO Strategy</h3>
                                <p className="text-sm text-[#6B7280] leading-relaxed">
                                    Write high-ranking technical articles, product documentation, and industry case studies. Master keyword research, SEO optimization, and editorial workflows.
                                </p>
                            </div>
                            <div className="pt-6 mt-6 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-[#8B5CF6]">
                                <span>Content Track</span>
                                <span>3 Months • Flexible</span>
                            </div>
                        </div>

                        {/* Track 5: Product Design & UI/UX */}
                        <div className="bg-white p-8 rounded-3xl border border-[#E5E7EB] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
                            <div className="space-y-4">
                                <div className="w-14 h-14 rounded-2xl bg-[#EC4899]/10 flex items-center justify-center text-[#EC4899] font-black text-xl">
                                    🎨
                                </div>
                                <h3 className="text-xl font-extrabold text-[#1A3C2E]">UI/UX & Product Design</h3>
                                <p className="text-sm text-[#6B7280] leading-relaxed">
                                    Design intuitive mobile and web interfaces using Figma. Conduct user research, build interactive wireframes, and create design systems for real products.
                                </p>
                            </div>
                            <div className="pt-6 mt-6 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-[#EC4899]">
                                <span>Design Track</span>
                                <span>3 Months • Portfolio</span>
                            </div>
                        </div>

                        {/* Track 6: Industrial Automation & Robotics */}
                        <div className="bg-white p-8 rounded-3xl border border-[#E5E7EB] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
                            <div className="space-y-4">
                                <div className="w-14 h-14 rounded-2xl bg-[#10B981]/10 flex items-center justify-center text-[#10B981] font-black text-xl">
                                    ⚙️
                                </div>
                                <h3 className="text-xl font-extrabold text-[#1A3C2E]">Industrial Automation & PLC</h3>
                                <p className="text-sm text-[#6B7280] leading-relaxed">
                                    For Electrical, Electronics, and Mechanical streams. Learn real PLC programming, SCADA integration, sensor interfacing, and industrial IoT protocols.
                                </p>
                            </div>
                            <div className="pt-6 mt-6 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-[#10B981]">
                                <span>Core Tech Track</span>
                                <span>3 Months • Practical</span>
                            </div>
                        </div>

                        {/* Track 7: Research & Development (R&D) */}
                        <div className="bg-white p-8 rounded-3xl border border-[#E5E7EB] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
                            <div className="space-y-4">
                                <div className="w-14 h-14 rounded-2xl bg-[#6366F1]/10 flex items-center justify-center text-[#6366F1] font-black text-xl">
                                    🔬
                                </div>
                                <h3 className="text-xl font-extrabold text-[#1A3C2E]">Research & Development (R&D)</h3>
                                <p className="text-sm text-[#6B7280] leading-relaxed">
                                    Work on novel algorithms, technological prototyping, experimental system architectures, and technical publication research alongside senior engineers.
                                </p>
                            </div>
                            <div className="pt-6 mt-6 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-[#6366F1]">
                                <span>R&D Track</span>
                                <span>3 Months • Innovation</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
