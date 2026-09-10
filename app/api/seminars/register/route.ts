export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendSeminarConfirmationEmail } from '@/lib/email';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { seminarId } = await req.json();
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Please sign in to register' },
        { status: 401 }
      );
    }

    const userId = user.id;

    // Check if seminar exists by ID or Slug
    let seminar = await prisma.seminar.findFirst({
      where: {
        OR: [{ id: seminarId }, { slug: seminarId }]
      },
    });

    if (!seminar) {
      return NextResponse.json(
        { error: 'Seminar not found' },
        { status: 404 }
      );
    }

    // Check if already registered
    const existing = await prisma.seminarRegistration.findUnique({
      where: {
        seminarId_userId: { userId, seminarId: seminar.id },
      },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        alreadyRegistered: true,
        message: 'You are already registered for this masterclass!',
        registrationId: existing.id
      });
    }

    // Create free 1-click registration for signed-in user
    const registration = await prisma.seminarRegistration.create({
      data: { 
        userId, 
        seminarId: seminar.id,
        userName: user.name || 'Attendee',
        userEmail: user.email,
        paymentStatus: 'FREE',
        status: 'REGISTERED',
        amountPaid: 0,
      },
      include: { seminar: true, user: true },
    });

    // Send confirmation email (non-blocking)
    sendSeminarConfirmationEmail({
      email: registration.user.email,
      userName: registration.user.name || 'Attendee',
      seminarTitle: registration.seminar.title,
      startTime: registration.seminar.startTime || registration.seminar.date,
      joinLink: registration.seminar.broadcastUrl || registration.seminar.youtubeStreamUrl || `https://sarthi-woad.vercel.app/seminars/${registration.seminar.slug || registration.seminar.id}/live`,
    }).catch(err => console.error('[Email] Seminar 1-click email failed:', err));

    // Notify Admins
    import('@/lib/admin/notifications').then(({ createAdminNotification }) => {
      createAdminNotification({
        title: 'Seminar 1-Click Registration 🎫',
        body: `${registration.user.name || 'Attendee'} registered for ${registration.seminar.title}`,
        type: 'seminar',
        source: 'system',
        severity: 'info',
        href: `/admin/seminars/${seminar.id}`,
        meta: { seminarId: seminar.id, userId, amount: 0 }
      });
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: 'Successfully registered for masterclass!',
      registrationId: registration.id
    });

  } catch (error: any) {
    console.error('Seminar 1-click registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to register' },
      { status: 500 }
    );
  }
}
