export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/skills/analysis - Analyze user's skill gaps from quiz/assignment performance
export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUser();

    if (!session?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.email },
      include: {
        enrollments: {
          include: {
            course: {
              select: { id: true, title: true },
            },
          },
        },
        submissions: {
          where: {
            status: { in: ['graded', 'completed'] },
          },
          include: {
            lesson: {
              select: { id: true, title: true, courseId: true },
            },
          },
        },
        quizSubmissions: {
          include: {
            quiz: {
              select: { id: true, title: true, courseId: true },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Analyze submissions by course/topic
    const skillAnalysis: Record<string, any> = {};

    // Group submissions by course
    user.submissions.forEach((submission) => {
      const courseId = submission.lesson.courseId;
      const lessonTitle = submission.lesson.title;
      const score = submission.grade || 0;

      if (!skillAnalysis[courseId]) {
        skillAnalysis[courseId] = {
          courseId,
          lessons: {},
        };
      }

      if (!skillAnalysis[courseId].lessons[lessonTitle]) {
        skillAnalysis[courseId].lessons[lessonTitle] = {
          attempts: 0,
          totalScore: 0,
          lastScore: 0,
        };
      }

      skillAnalysis[courseId].lessons[lessonTitle].attempts += 1;
      skillAnalysis[courseId].lessons[lessonTitle].totalScore += score;
      skillAnalysis[courseId].lessons[lessonTitle].lastScore = score;
    });

    // Identify skill gaps (topics with avg score < 70%)
    const skillGaps: any[] = [];
    const recommendations: any[] = [];

    for (const courseId in skillAnalysis) {
      const courseData = skillAnalysis[courseId];

      for (const lessonTitle in courseData.lessons) {
        const lessonData = courseData.lessons[lessonTitle];
        const avgScore = lessonData.totalScore / lessonData.attempts;
        const proficiency = Math.round(avgScore);

        if (proficiency < 70) {
          // Find course title
          const enrollment = user.enrollments.find((e) => e.course.id === courseId);
          const courseTitle = enrollment?.course.title || 'Unknown Course';

          skillGaps.push({
            skillName: lessonTitle,
            courseId,
            courseTitle,
            proficiency,
            attempts: lessonData.attempts,
            lastScore: lessonData.lastScore,
          });

          recommendations.push({
            type: 'practice',
            skill: lessonTitle,
            course: courseTitle,
            message: `Your proficiency in "${lessonTitle}" is ${proficiency}%. Practice more to improve!`,
          });

          // Upsert skill gap record
          await prisma.skillGap.upsert({
            where: {
              userId_skillName_courseId: {
                userId: user.id,
                skillName: lessonTitle,
                courseId,
              },
            },
            create: {
              userId: user.id,
              skillName: lessonTitle,
              courseId,
              proficiency,
              attempts: lessonData.attempts,
              lastScore: lessonData.lastScore,
            },
            update: {
              proficiency,
              attempts: lessonData.attempts,
              lastScore: lessonData.lastScore,
            },
          });
        }
      }
    }

    // Calculate overall market readiness (avg proficiency across all submissions)
    const totalSubmissions = user.submissions.length;
    const totalScore = user.submissions.reduce((sum, s) => sum + (s.grade || 0), 0);
    const marketReadiness = totalSubmissions > 0 ? Math.round(totalScore / totalSubmissions) : 0;

    return NextResponse.json({
      marketReadiness,
      skillGaps: skillGaps.slice(0, 5), // Top 5 gaps
      recommendations: recommendations.slice(0, 3), // Top 3 recommendations
      totalAssessments: totalSubmissions,
      needsMoreData: totalSubmissions < 3,
    });
  } catch (error: any) {
    console.error('Error analyzing skills:', error);
    return NextResponse.json(
      { error: 'Failed to analyze skills', details: error.message },
      { status: 500 }
    );
  }
}

