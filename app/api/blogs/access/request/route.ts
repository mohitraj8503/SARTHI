import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, invalidateUserCache } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Please sign in to request access' }, { status: 401 });
    }

    const { email, name } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    if (email !== user.email) {
      return NextResponse.json({ error: 'This email does not match your signed-in account' }, { status: 403 });
    }

    // Check if user is already approved
    if (user.blogAccessStatus === 'approved') {
      return NextResponse.json({ success: true, message: 'Already approved' });
    }

    // Create or update request with INSTANT APPROVAL
    const [blogRequest] = await prisma.$transaction([
      prisma.blogAccessRequest.upsert({
        where: {
          userId_email: {
            userId: user.id,
            email: email,
          }
        },
        update: {
          status: 'approved',
          updatedAt: new Date(),
        },
        create: {
          userId: user.id,
          email: email,
          name: name || user.name || 'Anonymous',
          status: 'approved',
        },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: {
          blogAccessStatus: 'approved',
        },
      }),
    ]);

    // Invalidate auth cache so the next /api/auth/me call returns the new status
    const cookieStore = await cookies();
    const token = cookieStore.get('tt_session')?.value || cookieStore.get('user_session')?.value;
    if (token) {
      invalidateUserCache(token);
    }

    // Trigger background notifications
    try {
      const { onBlogAccessUpdated } = await import('@/lib/notifications/blogs');
      await onBlogAccessUpdated(blogRequest.id);
    } catch (error) {
      console.error('Failed to send blog access notification:', error);
    }

    return NextResponse.json({ success: true, message: 'Request sent successfully' });
  } catch (error: any) {
    console.error('[BLOG_ACCESS_REQUEST_API] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
