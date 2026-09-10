import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, invalidateSessionCache } from '@/lib/auth';
import { uploadProfilePhoto, isCloudinaryConfigured } from '@/lib/cloudinary';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Convert File to Buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    let imageUrl = '';

    if (isCloudinaryConfigured()) {
        const result = await uploadProfilePhoto(buffer, user.id, file.type);
        if (!result.success || !result.url) {
            return NextResponse.json({ error: result.error || 'Upload failed' }, { status: 500 });
        }
        imageUrl = result.url;
    } else {
        // Fallback to Base64 (MySQL) storage
        console.warn('⚠️ Cloudinary not configured. Using Base64 storage for profile photo.');
        imageUrl = `data:${file.type};base64,${buffer.toString('base64')}`;
    }

    // Update user image in database with atomic version increment for cache busting
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { 
        image: imageUrl,
        avatar_url: imageUrl,
        avatar_version: { increment: 1 }
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        avatar_url: true,
        avatar_version: true
      }
    });

    // Invalidate auth cache so the next request gets fresh data
    await invalidateSessionCache();
    
    return NextResponse.json({
      success: true,
      url: imageUrl,
      user: updatedUser
    });

  } catch (error) {
    console.error('[PROFILE_UPLOAD_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to upload image', message: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}
