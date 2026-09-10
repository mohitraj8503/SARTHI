"use server";
import { prisma } from '@/lib/prisma';
import { subDays } from 'date-fns';
import { getCurrentUser, IS_CONN_ERROR, AttendanceData, RecommendedItem, SearchResult, StudentJourneyState } from './index';
import { withResiliency } from '@/lib/resilient-db';

export async function getAttendanceSnapshot(): Promise<{ data: AttendanceData | null; error?: string }> {
    const user = await getCurrentUser();
    if (!user) return { data: null, error: 'Unauthorized' };

    const result = await withResiliency(async () => {
        // Get seminar registrations
        const registrations = await prisma.seminarRegistration.findMany({
            where: { userId: user.id },
            include: { seminar: { select: { scheduledAt: true } } },
            orderBy: { registeredAt: 'desc' }
        });

        const totalSessions = registrations.length;
        const attendedSessions = registrations.filter(r => r.status === 'ATTENDED').length;
        const missedSessions = registrations.filter((r) => {
            if (r.status !== 'REGISTERED' || !r.seminar?.scheduledAt) return false;
            return r.seminar.scheduledAt < new Date();
        }).length;

        // This week stats
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);

        const thisWeekRegistrations = registrations.filter(r =>
            new Date(r.registeredAt) >= weekStart
        );
        const thisWeekAttended = thisWeekRegistrations.filter(r => r.status === 'ATTENDED').length;
        const thisWeekTotal = thisWeekRegistrations.length;

        // Last attended date
        const lastAttended = registrations.find(r => r.status === 'ATTENDED' && r.seminar);

        const overallPercentage = totalSessions > 0
            ? Math.round((attendedSessions / totalSessions) * 100)
            : 100;

        return {
            overallPercentage,
            totalSessions,
            attendedSessions,
            missedSessions,
            thisWeekAttended,
            thisWeekTotal,
            lastAttendedDate: lastAttended?.seminar?.scheduledAt?.toISOString() || null
        };
    }, `attendance-${user.id}`);

    if (!result.success || !result.data) {
        return { data: null, error: result.error || 'DB_CONNECTION_FAILED' };
    }

    return { data: result.data };
}

export async function getRecommendedContent(): Promise<{ data: RecommendedItem[]; error?: string }> {
    const user = await getCurrentUser();
    if (!user) return { data: [], error: 'Unauthorized' };

    const result = await withResiliency(async () => {
        // Get enrolled courses for context
        const enrollments = await prisma.enrollment.findMany({
            where: { userId: user.id, status: 'active' },
            include: { course: { select: { category: true, level: true, id: true, title: true } } },
            orderBy: { lastAccessedAt: 'desc' },
            take: 3
        });

        const recommendations: RecommendedItem[] = [];
        const enrolledCourseIds = enrollments.map(e => e.course.id);
        const categories = Array.from(new Set(enrollments.map(e => e.course.category).filter((cat): cat is string => Boolean(cat))));

        // Get upcoming seminars related to enrolled courses
        const upcomingSeminars = await prisma.seminar.findMany({
            where: {
                status: { in: ['SCHEDULED', 'REGISTRATION_OPEN'] },
                scheduledAt: { gte: new Date() },
                courseId: { in: enrolledCourseIds }
            },
            include: { course: { select: { title: true } } },
            orderBy: { scheduledAt: 'asc' },
            take: 2
        });

        for (const seminar of upcomingSeminars) {
            recommendations.push({
                id: seminar.id,
                title: seminar.title,
                type: 'seminar',
                description: `Live session on ${seminar.course?.title || 'TBA'}`,
                link: `/dashboard/live`,
                reason: 'Related to your enrolled course'
            });
        }

        // Get recommended courses from same category
        if (categories.length > 0) {
            const relatedCourses = await prisma.course.findMany({
                where: {
                    category: { in: categories },
                    id: { notIn: enrolledCourseIds }
                },
                take: 2
            });

            for (const course of relatedCourses) {
                recommendations.push({
                    id: course.id,
                    title: course.title,
                    type: 'course',
                    description: course.description || '',
                    thumbnail: course.thumbnail || undefined,
                    link: `/courses`,
                    reason: 'Similar to your interests'
                });
            }
        }

        // Get upcoming workshops
        const workshops = await prisma.workshop.findMany({
            where: {
                date: { gte: new Date() }
            },
            orderBy: { date: 'asc' },
            take: 2
        });

        for (const workshop of workshops) {
            recommendations.push({
                id: workshop.id,
                title: workshop.title,
                type: 'workshop',
                description: workshop.description || '',
                link: `/workshops`,
                reason: 'Hands-on learning opportunity'
            });
        }

        return recommendations.slice(0, 4);
    }, `recommendations-${user.id}`);

    if (!result.success || !result.data) {
        return { data: [], error: result.error || 'DB_CONNECTION_FAILED' };
    }

    return { data: result.data };
}

export async function globalSearch(query: string): Promise<{ data: SearchResult[]; error?: string }> {
    const user = await getCurrentUser();
    if (!user) return { data: [], error: 'Unauthorized' };

    if (!query || query.length < 2) return { data: [] };

    try {
        const results: SearchResult[] = [];
        const searchTerm = query.toLowerCase();

        // Search courses
        const courses = await prisma.course.findMany({
            where: {
                OR: [
                    { title: { contains: searchTerm } },
                    { description: { contains: searchTerm } }
                ],
                isPublished: true
            },
            take: 3,
            select: { id: true, title: true, description: true, thumbnail: true }
        });

        courses.forEach(c => results.push({
            type: 'course',
            id: c.id,
            title: c.title,
            description: c.description || undefined,
            thumbnail: c.thumbnail || undefined,
            link: `/courses`
        }));

        // Search seminars
        const seminars = await prisma.seminar.findMany({
            where: {
                OR: [
                    { title: { contains: searchTerm } },
                    { description: { contains: searchTerm } }
                ],
                status: { in: ['SCHEDULED', 'REGISTRATION_OPEN', 'LIVE'] }
            },
            take: 3,
            select: { id: true, title: true, description: true, thumbnail: true }
        });

        seminars.forEach(s => results.push({
            type: 'seminar',
            id: s.id,
            title: s.title,
            description: s.description || undefined,
            thumbnail: s.thumbnail || undefined,
            link: `/dashboard/live`
        }));

        // Search lessons
        const lessons = await prisma.lesson.findMany({
            where: {
                OR: [
                    { title: { contains: searchTerm } },
                    { description: { contains: searchTerm } }
                ]
            },
            take: 3,
            include: { course: { select: { title: true } } }
        });

        lessons.forEach(l => results.push({
            type: 'lesson',
            id: l.id,
            title: l.title,
            description: `From ${l.course.title}`,
            link: `/courses`
        }));

        // Search workshops
        const workshops = await prisma.workshop.findMany({
            where: {
                OR: [
                    { title: { contains: searchTerm } },
                    { description: { contains: searchTerm } }
                ]
            },
            take: 2,
            select: { id: true, title: true, description: true, thumbnail: true }
        });

        workshops.forEach(w => results.push({
            type: 'workshop',
            id: w.id,
            title: w.title,
            description: w.description || undefined,
            thumbnail: w.thumbnail || undefined,
            link: `/workshops`
        }));

        return { data: results };
    } catch (error) {
        if (IS_CONN_ERROR(error)) {
            console.error('SERVER_ERROR: DB connection failed in globalSearch', error);
        }
        return { data: [], error: 'DB_CONNECTION_FAILED' };
    }
}

export async function getStudentJourneyState(): Promise<{ data: StudentJourneyState | null; error?: string }> {
    const user = await getCurrentUser();
    if (!user) return { data: null, error: 'Unauthorized' };

    try {
        const enrollments = await prisma.enrollment.findMany({
            where: { userId: user.id },
            orderBy: { lastAccessedAt: 'desc' }
        });

        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Check if new student (no enrollments)
        if (enrollments.length === 0) {
            return { data: 'new' };
        }

        // Check if inactive (no activity in 30 days)
        const lastActivity = enrollments[0]?.lastAccessedAt;
        if (!lastActivity || lastActivity < thirtyDaysAgo) {
            return { data: 'inactive' };
        }

        // Check if near completion (>80% on any course)
        const hasNearCompletion = enrollments.some(e => e.progressPercentage >= 80 && e.progressPercentage < 100);
        if (hasNearCompletion) {
            return { data: 'near-completion' };
        }

        // Check for seminar/workshop registrations (event-focused)
        const recentRegistrations = await prisma.seminarRegistration.findMany({
            where: {
                userId: user.id,
                registeredAt: { gte: thirtyDaysAgo }
            }
        });

        if (recentRegistrations.length >= 2) {
            return { data: 'event-focused' };
        }

        // Default to active learner
        return { data: 'active' };
    } catch (error) {
        if (IS_CONN_ERROR(error)) {
            console.error('SERVER_ERROR: DB connection failed in getStudentJourneyState', error);
        }
        return { data: null, error: 'DB_CONNECTION_FAILED' };
    }
}

export async function getLearningAnalytics() {
    const user = await getCurrentUser();
    if (!user) return { data: null, error: 'Unauthorized' };

    const result = await withResiliency(async () => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const [sessions, xpTransactions, enrollments] = await Promise.all([
            prisma.learningSession.findMany({
                where: { userId: user.id, date: { gte: thirtyDaysAgo } },
                orderBy: { date: 'asc' }
            }),
            prisma.xPTransaction.findMany({
                where: { userId: user.id, createdAt: { gte: thirtyDaysAgo } },
                orderBy: { createdAt: 'asc' }
            }),
            prisma.enrollment.findMany({
                where: { userId: user.id },
                include: { course: true }
            })
        ]);

        // Weekly Study Minutes
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return d.toISOString().split('T')[0];
        });

        const dailyMinutes = last7Days.map(date => {
            const daySessions = sessions.filter(s => s.date.toISOString().split('T')[0] === date);
            const totalSec = daySessions.reduce((acc, s) => acc + s.durationSec, 0);
            return {
                day: new Date(date).toLocaleDateString(undefined, { weekday: 'short' }),
                minutes: Math.round(totalSec / 60)
            };
        });

        // XP Distribution by Category
        const xpDist = {
            lessons: xpTransactions.filter(t => t.reason.toLowerCase().includes('lesson')).reduce((acc, t) => acc + t.amount, 0),
            quizzes: xpTransactions.filter(t => t.reason.toLowerCase().includes('quiz')).reduce((acc, t) => acc + t.amount, 0),
            seminars: xpTransactions.filter(t => t.reason.toLowerCase().includes('seminar') || t.reason.toLowerCase().includes('attendance')).reduce((acc, t) => acc + t.amount, 0),
            assignments: xpTransactions.filter(t => t.reason.toLowerCase().includes('assignment')).reduce((acc, t) => acc + t.amount, 0)
        };

        // Course Progress Distribution
        const progressDist = {
            completed: enrollments.filter(e => e.status === 'completed').length,
            inProgress: enrollments.filter(e => e.status === 'active' && e.progressPercentage > 0).length,
            notStarted: enrollments.filter(e => e.status === 'active' && e.progressPercentage === 0).length
        };

        return {
            dailyMinutes,
            xpDist,
            progressDist,
            totalStudyHours: Math.round(sessions.reduce((acc, s) => acc + s.durationSec, 0) / 3600),
            averageDailyMinutes: Math.round((sessions.reduce((acc, s) => acc + s.durationSec, 0) / 60) / 30)
        };
    }, `learning-analytics-${user.id}`);

    if (!result.success || !result.data) {
        return { data: null, error: result.error || 'Failed to fetch analytics' };
    }

    return { data: result.data };
}

