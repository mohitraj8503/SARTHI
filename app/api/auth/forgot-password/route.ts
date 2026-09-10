export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { forgotPasswordSchema } from "@/lib/validators/auth";
import crypto from "crypto";
import { sendEmail, templates } from "@/lib/email";

/**
 * POST /api/auth/forgot-password
 *
 * Uses native database tokens to handle password resets.
 */
export async function POST(req: NextRequest) {
  try {
    // Rate limiting: 3 requests per hour per IP
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const rateLimitResult = await checkRateLimit(
      `forgot-password:${clientIp}`,
      3,
      60 * 60
    );

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          message:
            "Too many password reset requests. Please try again later.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(
              Math.ceil((rateLimitResult.reset - Date.now()) / 1000)
            ),
          },
        }
      );
    }

    const body = await req.json();

    // Validate input
    const validationResult = forgotPasswordSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { message: "Invalid email format" },
        { status: 400 }
      );
    }

    const { email } = validationResult.data;
    const normalizedEmail = email.toLowerCase();

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (user) {
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour

      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken,
          resetTokenExpires,
        },
      });

      // Send email
      const resetUrl = `${
        process.env.NEXT_PUBLIC_APP_URL || "https://sarthi-woad.vercel.app"
      }/auth/reset-password?token=${resetToken}`;

      await sendEmail({
        to: normalizedEmail,
        ...templates.passwordReset(resetUrl),
      });
    }

    // Always return success to prevent user enumeration
    return NextResponse.json({
      message: "If an account exists, a reset email has been sent.",
    });
  } catch (error) {
    console.error("[forgot-password] Error:", error);
    return NextResponse.json(
      { message: "An error occurred. Please try again later." },
      { status: 500 }
    );
  }
}

