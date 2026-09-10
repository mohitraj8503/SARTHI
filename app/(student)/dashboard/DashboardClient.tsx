'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/components/ToastProvider';
import { BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { getGreetingForHour } from '@/lib/dashboard-config';
import dynamic from 'next/dynamic';
import { usePullToRefresh } from '@/lib/hooks/usePullToRefresh';
import DashboardRecoveryGuard from '@/components/auth/DashboardRecoveryGuard';

const OverviewTabV2 = dynamic(() => import('./_components/OverviewTabV2'), {
    loading: () => <div className="h-[600px] shimmer rounded-[32px] w-full" />,
    ssr: false
});

const CoursesTab = dynamic(() => import('./_components/CoursesTab'), {
    loading: () => <div className="h-[600px] shimmer rounded-[32px] w-full" />,
    ssr: false
});

const LiveTab = dynamic(() => import('./_components/LiveTab'), {
    loading: () => <div className="h-[600px] shimmer rounded-[32px] w-full" />,
    ssr: false
});

const CurriculumTab = dynamic(() => import('./_components/CurriculumTab'), {
    loading: () => <div className="h-[600px] shimmer rounded-[32px] w-full" />,
    ssr: false
});

const TabAssignments = dynamic(() => import('@/components/dashboard/tabs/TabAssignments'), {
    loading: () => <div className="h-[400px] shimmer rounded-[32px] w-full" />,
    ssr: false
});

const TabExplore = dynamic(() => import('@/components/dashboard/tabs/TabExplore'), {
    loading: () => <div className="h-[400px] shimmer rounded-[32px] w-full" />,
    ssr: false
});

const TabAchievements = dynamic(() => import('@/components/dashboard/tabs/TabAchievements'), {
    loading: () => <div className="h-[400px] shimmer rounded-[32px] w-full" />,
    ssr: false
});

const TabSettings = dynamic(() => import('@/components/dashboard/tabs/TabSettings'), {
    loading: () => <div className="h-[400px] shimmer rounded-[32px] w-full" />,
    ssr: false
});

const TabQA = dynamic(() => import('@/components/dashboard/tabs/TabQA'), {
    loading: () => <div className="h-[400px] shimmer rounded-[32px] w-full" />,
    ssr: false
});

const TabCertifications = dynamic(() => import('@/components/dashboard/tabs/TabCertifications'), {
    loading: () => <div className="h-[400px] shimmer rounded-[32px] w-full" />,
    ssr: false
});

const AssignmentPlayer = dynamic(() => import('@/components/assignments/AssignmentPlayer'), {
    loading: () => <div className="flex flex-col items-center justify-center min-h-screen"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>,
    ssr: false
});

import LiveSessionIsland from './_components/LiveSessionIsland';

export interface DashboardData {
    user: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
    };
    enrolledCourses: any[];
    upcomingLessons: any[];
    stats?: {
        activeCourses: number;
        [key: string]: any;
    };
    [key: string]: any; // Allow other properties for different tabs
}

interface DashboardClientProps {
    initialData: DashboardData;
    currentTab: string;
}

export default function DashboardClient({ initialData, currentTab = 'dashboard' }: DashboardClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useAuth();
    const { addToast } = useToast();

    const [data, setData] = useState<any>(initialData);
    const [loadingFull, setLoadingFull] = useState(true);
    const [greeting, setGreeting] = useState('');

    const activeAssignmentId = searchParams?.get('assignment');

    // Mobile Pull-to-Refresh
    const refreshData = useCallback(async () => {
        try {
            const res = await fetch('/api/student/dashboard/summary?phase=full');
            const fullData = await res.json();
            if (fullData.success) {
                setData(fullData);
                addToast?.({
                    type: 'success',
                    title: 'Refreshed',
                    message: 'Dashboard updated successfully'
                });
            }
        } catch (error) {
            console.error('Refresh failed:', error);
            addToast?.({
                type: 'error',
                title: 'Refresh Failed',
                message: 'Please check your connection'
            });
        }
    }, [addToast]);

    const { isRefreshing, pullDistance, canRefresh } = usePullToRefresh({
        onRefresh: refreshData,
        threshold: 80
    });

    useEffect(() => {
        const hour = new Date().getHours();
        setGreeting(getGreetingForHour(hour));

        // Phase 2: Fetch heavy data asynchronously for buttery smooth feel
        const fetchFullData = async () => {
            try {
                const res = await fetch('/api/student/dashboard/summary?phase=full');
                const fullData = await res.json();
                if (fullData.success) {
                    setData(fullData);
                }
            } catch (error) {
                console.error('Phase 2 Data Fetch Failed:', error);
            } finally {
                setLoadingFull(false);
            }
        };

        fetchFullData();

        // Real-time Update: Re-fetch when user refocuses the tab
        const handleFocus = () => {
            console.log('🔄 Dashboard Refocus: Syncing data...');
            fetchFullData();
        };

        window.addEventListener('focus', handleFocus);
        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, []);

    const enrolledCourses = data?.enrolledCourses || [];

    const renderTabContent = () => {
        switch (currentTab) {
            case 'dashboard':
                return <OverviewTabV2 data={data} isLoading={loadingFull} />;
            case 'courses':
                return <div className="max-w-7xl mx-auto px-6 py-8"><CoursesTab enrolledCourses={enrolledCourses} /></div>;
            case 'live':
                return <div className="max-w-7xl mx-auto px-6 py-8"><LiveTab upcomingLessons={data?.upcomingLessons || []} /></div>;
            case 'curriculum':
                return <div className="max-w-7xl mx-auto px-6 py-8"><CurriculumTab data={data} /></div>;
            case 'assignments':
                return <div className="max-w-7xl mx-auto px-6 py-8"><TabAssignments data={data} /></div>;
            case 'explore':
                return <div className="max-w-7xl mx-auto px-6 py-8"><TabExplore data={data} /></div>;
            case 'achievements':
                return <div className="max-w-7xl mx-auto px-6 py-8"><TabAchievements data={data} /></div>;
            case 'settings':
                return <div className="max-w-7xl mx-auto px-6 py-8"><TabSettings data={data} /></div>;
            case 'qa':
                return <div className="max-w-7xl mx-auto px-6 py-8"><TabQA data={data} /></div>;
            case 'certifications':
                return <div className="max-w-7xl mx-auto px-6 py-8"><TabCertifications data={data} /></div>;
            default:
                return (
                    <div className="py-40 text-center animate-scale-in">
                         <div className="w-24 h-24 bg-[#174F3A]/5 rounded-[32px] flex items-center justify-center mx-auto mb-8">
                            <BookOpen className="w-12 h-12 text-[#174F3A] opacity-40" />
                         </div>
                         <h2 className="text-3xl font-black text-[#174F3A] italic tracking-tight font-outfit uppercase">Content Loading</h2>
                         <p className="text-gray-400 mt-3 font-bold uppercase tracking-widest text-[11px]">We are preparing your learning experience. Please wait a moment.</p>
                         <Link href="/dashboard" className="mt-10 inline-flex px-10 py-4 bg-[#174F3A] text-white rounded-2xl font-black uppercase tracking-widest text-[11px] hover:scale-105 transition-all shadow-xl active:scale-95 italic border-2 border-transparent">Return to Dashboard</Link>
                    </div>
                );
        }
    };

    return (
        <DashboardRecoveryGuard isLoading={loadingFull} hasData={!!data} expectedRole="STUDENT" routeName="Student Dashboard">
            <div className="w-full antialiased relative">
            {/* Mobile Pull-to-Refresh Indicator */}
            {(pullDistance > 0 || isRefreshing) && (
                <div
                    className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 flex items-center justify-center py-4 lg:hidden"
                    style={{
                        transform: `translateY(${Math.min(pullDistance - 80, 0)}px)`,
                        opacity: pullDistance > 0 ? 1 : 0
                    }}
                >
                    <div className="flex items-center gap-3">
                        {isRefreshing ? (
                            <>
                                <div className="w-5 h-5 border-2 border-[#174F3A] border-t-transparent rounded-full animate-spin" />
                                <span className="text-sm font-bold text-[#174F3A] uppercase tracking-widest">Refreshing...</span>
                            </>
                        ) : (
                            <>
                                <div
                                    className={`w-5 h-5 rounded-full border-2 border-gray-300 transition-colors ${
                                        canRefresh ? 'border-[#174F3A] bg-[#174F3A]/10' : ''
                                    }`}
                                >
                                    {canRefresh && (
                                        <svg className="w-full h-full text-[#174F3A]" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>
                                <span className={`text-sm font-bold uppercase tracking-widest transition-colors ${
                                    canRefresh ? 'text-[#174F3A]' : 'text-gray-400'
                                }`}>
                                    {canRefresh ? 'Release to refresh' : 'Pull down to refresh'}
                                </span>
                            </>
                        )}
                    </div>
                </div>
            )}

            <LiveSessionIsland sessions={data?.upcomingLessons} />

            {/* Restriction Notification Banner */}
            {searchParams?.get('restricted') && (
                <div className="max-w-7xl mx-auto px-6 pt-4">
                    <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 rounded-2xl flex items-center justify-between gap-3 text-sm shadow-sm">
                        <div className="flex items-center gap-2">
                            <span className="text-lg">🔒</span>
                            <span>
                                {searchParams.get('restricted') === 'internship'
                                    ? 'The College Internship Workspace is exclusively accessible to Higher Education / College students.'
                                    : 'The Student Ambassador Drive is exclusively accessible to Higher Education / College students.'}
                            </span>
                        </div>
                        <button onClick={() => router.replace('/dashboard')} className="text-amber-700 hover:text-amber-950 font-bold text-xs uppercase px-2 py-1">
                            Dismiss
                        </button>
                    </div>
                </div>
            )}

            {/* Pending Profile Completion Prompt */}
            {(user as any)?.platformSegment === 'PENDING' && (
                <div className="max-w-7xl mx-auto px-6 pt-4">
                    <div className="bg-[#1A3C2E]/10 border border-[#1A3C2E]/20 text-[#1A3C2E] px-4 py-3 rounded-2xl flex items-center justify-between gap-3 text-sm shadow-sm">
                        <div className="flex items-center gap-2">
                            <span className="text-lg">🎓</span>
                            <span>Please complete your education profile to unlock personalized learning tracks and domain certifications.</span>
                        </div>
                        <Link href="/onboarding" className="bg-[#1A3C2E] text-white px-4 py-1.5 rounded-xl font-bold text-xs hover:bg-[#254D3E] transition-colors whitespace-nowrap">
                            Complete Profile &rarr;
                        </Link>
                    </div>
                </div>
            )}

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentTab}
                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 1.02, y: -10 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                        transform: isRefreshing ? 'translateY(60px)' : 'translateY(0)',
                        transition: 'transform 0.3s ease'
                    }}
                >
                    {renderTabContent()}
                </motion.div>
            </AnimatePresence>

            <AnimatePresence>
                {activeAssignmentId && (
                    <motion.div 
                        initial={{ opacity: 0, y: '100%' }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-0 z-[200] bg-white overflow-y-auto"
                    >
                        <AssignmentPlayer 
                            assignmentId={activeAssignmentId} 
                            onClose={() => {
                                const params = new URLSearchParams(searchParams?.toString());
                                params.delete('assignment');
                                router.push(`/dashboard?${params.toString()}`);
                            }} 
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            </div>
        </DashboardRecoveryGuard>
    );
}


