import { google } from 'googleapis';
import fs from 'fs';
import { Readable } from 'stream';

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

/**
 * Google Drive Storage Service
 * Handles long-term archival of live class recordings.
 */
export class GoogleDriveService {
  private static driveClient: any = null;

  private static getClient() {
    if (this.driveClient) return this.driveClient;

    const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS || '{}');
    const auth = new google.auth.JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: SCOPES
    });

    this.driveClient = google.drive({ version: 'v3', auth });
    return this.driveClient;
  }

  /**
   * Upload a recording to Google Drive
   */
  static async uploadRecording(filepath: string, filename: string, folderId?: string) {
    const drive = this.getClient();
    
    const fileMetadata = {
      name: filename,
      parents: folderId ? [folderId] : undefined,
    };

    const media = {
      mimeType: 'video/mp4',
      body: fs.createReadStream(filepath),
    };

    try {
      const res = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id',
      });
      return res.data.id;
    } catch (error) {
      console.error('[GoogleDrive] Upload Error:', error);
      throw error;
    }
  }

  /**
   * Get or create a specific folder for a teacher
   */
  static async getTeacherFolder(teacherId: string) {
    const drive = this.getClient();
    try {
      // In a real scenario, we'd search for the folder or create it.
      // For stability, we'll ensure this method exists and returns a default.
      const folderName = `Teacher_${teacherId}`;
      const response = await drive.files.list({
        q: `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
        fields: 'files(id, name)',
      });

      if (response.data.files && response.data.files.length > 0) {
        return response.data.files[0].id;
      }

      // Create folder if not found
      const fileMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
      };
      const folder = await drive.files.create({
        requestBody: fileMetadata,
        fields: 'id',
      });
      return folder.data.id;
    } catch (error) {
      console.error('[GoogleDrive] Folder Sync Error:', error);
      return 'root'; // Fallback to root
    }
  }

  /**
   * Get a readable stream for a file from Drive
   */
  static async getFileStream(fileId: string) {
    const drive = this.getClient();
    try {
      const res = await drive.files.get(
        { fileId, alt: 'media' },
        { responseType: 'stream' }
      );
      return res.data as Readable;
    } catch (error) {
      console.error('[GoogleDrive] Stream Error:', error);
      throw error;
    }
  }
}
