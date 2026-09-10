import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getRazorpayInstance } from "@/lib/razorpay";

export const dynamic = "force-dynamic";

/**
 * POST /api/certifications/paths/[slug]/unlock
 * Initiates Razorpay payment order for certificate activation.
 * Does NOT mark payment COMPLETED until Razorpay webhook or signature verification succeeds.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    
    // Find or create pending certificate for this user and path
    let certificate = await prisma.certificate.findFirst({
      where: {
        userId: user.id,
        courseId: slug
      }
    });

    if (!certificate) {
      const certPrefix = slug === 'fullstack-mastery' 
        ? 'FSWDM' 
        : slug === 'ias-preparation' 
          ? 'UPSC-FS' 
          : slug === 'advanced-excel-certification-exam'
            ? 'AEX-C'
            : 'PY-PRO';
      const year = new Date().getFullYear();
      const count = await prisma.certificate.count({
        where: { certificateNumber: { startsWith: `TT-${certPrefix}-${year}-` } }
      });
      const sequenceStr = String(count + 1).padStart(6, '0');
      const certificateId = `TT-${certPrefix}-${year}-${sequenceStr}`;
      
      certificate = await prisma.certificate.upsert({
        where: { userId_courseId: { userId: user.id, courseId: slug } },
        update: {},
        create: {
          certificateNumber: certificateId,
          certificateId,
          userId: user.id,
          courseId: slug,
          status: 'PENDING_PAYMENT',
          tier: 'pro',
          issuedAt: new Date()
        }
      });
    }

    if (certificate.status === 'VALID') {
      return NextResponse.json({
        success: true,
        alreadyActive: true,
        message: "Certificate is already active."
      });
    }

    const razorpay = getRazorpayInstance();
    if (!razorpay) {
      return NextResponse.json({ success: false, error: "Payment gateway not configured" }, { status: 500 });
    }

    const amountPaise = 2000 * 100; // ₹2000
    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: `rcpt_${certificate.id.substring(0, 15)}_${Date.now()}`,
      notes: {
        userId: user.id,
        certificationId: slug,
        verificationId: certificate.certificateNumber || certificate.id,
        type: 'certificate_activation'
      }
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
      certificateId: certificate.certificateNumber || certificate.id,
      user: {
        name: user.name || 'Student',
        email: user.email,
        phone: user.phone || ''
      }
    });

  } catch (error: any) {
    console.error("Create certificate unlock order error:", error);
    return NextResponse.json({ success: false, error: error.message || "Internal server error" }, { status: 500 });
  }
}
