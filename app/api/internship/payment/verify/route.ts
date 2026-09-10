import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPayment, fetchOrder } from '@/lib/razorpay';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, applicationId } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment verification credentials' }, { status: 400 });
    }

    // 1. Verify HMAC SHA256 signature server-side
    let isValid = false;
    try {
      isValid = await verifyPayment({
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
      });
    } catch (err: any) {
      console.error('[INTERNSHIP_PAYMENT_VERIFY_SIGNATURE_ERROR]', err);
      isValid = false;
    }

    // Lookup application
    const app = applicationId
      ? await prisma.internshipApplication.findUnique({ where: { id: applicationId } })
      : await prisma.internshipApplication.findFirst({ where: { orderId: razorpay_order_id } });

    if (!app) {
      return NextResponse.json({ error: 'Associated application not found' }, { status: 404 });
    }

    if (!isValid) {
      console.warn(`[INTERNSHIP_PAYMENT_VERIFY_FAILED] Signature mismatch for order: ${razorpay_order_id}`);
      await prisma.internshipApplication.update({
        where: { id: app.id },
        data: {
          paymentStatus: 'failed',
          status: 'pending',
        },
      });
      return NextResponse.json({ success: false, error: 'Invalid payment signature' }, { status: 400 });
    }

    // Fetch order to get exact amount paid in INR
    let amountPaidInr = 2000;
    try {
      const order = await fetchOrder(razorpay_order_id);
      if (order && order.amount) {
        amountPaidInr = Math.round(order.amount / 100);
      }
    } catch (e) {
      console.warn('[INTERNSHIP_PAYMENT_VERIFY] Failed to fetch order details, using default amount:', e);
    }

    // Update application to paid + accepted
    const updatedApp = await prisma.internshipApplication.update({
      where: { id: app.id },
      data: {
        paymentStatus: 'paid',
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        amountPaidInr,
        paidAt: new Date(),
        status: 'accepted',
      },
    });

    // Auto-create/enroll student in BatchMember workspace so intern dashboard is immediately provisioned
    if (updatedApp.studentId) {
      try {
        const { getOrCreateEnrollment } = await import('@/lib/services/internship.service');
        await getOrCreateEnrollment(updatedApp.studentId);
        console.log(`[INTERNSHIP_PAYMENT_VERIFY] Successfully created BatchMember workspace for student ${updatedApp.studentId}`);
      } catch (enrollErr) {
        console.error('[INTERNSHIP_PAYMENT_VERIFY] BatchMember workspace creation warning:', enrollErr);
      }
    }

    // Send mandatory offer letter email with PDF attachment
    try {
      const { processAndSendOfferLetter } = await import('@/lib/services/offer-letter-pipeline.service');
      await processAndSendOfferLetter({
        applicationId: updatedApp.id,
        actorUserId: 'student-payment',
        actorUserEmail: updatedApp.email,
        forceResend: true,
      });
    } catch (pipelineErr) {
      console.error('[INTERNSHIP_PAYMENT_VERIFY] Mandatory offer letter email dispatch error:', pipelineErr);
    }

    return NextResponse.json({
      success: true,
      status: 'accepted',
      paymentStatus: 'paid',
      applicationId: updatedApp.id,
    });
  } catch (error: any) {
    console.error('[INTERNSHIP_VERIFY_ROUTE_ERROR]', error);
    return NextResponse.json({ error: error.message || 'Payment verification failed' }, { status: 500 });
  }
}
