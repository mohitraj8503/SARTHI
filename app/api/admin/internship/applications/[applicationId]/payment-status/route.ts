import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { error: 'Forbidden: Admin authorization required' },
        { status: 403 }
      );
    }

    const { applicationId } = await params;
    const body = await req.json();
    const { paymentStatus, note } = body;

    const validStatuses = ['unpaid', 'paid', 'failed', 'refunded'];
    if (!paymentStatus || !validStatuses.includes(paymentStatus)) {
      return NextResponse.json(
        { error: 'Invalid paymentStatus. Must be unpaid, paid, failed, or refunded.' },
        { status: 400 }
      );
    }

    if (!note || typeof note !== 'string' || note.trim().length < 10) {
      return NextResponse.json(
        { error: 'A detailed audit note (minimum 10 characters) is required for manual overrides.' },
        { status: 400 }
      );
    }

    const existingApp = await prisma.internshipApplication.findUnique({
      where: { id: applicationId },
    });

    if (!existingApp) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const updateData: any = {
      paymentStatus,
      paymentStatusSource: 'manual_admin',
      paymentOverrideBy: user.id,
      paymentOverrideNote: note.trim(),
      paymentOverrideAt: new Date(),
    };

    // If new status is paid -> auto-set status = accepted & paidAt = now()
    if (paymentStatus === 'paid') {
      updateData.status = 'accepted';
      updateData.paidAt = new Date();
    }
    // If refunded or failed, do NOT auto-flip application status back

    const updatedApp = await prisma.internshipApplication.update({
      where: { id: applicationId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: `Payment status manually updated to ${paymentStatus}`,
      application: updatedApp,
    });
  } catch (error: any) {
    console.error('[ADMIN_MANUAL_PAYMENT_OVERRIDE_ERROR]', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update payment status' },
      { status: 500 }
    );
  }
}
