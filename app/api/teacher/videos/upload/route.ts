import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import { getValidGoogleToken } from '@/lib/auth/token-manager';
import { google } from 'googleapis';
import { Readable } from 'stream';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // 1. Authentication & Role Verification (Teacher Check)
    const session = await getSession();
    const userRole = (session?.role || '').toUpperCase();
    if (!session?.userId) {
      return NextResponse.json({ error: 'AUTHENTICATION_REQUIRED' }, { status: 401 });
    }

    if (userRole !== 'INSTRUCTOR' && userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'UNAUTHORIZED_ACCESS_DENIED' }, { status: 403 });
    }

    const userId = session.userId;
    const teacher = await prisma.teacher.findUnique({
      where: { userId }
    });

    if (!teacher) {
      return NextResponse.json({ error: 'TEACHER_PROFILE_NOT_FOUND' }, { status: 404 });
    }

    // 2. Parse Form Data
    const formData = await request.formData();
    const videoFile = formData.get('video') as File | null;
    const title = formData.get('title') as string | null;
    const courseId = formData.get('courseId') as string | null;
    const description = (formData.get('description') as string) || '';

    if (!videoFile || !title) {
      return NextResponse.json({ error: 'MISSING_REQUIRED_FIELDS' }, { status: 400 });
    }

    // 3. Authenticate with Google Drive using Central Token
    const accessToken = await getValidGoogleToken();
    if (!accessToken) {
      return NextResponse.json({ error: 'GOOGLE_DRIVE_NOT_CONFIGURED' }, { status: 500 });
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });
    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    // 4. Resolve folder ID
    let folderId: string | undefined = undefined;
    if (courseId) {
      const course = await prisma.course.findFirst({
        where: { id: courseId, instructorId: userId }
      });
      if (course?.googleFolderId) {
        folderId = course.googleFolderId;
      }
    }

    if (!folderId && process.env.GOOGLE_DRIVE_FOLDER_ID) {
      folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    }

    // 5. Upload File to Google Drive
    const fileMetadata = {
      name: `[SARTHI] ${title} - ${Date.now()}`,
      parents: folderId ? [folderId] : undefined,
    };

    const nodeStream = Readable.from(videoFile.stream() as any);
    const media = {
      mimeType: videoFile.type || 'video/mp4',
      body: nodeStream,
    };

    const driveResponse = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, name, webViewLink, webContentLink',
    });

    const fileId = driveResponse.data.id;
    const webViewLink = driveResponse.data.webViewLink;

    if (!fileId || !webViewLink) {
      throw new Error('FAILED_TO_UPLOAD_TO_DRIVE');
    }

    // Make file viewable by anyone with link
    try {
      await drive.permissions.create({
        fileId: fileId,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });
    } catch (permError) {
      console.warn('Failed to set public view permissions on Drive file:', permError);
    }

    // 6. Database Persistence: Create Media Asset
    const mediaAsset = await prisma.mediaAsset.create({
      data: {
        teacherId: teacher.id,
        title,
        fileType: 'video',
        storageProvider: 'google_drive',
        fileId: webViewLink, // fileId or webViewLink to match the list's play link expectations
        fileSizeBytes: videoFile.size,
        thumbnailUrl: '',
        tags: JSON.stringify(['vault', 'upload'])
      }
    });

    // 7. If Course ID is provided, create a lesson for it
    if (courseId) {
      const lastLesson = await prisma.lesson.findFirst({
        where: { courseId },
        orderBy: { orderNumber: 'desc' }
      });

      await prisma.lesson.create({
        data: {
          title,
          videoUrl: webViewLink,
          courseId,
          orderNumber: (lastLesson?.orderNumber || 0) + 1,
          contentType: 'video',
          upload_status: 'COMPLETED'
        }
      });
    }

    return NextResponse.json({
      success: true,
      video: {
        id: mediaAsset.id,
        title: mediaAsset.title,
        courseName: courseId ? 'Linked' : 'Standalone Asset',
        duration: '0:00',
        viewCount: 0,
        completionRate: 0,
        status: 'published',
        youtubeUrl: webViewLink,
        createdAt: mediaAsset.createdAt.toISOString()
      },
      message: 'Video uploaded to Google Drive successfully.'
    });

  } catch (error: any) {
    console.error('Video Upload Failure:', error);
    return NextResponse.json({
      error: 'UPLOAD_FAILED',
      message: error.message || 'Internal server error'
    }, { status: 500 });
  }
}
