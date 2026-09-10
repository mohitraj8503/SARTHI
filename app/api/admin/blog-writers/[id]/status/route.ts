export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { sendEmail, templates } from '@/lib/email';
import { logAdminActivity, ActivityType } from '@/lib/admin-logging';

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const user = await getCurrentUser();
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { status, adminNote } = await request.json();

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const application = await prisma.blogWriterApplication.update({
      where: { id },
      data: {
        status,
        adminNote,
        reviewedById: user.id || null, 
        reviewedAt: new Date(),
      },
    });

    // If approved, update user role
    if (status === 'approved') {
      const targetUser = await prisma.user.findFirst({
        where: { email: application.email },
      });

      if (targetUser) {
        await prisma.user.update({
          where: { id: targetUser.id },
          data: {
            role: 'BLOG_WRITER',
            blogWriterApprovedAt: new Date(),
          },
        });
      }

      // Send approval email
      const emailTemplate = templates.blogWriterApproval(application.fullName);
      await sendEmail({
          to: application.email,
          subject: emailTemplate.subject,
          html: emailTemplate.html
      });
    }

    // Audit Log
    const logType = status === 'approved' ? ActivityType.BLOG_WRITER_APPROVED : ActivityType.BLOG_WRITER_REJECTED;
    await logAdminActivity({
        userId: user.id,
        actorName: user.name || "Admin",
        type: logType,
        targetId: application.id,
        targetName: application.fullName,
        description: `${status === 'approved' ? 'Approved' : 'Rejected'} blog writer application from ${application.fullName}`,
        metadata: { status, adminNote }
    });

    return NextResponse.json({
      message: `Application ${status}. Writer notified via email.`,
      application,
    });
  } catch (error) {
    console.error('Error updating writer application status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
