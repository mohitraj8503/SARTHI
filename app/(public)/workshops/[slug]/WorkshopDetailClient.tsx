'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
    Calendar, Clock, Users, Award, CheckCircle, AlertCircle, 
    ArrowLeft, ArrowRight, Video, Sparkles, Shield, User, Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useToast } from '../../../../components/ToastProvider';
import { useAuth } from '../../../../components/AuthProvider';

interface WorkshopDetailClientProps {
    workshop: any;
    isRegistered: boolean;
}

export default function WorkshopDetailClient({ workshop, isRegistered: initialIsRegistered }: WorkshopDetailClientProps) {
    const router = useRouter();
    const { user } = useAuth();
    const { addToast } = useToast();
    const [isRegistered, setIsRegistered] = useState(initialIsRegistered);
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!user) {
            addToast('Please login to reserve your seat', 'error');
            router.push(`/login?redirect=/workshops/${workshop.slug}`);
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/workshops/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ workshopId: workshop.id })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to register');

            setIsRegistered(true);
            addToast('Seat reserved successfully!', 'success');
        } catch (error: any) {
            addToast(error.message || 'Something went wrong', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F7F6F2] selection:bg-[#1A3C2E] selection:text-white pb-20 font-plus-jakarta relative overflow-hidden">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
                
                .font-plus-jakarta {
                    font-family: 'Plus Jakarta Sans', sans-serif !important;
                }

                .floating-orbs {
                    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                    pointer-events: none; z-index: 0; overflow: hidden;
                }

                .orb {
                    position: absolute; border-radius: 50%; opacity: 0.06;
                    animation: float 20s infinite ease-in-out;
                }

                .orb-1 { width: 600px; height: 600px; background: #1A3C2E; top: -200px; right: -100px; }
                .orb-2 { width: 400px; height: 400px; background: #40916C; bottom: -100px; left: -100px; }

                @keyframes float {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 30px) scale(0.9); }
                }
            `}</style>

            <div className="floating-orbs">
                <div className="orb orb-1"></div>
                <div className="orb orb-2"></div>
            </div>

            {/* Back Nav */}
            <div className="relative z-10 max-w-[1400px] mx-auto pt-28 px-8">
                <button 
                    onClick={() => router.push('/workshops')}
                    className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-white rounded-2xl border border-gray-100 text-sm font-bold text-[#1A3C2E] hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
                >
                    <ArrowLeft size={16} /> Back to Workshops
                </button>
            </div>

            {/* Main Header / Banner */}
            <div className="max-w-[1400px] mx-auto mt-8 relative z-10 px-4">
                <div className="bg-[#1A3C2E] text-white p-12 md:p-16 rounded-[3rem] shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-white/[0.03] to-transparent pointer-events-none" />
                    
                    <div className="max-w-3xl space-y-6">
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-wider text-[#40916C]">
                            <Sparkles size={12} /> Intensive Workshop
                        </span>
                        
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight uppercase font-plus-jakarta italic text-white">
                            {workshop.title}
                        </h1>
                        
                        <p className="text-lg text-white/70 max-w-2xl leading-relaxed">
                            {workshop.description || "Join this interactive masterclass to dive deep into industry concepts with expert mentors."}
                        </p>

                        <div className="flex flex-wrap gap-6 pt-4 text-sm text-white/90 font-semibold">
                            <div className="flex items-center gap-2">
                                <Clock size={16} className="text-[#40916C]" />
                                <span>{workshop.duration} Session</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Award size={16} className="text-[#40916C]" />
                                <span>{(workshop as any).level || 'Beginner to Intermediate'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Globe size={16} className="text-[#40916C]" />
                                <span>100% Online & Interactive</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Layout Grid */}
            <div className="max-w-[1400px] mx-auto mt-12 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 relative z-10 px-4">
                
                {/* Left Side: About & Curriculum */}
                <div className="space-y-12">
                    
                    {/* What You Will Learn */}
                    <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                        <h2 className="text-2xl font-bold text-[#1F2937]">What you will master</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                "Production-grade version control operations",
                                "Professional branching, merging and conflict resolution",
                                "CI/CD automation pipelines on GitLab",
                                "Collaboration best practices for engineering teams"
                            ].map((item, idx) => (
                                <div key={idx} className="flex gap-3">
                                    <CheckCircle size={20} className="text-[#40916C] shrink-0 mt-0.5" />
                                    <span className="text-sm font-semibold text-[#4B5563] leading-relaxed">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Mentor Info */}
                    <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                        <h2 className="text-2xl font-bold text-[#1F2937]">Your Instructor</h2>
                        <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left">
                            <div className="space-y-2">
                                <h3 className="text-lg font-bold text-[#1F2937]">{workshop.instructorName || 'Mohit Raj'}</h3>
                                <p className="text-xs font-black uppercase text-[#40916C] tracking-wider">Expert DevOps Engineer</p>
                                <p className="text-sm font-semibold text-[#6B7280] leading-relaxed">
                                    Specialized in software configuration management, CI/CD pipelines, and microservices architecture. Guiding next-gen engineers at SARTHI.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Sticky Checkout Box (Identical to Course Detail Sidebar) */}
                <div className="relative">
                    <div className="lg:sticky lg:top-28 space-y-6">
                        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden flex flex-col">
                            {/* Media Preview Box */}
                            <div className="relative aspect-video bg-[#1B4332] w-full overflow-hidden flex items-center justify-center border-b border-gray-50">
                                {workshop.thumbnail ? (
                                    <Image 
                                        src={workshop.thumbnail} 
                                        alt={workshop.title} 
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
                                        {workshop.price === 0 ? "FREE" : `₹${workshop.price}`}
                                    </span>
                                    {workshop.originalPrice && workshop.originalPrice > workshop.price && (
                                        <span className="text-sm text-gray-400 line-through font-bold">
                                            ₹{workshop.originalPrice}
                                        </span>
                                    )}
                                </div>

                                {isRegistered ? (
                                    <button 
                                        disabled 
                                        className="w-full py-4.5 bg-[#40916C]/10 border border-[#40916C]/20 text-[#40916C] rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle size={16} /> Seat Reserved
                                    </button>
                                ) : (
                                    <button 
                                        onClick={handleRegister}
                                        disabled={loading || workshop.seatsLeft <= 0}
                                        className="w-full py-4.5 bg-[#1B4332] hover:bg-[#2D6A4F] text-white rounded-2xl text-xs font-black uppercase tracking-[2px] transition-all duration-300 shadow-lg shadow-[#1B4332]/20 active:scale-95 disabled:opacity-50"
                                    >
                                        {loading ? 'Reserving...' : workshop.seatsLeft <= 0 ? 'Fully Booked' : 'Reserve Seat'}
                                    </button>
                                )}

                                <div className="space-y-4 pt-4 border-t border-gray-50">
                                    <div className="flex items-center justify-between text-xs font-semibold text-gray-500">
                                        <span className="flex items-center gap-2"><Calendar size={14} className="text-[#40916C]" /> Date</span>
                                        <span className="font-bold text-gray-700">
                                            {(() => {
                                                const d = typeof workshop.date === 'string' ? new Date(workshop.date) : workshop.date;
                                                return d && d.getFullYear() !== 1970 
                                                    ? d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) 
                                                    : "Coming Soon";
                                            })()}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs font-semibold text-gray-500">
                                        <span className="flex items-center gap-2"><Users size={14} className="text-[#40916C]" /> Seats Left</span>
                                        <span className="font-bold text-gray-700">{workshop.seatsLeft} / {workshop.seats}</span>
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
