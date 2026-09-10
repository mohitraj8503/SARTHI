export const dynamic = "force-dynamic";
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { requireAdmin, ApiResponse, handleApiError } from '@/lib/admin/core';
import { auditAdminAction } from '@/lib/admin/audit-logs';

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();
    const { requestId, approve, newPassword } = body;

    if (!requestId) return ApiResponse.error('Request ID required', 'BAD_REQUEST', 400);

    const resetRequest = await prisma.passwordResetRequest.findUnique({
      where: { id: requestId }
    });

    if (!resetRequest) return ApiResponse.error('Request not found', 'NOT_FOUND', 404);
    if (resetRequest.status !== 'PENDING') return ApiResponse.error('Request already processed', 'CONFLICT', 409);

    if (!approve) {
      const updated = await prisma.passwordResetRequest.update({
        where: { id: requestId },
        data: {
          status: 'REJECTED',
          approvedBy: admin.email,
          approvedAt: new Date()
        }
      });
      await auditAdminAction(admin, 'password_reset_reject', 'USER', resetRequest.userId, resetRequest.userEmail);
      return ApiResponse.success(updated, 'Password reset request rejected');
    }

    if (!newPassword) return ApiResponse.error('New password required for approval', 'BAD_REQUEST', 400);
    if (newPassword.length < 6) return ApiResponse.error('Password too short', 'BAD_REQUEST', 400);

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Transactional update
    const result = await prisma.$transaction([
      prisma.user.update({
        where: { id: resetRequest.userId },
        data: { password: hashedPassword }
      }),
      prisma.passwordResetRequest.update({
        where: { id: requestId },
        data: {
          status: 'APPROVED',
          approvedBy: admin.email,
          approvedAt: new Date(),
          newPassword: '***' // Don't store plain text even if it's transient
        }
      })
    ]);

    await auditAdminAction(admin, 'password_reset_approve', 'USER', resetRequest.userId, resetRequest.userEmail);

    return ApiResponse.success(result[1], 'Password reset request approved and password updated');
  } catch (error) {
    return handleApiError(error);
  }
}

