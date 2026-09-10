export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { message: 'Email is required', canResend: false },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase();

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      // Don't reveal whether user exists for security
      return NextResponse.json(
        { message: 'If an account exists with this email, a verification link has been sent', canResend: true },
        { status: 200 }
      );
    }

    // Check if user is already verified
    if (user.status === 'ACTIVE' && user.emailVerified) {
      return NextResponse.json(
        { message: 'This email is already verified. You can log in.', canResend: false },
        { status: 200 }
      );
    }

    // Check rate limiting - prevent abuse
    // If there's a recent verification token, check if it was sent recently
    if (user.verificationExpires) {
      const now = new Date();
      const tokenExpiry = new Date(user.verificationExpires);
      
      // If token was set to expire in the future and within last 60 seconds
      if (tokenExpiry > now) {
        const timeSinceTokenCreated = now.getTime() - (user.verificationExpires.getTime() - 24 * 60 * 60 * 1000);
        
        if (timeSinceTokenCreated < 60000) { // 60 seconds cooldown
          const secondsRemaining = Math.ceil((60000 - timeSinceTokenCreated) / 1000);
          return NextResponse.json(
            { 
              message: 'Please wait before requesting another verification email', 
              canResend: false,
              cooldownSeconds: secondsRemaining 
            },
            { status: 429 }
          );
        }
      }
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 24); // 24 hours validity

    // Update user with new verification token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken,
        verificationExpires: tokenExpiry,
      },
    });

    // Send verification email
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://sarthi-woad.vercel.app';
      const verifyUrl = `${baseUrl}/verify?token=${verificationToken}`;

      const { sendVerificationEmail } = await import('@/lib/email');

      await sendVerificationEmail(normalizedEmail, verificationToken);
    } catch (emailError) {
      console.error('[Resend Verification] Email sending failed:', emailError);
      // Don't fail the request if email fails - just log it
    }

    return NextResponse.json(
      { 
        message: 'If an account exists with this email, a verification link has been sent',
        canResend: true,
        cooldownSeconds: 60 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Resend Verification] Error:', error);
    return NextResponse.json(
      { message: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}

