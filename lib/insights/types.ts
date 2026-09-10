export type InsightPriority = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type InsightCategory = 'revenue' | 'users' | 'courses' | 'engagement' | 'growth' | 'system';

export interface Insight {
  id: string;
  title: string;
  description: string;
  category: InsightCategory;
  priority: InsightPriority;
  metric?: {
    label: string;
    value: string | number;
    change?: number;
    trend?: 'up' | 'down' | 'neutral';
  };
  action?: {
    label: string;
    route?: string;
    onClick?: () => void;
  };
  timestamp: Date;
  isNew?: boolean;
}

export interface GrowthSuggestion {
  id: string;
  title: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  description: string;
  estimatedImpact: string;
  steps: string[];
  category: InsightCategory;
}

export const PRIORITY_CONFIG = {
  critical: { color: 'red', icon: '🚨', weight: 4 },
  high: { color: 'orange', icon: '⚠️', weight: 3 },
  medium: { color: 'yellow', icon: '💡', weight: 2 },
  low: { color: 'blue', icon: 'ℹ️', weight: 1 },
  info: { color: 'gray', icon: '📊', weight: 0 }
};
