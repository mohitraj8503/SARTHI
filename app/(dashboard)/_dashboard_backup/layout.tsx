import { Shell } from '@/components/dashboard-shell/Shell';
import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyJWT } from '@/lib/auth/jwt';
import { validateSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { fontStacks } from '@/lib/font-stacks';
import '@/app/student-theme.css'; // Import the new theme

export const dynamic = 'force-dynamic';

async function getUser(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, image: true, role: true }
    });
    return user || undefined;
  } catch {
    return undefined;
  }
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side auth check
  const cookieStore = await cookies();
  const token = cookieStore.get('tt_session')?.value;

  if (!token) {
    redirect('/login');
  }

  const payload = await verifyJWT(token);
  if (!payload) {
    redirect('/login');
  }

  // Validate session
  const session = await validateSession(payload.sessionId);
  if (!session) {
    redirect('/login');
  }

  const user = await getUser(payload.userId);

  return (
    <div
      className="font-sans"
      style={{
        ['--font-outfit' as string]: fontStacks.studentDisplay,
        ['--font-lora' as string]: fontStacks.studentSerif,
        ['--font-nunito' as string]: fontStacks.studentSans,
      }}
    >
      <Shell user={user}>
        <ErrorBoundary>
          <Suspense fallback={<div className="p-8 text-xs uppercase tracking-widest text-[#D4956A] font-outfit">Loading Study Space...</div>}>
            {children}
          </Suspense>
        </ErrorBoundary>
      </Shell>
    </div>
  );
}

