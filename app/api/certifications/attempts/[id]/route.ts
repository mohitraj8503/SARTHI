export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withResiliency } from '@/lib/resilient-db';

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const attempt = await withResiliency(
      () => prisma.certificationAttempt.findUnique({
        where: { id: params.id },
        include: {
          certification: {
            include: {
              _count: {
                select: { certificates: true }
              }
            }
          }
        }
      }),
      `cert-attempt-${params.id}`
    );

    if (!attempt.success || !attempt.data) {
      return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
    }

    return NextResponse.json(attempt.data);
  } catch (error) {
    console.error('Failed to fetch attempt:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
