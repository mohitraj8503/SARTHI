export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createSession } from '@/lib/auth/session';
import { signJWT } from '@/lib/auth/jwt';
import { checkRateLimit } from '@/lib/rate-limit';
import { loginSchema } from '@/lib/validators/auth';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 login attempts per 15 minutes per IP
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rateLimitResult = await checkRateLimit(`login:${clientIp}`, 5, 15 * 60);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rateLimitResult.reset - Date.now()) / 1000)) } }
      );
    }

    const body = await request.json();

    // Validate input with Zod
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data;
    const normalizedEmail = email.toLowerCase();

    let user;
    try {
      user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });
    } catch (dbError) {
      return NextResponse.json({ error: 'Service temporarily unavailable. Please try again later.' }, { status: 503 });
    }

    if (!user || !user.password) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      try {
        await prisma.securityEvent.create({
          data: {
            userId: user.id,
            type: 'LOGIN_FAILURE',
            description: 'Invalid password attempt',
          },
        });
      } catch (e) {}

      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Handle account status
    if (user.status === 'BANNED' || user.status === 'SUSPENDED') {
      return NextResponse.json({ error: 'Account is not active. Please contact support.' }, { status: 403 });
    }

    // Update login count (non-blocking)
    prisma.user.update({
      where: { id: user.id },
      data: { loginCount: { increment: 1 } },
    }).catch(() => {});

    // Create session and JWT
    const session = await createSession(user.id, user.role, user.email, user.name);
    const token = await signJWT({
      userId: user.id,
      role: user.role,
      sessionId: session.id,
    });

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name, role: user.role, onboarded: user.onboarded },
    });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    };

    response.cookies.set('tt_session', token, cookieOptions);

    return response;
  } catch (error) {
    return NextResponse.json({
      error: 'An unexpected error occurred. Please try again later.'
    }, { status: 500 });
  }
}

