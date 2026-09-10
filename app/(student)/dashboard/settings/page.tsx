import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import SettingsClient from './SettingsClient';

async function getUser() {
  const user = await getCurrentUser();
  if (!user?.id) return null;

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        avatar_url: true,
        password: true,
        authProvider: true,
        notificationSettings: true,
      },
    });
    return dbUser;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

export default async function SettingsPage() {
  const clientUser = await getUser();
  if (!clientUser) {
    redirect('/login');
  }

  return <SettingsClient user={clientUser} />;
}

