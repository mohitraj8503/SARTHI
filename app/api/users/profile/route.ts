export const dynamic = "force-dynamic";
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Update guard: ensure user can only update their own profile
    const userId = user.id;

    const contentType = request.headers.get('content-type') || '';

    let name: string;
    let bio: string;
    let expertise: string;
    let socialLinks: any;
    let privacySettings: any;
    let location: string;
    let headline: string;
    let username: string;
    let profileImageUrl: string | undefined;

    if (contentType.includes('multipart/form-data')) {
      // Handle file upload
      const formData = await request.formData();
      ({
        name,
        bio,
        expertise,
        socialLinks,
        privacySettings,
        location,
        headline,
        username,
      } = Object.fromEntries(formData) as any);

      // Parse JSON fields
      if (typeof socialLinks === 'string') socialLinks = JSON.parse(socialLinks);
      if (typeof privacySettings === 'string') privacySettings = JSON.parse(privacySettings);

      // Handle profile image upload
      const profileImage = formData.get('profileImage') as File | null;
      if (profileImage && profileImage.size > 0) {
        if (profileImage.size > 2 * 1024 * 1024) {
          return NextResponse.json({ error: 'Image too large (max 2MB)' }, { status: 400 });
        }

        const bytes = await profileImage.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create unique filename
        const extension = profileImage.name.split('.').pop() || 'jpg';
        const filename = `${randomUUID()}.${extension}`;
        const filepath = join(process.cwd(), 'public', 'uploads', 'profiles', filename);

        // Ensure directory exists
        await mkdir(join(process.cwd(), 'public', 'uploads', 'profiles'), { recursive: true });

        // Write file
        await writeFile(filepath, buffer);

        profileImageUrl = `/uploads/profiles/${filename}`;
      }
    } else {
      // Handle JSON request (for non-file updates)
      const body = await request.json();
      ({
        name,
        bio,
        expertise,
        profileImage: profileImageUrl,
        socialLinks,
        privacySettings,
        location,
        headline,
        username,
      } = body);
    }

    // check if username is already taken if it's being changed
    const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { username: true }
    });

    if (username && username !== currentUser?.username) {
      const existing = await prisma.user.findUnique({ where: { username } });
      if (existing) {
        return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        bio,
        username,
        company: expertise,
        headline,
        location,
        image: profileImageUrl,
        avatar_url: profileImageUrl,
        socialLinks: socialLinks ? JSON.stringify(socialLinks) : undefined,
        privacySettings: privacySettings ? JSON.stringify(privacySettings) : undefined,
      },
    });

    const parsedSocial = updatedUser.socialLinks ? JSON.parse(updatedUser.socialLinks) : {};
    const parsedPrivacy = updatedUser.privacySettings
      ? JSON.parse(updatedUser.privacySettings)
      : {};

    return NextResponse.json({
      ...updatedUser,
      socialLinks: parsedSocial,
      privacySettings: parsedPrivacy,
    });
} catch (error: unknown) {
    console.error('Error updating profile:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to update profile', details: errorMessage },
      { status: 500 }
    );
  }
}

