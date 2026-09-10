import { google } from 'googleapis';
import { prisma } from '@/lib/prisma';
import { decrypt, encrypt } from '@/lib/encryption';
import { Readable } from 'stream';

/**
 * Google Drive Service
 * Manages class recordings and course materials
 */
export class GoogleDriveService {
  /**
   * Gets a valid Google OAuth2 client for a user.
   * Reuses the YouTube/Google credentials already in the database.
   */
  private async getAuthenticatedClient(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        youtubeAccessToken: true,
        youtubeRefreshToken: true,
        youtubeTokenExpiry: true,
      }
    });

    if (!user || !user.youtubeAccessToken || !user.youtubeRefreshToken) {
      throw new Error('Google account not connected');
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_ID,
      process.env.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_SECRET,
      `${process.env.NEXT_PUBLIC_APP_URL}/api/youtube/callback`
    );

    oauth2Client.setCredentials({
      access_token: decrypt(user.youtubeAccessToken),
      refresh_token: decrypt(user.youtubeRefreshToken),
      expiry_date: user.youtubeTokenExpiry ? new Date(user.youtubeTokenExpiry).getTime() : undefined
    });

    return google.drive({ version: 'v3', auth: oauth2Client });
  }

  /**
   * Creates a folder for a course if it doesn't exist
   */
  async getOrCreateCourseFolder(userId: string, courseId: string, courseTitle: string) {
    const drive = await this.getAuthenticatedClient(userId);
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { googleFolderId: true }
    });

    if (course?.googleFolderId) return course.googleFolderId;

    // Create folder
    const fileMetadata = {
      name: `${courseTitle} | SARTHI Recordings`,
      mimeType: 'application/vnd.google-apps.folder',
    };

    const folder = await drive.files.create({
      requestBody: fileMetadata,
      fields: 'id',
    });

    const folderId = folder.data.id;
    if (folderId) {
      await prisma.course.update({
        where: { id: courseId },
        data: { googleFolderId: folderId }
      });
    }

    return folderId;
  }

  /**
   * Uploads a recording file to Google Drive with built-in retry logic
   */
  async uploadRecording(userId: string, folderId: string, filename: string, fileStream: Readable, retries = 3) {
    let attempt = 0;
    while (attempt <= retries) {
      try {
        const drive = await this.getAuthenticatedClient(userId);
        const fileMetadata = { name: filename, parents: [folderId] };
        const media = { mimeType: 'video/mp4', body: fileStream };

        const file = await drive.files.create({
          requestBody: fileMetadata,
          media: media,
          fields: 'id, webViewLink, webContentLink',
        });

        return {
          id: file.data.id,
          webViewLink: file.data.webViewLink,
          webContentLink: file.data.webContentLink,
        };
      } catch (error: any) {
        attempt++;
        if (attempt > retries) throw error;
        const delay = Math.pow(2, attempt) * 1000;
        console.warn(`⚠️ Drive Upload Attempt ${attempt} failed. Retrying in ${delay}ms...`);
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }

  /**
   * Lists all video recordings in a course folder
   */
  async listRecordings(userId: string, folderId: string) {
    const drive = await this.getAuthenticatedClient(userId);
    const response = await drive.files.list({
      q: `'${folderId}' in parents and mimeType contains 'video/' and trashed = false`,
      fields: 'files(id, name, webViewLink, webContentLink, size, createdTime, videoMediaMetadata)',
      orderBy: 'createdTime desc',
    });
    return response.data.files || [];
  }


  /**
   * Gets a direct download/stream link for a file
   */
  async getStreamLink(userId: string, fileId: string) {
    const drive = await this.getAuthenticatedClient(userId);
    const file = await drive.files.get({
      fileId: fileId,
      fields: 'webContentLink',
    });
    return file.data.webContentLink;
  }
}

export const driveService = new GoogleDriveService();
