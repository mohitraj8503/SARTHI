import { prisma } from '../prisma';

export type UnifiedCertificateStatus = 'VALID' | 'PENDING_PAYMENT' | 'REFUNDED' | 'REVOKED' | 'EXPIRED' | 'UNATTEMPTED';

export interface UpdateStatusParams {
  verificationId?: string | null;
  certificateNumber?: string | null;
  userId?: string | null;
  certificationId?: string | null;
  status: UnifiedCertificateStatus;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  attemptId?: string | null;
  amount?: number;
}

export interface AuthoritativeStatusResult {
  status: UnifiedCertificateStatus;
  isPaid: boolean;
  canPrint: boolean;
  canView: boolean;
  canShare: boolean;
  certificateNumber: string | null;
  userId: string | null;
  certificationId: string | null;
  issuedCertRecord?: any;
  certRecord?: any;
}

/**
 * Single Source of Truth Service for Certificate Status Mutations & Queries
 * Ensures atomic updates across both `Certificate` and `IssuedCertificate` models.
 */
export async function updateCertificateStatusAtomic(params: UpdateStatusParams) {
  const {
    verificationId,
    certificateNumber,
    userId,
    certificationId,
    status,
    razorpayOrderId,
    razorpayPaymentId,
    attemptId,
    amount
  } = params;

  const targetId = verificationId || certificateNumber;
  console.log(`[STATUS_SERVICE] Updating certificate status atomically to '${status}' for targetId=${targetId}, userId=${userId}`);

  return await prisma.$transaction(async (tx) => {
    let updatedIssuedCount = 0;
    let updatedCertCount = 0;

    // 1. Find and update IssuedCertificate model if present
    if (targetId || razorpayOrderId) {
      const issuedMatches = await tx.issuedCertificate.findMany({
        where: {
          OR: [
            ...(targetId ? [{ verificationId: targetId }] : []),
            ...(razorpayOrderId ? [{ razorpayOrderId }] : []),
            ...(userId && certificationId ? [{ userId, certificationId }] : [])
          ]
        }
      });

      for (const issued of issuedMatches) {
        await tx.issuedCertificate.update({
          where: { id: issued.id },
          data: {
            status,
            razorpayOrderId: razorpayOrderId || issued.razorpayOrderId,
            razorpayPaymentId: razorpayPaymentId || issued.razorpayPaymentId,
            certificateUrl: status === 'VALID' ? `/certification-exams/verify/${issued.verificationId}` : issued.certificateUrl
          }
        });
        updatedIssuedCount++;
      }
    }

    // 2. Find and update Certificate fallback model if present
    if (targetId || (userId && certificationId)) {
      const certMatches = await tx.certificate.findMany({
        where: {
          OR: [
            ...(targetId ? [{ certificateNumber: targetId }, { id: targetId }] : []),
            ...(userId && certificationId ? [{ userId, courseId: certificationId }] : [])
          ]
        }
      });

      for (const cert of certMatches) {
        await tx.certificate.update({
          where: { id: cert.id },
          data: { status }
        });
        updatedCertCount++;
      }
    }

    // 3. Upsert or update CertificationPayment record
    if (attemptId || (userId && certificationId) || razorpayOrderId || razorpayPaymentId) {
      const paymentAttemptId = attemptId || `payment_${razorpayOrderId || razorpayPaymentId || targetId}`;
      const paymentStatus = status === 'VALID' ? 'COMPLETED' : status === 'REFUNDED' ? 'REFUNDED' : 'PENDING';

      try {
        await tx.certificationPayment.upsert({
          where: { attemptId: paymentAttemptId },
          update: {
            status: paymentStatus,
            paymentGatewayPaymentId: razorpayPaymentId || undefined,
            paymentGatewayOrderId: razorpayOrderId || undefined
          },
          create: {
            attemptId: paymentAttemptId,
            userId: userId || 'unknown_user',
            certificationId: certificationId || 'unknown_cert',
            amount: amount || 2000,
            status: paymentStatus,
            paymentGatewayPaymentId: razorpayPaymentId,
            paymentGatewayOrderId: razorpayOrderId
          }
        });
      } catch (e: any) {
        console.warn(`[STATUS_SERVICE] Payment record upsert notice:`, e.message);
      }
    }

    console.log(`[STATUS_SERVICE] Atomic transaction complete. Updated ${updatedIssuedCount} IssuedCertificate rows and ${updatedCertCount} Certificate rows.`);

    // If status transitioned to VALID, trigger single source of truth HTML snapshot capture asynchronously
    if (status === 'VALID' && targetId) {
      setTimeout(async () => {
        try {
          const { captureCertificateSnapshot } = await import('../certificate/captureCertificateSnapshot');
          await captureCertificateSnapshot({
            certificateNumber: targetId,
            userId: userId || undefined,
            courseId: certificationId || undefined
          });
        } catch (genErr) {
          console.error('[STATUS_SERVICE] Error capturing HTML snapshot on VALID status:', genErr);
        }
      }, 50);
    }

    return { updatedIssuedCount, updatedCertCount, status };
  });
}

/**
 * Queries both models and returns the single authoritative certificate status.
 */
export async function getAuthoritativeCertificateStatus(identifier: string): Promise<AuthoritativeStatusResult> {
  const [issuedCert, baseCert] = await Promise.all([
    prisma.issuedCertificate.findFirst({
      where: { OR: [{ verificationId: identifier }, { id: identifier }] }
    }),
    prisma.certificate.findFirst({
      where: { OR: [{ certificateNumber: identifier }, { id: identifier }] }
    })
  ]);

  const rawStatus = issuedCert?.status || baseCert?.status || 'PENDING_PAYMENT';
  const isValidStatus = rawStatus === 'VALID';
  const certNumber = issuedCert?.verificationId || baseCert?.certificateNumber || identifier;
  const userId = issuedCert?.userId || baseCert?.userId || null;
  const certId = issuedCert?.certificationId || baseCert?.courseId || null;

  return {
    status: isValidStatus ? 'VALID' : (rawStatus as UnifiedCertificateStatus),
    isPaid: isValidStatus,
    canPrint: isValidStatus,
    canView: isValidStatus,
    canShare: isValidStatus,
    certificateNumber: certNumber,
    userId,
    certificationId: certId,
    issuedCertRecord: issuedCert,
    certRecord: baseCert
  };
}
