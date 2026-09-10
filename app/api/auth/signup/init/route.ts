export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendVerificationEmail } from "@/lib/email";
import { randomBytes } from "crypto";
import { z } from "zod";

const signupInitSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name too long")
    .trim(),
  email: z.string()
    .email("Invalid email format")
    .toLowerCase()
    .trim()
    .max(255, "Email too long"),
});

export async function POST(request: NextRequest) {
  try {
    const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const rateLimitResult = await checkRateLimit(`signup-init:${clientIp}`, 5, 60 * 60);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many signup attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": String(Math.ceil((rateLimitResult.reset - Date.now()) / 1000)) } }
      );
    }

    const body = await request.json();

    const validationResult = signupInitSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email } = validationResult.data;
    const normalizedEmail = email.toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      if (existingUser.password) {
        return NextResponse.json(
          { error: "Account already exists, please sign in" },
          { status: 409 }
        );
      }

      const verificationToken = randomBytes(32).toString("hex");
      const verificationExpires = new Date(Date.now() + 15 * 60 * 1000);

      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          name,
          verificationToken,
          verificationExpires,
        },
      });

      await sendVerificationEmail(existingUser.email, verificationToken);

      return NextResponse.json({
        success: true,
        message: "Check your email to verify your account",
      });
    }

    const verificationToken = randomBytes(32).toString("hex");
    const verificationExpires = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        role: "STUDENT",
        status: "PENDING",
        onboarded: false,
        verificationToken,
        verificationExpires,
      },
    });

    await sendVerificationEmail(normalizedEmail, verificationToken);

    return NextResponse.json({
      success: true,
      message: "Check your email to verify your account",
    });
  } catch (error) {
    console.error("[SignupInit] Error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}

