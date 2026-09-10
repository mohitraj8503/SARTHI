import { google } from 'googleapis';

/**
 * lib/gdrive/client.ts
 *
 * Service-account-based Google Drive client for auto-uploading LiveClass recordings.
 * This is SEPARATE from lib/google-drive.ts which uses per-user OAuth2 tokens.
 *
 * Prerequisites:
 *  - GDRIVE_SERVICE_ACCOUNT_EMAIL  — service account email from GCP
 *  - GDRIVE_PRIVATE_KEY            — private key (\\n-escaped line breaks are normalised)
 *  - GDRIVE_FOLDER_ID              — shared Drive folder ID (share with SA email as Editor)
 */
export function getDriveClient() {
  const email = process.env.GDRIVE_SERVICE_ACCOUNT_EMAIL;
  const key   = process.env.GDRIVE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!email || !key) {
    throw new Error(
      '[gdrive/client] GDRIVE_SERVICE_ACCOUNT_EMAIL or GDRIVE_PRIVATE_KEY is not set. ' +
      'Create a GCP service account, enable Drive API, and add credentials to .env.'
    );
  }

  const auth = new google.auth.JWT({
    email,
    key,
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });

  return google.drive({ version: 'v3', auth });
}
