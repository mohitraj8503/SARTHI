'use client';

import { useState, useEffect, useRef } from 'react';
import {
    Search,
    X,
    Users,
    GraduationCap,
    BookOpen,
    Calendar,
    Command,
    ArrowRight,
    TrendingUp,
    Clock,
    History,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface SearchResultItem {
    id: string;
    title: string;
    subtitle: string;
    url: string;
}

interface SearchResultSection {
    category: string;
    items: SearchResultItem[];
}

export function AdminGlobalSearch() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResultSection[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(true);
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
        }
    }, [isOpen]);

    // Debounced search
    useEffect(() => {
        if (!query) {
            setResults([]);
            return;
        }
        const timer = setTimeout(async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/admin/search?q=${query}`);
                const data = await res.json();
                setResults(data.results || []);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [query]);

    const categories = [
        { label: 'Students', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
        { label: 'Teachers', icon: GraduationCap, color: 'text-purple-500', bg: 'bg-purple-50' },
        { label: 'Courses', icon: BookOpen, color: 'text-green-500', bg: 'bg-green-50' },
        { label: 'Seminars', icon: Calendar, color: 'text-orange-500', bg: 'bg-orange-50' },
    ];

    return (
        <>
            {/* Search Trigger */}
            <div className="hidden md:block relative group w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A8FAF] group-focus-within:text-[#1C2B4A] transition-colors" aria-hidden="true" />
                <input
                    type="text"
                    placeholder="Search system..."
                    aria-label="Search system (Cmd+K)"
                    readOnly
                    onClick={() => setIsOpen(true)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white border border-[#E2E8F4] cursor-pointer text-[13px] text-[#1C2B4A] placeholder-[#7A8FAF] focus:outline-none shadow-sm hover:border-[#1C2B4A] transition-all"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-0.5 bg-[#F8F9FC] border border-[#E2E8F4] rounded text-[9px] font-bold text-[#7A8FAF]">
                    <Command className="w-2.5 h-2.5" /> K
                </div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[150] flex items-start justify-center pt-[10vh] px-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-[#1C2B4A]/60 backdrop-blur-md"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            className="w-full max-w-2xl bg-white rounded-[28px] shadow-2xl overflow-hidden border border-[#E2E8F4] flex flex-col max-h-[70vh] relative z-10"
                        >
                            <div className="p-6 border-b border-[#F0F2F8] relative">
                                <Search className="absolute left-10 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1C2B4A]" />
                                <input
                                    ref={inputRef}
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && query.trim()) {
                                            router.push(`/admin/search?q=${encodeURIComponent(query)}`);
                                            setIsOpen(false);
                                        }
                                    }}
                                    placeholder="What are you looking for?"
                                    aria-label="What are you looking for?"
                                    className="w-full pl-12 pr-12 py-4 bg-transparent text-[18px] font-bold text-[#1C2B4A] outline-none placeholder:text-[#A8B8D8] placeholder:font-medium"
                                />
                                <button
                                    onClick={() => setIsOpen(false)}
                                    aria-label="Close search"
                                    className="absolute right-8 top-1/2 -translate-y-1/2 p-2 bg-[#F8F9FC] text-[#7A8FAF] rounded-xl hover:text-[#1C2B4A] transition-all"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto admin-scrollbar">
                                {!query ? (
                                    <div className="p-8">
                                        <h4 className="text-[11px] font-extrabold text-[#7A8FAF] uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                            <TrendingUp className="w-3.5 h-3.5" /> Quick Navigation
                                        </h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            {categories.map((cat) => (
                                                <button
                                                    key={cat.label}
                                                    onClick={() => {
                                                        router.push(`/admin/${cat.label.toLowerCase()}`);
                                                        setIsOpen(false);
                                                    }}
                                                    className="flex items-center gap-4 p-4 rounded-2xl border border-[#E2E8F4] hover:border-[#1C2B4A] hover:bg-[#F8F9FC] transition-all group"
                                                >
                                                    <div className={cn("p-3 rounded-xl", cat.bg, cat.color)}>
                                                        <cat.icon className="w-5 h-5" />
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="text-[14px] font-bold text-[#1C2B4A] group-hover:translate-x-1 transition-transform">{cat.label}</p>
                                                        <p className="text-[10px] font-medium text-[#7A8FAF]">Manage all {cat.label.toLowerCase()}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>

                                        <div className="mt-10">
                                            <h4 className="text-[11px] font-extrabold text-[#7A8FAF] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                                <History className="w-3.5 h-3.5" /> Recent Searches
                                            </h4>
                                            <div className="space-y-2">
                                                {['Spring Boot 2024', 'Mukul Pandey', 'Payment Failures'].map(recent => (
                                                    <button key={recent} className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-[#F8F9FC] text-[13px] font-medium text-[#1C2B4A] group transition-colors">
                                                        <Clock className="w-4 h-4 text-[#A8B8D8]" />
                                                        {recent}
                                                        <ArrowRight className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-4 space-y-6">
                                        {isLoading ? (
                                            <div className="flex items-center justify-center py-12">
                                                <Loader2 className="w-8 h-8 text-[#1C2B4A] animate-spin opacity-20" />
                                            </div>
                                        ) : results.length > 0 ? (
                                            results.map((section) => (
                                                <div key={section.category} className="space-y-2">
                                                    <h5 className="px-4 text-[10px] font-black text-[#7A8FAF] uppercase tracking-widest">{section.category}</h5>
                                                    <div className="space-y-1">
                                                        {section.items.map((item) => (
                                                            <button
                                                                key={item.id}
                                                                onClick={() => {
                                                                    router.push(item.url);
                                                                    setIsOpen(false);
                                                                }}
                                                                className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-[#1C2B4A] group transition-all"
                                                            >
                                                                <div className="text-left">
                                                                    <p className="text-[14px] font-bold text-[#1C2B4A] group-hover:text-white transition-colors">{item.title}</p>
                                                                    <p className="text-[11px] font-medium text-[#7A8FAF] group-hover:text-white/60 transition-colors">{item.subtitle}</p>
                                                                </div>
                                                                <ArrowRight className="w-4 h-4 text-[#E8B84B] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-12">
                                                <div className="w-16 h-16 bg-[#F8F9FC] rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#A8B8D8]">
                                                    <Search className="w-8 h-8" />
                                                </div>
                                                <h4 className="text-[16px] font-bold text-[#1C2B4A]">No direct matches</h4>
                                                <p className="text-[13px] text-[#7A8FAF] mt-1 mb-6">Try searching for broader keywords.</p>
                                                <button
                                                    onClick={() => {
                                                        router.push(`/admin/search?q=${query}`);
                                                        setIsOpen(false);
                                                    }}
                                                    className="text-[12px] font-bold text-[#1C2B4A] underline"
                                                >
                                                    View advanced search results
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="p-4 border-t border-[#F0F2F8] bg-[#F8F9FC] flex items-center justify-center gap-6 text-[10px] font-bold text-[#7A8FAF] uppercase tracking-widest">
                                <span className="flex items-center gap-1.5"><motion.span animate={{ y: [0, -2, 0] }} transition={{ repeat: Infinity, duration: 2 }}>↑↓</motion.span> Navigate</span>
                                <span className="flex items-center gap-1.5"><span className="px-1.5 py-0.5 border border-[#E2E8F4] rounded bg-white">Enter</span> Select</span>
                                <span className="flex items-center gap-1.5"><span className="px-1.5 py-0.5 border border-[#E2E8F4] rounded bg-white">ESC</span> Close</span>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}

