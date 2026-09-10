export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { signJWT } from '@/lib/auth/jwt';


export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ 
        error: 'Session invalid or user record missing. Please log out and sign up again.' 
      }, { status: 401 });
    }

    const body = await request.json();
    const { 
      name, 
      phone, 
      college, 
      location, 
      currentCourse, 
      lastQualification, 
      currentStatus, 
      personalization, 
      educationLevel, 
      platformSegment,
      isPartial = false 
    } = body;

    // Validate essential fields ONLY if NOT partial
    const finalPhone = phone || user.phone;
    
    if (!isPartial) {
      if (!finalPhone || !college || !currentCourse || !lastQualification) {
        return NextResponse.json({ 
          error: 'Missing required profile information.',
          details: {
              phone: !finalPhone,
              college: !college,
              currentCourse: !currentCourse,
              lastQualification: !lastQualification
          }
        }, { status: 400 });
      }
    }

    // Determine segment authoritatively using centralized classification engine
    // Client-provided platformSegment is completely ignored to prevent tampering.
    const { determinePlatformSegment } = await import('@/lib/segment/classification');
    const calculatedSegment = determinePlatformSegment(educationLevel, {
      existingSegment: user.platformSegment,
      collegeOrSchoolName: college,
      currentCourse: currentCourse,
      lastQualification: lastQualification,
    });

    // Prepare social links JSON
    const socialLinks = JSON.stringify({
        linkedin: personalization?.social?.linkedin || '',
        github: personalization?.social?.github || '',
        currentStatus: currentStatus || 'Student',
        interests: personalization?.interests || [],
        ...personalization
    });

    // Update user profile
    let updatedUser: any;
    const devAuthFallbackEnabled =
      process.env.NODE_ENV === 'development' &&
      process.env.DEV_AUTH_FALLBACK === '1' &&
      process.env.ALLOW_DEV_AUTH_FALLBACK === '1';

    try {
      // 🚀 PRODUCTION-SAFE ENROLLMENT ASSIGNMENT
      let enrollmentNumber = (user as any).enrollmentNumber;
      
      // If onboarding is finishing and user has no enrollment number, assign one
      if (!isPartial && !enrollmentNumber) {
        const { generateEnrollmentNumber } = await import('@/lib/enrollment');
        enrollmentNumber = await generateEnrollmentNumber(user.role);
      }

      updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          name: name || user.name,
          phone: finalPhone || user.phone,
          college: college || user.college,
          location: location || (user as any).location,
          currentCourse: currentCourse || user.currentCourse,
          lastQualification: lastQualification || user.lastQualification,
          platformSegment: calculatedSegment,
          educationLevel: (educationLevel as any) || undefined,
          socialLinks,
          enrollmentNumber,
          onboarded: isPartial ? false : true,
          onboardingStatus: isPartial ? 'IN_PROGRESS' : 'COMPLETED',
          status: 'ACTIVE'
        },
      });
    } catch (prismaError: any) {
      console.error('[ONBOARDING_API] Database update failed:', prismaError);
      
      if (devAuthFallbackEnabled) {
        // Mock successful update for development fallback
        updatedUser = {
          id: user.id || `dev-student-${Date.now()}`,
          role: 'STUDENT',
          email: user.email || 'demo@sarthi-woad.vercel.app',
          name: name || user.name || 'Demo Student',
          onboarded: !isPartial
        };
      } else {
        if (prismaError.code === 'P2025') {
          return NextResponse.json({ 
            error: 'User not found in database. Your session may be invalid. Please log out and sign up again.' 
          }, { status: 404 });
        }
        throw prismaError;
      }
    }

    // RE-SIGN THE JWT: Since the onboarded status changed, we must issue a new token
    // so the middleware sees the updated status immediately without logout/login.
    const token = await signJWT({
      userId: updatedUser.id,
      role: updatedUser.role,
      sessionId: (user as any).sessionId || `dev-session-${Date.now()}`,
      email: updatedUser.email,
      name: updatedUser.name || undefined,
      onboarded: !isPartial, // Only mark as onboarded in JWT if NOT partial
      platformSegment: updatedUser.platformSegment,
      educationLevel: updatedUser.educationLevel
    });

    const response = NextResponse.json({
      success: true,
      message: isPartial ? 'Progress saved' : 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        onboarded: !isPartial,
        platformSegment: updatedUser.platformSegment,
        educationLevel: updatedUser.educationLevel
      }
    });

    const isProd = process.env.NODE_ENV === 'production';
    response.cookies.set('tt_session', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return response;


  } catch (error: any) {
    console.error('[ONBOARDING_API] Unexpected Error:', error);
    return NextResponse.json({ error: `Internal Server Error: ${error.message}` }, { status: 500 });
  }
}

