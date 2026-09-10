export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ message: 'Verification token is required' }, { status: 400 });
    }

    // Find user with token
    const user = await prisma.user.findFirst({
      where: { verificationToken: token },
    });

    if (!user) {
      return NextResponse.json({ message: 'Invalid or expired verification token' }, { status: 400 });
    }

    if (user.verificationExpires && new Date() > user.verificationExpires) {
      return NextResponse.json({ message: 'Verification token has expired' }, { status: 400 });
    }

    // Activate user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        status: 'ACTIVE',
        verificationToken: null,
        verificationExpires: null,
        emailVerified: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully. You can now log in.',
    });
  } catch (error) {
    console.error('Verification Error:', error);
    return NextResponse.json({ message: 'Something went wrong during verification' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ message: 'Verification token is required' }, { status: 400 });
    }

    // Find user with token
    const user = await prisma.user.findFirst({
      where: { verificationToken: token },
    });

    if (!user) {
      return NextResponse.json({ message: 'Invalid or expired verification token' }, { status: 400 });
    }

    if (user.verificationExpires && new Date() > user.verificationExpires) {
      return NextResponse.json({ message: 'Verification token has expired' }, { status: 400 });
    }

    // Logic Branch: Has password already (Standard Signup) vs Needs password (Admin Invite/Claim)
    if (user.password) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          status: 'ACTIVE',
          verificationToken: null,
          verificationExpires: null,
          emailVerified: new Date(),
        },
      });
      
      // Redirect to login with success message
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('verified', 'true');
      return NextResponse.redirect(loginUrl);
    }

    // If no password, treat as a claimed account that needs password setup
    const passwordSetupToken = randomBytes(32).toString('hex');
    const passwordSetupExpires = new Date(Date.now() + 15 * 60 * 1000); // Increased to 15 minutes

    await prisma.user.update({
      where: { id: user.id },
      data: {
        status: 'EMAIL_VERIFIED', // Intermediate status
        passwordSetupToken,
        passwordSetupExpires,
      },
    });

    // Set cookie and redirect
    const response = NextResponse.redirect(new URL('/create-password', request.url));
    response.cookies.set('tt_password_setup', passwordSetupToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60,
    });

    return response;
  } catch (error) {
    console.error('Verification GET Error:', error);
    return NextResponse.json({ message: 'Something went wrong during verification' }, { status: 500 });
  }
}

