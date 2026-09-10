import { createHmac } from 'crypto';

const DOC_SIGNING_SECRET = process.env.DOC_SIGNING_SECRET || 'fallback-secret-for-docs-123';

/**
 * Generates a temporary signed URL for sensitive teacher documents.
 */
export function getSecureDocUrl(docPath: string, expiryMinutes = 60): string {
  // If it's already a full URL (external), return it (though usually we store paths)
  if (docPath.startsWith('http')) return docPath;

  const expires = Math.floor(Date.now() / 1000) + (expiryMinutes * 60);
  const dataToSign = `${docPath}:${expires}`;
  
  const signature = createHmac('sha256', DOC_SIGNING_SECRET)
    .update(dataToSign)
    .digest('hex');

  // Using a dedicated doc-proxy route to serve the file
  return `/api/admin/docs/view?path=${encodeURIComponent(docPath)}&expires=${expires}&sig=${signature}`;
}

/**
 * Verifies a signed document URL.
 */
export function verifyDocSignature(docPath: string, expires: number, sig: string): boolean {
  if (Date.now() / 1000 > expires) return false;

  const dataToSign = `${docPath}:${expires}`;
  const expectedSignature = createHmac('sha256', DOC_SIGNING_SECRET)
    .update(dataToSign)
    .digest('hex');

  return sig === expectedSignature;
}
