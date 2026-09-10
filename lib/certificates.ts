import { customAlphabet } from 'nanoid';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

/**
 * Helper to derive 2-3 letter course code prefix
 */
export function getCourseCode(courseName?: string): string {
  if (!courseName) return 'GEN';
  const upper = courseName.toUpperCase().trim();
  if (upper.includes('EXCEL')) return 'EX';
  if (upper.includes('PROMPT ENG')) return 'PE';
  if (upper.includes('PYTHON')) return 'PY';
  if (upper.includes('ARTIFICIAL') || upper.includes('AI TOOL') || upper === 'AI') return 'AI';
  if (upper.includes('DATA SCIENCE') || upper.includes('MACHINE LEARNING')) return 'DS';
  if (upper.includes('BUSINESS INTELLIGENCE') || upper.includes('POWER BI')) return 'BIA';
  if (upper.includes('FULL STACK') || upper.includes('WEB DEV')) return 'FS';
  if (upper.includes('GST') || upper.includes('COMMERCE') || upper.includes('ACCOUNT')) return 'CM';
  if (upper.includes('DIGITAL MARKET')) return 'DM';
  if (upper.includes('TALLY')) return 'TL';
  return 'GEN';
}

/**
 * Generates a sequential credential ID for a certificate.
 * Format: TT-{COURSECODE}-{YEAR}-{4_DIGIT_SEQUENTIAL} e.g. TT-EX-2026-0003
 *
 * The sequential number is determined by counting existing certs with the same prefix.
 * Uses server-side DB query to find the next available slot.
 */
export async function generateSequentialCredentialId(courseName?: string): Promise<string> {
  const code = getCourseCode(courseName);
  const year = new Date().getFullYear();
  const prefix = `TT-${code}-${year}-`;

  // Count all existing certs with this prefix to determine next sequential number
  const existingCerts = await prisma.certificate.findMany({
    where: {
      certificateNumber: { startsWith: prefix }
    },
    select: { certificateNumber: true },
    orderBy: { certificateNumber: 'desc' }
  });

  // Find the highest sequential number used
  let maxSeq = 0;
  for (const cert of existingCerts) {
    const suffix = cert.certificateNumber.replace(prefix, '');
    const num = parseInt(suffix, 10);
    if (!isNaN(num) && num > maxSeq) maxSeq = num;
  }

  const nextSeq = maxSeq + 1;
  // Pad to 4 digits: 0001, 0002, 0003, ...
  const paddedSeq = nextSeq.toString().padStart(4, '0');
  return `${prefix}${paddedSeq}`;
}

/**
 * Sync (non-async) fallback for generating credential ID when DB is not available.
 * Uses timestamp-based suffix — only use as a last resort.
 * @deprecated Use generateSequentialCredentialId instead
 */
export function generateCredentialId(courseName?: string): string {
  const code = getCourseCode(courseName);
  const year = new Date().getFullYear();
  const random5Digits = Math.floor(10000 + Math.random() * 90000).toString();
  return `TT-${code}-${year}-${random5Digits}`;
}


/**
 * Generates a SHA256 hash to prevent certificate tampering.
 * Combines essential certificate fields into a single hash.
 */
export function generateCertificateHash(
  userName: string,
  courseName: string,
  issueDate: string | Date,
  credentialId: string
): string {
  const dateStr =
    issueDate instanceof Date ? issueDate.toISOString() : new Date(issueDate).toISOString();

  const dataToHash = userName + courseName + dateStr + credentialId;
  return crypto.createHash('sha256').update(dataToHash).digest('hex');
}

/**
 * Verifies if the provided hash matches the calculated hash for the given certificate details.
 */
export function verifyCertificateHash(
  userName: string,
  courseName: string,
  issueDate: string | Date,
  credentialId: string,
  providedHash: string
): boolean {
  if (!providedHash) return false;
  const calculatedHash = generateCertificateHash(userName, courseName, issueDate, credentialId);
  return calculatedHash === providedHash;
}
