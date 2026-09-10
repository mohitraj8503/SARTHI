/**
 * Validates file content using magic numbers (file signatures) 
 * to prevent MIME type spoofing.
 */
export function validateFileSignature(buffer: Buffer, expectedType: string): boolean {
  const header = buffer.subarray(0, 16).toString('hex').toUpperCase();

  if (expectedType.includes('pdf')) {
    return header.startsWith('25504446'); // %PDF
  }

  if (expectedType.includes('jpeg') || expectedType.includes('jpg')) {
    return header.startsWith('FFD8FF');
  }

  if (expectedType.includes('png')) {
    return header.startsWith('89504E470D0A1A0A');
  }

  if (expectedType.includes('video/mp4')) {
    // MP4 usually has 'ftyp' at offset 4
    return header.slice(8, 16) === '66747970';
  }

  if (expectedType.includes('video/quicktime')) {
    return header.slice(8, 16) === '66747970'; // Often share ftyp
  }

  // Fallback for types we don't strictly check yet
  return true; 
}

/**
 * Ensures the URL belongs to the authorized Cloudinary domain.
 */
export function isAuthorizedCloudinaryUrl(url: string): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.hostname === 'res.cloudinary.com';
  } catch {
    return false;
  }
}
