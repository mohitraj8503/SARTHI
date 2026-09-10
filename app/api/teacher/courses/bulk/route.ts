export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, courseIds } = await request.json();

    if (!action || !courseIds || !Array.isArray(courseIds)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Verify all courses belong to this teacher
    const courses = await prisma.course.findMany({
      where: {
        id: { in: courseIds },
        instructorId: user.id
      },
      select: { id: true, title: true }
    });

    if (courses.length !== courseIds.length) {
      return NextResponse.json({ error: 'Unauthorized to modify some courses' }, { status: 403 });
    }

    let updateData: any = {};

    switch (action) {
      case 'publish':
        updateData = { isPublished: true, status: 'published' };
        break;
      case 'archive':
        updateData = { isPublished: false, status: 'archived' };
        break;
      case 'delete':
        // Soft delete - mark as deleted
        updateData = { status: 'deleted' };
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Execute bulk update
    const result = await prisma.course.updateMany({
      where: {
        id: { in: courseIds },
        instructorId: user.id
      },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      updated: result.count,
      action,
      courses: courses.map(c => ({ id: c.id, title: c.title }))
    });

  } catch (error) {
    console.error('Bulk course operation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

