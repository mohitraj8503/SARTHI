export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/auth/jwt';
import { validateSession } from '@/lib/auth/session';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { 
      title, 
      description, 
      scheduledAt, 
      duration,
      price,
      maxAttendees,
      category,
      level,
      thumbnailUrl
    } = data;

    if (!title || !scheduledAt) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get('tt_session')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    const session = await validateSession(payload.sessionId);
    if (!session) {
      return NextResponse.json({ message: 'Session expired' }, { status: 401 });
    }

    const instructorId = payload.userId;
    const user = await prisma.user.findUnique({ where: { id: instructorId } });
    
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString(36);

    const seminar = await prisma.seminar.create({
      data: {
        title,
        slug,
        description: description || '',
        speakerName: user.name || user.email?.split('@')[0] || 'Instructor',
        speakerBio: user.bio || '',
        speakerImage: user.image || null,
        scheduledAt: new Date(scheduledAt),
        date: new Date(scheduledAt),
        startTime: new Date(scheduledAt),
        durationMinutes: duration ? Number(duration) : 60,
        duration: duration ? Number(duration) : 60,
        price: price ? Number(price) : 0,
        maxAttendees: maxAttendees ? Number(maxAttendees) : 500,
        category: category || 'General',
        level: level || 'All Levels',
        thumbnailUrl: thumbnailUrl || null,
        thumbnail: thumbnailUrl || null,
        streamingPlatform: 'LIVEKIT', // Switched to LiveKit as requested
        status: 'SCHEDULED',
        isPublic: true,
        isLive: false,
        instructorId,
      },
    });

    return NextResponse.json(seminar);
  } catch (error) {
    console.error('Create seminar error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

