export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = await request.json();
    const { isDefault, name, isShared } = body;

    // Find the filter and check ownership
    const filter = await prisma.savedFilter.findUnique({
      where: { id }
    });

    if (!filter) {
      return NextResponse.json({ error: 'Filter not found' }, { status: 404 });
    }

    // Only owner can modify their filters
    if (filter.ownerId !== session.userId) {
      return NextResponse.json({ error: 'Unauthorized to modify this filter' }, { status: 403 });
    }

    // Update the filter
    const updateData: any = {};
    if (isDefault !== undefined) updateData.isDefault = isDefault;
    if (name !== undefined) updateData.name = name;
    if (isShared !== undefined) updateData.isShared = isShared;

    const updatedFilter = await prisma.savedFilter.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({
      filter: updatedFilter,
      message: 'Filter updated successfully'
    });
  } catch (error: any) {
    console.error('[SavedFilter PATCH] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update filter' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Find the filter and check ownership
    const filter = await prisma.savedFilter.findUnique({
      where: { id }
    });

    if (!filter) {
      return NextResponse.json({ error: 'Filter not found' }, { status: 404 });
    }

    // Only owner can delete their filters
    if (filter.ownerId !== session.userId) {
      return NextResponse.json({ error: 'Unauthorized to delete this filter' }, { status: 403 });
    }

    // Delete the filter
    await prisma.savedFilter.delete({
      where: { id }
    });

    return NextResponse.json({
      message: 'Filter deleted successfully'
    });
  } catch (error: any) {
    console.error('[SavedFilter DELETE] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete filter' },
      { status: 500 }
    );
  }
}
