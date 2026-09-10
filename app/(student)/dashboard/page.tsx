export const dynamic = 'force-dynamic';
import { Suspense } from 'react';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getDashboardSummary } from '@/lib/services/dashboard';
import DashboardClient from './DashboardClient';
import { DashboardSkeleton } from '@/components/dashboard/SkeletonLoader';

export const metadata = {
    title: 'Student Dashboard',
    description: 'Track your learning progress and stay updated',
};

export default async function StudentDashboardPage({
    searchParams
}: {
    searchParams: Promise<{ tab?: string }>
}) {
    const params = await searchParams;
    const user = await getCurrentUser();

    if (!user) {
        redirect('/login?returnUrl=/dashboard');
    }

    if (user.role !== 'STUDENT') {
        const adminRoles = ['ADMIN', 'SUPER_ADMIN', 'GOD_ADMIN', 'CTO', 'LEAD_DEVELOPER'];
        const teacherRoles = ['TEACHER', 'INSTRUCTOR'];
        
        if (adminRoles.includes(user.role)) {
            redirect('/admin/dashboard');
        } else if (teacherRoles.includes(user.role)) {
            redirect('/teacher/dashboard');
        } else if (user.role === 'MENTOR') {
            redirect('/mentor/dashboard');
        } else if (user.role === 'ASSOCIATE' || user.role === 'MARKETING_PARTNER') {
            redirect('/marketing/dashboard');
        }
    }

    // Onboarding Gate: Ensure student has completed profile (Bypassed automatically for internship candidates)
    if (user.role === 'STUDENT') {
        let hasInternshipApp = null;
        let hasBatchMember = null;

        try {
            hasInternshipApp = await prisma.internshipApplication.findFirst({
              where: {
                OR: [{ studentId: user.id }, ...(user.email ? [{ email: user.email }] : [])]
              }
            });
            hasBatchMember = await prisma.batchMember.findFirst({ where: { userId: user.id } });
        } catch (error) {
            console.error('Failed to fetch onboarding gate status due to DB connection issue:', error);
        }

        if (!user.onboarded) {
            if (hasInternshipApp || hasBatchMember) {
                await prisma.user.update({
                  where: { id: user.id },
                  data: { onboarded: true, onboardingStatus: 'COMPLETED' }
                }).catch(() => {});
            } else if (hasInternshipApp === null) {
                // DB temporarily unreachable, bypass redirect to avoid crash
            } else {
                redirect('/onboarding');
            }
        }

        // If student applied for internship but is not yet in an active batch, direct them to internship portal dashboard
        if (hasInternshipApp && !hasBatchMember && !params.tab) {
            redirect('/dashboard/internship');
        }
    }

    const allowedTabs = ['dashboard', 'courses', 'live', 'curriculum', 'assignments', 'explore', 'achievements', 'settings', 'qa', 'certifications'];
    const currentTab = allowedTabs.includes(params.tab || '') ? (params.tab || 'dashboard') : 'dashboard';

    // Phase 1: Fetch lightweight summary on server for instant render
    const initialData = await getDashboardSummary(user.id, user);

    return (
        <Suspense fallback={<DashboardSkeleton />}>
            <DashboardClient initialData={initialData} currentTab={currentTab} />
        </Suspense>
    );
}

