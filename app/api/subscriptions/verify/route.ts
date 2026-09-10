export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import crypto from "crypto";
import { sendTransactionalEmail } from "@/lib/email/send";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature,
      courseId,
    } = body;

    if (!razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature || !courseId) {
      return NextResponse.json({ error: "Missing required verification parameters" }, { status: 400 });
    }

    console.log(`[SUBSCRIPTION_VERIFY] Verifying subscription: ${razorpay_subscription_id}, payment: ${razorpay_payment_id}`);

    // 1. Verify Razorpay Subscription Signature
    const secret = process.env.RAZORPAY_KEY_SECRET!;
    const text = razorpay_payment_id + "|" + razorpay_subscription_id;
    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(text)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      console.error("[SUBSCRIPTION_VERIFY] Signature mismatch");
      return NextResponse.json({ error: "Invalid subscription payment signature" }, { status: 400 });
    }

    // 2. Perform DB Updates inside a Transaction
    const result = await prisma.$transaction(async (tx) => {
      // Find course
      let course = await tx.course.findFirst({
        where: {
          OR: [
            { id: courseId },
            { slug: courseId }
          ]
        }
      });

      if (!course) {
        throw new Error("Course not found in database");
      }

      // Find local subscription record
      const subscription = await tx.courseSubscription.findUnique({
        where: { razorpaySubscriptionId: razorpay_subscription_id },
      });

      if (!subscription) {
        throw new Error("Subscription record not found");
      }

      // Compute dates
      const now = new Date();
      const nextCharge = new Date();
      nextCharge.setMonth(nextCharge.getMonth() + 1);

      // Update Subscription Status to ACTIVE
      const updatedSubscription = await tx.courseSubscription.update({
        where: { id: subscription.id },
        data: {
          status: "ACTIVE",
          currentMonth: 1, // First month paid
          startedAt: now,
          nextChargeAt: nextCharge,
        },
      });

      // Log first payment in SubscriptionPayment
      await tx.subscriptionPayment.upsert({
        where: { razorpayPaymentId: razorpay_payment_id },
        update: {
          status: "CAPTURED",
        },
        create: {
          subscriptionId: subscription.id,
          razorpayPaymentId: razorpay_payment_id,
          amount: subscription.amountPerMonth,
          status: "CAPTURED",
          chargedAt: now,
        },
      });

      // Check if user is already enrolled
      const existingEnrollment = await tx.enrollment.findFirst({
        where: { userId: user.id, courseId: course.id }
      });

      let enrollment = existingEnrollment;
      if (!enrollment) {
        const enrollmentCode = `TT-SUB-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
        enrollment = await tx.enrollment.create({
          data: {
            userId: user.id,
            courseId: course.id,
            status: "active",
            progressPercentage: 0,
            enrollmentCode,
            enrollmentNo: Math.floor(1000 + Math.random() * 9000),
            paymentId: razorpay_payment_id
          }
        });

        await tx.notification.create({
          data: {
            userId: user.id,
            title: "Subscription Activated!",
            body: `Welcome to ${course.title}! Your monthly recurring subscription is now active.`,
            type: "ENROLLMENT_SUCCESS",
            href: `/courses/${course.id}/learn`
          }
        });
      }

      return { subscription: updatedSubscription, course, enrollment };
    });

    // 3. Dispatch welcome email
    try {
      const origin = req.nextUrl.origin || "https://sarthi.live";
      const emailHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #030712; color: #f3f4f6; border-radius: 12px; border: 1px solid #1f2937;">
          <h2 style="color: #FBBF24; text-align: center;">Subscription Activated</h2>
          <p>Hello <strong>${user.name || "Innovator"}</strong>,</p>
          <p>Your subscription to <strong>${result.course.title}</strong> is now active!</p>
          <p>An auto-debit has been successfully set up via Razorpay.</p>
          <div style="background-color: #0f172a; padding: 20px; border-radius: 8px; border: 1px solid #1e293b; margin: 20px 0;">
            <h3 style="color: #FBBF24; margin-top: 0;">Subscription Summary</h3>
            <p style="margin: 5px 0;"><strong>Amount:</strong> ₹${(result.subscription.amountPerMonth / 100).toLocaleString('en-IN')}/month</p>
            <p style="margin: 5px 0;"><strong>Billing cycle:</strong> Monthly for ${result.subscription.totalMonths} months</p>
            <p style="margin: 5px 0;"><strong>Next billing date:</strong> ${result.subscription.nextChargeAt?.toLocaleDateString()}</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${origin}/courses/${result.course.id}/learn" style="background-color: #FBBF24; color: #020617; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; text-transform: uppercase;">Go to Course</a>
          </div>
          <p style="border-top: 1px solid #1f2937; padding-top: 15px; font-size: 12px; color: #6b7280; text-align: center;">
            Payments processed securely by Razorpay.
          </p>
        </div>
      `;

      await sendTransactionalEmail({
        to: user.email,
        subject: `Welcome to ${result.course.title} — Subscription Activated!`,
        html: emailHtml,
        type: 'enrollment'
      });
    } catch (emailErr) {
      console.error("[SUBSCRIPTION_VERIFY_EMAIL_ERROR]", emailErr);
    }

    return NextResponse.json({
      success: true,
      message: "Subscription verified successfully",
      enrollmentId: result.enrollment.enrollmentCode || result.enrollment.id,
    });
  } catch (error: any) {
    console.error("[SUBSCRIPTION_VERIFY_ERROR]", error);
    return NextResponse.json({ error: error.message || "Verification failed." }, { status: 500 });
  }
}
