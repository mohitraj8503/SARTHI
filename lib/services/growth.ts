import { prisma } from '@/lib/prisma';
import { withResiliency } from '@/lib/resilient-db';

export type UserConversionState = 'NEW_STUDENT' | 'INTERESTED' | 'HIGH_INTENT';

export interface DiscoveryData {
    state: UserConversionState | 'ENROLLED';
    interestScore: number;
    recommendedCourses: any[];
    trendingCourses: any[];
    recentlyViewed: any[];
    suggestedNextAction: {
        label: string;
        href: string;
        type: 'PRIMARY' | 'SECONDARY';
    };
    socialProof: {
        totalStudents: number;
        averageRating: number;
        successStories: any[];
    };
}

/**
 * Tracks student activity for conversion and personalization
 */
export async function trackStudentActivity(userId: string, type: string, metadata: any = {}) {
    try {
        await prisma.studentActivity.create({
            data: {
                userId,
                type,
                metadata: JSON.stringify(metadata)
            }
        });
    } catch (error) {
        console.error('Failed to track student activity:', error);
    }
}

/**
 * Main service to handle non-enrolled user experience
 */
export async function getNonEnrolledDashboardData(userId: string): Promise<DiscoveryData> {
    const [activities, pendingPurchases, allCourses, enrollments] = await Promise.all([
        withResiliency(() => prisma.studentActivity.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50
        }), `growth_activities_${userId}`).then(res => res.data || []),
        withResiliency(() => prisma.pendingPurchase.findMany({
            where: { userId },
            include: { course: true }
        }), `growth_pending_${userId}`).then(res => res.data || []),
        withResiliency(() => prisma.course.findMany({
            where: { isPublished: true },
            select: {
                id: true,
                slug: true,
                title: true,
                thumbnail: true,
                price: true,
                category: true,
                rating: true,
                ratingCount: true,
                enrolledStudentsCount: true,
                level: true,
                instructor: { select: { name: true } }
            }
        }), 'growth_courses').then(res => res.data || []),
        withResiliency(() => prisma.enrollment.findMany({
            where: { userId },
            select: { courseId: true }
        }), `growth_enrollments_${userId}`).then(res => res.data || [])
    ]);

    const enrolledCourseIds = new Set(enrollments.map(e => e.courseId));

    // 1. Calculate Interest Score & Detect State
    let interestScore = 0;
    const viewedCourseIds = new Set<string>();
    const interestedCategories = new Map<string, number>();

    activities.forEach(activity => {
        const meta = activity.metadata ? JSON.parse(activity.metadata) : {};
        
        switch (activity.type) {
            case 'COURSE_VIEW':
                if (meta.courseId && !enrolledCourseIds.has(meta.courseId)) {
                    interestScore += 3;
                    viewedCourseIds.add(meta.courseId);
                }
                if (meta.category) {
                    interestedCategories.set(meta.category, (interestedCategories.get(meta.category) || 0) + 1);
                }
                break;
            case 'CATEGORY_CLICK':
                interestScore += 1;
                if (meta.category) {
                    interestedCategories.set(meta.category, (interestedCategories.get(meta.category) || 0) + 2);
                }
                break;
            case 'SEARCH':
                interestScore += 2;
                break;
        }
    });

    // Add score for cart items
    interestScore += pendingPurchases.length * 10;

    // Detect State
    let state: UserConversionState = 'NEW_STUDENT';
    if (pendingPurchases.length > 0) {
        state = 'HIGH_INTENT';
    } else if (viewedCourseIds.size > 0 || interestScore > 5) {
        state = 'INTERESTED';
    }

    // 2. Recommendation Engine (Personalization)
    const topCategory = Array.from(interestedCategories.entries())
        .sort((a, b) => b[1] - a[1])[0]?.[0];

    let recommendedCourses = allCourses
        .filter(c => !enrolledCourseIds.has(c.id) && !viewedCourseIds.has(c.id))
        .sort((a, b) => {
            if (topCategory && a.category === topCategory && b.category !== topCategory) return -1;
            if (topCategory && b.category === topCategory && a.category !== topCategory) return 1;
            return b.rating - a.rating;
        })
        .slice(0, 6);

    // 3. Trending & Social Proof
    const trendingCourses = [...allCourses]
        .filter(c => !enrolledCourseIds.has(c.id))
        .sort((a, b) => b.enrolledStudentsCount - a.enrolledStudentsCount)
        .slice(0, 6);

    const recentlyViewed = allCourses.filter(c => viewedCourseIds.has(c.id));

    // 4. Suggested Next Action
    let suggestedNextAction: DiscoveryData['suggestedNextAction'] = {
        label: 'Explore Catalog',
        href: '/dashboard?tab=explore',
        type: 'SECONDARY'
    };

    if (state === 'HIGH_INTENT') {
        suggestedNextAction = {
            label: 'Complete Enrollment',
            href: `/checkout/${pendingPurchases[0].courseId}`,
            type: 'PRIMARY'
        };
    } else if (state === 'INTERESTED' && recentlyViewed.length > 0) {
        suggestedNextAction = {
            label: `Continue Exploring ${recentlyViewed[0].title}`,
            href: `/courses/${recentlyViewed[0].slug || recentlyViewed[0].id}`,
            type: 'PRIMARY'
        };
    }

    return {
        state,
        interestScore,
        recommendedCourses: recommendedCourses.map(mapCourse),
        trendingCourses: trendingCourses.map(mapCourse),
        recentlyViewed: recentlyViewed.map(mapCourse),
        suggestedNextAction,
        socialProof: {
            totalStudents: allCourses.reduce((acc, c) => acc + (c.enrolledStudentsCount || 0), 0),
            averageRating: 4.8,
            successStories: []
        }
    };
}

/**
 * Retention service: Suggests next paths for already enrolled students
 */
export async function getRetentionRecommendations(userId: string) {
    const enrollmentsRes = await withResiliency(() => prisma.enrollment.findMany({
        where: { userId },
        include: { course: { select: { category: true, level: true } } }
    }), `retention_enrollments_${userId}`);

    const enrollments = enrollmentsRes.data || [];
    if (enrollments.length === 0) return null;

    const enrolledCourseIds = new Set(enrollments.map(e => e.courseId));
    const enrolledCategories = new Set(enrollments.map(e => e.course.category).filter(Boolean));

    const nextPathsRes = await withResiliency(() => prisma.course.findMany({
        where: {
            isPublished: true,
            id: { notIn: Array.from(enrolledCourseIds) },
            OR: [
                { category: { in: Array.from(enrolledCategories) as string[] } },
                { isFeatured: true }
            ]
        },
        select: {
            id: true,
            slug: true,
            title: true,
            thumbnail: true,
            category: true,
            level: true,
            rating: true,
            instructor: { select: { name: true } }
        },
        take: 4
    }), `retention_paths_${userId}`);

    return (nextPathsRes.data || []).map(mapCourse);
}

function mapCourse(c: any) {
    return {
        id: c.id,
        slug: c.slug,
        title: c.title,
        thumbnail: c.thumbnail,
        instructor: c.instructor?.name || 'Expert',
        price: c.price ? `₹${Number(c.price).toLocaleString()}` : '0',
        rating: c.rating || 0,
        ratingCount: c.ratingCount || 0,
        students: c.enrolledStudentsCount || 0,
        category: c.category || 'General',
        level: c.level || 'Beginner'
    };
}
