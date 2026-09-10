export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createPrivateBroadcast } from '@/lib/youtube';
import { verifyJWT } from '@/lib/auth/jwt';
import { validateSession } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
    try {
        // 1. Verify User Session
        const cookieStore = request.cookies;
        const token = cookieStore.get('tt_session')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const payload = await verifyJWT(token);
        if (!payload) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const session = await validateSession(payload.sessionId);
        if (!session) {
            return NextResponse.json({ error: 'Session expired' }, { status: 401 });
        }

        const userId = payload.userId;

        // 2. Verify User Role (Teacher or Admin)
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, role: true, name: true }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const normalizedRole = user.role.toUpperCase();
        if (normalizedRole !== 'ADMIN' && normalizedRole !== 'TEACHER' && normalizedRole !== 'INSTRUCTOR') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // 3. Parse Body
        const body = await request.json();
        const { title, description, scheduledStartTime } = body;

        if (!title || !scheduledStartTime) {
            return NextResponse.json({ error: 'Title and scheduledStartTime are required' }, { status: 400 });
        }

        // 4. Create Private Broadcast (Using Admin's Credentials)
        const broadcastData = await createPrivateBroadcast(title, description, scheduledStartTime);

        // 5. Save to Database (Seminar)
        const seminar = await prisma.seminar.create({
            data: {
                title,
                slug: title.toLowerCase().replace(/ /g, '-') + '-' + Date.now(),
                description,
                scheduledAt: new Date(scheduledStartTime),
                date: new Date(scheduledStartTime),
                duration: 60,
                price: 0,
                maxAttendees: 100,
                category: "Tech",
                level: "Beginner",
                instructorId: user.id,
                status: 'SCHEDULED',
                youtubeBroadcastId: broadcastData.broadcastId,
                speakerName: user.name || "Instructor",
                speakerBio: "",
            }
        });

        return NextResponse.json({
            success: true,
            seminar,
            streamKey: broadcastData.streamKey,
            ingestionAddress: broadcastData.ingestionAddress,
            youtubeUrl: broadcastData.youtubeUrl,
        });

    } catch (error: any) {
        console.error('Create Broadcast Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to create broadcast' }, { status: 500 });
    }
}

