import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, adminErrorResponse } from '@/lib/admin/requireAdmin';
import { logAdminActivity, ActivityType } from "@/lib/admin-logging";
import { z } from 'zod';
import { ROLES } from '@/config/roles';

export const dynamic = 'force-dynamic';

const updateStaffSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum([ROLES.ADMIN, 'SUPER_ADMIN', ROLES.GOD_ADMIN, ROLES.TEACHER, ROLES.INSTRUCTOR, ROLES.STUDENT]).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
});

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const staffMembers = await prisma.user.findMany({
      where: {
        role: {
          in: [ROLES.ADMIN, 'SUPER_ADMIN', ROLES.GOD_ADMIN, ROLES.TEACHER, ROLES.INSTRUCTOR]
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        image: true,
        createdAt: true,
        lastActive: true,
        _count: {
          select: {
            courses: true,
            workshops: true,
            seminars: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: staffMembers
    });
  } catch (error: any) {
    return adminErrorResponse(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();
    const parsed = updateStaffSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ 
        success: false, 
        error: 'INVALID_INPUT',
        message: 'Request contains malformed parameters.',
        details: parsed.error.format()
      }, { status: 400 });
    }

    const { userId, role, status } = parsed.data;

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, role: true }
    });

    if (!existingUser) {
      return NextResponse.json({ 
        success: false, 
        error: 'USER_NOT_FOUND',
        message: 'The requested user could not be located.' 
      }, { status: 404 });
    }

    const updateData: any = {};
    if (role) updateData.role = role;
    if (status) updateData.status = status;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData
    });

    await logAdminActivity({
      userId: admin.id,
      actorName: admin.name || "Admin",
      type: ActivityType.STAFF_ROLE_CHANGE,
      targetId: userId,
      targetName: existingUser.name || existingUser.email,
      description: `Refined staff member ${existingUser.name || existingUser.email} status.`,
      metadata: {
        previousRole: existingUser.role,
        newRole: role,
        newStatus: status
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedUser
    });
  } catch (error: any) {
    return adminErrorResponse(error);
  }
}

