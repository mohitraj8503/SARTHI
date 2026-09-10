export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { id } = params;

    // Update registration to mark as attended
    const registration = await prisma.seminarRegistration.update({
      where: {
        seminarId_userId: {
          seminarId: id,
          userId: user.id,
        },
      },
      data: {
        status: 'ATTENDED',
      },
    });

    return NextResponse.json(registration);
  } catch (error) {
    console.error('Join seminar error:', error);
    return NextResponse.json({ message: 'Failed to record attendance' }, { status: 500 });
  }
}
