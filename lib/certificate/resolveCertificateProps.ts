import type { CertificateTemplateConfig, CertificateRecipientData } from '@/components/certificate/CertificateTemplate';

/**
 * Raw certificate data from any API endpoint.
 * All fields are optional — the resolver applies a single documented
 * fallback chain so every call-site produces identical rendering.
 */
export interface RawCertificateData {
  // — Template design fields (snapshotted at issue-time) ———————————————
  templateConfig?: CertificateTemplateConfig | null;
  metadata?: string | Record<string, any> | null;

  // — Fallback title sources ——————————————————————————————————————————
  title?: string | null;
  courseName?: string | null;
  course?: { title?: string | null } | null;
  certification?: { title?: string | null } | null;

  // — Recipient fields ———————————————————————————————————————————————
  studentName?: string | null;
  userName?: string | null;
  user?: { name?: string | null } | null;

  // — IDs & dates —————————————————————————————————————————————————————
  certificateId?: string | null;
  certificateNumber?: string | null;
  verificationId?: string | null;
  certNumber?: string | null;
  id?: string | null;

  enrollmentId?: string | null;
  userId?: string | null;

  issueDate?: string | null;
  issuedAt?: string | Date | null;
  createdAt?: string | Date | null;
}

/**
 * Single canonical prop-builder for `<CertificateTemplate />`.
 *
 * Every surface (Certificate Studio, Student Dashboard, Public Verify page)
 * must call this function instead of hand-rolling its own fallback chains.
 * This guarantees pixel-identical rendering everywhere.
 */
export function resolveCertificateProps(raw: RawCertificateData): {
  template: CertificateTemplateConfig;
  recipient: CertificateRecipientData;
} {
  // ── 1. Parse metadata ────────────────────────────────────────────────
  let meta: Record<string, any> = {};
  if (raw.metadata) {
    if (typeof raw.metadata === 'string') {
      try { meta = JSON.parse(raw.metadata); } catch { /* ignore */ }
    } else {
      meta = raw.metadata;
    }
  }

  // ── 2. Resolve templateConfig (snapshot at issue time) ───────────────
  //    Priority: raw.templateConfig > meta.templateConfig > field-by-field fallback
  const tc: CertificateTemplateConfig =
    raw.templateConfig ||
    meta.templateConfig ||
    {};

  const courseTitle =
    raw.title ||
    raw.courseName ||
    raw.course?.title ||
    raw.certification?.title ||
    meta.course_name ||
    'Professional Certification';

  function normalizeCertificateTitle(raw: string): string {
    const clean = raw.split('—')[0].split('-')[0].trim().toUpperCase();
    if (/\b(CERTIFICATE|CERTIFICATION|EXAM|AWARD)\b/.test(clean)) return clean;
    return `${clean} CERTIFICATE`;
  }

  const template: CertificateTemplateConfig = {
    mainTitle:       normalizeCertificateTitle(tc.mainTitle || courseTitle),
    subTitle:        tc.subTitle        ?? undefined,
    certifiesText:   tc.certifiesText   ?? undefined,
    descriptionText: tc.descriptionText ?? undefined,
    courseName:      tc.courseName      || courseTitle,
    specialization:  tc.specialization  || tc.courseName || courseTitle,
    brandName:       tc.brandName       || meta.brandName || 'SARTHI',
    tagline:         tc.tagline         || meta.tagline   || 'INNOVATE TODAY',
    directorName:    tc.directorName    ?? undefined,
    directorTitle:   tc.directorTitle   ?? undefined,
    bgImage:         tc.bgImage         ?? undefined,
    logoUrl:         tc.logoUrl         ?? undefined,
    signatureUrl:    tc.signatureUrl    ?? undefined,
    completionDate:  tc.completionDate  ?? undefined,
  };

  // ── 3. Resolve recipient data ───────────────────────────────────────
  const studentName =
    raw.studentName ||
    raw.userName ||
    raw.user?.name ||
    meta.user_name ||
    meta.studentName ||
    'Student';

  const certId =
    raw.certificateId ||
    raw.certificateNumber ||
    raw.verificationId ||
    raw.certNumber ||
    raw.id ||
    meta.credential_id ||
    '';

  const enrollmentNo =
    raw.enrollmentId ||
    raw.userId ||
    meta.enrollment_id ||
    meta.studentId ||
    '';

  // Format issue date
  let issueDate = raw.issueDate || '';
  if (!issueDate) {
    const dateVal = raw.issuedAt || raw.createdAt;
    if (dateVal) {
      try {
        const d = typeof dateVal === 'string' ? new Date(dateVal) : dateVal;
        if (!isNaN(d.getTime())) {
          issueDate = d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        }
      } catch { /* fallback to empty */ }
    }
  }

  const recipient: CertificateRecipientData = {
    studentName,
    certificateId: certId,
    enrollmentNo,
    issueDate: issueDate || undefined,
  };

  return { template, recipient };
}
