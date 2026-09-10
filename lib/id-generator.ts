import { generateEnrollmentNumber } from './enrollment';

/**
 * Scalable User ID Generator (Production-Safe Wrapper)
 * Format: TT-{ROLE}-{YY}-{XXXX}
 * Example: TT-STU-26-0001
 */
export async function generateUniqueUserId(role: 'STUDENT' | 'TEACHER' | 'ADMIN', tx?: any) {
  // Use the new atomic implementation
  return generateEnrollmentNumber(role);
}

/**
 * Professional Teacher/Faculty ID Generator
 * Format: TT-FAC-XXXX
 */
export async function generateTeacherId(tx?: any) {
  return generateEnrollmentNumber('TEACHER');
}
