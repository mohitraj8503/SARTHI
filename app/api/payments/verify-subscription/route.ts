export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { 
        razorpay_payment_id, 
        razorpay_subscription_id, 
        razorpay_signature,
        planType
    } = await req.json();

    // 1. Verify Signature
    const secret = process.env.RAZORPAY_KEY_SECRET;
    const generated_signature = crypto
      .createHmac('sha256', secret!)
      .update(razorpay_payment_id + '|' + razorpay_subscription_id)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid subscription signature' }, { status: 400 });
    }

    // 2. Save Subscription in DB
    // In a real app, you'd fetch the subscription details from Razorpay to get the exact dates
    await prisma.subscription.upsert({
      where: { userId: session.userId },
      update: {
        razorpaySubscriptionId: razorpay_subscription_id,
        status: 'active',
        planId: planType, // Usually the internal plan name or ID
        currentStart: new Date(),
        currentEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days placeholder
      },
      create: {
        userId: session.userId,
        razorpaySubscriptionId: razorpay_subscription_id,
        status: 'active',
        planId: planType,
        currentStart: new Date(),
        currentEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Verify Subscription Error]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

