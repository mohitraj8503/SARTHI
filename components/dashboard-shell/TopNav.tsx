'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Search, Menu, X, BookOpen, Video, PlayCircle, Zap, FileText } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { NotificationBell } from '@/components/notifications/NotificationBell';


interface TopNavProps {
    onMenuClick: () => void;
}

interface SearchResult {
    type: 'course' | 'lesson' | 'seminar' | 'workshop' | 'video';
    id: string;
    title: string;
    description?: string;
    link: string;
}

export function TopNav({ onMenuClick }: TopNavProps) {
    const { user } = useAuth();
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [searching, setSearching] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);


    const displayName = user?.name || 'Student';
    const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=D4956A&color=FFFFFF&bold=true`;
    const displayAvatar = user?.image || user?.profileImage || fallbackAvatar;

    // Search effect
    useEffect(() => {
        if (searchQuery.length >= 2) {
            setSearching(true);
            const timer = setTimeout(async () => {
                try {
                    const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
                    const results = await response.json();
                    setSearchResults(results.data || []);
                } catch (err) {
                    setSearchResults([]);
                } finally {
                    setSearching(false);
                }
            }, 300);
            return () => clearTimeout(timer);
        } else {
            setSearchResults([]);
        }
    }, [searchQuery]);

    // Keyboard shortcut for search
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setSearchOpen(true);
            }
            if (e.key === 'Escape') {
                setSearchOpen(false);
            }

        };
        
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Focus input when search opens
    useEffect(() => {
        if (searchOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [searchOpen]);

    const getIconForType = (type: string) => {
        switch (type) {
            case 'course': return <BookOpen className="w-4 h-4" />;
            case 'seminar': return <Video className="w-4 h-4" />;
            case 'lesson': return <PlayCircle className="w-4 h-4" />;
            case 'workshop': return <Zap className="w-4 h-4" />;
            default: return <FileText className="w-4 h-4" />;
        }
    };

    return (
        <>
            <header role="banner" className="sticky top-0 z-[140] h-20 w-full bg-[#F7F4EF]/80 backdrop-blur-xl transition-all duration-300 border-b border-[#EAE6DF]/50">
                <div className="flex h-full items-center justify-between px-4 md:px-10 max-w-[1440px] mx-auto lg:mx-0 lg:max-w-none">

                    {/* Mobile Branding & Side Toggle - Optimized Touch Targets */}
                    <div className="flex items-center gap-2 lg:hidden">
                        <button 
                            onClick={onMenuClick} 
                            className="w-12 h-12 flex items-center justify-center text-[#1B4332] hover:bg-white/40 rounded-2xl transition-all active:scale-90" 
                            aria-label="Open navigation menu"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        
                        <Link href="/dashboard" className="flex flex-col group active:scale-95 transition-transform ml-2">
                            <span className="text-[14px] font-black text-[#1B4332] tracking-tighter leading-none uppercase italic">SARTHI</span>
                            <span className="text-[8px] font-black text-[#D4956A] uppercase tracking-[0.3em] leading-none mt-1">Student_Portal</span>
                        </Link>
                    </div>

                    {/* Desktop Search Bar */}
                    <div className="hidden md:flex flex-1 max-w-md ml-4 lg:ml-0">
                        <button 
                            onClick={() => setSearchOpen(true)}
                            className="relative w-full group cursor-pointer"
                            aria-label="Open search"
                        >
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-[#5D705C] group-focus-within:text-[#D4956A] transition-colors" />
                            </div>
                            <div className="block w-full pl-11 pr-12 py-2.5 border border-[#EAE6DF] rounded-full leading-5 bg-white text-[#2A3828] text-[13px] font-nunito transition-all shadow-sm text-left cursor-pointer">
                                <span className="text-[#5D705C]">Search courses, lessons...</span>
                            </div>
                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                <span className="px-1.5 py-px rounded bg-[#F0ECE4] text-[10px] text-[#5D705C] font-medium font-nunito tracking-wide">⌘K</span>
                            </div>
                        </button>
                    </div>

                    {/* Header Actions - Mobile Optimized */}
                    <div className="flex items-center gap-2 md:gap-6 ml-auto">
                        {/* Mobile Search Icon */}
                        <button 
                            onClick={() => setSearchOpen(true)} 
                            className="w-12 h-12 flex items-center justify-center text-[#5D705C] hover:bg-white/40 rounded-2xl lg:hidden transition-all active:scale-90" 
                            aria-label="Open search"
                        >
                            <Search className="w-5 h-5" />
                        </button>

                        {/* Desktop Notification Bell */}
                        <div className="hidden lg:block">
                            <NotificationBell />
                        </div>


                        <div className="h-8 w-px bg-[#EAE6DF] hidden md:block mx-2"></div>

                        {/* Top Avatar - Optimized for Touch */}
                        <Link href="/dashboard/settings" className="flex items-center p-1 rounded-full hover:bg-white/40 transition-all active:scale-95">
                            <div className="h-10 w-10 rounded-full bg-[#D4956A] p-[2px] border border-[#D4956A]/30 shadow-sm relative overflow-hidden">
                                <Image
                                    src={displayAvatar}
                                    alt={displayName}
                                    fill
                                    sizes="40px"
                                    className="object-cover rounded-full"
                                />
                            </div>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Search Modal */}
            {searchOpen && (
                <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" role="dialog" aria-modal="true" aria-label="Search">
                    <div className="absolute inset-0 bg-[#2A3828]/40 backdrop-blur-sm" onClick={() => setSearchOpen(false)} />
                    <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden mx-4">
                        <div className="flex items-center p-4 border-b border-[#EAE6DF]">
                            <Search className="w-5 h-5 text-[#5D705C] mr-3" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search courses, lessons, seminars, workshops..."
                                className="flex-1 text-[15px] outline-none placeholder:text-[#5D705C]"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                aria-label="Search input"
                            />
                            <button onClick={() => setSearchOpen(false)} aria-label="Close search">
                                <X className="w-5 h-5 text-[#5D705C] hover:text-[#2A3828]" />
                            </button>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                            {searching ? (
                                <div className="p-8 text-center text-[#5D705C]">Searching...</div>
                            ) : searchResults.length > 0 ? (
                                <div className="divide-y divide-[#EAE6DF]">
                                    {searchResults.map((result, i) => (
                                        <Link
                                            key={i}
                                            href={result.link}
                                            className="flex items-center gap-3 p-4 hover:bg-[#F7F4EF] transition-colors"
                                            onClick={() => setSearchOpen(false)}
                                        >
                                            <div className="w-8 h-8 bg-[#F7F4EF] rounded-lg flex items-center justify-center text-[#D4956A]">
                                                {getIconForType(result.type)}
                                            </div>
                                            <div>
                                                <p className="text-[13px] font-medium text-[#2A3828]">{result.title}</p>
                                                <p className="text-[10px] text-[#5D705C] capitalize">{result.type}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : searchQuery.length >= 2 ? (
                                <div className="p-8 text-center text-[#5D705C]">No results found</div>
                            ) : (
                                <div className="p-4">
                                    <p className="text-[10px] text-[#5D705C] mb-3">Quick links:</p>
                                    <div className="flex flex-wrap gap-2">
                                        <Link href="/courses" className="px-3 py-1.5 bg-[#F7F4EF] rounded-full text-[11px] text-[#2A3828] hover:bg-[#EAE6DF]" onClick={() => setSearchOpen(false)}>Courses</Link>
                                        <Link href="/dashboard/live" className="px-3 py-1.5 bg-[#F7F4EF] rounded-full text-[11px] text-[#2A3828] hover:bg-[#EAE6DF]" onClick={() => setSearchOpen(false)}>Seminars</Link>
                                        <Link href="/workshops" className="px-3 py-1.5 bg-[#F7F4EF] rounded-full text-[11px] text-[#2A3828] hover:bg-[#EAE6DF]" onClick={() => setSearchOpen(false)}>Workshops</Link>
                                        <Link href="/dashboard/assignments" className="px-3 py-1.5 bg-[#F7F4EF] rounded-full text-[11px] text-[#2A3828] hover:bg-[#EAE6DF]" onClick={() => setSearchOpen(false)}>Assignments</Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

