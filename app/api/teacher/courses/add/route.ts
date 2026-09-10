export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { youtubeService } from '@/lib/youtube-api';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const price = Number(formData.get('price'));
    const instructorId = formData.get('instructorId') as string;
    const thumbnailFile = formData.get('thumbnail') as File;

    if (!title || !price || !instructorId) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    let thumbnailUrl = '';

    // Handle thumbnail upload
    if (thumbnailFile) {
      // Validate file type
      if (!thumbnailFile.type.startsWith('image/') || !['image/jpeg', 'image/png'].includes(thumbnailFile.type)) {
        return NextResponse.json({ error: 'Invalid file type. Only JPG, PNG allowed.' }, { status: 400 });
      }

      // Validate file size (2MB)
      if (thumbnailFile.size > 2 * 1024 * 1024) {
        return NextResponse.json({ error: 'File too large. Max 2MB.' }, { status: 400 });
      }

      // Process image with sharp
      const buffer = Buffer.from(await thumbnailFile.arrayBuffer());
      const sharpImage = sharp(buffer);

      // Validate 16:9 aspect ratio (roughly)
      const metadata = await sharpImage.metadata();
      const aspectRatio = metadata.width! / metadata.height!;
      if (aspectRatio < 1.7 || aspectRatio > 1.9) {
        // Auto crop to 16:9
        const newHeight = Math.round(metadata.width! / (16/9));
        if (newHeight < metadata.height!) {
          await sharpImage.resize(metadata.width!, newHeight, { fit: 'cover' });
        }
      }

      // Compress and save
      const compressedBuffer = await sharpImage
        .jpeg({ quality: 85 })
        .toBuffer();

      // Save to public/course-thumbnails
      const basePath = path.join(process.cwd(), 'public', 'course-thumbnails');
      await mkdir(basePath, { recursive: true });

      const filename = `${Date.now()}-${instructorId}.jpg`;
      const filePath = path.join(basePath, filename);
      await writeFile(filePath, compressedBuffer);

      thumbnailUrl = `/course-thumbnails/${filename}`;
    }

    // 1. Create Course in draft mode
    const course = await prisma.course.create({
      data: {
        title,
        description,
        price,
        thumbnail: thumbnailUrl,
        instructorId,
        publish_state: 'draft', // Start as draft
        isPublished: false,
      },
    });

    // 2. Auto-create YouTube playlist
    let playlistId = '';
    try {
      console.log(`Creating YouTube playlist for course: ${title}`);
      const playlistResponse = await youtubeService.createPlaylist(instructorId, title, description);
      playlistId = playlistResponse.id;

      // Update course with playlist ID
      await prisma.course.update({
        where: { id: course.id },
        data: { youtubePlaylistId: playlistId },
      });

      console.log(`Created YouTube playlist: ${playlistId}`);
    } catch (ytError) {
      console.warn('YouTube playlist creation failed:', ytError);
      // Course is created but in draft, admin can retry
    }

    // 3. Auto-create Google Drive Folder Structure (Centralized)
    try {
      const { GoogleDriveService } = await import('@/lib/services/google-drive');
      console.log(`Initializing Google Drive structure for course: ${title}`);
      await GoogleDriveService.getCourseFolder(course.id);
      console.log(`Google Drive structure initialized for course ${course.id}`);
    } catch (gdError) {
      console.warn('Google Drive structure initialization failed:', gdError);
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error('Create course error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

