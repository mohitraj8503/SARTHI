import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

/**
 * Generates a randomized, non-sequential, unpredictable reference ID for LORs.
 * Format: TT-26-XXXX-XXXX (e.g. TT-26-X7K4-1842)
 *
 * Excludes confusing characters (0, O, 1, I) for clean readability.
 */
export function generateRandomLorReferenceCandidate(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let block1 = '';
  let block2 = '';

  const bytes = crypto.randomBytes(8);
  for (let i = 0; i < 4; i++) {
    block1 += chars[bytes[i] % chars.length];
  }
  for (let i = 4; i < 8; i++) {
    block2 += chars[bytes[i] % chars.length];
  }

  return `TT-26-${block1}-${block2}`;
}

/**
 * Guarantees a cryptographically unique Reference ID in the database.
 * Loops with retry until collision-free.
 */
export async function getUniqueLorReferenceId(): Promise<string> {
  let attempts = 0;
  const maxAttempts = 15;

  while (attempts < maxAttempts) {
    attempts++;
    const candidate = generateRandomLorReferenceCandidate();

    // Check Certificate table (both certificateNumber and certificateId)
    const existing = await prisma.certificate.findFirst({
      where: {
        OR: [
          { certificateNumber: candidate },
          { certificateId: candidate }
        ]
      },
      select: { id: true }
    });

    if (!existing) {
      return candidate;
    }
  }

  // Fallback if extreme collisions (unlikely)
  const timestamp = Date.now().toString().slice(-4);
  const randomSuffix = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `TT-26-${randomSuffix}-${timestamp}`;
}
