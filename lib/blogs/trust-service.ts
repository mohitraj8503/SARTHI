import { prisma } from '@/lib/prisma';

export const BLOG_TRUST_CONFIG = {
  MIN_SCORE_FOR_TRUST: 50,
  MAX_STRIKES: 3,
  REWARDS: {
    APPROVED: 10,
    ENGAGEMENT_MILESTONE: 5,
  },
  PENALTIES: {
    REJECTED: -15,
    REPORTED: -20,
    STRIKE: 0, // Strikes are separate counter
  }
};

export class BlogTrustService {
  /**
   * Updates a user's trust score and evaluates their trusted status
   */
  static async updateTrustScore(userId: string, change: number, isStrike: boolean = false) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { blogTrustScore: true, blogStrikes: true, isBlogTrusted: true }
    });

    if (!user) return;

    const newScore = Math.max(0, user.blogTrustScore + change);
    const newStrikes = isStrike ? user.blogStrikes + 1 : user.blogStrikes;

    // Evaluate Trusted Status
    let isTrusted = user.isBlogTrusted;
    if (newScore >= BLOG_TRUST_CONFIG.MIN_SCORE_FOR_TRUST && newStrikes < BLOG_TRUST_CONFIG.MAX_STRIKES) {
      isTrusted = true;
    }

    // Downgrade if strikes exceeded or score drops too low
    if (newStrikes >= BLOG_TRUST_CONFIG.MAX_STRIKES || newScore < 20) {
      isTrusted = false;
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        blogTrustScore: newScore,
        blogStrikes: newStrikes,
        isBlogTrusted: isTrusted
      }
    });

    return { score: newScore, strikes: newStrikes, isTrusted };
  }

  /**
   * Called when a blog is approved by admin
   */
  static async onBlogApproved(userId: string) {
    return this.updateTrustScore(userId, BLOG_TRUST_CONFIG.REWARDS.APPROVED);
  }

  /**
   * Called when a blog is rejected by admin
   */
  static async onBlogRejected(userId: string, withStrike: boolean = false) {
    return this.updateTrustScore(userId, BLOG_TRUST_CONFIG.PENALTIES.REJECTED, withStrike);
  }
}
