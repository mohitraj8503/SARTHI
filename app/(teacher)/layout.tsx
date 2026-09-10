import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import TeacherSidebar from '@/components/teacher/TeacherSidebar';
import { MANAGEMENT_ROLES } from '@/lib/admin/roles';
import { ToastProvider } from '@/components/ToastProvider';
import { AdminProvider } from '@/lib/contexts/AdminContext';

import LiveSessionWrapper from '@/components/layout/LiveSessionWrapper';
import DashboardRecoveryGuard from '@/components/auth/DashboardRecoveryGuard';

export const dynamic = 'force-dynamic';

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login?redirect=/teacher');
  
  const role = (user.role as string)?.toUpperCase() || '';
  const isAuthorized = ['TEACHER', 'INSTRUCTOR', 'ADMIN', 'TEACHER_PENDING'].includes(role);
  if (!isAuthorized) redirect('/dashboard');

  // SPECIAL REDIRECT FOR PENDING INSTRUCTORS
  if (role === 'TEACHER_PENDING') {
    redirect('/teach/apply/status');
  }

  // STATUS GUARD: Strictly block if not verified/active
  // Note: Admins bypass this for testing/oversight
  const isApproved = user.status === 'ACTIVE' || user.status === 'APPROVED' || user.status === 'verified';
  if (!isApproved && role !== 'ADMIN') {
    redirect('/login?error=account_pending&message=Your instructor account is awaiting approval.');
  }



  return (
    <ToastProvider>
      <div className="flex flex-1 w-full bg-[#FDFCFB]">
        <LiveSessionWrapper 
          sidebar={<TeacherSidebar />} 
          sidebarWidth="280px"
        >
          <DashboardRecoveryGuard expectedRole={['TEACHER', 'INSTRUCTOR', 'ADMIN', 'TEACHER_PENDING']} routeName="Teacher Dashboard">
            {children}
          </DashboardRecoveryGuard>
        </LiveSessionWrapper>
      </div>
    </ToastProvider>
  );
}
