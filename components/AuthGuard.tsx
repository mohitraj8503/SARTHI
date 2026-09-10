'use client';

import { useAuth } from '@/components/AuthProvider';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

interface AuthGuardProps {
  children: ReactNode;
  requiredRole?: string[];
  redirectTo?: string;
}

export default function AuthGuard({
  children,
  requiredRole,
  redirectTo = '/login',
}: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        const encodedPath = encodeURIComponent(pathname || '');
        router.push(`${redirectTo}?redirect=${encodedPath}`);
      } else if (requiredRole && requiredRole.length > 0) {
        const normalizedUserRole = user.role.toLowerCase();
        const hasRole = requiredRole.some((role) => role.toLowerCase() === normalizedUserRole);

        if (!hasRole) {
          router.push('/login');
        }
      }
    }
  }, [user, loading, router, requiredRole, redirectTo, pathname]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  if (requiredRole && requiredRole.length > 0) {
    const normalizedUserRole = user.role.toLowerCase();
    const hasRole = requiredRole.some((role) => role.toLowerCase() === normalizedUserRole);
    if (!hasRole) {
      return null; // Will redirect
    }
  }

  return <>{children}</>;
}

