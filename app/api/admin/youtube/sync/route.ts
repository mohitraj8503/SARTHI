export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { youtubeService } from '@/lib/youtube-api';

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { syncAll = false, playlistIds = [] } = await req.json();

    // 1. Fetch Playlists from YouTube
    const ytPlaylists = await youtubeService.getPlaylists(user.id);

    const results: Array<{
      courseId: string;
      title: string;
      lessonsSynced: number;
    }> = [];

    for (const ytPlaylist of ytPlaylists.items) {
      // If we are filtering by specific playlist IDs
      if (!syncAll && playlistIds.length > 0 && !playlistIds.includes(ytPlaylist.id)) {
        continue;
      }

      // 2. Create or Update Course
      const course = await prisma.course.upsert({
        where: { youtubePlaylistId: ytPlaylist.id },
        update: {
          title: ytPlaylist.snippet.title,
          description: ytPlaylist.snippet.description,
          thumbnail: ytPlaylist.snippet.thumbnails.high?.url,
        },
        create: {
          title: ytPlaylist.snippet.title,
          description: ytPlaylist.snippet.description,
          thumbnail: ytPlaylist.snippet.thumbnails.high?.url,
          youtubePlaylistId: ytPlaylist.id,
          instructorId: user.id,
          price: 0, // Default to free on sync
          isPublished: false, // Draft by default
        },
      });

      // 3. Fetch Videos for this playlist
      const ytVideos = await youtubeService.getPlaylistItems(user.id, ytPlaylist.id);

      let order = 0;
      for (const ytVideo of ytVideos.items) {
        order++;
        const videoId = ytVideo.contentDetails.videoId;

        // 4. Create or Update Lesson
        // Since we don't have a unique constraint on youtube_video_id, we must do a findFirst then update/create
        const existingLesson = await prisma.lesson.findFirst({
          where: {
            courseId: course.id,
            youtube_video_id: videoId
          }
        });

        if (existingLesson) {
          await prisma.lesson.update({
            where: { id: existingLesson.id },
            data: {
              title: ytVideo.snippet.title,
              description: ytVideo.snippet.description,
              orderNumber: order,
            }
          });
        } else {
          await prisma.lesson.create({
            data: {
              courseId: course.id,
              title: ytVideo.snippet.title,
              description: ytVideo.snippet.description,
              videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
              youtube_video_id: videoId,
              contentType: 'video',
              orderNumber: order,
            }
          });
        }
      }

      results.push({
        courseId: course.id,
        title: course.title,
        lessonsSynced: ytVideos.items.length,
      });
    }

    return NextResponse.json({ success: true, synced: results });
  } catch (error: any) {
    console.error('YouTube Sync Error:', error);
    return NextResponse.json({ error: error.message || 'Sync failed' }, { status: 500 });
  }
}

