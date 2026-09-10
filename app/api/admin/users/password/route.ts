import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { requireAdmin, ApiResponse, handleApiError } from '@/lib/admin/core';
import { auditAdminAction } from '@/lib/admin/audit-logs';

export const dynamic = 'force-dynamic';

/**
 * GET: Search users for password management
 */
export async function GET(request: NextRequest) {
    try {
        await requireAdmin();
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');

        if (!query) {
            return ApiResponse.success([]);
        }

        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { email: { contains: query } },
                    { name: { contains: query } },
                    { enrollmentNumber: { contains: query } },
                ],
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                image: true,
                createdAt: true,
            },
            take: 20,
        });

        return ApiResponse.success(users);
    } catch (error: any) {
        return handleApiError(error);
    }
}

/**
 * POST: Force update a user's password (Admin Action)
 */
export async function POST(request: NextRequest) {
    try {
        const admin = await requireAdmin();
        const body = await request.json();
        const { userId, newPassword, reason } = body;

        if (!userId || !newPassword) {
            return ApiResponse.error('User ID and new password are required', 'BAD_REQUEST', 400);
        }

        if (newPassword.length < 6) {
            return ApiResponse.error('Password must be at least 6 characters', 'BAD_REQUEST', 400);
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { email: true, name: true }
        });

        if (!user) {
            return ApiResponse.error('User not found', 'NOT_FOUND', 404);
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });

        await auditAdminAction(
            admin,
            'force_password_reset',
            'USER',
            userId,
            user.name || user.email,
            { reason }
        );

        return ApiResponse.success(null, 'Password updated successfully');
    } catch (error: any) {
        return handleApiError(error);
    }
}

