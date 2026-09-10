export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { resetPasswordSchema } from "@/lib/validators/auth";
import bcrypt from "bcryptjs";

/**
 * POST /api/auth/reset-password
 *
 * Validates the reset token and updates the user's password in the database.
 */
export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const rateLimitResult = await checkRateLimit(
      `reset-password:${clientIp}`,
      5,
      60 * 60
    );

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { message: "Too many password reset attempts. Please try again later." },
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
    
    // We expect both password and token (passed from the client)
    const validationResult = resetPasswordSchema.extend({
      token: require('zod').z.string()
    }).safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { message: "Invalid input", details: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { password, token } = (validationResult.data as any);

    // Find user by reset token
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpires: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid or expired reset token. Please request a new one." },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user and clear token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null,
        // If account was pending/suspended, reset for security?
        // Usually better to keep status as is unless it was specifically blocked.
      }
    });

    return NextResponse.json({ message: "Password updated successfully. You can now log in." });
  } catch (error) {
    console.error("[reset-password] Error:", error);
    return NextResponse.json(
      { message: "An error occurred. Please try again later." },
      { status: 500 }
    );
  }
}

