export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { uploadPrivateVideo } from '@/lib/youtube';
import { verifyJWT } from '@/lib/auth/jwt';
import { validateSession } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
    try {
        // 1. Verify User Session
        const cookieStore = request.cookies;
        const token = cookieStore.get('tt_session')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const payload = await verifyJWT(token);
        if (!payload) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const session = await validateSession(payload.sessionId);
        if (!session) {
            return NextResponse.json({ error: 'Session expired' }, { status: 401 });
        }

        const userId = payload.userId;

        // 2. Verify User Role (Teacher or Admin)
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, role: true, youtubeAccessToken: true, youtubeRefreshToken: true }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const normalizedRole = user.role.toUpperCase();
        if (normalizedRole !== 'ADMIN' && normalizedRole !== 'TEACHER' && normalizedRole !== 'INSTRUCTOR') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // 3. Parse FormData
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const title = formData.get('title') as string;
        const description = formData.get('description') as string;
        const courseId = formData.get('courseId') as string; // Optional course association

        if (!file || !title) {
            return NextResponse.json({ error: 'File and title are required' }, { status: 400 });
        }

        // 4. Upload Video (Using Teacher's Credentials or Admin's as fallback)
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        let videoData;
        try {
            // Try to upload using teacher's own YouTube credentials first
            if (user.youtubeAccessToken && user.youtubeRefreshToken) {
                videoData = await uploadPrivateVideo(buffer, title, description || '', userId);
            } else {
                // Fallback to admin credentials if teacher doesn't have YouTube connected
                videoData = await uploadPrivateVideo(buffer, title, description || '');
            }
        } catch (error) {
            console.error('YouTube upload failed:', error);
            return NextResponse.json({
                error: 'Failed to upload video to YouTube. Please check your YouTube connection or contact support.'
            }, { status: 500 });
        }

        // 5. Create database record for the video
        if (courseId) {
            const video = await prisma.video.create({
                data: {
                    course: { connect: { id: courseId } },
                    teacher: { connect: { id: userId } },
                    youtube_video_id: videoData.videoId,
                    title: title,
                    description: description || '',
                    status: 'uploaded',
                    uploaded_at: new Date()
                }
            });

            return NextResponse.json({
                success: true,
                videoId: videoData.videoId,
                youtubeUrl: videoData.youtubeUrl,
                dbVideoId: video.id,
                uploadedBy: user.youtubeAccessToken ? 'teacher' : 'admin'
            });
        }

        return NextResponse.json({
            success: true,
            videoId: videoData.videoId,
            youtubeUrl: videoData.youtubeUrl,
            uploadedBy: user.youtubeAccessToken ? 'teacher' : 'admin'
        });

    } catch (error: any) {
        console.error('Upload Video Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to upload video' }, { status: 500 });
    }
}

