import { prisma } from '@/lib/prisma';
import { AuditLogger } from '@/lib/audit/logger';

export class GDPRService {
  /**
   * Data Subject Access Request (DSAR)
   * Exports all user-related data in a portable format.
   */
  static async exportUserData(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        enrollments: { include: { course: true } },
        submissions: true,
        progress: true,
        certificates: true,
      }
    });
    
    if (!user) throw new Error('User not found');

    // Data minimization: omit sensitive internal fields
    const sanitizedProfile = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      lastActive: user.lastActive,
    };

    const data = {
      profile: sanitizedProfile,
      learning: {
        enrollments: user.enrollments.map(e => ({
          course: e.course.title,
          progress: e.progressPercentage,
          enrolledAt: e.createdAt,
          completedAt: e.completedAt
        })),
        progress: user.progress.map(p => ({
          lessonId: p.lessonId,
          completed: p.completed,
          watchedTime: p.watchedTime
        }))
      },
      achievements: {
        certificates: user.certificates.map(c => ({
          number: c.certificateNumber,
          issuedAt: c.issuedAt,
          url: c.certificateUrl
        }))
      }
    };
    
    await AuditLogger.log({
      userId,
      action: 'GDPR_DATA_EXPORT',
      resource: `user:${userId}`,
      metadata: { requestedAt: new Date().toISOString() }
    });

    return {
      exportId: crypto.randomUUID(),
      data,
      format: 'json',
      generatedAt: new Date().toISOString()
    };
  }
  
  /**
   * Right to be Forgotten
   * Anonymizes user data instead of hard deleting to maintain financial/audit integrity.
   */
  static async anonymizeUser(userId: string) {
    await prisma.$transaction([
      // 1. Anonymize user profile
      prisma.user.update({
        where: { id: userId },
        data: {
          email: `deleted-${userId}@sarthi-woad.vercel.app`,
          name: 'Anonymous User',
          username: null,
          password: null,
          image: null,
          status: 'DELETED',
          onboarded: false
        }
      }),
      // 2. Clear sensitive PII in other tables if necessary
      // ...
    ]);
    
    await AuditLogger.log({
      userId: 'system',
      action: 'GDPR_ANONYMIZATION',
      resource: `user:${userId}`,
      metadata: { status: 'completed' }
    });

    return true;
  }
}
