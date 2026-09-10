export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { logAdminActivity, ActivityType } from "@/lib/admin-logging";

export async function POST(req: Request) {
  try {
    const { courseId, isFeatured } = await req.json();

    if (!courseId) {
      return NextResponse.json({ message: 'Course ID is required' }, { status: 400 });
    }

    const user = await getCurrentUser();
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: { isFeatured },
    });

    // Log Activity
    await logAdminActivity({
      userId: user.id,
      actorName: user.name || "Admin",
      type: ActivityType.COURSE_STATUS_TOGGLE,
      targetId: updatedCourse.id,
      targetName: updatedCourse.title,
      description: `${isFeatured ? 'Featured' : 'Unfeatured'} course: ${updatedCourse.title}`,
      metadata: { isFeatured }
    });

    return NextResponse.json(updatedCourse);
  } catch (error) {
    console.error('Failed to toggle feature status:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

