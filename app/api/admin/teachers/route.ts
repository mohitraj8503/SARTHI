import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, ApiResponse, handleApiError } from '@/lib/admin/core';
import { PaginationSchema } from '@/lib/admin/validators/schemas';
import { auditAdminAction } from '@/lib/admin/audit-logs';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { z } from 'zod';
import { generateTeacherId } from '@/lib/id-generator';

export const dynamic = 'force-dynamic';

const TeacherActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("invite"),
    name: z.string().min(2),
    email: z.string().email(),
  }),
  z.object({
    action: z.literal("add"),
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    bio: z.string().optional(),
    company: z.string().optional(),
  }),
  z.object({
    action: z.literal("edit"),
    teacherId: z.string(),
    name: z.string().optional(),
    bio: z.string().optional(),
    company: z.string().optional(),
  }),
  z.object({
    action: z.literal("delete"),
    teacherId: z.string(),
  }),
  z.object({
    action: z.literal("verify"),
    teacherId: z.string(),
    status: z.enum(["verified", "pending", "inactive"]),
    isApplication: z.boolean().optional(),
    applicationId: z.string().optional(),
  }),
  z.object({
    action: z.literal("reset-password"),
    teacherId: z.string(),
  }),
  z.object({
    action: z.literal("bulk-action"),
    ids: z.array(z.string()),
    bulkAction: z.enum(["delete", "suspend", "activate"]),
  })
]);

/**
 * GET: List Teachers with advanced filtering
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const query = PaginationSchema.parse(Object.fromEntries(searchParams));
    const { page, pageSize, search, sortBy, sortOrder, status } = query;

    const where: any = {
      role: { in: ['TEACHER', 'INSTRUCTOR'] }
    };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } }
      ];
    }

    if (status && status !== 'All') {
      where.teacher = {
        status: status.toLowerCase()
      };
    }

    // Fetch regular teachers and applications in parallel
    const [totalUsers, users, apps] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        include: {
          teacher: true,
          _count: { select: { courses: true } }
        },
        orderBy: sortBy ? { [sortBy]: sortOrder } : { name: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      prisma.teacherApplication.findMany({
        where: { 
          status: { in: ['PENDING', 'DRAFT'] }
        },
        include: { user: true }
      })
    ]);

    const transformedUsers = users.map(t => ({
      id: t.id,
      name: t.name,
      email: t.email,
      image: t.image,
      role: t.role,
      status: t.teacher?.status || 'inactive',
      teacherId: t.teacher?.teacherId || t.enrollmentNumber || 'NO-ID',
      createdAt: t.createdAt,
      verified: t.teacher?.status === 'verified',
      _count: {
        courses: t._count.courses,
        students: t.teacher?.totalStudents || 0
      },
      revenue: t.teacher?.totalEarnings || 0,
      isApplication: false
    }));

    // Map applications to the same format
    const transformedApps = apps.map(app => ({
      id: app.userId || `app_${app.id}`,
      name: app.fullName,
      email: app.email,
      image: app.profilePhotoUrl || app.user?.image,
      role: 'APPLICANT',
      status: app.status.toLowerCase(),
      teacherId: app.status === 'PENDING' ? 'PENDING' : 'DRAFT',
      createdAt: app.submittedAt || app.createdAt,
      verified: false,
      _count: { courses: 0, students: 0 },
      revenue: 0,
      isApplication: true,
      applicationId: app.id
    }));

    // Combine lists
    let combined = [...transformedUsers];
    if (!status || status === 'All' || status.toLowerCase() === 'pending' || status.toLowerCase() === 'draft') {
      const userIds = new Set(combined.map(u => u.id));
      const filteredApps = transformedApps.filter(app => {
        if (userIds.has(app.id)) return false;
        if (status && status !== 'All' && app.status !== status.toLowerCase()) return false;
        return true;
      });
      combined = [...combined, ...filteredApps];
    }

    const total = combined.length;

    return ApiResponse.success({ teachers: combined }, undefined, {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST: Unified Teacher Actions
 */
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();
    const data = TeacherActionSchema.parse(body);

    switch (data.action) {
      case "invite":
      case "add": {
        const { email, name } = data;
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) return ApiResponse.error("Email already registered", "CONFLICT", 409);

        // Name duplicate check
        const existingName = await prisma.user.findFirst({
           where: { role: { in: ['INSTRUCTOR', 'TEACHER'] }, name: { equals: name.trim() } }
        });
        if (existingName) return ApiResponse.error("Teacher name already exists", "CONFLICT", 409);

        const password = data.action === "add" ? data.password : Math.random().toString(36).slice(-10);
        const hashedPassword = await bcrypt.hash(password, 10);

        const teacherId = await generateTeacherId();

        const newUser = await prisma.user.create({
          data: {
            email,
            name,
            password: hashedPassword,
            role: 'INSTRUCTOR',
            bio: (data as any).bio,
            company: (data as any).company,
            teacher: {
              create: {
                teacherId: teacherId,
                title: 'Instructor',
                status: data.action === "add" ? "verified" : "pending",
                canCreateCourses: data.action === "add"
              }
            }
          }
        });

        await auditAdminAction(admin, `teacher_${data.action}`, 'USER', newUser.id, name, { email });
        return ApiResponse.success({ id: newUser.id, tempPassword: data.action === "invite" ? password : null }, `Teacher ${data.action === "invite" ? 'invited' : 'added'} successfully`);
      }

      case "edit": {
        const { teacherId, name, bio, company } = data;
        const updated = await prisma.user.update({
          where: { id: teacherId },
          data: { name, bio, company }
        });
        await auditAdminAction(admin, 'teacher_edit', 'USER', teacherId, updated.name || '', { changes: body });
        return ApiResponse.success(updated, "Teacher profile updated");
      }

      case "delete": {
        const { teacherId } = data;
        const deleted = await prisma.user.delete({ where: { id: teacherId } });
        await auditAdminAction(admin, 'teacher_delete', 'USER', teacherId, deleted.name || '', { email: deleted.email });
        return ApiResponse.success(null, "Teacher account removed");
      }

      case "verify": {
        const { teacherId: uId, status } = data;
        const isApplication = (data as any).isApplication;
        const applicationId = (data as any).applicationId;

        if (isApplication && applicationId) {
          if (status === 'verified') {
            const { approveTeacherApplication } = await import('@/lib/services/teacher.service');
            const result = await approveTeacherApplication(applicationId, admin.id);
            const updated = result.application || result;

            try {
              const { sendTransactionalEmail } = await import('@/lib/email/send');
              const { templates } = await import('@/lib/email');
              const recipientName = updated.fullName || 'Instructor';
              const emailTo = updated.email || result.originalEmail;
              
              if (result.tempPassword && result.setupToken) {
                await sendTransactionalEmail({
                  to: emailTo,
                  type: 'application',
                  subject: '🛡️ SECURE: Your SARTHI Institutional Access & Keys',
                  html: templates.teacherAccountReady(
                    recipientName,
                    result.officialEmail || emailTo,
                    result.tempPassword,
                    result.facultyId || 'FAC-NODE',
                    result.setupToken
                  ).html
                });
              } else {
                await sendTransactionalEmail({
                  to: emailTo,
                  type: 'application',
                  subject: 'Welcome to SARTHI!',
                  html: templates.teacherApproved(recipientName, emailTo).html
                });
              }
            } catch (err) {
              console.error("[EMAIL_ERROR] Teacher Row Approval:", err);
            }

            await auditAdminAction(admin, 'teacher_app_approved', 'USER', updated.userId || 'GUEST', updated.fullName || '', { status, isApplication });
            return ApiResponse.success(updated, `Teacher status updated to ${status}`);
          }
        }

        let generatedTempPassword = '';
        let generatedSetupToken = '';

        const result = await prisma.$transaction(async (tx) => {
          let userId = uId;

          const userRecord = await tx.user.findUnique({
            where: { id: userId }
          });

          if (!userRecord) {
            throw new Error("User not found");
          }

          let tempPassword = userRecord.tempPassword;
          let hashedPassword = userRecord.password;
          let setupToken = userRecord.passwordSetupToken;
          let onboardingStatus = userRecord.onboardingStatus;
          let requiresPasswordChange = userRecord.requiresPasswordChange;

          if (!tempPassword) {
            const firstName = (userRecord.name || 'Faculty').split(' ')[0];
            tempPassword = `TT-FAC-${firstName}#2026`;
            hashedPassword = await bcrypt.hash(tempPassword, 10);
            setupToken = setupToken || crypto.randomBytes(32).toString('hex');
            onboardingStatus = 'PENDING';
            requiresPasswordChange = true;

            generatedTempPassword = tempPassword;
            generatedSetupToken = setupToken;
          }
          
          // Just updating an existing user's status
          await tx.user.update({
            where: { id: userId },
            data: { 
              status: 'ACTIVE',
              password: hashedPassword || undefined,
              tempPassword: tempPassword,
              onboardingStatus,
              requiresPasswordChange,
              passwordSetupToken: setupToken
            }
          });

          // Handle the Teacher profile
          const teacher = await tx.teacher.findUnique({ where: { userId: userId } });
          let tId = teacher?.teacherId;
          
          if (status === 'verified' && (!tId || tId === 'PENDING')) {
            const { generateTeacherId } = await import('@/lib/id-generator');
            tId = await generateTeacherId();
          }

          // Upsert teacher record
          const updatedTeacher = await tx.teacher.upsert({
            where: { userId: userId },
            update: {
              status,
              teacherId: tId,
              teacherEmail: (await tx.user.findUnique({ where: { id: userId }, select: { email: true } }))?.email,
              approvedBy: status === 'verified' ? admin.id : null,
              approvedAt: status === 'verified' ? new Date() : null,
              canCreateCourses: status === 'verified'
            },
            create: {
              userId: userId,
              status,
              teacherId: tId || 'PENDING',
              teacherEmail: (await tx.user.findUnique({ where: { id: userId }, select: { email: true } }))?.email,
              title: 'Instructor',
              canCreateCourses: status === 'verified'
            },
            include: { 
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                  role: true,
                  tempPassword: true,
                  onboardingStatus: true,
                  passwordSetupToken: true
                }
              }
            }
          });

          await auditAdminAction(admin, 'teacher_verify', 'USER', userId, updatedTeacher.user.name || '', { status, isApplication });

          // Trigger email pipeline asynchronously (don't block transaction completion)
          if (status === 'verified') {
            const user = updatedTeacher.user;
            const finalTempPassword = generatedTempPassword || user.tempPassword;
            const finalSetupToken = generatedSetupToken || user.passwordSetupToken;

            import('@/lib/email/send').then(async ({ sendTransactionalEmail }) => {
              const { templates } = await import('@/lib/email');
              try {
                if (finalTempPassword && user.onboardingStatus === 'PENDING') {
                  await sendTransactionalEmail({
                    to: user.email,
                    type: 'application',
                    subject: '🛡️ SECURE: Your SARTHI Institutional Access & Keys',
                    html: templates.teacherAccountReady(
                      user.name || 'Instructor',
                      user.email,
                      finalTempPassword,
                      tId || 'FAC-NODE',
                      finalSetupToken || ''
                    ).html
                  });
                } else {
                  await sendTransactionalEmail({
                    to: user.email,
                    type: 'application',
                    subject: 'Welcome to SARTHI!',
                    html: templates.teacherApproved(user.name || 'Instructor', user.email).html
                  });
                }
              } catch (e) {
                console.error("Email failed:", e);
              }
            });
          }

          return updatedTeacher;
        });

        return ApiResponse.success(result, `Teacher status updated to ${status}`);
      }

      case "reset-password": {
        const { teacherId } = data;
        
        const user = await prisma.user.findUnique({
          where: { id: teacherId },
          include: { teacher: true }
        });

        if (!user) {
          return ApiResponse.error("User not found", "NOT_FOUND", 404);
        }

        const tempPassword = `TT-RESET-${crypto.randomBytes(2).toString('hex').toUpperCase()}-2026`;
        const hashedPassword = await bcrypt.hash(tempPassword, 10);
        const setupToken = user.passwordSetupToken || crypto.randomBytes(32).toString('hex');

        await prisma.user.update({
          where: { id: teacherId },
          data: { 
            password: hashedPassword,
            tempPassword: tempPassword,
            requiresPasswordChange: true,
            onboardingStatus: 'PENDING',
            passwordSetupToken: setupToken
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

        await auditAdminAction(admin, 'teacher_password_reset', 'USER', teacherId, user.name || '', { email: user.email });
        return ApiResponse.success({ tempPassword }, "Password reset successful");
      }

      case "bulk-action": {
        const { ids, bulkAction } = data;
        if (bulkAction === 'delete') {
          await prisma.user.deleteMany({ where: { id: { in: ids }, role: { in: ['INSTRUCTOR', 'TEACHER'] } } });
        } else {
          const status = bulkAction === 'suspend' ? 'inactive' : 'verified';
          await prisma.teacher.updateMany({
            where: { userId: { in: ids } },
            data: { status, canCreateCourses: status === 'verified' }
          });
        }
        await auditAdminAction(admin, `teacher_bulk_${bulkAction}`, 'USER', 'bulk', `${ids.length} teachers`, { ids });
        return ApiResponse.success(null, `Bulk ${bulkAction} completed`);
      }

      default:
        return ApiResponse.error("Unsupported action", "BAD_REQUEST", 400);
    }
  } catch (error) {
    return handleApiError(error);
  }
}

