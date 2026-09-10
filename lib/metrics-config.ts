import { MetricConfig } from './types';

export const METRICS: Record<string, MetricConfig> = {
  REVENUE: {
    id: 'REVENUE',
    label: 'Total Revenue',
    keywords: ['revenue', 'income', 'sales', 'earning', 'paise', 'paisa', 'money', 'payment', 'collection'],
    synonyms: ['payout', 'profit', 'cash', 'kamai', 'fees', 'paid'],
    weight: 1.0,
    uiType: 'kpi'
  },
  USERS: {
    id: 'USERS',
    label: 'Active Users',
    keywords: ['user', 'student', 'learner', 'member', 'active', 'login', 'enrollment', 'registered', 'signup'],
    synonyms: ['customer', 'client', 'people', 'bachon', 'total users'],
    weight: 1.0,
    uiType: 'kpi'
  },
  COURSES: {
    id: 'COURSES',
    label: 'Published Courses',
    keywords: ['course', 'class', 'module', 'lesson', 'content', 'certificate', 'certification', 'curriculum', 'batch'],
    synonyms: ['training', 'program', 'subject', 'topic', 'study', 'material'],
    weight: 1.0,
    uiType: 'kpi'
  },
  GROWTH: {
    id: 'GROWTH',
    label: 'Growth Trends',
    keywords: ['growth', 'trend', 'increase', 'decrease', 'change', 'compare'],
    synonyms: ['progress', 'development', 'improvement'],
    weight: 1.0,
    uiType: 'trend'
  },
  ENGAGEMENT: {
    id: 'ENGAGEMENT',
    label: 'User Engagement',
    keywords: ['engagement', 'inactive', 'drop', 'churn', 'abandon'],
    synonyms: ['activity', 'participation', 'retention'],
    weight: 1.0,
    uiType: 'trend'
  }
};

export const QUICK_SUGGESTIONS = [
  "Total revenue",
  "Active users",
  "Published courses",
  "Growth trends",
  "Top courses",
  "Inactive users"
];
