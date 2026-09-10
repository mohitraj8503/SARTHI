export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { withResiliency } from '@/lib/resilient-db';
import { createSession } from '@/lib/auth/session';
import { signJWT } from '@/lib/auth/jwt';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { name, email, phone, city, profession, referralSource, certificationId } = data;

    if (!email || !name || !certificationId) {
      return NextResponse.json(
        { error: 'Name, email, and certification ID are required' },
        { status: 400 }
      );
    }

    // Process User with Resiliency
    let userRes = await withResiliency(
      () => prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      }),
      `user-${email.toLowerCase()}`
    );
    
    let activeUser = userRes.data;
    
    if (!activeUser) {
      // Auto-register Guest Account with Resiliency
      try {
        const createRes = await withResiliency(
          () => prisma.user.create({
            data: {
              email: email.toLowerCase(),
              name: name,
              phone: phone || null,
              location: city || null,
              headline: profession || null,
              role: 'STUDENT',
              status: 'GUEST',
            }
          }),
          `create-guest-${email.toLowerCase()}`
        );
        activeUser = createRes.data;
      } catch (err) {
        return NextResponse.json(
          { error: 'Unable to create guest account right now. Please try again.' },
          { status: 503 }
        );
      }
    }

    if (!activeUser) {
      return NextResponse.json(
        { error: 'Unable to create guest account right now. Please try again.' },
        { status: 503 }
      );
    }

    // CREATE SESSION COOKIES TO LOG IN THE USER SEAMLESSLY
    // Same login logic as api/auth/login
    
    // Create JWT
    const session = await createSession(
      activeUser.id,
      activeUser.role,
      activeUser.email,
      activeUser.name ?? undefined
    );
    const token = await signJWT({
      userId: activeUser.id,
      role: activeUser.role,
      sessionId: session.id,
      email: activeUser.email,
      name: activeUser.name ?? undefined,
    });

    const userSessionData = {
      id: activeUser.id,
      email: activeUser.email,
      name: activeUser.name,
      role: activeUser.role,
      status: activeUser.status,
      image: activeUser.image
    };

    const cookieStore = await cookies();
    cookieStore.set('tt_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60, // 1 hour
    });

    return NextResponse.json({
      success: true,
      user: userSessionData,
      message: 'Guest registered and logged in securely.'
    });

  } catch (error: any) {
    console.error('Guest registration error:', error);
    return NextResponse.json(
      { error: `Database Connection Failure: ${error.message}. Please use the 'Safety Link' or try again.` },
      { status: 500 }
    );
  }
}

