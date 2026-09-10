import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const teacher = await prisma.teacher.findUnique({
      where: { userId: user.id }
    });

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 });
    }

    const body = await request.json();
    const { status, title, description, startTime, durationMinutes, courseId, privacy, meetingPlatform } = body;

    const session = await prisma.liveSession.findUnique({
      where: { id: params.id }
    });

    if (!session || session.teacherId !== teacher.id) {
      return NextResponse.json({ error: 'Session not found or unauthorized' }, { status: 404 });
    }

    const now = new Date();
    const updateData: Record<string, any> = {};

    // 1. Status Update Logic
    if (status) {
      const allowedStatuses = new Set(['scheduled', 'live', 'completed', 'cancelled']);
      if (!allowedStatuses.has(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }
      updateData.status = status;
      if (status === 'live') {
        updateData.actualStart = session.actualStart || now;
        if (session.startTime > now) updateData.startTime = now;
        if (session.endTime <= now) updateData.endTime = new Date(now.getTime() + 60 * 60 * 1000);
      }
      if (status === 'completed') updateData.actualEnd = now;
      if (status === 'cancelled') updateData.cancelledAt = now;
    }

    // 2. Metadata Update Logic (Only if scheduled)
    if (session.status === 'scheduled') {
      if (title) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (privacy) updateData.privacy = privacy;
      if (meetingPlatform) updateData.meetingPlatform = meetingPlatform;
      if (courseId) {
        // Simple verification - should ideally check if teacher owns this courseId too
        updateData.courseId = courseId;
      }

      if (startTime || durationMinutes) {
        const newStart = startTime ? new Date(startTime) : session.startTime;
        const newDuration = durationMinutes || session.durationMinutes || 60;
        const newEnd = new Date(newStart.getTime() + newDuration * 60000);

        // Check for conflicts excluding current session
        const conflict = await prisma.liveSession.findFirst({
          where: {
            id: { not: params.id },
            teacherId: teacher.id,
            status: 'scheduled',
            OR: [
              { AND: [{ startTime: { lte: newStart } }, { endTime: { gt: newStart } }] },
              { AND: [{ startTime: { lt: newEnd } }, { endTime: { gte: newEnd } }] }
            ]
          }
        });

        if (conflict) {
          return NextResponse.json({ error: 'Scheduling Conflict', message: `Overlaps with "${conflict.title}"` }, { status: 409 });
        }

        updateData.startTime = newStart;
        updateData.endTime = newEnd;
        updateData.durationMinutes = newDuration;
      }
    }

    const updated = await prisma.liveSession.update({
      where: { id: params.id },
      data: updateData
    });

    return NextResponse.json({ success: true, session: updated });
  } catch (error: any) {
    console.error('Error updating session:', error);
    return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
  }
}
