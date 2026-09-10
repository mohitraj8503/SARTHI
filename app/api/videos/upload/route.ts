export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import { getValidYouTubeAccessToken } from '@/lib/youtube';
import { google } from 'googleapis';
import { triggerHaptic } from '@/lib/haptics';

// Security White-list for Video Formats
const SUPPORTED_MIME_TYPES = [
  'video/mp4',
  'video/quicktime', // .mov
  'video/x-msvideo', // .avi
  'video/webm',
  'video/mpeg'
];

export async function POST(request: NextRequest) {
  try {
    // 1. Authentication & Role Verification (Teacher Check)
    const session = await getSession();
    const userRole = (session?.role || '').toUpperCase();
    if (!session?.userId) return NextResponse.json({ error: 'AUTHENTICATION_REQUIRED' }, { status: 401 });

    if (userRole !== 'INSTRUCTOR' && userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'UNAUTHORIZED_ACCESS_DENIED' }, { status: 403 });
    }

    const teacherId = session.userId;

    // 2. Multi-part Form Data Parsing (Optimized for Large Payloads)
    const formData = await request.formData();
    const courseId = formData.get('course_id') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const privacyStatus = (formData.get('privacy_status') as string) || 'unlisted';
    const videoFile = formData.get('video') as File;

    if (!courseId || !title || !videoFile) {
      return NextResponse.json({ error: 'MISSING_REQUIRED_FIELDS' }, { status: 400 });
    }

    // 3. Security & Integrity Validations
    if (!SUPPORTED_MIME_TYPES.includes(videoFile.type)) {
      return NextResponse.json({ 
          error: 'UNSUPPORTED_VIDEO_FORMAT', 
          details: `Format '${videoFile.type}' is not permitted. Use MP4, MOV, or WebM.` 
      }, { status: 400 });
    }

    // Strict 1GB limit for platform stability (adjustable by Admin)
    const MAX_SIZE = 1 * 1024 * 1024 * 1024; 
    if (videoFile.size > MAX_SIZE) {
      return NextResponse.json({ error: 'FILE_SIZE_EXCEEDS_LIMIT', limit: '1GB' }, { status: 400 });
    }

    // 4. Source Sovereignty & Privacy Enforcement
    // User Requirement: "All videos must be private/unlisted"
    const enforcedPrivacy = (privacyStatus === 'public') ? 'unlisted' : privacyStatus;

    const course = await prisma.course.findFirst({
      where: { id: courseId, instructorId: teacherId }
    });

    if (!course && userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'COURSE_CONTEXT_MISSING_OR_DENIED' }, { status: 404 });
    }

    // 5. YouTube API Integration & OAuth Refresh
    const accessToken = await getValidYouTubeAccessToken(teacherId);
    if (!accessToken) {
      return NextResponse.json({ error: 'YOUTUBE_OAUTH_SYNC_REQUIRED' }, { status: 400 });
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

    // 6. Resumable Upload Initialization
    const fileStream = videoFile.stream();
    const fileSize = videoFile.size;

    const youtubeResponse = await youtube.videos.insert(
      {
        part: ['snippet', 'status'],
        requestBody: {
          snippet: {
            title: title.substring(0, 100), // YouTube limit
            description: description || `Uploaded via SARTHI - ${new Date().toLocaleDateString()}`,
            tags: ['sarthi', 'elearning', course?.title].filter(Boolean) as string[],
          },
          status: {
            privacyStatus: enforcedPrivacy,
            selfDeclaredMadeForKids: false
          },
        },
        media: {
          body: fileStream,
          mimeType: videoFile.type,
        },
      }
    );

    const videoId = youtubeResponse.data.id;
    if (!videoId) throw new Error('YOUTUBE_ID_ALLOCATION_FAILED');

    // 7. Database Persistence & Contextual Linking
    const prismaVideo = await prisma.video.create({
      data: {
        course_id: courseId,
        teacher_id: teacherId,
        youtube_video_id: videoId,
        privacy_status: enforcedPrivacy,
        uploaded_at: new Date(),
        status: 'live',
      },
    });

    return NextResponse.json({
      success: true,
      videoId: prismaVideo.id,
      youtubeId: videoId,
      status: 'SYNCHRONIZED',
      timestamp: prismaVideo.uploaded_at
    });

  } catch (error: any) {
    console.error('CRITICAL_VIDEO_UPLOAD_FAILURE:', error);
    
    // Attempt detailed error extraction from Google API
    const errorMessage = error.errors?.[0]?.message || error.message || 'INTERNAL_BUFFER_FAILURE';
    const statusCode = error.code || 500;

    return NextResponse.json({ 
        error: 'UPLOAD_PROCESS_INTERRUPTED',
        message: errorMessage,
        code: statusCode
    }, { status: statusCode === 401 ? 401 : 500 });
  }
}

