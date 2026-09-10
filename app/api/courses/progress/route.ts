export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { generateCredentialId, generateCertificateHash } from '@/lib/certificates';

export async function POST(req: Request) {
  try {
    const { courseId, progress } = await req.json();
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const userId = user.id;

    // Update Enrollment
    const updatedEnrollment = await prisma.enrollment.update({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      data: {
        progressPercentage: progress,
        // If 100%, set completedAt
        completedAt: progress === 100 ? new Date() : undefined,
      },
      include: {
        user: true,
        course: true
      }
    });

    // AUTOMATION: If Course Completed
    if (progress === 100) {
      // 1. Check/Generate Certificate
      const existingCert = await prisma.certificate.findFirst({
        where: { userId, courseId },
      });

      if (!existingCert) {
        const certificateId = generateCredentialId();
        const issueDate = new Date();
        const certificateHash = generateCertificateHash(
          updatedEnrollment.user.name || 'Student',
          updatedEnrollment.course.title,
          issueDate,
          certificateId
        );

        await prisma.certificate.upsert({
          where: { userId_courseId: { userId, courseId } },
          update: {},
          create: {
            certificateNumber: certificateId,
            certificateId,
            certificateHash,
            userId,
            courseId,
            issuedAt: issueDate,
            certificateUrl: `/api/courses/certificate/download?courseId=${courseId}`,
          },
        });
      }

      // 2. Send Notification
      // Check if notification already exists to avoid spam
      const existingNotif = await prisma.notification.findFirst({
        where: {
          userId,
          title: 'Course Completed!',
          href: `/courses`,
        },
      });

      if (!existingNotif) {
        await prisma.notification.create({
          data: {
            userId,
            title: 'Course Completed!',
            body: 'Congratulations! Your certificate is ready to download.',
            type: 'success',
            isRead: false,
            href: `/courses`,
          },
        });
      }
    }

    return NextResponse.json(updatedEnrollment);
  } catch (error) {
    console.error('Update progress error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
