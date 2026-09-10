export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import Razorpay from "razorpay";
import fs from "fs";
import path from "path";
import { createSession } from '@/lib/auth/session';
import { signJWT } from '@/lib/auth/jwt';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Diagnostic logger
const logError = (msg: string, err: any) => {
  const logMsg = `\n[${new Date().toISOString()}] ${msg}\n${JSON.stringify(err, Object.getOwnPropertyNames(err), 2)}\n`;
  console.error(msg, err);
  try {
    fs.appendFileSync(path.join(process.cwd(), "payment_debug.log"), logMsg);
  } catch (e) {}
};

export async function POST(req: NextRequest) {
  try {
    let user = await getCurrentUser();
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { courseId, isGroup, members, validatedCouponToken, couponCode, newPrice } = body;
    if (!courseId) {
      return NextResponse.json({ error: "Course ID required" }, { status: 400 });
    }

    let responseCookies: any = null;

    // Guest checkout authentication protocol
    if (!user) {
      if (courseId === 'summer-camp-2026' && isGroup && members && members[0]?.email) {
        const leaderEmail = members[0].email.toLowerCase();
        let leaderUser = await prisma.user.findUnique({ where: { email: leaderEmail } });

        if (!leaderUser) {
          const tempPassword = `TT-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
          const hashedPassword = await bcrypt.hash(tempPassword, 12);
          leaderUser = await prisma.user.create({
            data: {
              email: leaderEmail,
              name: members[0].name || members[0].email.split('@')[0],
              password: hashedPassword,
              tempPassword,
              requiresPasswordChange: true,
              role: 'STUDENT',
              status: 'ACTIVE',
              onboarded: true,
            }
          });
        }
        
        user = leaderUser;

        // Auto-login session creation
        const session = await createSession(user.id, user.role, user.email, user.name);
        const token = await signJWT({
          userId: user.id,
          role: user.role,
          sessionId: session.id,
          email: user.email,
          name: user.name
        });

        responseCookies = { token };
      } else if (body.guestEmail && body.guestName) {
        const guestEmail = body.guestEmail.toLowerCase();
        let guestUser = await prisma.user.findUnique({ where: { email: guestEmail } });

        if (!guestUser) {
          const tempPassword = `TT-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
          const hashedPassword = await bcrypt.hash(tempPassword, 12);
          guestUser = await prisma.user.create({
            data: {
              email: guestEmail,
              name: body.guestName,
              password: hashedPassword,
              tempPassword,
              requiresPasswordChange: true,
              role: 'STUDENT',
              status: 'ACTIVE',
              onboarded: true,
            }
          });
        }
        
        user = guestUser;

        // Auto-login session creation
        const session = await createSession(user.id, user.role, user.email, user.name);
        const token = await signJWT({
          userId: user.id,
          role: user.role,
          sessionId: session.id,
          email: user.email,
          name: user.name
        });

        responseCookies = { token };
      } else {
        return NextResponse.json({ error: "Please login to purchase" }, { status: 401 });
      }
    }

    if (!user) {
      return NextResponse.json({ error: "Please login to purchase" }, { status: 401 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID?.trim();
    const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

    if (!keyId || !keySecret) {
      logError("RAZORPAY_KEYS_MISSING", { keyId: !!keyId, keySecret: !!keySecret });
      return NextResponse.json({
        code: "PAYMENT_GATEWAY_UNAVAILABLE",
        status: "PAYMENT_GATEWAY_UNAVAILABLE",
        error: "Online payment is temporarily unavailable.",
        userMessage: "We're currently unable to process online payments for this enrollment. Your payment has not been charged."
      }, { status: 503 });
    }

    // Fetch Course
    let course = await prisma.course.findFirst({
      where: {
        OR: [
          { id: courseId },
          { slug: courseId }
        ]
      },
      include: {
        enrollments: { where: { userId: user.id }, take: 1 }
      }
    });

    // Fallback for Summer Camp
    if (!course && courseId === 'summer-camp-2026') {
      course = {
        id: 'summer-camp-2026',
        title: isGroup ? 'SARTHI Summer Camp 2026 (Group Registration - 5 Members)' : 'SARTHI Summer Camp 2026',
        price: isGroup ? 2500 : 11,
        enrollments: []
      } as any;
    }

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    let amount = Number(course.price);
    if (courseId === 'summer-camp-2026' && isGroup) {
      amount = 2500;
    }

    if (couponCode && validatedCouponToken && newPrice) {
      const secret = process.env.NEXTAUTH_SECRET || 'fallback-secret-123';
      const expectedToken = crypto
        .createHmac('sha256', secret)
        .update(`${courseId}:${couponCode}:${newPrice}`)
        .digest('hex');

      if (expectedToken !== validatedCouponToken) {
        return NextResponse.json({ error: "Security alert: Coupon token verification failed. Price tampering detected." }, { status: 400 });
      }
      amount = Number(newPrice);
    }

    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid course price" }, { status: 400 });
    }

    // Initialize Razorpay with error checking
    let razorpay;
    try {
      razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret
      });
    } catch (initErr) {
      logError("RAZORPAY_INIT_FAILED", initErr);
      return NextResponse.json({ error: "Failed to initialize payment gateway" }, { status: 500 });
    }

    // Create Order
    let order;
    try {
      // Razorpay expects integer amount in paise
      const orderOptions = {
        amount: Math.round(amount * 100),
        currency: "INR",
        receipt: `rcpt_${courseId}_${user.id}_${Date.now()}`.substring(0, 40),
        notes: {
          courseId: courseId,
          userId: user.id,
          userEmail: user.email || "no-email@sarthi.live",
          courseTitle: course.title,
          segment: "MAIN",
          productType: "MAIN_COURSE",
          type: isGroup ? 'SUMMER_CAMP_GROUP_PURCHASE' : 'SUMMER_CAMP_PURCHASE'
        }
      };

      order = await razorpay.orders.create(orderOptions);
    } catch (rzpError: any) {
      logError("RAZORPAY_ORDER_CREATE_FAILED", rzpError);
      
      return NextResponse.json({ 
        code: "PAYMENT_GATEWAY_UNAVAILABLE",
        status: "PAYMENT_GATEWAY_UNAVAILABLE",
        error: "Online payment is temporarily unavailable.",
        userMessage: "We're currently unable to process online payments for this enrollment. Your payment has not been charged."
      }, { status: 503 });
    }

    if (!order || !order.id) {
      logError("RAZORPAY_INVALID_RESPONSE", order);
      return NextResponse.json({ error: "Invalid response from Razorpay" }, { status: 500 });
    }

    // Save/Update Transaction in DB
    try {
      await prisma.transaction.upsert({
        where: { razorpayOrderId: order.id },
        update: {
          status: "pending",
          updatedAt: new Date()
        },
        create: {
          userId: user.id,
          courseId: course.id,
          amount: amount,
          currency: "INR",
          status: "pending",
          razorpayOrderId: order.id,
        }
      });
    } catch (dbError) {
      logError("DB_RECORD_FAILED", dbError);
    }

    const response = NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: keyId,
      courseTitle: course.title
    });

    // Set the cookie if auto-logged in via guest checkout
    if (responseCookies) {
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      };
      response.cookies.set('tt_session', responseCookies.token, cookieOptions);
    }

    return response;

  } catch (criticalError: any) {
    logError("ROOT_CRITICAL_PAYMENT_ERROR", criticalError);
    return NextResponse.json({ 
      error: "Internal Server Error", 
      message: criticalError.message 
    }, { status: 500 });
  }
}
