import { prisma } from './prisma';
import { randomBytes } from 'crypto';

/**
 * Generates a unique referral code.
 * Format: TT-{8 characters}
 */
export async function generateUniqueReferralCode(): Promise<string> {
  let isUnique = false;
  let code = '';

  while (!isUnique) {
    code = `TT-${randomBytes(4).toString('hex').toUpperCase()}`;
    const existing = await prisma.user.findUnique({
      where: { referralCode: code },
    });
    if (!existing) {
      isUnique = true;
    }
  }

  return code;
}

/**
 * Validates and applies a referral code during signup.
 * @param referralCode The code used by the new user
 * @returns The ID of the referrer if valid, null otherwise
 */
export async function validateReferral(referralCode: string): Promise<string | null> {
  if (!referralCode) return null;

  const referrer = await prisma.user.findUnique({
    where: { referralCode },
    select: { id: true, status: true },
  });

  if (!referrer || referrer.status !== 'ACTIVE') {
    return null;
  }

  return referrer.id;
}

/**
 * Handles referral rewards logic
 */
export async function processReferralRewards(referrerId: string, refereeId: string) {
  try {
    // 1. Reward the referrer (e.g., bonus points/XP)
    await prisma.xPTransaction.create({
      data: {
        userId: referrerId,
        amount: 50,
        reason: 'REFERRAL_SUCCESS',
        metadata: JSON.stringify({ refereeId }),
      },
    });

    // 2. Notify the referrer
    await prisma.notification.create({
      data: {
        userId: referrerId,
        title: 'Referral Success!',
        body: 'A new student joined using your link. You earned 50 XP!',
        type: 'SYSTEM',
        isRead: false,
      },
    });

    // 3. Optional: Reward the referee (e.g., welcome bonus)
    await prisma.xPTransaction.create({
      data: {
        userId: refereeId,
        amount: 25,
        reason: 'REFERRAL_JOIN',
        metadata: JSON.stringify({ referrerId }),
      },
    });
  } catch (error) {
    console.error('Error processing referral rewards:', error);
  }
}
