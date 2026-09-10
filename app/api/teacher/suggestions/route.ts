import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import { withResiliency } from '@/lib/resilient-db';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const teacherId = session.userId;

    const suggestionResult = await withResiliency(async () => {
      // Fetch real metrics to generate suggestions
      const courses = await prisma.course.findMany({
        where: { instructorId: teacherId },
        include: {
          enrollments: {
            select: { progressPercentage: true }
          }
        }
      });

      const suggestions = [];

      for (const course of courses) {
        const enrollmentCount = course.enrollments.length;
        
        // 1. If course is empty
        if (enrollmentCount === 0) {
          suggestions.push({
            title: `Launch ${course.title}`,
            desc: 'No students enrolled yet. Try sharing the link on socials.',
            action: 'Share'
          });
        }

        // 2. If progress is low (< 30% average)
        if (enrollmentCount > 0) {
          const avgProgress = course.enrollments.reduce((acc, curr) => acc + (curr.progressPercentage || 0), 0) / enrollmentCount;
          if (avgProgress < 30) {
            suggestions.push({
              title: `Engagement Alert: ${course.title}`,
              desc: 'Average progress is below 30%. Add a quiz to boost interest.',
              action: 'Add Quiz'
            });
          }
        }

        // 3. If completion is high but rating is low
        if ((course.rating || 0) < 4 && (course.ratingCount || 0) > 0) {
          suggestions.push({
            title: 'Review Quality',
            desc: `Course rating is ${course.rating}. Check feedback to improve content.`,
            action: 'Feedback'
          });
        }
      }

      // Default suggestions if nothing specific
      if (suggestions.length === 0) {
        suggestions.push({
          title: 'New Studio Feature',
          desc: 'You can now host live sessions via Microsoft Teams.',
          action: 'Try Now'
        });
      }
      return suggestions.slice(0, 5);
    }, `teacher_suggestions_${teacherId}`);

    if (suggestionResult.success && suggestionResult.data) {
      return NextResponse.json({ 
        success: true, 
        data: suggestionResult.data 
      });
    }

    return NextResponse.json({ 
      success: true, 
      data: [{ title: 'Database Offline', desc: 'Real-time suggestions are paused.', action: 'Wait' }] 
    });

  } catch (error: any) {
    console.error('❌ Suggestions Engine Failure:', error);
    return NextResponse.json({ 
      success: false, 
      data: [],
      error: 'Suggestions unavailable'
    });
  }
}

