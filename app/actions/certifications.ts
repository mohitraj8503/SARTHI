'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import { revalidatePath } from 'next/cache';

async function getCurrentUserId(): Promise<string | null> {
  const session = await getSession();
  return session?.userId || null;
}

export async function getCertificationAttempt(identifier: string) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Unauthorized');

  const certification = await prisma.certification.findFirst({
    where: { 
      OR: [
        { id: identifier },
        { slug: identifier }
      ]
    },
  });

  if (!certification) throw new Error('Certification not found');

  return await prisma.certificationAttempt.findFirst({
    where: {
      userId,
      certificationId: certification.id,
      status: 'IN_PROGRESS',
    },
    orderBy: { startedAt: 'desc' },
  });
}

export async function startCertificationAttempt(identifier: string) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Unauthorized');

  const certification = await prisma.certification.findFirst({
    where: { 
      OR: [
        { id: identifier },
        { slug: identifier }
      ]
    },
  });

  if (!certification) throw new Error('Certification not found');

  // Check for existing in-progress attempt
  const existingInProgress = await prisma.certificationAttempt.findFirst({
    where: {
      userId,
      certificationId: certification.id,
      status: 'IN_PROGRESS',
    },
  });

  if (existingInProgress) {
    return existingInProgress;
  }

  // Create new attempt
  const attemptCount = await prisma.certificationAttempt.count({
    where: { userId, certificationId: certification.id },
  });

  return await prisma.certificationAttempt.create({
    data: {
      userId,
      certificationId: certification.id,
      status: 'IN_PROGRESS',
      attemptNumber: attemptCount + 1,
      answers: JSON.stringify({}),
      totalQuestions: 15, // Hardcoded for now
    },
  });
}

export async function updateCertificationAttempt(
  attemptId: string, 
  data: { 
    answers: any; 
    tabSwitchCount?: number; 
    timeTaken?: number;
    markedForReview?: string[];
  }
) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Unauthorized');

  return await prisma.certificationAttempt.update({
    where: { id: attemptId, userId },
    data: {
      answers: JSON.stringify(data.answers),
      tabSwitchCount: data.tabSwitchCount,
      timeTaken: data.timeTaken,
      // Note: markedForReview isn't in the schema, we can store it in the JSON answers if needed
      // but for now let's stick to the schema fields.
    },
  });
}

export async function submitCertificationAttempt(
  attemptId: string, 
  data: { 
    answers: any; 
    score: number; 
    passed: boolean;
    timeTaken: number;
    tabSwitchCount: number;
  }
) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Unauthorized');

  const result = await prisma.certificationAttempt.update({
    where: { id: attemptId, userId },
    data: {
      answers: JSON.stringify(data.answers),
      score: data.score,
      passed: data.passed,
      timeTaken: data.timeTaken,
      tabSwitchCount: data.tabSwitchCount,
      status: 'COMPLETED',
      completedAt: new Date(),
    },
  });

  // If passed, issue a certificate (disabled: now handled post-payment via claim flow)
  /*
  if (data.passed) {
    const verificationId = `TT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    await prisma.issuedCertificate.create({
      data: {
        userId,
        certificationId: result.certificationId,
        verificationId,
        score: data.score,
        issuedAt: new Date(),
        // For now, we'll use a dynamic link to the verification page
        certificateUrl: `/certification-exams/verify/${verificationId}`,
      }
    });
  }
  */

  revalidatePath('/certification-exams');
  revalidatePath(`/certification-exams/${result.certificationId}/assessment`);
  
  return result;
}

export async function getUserCertificationStats(identifier: string) {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const certification = await prisma.certification.findFirst({
    where: { 
      OR: [
        { id: identifier },
        { slug: identifier }
      ]
    },
  });

  if (!certification) return null;

  const attempts = await prisma.certificationAttempt.findMany({
    where: { userId, certificationId: certification.id },
    orderBy: { startedAt: 'desc' },
  });

  const bestAttempt = attempts.reduce((best, curr) => {
    if (!best || (curr.score || 0) > (best.score || 0)) return curr;
    return best;
  }, null as any);

  return {
    attemptsCount: attempts.length,
    bestScore: bestAttempt?.score || 0,
    hasPassed: attempts.some(a => a.passed),
    latestAttempt: attempts[0],
    inProgressAttempt: attempts.find(a => a.status === 'IN_PROGRESS'),
  };
}

