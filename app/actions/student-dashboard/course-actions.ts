"use server";
import { prisma } from '@/lib/prisma';
import { withResiliency } from '@/lib/resilient-db';
import { getCurrentUser, IS_CONN_ERROR, StreakData, Deadline, CertificateProgress } from './index';

// Course-related dashboard actions


export async function getEnrolledCourses() {
    const user = await getCurrentUser();
    if (!user) return { error: 'Unauthorized', courses: [] };

    const result = await withResiliency(async () => {
        const enrollments = await prisma.enrollment.findMany({
            where: { userId: user.id, status: 'active' },
            include: {
                course: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        thumbnail: true,
                        level: true,
                        lessons: { select: { id: true } },
                        instructor: { select: { name: true, image: true } }
                    }
                }
            },
            orderBy: { lastAccessedAt: 'desc' }
        });

        const courses = enrollments.map(enrollment => ({
            id: enrollment.course.id,
            title: enrollment.course.title,
            description: enrollment.course.description,
            thumbnail: enrollment.course.thumbnail || '/placeholder-course.jpg',
            instructor: enrollment.course.instructor.name,
            instructorImage: enrollment.course.instructor.image,
            progress: enrollment.progressPercentage,
            totalLessons: enrollment.course.lessons.length,
            level: enrollment.course.level,
            lastAccessed: enrollment.lastAccessedAt
        }));

        return { courses };
    }, `enrolled-courses-${user.id}`);

    if (!result.success || !result.data) {
        return { error: result.error || 'DB_CONNECTION_FAILED', courses: [] };
    }

    return result.data;
}

export async function getLearningStreak(): Promise<{ data: StreakData | null; error?: string }> {
    const user = await getCurrentUser();
    if (!user) return { data: null, error: 'Unauthorized' };

    const result = await withResiliency(async () => {
        // Get user's learning sessions from the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const enrollments = await prisma.enrollment.findMany({
            where: { userId: user.id },
            select: { lastAccessedAt: true, progressPercentage: true }
        });

        // Calculate current streak based on activity
        const activityDates = new Set<string>();
        enrollments.forEach(e => {
            if (e.lastAccessedAt) {
                activityDates.add(e.lastAccessedAt.toISOString().split('T')[0]);
            }
        });

        // Also check assignment submissions
        const submissions = await prisma.assignmentSubmission.findMany({
            where: { userId: user.id, createdAt: { gte: thirtyDaysAgo } },
            select: { createdAt: true }
        });
        submissions.forEach(s => {
            activityDates.add(s.createdAt.toISOString().split('T')[0]);
        });

        // Calculate current streak
        let currentStreak = 0;
        const today = new Date();
        const sortedDates = Array.from(activityDates).sort().reverse();

        if (sortedDates.length > 0) {
            const todayStr = today.toISOString().split('T')[0];
            const yesterdayStr = new Date(today.getTime() - 86400000).toISOString().split('T')[0];

            // Check if there's activity today or yesterday
            if (sortedDates[0] === todayStr || sortedDates[0] === yesterdayStr) {
                let checkDate = sortedDates[0] === todayStr ? today : new Date(today.getTime() - 86400000);
                while (activityDates.has(checkDate.toISOString().split('T')[0])) {
                    currentStreak++;
                    checkDate = new Date(checkDate.getTime() - 86400000);
                }
            }
        }

        // Best streak (simplified - would need historical data for accuracy)
        const bestStreak = Math.max(currentStreak, Math.min(sortedDates.length, 7));

        // Weekly goal progress (default 120 minutes/week)
        const weeklyGoal = 120;
        const weeklyMinutes = Math.round(enrollments.length * 15); // Rough estimate
        const weeklyGoalProgress = Math.min(100, Math.round((weeklyMinutes / weeklyGoal) * 100));

        return {
            currentStreak,
            bestStreak,
            weeklyGoalProgress,
            lastActivityDate: sortedDates[0] || null,
            weeklyMinutes,
            weeklyGoal
        };
    }, `learning-streak-${user.id}`);

    if (!result.success || !result.data) {
        return { data: null, error: result.error || 'DB_CONNECTION_FAILED' };
    }

    return { data: result.data };
}

export async function getUpcomingDeadlines(): Promise<{ data: Deadline[]; error?: string }> {
    const user = await getCurrentUser();
    if (!user) return { data: [], error: 'Unauthorized' };

    const result = await withResiliency(async () => {
        const enrollments = await prisma.enrollment.findMany({
            where: { userId: user.id, status: 'active' },
            select: { courseId: true }
        });
        const courseIds = enrollments.map(e => e.courseId);

        if (courseIds.length === 0) return [];

        const now = new Date();
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        const assignments = await prisma.assignment.findMany({
            where: {
                lesson: { courseId: { in: courseIds } },
                dueDate: { gte: now, lte: nextWeek }
            },
            include: {
                lesson: { include: { course: { select: { title: true } } } }
            },
            orderBy: { dueDate: 'asc' },
            take: 5
        });

        const deadlines: Deadline[] = assignments
            .filter(a => a.dueDate)
            .map(a => {
                const dueDate = new Date(a.dueDate as Date);
                const daysUntil = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                return {
                    id: a.id,
                    title: a.title,
                    courseName: a.lesson.course.title,
                    dueDate: a.dueDate as Date,
                    type: 'assignment' as const,
                    urgency: daysUntil <= 1 ? 'today' : daysUntil <= 7 ? 'this-week' : 'later'
                };
            });

        return deadlines;
    }, `deadlines-${user.id}`);

    if (!result.success || !result.data) {
        return { data: [], error: result.error || 'DB_CONNECTION_FAILED' };
    }

    return { data: result.data };
}

export async function getCertificateProgress(): Promise<{ data: CertificateProgress[]; error?: string }> {
    const user = await getCurrentUser();
    if (!user) return { data: [], error: 'Unauthorized' };

    const result = await withResiliency(async () => {
        const enrollments = await prisma.enrollment.findMany({
            where: { userId: user.id, status: { in: ['active', 'completed'] } },
            include: {
                course: {
                    include: {
                        lessons: { select: { id: true } },
                        quizzes: { select: { id: true } }
                    }
                }
            }
        });

        const certificateProgress: CertificateProgress[] = [];

        for (const enrollment of enrollments) {
            const totalLessons = enrollment.course.lessons.length;
            const requiredLessons = Math.ceil(totalLessons * 0.8); // 80% to complete

            // Get completed lessons count
            const completedLessons = (enrollment.progressPercentage / 100) * totalLessons;

            // Get quiz progress (simplified)
            const quizzesPassed = Math.floor(enrollment.course.quizzes.length * 0.5);

            const isEligible = enrollment.progressPercentage >= 80;
            const canClaim = enrollment.status === 'completed' || isEligible;

            certificateProgress.push({
                courseId: enrollment.course.id,
                courseName: enrollment.course.title,
                progress: enrollment.progressPercentage,
                requirements: {
                    lessonsCompleted: Math.round(completedLessons),
                    totalLessons,
                    requiredLessons,
                    quizzesPassed,
                    requiredQuizzes: Math.ceil(enrollment.course.quizzes.length * 0.7),
                    hasFinalProject: false,
                    finalProjectPassed: false
                },
                isEligible,
                canClaim
            });
        }

        return certificateProgress;
    }, `cert-progress-${user.id}`);

    if (!result.success || !result.data) {
        return { data: [], error: result.error || 'DB_CONNECTION_FAILED' };
    }

    return { data: result.data };
}

