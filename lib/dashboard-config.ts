/**
 * Student Dashboard Configuration
 * 
 * All hardcoded values in the student dashboard can be configured here.
 * Values can be overridden via environment variables or used directly.
 */

// Weekly goal in minutes (default: 120 minutes)
export const WEEKLY_GOAL_MINUTES = parseInt(process.env.STUDENT_WEEKLY_GOAL_MINUTES || '120', 10);

// Learning Score Weights (must sum to 100)
export const LEARNING_SCORE_WEIGHTS = {
    progress: parseInt(process.env.LEARNING_SCORE_WEIGHT_PROGRESS || '40', 10),
    attendance: parseInt(process.env.LEARNING_SCORE_WEIGHT_ATTENDANCE || '30', 10),
    activity: parseInt(process.env.LEARNING_SCORE_WEIGHT_ACTIVITY || '30', 10),
};

// Rank Thresholds (score points required for each rank)
export const RANK_THRESHOLDS = {
    legendary: parseInt(process.env.RANK_THRESHOLD_LEGENDARY || '90', 10),
    expert: parseInt(process.env.RANK_THRESHOLD_EXPERT || '70', 10),
    advanced: parseInt(process.env.RANK_THRESHOLD_ADVANCED || '50', 10),
    intermediate: parseInt(process.env.RANK_THRESHOLD_INTERMEDIATE || '20', 10),
};

// Level Progression (points per level)
export const LEVEL_POINTS_PER_LEVEL = parseInt(process.env.LEVEL_POINTS_PER_LEVEL || '20', 10);

// Maximum values for score components
export const SCORE_MAX_VALUES = {
    progress: parseInt(process.env.SCORE_MAX_PROGRESS || '40', 10),
    attendance: parseInt(process.env.SCORE_MAX_ATTENDANCE || '30', 10),
    activity: parseInt(process.env.SCORE_MAX_ACTIVITY || '30', 10),
};

// Attendance points per session (max capped)
export const ATTENDANCE_POINTS_PER_SESSION = parseInt(process.env.ATTENDANCE_POINTS_PER_SESSION || '5', 10);
export const ATTENDANCE_MAX_POINTS = parseInt(process.env.ATTENDANCE_MAX_POINTS || '30', 10);

// Activity points per completed lesson (max capped)
export const ACTIVITY_POINTS_PER_LESSON = parseInt(process.env.ACTIVITY_POINTS_PER_LESSON || '1', 10);
export const ACTIVITY_MAX_POINTS = parseInt(process.env.ACTIVITY_MAX_ACTIVITY || '30', 10);

// Journey state configuration
export const JOURNEY_STATE_CONFIG = {
    nearCompletionThreshold: parseInt(process.env.JOURNEY_NEAR_COMPLETION_THRESHOLD || '80', 10),
    eventFocusedMinRegistrations: parseInt(process.env.JOURNEY_EVENT_FOCUSED_MIN_REGISTRATIONS || '2', 10),
    eventFocusedDaysLookback: parseInt(process.env.JOURNEY_EVENT_FOCUSED_DAYS_LOOKBACK || '30', 10),
    inactiveDaysThreshold: parseInt(process.env.JOURNEY_INACTIVE_DAYS_THRESHOLD || '30', 10),
};

// Dashboard limits
export const DASHBOARD_LIMITS = {
    maxEnrolledCourses: parseInt(process.env.DASHBOARD_MAX_ENROLLED_COURSES || '6', 10),
    maxRecentActivity: parseInt(process.env.DASHBOARD_MAX_RECENT_ACTIVITY || '5', 10),
    maxUpcomingSeminars: parseInt(process.env.DASHBOARD_MAX_UPCOMING_SEMINARS || '5', 10),
    maxDeadlines: parseInt(process.env.DASHBOARD_MAX_DEADLINES || '5', 10),
    maxRecommendations: parseInt(process.env.DASHBOARD_MAX_RECOMMENDATIONS || '4', 10),
    maxWorkshopRegistrations: parseInt(process.env.DASHBOARD_MAX_WORKSHOP_REGISTRATIONS || '3', 10),
    maxTransactions: parseInt(process.env.DASHBOARD_MAX_TRANSACTIONS || '5', 10),
    streakDaysLookback: parseInt(process.env.STREAK_DAYS_LOOKBACK || '30', 10),
};

// Deadline configuration (days ahead to show)
export const DEADLINE_DAYS_AHEAD = parseInt(process.env.DEADLINE_DAYS_AHEAD || '7', 10);

// Student dashboard copy and fallback labels
export const STUDENT_DASHBOARD_DEFAULT_INSTRUCTOR =
    process.env.STUDENT_DASHBOARD_DEFAULT_INSTRUCTOR || 'SARTHI Faculty';

export const STUDENT_DASHBOARD_DEFAULT_NEXT_LESSON =
    process.env.STUDENT_DASHBOARD_DEFAULT_NEXT_LESSON || 'Continue with your next lesson';

// Helper function to get rank based on score
export function getRankFromScore(score: number): { rank: string; level: number } {
    if (score >= RANK_THRESHOLDS.legendary) return { rank: 'Legendary', level: 5 };
    if (score >= RANK_THRESHOLDS.expert) return { rank: 'Expert', level: 4 };
    if (score >= RANK_THRESHOLDS.advanced) return { rank: 'Advanced', level: 3 };
    if (score >= RANK_THRESHOLDS.intermediate) return { rank: 'Intermediate', level: 2 };
    return { rank: 'Novice', level: 1 };
}

// Helper function to calculate progress to next level
export function getNextLevelProgress(score: number, level: number): number {
    const nextLevelThreshold = level * LEVEL_POINTS_PER_LEVEL;
    return Math.min(100, Math.round((score / nextLevelThreshold) * 100));
}

export function getGreetingForHour(hour: number): string {
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
}
