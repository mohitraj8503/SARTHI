/**
 * ATOOT KADI — Canonical guardrail and validator for Internship Certificates.
 * 
 * Rules:
 * 1. An internship certificate must NEVER be an exam certificate or a standard course credential.
 * 2. Primary signals:
 *    - courseId is NULL (or not linked to a course catalog offering)
 *    - metadata.internshipTrack exists
 *    - metadata.format === 'A4_PORTRAIT_LETTER' || 'INTERNSHIP_LETTER'
 *    - certificateNumber / certificateId matches 'TT-INT-' or 'TTI'
 * 3. Explicit reject signals:
 *    - metadata.type === 'professional_path' || metadata.type === 'course'
 * 4. Secondary/fallback signal:
 *    - title contains 'internship'
 */

export function isValidInternshipCertificate(cert: any, parsedMetadata?: any): boolean {
  if (!cert) return false;

  const meta = parsedMetadata || (
    typeof cert.metadata === 'string'
      ? (() => {
          try {
            return JSON.parse(cert.metadata);
          } catch {
            return {};
          }
        })()
      : (cert.metadata || {})
  );

  // 1. Explicit Rejections
  if (meta.type === 'professional_path' || meta.type === 'course') {
    return false;
  }

  if (cert.courseId && !meta.internshipTrack) {
    return false;
  }

  // 2. Primary Positive Signals
  const certNumber = (cert.certificateNumber || cert.certificateId || '').toUpperCase().trim();
  const format = (meta.format || '').toUpperCase().trim();
  const hasInternshipTrack = typeof meta.internshipTrack === 'string' && meta.internshipTrack.trim().length > 0;
  const isInternNumberPattern = certNumber.startsWith('TT-INT-') || certNumber.startsWith('TTI') || certNumber.startsWith('TT-LOR-') || certNumber.startsWith('TT-26-');
  const isInternFormat = format === 'A4_PORTRAIT_LETTER' || format === 'INTERNSHIP_LETTER' || format === 'LETTER_OF_RECOMMENDATION';

  // Awards (like TT-BIA-*) are custom landscape award certificates, NOT internship letters
  if (certNumber.startsWith('TT-BIA')) {
    return false;
  }

  if (isInternNumberPattern || hasInternshipTrack || isInternFormat) {
    return true;
  }

  // 3. Secondary / Fallback Signal (Title match)
  const title = (cert.title || '').toLowerCase();
  if (title.includes('internship') || title.includes('recommendation') || title.includes('lor')) {
    return true;
  }

  return false;
}
