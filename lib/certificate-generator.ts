/**
 * Certificate ID Generator
 * Format: TC-2024-XX-XXXXX
 * - TC: SARTHI Certificate prefix
 * - 2024: Year
 * - XX: User ID hash (2 chars) + Course ID prefix (2 chars)
 * - XXXXX: Random alphanumeric string
 */

export class CertificateGenerator {
  /**
   * Generate certificate ID in format TT-YYYY-XXXXXX
   * @param userId - User's unique ID
   * @param courseId - Course's unique ID
   * @param timestamp - Date for year extraction
   */
  static generateCertificateId(
    userId: string,
    courseId: string,
    timestamp: Date = new Date()
  ): string {
    const year = timestamp.getFullYear();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `TT-${year}-${random}`;
  }

  /**
   * Generate verification token for multi-channel verification
   * @param certificateId - The certificate ID
   */
  static generateVerificationToken(certificateId: string): string {
    const payload = `${certificateId}:${Date.now()}:${Math.random().toString(36).substr(2, 8)}`;
    return Buffer.from(payload).toString('base64url');
  }

  /**
   * Generate 6-digit OTP for SMS verification
   */
  static generateOTP(): string {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
  }

  /**
   * Generate a shorter verification code for QR codes
   * @param certificateId - Full certificate ID
   */
  static generateShortCode(certificateId: string): string {
    const hash = Buffer.from(certificateId).toString('base64');
    return hash.substring(0, 8).toUpperCase();
  }

  /**
   * Get pricing for certificate tier
   * @param tier - Certificate tier (free, premium, pro)
   */
  static getTierPrice(tier: string): { amount: number; currency: string } {
    switch (tier) {
      case 'premium':
        return { amount: 49, currency: 'INR' };
      case 'pro':
        return { amount: 99, currency: 'INR' };
      default:
        return { amount: 0, currency: 'INR' };
    }
  }

  /**
   * Get features for certificate tier
   * @param tier - Certificate tier
   */
  static getTierFeatures(tier: string): string[] {
    const freeFeatures = [
      'Basic PDF certificate',
      'Standard verification'
    ];

    const premiumFeatures = [
      ...freeFeatures,
      'Enhanced PDF certificate',
      'LinkedIn share button',
      'QR code verification',
      'WhatsApp sharing'
    ];

    const proFeatures = [
      ...premiumFeatures,
      'Naukri.com integration',
      'SMS verification',
      'Bulk downloads (10 certificates)',
      'Priority support'
    ];

    switch (tier) {
      case 'premium':
        return premiumFeatures;
      case 'pro':
        return proFeatures;
      default:
        return freeFeatures;
    }
  }
}

/**
 * Verify certificate ID format
 * @param certificateId - Certificate ID to validate
 */
export function isValidCertificateId(certificateId: string): boolean {
  const regex = /^TC-\d{4}-[A-Z0-9]{4}[A-Z0-9]{5}$/;
  return regex.test(certificateId);
}

/**
 * Parse certificate ID to extract components
 * @param certificateId - Certificate ID to parse
 */
export function parseCertificateId(certificateId: string): {
  prefix: string;
  year: number;
  userHash: string;
  coursePrefix: string;
  random: string;
} | null {
  const parts = certificateId.split('-');
  if (parts.length !== 4) return null;

  const [prefix, yearStr, userCourse, random] = parts;
  const year = parseInt(yearStr, 10);

  if (prefix !== 'TC' || isNaN(year)) return null;

  return {
    prefix,
    year,
    userHash: userCourse.slice(0, 2),
    coursePrefix: userCourse.slice(2, 4),
    random
  };
}
