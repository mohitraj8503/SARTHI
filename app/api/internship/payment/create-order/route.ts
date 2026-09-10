import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createOrder } from '@/lib/razorpay';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { applicationId } = body;

    if (!applicationId) {
      return NextResponse.json({ error: 'applicationId is required' }, { status: 400 });
    }

    const application = await prisma.internshipApplication.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const trackSlug = application.trackSlug || 'ai-development';

    let config = await prisma.internshipTrackConfig.findUnique({
      where: { trackSlug },
    });

    if (!config) {
      config = await prisma.internshipTrackConfig.create({
        data: {
          trackSlug,
          paymentRequired: true,
          paymentAmountInr: 2000,
          currency: 'INR',
        },
      });
    }

    // If payment is not required for this track, auto-accept immediately
    if (!config.paymentRequired) {
      await prisma.internshipApplication.update({
        where: { id: applicationId },
        data: {
          status: 'accepted',
          paymentStatus: 'paid',
          paidAt: new Date(),
        },
      });

      // Send mandatory offer letter email with PDF attachment
      try {
        const { processAndSendOfferLetter } = await import('@/lib/services/offer-letter-pipeline.service');
        await processAndSendOfferLetter({
          applicationId,
          actorUserId: 'free-checkout',
          actorUserEmail: application.email,
          forceResend: true,
        });
      } catch (pipelineErr) {
        console.error('[INTERNSHIP_FREE_CHECKOUT] Mandatory offer letter email dispatch error:', pipelineErr);
      }

      return NextResponse.json({
        paymentRequired: false,
        status: 'accepted',
        message: 'Payment not required for this track. Application auto-accepted.',
      });
    }

    // Derive the track-specific fee amount server-side
    const feeByTrack = {
      experienced: 1500,
      learning: 2500,
    } as const;

    let amount = config.paymentAmountInr;
    if (application.internshipTrack === 'experienced') {
      amount = feeByTrack.experienced;
    } else if (application.internshipTrack === 'learning') {
      amount = feeByTrack.learning;
    }

    // Create Razorpay order
    const order = await createOrder({
      amount: amount,
      currency: config.currency || 'INR',
      receipt: applicationId,
      notes: {
        applicationId,
        trackSlug,
      },
    });

    await prisma.internshipApplication.update({
      where: { id: applicationId },
      data: {
        orderId: order.id,
        paymentStatus: 'unpaid',
      },
    });

    const keyId = (process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '').trim();

    return NextResponse.json({
      paymentRequired: true,
      orderId: order.id,
      amount: amount,
      currency: config.currency || 'INR',
      keyId,
    });
  } catch (error: any) {
    console.error('[INTERNSHIP_CREATE_ORDER_ERROR]', error);
    return NextResponse.json({
      code: "PAYMENT_GATEWAY_UNAVAILABLE",
      status: "PAYMENT_GATEWAY_UNAVAILABLE",
      error: "Online payment is temporarily unavailable.",
      userMessage: "We're currently unable to process online payments for this enrollment. Your payment has not been charged."
    }, { status: 503 });
  }
}
