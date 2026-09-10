/**
 * Shared TypeScript types for Teacher Dashboard
 * Rebuilt for Enterprise/Professional Grade Analytics
 */

export interface TeacherDashboardData {
  teacher: {
    name: string;
    email: string;
    image: string | null;
  };
  pulse: {
    activeLearners: number;
    engagementPercentage: number;
    growthPercentage: number;
    avgProgress: number;
    completionRate: number;
  };
  summary: {
    totalStudents: number;
    activeCourses: number;
    totalRevenue: number;
    lessonsDelivered: number;
    pendingAssignments: number;
    unresolvedQuestions: number;
  };
  revenue: {
    thisMonth: number;
    lastMonth: number;
    expectedNextMonth: number;
    breakdown: {
      courseSales: number;
      seminars: number;
      subscriptions: number;
    };
    trend: number;
    history: { date: string; amount: number }[];
  };
  insights: {
    studentTrendPct: number;
    courseTrendPct: number;
    revenueTrendPct: number;
    lessonsTrendPct: number;
    revenueGoal: number;
    studentActivity: {
      active: number;
      inactive: number;
      new: number;
    };
  };
  topCourses: TeacherTopCourse[];
  recentActivity: TeacherActivityItem[];
  upcomingEvents: UpcomingEvent[];
  courseHealth: CourseHealthRecord[];
  seminarRequests: {
    approved: number;
    pending: number;
  };
}

export interface TeacherTopCourse {
  id: string;
  title: string;
  thumbnail: string | null;
  enrollments: number;
  revenue: number;
  rating: number;
  completionRate: number;
}

export interface TeacherActivityItem {
  id: string;
  studentId: string;
  studentName: string;
  studentImage: string | null;
  courseName: string;
  type: 'ENROLLMENT' | 'PROGRESS' | 'ASSIGNMENT_SUBMISSION' | 'QUESTION';
  progress?: number;
  date: string;
  status?: string;
}

export interface UpcomingEvent {
  id: string;
  title: string;
  type: 'SEMINAR' | 'DEADLINE' | 'MEETING';
  date: string;
  time: string;
}

export interface CourseHealthRecord {
  id: string;
  title: string;
  rating: number;
  completionRate: number;
  revenue: number;
  status: 'OPTIMAL' | 'NEEDS_UPDATE' | 'CRITICAL';
}
