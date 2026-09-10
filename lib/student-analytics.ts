import { prisma } from './prisma';
import { withResiliency } from './resilient-db';
import {
    SCORE_MAX_VALUES,
    ATTENDANCE_POINTS_PER_SESSION,
    ATTENDANCE_MAX_POINTS,
    ACTIVITY_POINTS_PER_LESSON,
    ACTIVITY_MAX_POINTS,
    getRankFromScore,
    getNextLevelProgress
} from './dashboard-config';

export interface LearningScore {
    score: number;
    rank: string;
    level: number;
    nextLevelProgress: number;
}

/**
 * Calculates a dynamic learning score based on progress, attendance, and activity
 */
export async function calculateStudentAnalytics(userId: string): Promise<LearningScore> {
    try {
        const result = await withResiliency(async () => {
            const [enrollments, attendance, activityCount] = await Promise.all([
                prisma.enrollment.findMany({
                    where: { userId },
                    select: { progressPercentage: true, status: true }
                }),
                prisma.seminarRegistration.count({
                    where: { userId, status: 'ATTENDED' }
                }),
                prisma.progress.count({
                    where: { userId, completed: true }
                })
            ]);
            return { enrollments, attendance, activityCount };
        }, `analytics-${userId}`);

        if (!result || !result.success || !result.data) {
            return { score: 0, rank: 'Novice', level: 1, nextLevelProgress: 0 };
        }

        const { enrollments, attendance, activityCount } = result.data;

        // 1. Progress Component (0-{SCORE_MAX_VALUES.progress} points)
        // Average progress across all courses
        const avgProgress = enrollments.length > 0
            ? enrollments.reduce((sum, e) => sum + e.progressPercentage, 0) / enrollments.length
            : 0;
        const progressPoints = (avgProgress / 100) * SCORE_MAX_VALUES.progress;

        // 2. Consistency/Attendance (0-{SCORE_MAX_VALUES.attendance} points)
        // {ATTENDANCE_POINTS_PER_SESSION} points per seminar attended, max {ATTENDANCE_MAX_POINTS}
        const attendancePoints = Math.min(ATTENDANCE_MAX_POINTS, attendance * ATTENDANCE_POINTS_PER_SESSION);

        // 3. Raw Activity (0-{SCORE_MAX_VALUES.activity} points)
        // {ACTIVITY_POINTS_PER_LESSON} point per completed lesson, max {ACTIVITY_MAX_POINTS}
        const activityPoints = Math.min(ACTIVITY_MAX_POINTS, activityCount * ACTIVITY_POINTS_PER_LESSON);

        const totalScore = Math.floor(progressPoints + attendancePoints + activityPoints);

        // Determine Level and Rank using configurable thresholds
        const { rank, level } = getRankFromScore(totalScore);

        // Progress to next level using configurable formula
        const nextLevelProgress = getNextLevelProgress(totalScore, level);

        return {
            score: totalScore,
            rank,
            level,
            nextLevelProgress
        };
    } catch (error) {
        console.error('[Analytics Utility] Error:', error);
        return { score: 0, rank: 'Novice', level: 1, nextLevelProgress: 0 };
    }
}

/**
 * Fetches recent student activity for the dashboard feed
 * Includes all activity types: lesson progress, assignment submissions, and certificates
 */
export async function getStudentRecentActivity(userId: string, limit = 5) {
    try {
        // Fetch multiple activity types in parallel (with resiliency)
        const result = await withResiliency(async () => {
            const [progressLogs, assignmentSubmissions, certificates] = await Promise.all([
                // Lesson progress
                prisma.progress.findMany({
                    where: { userId, completed: true },
                    take: limit,
                    orderBy: { updatedAt: 'desc' },
                    include: { lesson: { select: { title: true, course: { select: { title: true } } } } }
                }),
                // Assignment submissions
                prisma.assignmentSubmission.findMany({
                    where: { userId },
                    take: limit,
                    orderBy: { updatedAt: 'desc' },
                    include: { assignment: { select: { title: true } } }
                }),
                // Certificates earned
                prisma.certificate.findMany({
                    where: { userId },
                    take: limit,
                    orderBy: { issuedAt: 'desc' }
                })
            ]);
            return { progressLogs, assignmentSubmissions, certificates };
        }, `activity-${userId}`);

        if (!result || !result.success || !result.data) return [];

        const { progressLogs, assignmentSubmissions, certificates } = result.data;

        // Combine and normalize all activity types
        const activities: Array<{
            id: string;
            type: string;
            title: string;
            subtitle: string;
            timestamp: Date;
        }> = [];

        // Add progress activities
        progressLogs.forEach(log => {
            if (log.lesson && log.lesson.course) {
                activities.push({
                    id: log.id,
                    type: 'LESSON_COMPLETED',
                    title: `Completed: ${log.lesson.title}`,
                    subtitle: log.lesson.course.title,
                    timestamp: log.updatedAt
                });
            }
        });

        // Add assignment submission activities
        assignmentSubmissions.forEach(sub => {
            if (sub.assignment) {
                activities.push({
                    id: sub.id,
                    type: 'ASSIGNMENT_SUBMITTED',
                    title: `Submitted: ${sub.assignment.title}`,
                    subtitle: sub.status === 'graded' ? (sub.score !== null ? `Graded: ${sub.score}` : 'Graded') : 'Pending review',
                    timestamp: sub.updatedAt
                });
            }
        });

        // Add certificate activities
        certificates.forEach(cert => {
            activities.push({
                id: cert.id,
                type: 'CERTIFICATE_EARNED',
                title: `Earned certificate`,
                subtitle: cert.certificateNumber || 'Certificate earned',
                timestamp: cert.issuedAt
            });
        });

        // Sort by timestamp descending and take the limit
        activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        return activities.slice(0, limit);
    } catch (error) {
        console.error('[Student Analytics] Activity fetch error:', error);
        return [];
    }
}
