'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, Loader2 } from 'lucide-react';
import Image from 'next/image';
import InternshipApplicationForm from '@/components/internship/InternshipApplicationForm';
import ApplicationStatusView from '@/components/internship/ApplicationStatusView';

export default function PublicInternshipApplyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loadingStatus, setLoadingStatus] = useState(true);
  const [existingApp, setExistingApp] = useState<any>(null);

  useEffect(() => {
    async function checkExistingApplication() {
      try {
        const res = await fetch('/api/internship/apply');
        if (res.status === 401) {
          // Unauthenticated: redirect candidate immediately to login page
          router.push('/login?redirect=/internship/apply');
          return;
        }
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated === false) {
            router.push('/login?redirect=/internship/apply');
            return;
          }
          if (data.hasApplied && data.application) {
            setExistingApp(data.application);
          }
        }
      } catch (err) {
        console.error('Failed to fetch existing application status:', err);
      } finally {
        setLoadingStatus(false);
      }
    }
    checkExistingApplication();
  }, [router]);

  return (
    <div className="relative min-h-screen text-[#111111] py-16 px-6 md:px-12 flex flex-col items-center overflow-hidden bg-black/40">
      {/* Background Image Container */}
      <div className="fixed inset-0 w-full h-full select-none pointer-events-none z-0">
        <Image
          src="/images/free-bg.jpg"
          alt="Campus Background"
          fill
          priority
          unoptimized
          sizes="100vw"
          className="object-cover object-center scale-[1.02]"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/60" />
      </div>

      <div className="max-w-6xl w-full relative z-10">
        {/* Back Link */}
        <button
          onClick={() => router.push('/internship')}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-200 hover:text-white transition-colors mb-8 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/20"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Internship Portal
        </button>

        {/* Page Header */}
        <div className="text-left mb-8 text-white">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 text-[10px] font-bold text-white uppercase tracking-wider mb-4 border border-white/20 backdrop-blur-md">
            Cohort 2026 Registration
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-3" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
            Apply for SARTHI Internship
          </h1>
          <p className="text-slate-200 text-sm md:text-base leading-relaxed">
            Start your internship journey by choosing your field and the track that best matches your current experience and goals.
          </p>
        </div>

        {loadingStatus ? (
          <div className="p-12 bg-white/90 backdrop-blur-md rounded-3xl text-center space-y-3 font-sans text-slate-600">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#1B4332]" />
            <p className="text-xs font-black uppercase tracking-wider">Checking application status...</p>
          </div>
        ) : existingApp ? (
          <ApplicationStatusView application={existingApp} />
        ) : (
          <div className="bg-white border border-[#ECECEC] rounded-3xl p-8 md:p-10 shadow-xl">
            <InternshipApplicationForm
              onSuccess={(appData) => setExistingApp(appData)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
