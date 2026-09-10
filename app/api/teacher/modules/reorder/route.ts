export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { modules } = await req.json();

    if (!modules || !Array.isArray(modules)) {
      return NextResponse.json({ message: 'Invalid or missing modules array' }, { status: 400 });
    }

    // Process all updates in a transaction
    await prisma.$transaction(
      modules.map((m) =>
        prisma.module.update({
          where: { id: m.id },
          data: { order: m.order },
        })
      )
    );

    return NextResponse.json({ message: 'Modules reordered successfully' });
  } catch (error) {
    console.error('Reorder modules error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
