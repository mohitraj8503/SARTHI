import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { getRazorpayInstance } from '@/lib/razorpay';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      verificationId
    } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !verificationId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Verify signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(text)
      .digest('hex');

    const sigBuf = Buffer.from(String(razorpay_signature));
    const expectedBuf = Buffer.from(expectedSignature);
    const signatureValid =
      sigBuf.length === expectedBuf.length &&
      crypto.timingSafeEqual(sigBuf, expectedBuf);

    if (!signatureValid) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    const razorpay = getRazorpayInstance();
    if (!razorpay) {
      return NextResponse.json({ error: 'Payment gateway not configured' }, { status: 500 });
    }

    const payment = await razorpay.payments.fetch(String(razorpay_payment_id));
    if (payment.order_id !== razorpay_order_id || payment.status !== 'captured') {
      return NextResponse.json({ error: 'Payment is not valid' }, { status: 400 });
    }

    const isMock = verificationId === 'TT-PY-PRO-2026-000004' || verificationId === 'TT-PY-PRO-2026-000007' || verificationId === 'TT-PY-PRO-2026-000008';
    
    if (isMock) {
      return NextResponse.json({ success: true });
    }

    // Fetch the pending certificate
    const issuedCert = await prisma.issuedCertificate.findUnique({
      where: { verificationId }
    });

    if (!issuedCert) {
      return NextResponse.json({ error: 'Certificate record not found' }, { status: 404 });
    }

    // Update status to VALID and set Razorpay IDs
    const updatedCert = await prisma.issuedCertificate.update({
      where: { id: issuedCert.id },
      data: {
        status: 'VALID',
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        certificateUrl: `/certification-exams/verify/${verificationId}`
      }
    });

    // Sync with fallback/old Certificate model if it exists
    try {
      const fallbackCert = await prisma.certificate.findFirst({
        where: {
          userId: issuedCert.userId,
          courseId: issuedCert.certificationId
        }
      });
      if (fallbackCert) {
        await prisma.certificate.update({
          where: { id: fallbackCert.id },
          data: {
            status: 'VALID',
            certificateUrl: `/certification-exams/verify/${verificationId}`
          }
        });
      }
    } catch (err) {
      console.warn('Fallback certificate update skipped:', err);
    }

    // Record the payment in CertificationPayment table
    try {
      const lastAttempt = await prisma.certificationAttempt.findFirst({
        where: {
          userId: issuedCert.userId,
          certificationId: issuedCert.certificationId,
          status: 'COMPLETED'
        },
        orderBy: { completedAt: 'desc' }
      });

      if (lastAttempt) {
        await prisma.certificationPayment.upsert({
          where: { attemptId: lastAttempt.id },
          update: {
            status: 'COMPLETED',
            paymentGatewayPaymentId: razorpay_payment_id,
            paymentGatewayOrderId: razorpay_order_id
          },
          create: {
            attemptId: lastAttempt.id,
            userId: issuedCert.userId,
            certificationId: issuedCert.certificationId,
            amount: 2000,
            status: 'COMPLETED',
            paymentGatewayPaymentId: razorpay_payment_id,
            paymentGatewayOrderId: razorpay_order_id
          }
        });
      }
    } catch (err) {
      console.warn('Payment record upsert failed:', err);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Verify activation payment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
