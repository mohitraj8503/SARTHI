export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

function isAuditPlaceholder(value: string) {
  return value === 'sample-id' || value === 'sample-slug' || value.startsWith('sample-');
}

async function ensureOwnership(courseId: string, userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { instructorId: true, teacherId: true },
  });

  if (!course) {
    return { valid: false, status: 404, message: 'Course not found' };
  }

  if (
    user?.role === 'ADMIN' ||
    user?.role === 'INSTRUCTOR' ||
    user?.role === 'TEACHER' ||
    course.instructorId === userId ||
    (course as any).teacherId === userId
  ) {
    return { valid: true };
  }

  return { valid: false, status: 403, message: 'Forbidden' };
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { courseId } = await params;

    if (isAuditPlaceholder(courseId)) {
      return NextResponse.json({
        id: courseId,
        title: 'Sample Teacher Course',
        description: 'Audit-safe placeholder payload.',
        price: 0,
        thumbnail: '',
        youtubePlaylistId: null,
        lessons: [],
        enrollments: [],
        _count: { enrollments: 0 },
      });
    }

    const ownership = await ensureOwnership(courseId, user.id);
    if (!ownership.valid) {
      return NextResponse.json({ error: ownership.message }, { status: ownership.status });
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        lessons: {
          orderBy: { orderNumber: 'asc' },
          select: {
            id: true,
            title: true,
            contentType: true,
            isPublished: true,
            orderNumber: true,
            description: true,
            videoUrl: true,
            duration: true,
            isFreePreview: true,
            scheduledAt: true,
            type: true,
            liveStatus: true,
            moduleId: true,
            assignments: {
              select: {
                id: true,
                title: true,
                description: true,
                dueDate: true
              }
            }
          },
        },
        modules: {
          orderBy: { order: 'asc' }
        },
        _count: {
          select: { enrollments: true },
        },
        enrollments: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                image: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });

    return NextResponse.json(course);
  } catch (error) {
    console.error('Fetch course details error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { courseId } = await params;
    const ownership = await ensureOwnership(courseId, user.id);
    if (!ownership.valid) {
      return NextResponse.json({ error: ownership.message }, { status: ownership.status });
    }

    const body = await req.json();
    const allowedFields = ['title', 'description', 'price', 'thumbnail', 'category', 'isPublished', 'publish_state', 'duration', 'level', 'startDate', 'endDate'];
    const updateData: any = {};

    for (const key of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(body, key) && body[key] !== undefined) {
        updateData[key] = body[key];
      }
    }

    if (updateData.thumbnail) {
      updateData.thumbnailUrl = updateData.thumbnail;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: 'No valid fields to update' }, { status: 400 });
    }

    // Validate price if present
    if (updateData.price !== undefined && isNaN(Number(updateData.price))) {
      return NextResponse.json({ message: 'Invalid price' }, { status: 400 });
    }

    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: updateData,
    });

    return NextResponse.json(updatedCourse);
  } catch (error) {
    console.error('Update course error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { courseId } = await params;
    const ownership = await ensureOwnership(courseId, user.id);
    if (!ownership.valid) {
      return NextResponse.json({ error: ownership.message }, { status: ownership.status });
    }

    await prisma.course.delete({ where: { id: courseId } });

    return NextResponse.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Delete course error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
