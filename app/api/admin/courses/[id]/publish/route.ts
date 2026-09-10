import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';

/**
 * POST /api/admin/courses/[id]/publish
 * Action: Validate and Publish Course
 */
export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getSession();
    if (session?.role !== 'ADMIN' && session?.role !== 'GOD_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const courseId = params.id;

    // 1. Fetch Course with modules and lessons
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: { include: { lessons: true } },
        teacher: true
      }
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // 2. Validation Suite (Strict Blueprint Rules)
    const errors: string[] = [];
    if (course.modules.length === 0) errors.push('Course must have at least one module.');
    
    course.modules.forEach((mod, idx) => {
      if (mod.lessons.length === 0) {
        errors.push(`Module "${mod.title}" (Index ${idx}) must have at least one lesson.`);
      }
      
      mod.lessons.forEach(lesson => {
        if (lesson.type === 'LIVE' && !lesson.scheduledAt) {
          errors.push(`Live lesson "${lesson.title}" must have a scheduled date.`);
        }
      });
    });

    if (!course.teacherId) {
      errors.push('A primary teacher must be assigned before publishing.');
    }

    if (errors.length > 0) {
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    // 3. Perform Publish (Atomic Transaction)
    const publishedCourse = await prisma.$transaction(async (tx) => {
      // Update Course Status
      const c = await tx.course.update({
        where: { id: courseId },
        data: { 
          status: 'PUBLISHED',
          isPublished: true,
          updatedAt: new Date()
        }
      });

      // Freeze all Modules
      await tx.module.updateMany({
        where: { courseId: courseId },
        data: { isLocked: true }
      });

      // Create Audit Log
      await tx.courseEvent.create({
        data: {
          courseId: courseId,
          actorId: session.userId,
          action: 'COURSE_PUBLISHED',
          payload: { timestamp: new Date() }
        }
      });

      return c;
    });

    return NextResponse.json({ success: true, data: publishedCourse });
  } catch (error: any) {
    console.error('[API/Admin/Publish] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
