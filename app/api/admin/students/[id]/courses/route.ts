import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/students/[id]/courses
 * Returns all courses a student is enrolled in
 */
export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getCurrentUser();
    const userRole = (session?.role as string)?.toUpperCase();
    
    if (!session || (userRole !== 'ADMIN' && userRole !== 'ADMINISTRATOR')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const studentId = params.id;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // Optional filter by enrollment status

    // Check if student exists
    const student = await prisma.user.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Build enrollment where clause
    const enrollmentWhere: any = {
      userId: studentId,
    };
    
    if (status) {
      enrollmentWhere.status = status;
    }

    // Get enrollments with course details
    const enrollments = await prisma.enrollment.findMany({
      where: enrollmentWhere,
      include: {
        course: {
          select: {
            id: true,
            title: true,
            description: true,
            thumbnail: true,
            price: true,
            instructorId: true,
            instructor: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform to include progress info
    const courses = enrollments.map(enrollment => ({
      id: enrollment.id,
      courseId: enrollment.course.id,
      courseName: enrollment.course.title,
      courseDescription: enrollment.course.description,
      courseThumbnail: enrollment.course.thumbnail,
      coursePrice: enrollment.course.price,
      instructorId: enrollment.course.instructorId,
      instructorName: enrollment.course.instructor?.name || 'Unknown',
      status: enrollment.status,
      progressPercentage: enrollment.progressPercentage || 0,
      enrolledAt: enrollment.createdAt,
      completedAt: enrollment.completedAt,
      lastAccessedAt: enrollment.lastAccessedAt,
    }));

    return NextResponse.json({
      courses,
      total: courses.length,
    });
  } catch (error) {
    console.error('Failed to fetch student courses:', error);
    return NextResponse.json({ error: 'Failed to fetch student courses' }, { status: 500 });
  }
}

/**
 * POST /api/admin/students/[id]/courses
 * Enroll a student in a course
 */
export async function POST(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getCurrentUser();
    const userRole = (session?.role as string)?.toUpperCase();
    
    if (!session || (userRole !== 'ADMIN' && userRole !== 'ADMINISTRATOR')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const studentId = params.id;
    const { courseId } = await request.json();

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
    }

    // Check if student exists
    const student = await prisma.user.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: studentId,
          courseId,
        },
      },
    });

    if (existingEnrollment) {
      return NextResponse.json({ error: 'Student is already enrolled in this course' }, { status: 400 });
    }

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        userId: studentId,
        courseId: courseId as string,
        status: 'active',
        enrolledBy: 'admin_manual',
        enrolledByUserId: session.id,
      } as any,
    });

    // Update course enrolled count
    await prisma.course.update({
      where: { id: courseId },
      data: {
        enrolledStudentsCount: { increment: 1 },
      },
    });

    // Log activity
    await prisma.platformActivity.create({
      data: {
        type: 'COURSE_ENROLLED',
        userId: session.id,
        data: JSON.stringify({
          description: `Student ${student.name} enrolled in course ${course.title}`,
          studentName: student.name,
          courseName: course.title,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      enrollment: {
        id: enrollment.id,
        courseId: enrollment.courseId,
        status: enrollment.status,
      },
    });
  } catch (error) {
    console.error('Failed to enroll student in course:', error);
    return NextResponse.json({ error: 'Failed to enroll student in course' }, { status: 500 });
  }
}
