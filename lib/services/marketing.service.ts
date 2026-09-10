import { prisma } from '@/lib/prisma';

export async function validateCoupon(code: string) {
  const coupon = await prisma.marketingCoupon.findFirst({
    where: {
      couponCode: code,
      active: true
    },
    include: {
      partner: true
    }
  });

  if (!coupon) return { valid: false, message: 'Invalid or inactive coupon code' };
  if (coupon.partner.status !== 'ACTIVE') return { valid: false, message: 'Partner account is suspended' };
  if (coupon.expiryDate && new Date() > coupon.expiryDate) return { valid: false, message: 'Coupon code has expired' };
  if (coupon.usedCount >= coupon.usageLimit) return { valid: false, message: 'Coupon usage limit reached' };

  return { valid: true, coupon };
}

export async function recordReferralClick(partnerId: string, metadata: {
  device?: string;
  browser?: string;
  country?: string;
  city?: string;
  referer?: string;
}) {
  try {
    return await prisma.referralClick.create({
      data: {
        partnerId,
        device: metadata.device,
        browser: metadata.browser,
        country: metadata.country,
        city: metadata.city,
        referer: metadata.referer
      }
    });
  } catch (err) {
    console.error('Failed to record referral click:', err);
    return null;
  }
}

export async function logMarketingAction(
  partnerId: string | null,
  actor: string,
  action: string,
  resource: string,
  resourceId?: string,
  metadata?: { ip?: string; device?: string }
) {
  try {
    return await prisma.marketingAuditLog.create({
      data: {
        partnerId,
        actor,
        action,
        resource,
        resourceId,
        ip: metadata?.ip,
        device: metadata?.device
      }
    });
  } catch (err) {
    console.error('Failed to create audit log:', err);
    return null;
  }
}

export async function getMarketingDashboardData(userId: string) {
  // Find the marketing partner associated with the user
  const partner = await prisma.marketingPartner.findUnique({
    where: { userId },
    include: {
      user: true,
      coupons: true,
      commissions: {
        include: {
          enrollment: {
            include: {
              course: true,
              user: true
            }
          },
          sale: true
        },
        orderBy: { generatedAt: 'desc' }
      },
      payments: {
        orderBy: { createdAt: 'desc' }
      },
      clicks: true
    }
  });

  if (!partner) {
    return null;
  }

  // Get dynamic settings
  const settings = await prisma.marketingSettings.findFirst() || { commissionPercentage: 5.0 };
  const commissionPercentage = settings.commissionPercentage;

  // Calculate statistics
  const commissions = partner.commissions;
  const payments = partner.payments;

  const totalCommissionsCount = commissions.length;
  const totalRevenue = commissions.reduce((sum, c) => sum + c.coursePrice, 0);
  const totalCommissionEarned = commissions.reduce((sum, c) => sum + c.commissionAmount, 0);

  const pendingCommission = commissions
    .filter(c => c.status === 'PENDING' || c.status === 'APPROVED')
    .reduce((sum, c) => sum + c.commissionAmount, 0);

  const paidCommission = commissions
    .filter(c => c.status === 'PAID')
    .reduce((sum, c) => sum + c.commissionAmount, 0);

  // Compute conversion rate based on actual clicks vs sales
  const clicksCount = partner.clicks.length || 1;
  const conversionRate = totalCommissionsCount > 0 
    ? ((totalCommissionsCount / clicksCount) * 100).toFixed(1) 
    : '0.0';

  // Get active referrals (students) list
  const students = commissions.map(c => ({
    id: c.id,
    studentName: c.enrollment?.user?.name || 'Unknown Student',
    studentEmail: c.enrollment?.user?.email || 'N/A',
    studentPhone: c.enrollment?.user?.phone || 'N/A',
    courseName: c.enrollment?.course?.title || 'Unknown Course',
    purchaseDate: c.generatedAt,
    amountPaid: c.coursePrice,
    commissionEarned: c.commissionAmount,
    paymentStatus: c.status,
    progress: c.enrollment?.progressPercentage || 0,
    status: c.enrollment?.status || 'active'
  }));

  // Leaderboard data
  const allPartners = await prisma.marketingPartner.findMany({
    include: {
      user: true,
      coupons: true,
      commissions: true
    }
  });

  const leaderboard = allPartners.map(p => {
    const totalReferrals = p.commissions.length;
    const rev = p.commissions.reduce((sum, c) => sum + c.coursePrice, 0);
    const comm = p.commissions.reduce((sum, c) => sum + c.commissionAmount, 0);
    const clicks = p.clicks?.length || 1;
    const conv = totalReferrals > 0 ? ((totalReferrals / clicks) * 100).toFixed(1) : '0.0';

    return {
      name: p.user.name || 'Anonymous Partner',
      couponCode: p.coupons[0]?.couponCode || 'N/A',
      students: totalReferrals,
      revenue: rev,
      commission: comm,
      conversion: parseFloat(conv)
    };
  })
  .sort((a, b) => b.commission - a.commission)
  .map((p, idx) => ({ ...p, rank: idx + 1 }));

  return {
    partner,
    commissionPercentage,
    stats: {
      earnings: totalCommissionEarned,
      referredCount: totalCommissionsCount,
      couponUsage: totalCommissionsCount,
      pendingCommission,
      paidCommission,
      totalRevenue,
      conversionRate,
      conversionPercent: parseFloat(conversionRate)
    },
    students,
    payments,
    leaderboard
  };
}
