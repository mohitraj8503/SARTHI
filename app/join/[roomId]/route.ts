import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, props: { params: Promise<{ roomId: string }> }) {
  const params = await props.params;
  const session = await getSession();

  if (!session?.userId) {
    return NextResponse.redirect(new URL(`/login?returnUrl=/join/${params.roomId}`, request.url));
  }

  try {
    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.userId }
    });

    const isTeacher = !!teacher || session.role === 'TEACHER' || session.role === 'ADMIN';

    // Look up in LiveClass first
    const liveClass = await prisma.liveClass.findFirst({
      where: { OR: [{ id: params.roomId }, { roomName: params.roomId }] },
      include: { course: true }
    });

    if (liveClass) {
      if (isTeacher) {
        return NextResponse.redirect(new URL(`/teacher/live-class/${liveClass.id}`, request.url));
      } else {
        const slug = liveClass.course?.slug || liveClass.courseId;
        return NextResponse.redirect(new URL(`/courses/${slug}/live/${liveClass.id}`, request.url));
      }
    }

    if (isTeacher) {
      return NextResponse.redirect(new URL(`/teacher/live-class/${params.roomId}`, request.url));
    } else {
      return NextResponse.redirect(new URL(`/live/${params.roomId}`, request.url));
    }
  } catch (error) {
    console.error('Error handling join redirect:', error);
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
}
