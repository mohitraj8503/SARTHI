export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(
  _req: Request,
  _ctx: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data:  { lastActive: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[EXAM_HEARTBEAT]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
