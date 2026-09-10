export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { email, source, name } = await req.json();

    const entry = await prisma.waitlistEntry.upsert({
      where: { email },
      update: {
        source,
        name,
      },
      create: {
        email,
        source,
        name,
      },
    });

    return NextResponse.json({ success: true, entry });
  } catch (error) {
    console.error('Waitlist error:', error);
    return NextResponse.json({ error: 'Failed to join waitlist' }, { status: 500 });
  }
}

