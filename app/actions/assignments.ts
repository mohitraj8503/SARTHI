'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export interface AssignmentListItem {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date | null;
  maxScore: number | null;
  courseTitle: string | undefined;
  status: 'pending' | 'submitted' | 'graded' | 'overdue';
  score: number | null | undefined;
  submissionDate: Date | undefined;
  isInternship?: boolean;
}

export interface AssignmentDetail {
  id: string;
  lessonId: string;
  courseId: string;
  courseSlug: string | null;
  title: string;
  description: string;
  dueDate: string | null;
  maxScore: number;
  passingScore: number;
  courseName: string;
  status: 'pending' | 'submitted' | 'graded' | 'overdue';
  submittedAt: string | null;
  score: number | null;
  feedback: string | null;
  attachments: string[];
  instructor: {
    name: string;
    email: string | null;
  };
}

function getAssignmentStatus(
  dueDate: Date | null,
  submission?: { status: string; score: number | null; createdAt: Date } | null
): 'pending' | 'submitted' | 'graded' | 'overdue' {
  if (submission) {
    return submission.status === 'graded' ? 'graded' : 'submitted';
  }

  if (dueDate && new Date(dueDate) < new Date()) {
    return 'overdue';
  }

  return 'pending';
}

export async function getAssignments(filter: 'all' | 'pending' | 'submitted' = 'all') {
  const user = await getCurrentUser();
  if (!user) return [];

  try {
    // 1. Fetch all assignments from enrolled courses
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: user.id, status: 'active' },
      select: { courseId: true }
    });
    
    const courseIds = enrollments.map(e => e.courseId);

    // 2. Fetch assignments for these courses via lessons
    const assignments = await prisma.assignment.findMany({
      where: {
        lesson: {
          courseId: { in: courseIds }
        }
      },
      include: {
        lesson: {
          include: {
            course: { select: { title: true } }
          }
        },
        submissions: {
          where: { userId: user.id },
          take: 1
        }
      },
      orderBy: { dueDate: 'asc' }
    });

    // 3. Process and filter in memory
    const processed: AssignmentListItem[] = assignments.map(a => {
      const submission = a.submissions[0];
      const status = getAssignmentStatus(a.dueDate, submission);

      return {
        id: a.id,
        title: a.title,
        description: a.description,
        dueDate: a.dueDate,
        maxScore: a.maxScore,
        courseTitle: a.lesson.course.title,
        status,
        score: submission?.score,
        submissionDate: submission?.createdAt,
        isInternship: false
      };
    });

    // 4. Fetch all Internship Assignments
    const batchMemberships = await prisma.batchMember.findMany({
      where: { userId: user.id },
      select: { id: true, batchId: true, batch: { select: { internship: { select: { title: true } } } } }
    });

    const batchIds = batchMemberships.map(bm => bm.batchId);
    const memberIds = batchMemberships.map(bm => bm.id);

    const internshipAssignments = await prisma.internshipAssignment.findMany({
      where: {
        batchId: { in: batchIds },
        recipients: {
          some: {
            memberId: { in: memberIds }
          }
        }
      },
      include: {
        batch: {
          select: {
            internship: { select: { title: true } }
          }
        },
        submissions: {
          where: { memberId: { in: memberIds } },
          take: 1
        }
      },
      orderBy: { deadline: 'asc' }
    });

    const processedInternship: AssignmentListItem[] = internshipAssignments.map(ia => {
      const submission = ia.submissions[0];
      
      let status: 'pending' | 'submitted' | 'graded' | 'overdue' = 'pending';
      if (submission) {
        status = submission.status === 'Approved' ? 'graded' : 'submitted';
      } else if (ia.deadline && new Date(ia.deadline) < new Date()) {
        status = 'overdue';
      }

      return {
        id: ia.id,
        title: ia.title,
        description: ia.description,
        dueDate: ia.deadline,
        maxScore: ia.xpReward,
        courseTitle: `Internship - ${ia.batch.internship.title}`,
        status,
        score: submission?.status === 'Approved' ? ia.xpReward : null,
        submissionDate: submission?.createdAt,
        isInternship: true
      };
    });

    // 5. Combine and Sort
    const combined = [...processed, ...processedInternship];
    combined.sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

    if (filter === 'pending') return combined.filter(a => a.status === 'pending' || a.status === 'overdue');
    if (filter === 'submitted') return combined.filter(a => a.status === 'submitted' || a.status === 'graded');
    
    return combined;

  } catch (error) {
    console.error('Failed to fetch assignments:', error);
    return [];
  }
}

export async function getAssignmentDetail(assignmentId: string): Promise<AssignmentDetail | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  try {
    const assignment = await prisma.assignment.findFirst({
      where: {
        id: assignmentId,
        lesson: {
          course: {
            enrollments: {
              some: { userId: user.id, status: { in: ['active', 'completed'] } }
            }
          }
        }
      },
      include: {
        lesson: {
          include: {
            course: {
              select: {
                id: true,
                slug: true,
                title: true,
                instructor: { select: { name: true, email: true } }
              }
            }
          }
        },
        submissions: {
          where: { userId: user.id },
          orderBy: { attempt: 'desc' },
          take: 1
        }
      }
    });

    if (!assignment) return null;

    const submission = assignment.submissions[0];
    const status = getAssignmentStatus(assignment.dueDate, submission || null);

    return {
      id: assignment.id,
      lessonId: assignment.lessonId,
      courseId: assignment.lesson.course.id,
      courseSlug: assignment.lesson.course.slug,
      title: assignment.title,
      description: assignment.description,
      dueDate: assignment.dueDate?.toISOString() || null,
      maxScore: assignment.maxScore,
      passingScore: assignment.passingScore,
      courseName: assignment.lesson.course.title,
      status,
      submittedAt: submission?.createdAt?.toISOString() || null,
      score: submission?.score ?? null,
      feedback: submission?.feedback ?? null,
      attachments: submission?.attachments
        ? submission.attachments.split(',').map((item) => item.trim()).filter(Boolean)
        : [],
      instructor: {
        name: assignment.lesson.course.instructor?.name || 'SARTHI Faculty',
        email: assignment.lesson.course.instructor?.email || null,
      }
    };
  } catch (error) {
    console.error('Failed to fetch assignment detail:', error);
    return null;
  }
}

