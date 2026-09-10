export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 1. GET: List challenge registrations with search and filtering
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const challengeId = searchParams.get('challengeId');
    const search = searchParams.get('search');

    const whereClause: any = {};

    if (challengeId && challengeId !== 'all') {
      whereClause.challengeId = challengeId;
    }

    if (search) {
      whereClause.OR = [
        { fullName: { contains: search } },
        { email: { contains: search } },
        { collegeName: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    let registrations = [];
    try {
      registrations = await prisma.challengeRegistration.findMany({
        where: whereClause,
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (e) {
      console.warn('Prisma DB query fallback in admin API route');
      registrations = [];
    }

    const totalCount = registrations.length;
    const aiIdeathonCount = registrations.filter((r: any) => r.challengeId === 'ai-ideathon').length;
    const uniqueColleges = new Set(registrations.map((r: any) => r.collegeName?.trim()?.toLowerCase())).size;

    return NextResponse.json({
      success: true,
      stats: {
        totalRegistrations: totalCount,
        aiIdeathonCount,
        uniqueColleges,
      },
      registrations,
    });
  } catch (error: any) {
    console.error('Admin challenges GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch challenge registrations' },
      { status: 500 }
    );
  }
}

// 2. PATCH: Update registration status (e.g., APPROVED, SHORTLISTED, REJECTED)
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Missing required parameters: id and status' },
        { status: 400 }
      );
    }

    const updated = await prisma.challengeRegistration.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({
      success: true,
      message: 'Status updated successfully',
      registration: updated,
    });
  } catch (error: any) {
    console.error('Admin challenges PATCH error:', error);
    return NextResponse.json(
      { error: 'Failed to update registration status' },
      { status: 500 }
    );
  }
}

// 3. DELETE: Delete a registration record
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing registration id parameter' },
        { status: 400 }
      );
    }

    await prisma.challengeRegistration.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Registration record deleted successfully',
    });
  } catch (error: any) {
    console.error('Admin challenges DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete registration record' },
      { status: 500 }
    );
  }
}
