export const dynamic = 'force-dynamic';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminMobileHeader from '@/components/admin/AdminMobileHeader';
import { MANAGEMENT_ROLES, ADMIN_ROLES } from '@/lib/admin/roles';
import { ToastProvider } from '@/components/ToastProvider';
import { AdminProvider } from '@/lib/contexts/AdminContext';
import { AdminErrorBoundary } from '@/components/admin/AdminErrorBoundary';
import DashboardRecoveryGuard from '@/components/auth/DashboardRecoveryGuard';
import { Bell, Home, ChevronRight, Search, Plus, Shield } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'SARTHI Admin | Mission Control',
  description: 'Mission control for the SARTHI technical education platform.',
};

// 1. Ambient Background Bubbles
const AmbientBackground = () => (
  <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
    {/* Top Left Bubble */}
    <div className="absolute -top-[10%] -left-[10%] w-[500px] h-[500px] bg-blue-100/30 rounded-full blur-[100px] animate-pulse" />
    {/* Bottom Right Bubble */}
    <div className="absolute top-[20%] -right-[10%] w-[600px] h-[600px] bg-emerald-100/20 rounded-full blur-[120px] animate-pulse" />
    {/* Center Bottom Bubble */}
    <div className="absolute bottom-[10%] left-[20%] w-[400px] h-[400px] bg-orange-100/10 rounded-full blur-[90px] animate-pulse" />
  </div>
);

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login?redirect=/admin');
  
  const role = (user.role as string)?.toUpperCase() || '';
  if (!ADMIN_ROLES.includes(role)) redirect('/dashboard');

  // ONBOARDING GUARD: Force password reset if required
  if (user.requiresPasswordChange && user.onboardingStatus !== 'COMPLETED') {
    redirect('/setup-account?onboarding=true');
  }

  return (
    <AdminProvider>
      <ToastProvider>
        <div className="flex min-h-screen bg-[#F8FAFC] selection:bg-blue-100 selection:text-blue-900 font-sans relative overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none opacity-20"
            src="/videos/admin-bg.mp4"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#F8FAFC]/40 to-[#F8FAFC]/40 z-0 pointer-events-none" />
          <AdminSidebar />
          
          <div className="flex-1 lg:ml-[280px] flex flex-col min-h-screen relative z-10 max-w-full overflow-x-hidden">
            <AdminMobileHeader />
            <main className="flex-1 overflow-x-hidden overflow-y-auto pt-20 lg:pt-8 px-3 sm:px-6 pb-8 no-scrollbar">
              <DashboardRecoveryGuard expectedRole={ADMIN_ROLES} routeName="Admin Dashboard">
                <AdminErrorBoundary>
                  {children}
                </AdminErrorBoundary>
              </DashboardRecoveryGuard>
            </main>
          </div>
        </div>
      </ToastProvider>
    </AdminProvider>
  );
}

