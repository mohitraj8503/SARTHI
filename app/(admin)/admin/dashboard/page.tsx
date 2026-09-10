import { Suspense } from 'react';
import { getAdminDashboardCombinedData } from '@/lib/services/admin-dashboard';
import { prisma } from '@/lib/prisma';
import AdminDashboardClient from './AdminDashboardClient';
import AdminDashboardLoading from './loading';

export const metadata = {
  title: 'Admin Dashboard | SARTHI',
  description: 'Overview of platform performance and management.',
};

export default async function AdminDashboardPage({
  searchParams
}: {
  searchParams: Promise<{ range?: string; tab?: string }>
}) {
  const { range = 'month', tab = 'dashboard' } = await searchParams;
  const data = await getAdminDashboardCombinedData(range);

  let students: any[] = [];
  if (tab === 'email') {
    const rawStudents = await prisma.user.findMany({
      where: {
        role: { in: ['STUDENT', 'USER'] },
        status: { in: ['ACTIVE', 'APPROVED', 'verified', 'active'] },
      },
      select: {
        id: true,
        name: true,
        email: true,
        enrollments: {
          take: 1,
          select: {
            course: {
              select: { title: true }
            }
          }
        }
      }
    });

    students = rawStudents.map(s => ({
      id: s.id,
      student: {
        id: s.id,
        name: s.name,
        email: s.email || '',
      },
      course: {
        title: s.enrollments[0]?.course?.title || 'Platform Student'
      }
    }));
  }

  return (
    <Suspense fallback={<AdminDashboardLoading />}>
      <AdminDashboardClient initialData={data} currentTab={tab} students={students} />
    </Suspense>
  );
}

