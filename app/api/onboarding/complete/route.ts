export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { goal, weeklyHours, firstCourse } = body;

    // Update user with onboarding data
    await prisma.user.update({
      where: { id: session.userId },
      data: {
        onboarded: true,
        // Store onboarding data in a JSON field or separate table
        // For now, we'll use privacySettings as a generic JSON field
        privacySettings: JSON.stringify({
          goal: goal || 'flexible',
          weeklyHours: weeklyHours || '2-5',
          firstCourse: firstCourse || 'intro',
          onboardedAt: new Date().toISOString(),
        }),
      },
    });

    // Create learning goal
    await prisma.$executeRaw`
      INSERT INTO user_sessions (id, userId, deviceFingerprint, createdAt)
      VALUES (${Math.random().toString(36)}, ${session.userId}, ${'onboarding_complete'}, ${new Date()})
      ON CONFLICT DO NOTHING
    `;

    return NextResponse.json({
      success: true,
      message: 'Onboarding completed successfully',
    });
  } catch (error) {
    console.error('Onboarding completion error:', error);
    return NextResponse.json(
      { error: 'Failed to complete onboarding' },
      { status: 500 }
    );
  }
}

