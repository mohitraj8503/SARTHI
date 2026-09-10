import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getOrCreateEnrollment } from '@/lib/services/internship.service';
import { prisma } from '@/lib/prisma';
import AssignmentDetailsClient from './AssignmentDetailsClient';
import { canViewAssignment } from '@/lib/auth/internshipAuthorization';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AssignmentDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?redirect=/dashboard/internship/assignments/${id}`);
  }

  // Enforce Central Authorization check
  const isAuthorized = await canViewAssignment(user, id);
  if (!isAuthorized) {
    redirect('/dashboard/internship');
  }

  const member = await getOrCreateEnrollment(user.id);
  if (!member) {
    redirect('/dashboard/internship');
  }
  
  // Find assignment
  const assignment = await prisma.internshipAssignment.findUnique({
    where: { id },
  });

  if (!assignment) {
    redirect('/dashboard/internship');
  }

  // Verify authorization: check if student is assigned to this assignment
  const isRecipient = await prisma.internshipAssignmentRecipient.findUnique({
    where: {
      assignmentId_memberId: {
        assignmentId: id,
        memberId: member.id,
      },
    },
  });

  if (!isRecipient) {
    redirect('/dashboard/internship');
  }

  // Find submission with version list
  const submission = await prisma.internshipSubmission.findFirst({
    where: {
      memberId: member.id,
      assignmentId: id,
    },
    include: {
      versions: {
        orderBy: { versionNumber: 'desc' },
      },
      feedbacks: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  // Fetch the student's application to get their internship domain/role
  const app = await prisma.internshipApplication.findFirst({
    where: { studentId: user.id },
    select: { domain: true }
  });
  const studentDomain = app?.domain || 'Software Development';

  return (
    <AssignmentDetailsClient
      assignment={JSON.parse(JSON.stringify(assignment))}
      memberId={member.id}
      initialSubmission={submission ? JSON.parse(JSON.stringify(submission)) : null}
      studentDomain={studentDomain}
    />
  );
}
