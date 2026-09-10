'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { 
    Search, Calendar, PlayCircle, ArrowRight, Award, Zap, 
    Clock, CheckCircle2, Filter, ChevronDown, Loader2, X 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SeminarCard from "@/components/seminars/SeminarCard";
import { cn } from '@/lib/utils';

const CATEGORY_TABS = [
  { id: 'All', label: 'All', icon: '📚' },
  { id: 'Technology', label: 'Technology', icon: '💻' },
  { id: 'Artificial Intelligence', label: 'Artificial Intelligence', icon: '✨' },
  { id: 'Commerce & Management', label: 'Commerce & Management', icon: '💼' },
  { id: 'Personal Development', label: 'Personal Development', icon: '🌱' },
];

interface Workshop {
    id: string;
    title: string;
    description: string;
    instructorName: string;
    date: string | Date;
    duration: string;
    level: string;
    price: number;
    originalPrice?: number;
    seats: number;
    seatsLeft: number;
    category: string;
    tags: string[];
    thumbnail?: string;
    status: string;
    slug: string;
}

interface WorkshopsClientProps {
    initialWorkshops: Workshop[];
    categories: string[];
}

export default function WorkshopsClient({ initialWorkshops, categories }: WorkshopsClientProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');

    // Sync query parameters with state
    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (search) params.set('search', search);
        else params.delete('search');
        if (selectedCategory !== 'All') params.set('category', selectedCategory);
        else params.delete('category');
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, [search, selectedCategory, pathname, router, searchParams]);

    // Parallax orbs movement
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const orbs = document.querySelectorAll('.seminar-orb');
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;

            orbs.forEach((orb: any, index) => {
                const depth = (index + 1) * 15;
                const moveX = (x - 0.5) * depth;
                const moveY = (y - 0.5) * depth;
                orb.style.transform = `translate(${moveX}px, ${moveY}px)`;
            });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const resetFilters = () => {
        setSearch('');
        setSelectedCategory('All');
    };

    // Filter local workshops array
    const filteredWorkshops = useMemo(() => {
        return initialWorkshops.filter(w => {
            const matchesSearch = w.title.toLowerCase().includes(search.toLowerCase()) || 
                (w.description || '').toLowerCase().includes(search.toLowerCase()) ||
                (w.instructorName || '').toLowerCase().includes(search.toLowerCase());
            
            let matchesCategory = true;
            if (selectedCategory !== 'All') {
                const titleLower = (w.title || '').toLowerCase();
                const catLower = (w.category || '').toLowerCase();
                
                if (selectedCategory === 'Technology') {
                    const isTech = catLower.includes('development') || catLower.includes('databases') || catLower.includes('technology');
                    const isAi = titleLower.includes('ai') || titleLower.includes('chatgpt') || titleLower.includes('prompt') || titleLower.includes('generative');
                    matchesCategory = isTech && !isAi;
                } else if (selectedCategory === 'Artificial Intelligence') {
                    const isAi = titleLower.includes('ai') || titleLower.includes('chatgpt') || titleLower.includes('prompt') || titleLower.includes('generative') || catLower.includes('ai');
                    matchesCategory = isAi;
                } else if (selectedCategory === 'Commerce & Management') {
                    matchesCategory = catLower.includes('business') || catLower.includes('finance') || catLower.includes('commerce') || catLower.includes('management');
                } else if (selectedCategory === 'Personal Development') {
                    matchesCategory = catLower.includes('design') || catLower.includes('personal') || catLower.includes('career');
                } else {
                    matchesCategory = catLower.includes(selectedCategory.toLowerCase());
                }
            }
            
            return matchesSearch && matchesCategory;
        });
    }, [initialWorkshops, search, selectedCategory]);

    // Map Workshop object schema to SeminarCard input schema
    const events = useMemo(() => {
        return filteredWorkshops.map(w => ({
            id: w.id,
            slug: w.slug,
            title: w.title,
            description: w.description,
            isLive: false,
            date: w.date ? new Date(w.date).toISOString() : null,
            thumbnailUrl: w.thumbnail,
            speakerName: w.instructorName,
            category: w.category,
            price: w.price,
            type: 'workshop' as const
        }));
    }, [filteredWorkshops]);

    const upcoming = useMemo(() => {
        const now = new Date();
        return events.filter(s => new Date(s.date || 0) > now || new Date(s.date || 0).getFullYear() === 1970)
            .sort((a, b) => new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime());
    }, [events]);

    const replays = useMemo(() => {
        const now = new Date();
        return events.filter(s => new Date(s.date || 0) <= now && new Date(s.date || 0).getFullYear() !== 1970)
            .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
    }, [events]);

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

                .search-icon {
                    position: absolute; left: 1.25rem; top: 50%;
                    transform: translateY(-50%); color: #9CA3AF;
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
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
                    gap: 2.5rem;
                }

                .section-header {
                    display: flex; align-items: center; gap: 1.5rem; margin-bottom: 2.5rem;
                }

                .section-header-title {
                    font-size: 1.125rem; font-weight: 800; color: #1B4332;
                    text-transform: uppercase; letter-spacing: 2px; display: flex; align-items: center; gap: 0.75rem;
                }

                .section-line {
                    flex: 1; h-px: 1px; height: 1px; background: rgba(27, 67, 50, 0.1);
                }

                @media (max-width: 768px) {
                    .seminar-shell { padding-top: 8rem; }
                    .cards-grid { grid-template-columns: 1fr; }
                }
            `}</style>

            {/* Background Orbs */}
            <div className="seminar-orbs">
                <div className="seminar-orb seminar-orb-1"></div>
                <div className="seminar-orb seminar-orb-2"></div>
            </div>

            {/* Content Shell */}
            <div className="seminar-shell">
                
                {/* Hero section */}
                <div className="seminar-hero">
                    <div className="hero-badge">🛠️ SARTHI WORKSHOPS</div>
                    <h1 className="hero-title">Hands-On Workshops</h1>
                    <p className="hero-subtitle">
                        Intensive online sessions designed to help you build real-world skills fast. Elite, premium access to top-tier industry knowledge.
                    </p>
                </div>

                {/* Horizontal Category Filter */}
                <div className="categories-filter-bar">
                    <div className="categories-scroll-wrapper">
                        {CATEGORY_TABS.map(tab => (
                            <button
                                key={tab.id}
                                type="button"
                                className={cn(
                                    "category-pill-btn",
                                    selectedCategory === tab.id && "active"
                                )}
                                onClick={() => setSelectedCategory(tab.id)}
                            >
                                <span className="pill-icon">{tab.icon}</span>
                                <span className="pill-label">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                    {selectedCategory !== 'All' && (
                        <button
                            type="button"
                            className="clear-filter-inline-btn"
                            onClick={() => setSelectedCategory('All')}
                        >
                            Clear Filter <span className="clear-x">×</span>
                        </button>
                    )}
                </div>

                {/* Filters Row */}
                <div className="seminar-controls">
                    <div className="search-container">
                        <Search className="search-icon" size={20} />
                        <input
                            type="text"
                            placeholder="Search workshops, mentors, or skills..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="search-input"
                        />
                    </div>
                </div>

                {/* Upcoming Workshops */}
                <div className="mb-12">
                    <div className="section-header">
                        <div className="section-header-title">Upcoming Workshops</div>
                        <div className="section-line"></div>
                    </div>
                    {upcoming.length > 0 ? (
                        <div className="cards-grid">
                            {upcoming.map((s, i) => (
                                <SeminarCard key={s.id} seminar={s} index={i} />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white/40 backdrop-blur-sm rounded-[3rem] p-12 border border-white text-center">
                            <Calendar className="w-12 h-12 text-[#1B4332]/20 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-[#1B4332]">No workshops scheduled</h3>
                        </div>
                    )}
                </div>

                {/* Past Replays */}
                <div>
                    <div className="section-header">
                        <div className="section-header-title">Workshop Vault</div>
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
    );
}
