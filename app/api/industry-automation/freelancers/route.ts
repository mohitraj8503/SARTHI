export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';

// GET /api/industry-automation/freelancers - Get current user's freelancer profile
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ freelancer: null });
    }
    const userId = session.userId;

    const freelancer = await prisma.freelancer.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            headline: true
          }
        }
      }
    });

    if (!freelancer) {
      return NextResponse.json({ error: 'Freelancer profile not found' }, { status: 404 });
    }

    return NextResponse.json({ freelancer });

  } catch (error) {
    console.error('Error fetching freelancer profile:', error);
    return NextResponse.json({ error: 'Failed to fetch freelancer profile' }, { status: 500 });
  }
}

// POST /api/industry-automation/freelancers - Create or update freelancer profile
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const userId = session.userId;

    const body = await request.json();
    const {
      bio,
      skills,
      experience,
      hourlyRate,
      availability,
      location,
      languages,
      portfolioUrl,
      linkedinUrl,
      githubUrl,
      websiteUrl,
      certifications
    } = body;

    // Validate required fields for initial creation
    if (!bio || !skills || skills.length === 0) {
      return NextResponse.json(
        { error: 'Bio and at least one skill are required' },
        { status: 400 }
      );
    }

    const freelancer = await prisma.freelancer.upsert({
      where: { userId },
      update: {
        bio,
        skills: JSON.stringify(skills),
        experience,
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
        availability,
        location,
        languages: languages ? JSON.stringify(languages) : null,
        portfolioUrl,
        linkedinUrl,
        githubUrl,
        websiteUrl,
        certifications: certifications ? JSON.stringify(certifications) : null,
        updatedAt: new Date()
      },
      create: {
        userId,
        bio,
        skills: JSON.stringify(skills),
        experience,
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
        availability,
        location,
        languages: languages ? JSON.stringify(languages) : null,
        portfolioUrl,
        linkedinUrl,
        githubUrl,
        websiteUrl,
        certifications: certifications ? JSON.stringify(certifications) : null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            headline: true
          }
        }
      }
    });

    return NextResponse.json({ freelancer }, { status: 201 });

  } catch (error) {
    console.error('Error creating/updating freelancer profile:', error);
    return NextResponse.json({ error: 'Failed to create/update freelancer profile' }, { status: 500 });
  }
}

// PUT /api/industry-automation/freelancers - Update freelancer profile (alias for POST)
export async function PUT(request: NextRequest) {
  return POST(request);
}

// DELETE /api/industry-automation/freelancers - Delete freelancer profile
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const userId = session.userId;

    await prisma.freelancer.delete({
      where: { userId }
    });

    return NextResponse.json({ message: 'Freelancer profile deleted successfully' });

  } catch (error) {
    console.error('Error deleting freelancer profile:', error);
    return NextResponse.json({ error: 'Failed to delete freelancer profile' }, { status: 500 });
  }
}

