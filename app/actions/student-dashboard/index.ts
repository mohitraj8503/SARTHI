// Student dashboard actions index

import { prisma } from '@/lib/prisma';
import { withResiliency } from '@/lib/resilient-db';
import { getSession } from '@/lib/auth/session';

// Shared utilities and types
export async function getCurrentUser() {
    const session = await getSession();
    if (!session?.userId) return null;
    return { id: session.userId, role: session.role };
}

export const IS_CONN_ERROR = (error: unknown) => {
    if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
        const err = error as { code?: string; message?: string };
        return err.code === 'P1001' ||
               err.code === 'P1008' ||
               (err.message && (
                   err.message.includes('database connection') ||
                   err.message.includes('Can\'t reach database server') ||
                   err.message.includes('Temporary failure in name resolution')
               ));
    }
    return false;
};

// Common interfaces
export interface StreakData {
    currentStreak: number;
    bestStreak: number;
    weeklyGoalProgress: number;
    lastActivityDate: string | null;
    weeklyMinutes: number;
    weeklyGoal: number;
}

export interface Deadline {
    id: string;
    title: string;
    courseName: string;
    dueDate: Date;
    type: 'assignment' | 'quiz' | 'project';
    urgency: 'today' | 'this-week' | 'later';
}

export interface AttendanceData {
    overallPercentage: number;
    totalSessions: number;
    attendedSessions: number;
    missedSessions: number;
    thisWeekAttended: number;
    thisWeekTotal: number;
    lastAttendedDate: string | null;
}

export interface CertificateProgress {
    courseId: string;
    courseName: string;
    progress: number;
    requirements: {
        lessonsCompleted: number;
        totalLessons: number;
        requiredLessons: number;
        quizzesPassed: number;
        requiredQuizzes: number;
        hasFinalProject: boolean;
        finalProjectPassed: boolean;
    };
    isEligible: boolean;
    canClaim: boolean;
}

export interface RecommendedItem {
    id: string;
    title: string;
    type: 'course' | 'seminar' | 'workshop' | 'video';
    description: string;
    thumbnail?: string;
    link: string;
    reason: string;
}

export interface SearchResult {
    type: 'course' | 'lesson' | 'seminar' | 'workshop' | 'video';
    id: string;
    title: string;
    description?: string;
    thumbnail?: string;
    link: string;
}

export type StudentJourneyState = 'new' | 'active' | 'event-focused' | 'near-completion' | 'inactive';

// Export all functions from modular files
export { getEnrolledCourses, getLearningStreak, getUpcomingDeadlines, getCertificateProgress } from './course-actions';
export { getLiveLessons, getVideoLibrary } from './live-actions';
export { getStudentTests, getStudentGrades } from './assessment-actions';
export { getMessages, getNotifications } from './communication-actions';
export { getStudentSettings, updateStudentSettings } from './profile-actions';
export { getAttendanceSnapshot, getRecommendedContent, globalSearch, getStudentJourneyState, getLearningAnalytics } from './analytics-actions';

