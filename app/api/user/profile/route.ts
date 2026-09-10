export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { sanitizeRichHtml } from '@/lib/html-sanitizer';

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, bio, college, course, semester, phone, linkedin, github, notificationSettings, twoFactorEnabled } = body;

    // Validation for student academic fields if provided
    if (college !== undefined && (!college || college.trim().length === 0 || college.toLowerCase() === 'not specified')) {
      return NextResponse.json({ error: 'Please enter a valid College / University name.' }, { status: 400 });
    }
    if (course !== undefined && (!course || course.trim().length === 0 || course.toLowerCase() === 'not specified')) {
      return NextResponse.json({ error: 'Please enter a valid Course / Degree program.' }, { status: 400 });
    }

    const sanitizedBio = bio ? sanitizeRichHtml(bio) : undefined;

    // 1. Update User table
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(name && { name }),
        ...(sanitizedBio && { bio: sanitizedBio }),
        ...(college !== undefined && { college: college.trim() }),
        ...(course !== undefined && { currentCourse: course.trim() }),
        ...(phone !== undefined && { phone: phone.trim() }),
        ...(notificationSettings !== undefined && { notificationSettings: JSON.stringify(notificationSettings) }),
        ...(twoFactorEnabled !== undefined && { twoFactorEnabled }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        avatar_url: true,
        bio: true,
        college: true,
        currentCourse: true,
        phone: true,
        notificationSettings: true,
        twoFactorEnabled: true,
      }
    });

    // 2. Also update candidate's InternshipApplication record so Mentor Dashboard & Offer Letter Pipeline consume updated data
    const existingApp = await prisma.internshipApplication.findFirst({
      where: {
        OR: [
          { studentId: user.id },
          { email: user.email }
        ]
      },
      orderBy: { submittedAt: 'desc' }
    });

    if (existingApp) {
      await prisma.internshipApplication.update({
        where: { id: existingApp.id },
        data: {
          ...(name && { name }),
          ...(college !== undefined && { college: college.trim() }),
          ...(course !== undefined && { course: course.trim() }),
          ...(semester !== undefined && { semester: semester.trim() }),
          ...(linkedin !== undefined && { linkedin: linkedin.trim() }),
          ...(github !== undefined && { github: github.trim() }),
        }
      });
    }

    return NextResponse.json({
      success: true,
      user: updatedUser
    });
  } catch (error) {
    console.error('[PROFILE_PATCH_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to update profile', message: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}

