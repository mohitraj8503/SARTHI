export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateWebhookSignature } from "@/lib/razorpay";
import { updateCertificateStatusAtomic } from "@/lib/certificates/status-service";
import { fulfillCourseEnrollment } from "@/lib/enrollment/fulfillment";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature") || "";
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "";

    if (!signature || !webhookSecret) {
      console.error("[RAZORPAY_WEBHOOK] Missing signature or webhook secret");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Verify Webhook Signature using raw body string
    let isValid = false;
    try {
      isValid = validateWebhookSignature(rawBody, signature, webhookSecret);
    } catch (err) {
      console.error("[RAZORPAY_WEBHOOK] Signature validation error:", err);
    }

    if (!isValid) {
      console.error("[RAZORPAY_WEBHOOK] Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const eventName = event.event;
    console.log(`[RAZORPAY_WEBHOOK] Received event: ${eventName}`);

    // Retrieve payload context
    const subscriptionEntity = event.payload?.subscription?.entity;
    const paymentEntity = event.payload?.payment?.entity;
    const orderEntity = event.payload?.order?.entity;
    const paymentLinkEntity = event.payload?.payment_link?.entity;

    const rzpSubscriptionId = subscriptionEntity?.id || paymentEntity?.notes?.subscription_id || paymentEntity?.notes?.subscriptionId;
    const courseId = paymentLinkEntity?.notes?.courseId || subscriptionEntity?.notes?.courseId || paymentEntity?.notes?.courseId || orderEntity?.notes?.courseId;
    const userId = paymentLinkEntity?.notes?.userId || subscriptionEntity?.notes?.userId || paymentEntity?.notes?.userId || orderEntity?.notes?.userId;
    const notes = (paymentLinkEntity?.notes || paymentEntity?.notes || orderEntity?.notes || {}) as Record<string, string>;
    const verificationId = notes.verificationId || notes.certificateId;
    const attemptId = notes.attemptId;

    // ── 2. Handle Payment Link Paid Event (`payment_link.paid`) ──
    if (eventName === "payment_link.paid") {
      const paymentLinkId = paymentLinkEntity?.id;
      const paymentId = paymentEntity?.id || event.payload?.payment_link?.entity?.payment_id;
      const targetCourseId = courseId || notes.courseId;
      const targetUserId = userId || notes.userId;
      const amountPaid = paymentLinkEntity?.amount_paid 
        ? Math.round(paymentLinkEntity.amount_paid / 100) 
        : paymentEntity?.amount 
        ? Math.round(paymentEntity.amount / 100) 
        : 0;

      console.log(`[RAZORPAY_WEBHOOK] Processing payment_link.paid: linkId=${paymentLinkId}, paymentId=${paymentId}, courseId=${targetCourseId}`);

      if (targetCourseId && (paymentId || paymentLinkId)) {
        const result = await fulfillCourseEnrollment({
          userId: targetUserId,
          courseId: targetCourseId,
          paymentId: paymentId || `paylink_${paymentLinkId}`,
          paymentLinkId: paymentLinkId,
          orderId: notes.internalReferenceId || paymentLinkId,
          amountPaid,
          currency: paymentLinkEntity?.currency || "INR",
          isGroup: notes.isGroup === "true",
          referralCoupon: notes.referralCoupon,
          guestUser: targetUserId ? undefined : {
            email: paymentLinkEntity?.customer?.email || paymentEntity?.email || "student@sarthi-woad.vercel.app",
            name: paymentLinkEntity?.customer?.name || paymentEntity?.notes?.name || "Student",
            phone: paymentLinkEntity?.customer?.contact
          }
        });

        return NextResponse.json({
          success: true,
          event: eventName,
          fulfillment: result,
          message: "Payment link fulfilled successfully"
        });
      }
    }

    // ── 3. Handle Course Direct Orders (`payment.captured` or `order.paid` when courseId is present) ──
    if ((eventName === "payment.captured" || eventName === "order.paid") && courseId && !verificationId && !rzpSubscriptionId) {
      const razorpayPaymentId = paymentEntity?.id;
      const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id;
      const amountPaid = paymentEntity?.amount ? Math.round(paymentEntity.amount / 100) : 0;

      console.log(`[RAZORPAY_WEBHOOK] Processing course order event ${eventName}: order=${razorpayOrderId}, payment=${razorpayPaymentId}, courseId=${courseId}`);

      const result = await fulfillCourseEnrollment({
        userId: userId || notes.userId,
        courseId: courseId,
        paymentId: razorpayPaymentId || `pay_${razorpayOrderId}`,
        orderId: razorpayOrderId,
        amountPaid,
        currency: paymentEntity?.currency || "INR",
        isGroup: notes.type === 'SUMMER_CAMP_GROUP_PURCHASE' || notes.isGroup === 'true',
        referralCoupon: notes.referralCoupon,
        guestUser: (userId || notes.userId) ? undefined : {
          email: paymentEntity?.email || notes.userEmail || "student@sarthi-woad.vercel.app",
          name: notes.name || paymentEntity?.email?.split('@')[0] || "Student",
        }
      });

      return NextResponse.json({
        success: true,
        event: eventName,
        fulfillment: result,
        message: "Course order payment reconciled successfully"
      });
    }

    // ── 4. Handle Certificate Activation Payments (verificationId exists) ──
    if (eventName === "payment.captured" || eventName === "order.paid") {
      if (verificationId) {
        const razorpayPaymentId = paymentEntity?.id;
        const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id;
        const targetUserId = userId || notes.userId;
        const targetCertId = courseId || notes.certificationId || notes.slug;

        console.log(`[RAZORPAY_WEBHOOK] Processing certificate payment ${eventName}: order=${razorpayOrderId}, payment=${razorpayPaymentId}, verificationId=${verificationId}`);

        // Idempotency Check
        const existingPayment = razorpayPaymentId ? await prisma.certificationPayment.findFirst({
          where: { paymentGatewayPaymentId: razorpayPaymentId, status: 'COMPLETED' }
        }) : null;

        if (existingPayment) {
          console.log(`[RAZORPAY_WEBHOOK] Idempotency notice: Payment ${razorpayPaymentId} already processed.`);
          return NextResponse.json({
            success: true,
            event: eventName,
            idempotent: true,
            message: "Already processed (idempotent)"
          });
        }

        const updateResult = await updateCertificateStatusAtomic({
          verificationId,
          userId: targetUserId,
          certificationId: targetCertId,
          status: 'VALID',
          razorpayOrderId,
          razorpayPaymentId,
          attemptId,
          amount: paymentEntity?.amount ? Math.round(paymentEntity.amount / 100) : 2000
        });

        return NextResponse.json({
          success: true,
          event: eventName,
          certUpdated: (updateResult.updatedCertCount + updateResult.updatedIssuedCount) > 0,
          updateResult,
          message: "Certificate payment processed successfully"
        });
      }
    }

    // ── 5. Handle Reversals / Refunds / Failures ──
    if (eventName === "refund.processed" || eventName === "payment.failed" || eventName === "payment.disputed") {
      const razorpayPaymentId = paymentEntity?.id || event.payload?.refund?.entity?.payment_id;
      const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id;
      const targetUserId = userId || notes.userId;
      const targetCertId = courseId || notes.certificationId || notes.slug;

      if (verificationId) {
        console.log(`[RAZORPAY_WEBHOOK] Reverting certificate status for event ${eventName}: payment=${razorpayPaymentId}`);
        const updateResult = await updateCertificateStatusAtomic({
          verificationId,
          userId: targetUserId,
          certificationId: targetCertId,
          status: 'REFUNDED',
          razorpayOrderId,
          razorpayPaymentId,
          attemptId
        });

        return NextResponse.json({
          success: true,
          event: eventName,
          reverted: true,
          updateResult,
          message: "Certificate status reverted to REFUNDED"
        });
      }
    }

    if (!rzpSubscriptionId) {
      console.log("[RAZORPAY_WEBHOOK] Event processed (no subscription context)");
      return NextResponse.json({ success: true, message: "Event processed" });
    }

    // ── 6. Process Subscription Event Types ──
    switch (eventName) {
      case "subscription.activated": {
        const subscription = await prisma.courseSubscription.findUnique({
          where: { razorpaySubscriptionId: rzpSubscriptionId },
        });

        if (subscription) {
          const nextCharge = new Date();
          nextCharge.setMonth(nextCharge.getMonth() + 1);

          await prisma.courseSubscription.update({
            where: { id: subscription.id },
            data: {
              status: "ACTIVE",
              startedAt: new Date(),
              nextChargeAt: nextCharge,
            },
          });
          console.log(`[RAZORPAY_WEBHOOK] Subscription ${rzpSubscriptionId} marked ACTIVE`);
        }
        break;
      }

      case "subscription.charged": {
        const subscription = await prisma.courseSubscription.findUnique({
          where: { razorpaySubscriptionId: rzpSubscriptionId },
        });

        if (subscription) {
          const nextMonth = subscription.currentMonth + 1;
          const nextCharge = new Date();
          nextCharge.setMonth(nextCharge.getMonth() + 1);

          const isCompleted = nextMonth >= subscription.totalMonths;
          const newStatus = isCompleted ? "COMPLETED" : "ACTIVE";

          await prisma.$transaction(async (tx) => {
            await tx.courseSubscription.update({
              where: { id: subscription.id },
              data: {
                currentMonth: nextMonth,
                nextChargeAt: isCompleted ? null : nextCharge,
                status: newStatus,
              },
            });

            if (paymentEntity?.id) {
              await tx.subscriptionPayment.upsert({
                where: { razorpayPaymentId: paymentEntity.id },
                update: { status: "CAPTURED" },
                create: {
                  subscriptionId: subscription.id,
                  razorpayPaymentId: paymentEntity.id,
                  amount: paymentEntity.amount || subscription.amountPerMonth,
                  status: "CAPTURED",
                  chargedAt: new Date(),
                },
              });
            }

            if (courseId && userId) {
              await tx.enrollment.updateMany({
                where: { userId, courseId },
                data: {
                  status: "active",
                  expiryDate: null,
                },
              });
            }
          });

          console.log(`[RAZORPAY_WEBHOOK] Subscription ${rzpSubscriptionId} charged. Month: ${nextMonth}. Status: ${newStatus}`);
        }
        break;
      }

      case "subscription.pending": {
        const subscription = await prisma.courseSubscription.findUnique({
          where: { razorpaySubscriptionId: rzpSubscriptionId },
        });

        if (subscription) {
          await prisma.courseSubscription.update({
            where: { id: subscription.id },
            data: { status: "PAUSED" },
          });
          console.log(`[RAZORPAY_WEBHOOK] Subscription ${rzpSubscriptionId} set to PAUSED`);
        }
        break;
      }

      case "subscription.halted": {
        const subscription = await prisma.courseSubscription.findUnique({
          where: { razorpaySubscriptionId: rzpSubscriptionId },
          include: { user: true, course: true },
        });

        if (subscription) {
          await prisma.$transaction(async (tx) => {
            await tx.courseSubscription.update({
              where: { id: subscription.id },
              data: { status: "HALTED" },
            });

            await tx.enrollment.updateMany({
              where: { userId: subscription.userId, courseId: subscription.courseId },
              data: { status: "suspended" },
            });

            await tx.notification.create({
              data: {
                userId: subscription.userId,
                title: "Course Access Suspended",
                body: `Your payment for ${subscription.course.title} failed multiple times. Access has been suspended.`,
                type: "ALERT",
                href: "/dashboard/subscriptions",
              },
            });
          });
        }
        break;
      }

      case "subscription.cancelled": {
        const subscription = await prisma.courseSubscription.findUnique({
          where: { razorpaySubscriptionId: rzpSubscriptionId },
        });

        if (subscription) {
          await prisma.$transaction(async (tx) => {
            await tx.courseSubscription.update({
              where: { id: subscription.id },
              data: {
                status: "CANCELLED",
                cancelledAt: new Date(),
              },
            });

            if (subscription.nextChargeAt) {
              await tx.enrollment.updateMany({
                where: { userId: subscription.userId, courseId: subscription.courseId },
                data: {
                  expiryDate: subscription.nextChargeAt,
                },
              });
            } else {
              await tx.enrollment.updateMany({
                where: { userId: subscription.userId, courseId: subscription.courseId },
                data: {
                  status: "suspended",
                },
              });
            }
          });
          console.log(`[RAZORPAY_WEBHOOK] Subscription ${rzpSubscriptionId} CANCELLED.`);
        }
        break;
      }

      default:
        console.log(`[RAZORPAY_WEBHOOK] Event handled: ${eventName}`);
    }

    return NextResponse.json({ success: true, event: eventName });
  } catch (error: any) {
    console.error("[RAZORPAY_WEBHOOK_ERROR_CRITICAL]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
