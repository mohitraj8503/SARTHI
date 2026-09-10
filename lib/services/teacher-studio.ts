import { Activity, BookOpen, DollarSign, Users, Star, CheckCircle } from 'lucide-react';

export interface TeacherStats {
  totalRevenue: number;
  revenueGrowth: number;
  activeLearners: number;
  learnersGrowth: number;
  engagementRate: number;
  engagementGrowth: number;
  completionRate: number;
  completionGrowth: number;
}

export interface RevenuePoint {
  date: string;
  amount: number;
}

export interface ActivityEvent {
  id: string;
  type: 'enrollment' | 'completion' | 'question' | 'payout';
  title: string;
  description: string;
  timestamp: string;
  link: string;
  user?: {
    name: string;
    image?: string;
  };
}

export interface CourseHealthData {
  id: string;
  title: string;
  students: number;
  completionRate: number;
  rating: number;
  revenue: number;
  healthScore: number; // 0-100
}

export interface TeacherDashboardData {
  stats: TeacherStats;
  revenueHistory: RevenuePoint[];
  recentActivity: ActivityEvent[];
  courseHealth: CourseHealthData[];
  revenueTarget: {
    current: number;
    goal: number;
  };
}

// Service Layer
export const TeacherDashboardService = {
  getDashboardData: async (): Promise<TeacherDashboardData & { teacher: any }> => {
    const response = await fetch('/api/teacher/dashboard');
    if (!response.ok) {
      throw new Error('Failed to fetch dashboard data');
    }
    const json = await response.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch dashboard data');
    return json.data;
  }
};
