import { Insight, GrowthSuggestion } from './types';

interface PlatformData {
  revenue: {
    total: number;
    growth: number;
    transactions: number;
    avgTicket: number;
  };
  users: {
    total: number;
    active: number;
    newThisWeek: number;
    churnRate: number;
    engagement: number;
  };
  courses: {
    total: number;
    published: number;
    enrollments: number;
    completionRate: number;
    topCourse?: string;
  };
  system: {
    uptime: number;
    errors: number;
    responseTime: number;
  };
}

export class InsightAnalyzer {
  private data: PlatformData;

  constructor(data: PlatformData) {
    this.data = data;
  }

  // Generate all insights
  generateInsights(): Insight[] {
    const insights: Insight[] = [];

    // Revenue Insights
    insights.push(...this.analyzeRevenue());
    
    // User Insights
    insights.push(...this.analyzeUsers());
    
    // Course Insights
    insights.push(...this.analyzeCourses());
    
    // System Insights
    insights.push(...this.analyzeSystem());

    // Sort by priority
    return insights.sort((a, b) => 
      this.getPriorityWeight(b.priority) - this.getPriorityWeight(a.priority)
    );
  }

  // Generate growth suggestions
  generateGrowthSuggestions(): GrowthSuggestion[] {
    const suggestions: GrowthSuggestion[] = [];

    // Revenue Growth
    if (this.data.revenue.growth < 10) {
      suggestions.push({
        id: 'growth-1',
        title: 'Increase Average Order Value',
        impact: 'high',
        effort: 'medium',
        description: 'Your average ticket size is below industry standard.',
        estimatedImpact: '+15-25% revenue increase',
        steps: [
          'Create course bundles',
          'Add upsell prompts at checkout',
          'Offer premium tier with exclusive content'
        ],
        category: 'revenue'
      });
    }

    // User Engagement
    if (this.data.users.engagement < 70) {
      suggestions.push({
        id: 'growth-2',
        title: 'Boost User Engagement',
        impact: 'high',
        effort: 'medium',
        description: 'User engagement is below optimal levels.',
        estimatedImpact: '+20-30% retention rate',
        steps: [
          'Send weekly progress emails',
          'Add gamification (badges, points)',
          'Create community discussions'
        ],
        category: 'engagement'
      });
    }

    // Course Completion
    if (this.data.courses.completionRate < 50) {
      suggestions.push({
        id: 'growth-3',
        title: 'Improve Course Completion',
        impact: 'high',
        effort: 'high',
        description: 'Students are dropping out before finishing courses.',
        estimatedImpact: '+40% completion rate',
        steps: [
          'Break content into smaller modules',
          'Add progress milestones',
          'Send reminder notifications',
          'Offer completion certificates'
        ],
        category: 'courses'
      });
    }

    // User Acquisition
    if (this.data.users.newThisWeek < 5) {
      suggestions.push({
        id: 'growth-4',
        title: 'Accelerate User Acquisition',
        impact: 'high',
        effort: 'medium',
        description: 'New user signups are lower than expected.',
        estimatedImpact: '+50% new users/month',
        steps: [
          'Run targeted social media ads',
          'Offer free trial or freemium tier',
          'Implement referral program',
          'Optimize landing page conversion'
        ],
        category: 'users'
      });
    }

    return suggestions;
  }

  // Private analysis methods
  private analyzeRevenue(): Insight[] {
    const insights: Insight[] = [];
    const { total, growth, transactions, avgTicket } = this.data.revenue;

    if (total === 0) {
      insights.push({
        id: 'rev-1',
        title: 'No Revenue Detected',
        description: 'Start by publishing courses and enabling payments.',
        category: 'revenue',
        priority: 'critical',
        metric: { label: 'Revenue', value: '₹0', trend: 'neutral' },
        action: { label: 'Setup Payments', route: '/admin/settings/payments' },
        timestamp: new Date()
      });
    }

    if (growth < -10) {
      insights.push({
        id: 'rev-2',
        title: 'Revenue Declining',
        description: `Revenue dropped ${Math.abs(growth)}% compared to last period.`,
        category: 'revenue',
        priority: 'high',
        metric: { label: 'Growth', value: `${growth}%`, change: growth, trend: 'down' },
        action: { label: 'View Analytics', route: '/admin/analytics/revenue' },
        timestamp: new Date()
      });
    }

    if (avgTicket < 500 && transactions > 10) {
      insights.push({
        id: 'rev-3',
        title: 'Low Average Order Value',
        description: 'Consider bundling courses or adding premium tiers.',
        category: 'revenue',
        priority: 'medium',
        metric: { label: 'Avg Ticket', value: `₹${avgTicket}`, trend: 'neutral' },
        timestamp: new Date()
      });
    }

    return insights;
  }

  private analyzeUsers(): Insight[] {
    const insights: Insight[] = [];
    const { total, active, churnRate, engagement } = this.data.users;

    if (total === 0) {
      insights.push({
        id: 'user-1',
        title: 'No Users Yet',
        description: 'Start marketing your platform to attract learners.',
        category: 'users',
        priority: 'high',
        metric: { label: 'Users', value: '0', trend: 'neutral' },
        action: { label: 'Marketing Tips', route: '/admin/marketing' },
        timestamp: new Date()
      });
    }

    if (churnRate > 15) {
      insights.push({
        id: 'user-2',
        title: 'High Churn Rate',
        description: `${churnRate}% of users are leaving. Improve engagement.`,
        category: 'users',
        priority: 'critical',
        metric: { label: 'Churn', value: `${churnRate}%`, trend: 'down' },
        action: { label: 'Retention Strategies', route: '/admin/users/retention' },
        timestamp: new Date()
      });
    }

    if (engagement < 50) {
      insights.push({
        id: 'user-3',
        title: 'Low User Engagement',
        description: 'Users are not actively using the platform.',
        category: 'engagement',
        priority: 'high',
        metric: { label: 'Engagement', value: `${engagement}%`, trend: 'down' },
        timestamp: new Date()
      });
    }

    return insights;
  }

  private analyzeCourses(): Insight[] {
    const insights: Insight[] = [];
    const { total, published, enrollments, completionRate } = this.data.courses;

    if (total === 0) {
      insights.push({
        id: 'course-1',
        title: 'No Courses Created',
        description: 'Create your first course to start earning.',
        category: 'courses',
        priority: 'critical',
        action: { label: 'Create Course', route: '/admin/courses/new' },
        timestamp: new Date()
      });
    }

    if (published === 0 && total > 0) {
      insights.push({
        id: 'course-2',
        title: 'No Published Courses',
        description: 'You have draft courses. Publish them to make them available.',
        category: 'courses',
        priority: 'high',
        metric: { label: 'Drafts', value: total.toString(), trend: 'neutral' },
        action: { label: 'Publish Courses', route: '/admin/courses' },
        timestamp: new Date()
      });
    }

    if (completionRate < 30 && enrollments > 10) {
      insights.push({
        id: 'course-3',
        title: 'Low Completion Rate',
        description: 'Students are dropping out. Review course content quality.',
        category: 'courses',
        priority: 'medium',
        metric: { label: 'Completion', value: `${completionRate}%`, trend: 'down' },
        timestamp: new Date()
      });
    }

    return insights;
  }

  private analyzeSystem(): Insight[] {
    const insights: Insight[] = [];
    const { uptime, errors, responseTime } = this.data.system;

    if (uptime < 99) {
      insights.push({
        id: 'sys-1',
        title: 'System Downtime Detected',
        description: 'Platform uptime is below 99% target.',
        category: 'system',
        priority: 'critical',
        metric: { label: 'Uptime', value: `${uptime}%`, trend: 'down' },
        timestamp: new Date()
      });
    }

    if (errors > 10) {
      insights.push({
        id: 'sys-2',
        title: 'High Error Rate',
        description: `${errors} errors detected in the last 24 hours.`,
        category: 'system',
        priority: 'high',
        metric: { label: 'Errors', value: errors.toString(), trend: 'down' },
        action: { label: 'View Logs', route: '/admin/system/logs' },
        timestamp: new Date()
      });
    }

    return insights;
  }

  private getPriorityWeight(priority: string): number {
    const weights: Record<string, number> = {
      critical: 4,
      high: 3,
      medium: 2,
      low: 1,
      info: 0
    };
    return weights[priority] || 0;
  }
}
