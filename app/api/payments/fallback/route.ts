export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { createPaymentLink } from "@/lib/razorpay";
import { createSession } from "@/lib/auth/session";
import { signJWT } from "@/lib/auth/jwt";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const STATIC_RAZORPAY_FALLBACK = "https://razorpay.me/@sarthi";

export async function POST(req: NextRequest) {
  try {
    let user = await getCurrentUser();
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    const {
      courseId,
      isGroup,
      members,
      couponCode,
      validatedCouponToken,
      newPrice,
      guestName,
      guestEmail
    } = body;

    if (!courseId) {
      return NextResponse.json({ error: "Course ID required" }, { status: 400 });
    }

    let responseCookies: any = null;

    // 1. Resolve User (Authenticated vs Guest)
    if (!user) {
      const emailToUse = (members && members[0]?.email) || guestEmail;
      const nameToUse = (members && members[0]?.name) || guestName;

      if (emailToUse) {
        const cleanEmail = emailToUse.toLowerCase().trim();
        let targetUser = await prisma.user.findUnique({ where: { email: cleanEmail } });

        if (!targetUser) {
          const tempPassword = `TT-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
          const hashedPassword = await bcrypt.hash(tempPassword, 12);
          targetUser = await prisma.user.create({
            data: {
              email: cleanEmail,
              name: nameToUse || cleanEmail.split('@')[0],
              password: hashedPassword,
              tempPassword,
              requiresPasswordChange: true,
              role: "STUDENT",
              status: "ACTIVE",
              onboarded: true,
            }
          });
        }

        user = targetUser;

        const session = await createSession(user.id, user.role, user.email, user.name);
        const token = await signJWT({
          userId: user.id,
          role: user.role,
          sessionId: session.id,
          email: user.email,
          name: user.name
        });

        responseCookies = { token };
      }
    }

    if (!user) {
      return NextResponse.json({ error: "User authentication required" }, { status: 401 });
    }

    // 2. Fetch Course & Authoritative Pricing
    let course = await prisma.course.findFirst({
      where: {
        OR: [{ id: courseId }, { slug: courseId }]
      }
    });

    if (!course && courseId === "summer-camp-2026") {
      course = {
        id: "summer-camp-2026",
        title: isGroup ? "SARTHI Summer Camp 2026 (Group)" : "SARTHI Summer Camp 2026",
        price: isGroup ? 2500 : 11,
      } as any;
    }

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    let calculatedAmount = Number(course.price);
    if (courseId === "summer-camp-2026" && isGroup) {
      calculatedAmount = 2500;
    }

    // Coupon verification
    if (couponCode && validatedCouponToken && newPrice) {
      const secret = process.env.NEXTAUTH_SECRET || "fallback-secret-123";
      const expectedToken = crypto
        .createHmac("sha256", secret)
        .update(`${courseId}:${couponCode}:${newPrice}`)
        .digest("hex");

      if (expectedToken === validatedCouponToken) {
        calculatedAmount = Number(newPrice);
      }
    }

    if (isNaN(calculatedAmount) || calculatedAmount <= 0) {
      return NextResponse.json({ error: "Invalid payable amount" }, { status: 400 });
    }

    // 3. Generate Safe Merchant Reference ID
    const internalReferenceId = `TT-ORDER-${Date.now()}-${user.id.substring(0, 5)}`;
    const origin = req.nextUrl.origin || "https://sarthi-woad.vercel.app";
    const callbackUrl = `${origin}/checkout/${courseId}/success?orderId=${internalReferenceId}`;

    // 4. Persist Local Pending Transaction Record
    try {
      await prisma.transaction.create({
        data: {
          userId: user.id,
          courseId: course.id,
          amount: calculatedAmount,
          currency: "INR",
          status: "PENDING",
          razorpayOrderId: internalReferenceId,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
    } catch (dbErr) {
      console.error("[FALLBACK_PAYMENT_DB_LOG_ERROR]", dbErr);
    }

    // 5. Attempt Generating Unique Razorpay Payment Link
    let paymentUrl = STATIC_RAZORPAY_FALLBACK;
    let paymentLinkId: string | null = null;
    let fallbackMode: "payment_link" | "static_profile" = "static_profile";

    try {
      const paymentLink = await createPaymentLink({
        amount: calculatedAmount,
        currency: "INR",
        referenceId: internalReferenceId,
        description: `Enrollment: ${course.title}`,
        customer: {
          name: user.name || "Student",
          email: user.email || "student@sarthi-woad.vercel.app",
        },
        notes: {
          internalReferenceId,
          courseId: course.id,
          userId: user.id,
          userEmail: user.email || "",
          courseTitle: course.title,
          isGroup: isGroup ? "true" : "false",
          referralCoupon: couponCode || ""
        },
        callbackUrl,
        expireByMinutes: 1440 // 24 hours
      });

      if (paymentLink && (paymentLink.short_url || paymentLink.url)) {
        paymentUrl = paymentLink.short_url || paymentLink.url;
        paymentLinkId = paymentLink.id;
        fallbackMode = "payment_link";

        // Update transaction with provider payment link id
        await prisma.transaction.updateMany({
          where: { razorpayOrderId: internalReferenceId },
          data: {
            razorpayOrderId: paymentLinkId,
            updatedAt: new Date()
          }
        });
      }
    } catch (rzpErr: any) {
      console.warn("[FALLBACK_PAYMENT_LINK_API_UNAVAILABLE] Using static profile fallback:", rzpErr?.message || rzpErr);
      paymentUrl = STATIC_RAZORPAY_FALLBACK;
      fallbackMode = "static_profile";
    }

    const response = NextResponse.json({
      success: true,
      paymentUrl,
      paymentLinkId,
      internalReferenceId,
      amount: calculatedAmount,
      currency: "INR",
      mode: fallbackMode,
      status: "pending",
      message: fallbackMode === "payment_link" 
        ? "Unique payment link generated successfully" 
        : "Standard checkout unavailable. You can complete payment using our verified payment page."
    });

    if (responseCookies?.token) {
      response.cookies.set("token", responseCookies.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 24 * 60 * 60,
      });
    }

    return response;
  } catch (error: any) {
    console.error("[PAYMENTS_FALLBACK_API_ERROR]", error);
    return NextResponse.json({
      error: "Unable to generate payment fallback at this moment."
    }, { status: 500 });
  }
}
