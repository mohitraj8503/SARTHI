export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signupSchema } from '@/lib/validators/auth';
import { createSession } from '@/lib/auth/session';
import { signJWT } from '@/lib/auth/jwt';
import { hash } from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate password using signup schema
    const validationResult = signupSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { message: 'Invalid password', errors: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    
    const { password } = validationResult.data;
    
    // Get token from cookie
    const cookieStore = request.cookies;
    const setupToken = cookieStore.get('tt_password_setup')?.value;
    
    if (!setupToken) {
      return NextResponse.json(
        { message: 'Password setup token is required' },
        { status: 400 }
      );
    }
    
    // Find user with matching token that hasn't expired
    const user = await prisma.user.findFirst({
      where: {
        passwordSetupToken: setupToken,
        passwordSetupExpires: {
          gt: new Date()
        }
      }
    });
    
    if (!user) {
      return NextResponse.json(
        { message: 'Invalid or expired password setup token' },
        { status: 400 }
      );
    }
    
    // Hash password
    const hashedPassword = await hash(password, 12);
    
    // Update user: set password, status to ACTIVE, clear tokens, set emailVerified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        status: 'ACTIVE',
        verificationToken: null,
        verificationExpires: null,
        passwordSetupToken: null,
        passwordSetupExpires: null,
        emailVerified: user.emailVerified || new Date(), // Keep existing or set to now
      }
    });
    
    // Create session
    const session = await createSession(
      user.id,
      user.role,
      user.email,
      user.name ?? undefined
    );
    const token = await signJWT({
      userId: user.id,
      role: user.role,
      sessionId: session.id,
    });
    
    // Prepare response
    const response = NextResponse.json({
      success: true,
      message: 'Password set successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status
      }
    });
    
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    };
    response.cookies.set('tt_session', token, cookieOptions);

    // Clear the password setup cookie
    response.cookies.set('tt_password_setup', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });
    
    return response;
  } catch (error) {
    console.error('Create Password Error:', error);
    return NextResponse.json(
      { message: 'Something went wrong while setting password' },
      { status: 500 }
    );
  }
}

