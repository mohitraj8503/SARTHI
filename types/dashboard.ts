/**
 * Dashboard Types
 *
 * Comprehensive type definitions for dashboard components, API responses,
 * data structures, and UI state management.
 */

/**
 * API Response Types
 */

/**
 * Main dashboard data structure returned by the dashboard API
 */
export interface DashboardData {
  userProfile: UserProfile;
  progressOverview: ProgressOverview;
  streak: StreakData;
  recentActivity: RecentActivity[];
  notifications: Notification[];
  recommendedNext: RecommendedCourse[];
  weeklyChart: WeeklyChart;
  achievements: Achievement[];
}

/**
 * User profile information
 */
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  joinDate: string;
  xp: number;
  grade: string;
}

/**
 * Overall progress statistics
 */
export interface ProgressOverview {
  enrolledCourses: number;
  inProgressCourses: number;
  completedCourses: number;
  overallProgress: number;
  totalLessonsCompleted: number;
  totalWatchTimeMinutes: number;
}

/**
 * User learning streak information
 */
export interface StreakData {
  currentStreak: number;
  bestStreak: number;
  lastActiveDate: string | null;
  todayMinutes: number;
}

/**
 * Recent activity item
 */
export interface RecentActivity {
  id: string;
  type: string;
  title: string;
  course: string;
  timestamp: string;
  duration: number | null;
}

/**
 * Notification item
 */
export interface Notification {
  id: string;
  type: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

/**
 * Recommended course suggestion
 */
export interface RecommendedCourse {
  id: string;
  title: string;
  thumbnail: string | null;
  instructor: string;
  lessonsCount: number;
  studentsCount: number;
  level: string;
}

/**
 * Weekly progress chart data
 */
export interface WeeklyChart {
  labels: string[];
  datasets: ChartDataset[];
}

/**
 * Chart dataset for weekly progress
 */
export interface ChartDataset {
  data: number[];
  label: string;
}

/**
 * Achievement item
 */
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: string | null;
}

/**
 * Dashboard Data Structures
 */

/**
 * Course progress item for continue learning section
 */
export interface CourseProgress {
  id: string;
  title: string;
  thumbnail?: string;
  progress: number;
  nextLesson?: {
    title: string;
    type: 'video' | 'quiz' | 'assignment';
    duration?: number;
  };
}

/**
 * Assignment item for dashboard display
 */
export interface AssignmentItem {
  id: string;
  title: string;
  courseName: string;
  dueDate: string;
  points: number;
  status: 'pending' | 'submitted' | 'graded';
}

/**
 * Seminar/Live session information
 */
export interface Seminar {
  id: string;
  title: string;
  instructorName?: string;
  scheduledStart: string;
  meetingLink?: string;
}

/**
 * Course in explore/catalog view
 */
export interface ExploreCourse {
  id: string;
  title: string;
  thumbnail?: string;
  instructor: string;
  price: string;
  category: string;
  level: string;
  rating: number | null;
  students: string | null;
}

/**
 * Enrolled course information
 */
export interface Course {
  id: string;
  title: string;
  thumbnail?: string;
  status: 'active' | 'completed';
  progress: number;
  enrolledAt?: string;
}

/**
 * Assignment details for assignments tab
 */
export interface AssignmentDetail {
  id: string;
  title: string;
  status: string;
  course: string;
  dueDate?: string;
  score?: number;
  submittedAt?: string;
}

/**
 * Forum post for Q&A section
 */
export interface ForumPost {
  id: string;
  title: string;
  category: string;
  votes: number;
  answers: number;
  author: string;
  time: string;
  avatar?: string;
}

/**
 * Component Props Types
 */

/**
 * Props for the Greeting component
 */
export interface GreetingProps {
  name: string;
  localTime: string;
}

/**
 * UI State Types
 */

/**
 * Tab identifier for dashboard navigation
 */
export type DashboardTab =
  | 'dashboard'
  | 'explore'
  | 'my-courses'
  | 'assignments'
  | 'qa'
  | 'achievements'
  | 'settings';

/**
 * Course status filter options
 */
export type CourseFilter = 'All' | 'In Progress' | 'Completed';

/**
 * Journey state for user learning path
 */
export type JourneyState = 'new' | 'active' | 'near-completion' | 'event-focused';

/**
 * Assignment status filter options
 */
export type AssignmentFilter = 'All' | 'Pending' | 'Submitted' | 'Graded';

/**
 * Achievement definition for static achievement data
 */
export interface AchievementDefinition {
  id: string;
  title: string;
  icon: string;
  description: string;
  earned: boolean;
}

/**
 * Level information based on XP
 */
export interface LevelInfo {
  level: 'Beginner' | 'Scholar' | 'Expert' | 'Master';
  threshold: number;
  color?: string;
}

/**
 * Dashboard statistics for display
 */
export interface DashboardStats {
  label: string;
  value: string | number;
  icon: any; // Lucide icon component
}
