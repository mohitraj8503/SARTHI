export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import { deleteProfilePhoto } from '@/lib/cloudinary';

export async function DELETE(req: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please log in to delete your profile photo' },
        { status: 401 }
      );
    }
    const userId = session.userId;

    // Get current user to find existing photo URL
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { image: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // If user has a Cloudinary photo, delete it
    if (user.image && user.image.includes('cloudinary.com')) {
      // Extract public ID from URL
      // URL format: https://res.cloudinary.com/{cloud}/image/upload/v{version}/{folder}/{public_id}
      try {
        const urlParts = user.image.split('/');
        const publicIdWithVersion = urlParts.slice(-2).join('/').replace(/^v\d+\//, '');
        await deleteProfilePhoto(publicIdWithVersion);
      } catch (error) {
        console.error('Failed to delete from Cloudinary:', error);
        // Continue even if Cloudinary deletion fails
      }
    }

    // Update user record to remove photo (clearing both potential fields)
    await prisma.user.update({
      where: { id: userId },
      data: { 
        image: null,
        avatar_url: null
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Profile photo deleted successfully',
    });
  } catch (error) {
    console.error('Profile photo delete error:', error);
    return NextResponse.json(
      { error: 'Delete failed', message: 'An error occurred while deleting' },
      { status: 500 }
    );
  }
}

