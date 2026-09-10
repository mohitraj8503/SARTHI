export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { getRazorpayInstance } from '@/lib/razorpay';

export async function POST(req: NextRequest) {
  const razorpay = getRazorpayInstance();
  if (!razorpay) {
    return NextResponse.json({ error: "Payment gateway not configured" }, { status: 500 });
  }

  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { tier, courseId } = await req.json();

    const prices: Record<string, number> = {
      basic: 0,
      premium: 99,
      pro: 199,
    };

    const amount = prices[tier as keyof typeof prices];

    if (amount === undefined) {
      return NextResponse.json({ message: 'Invalid tier' }, { status: 400 });
    }

    if (amount === 0) {
      // Free tier - no payment needed
      return NextResponse.json({
        success: true,
        type: 'free',
        message: 'Generating free certificate',
      });
    }

    // Paid tier - create Razorpay Order for consistency with other payments
    const amountInPaise = amount * 100;
    
    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `CERT-${tier}-${courseId.substring(0, 8)}-${Date.now()}`,
      notes: {
        userId: user.id,
        courseId,
        tier,
        type: 'certificate_upgrade',
        amount: amount
      }
    };

    const order = await razorpay.orders.create(options);

    // Store payment intent in database with the order ID
    await prisma.paymentIntent.create({
      data: {
        userId: user.id,
        courseId,
        tier,
        amount,
        status: 'pending',
        razorpayId: order.id, // Store order ID here initially
      },
    });

    return NextResponse.json({
      success: true,
      type: 'payment',
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    });
  } catch (error: any) {
    console.error('[CreatePayment] Error:', error);
    return NextResponse.json({ 
      message: "Internal server error. Please use the 'Safety Link' for manual payment if this persists.",
      details: error.message
    }, { status: 500 });
  }
}


