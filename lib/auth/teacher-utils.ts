import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';

export async function getCurrentTeacherId() {
  const session = await getSession();
  if (!session?.userId) return null;

  const teacher = await prisma.teacher.findUnique({
    where: { userId: session.userId },
    select: { id: true }
  });

  return teacher?.id || null;
}
