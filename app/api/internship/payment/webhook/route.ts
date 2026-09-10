import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateWebhookSignature } from '@/lib/razorpay';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    const webhookSecret = (
      process.env.RAZORPAY_WEBHOOK_SECRET ||
      process.env.RAZORPAY_KEY_SECRET ||
      ''
    ).trim();

    if (signature && webhookSecret) {
      const isValid = validateWebhookSignature(rawBody, signature, webhookSecret);
      if (!isValid) {
        console.warn('[INTERNSHIP_WEBHOOK] Signature validation failed');
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
      }
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const paymentEntity = payload.payload?.payment?.entity;
    const orderId = paymentEntity?.order_id;
    const paymentId = paymentEntity?.id;
    const notes = paymentEntity?.notes || {};
    const applicationId = notes.applicationId;

    if (!orderId && !applicationId) {
      return NextResponse.json({ received: true, ignored: true });
    }

    const app = applicationId
      ? await prisma.internshipApplication.findUnique({ where: { id: applicationId } })
      : await prisma.internshipApplication.findFirst({ where: { orderId } });

    if (!app) {
      console.warn(`[INTERNSHIP_WEBHOOK] Application not found for orderId: ${orderId}`);
      return NextResponse.json({ received: true, error: 'Application not found' });
    }

    if (event === 'payment.captured') {
      const amountPaidInr = paymentEntity?.amount ? Math.round(paymentEntity.amount / 100) : 2000;
      await prisma.internshipApplication.update({
        where: { id: app.id },
        data: {
          paymentStatus: 'paid',
          paymentId: paymentId || app.paymentId,
          orderId: orderId || app.orderId,
          amountPaidInr,
          paidAt: new Date(),
          status: 'accepted',
        },
      });
      console.log(`[INTERNSHIP_WEBHOOK] Successfully auto-accepted application ${app.id} on payment.captured`);
    } else if (event === 'payment.failed') {
      await prisma.internshipApplication.update({
        where: { id: app.id },
        data: {
          paymentStatus: 'failed',
          status: 'pending',
        },
      });
      console.log(`[INTERNSHIP_WEBHOOK] Updated application ${app.id} paymentStatus to failed on payment.failed`);
    }

    return NextResponse.json({ received: true, status: 'success' });
  } catch (error: any) {
    console.error('[INTERNSHIP_WEBHOOK_ERROR]', error);
    return NextResponse.json({ error: error.message || 'Webhook error' }, { status: 500 });
  }
}
