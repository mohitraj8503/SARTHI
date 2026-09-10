import { prisma } from './prisma';

/**
 * Generates a production-safe, sequential enrollment number using an atomic database counter.
 * Format: TT-{ROLE}-{XXXX}
 * Example: TT-STU-0001, TT-FAC-0001
 * 
 * This implementation uses Prisma's atomic update to handle concurrency safely.
 */
export async function generateEnrollmentNumber(role: string, tx: any = prisma): Promise<string> {
  // Standardize role codes
  let roleCode = 'STU';
  const upperRole = role.toUpperCase();
  
  if (upperRole === 'TEACHER' || upperRole === 'ADMIN' || upperRole === 'INSTRUCTOR' || upperRole === 'FACULTY') {
    roleCode = 'FAC';
  } else if (upperRole === 'MENTOR') {
    roleCode = 'MNT';
  }
  
  // Year-independent counter key for strict sequence integrity
  const counterId = `enrollment_v2_global_${roleCode}`;

  try {
    // Atomic upsert and increment
    const counter = await tx.systemCounter.upsert({
      where: { id: counterId },
      update: { seq: { increment: 1 } },
      create: { id: counterId, seq: 1 },
    });

    const paddedSeq = counter.seq.toString().padStart(4, '0');
    return `TT-${roleCode}-${paddedSeq}`;
  } catch (error) {
    console.error('Failed to generate enrollment number:', error);
    throw new Error('Could not generate unique enrollment number. Please try again.');
  }
}

/**
 * Ensures a user has an enrollment number assigned.
 * Should be called after onboarding or during the first login after migration.
 */
export async function ensureUserEnrollmentNumber(userId: string, tx: any = prisma): Promise<string | null> {
  const user = await tx.user.findUnique({
    where: { id: userId },
    select: { id: true, enrollmentNumber: true, role: true },
  });

  if (!user) return null;

  // If already assigned, return it
  if (user.enrollmentNumber) {
    return user.enrollmentNumber;
  }

  // Generate and assign new number
  const enrollmentNumber = await generateEnrollmentNumber(user.role, tx);
  
  await tx.user.update({
    where: { id: userId },
    data: { enrollmentNumber },
  });

  return enrollmentNumber;
}

/**
 * Gets the next sequential enrollment number for a course enrollment.
 */
export async function nextEnrollmentNo(tx: any = prisma): Promise<number> {
    const counterId = 'course_enrollment_global';
    const counter = await tx.systemCounter.upsert({
        where: { id: counterId },
        update: { seq: { increment: 1 } },
        create: { id: counterId, seq: 1 },
    });
    return counter.seq;
}

/**
 * Generates a unique enrollment code based on the sequence number.
 * Format: ENR-{YYYY}-{XXXXX}
 */
export async function nextEnrollmentCode(n: number, tx: any = prisma): Promise<string> {
    const year = new Date().getFullYear();
    const padded = n.toString().padStart(5, '0');
    return `ENR-${year}-${padded}`;
}

// Alias for backward compatibility if needed
export const ensureUserEnrollment = ensureUserEnrollmentNumber;
