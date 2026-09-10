export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, isAdmin } from '@/lib/auth';

// Helper to generate human-readable description from activity type
function generateDescription(type: string, data: any): string {
  switch (type) {
    case 'student_registered':
      return `${data.studentName || 'A student'} registered on the platform`;
    case 'teacher_registered':
      return `${data.teacherName || 'An instructor'} joined as teacher`;
    case 'enrollment':
      return `${data.studentName || 'Student'} enrolled in "${data.courseName || 'a course'}"`;
    case 'payment':
      return `Payment of ₹${data.amount || 0} received from ${data.studentName || 'a student'}`;
    case 'course_created':
      return `${data.teacherName || 'Teacher'} created a new course: "${data.courseName || ''}"`;
    case 'course_published':
      return `${data.teacherName || 'Teacher'} published "${data.courseName || 'a course'}"`;
    case 'completion':
      return `${data.studentName || 'Student'} completed "${data.courseName || 'a course'}"`;
    case 'certificate_issued':
      return `Certificate issued to ${data.studentName || 'student'} for "${data.courseName || 'a course'}"`;
    case 'review_added':
      return `${data.studentName || 'Student'} left a ${data.rating || 0}-star review`;
    default:
      return data.description || `Activity: ${type}`;
  }
}

// GET /api/admin/activity-feed - Returns recent activity feed
export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUser();

    if (!isAdmin(session)) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Get limit from query params (default: 10)
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);

    // Fetch recent activities from ActivityLog
    const activities = await prisma.activityLog.findMany({
      take: limit,
      orderBy: {
        timestamp: 'desc'
      }
    });

    // Format activities for response
    const formattedActivities = activities.map(activity => {
      let metadata = {};
      try {
        if (activity.metadata) {
          metadata = typeof activity.metadata === 'string'
            ? JSON.parse(activity.metadata)
            : activity.metadata;
        }
      } catch (e) {
        // Ignore parsing errors
      }

      return {
        id: activity.id,
        type: activity.type,
        description: generateDescription(activity.type, metadata),
        actorName: activity.actorName,
        targetName: activity.targetName,
        timestamp: activity.timestamp.toISOString(),
        userId: activity.userId
      };
    });

    // Return with cache headers
    return NextResponse.json(formattedActivities, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
      }
    });

  } catch (error) {
    console.error('[Admin Activity Feed] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity feed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

