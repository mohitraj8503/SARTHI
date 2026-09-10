/**
 * Utility functions for parsing and formatting video URLs across SARTHI.
 */

/**
 * Extracts Google Drive File ID from any Google Drive URL format.
 * Examples handled:
 * - https://drive.google.com/file/d/1A2B3C4D5E6F7G8H9/view?usp=sharing
 * - https://drive.google.com/file/d/1A2B3C4D5E6F7G8H9/view
 * - https://drive.google.com/open?id=1A2B3C4D5E6F7G8H9
 * - https://drive.google.com/uc?id=1A2B3C4D5E6F7G8H9&export=download
 * - https://lh3.googleusercontent.com/d/1A2B3C4D5E6F7G8H9
 * - Raw File ID string
 */
export function extractGoogleDriveFileId(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  // Pattern 1: /file/d/FILE_ID
  const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileDMatch && fileDMatch[1]) return fileDMatch[1];

  // Pattern 2: id=FILE_ID
  const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idParamMatch && idParamMatch[1]) return idParamMatch[1];

  // Pattern 3: googleusercontent.com/d/FILE_ID
  const userContentMatch = trimmed.match(/googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/);
  if (userContentMatch && userContentMatch[1]) return userContentMatch[1];

  // Pattern 4: Raw file ID format check (alphanumeric with hyphens/underscores, 25 to 50 chars)
  if (!trimmed.includes('/') && !trimmed.includes('.') && /^[a-zA-Z0-9_-]{25,50}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

/**
 * Converts any Google Drive URL (including /view URLs) into a direct, playable video stream URL.
 */
export function getGoogleDriveDirectUrl(url: string | null | undefined): string {
  if (!url) return '';
  const fileId = extractGoogleDriveFileId(url);
  if (fileId) {
    return `https://drive.usercontent.google.com/download?export=download&id=${fileId}&confirm=t`;
  }
  return url;
}

/**
 * Returns Google Drive iframe preview embed URL as fallback.
 */
export function getGoogleDriveEmbedUrl(url: string | null | undefined): string {
  if (!url) return '';
  const fileId = extractGoogleDriveFileId(url);
  if (fileId) {
    return `https://drive.google.com/file/d/${fileId}/preview`;
  }
  return url;
}
