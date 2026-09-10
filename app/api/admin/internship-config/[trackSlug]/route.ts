import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ trackSlug: string }> }
) {
  try {
    const { trackSlug } = await params;

    if (trackSlug === 'all') {
      const configs = await prisma.internshipTrackConfig.findMany({
        orderBy: { trackSlug: 'asc' },
      });
      return NextResponse.json({ configs });
    }

    const config = await prisma.internshipTrackConfig.findUnique({
      where: { trackSlug },
    });

    if (!config) {
      return NextResponse.json({ error: 'Track configuration not found' }, { status: 404 });
    }

    return NextResponse.json({ config });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error fetching track config' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ trackSlug: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
    }

    const { trackSlug } = await params;
    const body = await req.json();
    const { paymentRequired, paymentAmountInr } = body;

    const updatedConfig = await prisma.internshipTrackConfig.upsert({
      where: { trackSlug },
      update: {
        ...(typeof paymentRequired === 'boolean' ? { paymentRequired } : {}),
        ...(typeof paymentAmountInr === 'number' ? { paymentAmountInr } : {}),
      },
      create: {
        trackSlug,
        paymentRequired: typeof paymentRequired === 'boolean' ? paymentRequired : true,
        paymentAmountInr: typeof paymentAmountInr === 'number' ? paymentAmountInr : 2000,
        currency: 'INR',
      },
    });

    return NextResponse.json({ success: true, config: updatedConfig });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update track config' }, { status: 500 });
  }
}
