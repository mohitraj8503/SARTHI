import { NextResponse } from 'next/server';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requests = await prisma.blogAccessRequest.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
            avatar_url: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error('Error fetching blog access requests:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, status } = await req.json();

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Update both the request and the user's status
    const updatedRequest = await prisma.$transaction(async (tx) => {
      const request = await tx.blogAccessRequest.update({
        where: { id },
        data: { 
          status,
          reviewedAt: new Date(),
          adminId: user.id
        },
      });

      await tx.user.update({
        where: { id: request.userId },
        data: { blogAccessStatus: status },
      });

      return request;
    });

    // Trigger background notifications
    try {
      const { onBlogAccessUpdated } = await import('@/lib/notifications/blogs');
      await onBlogAccessUpdated(id);
    } catch (error) {
      console.error('Failed to send blog access update notification:', error);
    }

    return NextResponse.json({ 
      message: `Request ${status} successfully`,
      request: updatedRequest 
    });
  } catch (error) {
    console.error('Error updating blog access request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
