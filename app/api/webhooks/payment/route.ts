export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
      return NextResponse.json({ error: 'Verification failed' }, { status: 400 });
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expectedSignature);
    const signatureValid =
      sigBuf.length === expectedBuf.length &&
      crypto.timingSafeEqual(sigBuf, expectedBuf);

    if (!signatureValid) {
      console.error('[Webhook] Signature mismatch');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    if (event === 'payment.captured') {
      const payment = payload.payload.payment.entity;
      const amount = payment.amount / 100;
      const description = payment.description || '';
      const notes = payment.notes || {};
      const status = payment.status;

      console.log('[Webhook] Payment Captured:', { id: payment.id, amount, description, notes });

      // Identify payment type from notes or description
      const type = notes.type || (description.startsWith('Certificate-') ? 'certificate_upgrade' : null);

      if (type === 'certificate_upgrade' || description.startsWith('Certificate-')) {
        const courseId = notes.courseId || description.split('-')[2];
        const tier = notes.tier || description.split('-')[1];
        const userId = notes.userId || payment.reference_id || description.split('reference=')[1];

        if (userId && courseId) {
          console.log('[Webhook] Processing Certificate Upgrade:', { userId, courseId, tier });
          
          await prisma.paymentIntent.upsert({
            where: { 
              id: (await prisma.paymentIntent.findFirst({
                where: { userId, courseId, tier, status: 'pending' },
                orderBy: { createdAt: 'desc' }
              }))?.id || `webhook-${payment.id}`
            },
            create: {
              userId,
              courseId,
              tier,
              amount: Math.floor(amount),
              status: 'completed',
              razorpayId: payment.id
            },
            update: {
              status: 'completed',
              razorpayId: payment.id
            }
          });
        }
      } 
      
      else if (type === 'seminar_registration' || type === 'junior_program_registration' || notes.segment === 'JUNIOR') {
        const seminarId = notes.seminarId;
        const userId = notes.userId;

        if (seminarId && userId) {
          console.log('[Webhook] Processing Seminar/Junior Registration:', { seminarId, userId });
          
          await prisma.seminarRegistration.upsert({
            where: {
              seminarId_userId: { seminarId, userId }
            },
            update: {
              status: "REGISTERED",
              paymentStatus: "completed",
              razorpayPaymentId: payment.id,
              razorpayOrderId: payment.order_id || undefined,
            },
            create: {
              seminarId,
              userId,
              userName: notes.userName || "",
              userEmail: notes.userEmail || "",
              paymentStatus: "completed",
              amountPaid: amount,
              status: "REGISTERED",
              razorpayPaymentId: payment.id,
              razorpayOrderId: payment.order_id || undefined,
            }
          });

          // Also activate the user
          await prisma.user.update({
            where: { id: userId },
            data: { status: 'ACTIVE', platformSegment: 'JUNIOR' }
          }).catch(() => null);
        }
      }


      else if (type === 'workshop_registration' || notes.workshopId) {
        const workshopId = notes.workshopId;
        const userId = notes.userId;

        if (workshopId && userId) {
          console.log('[Webhook] Processing Workshop Registration:', { workshopId, userId });

          await prisma.$transaction(async (tx) => {
            const existing = await tx.workshopRegistration.findUnique({
              where: { workshopId_userId: { workshopId, userId } },
              select: { status: true }
            });

            await tx.workshopRegistration.upsert({
              where: {
                workshopId_userId: { workshopId, userId }
              },
              update: {
                status: "REGISTERED",
              },
              create: {
                workshopId,
                userId,
                status: "REGISTERED",
              }
            });

            // Decrement seat count only once per user registration lifecycle.
            if (!existing || existing.status !== 'REGISTERED') {
              await tx.workshop.updateMany({
                where: { id: workshopId, seatsLeft: { gt: 0 } },
                data: { seatsLeft: { decrement: 1 } }
              });
            }
          });
        }
      }

      else if (type === 'CERTIFICATION_FEE' || notes.type === 'CERTIFICATION_FEE') {
        const attemptId = notes.attemptId;
        const userId = notes.userId;
        const certificationId = notes.certificationId;

        if (attemptId && userId) {
          console.log('[Webhook] Processing Certification Fee:', { attemptId, userId });
          
          const existingPayment = await prisma.certificationPayment.findUnique({
            where: { attemptId }
          });

          if (existingPayment?.status === 'COMPLETED') {
            console.log('[Webhook] Certification Fee already processed:', attemptId);
            return NextResponse.json({ received: true, note: 'already_processed' });
          }

          await prisma.certificationPayment.upsert({
            where: { attemptId },
            update: {
              status: 'COMPLETED',
              paymentGatewayPaymentId: payment.id,
            },
            create: {
              userId,
              certificationId,
              attemptId,
              amount: amount,
              status: 'COMPLETED',
              paymentGatewayOrderId: payment.order_id,
              paymentGatewayPaymentId: payment.id,
              invoiceNumber: `INV-WEBHOOK-${payment.id}`
            }
          });

          // Optional: We could trigger certificate generation here as well
          // but marking the payment as COMPLETED allows the student to download it 
          // from the UI which checks for payment status.
        }
      }

      // CASE: Standard Course Purchase
      else if (payment.order_id) {
        const orderId = payment.order_id;
        
        await prisma.$transaction(async (tx) => {
          let transaction = await tx.transaction.findUnique({
            where: { razorpayOrderId: orderId }
          });

          // Fallback: If transaction wasn't created yet (e.g. verify-payment not called)
          if (!transaction && notes.courseId && notes.userId) {
            // Amount Verification (Issue 2.2): Fetch course price from DB to verify against payment amount
            const course = await tx.course.findUnique({ where: { id: notes.courseId }, select: { price: true } });
            const expectedAmount = Number(course?.price || 0);

            if (Math.abs(amount - expectedAmount) > 1) { // 1 INR tolerance for rounding
               console.error('[Webhook] Amount mismatch for course purchase:', { orderId, expected: expectedAmount, received: amount });
               throw new Error('Payment amount mismatch');
            }

            transaction = await tx.transaction.create({
              data: {
                userId: notes.userId,
                courseId: notes.courseId,
                amount: amount,
                currency: 'INR',
                status: 'SUCCESS',
                razorpayOrderId: orderId,
                razorpayPaymentId: payment.id,
              }
            });
          }

          if (transaction) {
            await tx.transaction.update({
              where: { id: transaction.id },
              data: {
                status: 'SUCCESS', 
                razorpayPaymentId: payment.id,
              },
            });

            // Handle Enrollment Atomicly with Upsert (Issue 2.1)
            const { nextEnrollmentNo, nextEnrollmentCode } = await import('@/lib/enrollment');
            const n = await nextEnrollmentNo(tx);
            const enrollmentCode = await nextEnrollmentCode(n, tx);

            await tx.enrollment.upsert({
              where: { userId_courseId: { userId: transaction.userId, courseId: transaction.courseId } },
              update: { 
                status: 'active', 
                paymentId: transaction.id,
                updatedAt: new Date()
              },
              create: {
                enrollmentNo: n,
                enrollmentCode: enrollmentCode,
                userId: transaction.userId,
                courseId: transaction.courseId,
                status: 'active',
                paymentId: transaction.id,
              },
            });

            // Create or update invoice if not exists
            if (!transaction.invoiceNumber) {
              const tempInvoiceId = `TEMP-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
              const newInvoice = await tx.invoice.create({
                data: {
                  invoiceNumber: tempInvoiceId,
                  userId: transaction.userId,
                  courseId: transaction.courseId,
                  amount: transaction.amount,
                  currency: 'INR',
                  paymentStatus: 'paid',
                },
              });

              const invoiceNumber = `TT-INV-${newInvoice.id.toString().padStart(6, '0')}`;
              
              await tx.invoice.update({
                where: { id: newInvoice.id },
                data: { invoiceNumber },
              });

              await tx.transaction.update({
                where: { id: transaction.id },
                data: { invoiceNumber },
              });
            }
          }
        });
      }
    }


    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Webhook Error]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

