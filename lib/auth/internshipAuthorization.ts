import { prisma } from '@/lib/prisma';

export interface UserSession {
  id: string;
  role: string;
  email?: string;
  name?: string;
}

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN', 'GOD_ADMIN', 'CTO', 'LEAD_DEVELOPER'];
const MENTOR_ROLES = ['MENTOR', 'TEACHER', 'INSTRUCTOR'];

export function isAdmin(user: UserSession): boolean {
  return ADMIN_ROLES.includes(user.role.toUpperCase());
}

export function isMentor(user: UserSession): boolean {
  return MENTOR_ROLES.includes(user.role.toUpperCase());
}

/**
 * Checks if a user can view a given assignment.
 * - Admins can view everything.
 * - Mentors can view only if the assignment belongs to a batch they supervise (matching mentorEmail).
 * - Students can view only if they are a recipient of the assignment.
 */
export async function canViewAssignment(user: UserSession, assignmentId: string): Promise<boolean> {
  if (isAdmin(user)) return true;

  if (isMentor(user)) {
    const assignment = await prisma.internshipAssignment.findFirst({
      where: {
        id: assignmentId,
        batch: {
          mentorEmail: user.email
        }
      }
    });
    return !!assignment;
  }

  // Student check: must be a recipient of the assignment
  const member = await prisma.batchMember.findFirst({
    where: { userId: user.id }
  });
  if (!member) return false;

  const recipient = await prisma.internshipAssignmentRecipient.findUnique({
    where: {
      assignmentId_memberId: {
        assignmentId,
        memberId: member.id
      }
    }
  });
  return !!recipient;
}

/**
 * Checks if a user can submit a solution for a given assignment.
 * - Only the assigned student can submit.
 */
export async function canSubmitAssignment(
  user: UserSession, 
  assignmentId: string, 
  memberId: string
): Promise<boolean> {
  // Confirm that memberId belongs to the current user
  const member = await prisma.batchMember.findUnique({
    where: { id: memberId }
  });
  if (!member || member.userId !== user.id) return false;

  // Confirm that this member is indeed a recipient
  const recipient = await prisma.internshipAssignmentRecipient.findUnique({
    where: {
      assignmentId_memberId: {
        assignmentId,
        memberId
      }
    }
  });
  return !!recipient;
}

/**
 * Checks if a user can view or post discussions on an assignment.
 * - Same access permissions as canViewAssignment.
 */
export async function canAccessDiscussion(user: UserSession, assignmentId: string): Promise<boolean> {
  return canViewAssignment(user, assignmentId);
}

/**
 * Checks if a mentor/admin can review a submission.
 * - Admins can review everything.
 * - Mentors can review only if the submission's member belongs to a batch they supervise.
 */
export async function canReviewSubmission(user: UserSession, submissionId: string): Promise<boolean> {
  if (isAdmin(user)) return true;
  if (!isMentor(user)) return false;

  const submission = await prisma.internshipSubmission.findFirst({
    where: {
      id: submissionId,
      member: {
        batch: {
          mentorEmail: user.email
        }
      }
    }
  });
  return !!submission;
}

/**
 * Checks if a user can manage (create, delete, edit) assignments.
 * - Admins can manage everything.
 * - Mentors can manage only for their own cohorts (matching mentorEmail).
 */
export async function canManageAssignment(user: UserSession, assignmentId: string): Promise<boolean> {
  if (isAdmin(user)) return true;
  if (!isMentor(user)) return false;

  const assignment = await prisma.internshipAssignment.findFirst({
    where: {
      id: assignmentId,
      batch: {
        mentorEmail: user.email
      }
    }
  });
  return !!assignment;
}

/**
 * Checks if a mentor can manage a specific student member.
 * - Admins can manage everything.
 * - Mentors can manage only if the student belongs to a batch they supervise.
 */
export async function canManageMember(user: UserSession, memberId: string): Promise<boolean> {
  if (isAdmin(user)) return true;
  if (!isMentor(user)) return false;

  const member = await prisma.batchMember.findFirst({
    where: {
      id: memberId,
      batch: {
        mentorEmail: user.email
      }
    }
  });
  return !!member;
}
