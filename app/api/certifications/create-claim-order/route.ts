export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getRazorpayInstance } from '@/lib/razorpay';

export async function POST(req: Request) {
  try {
    const { certificationId, attemptId, totalScore, accuracy } = await req.json();

    if (!certificationId) {
      return NextResponse.json({ error: 'Certification ID is required' }, { status: 400 });
    }

    let price = 2000;
    let title = "Professional Certification";

    const certification = await prisma.certification.findFirst({
      where: {
        OR: [
          { id: certificationId },
          { slug: certificationId }
        ]
      }
    });

    if (certification) {
      price = certification.price || 2000;
      title = certification.title;
    } else {
      // Common price for all certs
      price = 2000;
      
      const titles: Record<string, string> = {
        'python-master-cert': "Python Master Certification",
        'python-pro-cert': "Python Professional Certification",
        'cpp-pro-dev-cert': "C++ Professional Developer Certification",
        'cpp-master-cert': "C++ Master Certification"
      };
      if (titles[certificationId]) {
        title = titles[certificationId];
      }
    }

    const amount = price * 100; // in paise

    const razorpay = getRazorpayInstance();
    if (!razorpay) {
      return NextResponse.json({ error: 'Payment gateway not configured' }, { status: 500 });
    }
    const order = await razorpay.orders.create({
      amount: amount,
      currency: 'INR',
      receipt: `claim_${certificationId.substring(0, 10)}_${Date.now()}`,
      notes: {
        title: title,
        certificationId: certificationId,
        attemptId: attemptId,
        score: totalScore,
        accuracy: accuracy
      }
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (error: any) {
    console.error('Create claim order error:', error);
    return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 });
  }
}

