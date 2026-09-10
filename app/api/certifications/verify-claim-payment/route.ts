export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { getCurrentUser } from '@/lib/auth';
import { getRazorpayInstance } from '@/lib/razorpay';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      certificationId,
      attemptId
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !attemptId) {
      return NextResponse.json({ error: 'Missing required payment parameters' }, { status: 400 });
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
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    // Fetch attempt
    const attempt = await prisma.certificationAttempt.findUnique({
      where: { id: attemptId },
      include: { user: true, certification: { select: { id: true, price: true, slug: true } } }
    });

    if (!attempt || !attempt.userId) {
       return NextResponse.json({ error: 'Invalid attempt or user missing' }, { status: 400 });
    }

    if (attempt.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (certificationId) {
      const cert = await prisma.certification.findFirst({
        where: {
          OR: [{ id: certificationId }, { slug: certificationId }]
        },
        select: { id: true }
      });
      if (!cert || cert.id !== attempt.certificationId) {
        return NextResponse.json({ error: 'Certification mismatch' }, { status: 400 });
      }
    }

    const razorpay = getRazorpayInstance();
    if (!razorpay) {
      return NextResponse.json({ error: 'Payment gateway not configured' }, { status: 500 });
    }

    const payment = await razorpay.payments.fetch(String(razorpay_payment_id));
    if (payment.order_id !== razorpay_order_id || payment.status !== 'captured') {
      return NextResponse.json({ error: 'Payment is not captured/valid' }, { status: 400 });
    }

    const notes = (payment.notes || {}) as Record<string, string>;
    if (notes.attemptId && notes.attemptId !== attemptId) {
      return NextResponse.json({ error: 'Attempt mismatch' }, { status: 400 });
    }
    if (notes.userId && notes.userId !== user.id) {
      return NextResponse.json({ error: 'User mismatch' }, { status: 400 });
    }
    if (notes.certificationId && notes.certificationId !== attempt.certificationId) {
      return NextResponse.json({ error: 'Certification mismatch' }, { status: 400 });
    }

    const expectedAmountPaise = 2000 * 100; // Flat ₹2000 for all certifications
    if (Number(payment.amount || 0) !== expectedAmountPaise) {
      return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 });
    }

    const score = Math.round(attempt.score ?? 0);
    const slug = attempt.certification.slug || attempt.certificationId;
    const certPrefix = slug === 'fullstack-mastery' 
      ? 'FSWDM' 
      : slug === 'ias-preparation' 
        ? 'UPSC-FS' 
        : slug === 'python-professional' || slug === 'python-professional-developer' || slug === 'python-pro-cert'
          ? 'PY-PRO' 
          : slug === 'advanced-excel-certification-exam'
            ? 'AEX-C'
            : slug.substring(0, 5).toUpperCase().replace(/[^A-Z0-9]/g, '');
    const year = new Date().getFullYear();
    const count = await prisma.issuedCertificate.count({
      where: {
        verificationId: {
          startsWith: `TT-${certPrefix}-${year}-`
        }
      }
    });
    const sequenceStr = String(count + 1).padStart(6, '0');
    const verificationId = `TT-${certPrefix}-${year}-${sequenceStr}`;
    const certificateUrl = `/certification-exams/verify/${verificationId}`;

    // 4. Idempotency Check (Prevent duplicate issuance)
    const existingCertificate = await prisma.issuedCertificate.findFirst({
        where: { razorpayPaymentId: razorpay_payment_id }
    });

    if (existingCertificate) {
        return NextResponse.json({ 
            success: true, 
            issuedId: existingCertificate.id, 
            verificationId: existingCertificate.verificationId,
            wasDuplicate: true
        });
    }

    // 5. Mint Certificate
    const issued = await prisma.issuedCertificate.upsert({
      where: { userId_certificationId: { userId: attempt.userId, certificationId: attempt.certificationId } },
      update: { razorpayOrderId: razorpay_order_id, razorpayPaymentId: razorpay_payment_id, status: 'VALID' },
      create: {
        userId: attempt.userId,
        certificationId: attempt.certificationId,
        score,
        verificationId,
        certificateUrl,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
      }
    });

    // Update Payment Status
    try {
      if (attemptId && attempt.userId) {
        console.log('[VERIFY_CLAIM] Synchronizing Payment Status:', { attemptId, userId: attempt.userId });
        
        const existingPayment = await prisma.certificationPayment.findUnique({
          where: { attemptId }
        });

        if (existingPayment?.status === 'COMPLETED') {
          console.log('[Webhook] Certification Fee already processed:', attemptId);
        } else {
          await prisma.certificationPayment.upsert({
            where: { attemptId: attemptId },
            update: {
              status: 'COMPLETED',
              paymentGatewayPaymentId: razorpay_payment_id
            },
            create: {
              attemptId: attemptId,
              userId: attempt.userId,
              certificationId: attempt.certificationId,
              amount: 0, // Fee is already paid if verifying claim
              status: 'COMPLETED',
              paymentGatewayPaymentId: razorpay_payment_id
            }
          });
        }
      }
    } catch (err) {
      console.warn('[VERIFY_CLAIM] Payment record update failed (might not exist if direct claim):', err);
    }

    return NextResponse.json({ 
      success: true, 
      issuedId: issued.id, 
      verificationId 
    });

  } catch (error: any) {
    console.error('Verify payment error:', error);
    return NextResponse.json(
      { error: 'Internal server error processing completion' },
      { status: 500 }
    );
  }
}
