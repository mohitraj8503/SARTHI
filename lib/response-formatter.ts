/**
 * response-formatter.ts
 * Converts raw DB data into natural, human-friendly admin insights.
 */

export function formatNaturalResponse(metricId: string, data: any): string {
  switch (metricId) {
    case 'REVENUE': {
      const total = data.total ?? 0;
      const growth = data.growthPct ?? data.revenueChangePct ?? 0;
      const emoji  = total > 0 ? '💰' : '⚠️';
      const trend  = growth > 0 ? `📈 +${growth}%` : growth < 0 ? `📉 ${growth}%` : '➡️ 0%';
      const txns   = data.transactionCount ?? data.transactions ?? 0;
      if (total === 0) {
        return `${emoji} Revenue: ₹0\nStatus: No transactions recorded yet.\nTip: Share course links to attract learners! 🚀`;
      }
      return `${emoji} Total Revenue: ₹${total.toLocaleString('en-IN')}\nGrowth: ${trend} vs last period\nTransactions: ${txns}`;
    }

    case 'USERS': {
      const count    = data.activeStudents ?? data.count ?? data.total ?? 0;
      const newUsers = data.newSignups ?? data.newUsers ?? 0;
      const emoji    = count > 10 ? '🎉' : count > 0 ? '👥' : '⚠️';
      if (count === 0) {
        return `${emoji} Students: 0\nNo registered learners yet.\nTip: Enable signups and start onboarding! 🚀`;
      }
      return `${emoji} Total Students: ${count}\nNew this month: ${newUsers}\nAll registered and active!`;
    }

    case 'COURSES': {
      const published   = data.publishedCourses ?? data.published ?? 0;
      const total       = data.totalCourses ?? published;
      const enrollments = data.totalEnrollments ?? 0;
      const emoji       = published > 0 ? '📚' : '⚠️';
      if (published === 0) {
        return `${emoji} Courses: 0 published\nNo courses are live yet.\nTip: Publish a course to start teaching! 🎓`;
      }
      return `${emoji} Published Courses: ${published} / ${total} total\nTotal Enrollments: ${enrollments > 0 ? enrollments : 'None yet'}\nAll courses are live and accepting students! 🎓`;
    }

    case 'GROWTH': {
      const userGrowth    = data.userGrowthPct ?? data.growth ?? 0;
      const revenueGrowth = data.revenueGrowthPct ?? 0;
      const trend         = userGrowth >= 0 ? '📈' : '📉';
      return `${trend} Growth Report\nUser Growth: ${userGrowth >= 0 ? '+' : ''}${userGrowth}% MoM\nRevenue Growth: ${revenueGrowth >= 0 ? '+' : ''}${revenueGrowth}% MoM\n${userGrowth > 10 ? 'Platform is scaling fast! 🚀' : userGrowth > 0 ? 'Steady upward momentum. Keep it up!' : 'Consider launching a campaign to boost growth.'}`;
    }

    case 'ENGAGEMENT': {
      const rate    = data.engagementRate ?? data.rate ?? 0;
      const active  = data.activeIn7Days  ?? data.active ?? 0;
      const emoji   = rate > 50 ? '🔥' : rate > 20 ? '✅' : '⚠️';
      return `${emoji} Engagement Rate: ${rate}%\nActive learners (7 days): ${active}\n${rate > 50 ? 'Excellent retention!' : rate > 20 ? 'Good engagement. Push a few nudges.' : 'Low activity — try sending a re-engagement email!'}`;
    }

    default:
      return `Data loaded for ${metricId}.`;
  }
}

export function formatFollowUpSuggestions(metricId: string, data: any): string[] {
  switch (metricId) {
    case 'REVENUE':   return ['Revenue this week', 'Revenue by course', 'Growth trends'];
    case 'USERS':     return ['New signups today', 'Inactive users', 'Who is [name]'];
    case 'COURSES':   return ['Top courses', 'Course enrollments', 'Published courses'];
    case 'GROWTH':    return ['Revenue trend', 'User growth', 'Engagement rate'];
    case 'ENGAGEMENT':return ['Active users', 'Inactive users', 'Growth trends'];
    default:          return ['Total revenue', 'Active users', 'Published courses'];
  }
}
