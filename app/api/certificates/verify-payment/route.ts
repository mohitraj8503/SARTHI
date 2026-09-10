export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      tier, 
      courseId 
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ message: 'Missing payment details' }, { status: 400 });
    }

    // 1. Verify Signature for security
    const secret = process.env.RAZORPAY_KEY_SECRET!;
    const generated_signature = crypto
      .createHmac("sha256", secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    // 2. Check if there's a pending payment intent for this user/courses/tier
    const paymentIntent = await prisma.paymentIntent.findFirst({
      where: {
        userId: user.id,
        courseId,
        tier,
        status: 'pending',
        // Try to match by order ID if stored, or just the latest pending
        OR: [
            { razorpayId: razorpay_order_id },
            { razorpayId: null }
        ]
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!paymentIntent) {
      // If no intent found but signature is valid, we can still fulfill it
      // but let's be strict for now or create a record.
      console.log('[VerifyPayment] No matching intent found for valid signature, creating one.');
      await prisma.paymentIntent.create({
          data: {
              userId: user.id,
              courseId,
              tier,
              status: 'completed',
              razorpayId: razorpay_payment_id,
              amount: 0 // We'd need the actual amount from Razorpay API or from request if trusted
          }
      });
    } else {
      await prisma.paymentIntent.update({
        where: { id: paymentIntent.id },
        data: { 
            status: 'completed',
            razorpayId: razorpay_payment_id 
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
    });
  } catch (error) {
    console.error('[VerifyPayment] Error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}


