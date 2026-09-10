import { redirect } from 'next/navigation';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import AdminInternshipsClient from './AdminInternshipsClient';

export const dynamic = 'force-dynamic';

export default async function AdminInternshipConsolePage() {
  const user = await getCurrentUser();
  const isUserAdmin = await isAdmin();
  if (!user || !isUserAdmin) {
    redirect('/login?redirect=/admin/internships');
  }

  // 1. Fetch pending submissions (Waiting for Review or Resubmitted)
  const pendingSubmissions = await prisma.internshipSubmission.findMany({
    where: {
      status: {
        in: ['Submitted', 'Waiting for Review', 'Resubmitted'],
      },
    },
    include: {
      member: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
      assignment: true,
      versions: {
        orderBy: { versionNumber: 'desc' },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  // 2. Fetch all assignments
  const assignments = await prisma.internshipAssignment.findMany({
    orderBy: { createdAt: 'desc' },
  });

  // 3. Aggregate statistics
  const totalInterns = await prisma.batchMember.count({
    where: { status: 'ACTIVE' },
  });
  
  const pendingCount = await prisma.internshipSubmission.count({
    where: {
      status: {
        in: ['Submitted', 'Waiting for Review', 'Resubmitted'],
      },
    },
  });

  const approvedCount = await prisma.internshipSubmission.count({
    where: { status: 'Approved' },
  });

  const xpTransactions = await prisma.xpTransaction.findMany();
  const totalXp = xpTransactions.reduce((acc, curr) => acc + curr.amount, 0);

  const interns = await prisma.batchMember.findMany({
    where: { status: 'ACTIVE' },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          avatar_url: true,
          internshipApplications: {
            select: {
              domain: true,
              preferredField: true,
              internshipTrack: true,
            },
            take: 1,
          },
        },
      },
      batch: {
        select: {
          name: true,
        },
      },
    },
  });

  const stats = {
    totalInterns,
    pendingCount,
    approvedCount,
    totalXp,
  };

  return (
    <AdminInternshipsClient
      initialSubmissions={JSON.parse(JSON.stringify(pendingSubmissions))}
      assignments={JSON.parse(JSON.stringify(assignments))}
      stats={stats}
      interns={JSON.parse(JSON.stringify(interns))}
    />
  );
}
