
import { prisma } from '@/lib/prisma';

export interface Insight {
  type: 'engagement' | 'content_gap' | 'growth' | 'sentiment';
  severity: 'low' | 'medium' | 'high';
  message: string;
  actionable?: boolean;
}

export class TeachingInsightsAgent {
  constructor(private instructorId: string) {}

  /**
   * Generates weekly actionable insights for the instructor
   */
  async generateInsights(): Promise<Insight[]> {
    const insights: Insight[] = [];

    // 1. Analyze Engagement Drops
    // In a real system, we'd query aggregates. Here we check simple heuristic.
    const courses = await prisma.course.findMany({
      where: { instructorId: this.instructorId },
      include: {
        enrollments: true,
        quizzes: { include: { submissions: true } }
      }
    });

    if (courses.length === 0) {
      insights.push({
        type: 'growth',
        severity: 'medium',
        message: 'Pulse tip: Create your first course to start gathering student insights.',
        actionable: true
      });
      return insights;
    }

    // Check for low quiz participation
    for (const course of courses) {
      const studentCount = course.enrollments.length;
      if (studentCount > 5) {
        const totalSubmissions = course.quizzes.reduce((sum, q) => sum + q.submissions.length, 0);
        const submissionRate = totalSubmissions / (studentCount * (course.quizzes.length || 1));
        
        if (submissionRate < 0.3 && course.quizzes.length > 0) {
           insights.push({
             type: 'engagement',
             severity: 'high',
             message: `Pulse tip: Low quiz participation in "${course.title}". Consider shortening the quiz time limit to encourage attempts.`,
             actionable: true
           });
        } else if (course.quizzes.length === 0) {
           insights.push({
             type: 'content_gap',
             severity: 'medium',
             message: `Pulse tip: "${course.title}" has no quizzes. Students retain 40% more with active recall. Add a quiz!`,
             actionable: true
           });
        }
      }
    }

    // Default 'all good' message if nothing major found
    if (insights.length === 0) {
      insights.push({
        type: 'sentiment',
        severity: 'low',
        message: 'Pulse tip: Engagement is stable. Keep up the great work! Your response rate to questions is top declie.',
        actionable: false
      });
    }

    return insights.slice(0, 2); // Limit to top 2
  }
}

export async function getInstructorInsights(instructorId: string) {
  const agent = new TeachingInsightsAgent(instructorId);
  return agent.generateInsights();
}
