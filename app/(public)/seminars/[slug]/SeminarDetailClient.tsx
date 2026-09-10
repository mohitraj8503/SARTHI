'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Calendar, Clock, Users, Award, CheckCircle, AlertCircle,
    ArrowLeft, Video, Sparkles, Shield, Globe, Zap, Loader2, CheckCircle2, Play
} from 'lucide-react';
import Image from 'next/image';

interface SeminarDetailClientProps {
    seminar: any;
    isRegistered: boolean;
}

export default function SeminarDetailClient({ seminar, isRegistered: initialIsRegistered }: SeminarDetailClientProps) {
    const router = useRouter();
    const [isRegistered, setIsRegistered] = useState(initialIsRegistered);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const handleRegister = async () => {
        setLoading(true);
        try {
            // Attempt 1-click direct registration if already signed in
            const res = await fetch('/api/seminars/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ seminarId: seminar.id || seminar.slug })
            });

            if (res.ok) {
                const data = await res.json();
                setIsRegistered(true);
                setSuccessMessage(data.message || 'Seat reserved successfully! Confirmation sent to your email.');
                setLoading(false);
                return;
            }

            // If not authenticated (401) or other status, redirect to guest register page
            router.push(`/seminars/${seminar.slug || seminar.id}/register`);
        } catch (err) {
            router.push(`/seminars/${seminar.slug || seminar.id}/register`);
        } finally {
            setLoading(false);
        }
    };

    const formattedDate = (() => {
        const d = seminar.date ? new Date(seminar.date) : null;
        return d && d.getFullYear() !== 1970
            ? d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
            : 'Coming Soon';
    })();

    // Parse "what you'll learn" items based on category/title
    const aiLearnItems = [
        'ChatGPT for studying & productivity',
        'Claude for research & writing',
        'Gemini for learning & coding',
        'GitHub Copilot for programming',
        'Cursor AI for AI-powered development',
        'Canva AI for presentations & design',
        'Notion AI for notes & organization',
        'Perplexity AI for accurate research',
    ];

    const resumeLearnItems = [
        'Resume building secrets that beat the ATS',
        'LinkedIn profile optimization for inbound recruiters',
        'Designing a portfolio that showcases real impact',
        'Cold emailing and networking strategies that work',
        'Personal branding tactics for engineering students',
        'Negotiating salary packages for freshers'
    ];

    const genericLearnItems = [
        'Industry-relevant skills from expert practitioners',
        'Live Q&A and interactive discussion sessions',
        'Real-world case studies and practical examples',
        'Career roadmap and next steps guidance',
    ];

    const isAiSeminar = seminar.slug?.includes('ai-tools') || seminar.title?.toLowerCase().includes('ai');
    const isResumeSeminar = seminar.slug?.includes('resume') || seminar.title?.toLowerCase().includes('resume');

    const displayLearnItems = isAiSeminar 
        ? aiLearnItems 
        : isResumeSeminar 
            ? resumeLearnItems 
            : genericLearnItems;

    return (
        <div className="min-h-screen bg-[#F7F6F2] selection:bg-[#1A3C2E] selection:text-white pb-20 font-plus-jakarta relative overflow-hidden">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
                .font-plus-jakarta { font-family: 'Plus Jakarta Sans', sans-serif !important; }
                .floating-orbs { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0; overflow: hidden; }
                .orb { position: absolute; border-radius: 50%; opacity: 0.08; animation: float 25s infinite ease-in-out; }
                .orb-1 { width: 700px; height: 700px; background: radial-gradient(circle, #2D6A4F 0%, transparent 70%); top: -250px; right: -150px; }
                .orb-2 { width: 500px; height: 500px; background: radial-gradient(circle, #1B4332 0%, transparent 70%); bottom: -150px; left: -150px; }
                @keyframes float {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(40px, -60px) scale(1.05); }
                    66% { transform: translate(-30px, 40px) scale(0.95); }
                }
            `}</style>

            <div className="floating-orbs">
                <div className="orb orb-1"></div>
                <div className="orb orb-2"></div>
            </div>

            {/* Back Nav */}
            <div className="relative z-10 max-w-[1400px] mx-auto pt-28 px-8">
                <button
                    onClick={() => router.push('/seminars')}
                    className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-white rounded-2xl border border-gray-100 text-sm font-bold text-[#1A3C2E] hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
                >
                    <ArrowLeft size={16} /> Back to Seminars
                </button>
            </div>

            {/* Main Header / Banner */}
            <div className="max-w-[1400px] mx-auto mt-8 relative z-10 px-4">
                <div className="text-white p-12 md:p-16 rounded-[3rem] shadow-2xl relative overflow-hidden border border-white/5 min-h-[320px] flex items-center bg-[#0F172A]">
                    {/* Banner Image Background */}
                    <div className="absolute inset-0 z-0">
                        <Image 
                            src="https://cdn.pixabay.com/photo/2026/03/05/19/18/tylijura-conference-10157750_1280.jpg" 
                            alt={seminar.title} 
                            fill 
                            className="object-cover object-center filter brightness-[0.45] saturate-[1.25]"
                            priority
                        />
                        {/* Linear Gradient for better contrast overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/80 z-10" />
                    </div>
                    
                    <div className="max-w-3xl space-y-6 relative z-20">
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/20 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-wider text-amber-300 border border-amber-400/30 shadow-inner">
                            ⭐ Special Student Offer
                        </span>

                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight uppercase font-plus-jakarta italic text-white drop-shadow-lg">
                            {seminar.title}
                        </h1>

                        <p className="text-lg md:text-xl text-white/90 max-w-2xl leading-relaxed font-medium drop-shadow-sm">
                            {seminar.description?.split('\n\n')[0]?.replace('Stand Out. Get Hired.', '') || 'Join this interactive live seminar to dive deep into industry concepts with expert speakers.'}
                        </p>

                        <div className="flex flex-wrap gap-4 md:gap-6 pt-4 text-sm text-white/90 font-semibold">
                            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 shadow-sm">
                                <Clock size={16} className="text-[#38BDF8]" />
                                <span>{seminar.duration || 90} Min Session</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 shadow-sm">
                                <Award size={16} className="text-[#38BDF8]" />
                                <span>{seminar.level || 'Beginner'}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 shadow-sm">
                                <Globe size={16} className="text-[#38BDF8]" />
                                <span>100% Live & Online</span>
                            </div>
                            <div className="flex items-center gap-2 bg-amber-500/25 backdrop-blur-md px-4 py-2.5 rounded-xl border border-amber-400/40 text-amber-300 font-extrabold shadow-md">
                                <Zap size={16} className="text-amber-400 fill-amber-400 animate-pulse" />
                                <span>{seminar.price === 0 || seminar.price === null ? 'FREE MASTERCLASS' : `₹${seminar.price} (75% OFF)`}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Layout Grid */}
            <div className="max-w-[1400px] mx-auto mt-12 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 relative z-10 px-4">

                {/* Left Side */}
                <div className="space-y-8">

                    {/* What You Will Learn */}
                    <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                        <h2 className="text-2xl font-bold text-[#1F2937]">What you will learn</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {displayLearnItems.map((item, idx) => (
                                <div key={idx} className="flex gap-3">
                                    <CheckCircle size={20} className="text-[#40916C] shrink-0 mt-0.5" />
                                    <span className="text-sm font-semibold text-[#4B5563] leading-relaxed">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Perfect For */}
                    <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                        <h2 className="text-2xl font-bold text-[#1F2937]">Perfect For</h2>
                        <div className="flex flex-wrap gap-3">
                            {['College Students', 'Engineering Students', 'Beginners', 'Developers', 'AI Enthusiasts', 'Job & Internship Aspirants'].map((tag, idx) => (
                                <span key={idx} className="px-4 py-2 rounded-2xl bg-[#F0FDF4] border border-[#86EFAC] text-sm font-semibold text-[#166534]">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Why Attend */}
                    <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                        <h2 className="text-2xl font-bold text-[#1F2937]">Why Attend?</h2>
                        <div className="space-y-3">
                            {[
                                'Learn industry-standard AI tools used by professionals',
                                'Save hours every week with AI-powered workflows',
                                'Improve your productivity and learning speed',
                                'Build future-ready skills before your competitors',
                                'Get a clear roadmap to become AI-ready in 2026',
                            ].map((item, idx) => (
                                <div key={idx} className="flex gap-3 items-start">
                                    <CheckCircle size={18} className="text-[#40916C] shrink-0 mt-0.5" />
                                    <span className="text-sm font-semibold text-[#4B5563] leading-relaxed">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Instructor */}
                    <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                        <h2 className="text-2xl font-bold text-[#1F2937]">Your Instructor</h2>
                        <div className="space-y-2">
                            <h3 className="text-lg font-bold text-[#1F2937]">{seminar.speakerName || 'Mohit Raj'}</h3>
                            <p className="text-xs font-black uppercase text-[#40916C] tracking-wider">SARTHI Seminar Expert</p>
                            <p className="text-sm font-semibold text-[#6B7280] leading-relaxed">
                                {seminar.speakerBio || 'SARTHI Seminar Expert leading interactive, placement-focused learning sessions and hands-on AI workshops.'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Side: Sticky Sidebar */}
                <div className="relative">
                    <div className="lg:sticky lg:top-28 space-y-6">
                        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden flex flex-col">

                            {/* Thumbnail */}
                            <div className="relative aspect-video bg-[#1B4332] w-full overflow-hidden flex items-center justify-center border-b border-gray-50">
                                {seminar.thumbnailUrl ? (
                                    <Image
                                        src={seminar.thumbnailUrl}
                                        alt={seminar.title}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="text-center text-white/20">
                                        <Video className="w-16 h-16 mx-auto mb-2" />
                                        <span className="text-[10px] font-black uppercase tracking-wider">Live Session Preview</span>
                                    </div>
                                )}
                            </div>

                            {/* Price and CTA */}
                            <div className="p-8 space-y-6">
                                <div className="flex items-baseline gap-3">
                                    <span className="text-4xl font-black text-[#1B4332]">
                                        {seminar.price === 0 || seminar.price === null ? 'FREE' : `₹${seminar.price}`}
                                    </span>
                                    <span className="text-sm text-gray-400 line-through font-bold">₹2,000</span>
                                    <span className="text-xs font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                        100% OFF (SPONSORED)
                                    </span>
                                </div>

                                {successMessage && (
                                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold text-center animate-fade-in flex items-center justify-center gap-2">
                                        <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                                        <span>{successMessage}</span>
                                    </div>
                                )}

                                {seminar.status === 'ENDED' || seminar.status === 'COMPLETED' || (seminar.date && new Date(seminar.date).getFullYear() !== 1970 && new Date(seminar.date) < new Date()) ? (
                                    <button
                                        disabled
                                        className="w-full py-4 bg-gray-100 border border-gray-200 text-gray-600 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-not-allowed shadow-inner"
                                    >
                                        <CheckCircle2 size={16} className="text-emerald-600" /> Seminar Completed (Registration Closed)
                                    </button>
                                ) : isRegistered ? (
                                    <button
                                        disabled
                                        className="w-full py-4 bg-[#40916C]/10 border border-[#40916C]/20 text-[#40916C] rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle2 size={16} /> Seat Reserved (You are Registered)
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleRegister}
                                        disabled={loading}
                                        className="w-full py-4 bg-[#1B4332] hover:bg-[#2D6A4F] text-white rounded-2xl text-xs font-black uppercase tracking-[2px] transition-all duration-300 shadow-lg shadow-[#1B4332]/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <><Loader2 size={16} className="animate-spin" /> Reserving...</>
                                        ) : (
                                            <><Zap size={16} className="fill-white" /> Reserve Seat</>
                                        )}
                                    </button>
                                )}

                                <div className="space-y-4 pt-4 border-t border-gray-50">
                                    <div className="flex items-center justify-between text-xs font-semibold text-gray-500">
                                        <span className="flex items-center gap-2"><Calendar size={14} className="text-[#40916C]" /> Date</span>
                                        <span className="font-bold text-gray-700">{formattedDate}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs font-semibold text-gray-500">
                                        <span className="flex items-center gap-2"><Clock size={14} className="text-[#40916C]" /> Duration</span>
                                        <span className="font-bold text-gray-700">{seminar.duration || 90} Minutes</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs font-semibold text-gray-500">
                                        <span className="flex items-center gap-2"><Users size={14} className="text-[#40916C]" /> Seats Left</span>
                                        <span className="font-bold text-gray-700">
                                            127 / 500
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs font-semibold text-gray-500">
                                        <span className="flex items-center gap-2"><Globe size={14} className="text-[#40916C]" /> Mode</span>
                                        <span className="font-bold text-gray-700">Live Online</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs font-semibold text-gray-500">
                                        <span className="flex items-center gap-2"><Shield size={14} className="text-[#40916C]" /> Certificate</span>
                                        <span className="font-bold text-gray-700">Yes, Included</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
