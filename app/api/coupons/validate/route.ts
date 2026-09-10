import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { coupon: code, courseId } = body;

    if (!code) {
      return NextResponse.json({ valid: false, message: 'Coupon code is required' }, { status: 400 });
    }

    // 1. Look up in MarketingCoupon first
    const marketingCoupon = await prisma.marketingCoupon.findFirst({
      where: {
        couponCode: code,
        active: true
      },
      include: { partner: { include: { user: true } } }
    });

    if (marketingCoupon) {
      if (marketingCoupon.partner.status !== 'ACTIVE') {
        return NextResponse.json({ valid: false, message: 'This referral program is currently suspended' });
      }
      if (marketingCoupon.expiryDate && new Date() > marketingCoupon.expiryDate) {
        return NextResponse.json({ valid: false, message: 'This coupon code has expired' });
      }
      if (marketingCoupon.usedCount >= marketingCoupon.usageLimit) {
        return NextResponse.json({ valid: false, message: 'Coupon usage limit reached' });
      }

      let originalPrice = 21999;
      let launchDiscount = 8000;
      let referralDiscount = 4000;
      let newPrice = 9999;

      if (courseId) {
        let course = await prisma.course.findFirst({
          where: {
            OR: [
              { id: courseId },
              { slug: courseId }
            ]
          }
        });
        if (course) {
          const basePrice = Number(course.price);
          if (basePrice <= 1000) {
            originalPrice = 2500;
            launchDiscount = 1000;
            referralDiscount = 500;
            newPrice = 1000;
          } else if (basePrice <= 3000) {
            originalPrice = 9999;
            launchDiscount = 4000;
            referralDiscount = 2000;
            newPrice = 3999;
          } else {
            // Premium flagship program pricing
            originalPrice = 21999;
            launchDiscount = 8000;
            referralDiscount = 4000;
            newPrice = 9999;
          }
        }
      }

      const totalSavings = launchDiscount + referralDiscount;
      const discountValue = Math.round((totalSavings / originalPrice) * 100);

      const secret = process.env.NEXTAUTH_SECRET || 'fallback-secret-123';
      const token = crypto
        .createHmac('sha256', secret)
        .update(`${courseId}:${marketingCoupon.couponCode}:${newPrice}`)
        .digest('hex');

      return NextResponse.json({
        valid: true,
        type: 'marketing',
        code: marketingCoupon.couponCode,
        discountType: 'PERCENT',
        discountValue,
        discountAmount: totalSavings,
        originalPrice,
        launchDiscount,
        referralDiscount,
        newPrice,
        validatedCouponToken: token,
        couponTitle: 'PARTNER REFERRAL',
        expires: marketingCoupon.expiryDate || 'Never',
        campaign: 'Marketing Campaign',
        partner: marketingCoupon.partner.user.name || 'SARTHI Partner'
      });
    }

    // 2. Look up in standard Coupon table
    const standardCoupon = await prisma.coupon.findFirst({
      where: {
        code: code
      },
      include: { course: true }
    });

    if (standardCoupon) {
      if (standardCoupon.expiresAt && new Date() > standardCoupon.expiresAt) {
        return NextResponse.json({ valid: false, message: 'Coupon code has expired' });
      }
      if (standardCoupon.maxUses && standardCoupon.usedCount >= standardCoupon.maxUses) {
        return NextResponse.json({ valid: false, message: 'Coupon usage limit reached' });
      }

      let originalPrice = 21999;
      let launchDiscount = 8000;
      let referralDiscount = 4000;
      let newPrice = 9999;

      if (courseId) {
        let course = await prisma.course.findFirst({
          where: {
            OR: [
              { id: courseId },
              { slug: courseId }
            ]
          }
        });
        if (course) {
          const basePrice = Number(course.price);
          if (basePrice <= 1000) {
            originalPrice = 2500;
            launchDiscount = 1000;
            referralDiscount = 500;
            newPrice = 1000;
          } else {
            originalPrice = 21999;
            launchDiscount = 8000;
            referralDiscount = 4000;
            newPrice = 9999;
          }
        }
      }

      const totalSavings = launchDiscount + referralDiscount;
      const discountValue = Math.round((totalSavings / originalPrice) * 100);

      const secret = process.env.NEXTAUTH_SECRET || 'fallback-secret-123';
      const token = crypto
        .createHmac('sha256', secret)
        .update(`${courseId}:${standardCoupon.code}:${newPrice}`)
        .digest('hex');

      return NextResponse.json({
        valid: true,
        type: 'standard',
        code: standardCoupon.code,
        discountType: 'PERCENT',
        discountValue,
        discountAmount: totalSavings,
        originalPrice,
        launchDiscount,
        referralDiscount,
        newPrice,
        validatedCouponToken: token,
        couponTitle: 'PROMOTIONAL OFFER',
        expires: standardCoupon.expiresAt || 'Never',
        campaign: 'Promo Campaign',
        partner: 'SARTHI'
      });
    }

    return NextResponse.json({ valid: false, message: 'Invalid or inactive coupon code' });
  } catch (error: any) {
    console.error('[COUPON_VALIDATE_ERROR]', error);
    return NextResponse.json({ valid: false, message: 'Server verification failed' }, { status: 500 });
  }
}
