import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { logMarketingAction } from '@/lib/services/marketing.service';

export const dynamic = 'force-dynamic';

// GET /api/admin/marketing
// Load all partners, payouts, pending commissions, and settings for Admin
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || !['ADMIN', 'SUPER_ADMIN', 'GOD_ADMIN', 'CTO', 'LEAD_DEVELOPER', 'MARKETING_MANAGER'].includes(user.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const settings = await prisma.marketingSettings.findFirst() || {
      commissionPercentage: 5.0,
      minimumPayoutAmount: 1000.0,
      bonusThresholdAmount: 50000.0,
      bonusPercentage: 2.5
    };

    const partners = await prisma.marketingPartner.findMany({
      include: {
        user: true,
        coupons: true,
        commissions: true,
        payments: true
      }
    });

    const pendingCommissions = await prisma.marketingCommission.findMany({
      where: { status: 'PENDING' },
      include: {
        partner: { include: { user: true } },
        enrollment: { include: { course: true } }
      },
      orderBy: { generatedAt: 'desc' }
    });

    const recentPayments = await prisma.marketingPayment.findMany({
      include: { partner: { include: { user: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    return NextResponse.json({
      success: true,
      settings,
      partners: partners.map(p => ({
        id: p.id,
        name: p.user.name,
        email: p.user.email,
        couponCode: p.coupons[0]?.couponCode || 'N/A',
        status: p.status,
        totalCommissions: p.commissions.length,
        totalEarned: p.commissions.reduce((sum, c) => sum + c.commissionAmount, 0),
        totalPaid: p.commissions.filter(c => c.status === 'PAID').reduce((sum, c) => sum + c.commissionAmount, 0),
        pendingBalance: p.commissions.filter(c => c.status === 'PENDING' || c.status === 'APPROVED').reduce((sum, c) => sum + c.commissionAmount, 0)
      })),
      pendingCommissions,
      recentPayments
    });
  } catch (error: any) {
    console.error('[ADMIN_MARKETING_GET]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/admin/marketing
// Create payout release and mark associated commissions as PAID
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !['ADMIN', 'SUPER_ADMIN', 'GOD_ADMIN', 'CTO', 'LEAD_DEVELOPER', 'MARKETING_MANAGER'].includes(user.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { partnerId, amount, utr, remarks, commissionIds } = body;

    if (!partnerId || !amount || !commissionIds || !Array.isArray(commissionIds)) {
      return NextResponse.json({ success: false, error: 'Missing required parameters' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Marketing Payment Ledger Entry
      const payment = await tx.marketingPayment.create({
        data: {
          partnerId,
          amount: parseFloat(amount),
          utr,
          remarks,
          paymentStatus: 'PAID',
          releasedBy: user.email || user.id,
          releasedAt: new Date()
        }
      });

      // 2. Mark Commissions as Paid
      await tx.marketingCommission.updateMany({
        where: {
          id: { in: commissionIds },
          partnerId
        },
        data: {
          status: 'PAID',
          releasedAt: new Date(),
          paymentId: payment.id
        }
      });

      // 3. Log Audit Action
      await tx.marketingAuditLog.create({
        data: {
          partnerId,
          actor: user.email || user.id,
          action: 'RELEASE_PAYMENT',
          resource: 'MarketingPayment',
          resourceId: payment.id
        }
      });

      // 4. Dispatch notification to partner
      await tx.marketingNotification.create({
        data: {
          partnerId,
          title: 'Payout Released!',
          description: `A commission payout of ₹${amount} was released. UTR Ref: ${utr || 'N/A'}.`,
          type: 'PAYMENT_RELEASED'
        }
      });

      return payment;
    });

    return NextResponse.json({ success: true, payment: result });
  } catch (error: any) {
    console.error('[ADMIN_MARKETING_POST]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PATCH /api/admin/marketing
// Update global settings
export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !['ADMIN', 'SUPER_ADMIN', 'GOD_ADMIN', 'CTO', 'LEAD_DEVELOPER'].includes(user.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { commissionPercentage, minimumPayoutAmount, bonusThresholdAmount, bonusPercentage } = body;

    const existingSettings = await prisma.marketingSettings.findFirst();

    let settings;
    if (existingSettings) {
      settings = await prisma.marketingSettings.update({
        where: { id: existingSettings.id },
        data: {
          commissionPercentage: commissionPercentage ? parseFloat(commissionPercentage) : undefined,
          minimumPayoutAmount: minimumPayoutAmount ? parseFloat(minimumPayoutAmount) : undefined,
          bonusThresholdAmount: bonusThresholdAmount ? parseFloat(bonusThresholdAmount) : undefined,
          bonusPercentage: bonusPercentage ? parseFloat(bonusPercentage) : undefined
        }
      });
    } else {
      settings = await prisma.marketingSettings.create({
        data: {
          commissionPercentage: parseFloat(commissionPercentage || '5.0'),
          minimumPayoutAmount: parseFloat(minimumPayoutAmount || '1000.0'),
          bonusThresholdAmount: parseFloat(bonusThresholdAmount || '50000.0'),
          bonusPercentage: parseFloat(bonusPercentage || '2.5')
        }
      });
    }

    // Log Settings update
    await logMarketingAction(
      null,
      user.email || user.id,
      'UPDATE_GLOBAL_SETTINGS',
      'MarketingSettings',
      settings.id
    );

    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    console.error('[ADMIN_MARKETING_PATCH]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
