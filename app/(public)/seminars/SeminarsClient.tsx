'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
    Search, Calendar, PlayCircle, ArrowRight, Award, Plus, 
    Clock, CheckCircle2, Filter, ChevronDown, Loader2, X, Send, Sparkles 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SeminarCard from "@/components/seminars/SeminarCard";
import { cn } from '@/lib/utils';
import Link from 'next/link';

const CATEGORY_TABS = [
  { id: 'All', label: 'All', icon: '📚' },
  { id: 'Technology', label: 'Technology', icon: '💻' },
  { id: 'Artificial Intelligence', label: 'Artificial Intelligence', icon: '✨' },
  { id: 'Commerce & Management', label: 'Commerce & Management', icon: '💼' },
  { id: 'Personal Development', label: 'Personal Development', icon: '🌱' },
];

interface EventType {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    isLive: boolean;
    date: string | null;
    thumbnailUrl: string | null;
    speakerName: string | null;
    category: string | null;
    price: number | null;
    level: string | null;
    type: 'seminar' | 'workshop';
    youtubeBroadcastId?: string | null;
}

interface SeminarsPageProps {
    initialEvents: EventType[];
    currentLive: { videoId: string | null; title: string | null; thumbnail: string | null };
}

export default function SeminarsPageClient({ initialEvents = [], currentLive }: SeminarsPageProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const currentCategory = searchParams.get('category') || 'All';
    const currentType = searchParams.get('type') || 'All';
    const currentQuery = searchParams.get('q') || '';
    
    const [search, setSearch] = useState(currentQuery);
    const [loading, setLoading] = useState(false);

    const [showSpeakerModal, setShowSpeakerModal] = useState(false);
    const [submittingSpeaker, setSubmittingSpeaker] = useState(false);
    const [speakerSuccess, setSpeakerSuccess] = useState(false);
    const [speakerError, setSpeakerError] = useState('');
    const [speakerForm, setSpeakerForm] = useState({
        fullName: '',
        email: '',
        phone: '',
        linkedinUrl: '',
        title: '',
        topic: '',
        description: '',
        proposedAt: '',
        proposedDuration: '60 minutes',
        targetAudience: 'All Students',
    });

    const handleSpeakerSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmittingSpeaker(true);
        setSpeakerError('');
        try {
            const res = await fetch('/api/public/seminar-apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(speakerForm)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to submit proposal');
            
            setSpeakerSuccess(true);
            setSpeakerForm({
                fullName: '',
                email: '',
                phone: '',
                linkedinUrl: '',
                title: '',
                topic: '',
                description: '',
                proposedAt: '',
                proposedDuration: '60 minutes',
                targetAudience: 'All Students',
            });
        } catch (err: any) {
            setSpeakerError(err.message || 'Something went wrong');
        } finally {
            setSubmittingSpeaker(false);
        }
    };

    // 🧠 Standardized Parallax
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const orbs = document.querySelectorAll('.seminar-orb');
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
                router.push(`/seminars?${params.toString()}`, { scroll: false });
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
        router.push(`/seminars?${params.toString()}`, { scroll: false });
    }, [router, searchParams]);

    useEffect(() => {
        setLoading(false);
    }, [initialEvents]);

    // 🧠 Calculate type counts for standardize tabs
    const filterTabs = useMemo(() => {
        const counts = { all: initialEvents.length, seminar: 0, workshop: 0 };
        initialEvents.forEach(e => {
            if (e.type === 'seminar') counts.seminar++;
            if (e.type === 'workshop') counts.workshop++;
        });

        return [
            { label: 'All', value: 'All', count: counts.all },
            { label: 'Seminars', value: 'Seminar', count: counts.seminar },
            { label: 'Workshops', value: 'Workshop', count: counts.workshop }
        ];
    }, [initialEvents]);

    const filtered = useMemo(() => {
        return initialEvents.filter((s: EventType) => {
            const matchSearch = !currentQuery || s.title.toLowerCase().includes(currentQuery.toLowerCase()) || 
                                (s.description?.toLowerCase() || '').includes(currentQuery.toLowerCase());
            const matchType = currentType === 'All' || s.type === currentType.toLowerCase();
            
            let matchCategory = true;
            if (currentCategory !== 'All') {
                const titleLower = (s.title || '').toLowerCase();
                const catLower = (s.category || '').toLowerCase();
                
                if (currentCategory === 'Technology') {
                    const isTech = catLower.includes('development') || catLower.includes('databases') || catLower.includes('technology');
                    const isAi = titleLower.includes('ai') || titleLower.includes('chatgpt') || titleLower.includes('prompt') || titleLower.includes('generative');
                    matchCategory = isTech && !isAi;
                } else if (currentCategory === 'Artificial Intelligence') {
                    const isAi = titleLower.includes('ai') || titleLower.includes('chatgpt') || titleLower.includes('prompt') || titleLower.includes('generative') || catLower.includes('ai');
                    matchCategory = isAi;
                } else if (currentCategory === 'Commerce & Management') {
                    matchCategory = catLower.includes('business') || catLower.includes('finance') || catLower.includes('commerce') || catLower.includes('management');
                } else if (currentCategory === 'Personal Development') {
                    matchCategory = catLower.includes('design') || catLower.includes('personal') || catLower.includes('career');
                } else {
                    matchCategory = catLower.includes(currentCategory.toLowerCase());
                }
            }
            
            return matchSearch && matchType && matchCategory;
        });
    }, [initialEvents, currentQuery, currentType, currentCategory]);

    const now = new Date();
    const liveNow = filtered.filter(s => s.isLive);
    const upcoming = filtered.filter(s => !s.isLive && (new Date(s.date || 0) > now || new Date(s.date || 0).getFullYear() === 1970)).sort((a, b) => new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime());
    const replays = filtered.filter(s => !s.isLive && new Date(s.date || 0) <= now && new Date(s.date || 0).getFullYear() !== 1970).sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());

    return (
        <div className="seminar-page-wrapper">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                
                .seminar-page-wrapper {
                    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    background: linear-gradient(135deg, #FDFBF7 0%, #F8F5F0 100%);
                    color: #1F2937;
                    min-height: calc(100vh - 60px);
                    position: relative;
                }

                .seminar-orbs {
                    position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden;
                }

                .seminar-orb {
                    position: absolute; border-radius: 50%; opacity: 0.08;
                    animation: seminar-float 20s infinite ease-in-out;
                    transition: transform 0.1s ease-out;
                }

                .seminar-orb-1 { width: 600px; height: 600px; background: #1B4332; top: -200px; right: -100px; }
                .seminar-orb-2 { width: 400px; height: 400px; background: #40916C; bottom: -100px; left: -100px; }

                @keyframes seminar-float {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 30px) scale(0.9); }
                }

                .seminar-shell {
                    position: relative; z-index: 10;
                    max-width: 1600px; margin: 0 auto;
                    padding: 10rem 2rem 6rem;
                }

                .seminar-hero { margin-bottom: 3rem; }

                .hero-badge {
                    display: inline-flex; align-items: center; gap: 0.5rem;
                    background: linear-gradient(135deg, rgba(27, 67, 50, 0.1) 0%, rgba(45, 106, 79, 0.1) 100%);
                    color: #1B4332; padding: 0.625rem 1.25rem; border-radius: 50px;
                    font-size: 0.875rem; font-weight: 600; margin-bottom: 1.5rem; letter-spacing: 0.5px;
                }

                .hero-title {
                    font-size: clamp(2.5rem, 5vw, 4rem); font-weight: 800; color: #1B4332;
                    line-height: 1.1; margin-bottom: 1.5rem; letter-spacing: -1px;
                }

                .hero-subtitle {
                    font-size: 1.25rem; color: #6B7280; max-width: 650px; line-height: 1.7;
                }

                /* Standardized Controls Row */
                .seminar-controls {
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

                /* Standardized Filter Tabs */
                .filter-tabs {
                    display: flex; gap: 0.75rem; overflow-x: auto; padding: 0.5rem;
                    background: white; border-radius: 16px; scrollbar-width: none;
                    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
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

                .section-header {
                    display: flex; align-items: center; gap: 1.5rem;
                    margin: 4rem 0 2rem;
                }

                .section-header-title {
                    font-size: 0.75rem; font-weight: 800; text-transform: uppercase;
                    letter-spacing: 0.2em; color: #1B4332; display: flex; align-items: center; gap: 0.75rem;
                }

                .section-line { height: 1px; flex: 1; background: linear-gradient(to right, #E5E7EB, transparent); }

                .live-dot {
                    width: 10px; height: 10px; background: #DC2626; border-radius: 50%;
                    animation: pulse 1.5s infinite;
                }

                @keyframes pulse {
                    0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7); }
                    70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(220, 38, 38, 0); }
                    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
                }

                .categories-filter-bar {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                    margin-bottom: 2.5rem;
                    width: 100%;
                    flex-wrap: wrap;
                }

                .categories-scroll-wrapper {
                    display: flex;
                    gap: 0.875rem;
                    overflow-x: auto;
                    padding: 0.5rem 0.25rem;
                    scroll-behavior: smooth;
                    -webkit-overflow-scrolling: touch;
                    scrollbar-width: none; /* Firefox */
                    flex-grow: 1;
                }

                .categories-scroll-wrapper::-webkit-scrollbar {
                    display: none; /* Safari and Chrome */
                }

                .category-pill-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.625rem;
                    padding: 0.75rem 1.5rem;
                    background: white;
                    border: 2px solid #E5E7EB;
                    border-radius: 50px;
                    font-family: inherit;
                    font-size: 0.95rem;
                    font-weight: 600;
                    color: #4B5563;
                    cursor: pointer;
                    white-space: nowrap;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
                }

                .category-pill-btn:hover {
                    border-color: #40916C;
                    color: #1B4332;
                    background: #F4FBF7;
                    transform: translateY(-1px);
                }

                .category-pill-btn.active {
                    background: linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%);
                    border-color: #1B4332;
                    color: white;
                    box-shadow: 0 8px 20px rgba(27, 67, 50, 0.25);
                }

                .pill-icon {
                    font-size: 1.125rem;
                }

                .clear-filter-inline-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.375rem;
                    background: transparent;
                    border: none;
                    color: #9CA3AF;
                    font-family: inherit;
                    font-size: 0.95rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    white-space: nowrap;
                    padding: 0.5rem 0.75rem;
                    border-radius: 8px;
                }

                .clear-filter-inline-btn:hover {
                    color: #DC2626;
                    background: #FEF2F2;
                }

                .clear-x {
                    font-size: 1.25rem;
                    line-height: 1;
                }

                .cards-grid {
                    display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
                    gap: 2.5rem;
                }

                @media (max-width: 768px) {
                    .seminar-orb-1 {
                        width: 250px;
                        height: 250px;
                        top: -50px;
                        right: -50px;
                        opacity: 0.04;
                    }
                    .seminar-orb-2 {
                        width: 200px;
                        height: 200px;
                        bottom: -50px;
                        left: -50px;
                        opacity: 0.04;
                    }
                    .seminar-shell { padding: 8rem 1.5rem 4rem; }
                    .seminar-controls { flex-direction: column; align-items: stretch; }
                }
            `}</style>

            <div className="seminar-orbs">
                <div className="seminar-orb seminar-orb-1"></div>
                <div className="seminar-orb seminar-orb-2"></div>
            </div>

            <div className="seminar-shell">
                <section className="seminar-hero">
                    <div className="hero-badge">🎓 SARTHI SESSIONS</div>
                    <h1 className="hero-title">Masterclass Series</h1>
                    <p className="hero-subtitle">
                        Live knowledge sessions and intensive workshops. Skip theory and master production-grade engineering skills.
                    </p>
                </section>

                {/* Horizontal Category Filter */}
                <div className="categories-filter-bar">
                    <div className="categories-scroll-wrapper">
                        {CATEGORY_TABS.map(tab => (
                            <button
                                key={tab.id}
                                type="button"
                                className={cn(
                                    "category-pill-btn",
                                    currentCategory === tab.id && "active"
                                )}
                                onClick={() => updateFilters({ category: tab.id })}
                            >
                                <span className="pill-icon">{tab.icon}</span>
                                <span className="pill-label">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                    {currentCategory !== 'All' && (
                        <button
                            type="button"
                            className="clear-filter-inline-btn"
                            onClick={() => updateFilters({ category: 'All' })}
                        >
                            Clear Filter <span className="clear-x">×</span>
                        </button>
                    )}
                </div>

                <div className="seminar-controls">
                    <div className="search-container">
                        <Search className="search-icon w-5 h-5" />
                        <input 
                            type="text" 
                            className="search-input"
                            placeholder="Search events, topics, speakers..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="filter-tabs">
                        {filterTabs.map(tab => (
                            <button
                                key={tab.value}
                                className={`filter-tab${currentType === tab.value ? ' is-active' : ''}`}
                                onClick={() => updateFilters({ type: tab.value })}
                            >
                                {tab.label}
                                <span className="tab-count">{tab.count}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="content-area">
                    {/* Live Section */}
                    <AnimatePresence mode="wait">
                        {(currentLive?.videoId || liveNow.length > 0) && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
                                <div className="section-header">
                                    <div className="section-header-title"><span className="live-dot"></span> Live Now</div>
                                    <div className="section-line"></div>
                                </div>
                                <div className="cards-grid">
                                    {currentLive?.videoId && !liveNow.find(s => s.youtubeBroadcastId === currentLive.videoId) && (
                                        <div className="col-span-full">
                                            <LiveBannerItem title={currentLive.title || "Custom Stream"} videoId={currentLive.videoId} />
                                        </div>
                                    )}
                                    {liveNow.map((s, i) => <SeminarCard key={s.id} seminar={s} index={i} />)}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Upcoming */}
                    <div className="mb-12">
                        <div className="section-header">
                            <div className="section-header-title">Upcoming Masterclasses</div>
                            <div className="section-line"></div>
                        </div>
                        {upcoming.length > 0 ? (
                            <div className="cards-grid">
                                {upcoming.map((s, i) => (
                                    <SeminarCard key={s.id} seminar={s} index={i} />
                                ))}
                                {upcoming.length === 1 && <MoreComingSoonItem />}
                            </div>
                        ) : (
                            <div className="bg-white/40 backdrop-blur-sm rounded-[3rem] p-12 border border-white text-center">
                                <Calendar className="w-12 h-12 text-[#1B4332]/20 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-[#1B4332]">No sessions scheduled</h3>
                            </div>
                        )}
                    </div>

                    {/* Replays */}
                    <div>
                        <div className="section-header">
                            <div className="section-header-title">Knowledge Vault</div>
                            <div className="section-line"></div>
                        </div>
                        {replays.length > 0 ? (
                            <div className="cards-grid">
                                {replays.map((s, i) => (
                                    <SeminarCard key={s.id} seminar={s} index={i} />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white/40 backdrop-blur-sm rounded-[3rem] p-12 border border-white text-center">
                                <PlayCircle className="w-12 h-12 text-[#1B4332]/20 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-[#1B4332]">No replays available</h3>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Application Modal */}
            <AnimatePresence>
                {showSpeakerModal && (
                    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => {
                                setShowSpeakerModal(false);
                                setSpeakerSuccess(false);
                                setSpeakerError('');
                            }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-md"
                        />
                        
                        {/* Modal Container */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                            className="relative bg-white rounded-[2.5rem] p-8 md:p-10 w-full max-w-2xl shadow-2xl border border-[#1B4332]/10 z-10 max-h-[85vh] overflow-y-auto"
                        >
                            {/* Close Button */}
                            <button 
                                type="button"
                                onClick={() => {
                                    setShowSpeakerModal(false);
                                    setSpeakerSuccess(false);
                                    setSpeakerError('');
                                }}
                                className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-[#1B4332]/10 text-slate-500 hover:text-[#1B4332] rounded-full transition-all duration-200"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {speakerSuccess ? (
                                <div className="text-center py-10 space-y-6">
                                    <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <CheckCircle2 className="w-10 h-10" />
                                    </div>
                                    <h3 className="text-3xl font-extrabold text-[#1B4332] tracking-tight">Proposal Submitted!</h3>
                                    <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
                                        Thank you for sharing your expertise. Our academic board will review your proposal and reach out via email within 24-48 hours with stream setup details.
                                    </p>
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            setShowSpeakerModal(false);
                                            setSpeakerSuccess(false);
                                        }}
                                        className="px-8 py-3.5 bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-bold rounded-xl text-sm uppercase tracking-wider transition-all"
                                    >
                                        Close Window
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSpeakerSubmit} className="space-y-6 text-slate-800">
                                    <div>
                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1B4332]/5 text-[#1B4332] text-[10px] font-bold uppercase rounded-full mb-3 tracking-widest">
                                            <Sparkles className="w-3.5 h-3.5 text-[#1B4332]" /> Guest Speaker Proposal
                                        </div>
                                        <h3 className="text-3xl font-extrabold text-[#1B4332] tracking-tight">Host a Masterclass</h3>
                                        <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mt-1">Share your engineering insights with thousands of student developers</p>
                                    </div>

                                    {speakerError && (
                                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-semibold">
                                            {speakerError}
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name *</label>
                                            <input 
                                                type="text"
                                                required
                                                value={speakerForm.fullName}
                                                onChange={e => setSpeakerForm({ ...speakerForm, fullName: e.target.value })}
                                                placeholder="e.g. Dr. Rajesh Sharma"
                                                className="w-full h-12 px-4 border-2 border-slate-100 rounded-xl focus:outline-none focus:border-[#1B4332] font-semibold text-sm transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address *</label>
                                            <input 
                                                type="email"
                                                required
                                                value={speakerForm.email}
                                                onChange={e => setSpeakerForm({ ...speakerForm, email: e.target.value })}
                                                placeholder="e.g. rajesh@university.edu"
                                                className="w-full h-12 px-4 border-2 border-slate-100 rounded-xl focus:outline-none focus:border-[#1B4332] font-semibold text-sm transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</label>
                                            <input 
                                                type="tel"
                                                value={speakerForm.phone}
                                                onChange={e => setSpeakerForm({ ...speakerForm, phone: e.target.value })}
                                                placeholder="e.g. +91 98765 43210"
                                                className="w-full h-12 px-4 border-2 border-slate-100 rounded-xl focus:outline-none focus:border-[#1B4332] font-semibold text-sm transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">LinkedIn Profile URL</label>
                                            <input 
                                                type="url"
                                                value={speakerForm.linkedinUrl}
                                                onChange={e => setSpeakerForm({ ...speakerForm, linkedinUrl: e.target.value })}
                                                placeholder="e.g. https://linkedin.com/in/username"
                                                className="w-full h-12 px-4 border-2 border-slate-100 rounded-xl focus:outline-none focus:border-[#1B4332] font-semibold text-sm transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Seminar Title *</label>
                                            <input 
                                                type="text"
                                                required
                                                value={speakerForm.title}
                                                onChange={e => setSpeakerForm({ ...speakerForm, title: e.target.value })}
                                                placeholder="e.g. Scalable Systems in Production"
                                                className="w-full h-12 px-4 border-2 border-slate-100 rounded-xl focus:outline-none focus:border-[#1B4332] font-semibold text-sm transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Topic / Category *</label>
                                            <input 
                                                type="text"
                                                required
                                                value={speakerForm.topic}
                                                onChange={e => setSpeakerForm({ ...speakerForm, topic: e.target.value })}
                                                placeholder="e.g. Backend Engineering"
                                                className="w-full h-12 px-4 border-2 border-slate-100 rounded-xl focus:outline-none focus:border-[#1B4332] font-semibold text-sm transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Session Outline / Description *</label>
                                        <textarea 
                                            required
                                            rows={3}
                                            value={speakerForm.description}
                                            onChange={e => setSpeakerForm({ ...speakerForm, description: e.target.value })}
                                            placeholder="Describe what students will learn..."
                                            className="w-full p-4 border-2 border-slate-100 rounded-xl focus:outline-none focus:border-[#1B4332] font-semibold text-sm transition-all resize-none"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Proposed Date/Time *</label>
                                            <input 
                                                type="datetime-local"
                                                required
                                                value={speakerForm.proposedAt}
                                                onChange={e => setSpeakerForm({ ...speakerForm, proposedAt: e.target.value })}
                                                className="w-full h-12 px-4 border-2 border-slate-100 rounded-xl focus:outline-none focus:border-[#1B4332] font-semibold text-sm transition-all text-slate-600"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</label>
                                            <input 
                                                type="text"
                                                required
                                                value={speakerForm.proposedDuration}
                                                onChange={e => setSpeakerForm({ ...speakerForm, proposedDuration: e.target.value })}
                                                className="w-full h-12 px-4 border-2 border-slate-100 rounded-xl focus:outline-none focus:border-[#1B4332] font-semibold text-sm transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Audience</label>
                                            <input 
                                                type="text"
                                                required
                                                value={speakerForm.targetAudience}
                                                onChange={e => setSpeakerForm({ ...speakerForm, targetAudience: e.target.value })}
                                                className="w-full h-12 px-4 border-2 border-slate-100 rounded-xl focus:outline-none focus:border-[#1B4332] font-semibold text-sm transition-all"
                                            />
                                        </div>
                                    </div>

                                    <button 
                                        type="submit"
                                        disabled={submittingSpeaker}
                                        className="w-full h-14 bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-bold rounded-2xl flex items-center justify-center gap-3 shadow-xl transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
                                    >
                                        {submittingSpeaker ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                <Send className="w-4 h-4 text-white" />
                                                SUBMIT SPEAKER PROPOSAL
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function LiveBannerItem({ title, videoId }: { title: string, videoId: string }) {
    return (
        <motion.div whileHover={{ y: -5 }} className="group">
            <Link href={`https://youtube.com/live/${videoId}`} target="_blank" className="block relative overflow-hidden bg-[#1B4332] rounded-[2rem] p-8 shadow-2xl">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-600 text-white text-[9px] font-bold uppercase rounded-full mb-3">
                            <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" /> Live
                        </div>
                        <h3 className="text-2xl font-bold text-white group-hover:text-emerald-400 transition-colors">{title}</h3>
                    </div>
                    <div className="px-6 py-3 bg-white text-[#1B4332] font-bold rounded-xl text-sm flex items-center gap-2">
                        Join Now <ArrowRight className="w-4 h-4" />
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

function MoreComingSoonItem() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[300px] border-2 border-dashed border-[#1B4332]/10 rounded-3xl bg-white/5 group text-center">
            <Plus className="w-10 h-10 text-[#1B4332]/20 group-hover:scale-110 transition-transform mb-2" />
            <span className="text-xs font-bold text-[#1B4332]/40 uppercase tracking-widest">More Soon</span>
        </div>
    );
}

