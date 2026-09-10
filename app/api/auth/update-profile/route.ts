export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import { processProfileImage } from '@/lib/upload-profile-photo';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, bio, expertise, image } = body;

    const processedImage = await processProfileImage(session.userId, image);

    const user = await prisma.user.update({
      where: { id: session.userId },
      data: {
        name,
        bio,
        company: expertise, 
        image: processedImage || undefined,
        avatar_url: processedImage || undefined,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

