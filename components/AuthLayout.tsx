'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface AuthLayoutProps {
   children: React.ReactNode;
   title?: string;
   subtitle?: string;
   variant?: 'default' | 'teacher';
}

export default function AuthLayout({ children, title, subtitle, variant = 'default' }: AuthLayoutProps) {
    const router = useRouter();
    const isTeacher = variant === 'teacher';

    return (
       <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F5F0E8] font-sans">

          {/* LEFT PANEL - Cinematic Image (60% default, 40% teacher) */}
          <div className={`hidden lg:block ${isTeacher ? 'w-[40%]' : 'w-[60%]'} relative h-screen sticky top-0 bg-gray-900 overflow-hidden after:content-[''] after:absolute after:inset-0 after:bg-gradient-to-br after:from-[#1A3C2E]/15 after:via-transparent after:to-black/20 after:pointer-events-none`}>

             {/* Invisible Back Button */}
             <button
                onClick={() => router.back()}
                aria-label="Go back"
                className="absolute top-6 left-6 z-30 p-2.5 rounded-full bg-transparent border-none cursor-pointer transition-all duration-200 text-transparent hover:bg-white/15 hover:text-white/90"
             >
                <ArrowLeft size={24} />
             </button>

             {/* Background Image - Cinematic Brightness Boost */}
             <div
                className="absolute inset-0 bg-cover bg-center [filter:brightness(1.05)_contrast(1.02)_saturate(1.05)]"
                style={{ backgroundImage: `url('${isTeacher ? 'https://images.unsplash.com/photo-1544717297-fa154da09fbd?w=1200&q=80' : 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&q=80'}')` }}
             />

             {/* Trust Blocks for Teacher Application */}
             {isTeacher && (
                <div className="absolute inset-0 z-20 flex flex-col justify-end p-12 text-white">
                   <div className="space-y-6 max-w-sm">
                      <div className="bg-emerald-500/20 backdrop-blur-md border border-white/10 p-4 rounded-2xl">
                         <p className="text-xl font-bold italic tracking-tight">&quot;500+ instructors onboarded&quot;</p>
                         <p className="text-sm opacity-80 uppercase tracking-widest font-bold mt-1">Teaching student nodes across India</p>
                      </div>
                      <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl">
                         <p className="text-base font-bold italic tracking-tight uppercase">Verified within 24–48 hours</p>
                         <p className="text-xs opacity-60 uppercase tracking-widest mt-1">Rapid synchronization protocols</p>
                      </div>
                   </div>
                </div>
             )}

             {/* Subtle Warm Overlay for Premium Sunlight Effect */}
             <div className="absolute inset-0 bg-gradient-to-tr from-orange-200/10 via-transparent to-yellow-100/10 pointer-events-none mix-blend-overlay" />

             {/* Readability overlay - Strong bottom gradient for text */}
             <div className="absolute inset-x-0 bottom-0 h-[45%] z-10 bg-gradient-to-t from-[#050F0A]/95 via-[#050F0A]/20 to-transparent pointer-events-none" />
          </div>

          {/* RIGHT PANEL - Login Form (40% default, 60% teacher) */}
          <div className={`w-full ${isTeacher ? 'lg:w-[60%]' : 'lg:w-[40%]'} min-h-screen flex flex-col bg-[#F5F0E8] relative animate-in fade-in slide-in-from-right-4 duration-700`}>
             {/* Subtle Premium Texture */}
             <div className="absolute inset-0 pointer-events-none opacity-40"
                style={{
                   backgroundImage: `
                          radial-gradient(ellipse at 20% 50%, rgba(45,106,79,0.03) 0%, transparent 60%),
                          radial-gradient(ellipse at 80% 20%, rgba(232,184,75,0.04) 0%, transparent 50%)
                      `
                }}
             />

             <main className={`w-full ${isTeacher ? 'max-w-2xl' : 'max-w-[500px]'} mx-auto px-6 lg:px-12 py-10 lg:py-16 flex flex-col justify-center relative z-10 flex-1`}>
                {title && (
                   <div className="mb-8">
                      <h1 className="text-3xl font-bold text-slate-900 mb-2 italic tracking-tight uppercase">{title}</h1>
                      {subtitle && <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">{subtitle}</p>}
                   </div>
                )}

                {children}

                {/* Footer Links - Absolute or bottom spaced */}
                <div className="mt-12 text-center flex justify-center gap-6 text-[12px] text-[#B5C4B5] font-medium uppercase tracking-[1px]">
                   <Link href="/privacy" className="hover:text-[#5D705C] transition-colors">Privacy</Link>
                   <Link href="/terms" className="hover:text-[#5D705C] transition-colors">Terms</Link>
                </div>
             </main>
          </div>
       </div>
    );
}

