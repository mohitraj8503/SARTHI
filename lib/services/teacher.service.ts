import { prisma } from "@/lib/prisma";
import { withResiliency } from "@/lib/resilient-db";
import { z } from "zod";
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { generateTeacherId } from "@/lib/id-generator";

/**
 * STRICT VALIDATION SCHEMAS
 */
export const TeachingDetailsSchema = z.object({
  subjects: z.array(z.string()).default([]),
  expertiseLevel: z.string().optional(),
  languages: z.array(z.string()).default([]),
  availability: z.string().optional(),
});

export const ProfessionalDetailsSchema = z.object({
  totalExperience: z.string().optional(),
  currentRole: z.string().optional(),
  organization: z.string().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
});

/**
 * SAFE PARSING UTILITY
 */
export function safeParseJson<T>(json: string | null | undefined, schema: z.ZodSchema<T>, fallback: T): T {
  if (!json) return fallback;
  try {
    const parsed = JSON.parse(json);
    const validated = schema.safeParse(parsed);
    return validated.success ? validated.data : fallback;
  } catch {
    return fallback;
  }
}

/**
 * OFFICIAL EMAIL GENERATOR
 * Creates unique username@sarthi-woad.vercel.app
 */
async function generateOfficialEmail(tx: any, fullName: string): Promise<string> {
  const base = fullName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 15);
  let email = `${base}@sarthi-woad.vercel.app`;
  let counter = 1;

  while (true) {
    const existing = await tx.teacher.findUnique({ where: { teacherEmail: email } });
    const existingUser = await tx.user.findUnique({ where: { email: email } });
    if (!existing && !existingUser) break;
    
    email = `${base}${counter}@sarthi-woad.vercel.app`;
    counter++;
  }
  
  return email;
}

/**
 * SHARED TEACHER SERVICE
 */
export async function approveTeacherApplication(applicationId: string, adminId: string) {
  return await withResiliency(async () => {
    const application = await prisma.teacherApplication.findUnique({
      where: { id: applicationId },
      include: { user: true }
    });

    if (!application) throw new Error("Application not found");
    if (application.status === 'APPROVED') return { application };

    // 1. Transactional Update: Application -> User -> Teacher Profile
    const result = await prisma.$transaction(async (tx) => {
      let userId = application.userId;
      const originalEmail = application.email;
      const officialEmail = await generateOfficialEmail(tx, application.fullName);
      
      // SECURITY: Generate a secure setup token and a temporary OTP password
      const setupToken = crypto.randomBytes(32).toString('hex');
      const tempPassword = `TT-${application.fullName.split(' ').slice(-1)[0].toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}-2026`;
      const hashedPassword = await bcrypt.hash(tempPassword, 10);
      const setupExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Handle User Creation/Role Sync
      if (!userId) {
        const existingUser = await tx.user.findUnique({ where: { email: originalEmail } });
        if (existingUser) {
          userId = existingUser.id;
        } else {
          const newUser = await tx.user.create({
            data: {
              email: originalEmail,
              name: application.fullName,
              role: 'INSTRUCTOR',
              status: 'ACTIVE',
              onboarded: false, 
              phone: application.phone,
              password: hashedPassword,
              tempPassword: tempPassword,
              requiresPasswordChange: true,
              onboardingStatus: 'PENDING',
              passwordSetupToken: setupToken,
              passwordSetupExpires: setupExpires
            }
          });
          userId = newUser.id;
        }
      }

      // Ensure User is an INSTRUCTOR and update details (keeping original email)
      await tx.user.update({
        where: { id: userId },
        data: { 
          role: 'INSTRUCTOR',
          password: hashedPassword,
          tempPassword: tempPassword,
          onboarded: false,
          requiresPasswordChange: true,
          onboardingStatus: 'PENDING',
          passwordSetupToken: setupToken,
          passwordSetupExpires: setupExpires
        }
      });

      // Update Application Record
      const updatedApp = await tx.teacherApplication.update({
        where: { id: applicationId },
        data: { 
          status: 'APPROVED',
          userId: userId,
          reviewedAt: new Date(),
          reviewedBy: adminId
        }
      });

      // Create or Update Teacher Profile
      const existingTeacher = await tx.teacher.findUnique({ where: { userId: userId } });
      let teacherId = existingTeacher?.teacherId;
      
      if (!teacherId) {
        teacherId = await generateTeacherId(tx);
      }

      const skills = application.skills ? JSON.parse(application.skills) : [];
      const subjects = application.preferredSubjects ? JSON.parse(application.preferredSubjects) : [];

      await tx.teacher.upsert({
        where: { userId: userId },
        create: {
          userId: userId,
          teacherId: teacherId,
          teacherEmail: officialEmail,
          expertise: [...skills, ...subjects].join(', '),
          bio: application.bio || application.fullName + " - Expert Educator",
          title: application.headline || 'Instructor',
          status: 'verified',
          canCreateCourses: true,
          approvedBy: adminId,
          approvedAt: new Date(),
        },
        update: {
          teacherId: teacherId,
          teacherEmail: officialEmail,
          expertise: [...skills, ...subjects].join(', '),
          bio: application.bio || undefined,
          title: application.headline || undefined,
          status: 'verified',
        }
      });

      return { 
        application: updatedApp, 
        setupToken, 
        officialEmail,
        originalEmail,
        tempPassword,
        facultyId: teacherId
      };
    });

    // 2. Auto-create Google Drive Teacher Folder (Centralized)
    try {
      const { GoogleDriveService } = await import('@/lib/services/google-drive');
      const teacher = await prisma.teacher.findUnique({ where: { userId: result.application.userId || (await prisma.user.findUnique({ where: { email: application.email } }))?.id } });
      if (teacher) {
        console.log(`Initializing Google Drive folder for teacher: ${application.fullName}`);
        await GoogleDriveService.getTeacherFolder(teacher.id);
      }
    } catch (gdError) {
      console.warn('Google Drive teacher folder initialization failed:', gdError);
    }

    return result;
  }, `approve-teacher-${applicationId}`);
}

export async function rejectTeacherApplication(applicationId: string, reason: string, adminId: string) {
  return await withResiliency(async () => {
    return await prisma.$transaction(async (tx) => {
      const app = await tx.teacherApplication.update({
        where: { id: applicationId },
        data: {
          status: 'REJECTED',
          rejectionReason: reason,
          reviewedAt: new Date(),
          reviewedBy: adminId
        }
      });

      if (app.userId) {
        const user = await tx.user.findUnique({ where: { id: app.userId } });
        if (user && user.role === 'TEACHER_PENDING') {
          await tx.user.update({
            where: { id: app.userId },
            data: { role: 'STUDENT' }
          });
        }
      }

      return app;
    });
  }, `reject-teacher-${applicationId}`);
}

export async function requestChangesTeacherApplication(applicationId: string, notes: string, adminId: string) {
  return await withResiliency(async () => {
    return await prisma.$transaction(async (tx) => {
      const app = await tx.teacherApplication.update({
        where: { id: applicationId },
        data: {
          status: 'CHANGES_REQUESTED',
          adminNotes: notes,
          reviewedAt: new Date(),
          reviewedBy: adminId
        }
      });

      // If user role was TEACHER_PENDING, they stay in TEACHER_PENDING or STUDENT?
      // Since they are expected to edit and resubmit, keeping them as TEACHER_PENDING is fine,
      // as they are redirected to status page anyway where they see the revision options.
      return app;
    });
  }, `request-changes-teacher-${applicationId}`);
}

export async function suspendTeacherApplication(applicationId: string, adminId: string) {
  return await withResiliency(async () => {
    return await prisma.$transaction(async (tx) => {
      const app = await tx.teacherApplication.update({
        where: { id: applicationId },
        data: {
          status: 'SUSPENDED',
          reviewedAt: new Date(),
          reviewedBy: adminId
        }
      });

      // Also suspend their User profile and teacher profile if they have one
      if (app.userId) {
        await tx.user.update({
          where: { id: app.userId },
          data: { status: 'SUSPENDED' }
        });
        
        await tx.teacher.updateMany({
          where: { userId: app.userId },
          data: { status: 'suspended' } // Lowercase in teacher schema status field
        });
      }

      return app;
    });
  }, `suspend-teacher-${applicationId}`);
}
