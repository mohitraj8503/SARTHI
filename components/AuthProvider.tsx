'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useMemo, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  username?: string;
  role: string;
  image?: string;
  avatar_url?: string;
  profileImage?: string;
  bio?: string;
  expertise?: string;
  headline?: string;
  location?: string;
  socialLinks?: {
    twitter?: string;
    github?: string;
    linkedin?: string;
    website?: string;
  };
  privacySettings?: {
    showEmail?: boolean;
    showCourses?: boolean;
    showBadges?: boolean;
  };
  registrationDate?: string | Date;
  purchasedCourses?: any[];
  totalPoints?: number;
  streakDays?: number;
  achievements?: any[];
  globalRank?: number;
  company?: string;
  coursesCreated?: number;
  totalStudents?: number | string;
  onboarded?: boolean;
  emailVerified?: boolean;
  teacherId?: string;
  blogAccessStatus?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => void;
  signOut: () => void;
  updateUser: (data: Partial<User>) => void;
  setLogin: (user: User) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: () => { },
  signOut: () => { },
  updateUser: () => { },
  setLogin: () => { },
  refreshUser: async () => { },
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkUser = useCallback(async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    console.log('[AUTH] profile loading');

    try {
      const res = await fetch('/api/auth/me', { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          console.log('[AUTH] profile resolved', { userId: data.user.id });
          console.log('[AUTH] role resolved', { role: data.user.role });
          setUser(data.user);
        } else {
          console.log('[AUTH] profile resolved: null');
          setUser(null);
        }
      } else {
        console.log('[AUTH] profile resolved: fetch unauthenticated');
        setUser(null);
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('[AUTH] profile loading error:', error);
      }
      setUser(null);
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  }, []);

  const signIn = useCallback(() => {
    router.push('/login');
  }, [router]);

  const signOut = useCallback(async () => {
    try {
      setUser(null);
      if (typeof window !== 'undefined') {
        try {
          localStorage.clear();
          sessionStorage.clear();
        } catch (e) {
          console.error('Failed to clear storage on logout:', e);
        }
      }
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/?signedOut=true';
    } catch (error) {
      console.error('Logout failed:', error);
      window.location.href = '/?signedOut=true';
    }
  }, []);

  const updateUser = useCallback((data: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...data } : null);
  }, []);

  const setLogin = useCallback((userData: User) => {
    setUser(userData);
  }, []);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  const authValue = useMemo(() => ({
    user,
    loading,
    signIn,
    signOut,
    updateUser,
    setLogin,
    refreshUser: checkUser
  }), [user, loading, signIn, signOut, updateUser, setLogin, checkUser]);

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

