'use client';

import { useState, useEffect, useCallback, memo, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, ArrowRight, BookOpen, Heart, Clock, IndianRupee, Star, Sparkles, Smile, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/components/ToastProvider';
import { cn } from '@/lib/utils';

interface Course {
    id: string;
    slug: string | null;
    title: string;
    description: string | null;
    thumbnail: string | null;
    price: number;
    originalPrice: number | null;
    level: string;
    category: string | null;
    instructor: {
        name: string | null;
        image: string | null;
    };
    _count: {
        lessons: number;
        enrollments: number;
    };
    rating: number;
    reviewCount: number;
    duration?: number | null;
}

const CATEGORY_TABS = [
  { id: 'All', label: 'All Modules', icon: '📚' },
  { id: 'Artificial Intelligence', label: 'AI & NWP', icon: '⚡' },
  { id: 'Radar & Satellite', label: 'Radar & Satellite', icon: '🛰️' },
  { id: 'Agro & Climate', label: 'Agro-Meteorology', icon: '🌾' },
  { id: 'Aviation & Marine', label: 'Aviation & Marine', icon: '✈️' },
  { id: 'Disaster Management', label: 'Cyclone & Early Warning', icon: '🌀' },
  { id: 'Capacity & Governance', label: 'LMS Competency', icon: '🏛️' },
  { id: 'Personal Development', label: 'Briefing & Media', icon: '🎙️' },
];

interface CoursesClientProps {
    initialCourses: Course[];
    categories: string[];
    stats?: {
        totalCourses: number;
        totalRevenue: number;
        averagePrice: number;
    };
    initialTotal: number;
}

export default function CoursesClient({
    initialCourses,
    categories,
    stats,
    initialTotal
}: CoursesClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useAuth();
    const { addToast } = useToast();

    const currentCategory = searchParams.get('category') || 'All';
    const currentSort = searchParams.get('sort') || 'newest';
    const currentQuery = searchParams.get('q') || '';
    const currentPage = parseInt(searchParams.get('page') || '1');

    const augmentedCourses = useMemo(() => {
        return initialCourses;
    }, [initialCourses]);

    const [courses, setCourses] = useState<Course[]>(augmentedCourses);

    const sortedDisplayCourses = useMemo(() => {
        return courses;
    }, [courses]);

    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [search, setSearch] = useState(currentQuery);
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [originalsOpen, setOriginalsOpen] = useState(currentCategory.startsWith('originals_'));

    // 🧠 Single Source of Truth: Sync local search state when URL changes
    useEffect(() => {
        setSearch(currentQuery);
    }, [currentQuery]);

    // 🔍 Search Debouncing & Race Condition Prevention
    useEffect(() => {
        const controller = new AbortController();
        const t = setTimeout(() => {
            if (search !== currentQuery) {
                // Remove page when searching to start from beginning
                const params = new URLSearchParams(searchParams.toString());
                if (search) params.set('q', search);
                else params.delete('q');
                params.delete('page');

                router.push(`/courses?${params.toString()}`, { scroll: false });
            }
        }, 400);

        return () => {
            clearTimeout(t);
            controller.abort();
        };
    }, [search, currentQuery, router, searchParams]);

    // Wishlist State
    const [wishlistedIds, setWishlistedIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (user) {
            fetch('/api/student/wishlist')
                .then(res => res.json())
                .then(data => {
                    const ids = new Set<string>(data.wishlist?.map((item: any) => item.course.id));
                    setWishlistedIds(ids);
                })
                .catch(console.error);
        }
    }, [user]);

    const toggleWishlist = async (e: React.MouseEvent, courseId: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            addToast({ type: 'info', title: 'Login Required', message: 'Please login to save courses.' });
            router.push(`/login?redirect=/courses`);
            return;
        }

        // ❤️ Wishlist Sync Issue Fix: Optimistic Update
        const previousWishlisted = new Set(wishlistedIds);
        setWishlistedIds(prev => {
            const next = new Set(prev);
            if (next.has(courseId)) next.delete(courseId);
            else next.add(courseId);
            return next;
        });

        try {
            const res = await fetch('/api/student/wishlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ courseId })
            });

            if (!res.ok) throw new Error("API sync failed");

            const data = await res.json();
            addToast({
                type: 'success',
                title: data.status === 'added' ? 'Course Saved' : 'Removed',
                message: data.status === 'added' ? 'Added to your wishlist.' : 'Removed from your collection.'
            });
        } catch (err) {
            // Rollback on failure
            setWishlistedIds(previousWishlisted);
            addToast({ type: 'error', title: 'Network Error', message: 'Action failed. Please check your connection.' });
        }
    };

    // Sanitize categories: Remove duplicates and enforce Title Case
    const cleanCategories = useMemo(() => {
        const unique = new Set<string>();
        categories.forEach(cat => {
            if (!cat) return;
            const normalized = cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();
            unique.add(normalized);
        });
        const result = Array.from(unique);
        if (result.includes('All')) {
            return ['All', ...result.filter(c => c !== 'All')];
        }
        return result;
    }, [categories]);

    useEffect(() => {
        setCourses(augmentedCourses);
        setLoading(false);
    }, [augmentedCourses]);

    // Orb Parallax Effect
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const orbs = document.querySelectorAll('.orb-animate');
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

        router.push(`/courses?${params.toString()}`, { scroll: false });
    }, [router, searchParams]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // Fallback if enter is pressed before debounce finishes
        if (search !== currentQuery) {
            const params = new URLSearchParams(searchParams.toString());
            if (search) params.set('q', search);
            else params.delete('q');
            params.delete('page');
            router.push(`/courses?${params.toString()}`, { scroll: false });
        }
    };

    const handleLoadMore = async () => {
        if (loadingMore) return;
        setLoadingMore(true);
        const nextPage = currentPage + 1;
        try {
            const params = new URLSearchParams(searchParams.toString());
            params.set('page', nextPage.toString());
            const res = await fetch(`/api/courses?${params.toString()}`);
            const data = await res.json();
            if (data.courses) {
                setCourses(prev => [...prev, ...data.courses]);
                const newUrl = window.location.pathname + '?' + params.toString();
                // Update URL without triggering a full rerender to preserve loaded data
                window.history.pushState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
            }
        } catch (e) {
            console.error('Failed to load more courses');
        } finally {
            setLoadingMore(false);
        }
    };

    // 📄 Pagination Bug Fix
    const limit = 12; // default page size
    const hasMore = (currentPage * limit) < initialTotal;

    const sortOptions = [
        { label: 'Newest First', value: 'newest' },
        { label: 'Most Popular', value: 'popular' },
        { label: 'Price: Low to High', value: 'price-low' },
        { label: 'Price: High to Low', value: 'price-high' },
    ];

    return (
        <div className="courses-page-wrapper">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                
                .courses-page-wrapper {
                    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    background: linear-gradient(135deg, #FDFBF7 0%, #F8F5F0 100%);
                    color: #1F2937;
                    min-height: calc(100vh - 60px);
                    position: relative;
                }

                .floating-orbs {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    z-index: 0;
                    overflow: hidden;
                }

                .orb {
                    position: absolute;
                    border-radius: 50%;
                    opacity: 0.08;
                    animation: float 20s infinite ease-in-out;
                    transition: transform 0.1s ease-out;
                }

                .orb-1 {
                    width: 600px;
                    height: 600px;
                    background: #1B4332;
                    top: -200px;
                    right: -100px;
                    animation-delay: 0s;
                }

                .orb-2 {
                    width: 400px;
                    height: 400px;
                    background: #40916C;
                    bottom: -100px;
                    left: -100px;
                    animation-delay: 5s;
                }

                @keyframes float {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 30px) scale(0.9); }
                }

                .hero {
                    padding: 10rem 2rem 3rem;
                    max-width: 1600px;
                    margin: 0 auto;
                    position: relative;
                    z-index: 10;
                }

                .hero-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: linear-gradient(135deg, rgba(27, 67, 50, 0.1) 0%, rgba(45, 106, 79, 0.1) 100%);
                    color: #1B4332;
                    padding: 0.625rem 1.25rem;
                    border-radius: 50px;
                    font-size: 0.875rem;
                    font-weight: 600;
                    margin-bottom: 1.5rem;
                    letter-spacing: 0.5px;
                }

                .hero-title {
                    font-size: clamp(2.5rem, 5vw, 4rem);
                    font-weight: 800;
                    color: #1B4332;
                    line-height: 1.1;
                    margin-bottom: 1.5rem;
                    letter-spacing: -1px;
                }

                .hero-subtitle {
                    font-size: 1.25rem;
                    color: #6B7280;
                    max-width: 650px;
                    line-height: 1.7;
                }

                .main-container {
                    max-width: 1600px;
                    margin: 0 auto;
                    padding: 0 2rem 6rem;
                    position: relative;
                    z-index: 10;
                }

                .courses-layout {
                    width: 100%;
                }

                .content-area {
                    width: 100%;
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

                .controls-section {
                    display: flex;
                    gap: 2rem;
                    margin-bottom: 4rem;
                    align-items: center;
                    flex-wrap: wrap;
                }

                .search-container {
                    flex: 1;
                    min-width: 300px;
                    position: relative;
                }

                .search-input {
                    width: 100%;
                    padding: 1.25rem 1.5rem 1.25rem 3.5rem;
                    border: 2px solid #E5E7EB;
                    border-radius: 16px;
                    font-size: 1rem;
                    font-family: inherit;
                    background: white;
                    transition: all 0.3s ease;
                    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                }

                .search-input:focus {
                    outline: none;
                    border-color: #40916C;
                    box-shadow: 0 0 0 4px rgba(64, 145, 108, 0.1), 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }

                .search-icon {
                    position: absolute;
                    left: 1.25rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #6B7280;
                    font-size: 1.25rem;
                }

                .sort-btn {
                    padding: 1.25rem 1.75rem;
                    border: 2px solid #E5E7EB;
                    border-radius: 16px;
                    background: white;
                    font-family: inherit;
                    font-weight: 600;
                    color: #6B7280;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .sort-btn:hover {
                    border-color: #40916C;
                    color: #1B4332;
                }

                .courses-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
                    gap: 2.5rem;
                }

                .course-card {
                    background: white;
                    border-radius: 24px;
                    overflow: hidden;
                    box-shadow: 0 20px 60px rgba(27, 67, 50, 0.08);
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    animation: fadeInUp 0.6s ease-out;
                    animation-fill-mode: both;
                    display: flex;
                    flex-direction: column;
                }

                .course-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 30px 60px rgba(27, 67, 50, 0.15);
                    border-color: rgba(27, 67, 50, 0.15);
                }

                .course-card:hover .card-image {
                    transform: scale(1.06);
                }

                .card-image-container {
                    position: relative;
                    aspect-ratio: 16 / 9;
                    width: 100%;
                    overflow: hidden;
                    background: #F3F4F6;
                }

                .card-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
                    image-rendering: -webkit-optimize-contrast;
                    image-rendering: crisp-edges;
                }

                .level-badge {
                    position: absolute;
                    top: 1.25rem;
                    left: 1.25rem;
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(10px);
                    padding: 0.5rem 1rem;
                    border-radius: 50px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    letter-spacing: 0.5px;
                    text-transform: uppercase;
                    color: #1B4332;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }

                .free-badge {
                    position: absolute;
                    top: 1.25rem;
                    right: 1.25rem;
                    background: #40916C;
                    color: white;
                    padding: 0.5rem 1rem;
                    border-radius: 50px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                }

                .card-content {
                    padding: 2rem;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }

                .card-title {
                    font-size: 1.375rem;
                    font-weight: 700;
                    color: #1F2937;
                    margin-bottom: 0.875rem;
                    line-height: 1.4;
                    letter-spacing: -0.3px;
                }

                .card-description {
                    font-size: 0.95rem;
                    color: #6B7280;
                    line-height: 1.7;
                    margin-bottom: 1.5rem;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    flex: 1;
                }

                .card-meta {
                    display: flex;
                    gap: 1.25rem;
                    padding-bottom: 1.5rem;
                    border-bottom: 1px solid #E5E7EB;
                    margin-bottom: 1.5rem;
                }

                .meta-item {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.875rem;
                    color: #6B7280;
                    font-weight: 600;
                }

                .enroll-btn {
                    width: 100%;
                    padding: 1rem 2rem;
                    background: linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%);
                    color: white;
                    border: none;
                    border-radius: 14px;
                    font-family: inherit;
                    font-size: 1rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    box-shadow: 0 4px 12px rgba(27, 67, 50, 0.3);
                }

                .enroll-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 12px 24px rgba(27, 67, 50, 0.4);
                }

                .enroll-btn:hover .btn-arrow {
                    transform: translateX(4px);
                }

                .btn-arrow {
                    transition: transform 0.3s ease;
                }

                .empty-state {
                    grid-column: 1 / -1;
                    text-align: center;
                    padding: 6rem 2rem;
                    background: white;
                    border-radius: 24px;
                    box-shadow: 0 20px 60px rgba(27, 67, 50, 0.08);
                }

                .empty-icon {
                    width: 80px;
                    height: 80px;
                    margin: 0 auto 2rem;
                    background: linear-gradient(135deg, rgba(27, 67, 50, 0.1) 0%, rgba(45, 106, 79, 0.1) 100%);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 2.5rem;
                }

                .empty-title {
                    font-size: 1.75rem;
                    font-weight: 700;
                    color: #1F2937;
                    margin-bottom: 1rem;
                }

                .empty-subtitle {
                    font-size: 1.125rem;
                    color: #6B7280;
                    max-width: 400px;
                    margin: 0 auto 2.5rem;
                    line-height: 1.6;
                }

                .reset-btn {
                    padding: 1rem 2.5rem;
                    background: #1B4332;
                    color: white;
                    border: none;
                    border-radius: 14px;
                    font-family: inherit;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .reset-btn:hover {
                    background: #2D6A4F;
                    transform: translateY(-2px);
                    box-shadow: 0 10px 20px rgba(27, 67, 50, 0.3);
                }

                @media (max-width: 1024px) {
                    .courses-grid {
                        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    }
                }

                @media (max-width: 768px) {
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
                    .courses-grid {
                        grid-template-columns: 1fr;
                        gap: 1.75rem;
                    }
                    .hero {
                        padding: 8rem 1.5rem 3rem;
                    }
                }

                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
 
             <div className="floating-orbs">
                 <div className="orb orb-animate orb-1"></div>
                 <div className="orb orb-animate orb-2"></div>
                 <div className="orb orb-animate orb-3"></div>
             </div>
 
             <section className="hero">
                 <div className="hero-badge">
                     📚 EXPLORE COURSES
                 </div>
                 <h1 className="hero-title">
                     Master Production-Grade Skills
                 </h1>
                 <p className="hero-subtitle">
                     Join India&apos;s most practical, project-based learning ecosystem. Build real-world expertise with industry veterans.
                 </p>
             </section>
 
             <main className="main-container">
                 <div className="courses-layout">
                     {/* Content Area */}
                     <div className="content-area">
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
                                         <span className="pill-icon inline-flex items-center justify-center">
                                             {tab.id === 'Microsoft' ? (
                                                 <svg className="w-3 h-3 mr-0.5" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                     <rect x="0" y="0" width="10.5" height="10.5" fill="#F25022"/>
                                                     <rect x="11.5" y="0" width="10.5" height="10.5" fill="#7FBA00"/>
                                                     <rect x="0" y="11.5" width="10.5" height="10.5" fill="#00A4EF"/>
                                                     <rect x="11.5" y="11.5" width="10.5" height="10.5" fill="#FFB900"/>
                                                 </svg>
                                             ) : tab.icon}
                                         </span>
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
 
                         <div className="controls-section">
                            <form onSubmit={handleSearch} className="search-container">
                                <span className="search-icon">🔍</span>
                                <input
                                    type="text"
                                    className="search-input"
                                    placeholder="Search courses, skills..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </form>

                            <div className="relative">
                                <button
                                    type="button"
                                    className="sort-btn"
                                    onClick={() => setShowSortDropdown(!showSortDropdown)}
                                >
                                    {sortOptions.find(o => o.value === currentSort)?.label || 'Sort'}
                                    <span style={{ transform: showSortDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block' }}>▼</span>
                                </button>

                                <AnimatePresence>
                                    {showSortDropdown && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute right-0 top-full mt-2 w-48 bg-white border border-[#E5E7EB] rounded-2xl shadow-lg z-20 overflow-hidden"
                                        >
                                            {sortOptions.map(option => (
                                                <button
                                                    key={option.value}
                                                    onClick={() => {
                                                        updateFilters({ sort: option.value });
                                                        setShowSortDropdown(false);
                                                    }}
                                                    className="w-full text-left px-5 py-3 text-[0.95rem] font-medium text-[#6B7280] hover:bg-[#F8F5F0] hover:text-[#1B4332] transition-colors"
                                                >
                                                    {option.label}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex justify-center items-center py-20">
                                <Loader2 className="w-10 h-10 animate-spin text-[#1B4332]" />
                            </div>
                        ) : (
                            <div className="courses-grid">
                                {sortedDisplayCourses.length > 0 ? (
                                    sortedDisplayCourses.map((course, index) => (
                                        <CourseCard
                                            key={course.id}
                                            course={course}
                                            index={index}
                                            isWishlisted={wishlistedIds.has(course.id)}
                                            onToggleWishlist={toggleWishlist}
                                        />
                                    ))
                                ) : (
                                    <div className="empty-state">
                                        <div className="empty-icon">🔍</div>
                                        <h3 className="empty-title">No Courses Found</h3>
                                        <p className="empty-subtitle">
                                            Adjust your filters or search to discover more learning paths.
                                        </p>
                                        <button
                                            className="reset-btn"
                                            onClick={() => {
                                                setSearch('');
                                                updateFilters({ category: 'All', q: '', page: null, sort: 'newest' });
                                            }}
                                        >
                                            Reset Filters
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Load More Trigger */}
                        {hasMore && (
                            <div className="load-more-section mt-16 flex justify-center">
                                <button
                                    onClick={handleLoadMore}
                                    disabled={loadingMore}
                                    className="load-more-btn px-10 py-5 bg-white border-2 border-[#1B4332]/10 rounded-2xl font-bold text-[#1B4332] hover:bg-[#1B4332] hover:text-white transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {loadingMore ? (
                                        <span className="flex items-center gap-2"><Loader2 className="animate-spin" /> Loading...</span>
                                    ) : (
                                        'Load More Courses'
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

const getCourseDuration = (title: string, duration?: number | null, lessonsCount?: number) => {
    const lowercaseTitle = title.toLowerCase();
    if (lowercaseTitle.includes('microsoft') || lowercaseTitle.includes('devops')) {
        return "15 Days";
    }
    if (lowercaseTitle.includes('chatgpt') || lowercaseTitle.includes('30 days')) {
        return "1 Month";
    }
    return "2 Months";
};

const CourseCard = memo(({ course, index, isWishlisted, onToggleWishlist }: {
    course: Course,
    index: number,
    isWishlisted: boolean,
    onToggleWishlist: (e: React.MouseEvent, id: string) => void
}) => {
    const [imgError, setImgError] = useState(false);

    const levelLabel = course.level
      ? course.level.toLowerCase().includes('adv')
        ? 'Adv.'
        : course.level.toLowerCase().includes('inter')
          ? 'Inter.'
          : 'Basic'
      : 'Basic';

    const thumbnailSrc =
      course.thumbnail && !imgError && !course.thumbnail.includes('placeholder')
        ? (course.thumbnail.startsWith('http') || course.thumbnail.startsWith('/') ? course.thumbnail : `/${course.thumbnail}`)
        : '/images/course-thumbnail-img-05.jpg';

    const instructorName =
      typeof course.instructor === 'string'
        ? course.instructor
        : course.instructor?.name || 'Sabiha Siddiqui';

    const lessonsCount = course._count?.lessons ? `${course._count.lessons} Lessons` : '14 Lessons';
    const durationText = getCourseDuration(course.title, course.duration, course._count?.lessons) || '11h 30m';
    const ratingText = course.rating ? `${course.rating.toFixed(1)} ★` : '4.8 ★';

    return (
      <article
        className="bg-white border border-slate-200/90 rounded-[28px] p-6 sm:p-7 flex flex-col justify-between shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_45px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 group"
        style={{ animationDelay: `${(index % 4) * 0.1}s` }}
      >
        <div>
          {/* Thumbnail area: exact 16:9 aspect ratio */}
          <div className="aspect-[16/9] w-full rounded-[20px] overflow-hidden relative shrink-0 bg-slate-100 mb-6">
            <Link href={`/courses/${course.slug || course.id}`} className="block w-full h-full">
              <img
                src={thumbnailSrc}
                alt={course.title}
                className="object-cover w-full h-full group-hover:scale-[1.03] transition-transform duration-500 absolute inset-0"
                loading="lazy"
                onError={() => setImgError(true)}
              />
            </Link>
            {/* Level Badge in top-left */}
            <div className="absolute top-3.5 left-3.5 z-10 pointer-events-none">
              <span className="px-3.5 py-1.5 rounded-[10px] text-[13px] font-semibold bg-white/95 backdrop-blur-md text-[#0c211d] shadow-sm tracking-wide">
                Level:{levelLabel}
              </span>
            </div>
          </div>

          {/* Title and Instructor */}
          <div className="mb-6">
            <Link href={`/courses/${course.slug || course.id}`}>
              <h3 className="text-[21px] sm:text-[22px] lg:text-[23.5px] font-bold text-[#0c211d] font-instrument leading-snug tracking-tight group-hover:text-emerald-800 transition-colors line-clamp-2 min-h-[3.6rem]">
                {course.title}
              </h3>
            </Link>
            <p className="text-[14px] sm:text-[14.5px] text-[#606b68] line-clamp-1 mt-2 font-normal">
              {instructorName}
            </p>
          </div>
        </div>

        {/* Card Bottom: Metadata and Action Button */}
        <div className="pt-2">
          {/* Meta Strip */}
          <div className="flex items-center justify-between py-3.5 border-t border-slate-100 text-[13.5px] sm:text-[14px] text-[#606b68] font-normal">
            <div className="flex items-center gap-1.5">
              <img
                src="/images/course-icon-01.svg"
                alt="Notes"
                className="w-4 h-4 object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span>{lessonsCount}</span>
            </div>
            <div className="w-[1px] h-3.5 bg-slate-200" />
            <div>
              <span>{durationText}</span>
            </div>
            <div className="w-[1px] h-3.5 bg-slate-200" />
            <div className="font-semibold text-[#0c211d]">
              <span>{ratingText}</span>
            </div>
          </div>

          {/* Enroll Now Button */}
          <Link href={`/courses/${course.slug || course.id}`} className="mt-5 block w-full">
            <button className="w-full py-3.5 sm:py-4 rounded-[14px] border border-[#0c211d]/30 hover:border-[#0c211d] hover:bg-[#0c211d] hover:text-white text-[#0c211d] font-semibold text-[15px] sm:text-[15.5px] transition-all duration-200 active:scale-[0.98] flex items-center justify-center cursor-pointer font-instrument">
              Enroll Now
            </button>
          </Link>
        </div>
      </article>
    );
});
CourseCard.displayName = 'CourseCard';

