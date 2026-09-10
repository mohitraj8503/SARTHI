import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { requireAdmin, ApiResponse, handleApiError } from '@/lib/admin/core';
import { logAdminActivity, ActivityType } from '@/lib/admin-logging';
import { PaginationSchema } from '@/lib/admin/validators/schemas';
import { isIilmUniversity } from '@/lib/utils/iilm';

export const dynamic = 'force-dynamic';

/**
 * Enterprise Student Management API - V6 High-Performance Layer
 * Resolves Points 1, 2, 5, and 10 of the Audit Report.
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  try {
    // 1. Hardened Hierarchical Auth (requires admin clearance)
    const admin = await requireAdmin('admin');
    
    // 2. Strict SearchParam Sanitization via Zod
    const { searchParams } = new URL(request.url);
    const segment = searchParams.get('segment'); // 'all' | 'main' | 'junior'
    const query = PaginationSchema.parse(Object.fromEntries(searchParams));
    const { page, pageSize, search, sortBy, sortOrder, filter } = query;

    const skip = (page - 1) * pageSize;
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // 3. Dynamic Prisma Selection with "Lean Fields" (Point 1 Avoidance)
    const where: any = { 
        role: 'STUDENT',
        status: { not: 'DELETED' }
    };

    if (segment && segment.toLowerCase() !== 'all') {
      if (segment.toLowerCase() === 'pending') {
        where.status = 'PENDING';
      } else {
        where.platformSegment = segment.toUpperCase();
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
        { enrollmentNumber: { contains: search } }
      ];
    }

    if (filter) {
      switch (filter.toLowerCase()) {
        case 'active': where.status = 'ACTIVE'; break;
        case 'inactive': where.status = { in: ['INACTIVE', 'SUSPENDED', 'BANNED', 'DELETED'] }; break;
        case 'new_this_month': where.createdAt = { gte: monthStart }; break;
        case 'recently_active': where.OR = [{ lastLogin: { gte: weekAgo } }, { lastActive: { gte: weekAgo } }]; break;
        case 'pending': where.status = 'PENDING'; break;
        default:
          if (filter.startsWith('course_')) {
            where.enrollments = { some: { courseId: filter.replace('course_', '') } };
          }
      }
    }

    const ALLOWED_SORT_FIELDS = ['createdAt', 'studentId', 'name', 'email', 'status', 'lastLogin', 'enrollmentNumber'];
    const validSortBy = ALLOWED_SORT_FIELDS.includes(sortBy || '') ? sortBy! : 'studentId';

    // 4. Parallel Query Execution with Resilient Fallback
    let total = 0;
    let students: any[] = [];

    try {
      [total, students] = await Promise.all([
        prisma.user.count({ where }),
        prisma.user.findMany({
          where,
          // SELECT only necessary fields to reduce memory payload (Point 5)
          select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              college: true,
              status: true,
              image: true,
              avatar_url: true,
              enrollmentNumber: true,
              studentId: true,
              platformSegment: true,
              educationLevel: true,
              lastLogin: true,
              createdAt: true,
              internshipApplications: {
                  take: 1,
                  select: { college: true }
              },
              _count: { select: { enrollments: true } },
              enrollments: { 
                  take: 3, 
                  select: { 
                      course: { select: { id: true, title: true, slug: true } },
                      status: true 
                  } 
              }
          },
          orderBy: { [validSortBy]: sortOrder || 'asc' },
          skip,
          take: pageSize
        })
      ]);
    } catch (queryErr: any) {
      console.warn('[ADMIN_STUDENTS] Nested relation query failed, falling back to lean query:', queryErr?.message);
      // Fail-safe lean query to guarantee student roster is never blank due to relation corruption
      [total, students] = await Promise.all([
        prisma.user.count({ where }),
        prisma.user.findMany({
          where,
          select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              college: true,
              status: true,
              image: true,
              avatar_url: true,
              enrollmentNumber: true,
              studentId: true,
              platformSegment: true,
              educationLevel: true,
              lastLogin: true,
              createdAt: true,
              _count: { select: { enrollments: true } }
          },
          orderBy: { [validSortBy]: sortOrder || 'asc' },
          skip,
          take: pageSize
        })
      ]);
    }

    // 5. Pre-serialization Cleanup (Point 10 Security)
    const transformed = students.map(s => {
      const isIilm = isIilmUniversity(s.college) || (s.internshipApplications && s.internshipApplications.some((a: any) => isIilmUniversity(a.college)));
      return {
        ...s,
        phone: isIilm ? null : s.phone,
        image: s.image || s.avatar_url,
        coursesCount: s._count?.enrollments || 0,
        _count: undefined,
        internshipApplications: undefined
      };
    });

    const executionTime = Date.now() - startTime;

    return ApiResponse.success(transformed, undefined, {
      page, pageSize, total,
      totalPages: Math.ceil(total / pageSize),
      executionTimeMs: executionTime
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Unified Student Actions - Integrated with System-Wide Activity Log
 * Resolves Points 11 & 13.
 */
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin('management');
    const body = await request.json();
    const { action, studentId, data } = body;

    if (!action) return ApiResponse.error('Action protocol required', 'ACTION_MISSING', 400);

    let student: any;
    let logType: string = ActivityType.STUDENT_RESTORED;

    switch (action) {
      case 'add': {
        const { name, email, password, phone, status } = data;
        const exists = await prisma.user.findUnique({ where: { email } });
        if (exists) return ApiResponse.error('Email identity already exists in nexus', 'CONFLICT', 409);
        
        const hashedPassword = await bcrypt.hash(password || Math.random().toString(36), 12);
        const { generateStudentId } = await import('@/lib/student-id');
        student = await prisma.$transaction(async (tx) => {
          const sId = await generateStudentId(tx);
          return await tx.user.create({
            data: {
              name, email, phone, status: status || 'ACTIVE',
              password: hashedPassword, role: 'STUDENT',
              studentId: sId,
              enrollmentNumber: sId
            }
          });
        });
        logType = ActivityType.STUDENT_CREATED;
        break;
      }

      case 'edit': {
        const { name, email, phone, status } = data;
        student = await prisma.user.update({
          where: { id: studentId },
          data: { name, email, phone, status }
        });
        logType = ActivityType.STUDENT_UPDATED;
        break;
      }

      case 'delete': {
        student = await prisma.user.update({
          where: { id: studentId },
          data: { status: 'DELETED' }
        });
        logType = ActivityType.STUDENT_DEACTIVATED;
        break;
      }

      case 'suspend': {
        const isRestoring = data.action === 'restore';
        student = await prisma.user.update({
          where: { id: studentId },
          data: { status: isRestoring ? 'ACTIVE' : 'SUSPENDED' }
        });
        logType = isRestoring ? ActivityType.STUDENT_RESTORED : ActivityType.STUDENT_SUSPENDED;
        break;
      }

      case 'reset-password': {
        const tempPassword = Math.random().toString(36).slice(-10);
        const hashedPassword = await bcrypt.hash(tempPassword, 12);
        student = await prisma.user.update({
          where: { id: studentId },
          data: { password: hashedPassword }
        });
        logType = ActivityType.STUDENT_UPDATED;
        return ApiResponse.success({ tempPassword }, "Password reset successfully");
      }

      default:
        return ApiResponse.error(`Invalid kernel protocol: ${action}`, 'INVALID_ACTION', 400);
    }

    // 6. Integrated Audit Signature (Point 11 Compliance)
    await logAdminActivity({
        userId: admin.id,
        actorName: admin.name || "Admin",
        type: logType,
        targetId: studentId || student.id,
        targetName: student.name || student.email,
        description: `Action: ${action} executed by ${admin.name}`,
        metadata: { action }
    });

    return ApiResponse.success(student, `Operation ${action} finalized successfully`);
  } catch (error) {
    return handleApiError(error);
  }
}

