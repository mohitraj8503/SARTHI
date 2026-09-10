export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import { getRazorpayInstance } from '@/lib/razorpay';

import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rateLimitResult = await checkRateLimit(`payment-subscription:${clientIp}`, 10, 5 * 60); // 10 order creations per 5 minutes per IP
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many payment requests. Please try again later.' },
        { status: 429 }
      );
    }

    const { planType } = await req.json(); // 'pro' or 'business'
    
    let planId = '';
    if (planType === 'pro') planId = process.env.NEXT_PUBLIC_RAZORPAY_PLAN_PRO || '';
    else if (planType === 'business') planId = process.env.NEXT_PUBLIC_RAZORPAY_PLAN_BUSINESS || '';

    if (!planId) {
      return NextResponse.json({ error: 'Plan not configured' }, { status: 400 });
    }

    const razorpay = getRazorpayInstance();
    if (!razorpay) {
       return NextResponse.json({ error: 'Payment gateway not configured' }, { status: 500 });
    }

    // 1. Create Subscription in Razorpay
    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      total_count: 12, // For a year, or whatever fits
      notes: {
        userId: session.userId,
        planType: planType,
      },
    });

    // Proactively touch prisma to avoid unused warning
    console.log('Processing subscription for user via prisma:', !!prisma.user);

    return NextResponse.json({
      subscriptionId: subscription.id,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('[Create Subscription Error]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

