import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { seminarId, type } = body;

    if (!seminarId) {
      return NextResponse.json({ error: 'Missing seminarId' }, { status: 400 });
    }

    const seminar = await prisma.seminar.findUnique({
      where: { id: seminarId },
      include: {
        registrations: {
          where: { paymentStatus: 'completed' },
          select: { userEmail: true, userName: true },
        },
      },
    });

    if (!seminar) {
      return NextResponse.json({ error: 'Seminar not found' }, { status: 404 });
    }

    const emails = seminar.registrations.map(r => r.userEmail);
    const names = seminar.registrations.map(r => r.userName);

    if (emails.length === 0) {
      return NextResponse.json({ message: 'No registered users to notify' });
    }

    let subject = '';
    let message = '';

    switch (type) {
      case 'REGISTRATION_CONFIRMED':
        subject = `You're registered for ${seminar.title}!`;
        message = `Thanks for registering! Your spot is confirmed. Join us at: ${process.env.NEXT_PUBLIC_APP_URL}/seminars/${seminar.slug}/live`;
        break;
      case 'LIVE_NOW':
        subject = `🔴 ${seminar.title} is LIVE now!`;
        message = `The seminar is starting now! Join immediately: ${process.env.NEXT_PUBLIC_APP_URL}/seminars/${seminar.slug}/live`;
        break;
      case 'REMINDER':
        subject = `Reminder: ${seminar.title} starts soon!`;
        const time = new Date(seminar.scheduledAt || seminar.date).toLocaleString();
        message = `This is a reminder that the seminar starts at ${time}. Join here: ${process.env.NEXT_PUBLIC_APP_URL}/seminars/${seminar.slug}/live`;
        break;
      case 'RECORDING_READY':
        subject = `📺 Recording available: ${seminar.title}`;
        message = `The recording is now available: ${process.env.NEXT_PUBLIC_APP_URL}/seminars/${seminar.slug}`;
        break;
      default:
        return NextResponse.json({ error: 'Invalid notification type' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      type,
      recipients: emails.length,
      subject,
      message: 'Notification queued (mock - integrate with email service for real sending)',
    });
  } catch (error) {
    console.error('Notification error:', error);
    return NextResponse.json({ error: 'Failed to send notifications' }, { status: 500 });
  }
}

