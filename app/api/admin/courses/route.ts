export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { isAdministrativeRole } from '@/config/roles';

/**
 * POST /api/admin/courses
 * Action: Create a new course draft (Admin Only)
 */
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !isAdministrativeRole(user.role)) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, category, level, price } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const course = await prisma.course.create({
      data: {
        title,
        description,
        category,
        level: level || 'Beginner',
        price: price || 0,
        status: 'DRAFT',
        instructorId: user.id, // Admin who created it
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now(),
      }
    });

    // Create Audit Event
    try {
      await prisma.courseEvent.create({
        data: {
          courseId: course.id,
          actorId: user.id,
          action: 'COURSE_CREATED',
          payload: { title }
        }
      });
    } catch (e) {
      // Non-critical audit event error
    }

    return NextResponse.json({ success: true, data: course });
  } catch (error: any) {
    console.error('[API/Admin/Courses/POST] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', message: error?.message }, { status: 500 });
  }
}

/**
 * GET /api/admin/courses
 * Action: List all courses with status filters and search
 */
export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !isAdministrativeRole(user.role)) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const rawStatus = searchParams.get('status')?.toUpperCase();
    const searchQuery = searchParams.get('q')?.trim();
    const limitParam = parseInt(searchParams.get('limit') || '100');

    const where: any = {};

    if (rawStatus && rawStatus !== 'ALL') {
      if (['DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED'].includes(rawStatus)) {
        where.status = rawStatus;
      }
    }

    if (searchQuery) {
      where.OR = [
        { title: { contains: searchQuery } },
        { category: { contains: searchQuery } },
        { instructor: { name: { contains: searchQuery } } },
      ];
    }

    const courses = await prisma.course.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limitParam || 100,
      include: {
        instructor: {
          select: { name: true, image: true, avatar_url: true }
        },
        _count: { select: { modules: true, lessons: true, enrollments: true } }
      }
    });

    const formattedCourses = courses.map((course: any) => ({
      ...course,
      price: Number(course.price || 0),
      instructor: {
        name: course.instructor?.name || 'Lead Instructor',
        image: course.instructor?.avatar_url || course.instructor?.image || undefined
      }
    }));

    return NextResponse.json({ success: true, data: formattedCourses });
  } catch (error: any) {
    console.error('[API/Admin/Courses/GET] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', message: error?.message }, { status: 500 });
  }
}
