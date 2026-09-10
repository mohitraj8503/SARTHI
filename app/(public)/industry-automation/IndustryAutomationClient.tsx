'use client';

import { useState, useEffect, useMemo, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Filter, X, Check, Users, Clock, Zap,
    Briefcase, Award, ArrowRight, Loader2, ChevronDown, Tag
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { MotionCard, MotionButton } from '@/components/ui/MotionContainer';

const CATEGORY_TABS = [
    { id: 'All', label: 'All', icon: '📚' },
    { id: 'Technology', label: 'Technology', icon: '💻' },
    { id: 'Artificial Intelligence', label: 'Artificial Intelligence', icon: '✨' },
    { id: 'Commerce & Management', label: 'Commerce & Management', icon: '💼' },
    { id: 'Personal Development', label: 'Personal Development', icon: '🌱' },
];

interface Project {
    id: string;
    title: string;
    description: string;
    category: string;
    budget: number | null;
    timeline: string | null;
    requirements: string | null;
    skills: string[];
    status: string;
    clientId: string;
    createdAt: string;
    client?: {
        id: string;
        name: string;
        image: string | null;
    };
    interestCount?: number;
}

interface ProjectInterest {
    id: string;
    projectId: string;
    status: string;
    createdAt: string;
    project?: Project;
}

function ProjectCard({
    project,
    index,
    hasInterest,
    onViewDetails
}: {
    project: Project;
    index: number;
    hasInterest: boolean;
    onViewDetails: () => void;
}) {
    const isExternalLink = project.requirements && (project.requirements.startsWith('http://') || project.requirements.startsWith('https://'));
    const isInternalLink = project.requirements && project.requirements.startsWith('/');
    const handleViewDetails = () => {
        if (isExternalLink) {
            window.open(project.requirements, '_blank', 'noopener,noreferrer');
        } else if (isInternalLink) {
            window.location.href = project.requirements!;
        } else {
            onViewDetails();
        }
    };

    // Safely parse skills string or array
    const skillsArray = typeof project.skills === 'string'
        ? project.skills.split(',').map(s => s.trim()).filter(Boolean)
        : (Array.isArray(project.skills) ? project.skills : []);

    const isCalculator = project.title?.toLowerCase().includes('calculator');
    const isFtw = project.title?.toLowerCase().includes('ftw');
    const isLaxido = project.title?.toLowerCase().includes('laxido');
    const isPresenceX = project.title?.toLowerCase().includes('presencex');
    const isHerCare = project.title?.toLowerCase().includes('hercare');
    const isMsme = project.title?.toLowerCase().includes('msme');
    const isGitMasterclass = project.title?.toLowerCase().includes('masterclass');
    const isKeralaHealth = project.title?.toLowerCase().includes('kerala');

    return (
        <MotionCard
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: (index % 3) * 0.1, duration: 0.5 }}
            whileHover={{ y: -6, scale: 1.01, boxShadow: '0 12px 30px rgba(0,0,0,0.08)' }}
            className="group bg-white rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition-all duration-300 border border-gray-100 flex flex-col h-full hover:border-gray-200"
        >
            {/* Image/Header Container */}
            <div className={cn(
                "relative h-[220px] overflow-hidden flex items-center justify-center border-b border-gray-100",
                isFtw ? "bg-black" : (isGitMasterclass ? "bg-[#FCD863]" : (isLaxido || isPresenceX || isHerCare || isMsme || isKeralaHealth ? "bg-white" : "bg-[#F8F5F0]"))
            )}>
                {hasInterest && (
                    <div className="absolute top-4 right-4 z-20">
                        <span className="px-2 py-0.5 bg-[#ECFDF5] text-[#10B981] border border-[#A7F3D0] text-[9px] font-bold uppercase tracking-wider rounded">
                            APPLIED
                        </span>
                    </div>
                )}
                {isCalculator ? (
                    <img
                        src="/ai-calculator-thumbnail.png"
                        alt={project.title}
                        className="w-full h-full object-cover object-[92%_center] sm:object-center transition-transform duration-700 ease-out scale-[1.15]"
                    />
                ) : isFtw ? (
                    <img
                        src="/ftw-championships-thumbnail.png"
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out transform scale-[1.15] group-hover:scale-[1.2]"
                    />
                ) : isLaxido ? (
                    <img
                        src="/laxido-pharma-thumbnail.png"
                        alt={project.title}
                        className="w-full h-full object-contain p-4 transition-transform duration-700 ease-out transform scale-[1.25] group-hover:scale-[1.3]"
                    />
                ) : isPresenceX ? (
                    <img
                        src="/presencex-thumbnail.png"
                        alt={project.title}
                        className="w-full h-full object-contain p-4 transition-transform duration-700 ease-out transform scale-[1.25] group-hover:scale-[1.3]"
                    />
                ) : isCalculator ? (
                    <img
                        src="/industrial-ai-calculator-thumbnail.png"
                        alt={project.title}
                        className="w-full h-full object-contain p-2 transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                ) : isHerCare ? (
                    <img
                        src="/hercare-thumbnail.png"
                        alt={project.title}
                        className="w-full h-full object-contain p-2 transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                ) : isMsme ? (
                    <img
                        src="/msme-thumbnail.png"
                        alt={project.title}
                        className="w-full h-full object-contain p-2 transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                ) : isGitMasterclass ? (
                    <img
                        src="/github-masterclass-thumbnail.png"
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                ) : isKeralaHealth ? (
                    <img
                        src="/kerala-health-thumbnail.png"
                        alt={project.title}
                        className="w-full h-full object-contain p-2 transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                ) : project.client?.image ? (
                    <img
                        src={project.client.image}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                ) : (
                    <div className="text-center">
                        <Briefcase className="w-12 h-12 text-[#1B4332]/10" />
                    </div>
                )}
            </div>

            <div className="p-4 sm:p-5 flex flex-col flex-1">
                <h3 onClick={handleViewDetails} className="text-[1.05rem] sm:text-[1.1rem] font-bold text-[#1F2937] mb-2 line-clamp-2 hover:text-[#0066FF] transition-colors cursor-pointer leading-snug">
                    {project.title}
                </h3>

                <p className="text-[0.825rem] text-gray-500 leading-relaxed mb-4 line-clamp-3">
                    {project.description}
                </p>

                {/* Skills Section */}
                {skillsArray.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                        {skillsArray.map(skill => (
                            <span key={skill} className="px-2.5 py-1 bg-gray-50 text-gray-600 border border-gray-100 text-[9px] font-bold rounded uppercase tracking-wide">
                                {skill}
                            </span>
                        ))}
                    </div>
                )}

                {/* Metadata Row */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-gray-500 gap-2 mb-4 pt-3 border-t border-gray-100">
                    <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Budget</span>
                        <span className="text-[1.05rem] font-black text-gray-800">
                            {project.budget && project.budget > 0 ? `₹${project.budget.toLocaleString()}` : 'Free'}
                        </span>
                    </div>
                    <div className="flex flex-col items-start sm:items-end">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Timeline</span>
                        <span className="text-[0.825rem] font-semibold text-gray-700 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            {project.timeline || 'TBD'}
                        </span>
                    </div>
                </div>

                {/* Card Footer */}
                <div className="mt-auto pt-3 border-t border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 min-w-0">
                        <span className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-[#1B4332] border border-emerald-200/60 text-[10px] font-black uppercase tracking-wider rounded-md truncate shadow-2xs w-full sm:w-auto">
                            <Tag className="w-3 h-3 shrink-0 text-emerald-600" />
                            <span className="truncate">{project.category || 'Artificial Intelligence'}</span>
                        </span>
                    </div>

                    <MotionButton
                        onClick={handleViewDetails}
                        className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold rounded-full transition-all duration-300 active:scale-95 shadow-sm w-full sm:w-auto"
                    >
                        {isExternalLink ? 'Visit Website' : 'Details'} <ArrowRight className="w-3.5 h-3.5" />
                    </MotionButton>
                </div>
            </div>
        </MotionCard>
    );
}

const MemoizedProjectCard = memo(ProjectCard);

export default function IndustryAutomationClient() {
    const [industryProjects, setIndustryProjects] = useState<Project[]>([]);
    const [myInterests, setMyInterests] = useState<ProjectInterest[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [sortBy, setSortBy] = useState('latest');
    const { user } = useAuth();

    const fetchProjects = useCallback(async () => {
        try {
            const params = new URLSearchParams();
            if (selectedCategory !== 'All') params.set('category', selectedCategory);
            if (search) params.set('search', search);
            params.set('sort', sortBy);

            const res = await fetch(`/api/industry-automation/projects?${params}`);
            if (!res.ok) throw new Error();
            const data = await res.json();
            setIndustryProjects(data.projects || []);
        } catch (error) {
            console.error('Failed to fetch projects:', error);
            setIndustryProjects([]);
        } finally {
            setLoading(false);
        }
    }, [search, sortBy, selectedCategory]);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    useEffect(() => {
        const fetchMyInterests = async () => {
            try {
                const res = await fetch('/api/industry-automation/my-interests');
                if (!res.ok) return;
                const data = await res.json();
                setMyInterests(data.interests || []);
            } catch (e) { }
        };
        fetchMyInterests();
    }, []);

    const hasInterest = (projectId: string) => myInterests.some(i => i.projectId === projectId);

    const categories = useMemo(() => {
        const discovered = Array.from(new Set(industryProjects.map(p => p.category).filter(Boolean)));
        return ['All', ...discovered];
    }, [industryProjects]);

    const technicalProjects = useMemo(() => {
        return industryProjects.filter(p => {
            const cat = (p.category || '').toLowerCase();
            return !cat.includes('management') && !cat.includes('business') && !cat.includes('strategic') && !cat.includes('competency');
        });
    }, [industryProjects]);

    const businessProjects = useMemo(() => {
        return industryProjects.filter(p => {
            const cat = (p.category || '').toLowerCase();
            return cat.includes('management') || cat.includes('business') || cat.includes('strategic') || cat.includes('competency');
        });
    }, [industryProjects]);

    // 🧠 Standardized Parallax Orbs
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const orbs = document.querySelectorAll('.auto-orb');
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

    return (
        <div className="automation-page-wrapper">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                
                .automation-page-wrapper {
                    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    background: linear-gradient(135deg, #FDFBF7 0%, #F8F5F0 100%);
                    color: #1F2937;
                    min-height: calc(100vh - 60px);
                    position: relative;
                    zoom: 1.1;
                }

                .automation-orbs {
                    position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden;
                }

                .automation-orb {
                    position: absolute; border-radius: 50%; opacity: 0.08;
                    animation: orb-float 20s infinite ease-in-out;
                    transition: transform 0.1s ease-out;
                }

                .orb-1 { width: 600px; height: 600px; background: #1B4332; top: -200px; right: -100px; }
                .orb-2 { width: 400px; height: 400px; background: #40916C; bottom: -100px; left: -100px; }

                @keyframes orb-float {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 30px) scale(0.9); }
                }

                .shell {
                    position: relative; z-index: 10;
                    max-width: 1400px; margin: 0 auto;
                    padding: 10rem 2rem 6rem;
                }

                .auto-hero { margin-bottom: 3rem; }

                .badge {
                    display: inline-flex; align-items: center; gap: 0.5rem;
                    background: linear-gradient(135deg, rgba(27, 67, 50, 0.1) 0%, rgba(45, 106, 79, 0.1) 100%);
                    color: #1B4332; padding: 0.625rem 1.25rem; border-radius: 50px;
                    font-size: 0.875rem; font-weight: 600; margin-bottom: 1.5rem; letter-spacing: 0.5px;
                }

                .title {
                    font-size: clamp(2.5rem, 5vw, 4rem); font-weight: 800; color: #1B4332;
                    line-height: 1.1; margin-bottom: 1.5rem; letter-spacing: -1px;
                }

                .subtitle {
                    font-size: 1.25rem; color: #6B7280; max-width: 650px; line-height: 1.7;
                }

                /* Standardized Controls Row */
                .controls-row {
                    display: flex; flex-wrap: wrap; align-items: center; gap: 2rem;
                    margin-bottom: 4rem;
                }

                .search-container { position: relative; flex: 1; min-width: 300px; }

                .search-input {
                    // width: 100%; padding: 1.25rem 1.5rem 1.25rem 3.5rem;
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

                .sort-group { display: flex; background: white; border-radius: 16px; padding: 4px; border: 2px solid #E5E7EB; }
                .sort-tab { padding: 0.75rem 1.25rem; border-radius: 12px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; cursor: pointer; transition: all 0.3s ease; }
                .sort-tab.is-active { background: #1B4332; color: white; }

                .projects-grid {
                    display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
                    gap: 2.5rem;
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
                    .shell { padding: 8rem 1.5rem 4rem; }
                    .controls-row { flex-direction: column; align-items: stretch; }
                }
            `}</style>

            <div className="automation-orbs">
                <div className="automation-orb auto-orb orb-1"></div>
                <div className="automation-orb auto-orb orb-2"></div>
            </div>

            <div className="shell">
                <section className="auto-hero">
                    <div className="badge">⚙️ INDUSTRIAL INNOVATION</div>
                    <h1 className="title">Industry-Ready Projects</h1>
                    <p className="subtitle">
                        Discover production-grade automation projects and high-impact industrial solutions built by India&apos;s top engineers.
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

                <div className="controls-row">
                    <div className="search-container">
                        <Search className="search-icon w-5 h-5" />
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Explore automation stack, projects..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="sort-group">
                        {['latest', 'popular'].map(s => (
                            <button
                                key={s}
                                className={cn("sort-tab", sortBy === s && "is-active")}
                                onClick={() => setSortBy(s)}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 1. Technical & AI Section */}
                <div className="mb-16">
                    <div className="flex flex-wrap items-center gap-3 mb-6 border-b border-[#E5E7EB] pb-4">
                        <Zap className="w-5 h-5 text-[#2D6A4F]" />
                        <div>
                            <h2 className="text-xl font-black text-[#1B4332]">Technical & AI Solutions</h2>
                            <p className="text-xs text-gray-500">Engineering, software, IoT telemetry, and artificial intelligence projects.</p>
                        </div>
                        <span className="ml-auto px-3 py-1 bg-[#EAF2EE] text-[#1B4332] text-xs font-bold rounded-full">
                            {technicalProjects.length} {technicalProjects.length === 1 ? 'Project' : 'Projects'}
                        </span>
                    </div>

                    <div className="projects-grid">
                        <AnimatePresence mode="popLayout">
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <div key={i} className="bg-white/40 backdrop-blur-sm border border-white rounded-[28px] h-[550px] animate-pulse p-6 flex flex-col justify-between">
                                        <div>
                                            <div className="h-[220px] bg-gray-200/50 rounded-[20px] mb-4" />
                                            <div className="h-6 bg-gray-200/50 rounded-md w-3/4 mb-3" />
                                            <div className="h-4 bg-gray-200/30 rounded-md w-full mb-2" />
                                            <div className="h-4 bg-gray-200/30 rounded-md w-5/6" />
                                        </div>
                                        <div className="flex justify-between items-center mt-4">
                                            <div className="h-8 bg-gray-200/50 rounded-full w-24" />
                                            <div className="h-8 bg-gray-200/50 rounded-full w-20" />
                                        </div>
                                    </div>
                                ))
                            ) : technicalProjects.length > 0 ? (
                                technicalProjects.map((project, index) => (
                                    <MemoizedProjectCard
                                        key={project.id}
                                        project={project}
                                        index={index}
                                        hasInterest={hasInterest(project.id)}
                                        onViewDetails={() => window.alert('Details coming soon')}
                                    />
                                ))
                            ) : (
                                <div className="col-span-full py-12 bg-white/40 backdrop-blur-sm rounded-[2rem] border border-white text-center">
                                    <Search className="w-10 h-10 text-[#1B4332]/20 mx-auto mb-3" />
                                    <h3 className="text-lg font-bold text-[#1B4332]">No projects found</h3>
                                    <p className="text-[#6B7280] text-xs mt-1">Adjust filters or search parameters.</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* 2. Strategic Management & Business Competency Section */}
                {businessProjects.length > 0 && (
                    <div>
                        <div className="flex flex-wrap items-center gap-3 mb-6 border-b border-[#E5E7EB] pb-4">
                            <Award className="w-5 h-5 text-[#40916C]" />
                            <div>
                                <h2 className="text-xl font-black text-[#1B4332]">Strategic Management & Business Competency</h2>
                                <p className="text-xs text-gray-500">Process management, business analysis, operations strategy, and competency frameworks.</p>
                            </div>
                            <span className="ml-auto px-3 py-1 bg-[#F4F8F6] text-[#2D6A4F] text-xs font-bold rounded-full">
                                {businessProjects.length} {businessProjects.length === 1 ? 'Project' : 'Projects'}
                            </span>
                        </div>

                        <div className="projects-grid">
                            <AnimatePresence mode="popLayout">
                                {loading ? (
                                    [1, 2, 3].map(i => (
                                        <div key={i} className="bg-white/40 backdrop-blur-sm border border-white rounded-[28px] h-[550px] animate-pulse p-6 flex flex-col justify-between">
                                            <div>
                                                <div className="h-[220px] bg-gray-200/50 rounded-[20px] mb-4" />
                                                <div className="h-6 bg-gray-200/50 rounded-md w-3/4 mb-3" />
                                                <div className="h-4 bg-gray-200/30 rounded-md w-full mb-2" />
                                                <div className="h-4 bg-gray-200/30 rounded-md w-5/6" />
                                            </div>
                                            <div className="flex justify-between items-center mt-4">
                                                <div className="h-8 bg-gray-200/50 rounded-full w-24" />
                                                <div className="h-8 bg-gray-200/50 rounded-full w-20" />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <>
                                        {/* Dynamic business project cards */}
                                        {businessProjects.map((project, index) => (
                                            <MemoizedProjectCard
                                                key={project.id}
                                                project={project}
                                                index={index + 1}
                                                hasInterest={hasInterest(project.id)}
                                                onViewDetails={() => window.alert('Details coming soon')}
                                            />
                                        ))}
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

