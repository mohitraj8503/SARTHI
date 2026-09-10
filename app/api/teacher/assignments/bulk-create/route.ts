import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { courseId, assignments } = body;

    if (!Array.isArray(assignments)) {
      return NextResponse.json({ error: 'Assignments must be an array' }, { status: 400 });
    }

    // Verify course belongs to teacher
    const course = await prisma.course.findFirst({
      where: { id: courseId, instructorId: user.id }
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found or unauthorized' }, { status: 404 });
    }

    let currentOrder = await prisma.lesson.count({ where: { courseId } });

    const results = await prisma.$transaction(
      assignments.map((a: any) => {
        currentOrder++;
        return prisma.lesson.create({
          data: {
            courseId,
            title: a.title,
            description: a.description,
            contentType: 'assignment',
            orderNumber: currentOrder,
            position: currentOrder,
            assignments: {
              create: {
                title: a.title,
                description: a.description,
                type: a.type || 'file_upload',
                maxScore: a.maxScore || 100,
                passingScore: a.passingScore || 70,
                dueDate: a.dueDate ? new Date(a.dueDate) : null
              }
            }
          }
        });
      })
    );

    return NextResponse.json({ success: true, count: results.length });
  } catch (error: any) {
    console.error('[Bulk Create Assignments] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

