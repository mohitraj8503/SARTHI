export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await prisma.seminar.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Admin Seminar Delete]', error);
    return NextResponse.json({ error: 'Failed to delete seminar' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const user = await getCurrentUser();
  if (!user || (user.role !== 'ADMIN' && user.role !== 'INSTRUCTOR')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    // Whitelist allowed fields to prevent unauthorized field updates
    const allowedFields = [
      'title', 'description', 'scheduledAt', 'duration', 'meetLink',
      'maxAttendees', 'tags', 'thumbnail', 'isPublic', 'category',
      'speakerName', 'speakerBio', 'speakerImage'
    ];
    const sanitizedData: Record<string, any> = {};
    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        sanitizedData[key] = body[key];
      }
    }

    if (Object.keys(sanitizedData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const seminar = await prisma.seminar.update({
      where: { id: params.id },
      data: sanitizedData,
    });

    return NextResponse.json(seminar);
  } catch (error) {
    console.error('[Admin Seminar Update]', error);
    return NextResponse.json({ error: 'Failed to update seminar' }, { status: 500 });
  }
}
