import { cookies } from 'next/headers';
import { verifyJWT } from './jwt';
import { prisma } from '@/lib/prisma';

export interface UserSession {
  id: string;
  email: string;
  name: string | null;
  role: string;
  status: string;
  image?: string | null;
  avatar_url?: string | null;
  avatar_version?: number | null;
}

/**
 * Robust authentication helper to replace Supabase's getUser()
 * Works by verifying the custom 'tt_session' JWT and then fetching user from Database.
 */
export async function getServerUser(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('tt_session')?.value;

  if (!token) return null;

  try {
    const payload = await verifyJWT(token);
    if (!payload || !payload.userId) return null;

    // Fetch user from Prisma to ensure they still exist and are active
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        image: true,
        avatar_url: true,
        avatar_version: true,
      },
    });

    if (!user || user.status === 'BANNED' || user.status === 'SUSPENDED') {
      return null;
    }

    return user;
  } catch (error) {
    console.error('[GET_SERVER_USER] Error:', error);
    return null;
  }
}
