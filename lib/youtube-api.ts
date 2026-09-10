import { getValidYouTubeAccessToken } from './youtube';

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

export class YouTubeService {
  private async request(userId: string, endpoint: string, options: RequestInit = {}) {
    const accessToken = await getValidYouTubeAccessToken(userId);
    if (!accessToken) {
      throw new Error('Authentication required: No valid YouTube access token allowed');
    }

    const res = await fetch(`${YOUTUBE_API_BASE}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error?.message || 'YouTube API request failed');
    }

    return res.json();
  }

  async createBroadcast(userId: string, title: string, description: string, startTime: Date) {
    // 1. Create Broadcast
    const broadcastResponse = await this.request(
      userId,
      '/liveBroadcasts?part=snippet,status,contentDetails',
      {
        method: 'POST',
        body: JSON.stringify({
          snippet: {
            title,
            description,
            scheduledStartTime: startTime.toISOString(),
          },
          status: {
            privacyStatus: 'unlisted', // Default to unlisted for safety
            selfDeclaredMadeForKids: false,
          },
        }),
      }
    );

    const broadcastId = broadcastResponse.id;

    // 2. Create Stream
    const streamResponse = await this.request(userId, '/liveStreams?part=snippet,cdn', {
      method: 'POST',
      body: JSON.stringify({
        snippet: {
          title: `Stream for ${title}`,
        },
        cdn: {
          format: '1080p',
          ingestionType: 'rtmp',
        },
      }),
    });

    const streamId = streamResponse.id;

    // 3. Bind Broadcast to Stream
    await this.request(
      userId,
      `/liveBroadcasts/bind?id=${broadcastId}&streamId=${streamId}&part=id,contentDetails`,
      {
        method: 'POST',
      }
    );

    return {
      broadcastId,
      streamId,
      ingestionInfo: streamResponse.cdn.ingestionInfo, // Contains RTMP URL
      liveChatId: broadcastResponse.snippet.liveChatId,
    };
  }

  async transitionBroadcast(
    userId: string,
    broadcastId: string,
    status: 'testing' | 'live' | 'complete'
  ) {
    return this.request(
      userId,
      `/liveBroadcasts/transition?id=${broadcastId}&broadcastStatus=${status}&part=id,status`,
      {
        method: 'POST',
      }
    );
  }



  async getChatMessages(userId: string, liveChatId: string, pageToken?: string) {
    let url = `/liveChat/messages?liveChatId=${liveChatId}&part=snippet,authorDetails`;
    if (pageToken) {
      url += `&pageToken=${pageToken}`;
    }
    return this.request(userId, url);
  }

  async getPlaylists(userId: string) {
    return this.request(userId, '/playlists?part=snippet,contentDetails&mine=true&maxResults=50');
  }

  async getPlaylistItems(userId: string, playlistId: string) {
    return this.request(
      userId,
      `/playlistItems?part=snippet,contentDetails&playlistId=${playlistId}&maxResults=50`
    );
  }

  async createPlaylist(userId: string, title: string, description?: string) {
    return this.request(
      userId,
      '/playlists?part=snippet,status',
      {
        method: 'POST',
        body: JSON.stringify({
          snippet: {
            title: `${title} | SARTHI`,
            description: description || `Course playlist for ${title}`,
          },
          status: {
            privacyStatus: 'unlisted',
          },
        }),
      }
    );
  }

  /**
   * Checks if a video is already in a playlist to prevent duplicates.
   */
  async isVideoAlreadyInPlaylist(userId: string, playlistId: string, videoId: string): Promise<{ exists: boolean, itemId?: string }> {
    try {
      const response = await this.request(
        userId,
        `/playlistItems?part=snippet&playlistId=${playlistId}&videoId=${videoId}&maxResults=1`,
        { method: 'GET' }
      );
      if (response.items && response.items.length > 0) {
        return { exists: true, itemId: response.items[0].id };
      }
      return { exists: false };
    } catch (e) {
      console.warn('Failed to verify existing playlist item, assuming false:', e);
      return { exists: false };
    }
  }

  /**
   * Prevents an unauthorized teacher from injecting random videos into their course.
   * Asserts the `videoId` is truly owned by the `expectedChannelId`.
   */
  async verifyVideoBelongsToChannel(userId: string, videoId: string, expectedChannelId: string): Promise<boolean> {
    try {
      const videoDetails = await this.getVideoDetails(userId, videoId);
      if (!videoDetails || !videoDetails.snippet || !videoDetails.snippet.channelId) {
        return false;
      }
      return videoDetails.snippet.channelId === expectedChannelId;
    } catch (e) {
      console.error(`Failed to verify video ownership for ${videoId}:`, e);
      return false;
    }
  }

  /**
   * Adds a video to a YouTube playlist.
   * Used after a live ends to auto-link the recording to the course playlist.
   */
  async addVideoToPlaylist(userId: string, playlistId: string, videoId: string) {
    return this.request(
      userId,
      '/playlistItems?part=snippet',
      {
        method: 'POST',
        body: JSON.stringify({
          snippet: {
            playlistId,
            resourceId: {
              kind: 'youtube#video',
              videoId,
            },
          },
        }),
      }
    );
  }

  /**
   * Fetches details (title, description, duration, thumbnail) for a specific video.
   */
  async getVideoDetails(userId: string, videoId: string) {
    return this.request(
      userId,
      `/videos?part=snippet,contentDetails,liveStreamingDetails&id=${videoId}`
    );
  }

  /**
   * Gets the broadcast details including its bound video ID and lifecycle status.
   * After a live ends, the broadcastId IS the videoId (same ID on YouTube).
   */
  async getBroadcastDetails(userId: string, broadcastId: string) {
    return this.request(
      userId,
      `/liveBroadcasts?part=snippet,status,contentDetails&id=${broadcastId}`
    ).then(res => res.items?.[0] || null);
  }
  /**
   * Initiates a resumable video upload to YouTube.
   * Returns the upload URL (Location header) that the client can use to upload the file.
   */
  async initiateResumableUpload(userId: string, metadata: { title: string, description: string, privacy?: 'private' | 'public' | 'unlisted' }) {
    const { title, description, privacy = 'private' } = metadata;

    const response = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${await getValidYouTubeAccessToken(userId)}`,
        'X-JavaScript-User-Agent': 'SARTHI-Hub',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        snippet: { title, description, categoryId: '27' }, // 27 = Education
        status: { privacyStatus: privacy, selfDeclaredMadeForKids: false }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`YouTube resumable upload initiation failed: ${JSON.stringify(error)}`);
    }

    return response.headers.get('Location');
  }

  /**
   * Fetches the authenticating user's YouTube Channel ID.
   */
  async getMyChannelId(userId: string): Promise<string | null> {
    try {
      const response = await this.request(userId, '/channels?part=id&mine=true');
      return response.items?.[0]?.id || null;
    } catch (e) {
      console.error('Failed to fetch channel ID:', e);
      return null;
    }
  }

  /**
   * Fetches statistics for a specific channel.
   */
  async getChannelStatistics(userId: string, channelId: string) {
    return this.request(userId, `/channels?part=statistics&id=${channelId}`);
  }
}

export const youtubeService = new YouTubeService();
