import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentUser();

    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { requestId, action } = await request.json(); // action: 'approve' | 'reject'

    if (!requestId || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request parameters' }, { status: 400 });
    }

    const blogRequest = await prisma.blogAccessRequest.findUnique({
      where: { id: requestId },
    });

    if (!blogRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    const status = action === 'approve' ? 'approved' : 'rejected';

    await prisma.$transaction([
      prisma.blogAccessRequest.update({
        where: { id: requestId },
        data: {
          status,
          adminId: admin.id,
          reviewedAt: new Date(),
        },
      }),
      prisma.user.update({
        where: { id: blogRequest.userId },
        data: {
          blogAccessStatus: status,
        },
      }),
    ]);

    // Trigger background notifications
    try {
      const { onBlogAccessUpdated } = await import('@/lib/notifications/blogs');
      await onBlogAccessUpdated(requestId);
    } catch (error) {
      console.error('Failed to send blog access update notification:', error);
    }

    return NextResponse.json({ 
      success: true, 
      message: `Request ${action}d successfully` 
    });
  } catch (error: any) {
    console.error('[ADMIN_BLOG_ACTION_POST] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
