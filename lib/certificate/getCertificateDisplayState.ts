export interface CertificateDisplayState {
  isValid: boolean;
  isPendingPayment: boolean;
  canDisplaySnapshot: boolean;
  canDownloadPdf: boolean;
  htmlSnapshot: string | null;
  pdfUrl: string | null;
  imageUrl: string | null;
  statusText: string;
}

/**
 * ATOOT KADI — Canonical display state utility for all certificates.
 * Every page in the product MUST import and use this utility to evaluate certificate validity
 * and display state. No page may inline its own custom status/validity checks.
 */
export function getCertificateDisplayState(certificate: any): CertificateDisplayState {
  if (!certificate) {
    return {
      isValid: false,
      isPendingPayment: false,
      canDisplaySnapshot: false,
      canDownloadPdf: false,
      htmlSnapshot: null,
      pdfUrl: null,
      imageUrl: null,
      statusText: 'NOT FOUND'
    };
  }

  const rawStatus = (certificate.status || '').toString().toUpperCase().trim();
  const isValid = rawStatus === 'VALID' || rawStatus === 'VERIFIED';
  const isPendingPayment = rawStatus === 'PENDING_PAYMENT' || rawStatus === 'UNPAID';

  const htmlSnapshot = isValid && typeof certificate.htmlSnapshot === 'string' && certificate.htmlSnapshot.length > 50
    ? certificate.htmlSnapshot
    : null;

  const pdfUrl = isValid && typeof certificate.pdfUrl === 'string' && certificate.pdfUrl.length > 0
    ? certificate.pdfUrl
    : null;

  const imageUrl = isValid && typeof certificate.imageUrl === 'string' && certificate.imageUrl.length > 0
    ? certificate.imageUrl
    : null;

  const canDisplaySnapshot = isValid && !!htmlSnapshot;
  const canDownloadPdf = isValid && !!pdfUrl;

  const statusText = isValid
    ? 'VALID'
    : isPendingPayment
    ? 'PENDING PAYMENT'
    : rawStatus || 'INVALID';

  return {
    isValid,
    isPendingPayment,
    canDisplaySnapshot,
    canDownloadPdf,
    htmlSnapshot,
    pdfUrl,
    imageUrl,
    statusText
  };
}
