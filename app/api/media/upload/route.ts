import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateTeacher } from '@/lib/auth/middleware';
import { API } from '@/lib/api/response';
import cloudinary from '@/lib/cloudinary';

/**
 * Secure Media Upload Engine
 * Handles binary uploads with cloud processing and database asset tracking.
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await authenticateTeacher(request);
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const lessonId = formData.get('lessonId') as string;
    
    if (!file || !lessonId) return API.err('File and lessonId required', 'MISSING_PARAMS', 400);
    
    // 1. Basic Validation
    if (!file.type.startsWith('video/') || file.size > 100 * 1024 * 1024) { // 100MB limit for demo
      return API.err('Invalid video file (max 100MB)', 'INVALID_FILE', 400);
    }
    
    // 2. Cloudinary Upload
    // We'll use a stream-based upload in production, but for now:
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadResult: any = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { resource_type: 'video', folder: `tt/lessons/${lessonId}` },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });
    
    // 3. Database Persistence
    const media = await prisma.mediaAsset.create({
      data: {
        title: file.name,
        type: 'VIDEO',
        url: uploadResult.secure_url,
        thumbnailUrl: uploadResult.thumbnail_url || uploadResult.secure_url.replace('.mp4', '.jpg'),
        duration: Math.round(uploadResult.duration || 0),
        fileSize: file.size,
        mimeType: file.type,
        status: 'READY',
        uploadedBy: userId,
        lessonId
      }
    });
    
    // 4. Update Lesson Relation
    await prisma.lesson.update({
      where: { id: lessonId },
      data: { video_url: media.url }
    });
    
    return API.ok({ mediaId: media.id, status: 'READY' }, { status: 201 });
    
  } catch (error) {
    console.error('Media Upload Error:', error);
    return API.server('Upload failed');
  }
}
