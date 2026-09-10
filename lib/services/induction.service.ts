import { prisma } from "@/lib/prisma";
import { withResiliency } from "@/lib/resilient-db";

/**
 * UNIFIED INDUCTION CONTRACT
 */
export const INDUCTION_STATUS = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  ARCHIVED: 'ARCHIVED'
} as const;

export const APPLICATION_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  ENROLLED: 'ENROLLED'
} as const;

/**
 * SHARED INDUCTION SERVICE
 */
export async function getInductionStats() {
  return await withResiliency(async () => {
    const [
      activePrograms, pendingApps, totalEnrolled,
      creatorTotal, creatorPending,
      builderTotal, builderPending,
      blogTotal, blogPending
    ] = await Promise.all([
      prisma.inductionProgram.count({ where: { isActive: true } }),
      prisma.inductionApplication.count({ where: { status: 'PENDING' } }),
      prisma.inductionApplication.count({ where: { status: 'APPROVED' } }),
      prisma.creatorInductionSubmission.count(),
      prisma.creatorInductionSubmission.count({ where: { status: 'PENDING' } }),
      prisma.builderInductionSubmission.count(),
      prisma.builderInductionSubmission.count({ where: { status: 'PENDING' } }),
      prisma.blogWriterApplication.count(),
      prisma.blogWriterApplication.count({ where: { status: 'pending' } })
    ]);

    return {
      activePrograms,
      pendingApps,
      totalEnrolled,
      completionRate: 85,
      creatorTotal,
      creatorPending,
      builderTotal,
      builderPending,
      blogTotal,
      blogPending
    };
  }, 'induction-stats');
}

export async function getInductionPrograms(options: { 
  page?: number; 
  pageSize?: number;
  search?: string;
  category?: string;
} = {}) {
  const { page = 1, pageSize = 10, search, category } = options;
  const skip = (page - 1) * pageSize;

  return await withResiliency(async () => {
    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } }
      ];
    }
    if (category) {
      where.category = category;
    }

    const [items, total] = await Promise.all([
      prisma.inductionProgram.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          _count: {
            select: { applications: true }
          },
          mentor: {
            select: { name: true, email: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.inductionProgram.count({ where })
    ]);

    return { items, total };
  }, 'get-induction-programs');
}

export async function getInductionApplications(options: {
  page?: number;
  pageSize?: number;
  status?: string;
  programId?: string;
} = {}) {
  const { page = 1, pageSize = 10, status, programId } = options;
  const skip = (page - 1) * pageSize;

  return await withResiliency(async () => {
    const where: any = {};
    if (status) where.status = status;
    if (programId) where.inductionProgramId = programId;

    const [items, total] = await Promise.all([
      prisma.inductionApplication.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          user: { select: { name: true, email: true } },
          inductionProgram: { select: { title: true } }
        },
        orderBy: { appliedAt: 'desc' }
      }),
      prisma.inductionApplication.count({ where })
    ]);

    return { items, total };
  }, 'get-induction-applications');
}

export async function updateApplicationStatus(id: string, status: string) {
  return await withResiliency(async () => {
    return await prisma.inductionApplication.update({
      where: { id },
      data: { status }
    });
  }, `update-induction-app-${id}`);
}
