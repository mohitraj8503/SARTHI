export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const user = await getCurrentUser();
    if (!isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const studentId = params.id;

    // Get student
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: { email: true, name: true, verificationToken: true }
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Generate new verification token
    const crypto = await import('crypto');
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update user with new verification token
    await prisma.user.update({
      where: { id: studentId },
      data: {
        verificationToken,
        verificationExpires
      }
    });

    // Log the action
    console.log(`[ADMIN AUDIT] Admin ${user?.email} resend verification for student ${studentId} (${student.email})`);

    // Send verification email
    await sendVerificationEmail(student.email, verificationToken);

    return NextResponse.json({
      success: true,
      message: 'Verification email has been sent',
      email: student.email
    });

  } catch (error) {
    console.error('[Admin Resend Verification API] Error:', error);
    return NextResponse.json({ error: 'Failed to resend verification' }, { status: 500 });
  }
}
