export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const userRole = (session.role || '').toUpperCase();

    // Check if user is teacher or admin
    if (userRole !== 'TEACHER' && userRole !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Forbidden: Only teachers or admins can create announcements' },
        { status: 403 }
      );
    }

    const { course_id, message, title } = await request.json();

    // Validation
    if (!course_id) {
      return NextResponse.json({ message: 'Course ID is required' }, { status: 400 });
    }

    if (!message) {
      return NextResponse.json({ message: 'Message is required' }, { status: 400 });
    }

    if (!title) {
      return NextResponse.json({ message: 'Title is required' }, { status: 400 });
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: course_id },
    });

    if (!course) {
      return NextResponse.json({ message: 'Course not found' }, { status: 404 });
    }

    // Create the announcement
    const announcement = await prisma.announcement.create({
      data: {
        title,
        content: message,
        authorId: session.userId,
        courseId: course_id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json(announcement, { status: 201 });
  } catch (error) {
    console.error('Create announcement error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    if (!courseId) {
      return NextResponse.json({ message: 'Course ID is required' }, { status: 400 });
    }

    // Get all announcements for the course
    const announcements = await prisma.announcement.findMany({
      where: { courseId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(announcements);
  } catch (error) {
    console.error('Fetch announcements error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

