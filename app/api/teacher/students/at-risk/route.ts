import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import { withResiliency } from '@/lib/resilient-db';
import { subDays } from 'date-fns';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.userId;
    const sevenDaysAgo = subDays(new Date(), 7);

    const atRiskResult = await withResiliency(async () => {
      return await prisma.user.findMany({
        where: {
          enrollments: {
            some: {
              course: { instructorId: userId }
            }
          },
          OR: [
            { lastActive: { lt: sevenDaysAgo } },
            { enrollments: { some: { progressPercentage: { lt: 30 } } } }
          ]
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          avatar_url: true,
          lastActive: true,
          enrollments: {
            select: {
              progressPercentage: true,
              course: { select: { title: true } }
            },
            take: 1
          }
        },
        take: 10
      });
    }, `at_risk_students_${userId}`);

    if (atRiskResult.success && atRiskResult.data) {
      return NextResponse.json({
        success: true,
        data: atRiskResult.data.map((student: any) => ({
          id: student.id,
          name: student.name || 'Anonymous Student',
          avatar: student.image || student.avatar_url,
          lastActive: student.lastActive,
          reason: student.lastActive && new Date(student.lastActive) < sevenDaysAgo ? 'Inactive > 7 days' : 'Low progress (<30%)',
          course: student.enrollments[0]?.course.title || 'N/A'
        }))
      });
    }

    return NextResponse.json({ success: true, data: [] });


  } catch (error: any) {
    console.error(`❌ API Error /api/teacher/students/at-risk:`, {
      name: error?.name,
      message: error?.message,
      code: error?.code,
    });

    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch at-risk students',
        data: []
      }, 
      { status: 500 }
    );

  }
}

