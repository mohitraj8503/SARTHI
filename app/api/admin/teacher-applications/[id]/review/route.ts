export const dynamic = "force-dynamic";
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, ApiResponse, handleApiError } from '@/lib/admin/core';
import { auditAdminAction } from '@/lib/admin/audit-logs';
import { z } from 'zod';
import { sendEmail, templates } from '@/lib/email';
import { approveTeacherApplication, rejectTeacherApplication, requestChangesTeacherApplication, suspendTeacherApplication } from '@/lib/services/teacher.service';

const ReviewSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED", "CHANGES_REQUESTED", "SUSPENDED", "UNDER_REVIEW"]),
  rejectionReason: z.string().optional(),
  adminNotes: z.string().optional(),
});

export async function POST(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    // Security Fix #5: Require true ADMIN role for reviewing applications
    const admin = await requireAdmin('admin');
    const body = await request.json();
    const { status, rejectionReason, adminNotes } = ReviewSchema.parse(body);
    const { id } = params;

    const feedback = rejectionReason || adminNotes || '';

    // Idempotency & Existence check
    const application = await prisma.teacherApplication.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!application) {
      return ApiResponse.error("Application not found", "NOT_FOUND", 404);
    }

    if (application.status === status) {
      return ApiResponse.success(application, `Application is already in ${status.toLowerCase()} state`);
    }

    let result: any;
    if (status === 'APPROVED') {
      result = await approveTeacherApplication(id, admin.id);
    } else if (status === 'REJECTED') {
      result = await rejectTeacherApplication(id, feedback, admin.id);
    } else if (status === 'CHANGES_REQUESTED') {
      result = await requestChangesTeacherApplication(id, feedback, admin.id);
    } else if (status === 'SUSPENDED') {
      result = await suspendTeacherApplication(id, admin.id);
    } else if (status === 'UNDER_REVIEW') {
      result = await prisma.teacherApplication.update({
        where: { id },
        data: {
          status: 'UNDER_REVIEW',
          reviewedAt: new Date(),
          reviewedBy: admin.id
        }
      });
    }

    const updated = result?.application || result;

    await auditAdminAction(
      admin, 
      `teacher_app_${status.toLowerCase()}`, 
      'USER', 
      updated.userId || 'GUEST', 
      updated.fullName || '', 
      { appId: id, reason: feedback }
    );

    // Send email notification based on status
    try {
      const recipientName = updated.fullName || 'Instructor';
      const emailTo = updated.email || application.email;
      
      if (status === 'APPROVED') {
        const { officialEmail, setupToken, originalEmail, tempPassword, facultyId } = result;
        await sendEmail({
          to: originalEmail || emailTo,
          ...templates.teacherAccountReady(recipientName, officialEmail, tempPassword, facultyId, setupToken)
        });
      } else if (status === 'REJECTED') {
        await sendEmail({
          to: emailTo,
          ...templates.teacherRejected(recipientName, feedback || 'Information provided did not meet our current requirements.')
        });
      } else if (status === 'CHANGES_REQUESTED') {
        await sendEmail({
          to: emailTo,
          ...templates.teacherChangesRequested(recipientName, feedback || 'Please review your application and resubmit.')
        });
      } else if (status === 'SUSPENDED') {
        await sendEmail({
          to: emailTo,
          ...templates.teacherSuspended(recipientName)
        });
      }
    } catch (err) {
      console.error("[EMAIL_ERROR] Admin Review:", err);
    }
    
    return ApiResponse.success(updated, `Application ${status.toLowerCase()} successfully`);

  } catch (error) {
    return handleApiError(error);
  }
}


export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await requireAdmin();
    const application = await prisma.teacherApplication.findUnique({
      where: { id: params.id },
      include: { user: true, education: true, documents: true }
    });

    if (!application) return ApiResponse.error("Application not found", "NOT_FOUND", 404);
    
    return ApiResponse.success({ application });
  } catch (error) {
    return handleApiError(error);
  }
}
