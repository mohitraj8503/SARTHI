export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, ApiResponse, handleApiError } from '@/lib/admin/core';
import { hash } from 'bcryptjs';
import { generateEnrollmentNumber } from '@/lib/enrollment';
import { auditAdminAction } from '@/lib/admin/audit-logs';

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();
    const { users, dryRun } = body;

    if (!users || !Array.isArray(users)) {
      return ApiResponse.error('Invalid user data', 'BAD_REQUEST', 400);
    }

    const results = {
      total: users.length,
      created: 0,
      failed: 0,
      errors: [] as any[],
    };

    if (dryRun) {
      for (const u of users) {
        const existing = await prisma.user.findUnique({ where: { email: u.email } });
        if (existing) results.errors.push({ email: u.email, error: 'Email already exists' });
      }
      return ApiResponse.success({ ...results, willCreate: users.length - results.errors.length });
    }

    const defaultHash = await hash('Welcome123!', 10);
    const createdUsers: string[] = [];

    // Process in a transaction if possible, or sequentially with results tracking
    for (const u of users) {
      try {
        const existing = await prisma.user.findUnique({ where: { email: u.email } });
        if (existing) {
          results.failed++;
          results.errors.push({ email: u.email, error: 'User already exists' });
          continue;
        }

        const role = (u.role ?? 'STUDENT').toUpperCase();
        let enrollmentNumber: string | undefined = undefined;
        if (role === 'STUDENT') {
           enrollmentNumber = await generateEnrollmentNumber();
        }

        const user = await prisma.user.create({
          data: {
             email: u.email,
             name: u.name || u.email.split('@')[0],
             password: u.password ? await hash(u.password, 10) : defaultHash,
             role: role,
             username: u.email.split('@')[0] + Math.floor(Math.random() * 1000),
             emailVerified: new Date(),
             enrollmentNumber: enrollmentNumber,
          },
        });
        createdUsers.push(user.id);
        results.created++;
      } catch (error: any) {
        results.failed++;
        results.errors.push({ email: u.email, error: error.message });
      }
    }

    if (results.created > 0) {
      await auditAdminAction(
        admin,
        'bulk_user_import',
        'USER',
        'MULTIPLE',
        `Imported ${results.created} users`,
        { count: results.created, userIds: createdUsers }
      );
    }

    return ApiResponse.success(results);
  } catch (error: any) {
    return handleApiError(error);
  }
}

