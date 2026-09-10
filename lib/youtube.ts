import { google } from 'googleapis';
import { prisma } from '@/lib/prisma';
import { decrypt, encrypt } from '@/lib/encryption';
import { Readable } from 'stream';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;
// Used for public display/search fallback
const YOUTUBE_HANDLE = process.env.YOUTUBE_HANDLE || '@mohit.raj.8503';

// Cache for channel ID to avoid frequent lookups
let cachedChannelId: string | null = null;

// --- Types ---
export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: string;
  channelTitle: string;
  liveBroadcastContent: 'live' | 'upcoming' | 'none';
  scheduledStartTime?: string;
  actualStartTime?: string;
  concurrentViewers?: string;
}

// --- Public Client (Read-Only) ---
const youtubePublic = google.youtube({
  version: 'v3',
  auth: YOUTUBE_API_KEY,
});

/**
 * Gets a valid YouTube access token for a user, refreshing it if necessary.
 */
export async function getValidYouTubeAccessToken(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      youtubeAccessToken: true,
      youtubeRefreshToken: true,
      youtubeTokenExpiry: true,
    }
  });

  if (!user || !user.youtubeAccessToken || !user.youtubeRefreshToken) {
    return null;
  }

  const accessToken = decrypt(user.youtubeAccessToken);
  const refreshToken = decrypt(user.youtubeRefreshToken);

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_ID,
    process.env.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_SECRET,
    `${process.env.NEXT_PUBLIC_APP_URL}/api/youtube/callback`
  );

  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
    expiry_date: user.youtubeTokenExpiry ? new Date(user.youtubeTokenExpiry).getTime() : undefined
  });

  // Check if token is expired (or expires soon)
  const isExpired = user.youtubeTokenExpiry
    ? new Date(user.youtubeTokenExpiry).getTime() <= Date.now() + 60000
    : true;

  if (isExpired) {
    try {
      const { credentials } = await oauth2Client.refreshAccessToken();
      const newAccessToken = credentials.access_token;

      if (newAccessToken) {
        // Update DB with new token
        await prisma.user.update({
          where: { id: userId },
          data: {
            youtubeAccessToken: encrypt(newAccessToken),
            youtubeTokenExpiry: credentials.expiry_date ? new Date(credentials.expiry_date).toISOString() : undefined
          }
        });
        return newAccessToken;
      }
    } catch (error) {
      console.error('Failed to refresh YouTube token:', error);
      return null;
    }
  }

  return accessToken;
}

export async function getValidGlobalYouTubeAccessToken(): Promise<string | null> {
  const token = await prisma.youtubeAuthToken.findFirst();
  if (!token || !token.refreshToken) {
    return null;
  }

  const refreshToken = decrypt(token.refreshToken);
  let accessToken = token.accessToken ? decrypt(token.accessToken) : null;

  const YOUTUBE_CLIENT_ID = process.env.YOUTUBE_CLIENT_ID;
  const YOUTUBE_CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET;

  const oauth2Client = new google.auth.OAuth2(
    YOUTUBE_CLIENT_ID,
    YOUTUBE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_APP_URL || 'https://sarthi-woad.vercel.app'}/api/admin/youtube/oauth/callback`
  );

  oauth2Client.setCredentials({
    access_token: accessToken || undefined,
    refresh_token: refreshToken,
    expiry_date: token.expiresAt ? new Date(token.expiresAt).getTime() : undefined
  });

  const isExpired = token.expiresAt
    ? new Date(token.expiresAt).getTime() <= Date.now() + 60000
    : true;

  if (isExpired || !accessToken) {
    try {
      const { credentials } = await oauth2Client.refreshAccessToken();
      const newAccessToken = credentials.access_token;

      if (newAccessToken) {
        await prisma.youtubeAuthToken.update({
          where: { id: token.id },
          data: {
            accessToken: encrypt(newAccessToken),
            expiresAt: credentials.expiry_date ? new Date(credentials.expiry_date) : undefined
          }
        });
        return newAccessToken;
      }
    } catch (error) {
      console.error('Failed to refresh global YouTube token:', error);
      return null;
    }
  }

  return accessToken;
}

// --- Authenticated Client (for Uploads/Broadcasts) ---
// Retrieves an authenticated client for a specific user, fallback to global or first Admin.
async function getAuthenticatedClient(userId?: string) {
  if (!userId) {
    const globalAccessToken = await getValidGlobalYouTubeAccessToken();
    if (globalAccessToken) {
      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({ access_token: globalAccessToken });
      return google.youtube({
        version: 'v3',
        auth: oauth2Client
      });
    }
  }

  let targetUserId: string = userId || '';

  if (!targetUserId) {
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN', youtubeAccessToken: { not: null } },
      select: { id: true }
    });
    if (!adminUser) throw new Error('No Admin or global token found with YouTube connected');
    targetUserId = adminUser.id;
  }

  const accessToken = await getValidYouTubeAccessToken(targetUserId);
  if (!accessToken) throw new Error('Could not get valid access token');

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });

  return google.youtube({
    version: 'v3',
    auth: oauth2Client
  });
}

// --- Helper Functions ---

async function getChannelId(): Promise<string | null> {
  if (YOUTUBE_CHANNEL_ID) return YOUTUBE_CHANNEL_ID;
  if (cachedChannelId) return cachedChannelId;

  if (!YOUTUBE_API_KEY) {
    console.warn('YOUTUBE_API_KEY is not set');
    return null;
  }

  try {
    const response = await youtubePublic.search.list({
      part: ['snippet'],
      q: YOUTUBE_HANDLE,
      type: ['channel'],
      maxResults: 1,
    });

    if (response.data.items && response.data.items.length > 0) {
      cachedChannelId = response.data.items[0].id?.channelId || null;
      return cachedChannelId;
    }
  } catch (error) {
    console.error('Error fetching channel ID:', error);
  }
  return null;
}

export async function getLiveStatus() {
  const channelId = await getChannelId();
  if (!channelId || !YOUTUBE_API_KEY) return { live: null, upcoming: [], replays: [] };

  try {
    // 1. Get Live Video
    const liveResponse = await youtubePublic.search.list({
      part: ['snippet'],
      channelId: channelId,
      eventType: 'live',
      type: ['video'],
      maxResults: 1,
    });

    let liveVideo: YouTubeVideo | null = null;
    if (liveResponse.data.items && liveResponse.data.items.length > 0) {
      const videoId = liveResponse.data.items[0].id?.videoId;
      if (videoId) {
        const videoDetails = await youtubePublic.videos.list({
          part: ['liveStreamingDetails', 'snippet', 'statistics'],
          id: [videoId],
        });

        const details = videoDetails.data.items?.[0];
        if (details) {
          liveVideo = {
            id: videoId,
            title: details.snippet?.title || '',
            description: details.snippet?.description || '',
            thumbnailUrl: details.snippet?.thumbnails?.high?.url || '',
            publishedAt: details.snippet?.publishedAt || '',
            channelTitle: details.snippet?.channelTitle || '',
            liveBroadcastContent: 'live',
            actualStartTime: details.liveStreamingDetails?.actualStartTime || undefined,
            concurrentViewers: details.liveStreamingDetails?.concurrentViewers || undefined,
          };
        }
      }
    }

    // 2. Get Upcoming Videos
    const upcomingResponse = await youtubePublic.search.list({
      part: ['snippet'],
      channelId: channelId,
      eventType: 'upcoming',
      type: ['video'],
      order: 'date',
      maxResults: 3,
    });

    const upcomingVideos: YouTubeVideo[] = [];
    if (upcomingResponse.data.items) {
      for (const item of upcomingResponse.data.items) {
        const videoId = item.id?.videoId;
        if (videoId) {
          const videoDetails = await youtubePublic.videos.list({
            part: ['liveStreamingDetails', 'snippet'],
            id: [videoId],
          });
          const details = videoDetails.data.items?.[0];
          if (details) {
            upcomingVideos.push({
              id: videoId,
              title: details.snippet?.title || '',
              description: details.snippet?.description || '',
              thumbnailUrl: details.snippet?.thumbnails?.high?.url || '',
              publishedAt: details.snippet?.publishedAt || '',
              channelTitle: details.snippet?.channelTitle || '',
              liveBroadcastContent: 'upcoming',
              scheduledStartTime: details.liveStreamingDetails?.scheduledStartTime || undefined,
            });
          }
        }
      }
    }

    // 3. Get Replays (Completed streams)
    const replaysResponse = await youtubePublic.search.list({
      part: ['snippet'],
      channelId: channelId,
      eventType: 'completed',
      type: ['video'],
      order: 'date',
      maxResults: 5,
    });

    const replays: YouTubeVideo[] = [];
    if (replaysResponse.data.items) {
      const videoIds = replaysResponse.data.items.map(item => item.id?.videoId).filter(Boolean) as string[];
      if (videoIds.length > 0) {
        const videosDetails = await youtubePublic.videos.list({
          part: ['contentDetails', 'snippet', 'statistics'],
          id: videoIds as string[]
        });

        if (videosDetails.data.items) {
          videosDetails.data.items.sort((a, b) =>
            new Date(b.snippet?.publishedAt || 0).getTime() - new Date(a.snippet?.publishedAt || 0).getTime()
          );

          for (const details of videosDetails.data.items) {
            replays.push({
              id: details.id || '',
              title: details.snippet?.title || '',
              description: details.snippet?.description || '',
              thumbnailUrl: details.snippet?.thumbnails?.high?.url || '',
              publishedAt: details.snippet?.publishedAt || '',
              channelTitle: details.snippet?.channelTitle || '',
              liveBroadcastContent: 'none',
            });
          }
        }
      }
    }

    return {
      live: liveVideo,
      upcoming: upcomingVideos,
      replays: replays,
    };

  } catch (error) {
    console.error('YouTube API Error:', error);
    return { live: null, upcoming: [], replays: [] };
  }
}

// --- Authenticated Actions ---

/**
 * Creates a PRIVATE live broadcast on the Admin's channel.
 * 
 * Flow:
 * 1. Create Broadcast (sets title, time, privacy=private)
 * 2. Create Stream (defines ingestion settings)
 * 3. Bind Broadcast to Stream
 */
export async function createPrivateBroadcast(
  title: string,
  description: string,
  scheduledStartTime: string
) {
  const youtubeAuth = await getAuthenticatedClient();

  // 1. Insert Broadcast
  const broadcastRes = await youtubeAuth.liveBroadcasts.insert({
    part: ['snippet', 'status', 'contentDetails'],
    requestBody: {
      snippet: {
        title,
        description,
        scheduledStartTime,
      },
      status: {
        privacyStatus: 'unlisted', // Changed from private to unlisted to allow embedding
        selfDeclaredMadeForKids: false,
      },
      contentDetails: {
        enableAutoStart: true,
        enableAutoStop: true,
      }
    }
  });

  const broadcastId = broadcastRes.data.id;
  if (!broadcastId) throw new Error('Failed to create broadcast');

  // 2. Insert Stream
  const streamRes = await youtubeAuth.liveStreams.insert({
    part: ['snippet', 'cdn'],
    requestBody: {
      snippet: {
        title: `Stream for ${title}`,
      },
      cdn: {
        frameRate: '30fps',
        ingestionType: 'rtmp',
        resolution: '1080p',
      }
    }
  });

  const streamId = streamRes.data.id;
  if (!streamId) throw new Error('Failed to create stream');

  // 3. Bind
  await youtubeAuth.liveBroadcasts.bind({
    part: ['id', 'contentDetails'],
    id: broadcastId,
    streamId: streamId,
  });

  return {
    broadcastId,
    streamId,
    streamKey: streamRes.data.cdn?.ingestionInfo?.streamName, // Key needed for OBS/Streaming software
    ingestionAddress: streamRes.data.cdn?.ingestionInfo?.ingestionAddress,
    youtubeUrl: `https://youtu.be/${broadcastId}`
  };
}

/**
 * Uploads a video as PRIVATE to the specified user's channel (or Admin's as fallback).
 */
export async function uploadPrivateVideo(
  fileBuffer: Buffer,
  title: string,
  description: string,
  userId?: string
) {
  const youtubeAuth = await getAuthenticatedClient(userId);
  const readable = new Readable();
  readable.push(fileBuffer);
  readable.push(null);

  const res = await youtubeAuth.videos.insert({
    part: ['snippet', 'status'],
    requestBody: {
      snippet: {
        title,
        description,
      },
      status: {
        privacyStatus: 'unlisted', // Changed from private to unlisted for embedding
        selfDeclaredMadeForKids: false,
      },
    },
    media: {
      body: readable,
    },
  });

  return {
    videoId: res.data.id,
    youtubeUrl: `https://youtu.be/${res.data.id}`
  };
}

/**
 * Ends a live broadcast by transitioning its status to completed.
 */
export async function endYouTubeBroadcast(broadcastId: string) {
  const youtubeAuth = await getAuthenticatedClient();
  try {
    const res = await youtubeAuth.liveBroadcasts.transition({
      id: broadcastId,
      broadcastStatus: 'complete',
      part: ['id', 'status']
    });
    return res.data;
  } catch (error) {
    console.error(`Error transitioning YouTube broadcast ${broadcastId}:`, error);
    throw error;
  }
}

/**
 * Deletes a YouTube video.
 */
export async function deleteYouTubeVideo(videoId: string) {
  const youtubeAuth = await getAuthenticatedClient();
  try {
    await youtubeAuth.videos.delete({
      id: videoId
    });
    return true;
  } catch (error) {
    console.error(`Error deleting YouTube video ${videoId}:`, error);
    throw error;
  }
}


// --- Dedicated Live Session Helpers (Next.js Cache Optimized) ---
const CACHE_CHANNEL_ID = process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID || process.env.YOUTUBE_CHANNEL_ID || '';
const BASE_URL = "https://www.googleapis.com/youtube/v3";

export async function getCurrentLiveStream(): Promise<{
  videoId: string | null;
  title: string | null;
  thumbnail: string | null;
}> {
  if (!YOUTUBE_API_KEY) return { videoId: null, title: null, thumbnail: null };
  try {
    const res = await fetch(
      `${BASE_URL}/search?part=snippet&channelId=${CACHE_CHANNEL_ID}&type=video&eventType=live&key=${YOUTUBE_API_KEY}`,
      { next: { revalidate: 30 } } as any // recheck every 30 seconds
    );
    const data = await res.json();

    if (data.items && data.items.length > 0) {
      const item = data.items[0];
      return {
        videoId: item.id?.videoId,
        title: item.snippet?.title,
        thumbnail: item.snippet?.thumbnails?.high?.url || null,
      };
    }
    return { videoId: null, title: null, thumbnail: null };
  } catch (error) {
    console.error("YouTube Live fetch error:", error);
    return { videoId: null, title: null, thumbnail: null };
  }
}

export async function getChannelVideos(maxResults = 20) {
  if (!YOUTUBE_API_KEY) return [];
  try {
    const res = await fetch(
      `${BASE_URL}/search?part=snippet&channelId=${CACHE_CHANNEL_ID}&type=video&order=date&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}`,
      { next: { revalidate: 3600 } } as any
    );
    const data = await res.json();
    return data.items || [];
  } catch (error) {
    console.error("YouTube videos fetch error:", error);
    return [];
  }
}

export async function getVideoDetails(videoId: string) {
  if (!YOUTUBE_API_KEY) return null;
  try {
    const res = await fetch(
      `${BASE_URL}/videos?part=snippet,contentDetails,status,liveStreamingDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`,
      { next: { revalidate: 60 } } as any
    );
    const data = await res.json();
    return data.items?.[0] || null;
  } catch (error) {
    console.error("YouTube video details error:", error);
    return null;
  }
}

export async function isVideoLive(videoId: string): Promise<boolean> {
  const details = await getVideoDetails(videoId);
  return details?.snippet?.liveBroadcastContent === "live";
}

export async function getUpcomingStreams() {
  if (!YOUTUBE_API_KEY) return [];
  try {
    const res = await fetch(
      `${BASE_URL}/search?part=snippet&channelId=${CACHE_CHANNEL_ID}&type=video&eventType=upcoming&key=${YOUTUBE_API_KEY}`,
      { next: { revalidate: 300 } } as any
    );
    const data = await res.json();
    return data.items || [];
  } catch (error) {
    console.error("YouTube upcoming streams error:", error);
    return [];
  }
}
