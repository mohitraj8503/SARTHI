export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Admin check
    const userRole = session?.role;
    const isAdmin = userRole && (
      userRole.toUpperCase() === 'ADMIN' ||
      userRole.toUpperCase() === 'ADMINISTRATOR'
    );

    if (!session || !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get('entityType');

    if (!entityType) {
      return NextResponse.json({ error: 'Entity type required' }, { status: 400 });
    }

    // Get saved filters for this user and shared filters
    const filters = await prisma.savedFilter.findMany({
      where: {
        entityType,
        OR: [
          { ownerId: session.userId },
          { isShared: true }
        ]
      },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json({ filters });
  } catch (error: any) {
    console.error('[SavedFilters GET] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch saved filters' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Admin check
    const userRole = session?.role;
    const isAdmin = userRole && (
      userRole.toUpperCase() === 'ADMIN' ||
      userRole.toUpperCase() === 'ADMINISTRATOR'
    );

    if (!session || !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, entityType, filters, sortBy, sortOrder, isShared } = body;

    if (!name || !entityType || !filters) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if filter name already exists for this user
    const existingFilter = await prisma.savedFilter.findFirst({
      where: {
        name,
        entityType,
        ownerId: session.userId
      }
    });

    if (existingFilter) {
      return NextResponse.json({ error: 'Filter name already exists' }, { status: 400 });
    }

    // Create saved filter
    const savedFilter = await prisma.savedFilter.create({
      data: {
        name,
        entityType,
        filters: JSON.stringify(filters),
        sortBy,
        sortOrder,
        ownerId: session.userId,
        isShared: isShared || false
      }
    });

    return NextResponse.json({
      filter: savedFilter,
      message: 'Filter saved successfully'
    });
  } catch (error: any) {
    console.error('[SavedFilters POST] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save filter' },
      { status: 500 }
    );
  }
}

