export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';

export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const userRole = (session.role || '').toUpperCase();

    const announcementId = params.id;
    const { title, message } = await request.json();

    // Validation
    if (!title && !message) {
      return NextResponse.json(
        { message: 'At least title or message must be provided' },
        { status: 400 }
      );
    }

    // Find the announcement
    const announcement = await prisma.announcement.findUnique({
      where: { id: announcementId },
    });

    if (!announcement) {
      return NextResponse.json({ message: 'Announcement not found' }, { status: 404 });
    }

    // Check if user is the author or admin
    if (announcement.authorId !== session.userId && userRole !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Forbidden: Only the author or admin can update this announcement' },
        { status: 403 }
      );
    }

    // Update the announcement
    const updatedAnnouncement = await prisma.announcement.update({
      where: { id: announcementId },
      data: {
        ...(title && { title }),
        ...(message && { content: message }),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json(updatedAnnouncement);
  } catch (error) {
    console.error('Update announcement error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const userRole = (session.role || '').toUpperCase();

    const announcementId = params.id;

    // Find the announcement
    const announcement = await prisma.announcement.findUnique({
      where: { id: announcementId },
    });

    if (!announcement) {
      return NextResponse.json({ message: 'Announcement not found' }, { status: 404 });
    }

    // Check if user is the author or admin
    if (announcement.authorId !== session.userId && userRole !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Forbidden: Only the author or admin can delete this announcement' },
        { status: 403 }
      );
    }

    // Delete the announcement
    await prisma.announcement.delete({
      where: { id: announcementId },
    });

    return NextResponse.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Delete announcement error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
