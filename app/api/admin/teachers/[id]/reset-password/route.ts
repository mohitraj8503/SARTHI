import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, ApiResponse, handleApiError } from '@/lib/admin/core';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await requireAdmin();
    const teacherId = params.id;

    const user = await prisma.user.findUnique({
      where: { id: teacherId },
      include: { teacher: true }
    });

    if (!user) {
      return ApiResponse.error('Teacher not found', 'NOT_FOUND', 404);
    }

    // Generate new temporary credentials
    const tempPassword = `TT-RESET-${crypto.randomBytes(2).toString('hex').toUpperCase()}-2026`;
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    const setupToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: teacherId },
      data: {
        password: hashedPassword,
        tempPassword: tempPassword,
        passwordSetupToken: setupToken,
        passwordSetupExpires: expires,
        requiresPasswordChange: true,
        onboardingStatus: 'PENDING'
      }
    });

    const facultyId = user.teacher?.teacherId || user.enrollmentNumber || 'FAC-RESET';

    // Send branded reset credentials email
    import('@/lib/email/send').then(async ({ sendTransactionalEmail }) => {
      const { templates } = await import('@/lib/email');
      try {
        await sendTransactionalEmail({
          to: user.email,
          type: 'application',
          subject: '🛡️ SECURE: Your SARTHI Institutional Access & Keys',
          html: templates.teacherAccountReady(
            user.name || 'Instructor',
            user.email,
            tempPassword,
            facultyId,
            setupToken
          ).html
        });
      } catch (e) {
        console.error("Reset password email failed:", e);
      }
    });

    return ApiResponse.success({
      tempPassword,
      message: 'Temporary password regenerated successfully.'
    });
  } catch (error) {
    return handleApiError(error);
  }
}
