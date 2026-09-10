import { prisma } from './prisma';

/**
 * Generates a strictly sequential, gap-free Student ID.
 * Format: TT-STU-XXXX (e.g., TT-STU-0001)
 * 
 * Uses row-level locking via Prisma transactions to ensure safety under high concurrency.
 */
export async function generateStudentId(tx: any = prisma): Promise<string> {
  // Use a transaction and lock the counter row
  // In Prisma, we can use an atomic update which returns the updated value
  // This effectively locks the row for the duration of the increment
  const counter = await tx.studentCounter.upsert({
    where: { id: 1 },
    update: { currentValue: { increment: 1 } },
    create: { id: 1, currentValue: 1 },
  });

  const paddedSeq = counter.currentValue.toString().padStart(4, '0');
  return `TT-STU-${paddedSeq}`;
}

/**
 * Assigns a strictly sequential ID to a user if they don't have one.
 * Typically called during onboarding or student approval.
 */
export async function ensureStudentId(userId: string, tx: any = prisma): Promise<string | null> {
  return await tx['$transaction'](async (innerTx: any) => {
    const user = await innerTx.user.findUnique({
      where: { id: userId },
      select: { id: true, studentId: true, role: true }
    });

    if (!user || user.studentId) return user?.studentId || null;

    // Only students get the TT-STU- prefix
    if (user.role !== 'STUDENT') return null;

    const newId = await generateStudentId(innerTx);

    await innerTx.user.update({
      where: { id: userId },
      data: { studentId: newId }
    });

    return newId;
  }, {
    isolationLevel: 'Serializable', // Ensure maximum safety
  });
}
