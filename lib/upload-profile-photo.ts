import fs from 'fs';
import path from 'path';

/**
 * Handles saving avatar/profile photo to local disk (`/public/uploads/profile-photos/`).
 * If given a Base64 data URI (data:image/...), decodes and writes it to disk, returning `/uploads/profile-photos/profile-<userId>.<ext>`.
 * If given an HTTP URL or existing local path, returns it directly.
 * If given null or empty string, returns null.
 */
export async function processProfileImage(userId: string, imageInput?: string | null): Promise<string | null | undefined> {
  if (imageInput === undefined) return undefined;
  if (!imageInput || imageInput.trim() === '') return null;

  // If already a hosted URL or local path, don't re-process
  if (imageInput.startsWith('http://') || imageInput.startsWith('https://') || imageInput.startsWith('/uploads/')) {
    return imageInput;
  }

  // If Base64 data URI
  if (imageInput.startsWith('data:image/')) {
    const match = imageInput.match(/^data:image\/([a-zA-Z0-9+]+);base64,([\s\S]+)$/);
    if (!match) {
      return null;
    }

    let ext = match[1].toLowerCase();
    if (ext === 'jpeg') ext = 'jpg';
    if (ext !== 'jpg' && ext !== 'png' && ext !== 'webp' && ext !== 'gif') ext = 'png';

    const base64Data = match[2];
    const buffer = Buffer.from(base64Data, 'base64');

    const targetDir = path.join(process.cwd(), 'public', 'uploads', 'profile-photos');
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const fileName = `profile-${userId}.${ext}`;
    const filePath = path.join(targetDir, fileName);
    fs.writeFileSync(filePath, buffer);

    return `/uploads/profile-photos/${fileName}`;
  }

  return imageInput;
}
