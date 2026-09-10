export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createSession } from '@/lib/auth/session';
import { generateEnrollmentNumber } from '@/lib/enrollment';
import { ensureStudentId } from '@/lib/student-id';
import { signJWT } from '@/lib/auth/jwt';
import { determineRole } from '@/lib/auth';
import { publishStudentRegistered, logActivity } from '@/lib/events';
import { checkRateLimit } from '@/lib/rate-limit';
import { signupSchema } from '@/lib/validators/auth';
import { createAdminNotification } from '@/lib/admin/notifications';
import { sendVerificationEmail } from '@/lib/email';
import { randomBytes } from 'crypto';
import { generateUniqueReferralCode, validateReferral, processReferralRewards } from '@/lib/referrals';
import { withResiliency } from '@/lib/resilient-db';
import fs from 'fs';
import path from 'path';

function processAmbassadorReferral(code: string) {
  try {
    const dbPath = path.join(process.cwd(), 'lib/data/ambassador-applications.json');
    if (!fs.existsSync(dbPath)) return;
    const data = fs.readFileSync(dbPath, 'utf8');
    const applications = JSON.parse(data || '[]');
    
    const index = applications.findIndex(
      (app: any) => app.referralCode && app.referralCode.toUpperCase() === code.toUpperCase()
    );
    
    if (index !== -1 && applications[index].status === 'APPROVED') {
      const currentCount = applications[index].registrationsCount || 0;
      const nextCount = currentCount + 1;
      applications[index].registrationsCount = nextCount;
      if (nextCount >= 100) {
        applications[index].taskStatus = 'COMPLETED';
      }
      fs.writeFileSync(dbPath, JSON.stringify(applications, null, 2), 'utf8');
      console.log(`[Ambassador Referral Tracked] Code: ${code}, New Count: ${nextCount}`);
    }
  } catch (err) {
    console.error('Error tracking ambassador referral:', err);
  }
}

export async function POST(request: NextRequest) {
  // Critical Safeguard: Check for JWT_SECRET early
  if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32)) {
    console.error('❌ CRITICAL: JWT_SECRET is missing or too short in production!');
    return NextResponse.json({ 
      error: 'Registration system is misconfigured. Please contact support.' 
    }, { status: 500 });
  }

  let fallbackBody: { name?: string; email?: string } | null = null;
  try {
    // Rate limiting: 3 signups per hour per IP
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rateLimitResult = await checkRateLimit(`signup:${clientIp}`, 3, 60 * 60);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many signup attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rateLimitResult.reset - Date.now()) / 1000)) } }
      );
    }

    const body = await request.json();
    fallbackBody = body;

    // Validate input with Zod
    const validationResult = signupSchema.safeParse(body);
    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0]?.message || 'Invalid input';
      return NextResponse.json(
        { error: firstError, details: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, password, referralCode } = validationResult.data;
    const normalizedEmail = email.toLowerCase();
    const hashedPassword = await bcrypt.hash(password, 12);

    const devAuthFallbackEnabled =
      process.env.NODE_ENV === 'development' &&
      process.env.DEV_AUTH_FALLBACK === '1' &&
      process.env.ALLOW_DEV_AUTH_FALLBACK === '1';
    if (devAuthFallbackEnabled) {
      const fallbackUser = {
        id: `dev-student-${Date.now()}`,
        email: normalizedEmail,
        name: name || 'Student',
        role: 'STUDENT',
        status: 'ACTIVE',
        onboarded: false,
      };

      const token = await signJWT({
        userId: fallbackUser.id,
        role: fallbackUser.role,
        sessionId: `dev-session-${Date.now()}`,
      });

      const response = NextResponse.json({
        success: true,
        message: 'Development fallback signup successful.',
        user: fallbackUser,
      });

      response.cookies.set('tt_session', token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24,
        path: '/',
      });

      return response;
    }

    // Check if user exists with resiliency
    const userLookupRes = await withResiliency(
      () => prisma.user.findUnique({
        where: { email: normalizedEmail },
      }),
      `signup_lookup_${normalizedEmail}`
    );

    if (!userLookupRes.success) {
      return NextResponse.json({ 
        error: 'Database is temporarily busy. Please try again in a few seconds.' 
      }, { status: 503 });
    }

    const existingUser = userLookupRes.data;

    let user;
    let statusMessage = 'Registration successful. Please check your email to verify your account.';
    let isLinkingGoogle = false;

    if (existingUser) {
      // If the user already has a password, they already have a local account. 
      if (existingUser.password) {
        return NextResponse.json(
          { error: 'You already have an account with this identity. Please sign in instead.' }, 
          { status: 409 }
        );
      }

      // If they don't have a password but DO have an authProvider (e.g. Google), 
      // we link this new password to their existing OAuth account.
      if (existingUser.authProvider) {
        isLinkingGoogle = true;
      }

      user = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          name: name || existingUser.name,
          password: hashedPassword,
          status: 'ACTIVE',
        },
      });
      statusMessage = isLinkingGoogle 
        ? 'Password successfully linked to your existing Google account.'
        : 'Account verified and password set successfully. Welcome back!';
    } else {
      const verificationToken = randomBytes(32).toString('hex');
      const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      const role = determineRole(normalizedEmail);
      
      user = await prisma.user.create({
        data: {
          name,
          email: normalizedEmail,
          password: hashedPassword,
          role: role,
          status: 'ACTIVE', 
          onboarded: false,
          verificationToken,
          verificationExpires,
          referralCode: await generateUniqueReferralCode(),
          referredById: referralCode ? await validateReferral(referralCode) : null,
          // Automatically create Teacher record for teacher signups
          ...(role === 'TEACHER' ? {
            teacher: {
              create: {
                title: 'Instructor',
                status: 'pending',
                canCreateCourses: false
              }
            }
          } : {})
        },
      });
      // Send verification email
      await sendVerificationEmail(user.email, verificationToken);
    }

    if (referralCode) {
      processAmbassadorReferral(referralCode);
    }

    // Assign enrollment number (non-blocking)
    // Assign enrollment number (non-blocking)
    // Assign strictly sequential Student ID (CRITICAL)
    if (user.role === 'STUDENT' && !user.studentId) {
      try {
        await ensureStudentId(user.id);
      } catch (e) {
        console.error('Failed to generate sequential Student ID:', e);
      }
    }

    return NextResponse.json({ success: true, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error: any) {
    console.error('[SIGNUP_POST]', error);
    return NextResponse.json({ error: error.message || 'Signup failed' }, { status: 500 });
  }
}
