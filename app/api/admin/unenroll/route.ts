export const dynamic = "force-dynamic";
import { requireAdmin, ApiResponse, handleApiError } from '@/lib/admin/core';

export async function POST(req: Request) {
  try {
    const session = await requireAdmin();

    const { userId, courseId } = await req.json();

    if (!userId || !courseId) {
      return NextResponse.json({ error: 'Missing userId or courseId' }, { status: 400 });
    }

    // Delete enrollment
    await prisma.enrollment.delete({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    // Log platform activity
    const student = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { title: true },
    });

    await prisma.platformActivity.create({
      data: {
        type: 'unenrollment',
        userId: userId,
        data: JSON.stringify({
          description: `Manually unenrolled from "${course?.title}" by Admin`,
          userName: student?.name || student?.email,
          courseTitle: course?.title,
          adminName: session.user?.name || 'Admin',
        }),
      },
    });

    return ApiResponse.success(null, 'Successfully unenrolled student');
  } catch (error: any) {
    return handleApiError(error);
  }
}

