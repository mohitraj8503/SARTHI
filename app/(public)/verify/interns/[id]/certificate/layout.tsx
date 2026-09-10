/**
 * Layout override for /verify/interns/[id]/certificate
 * Renders with NO site Header, Footer, Chat, or FeedbackWidget —
 * just a clean full-page canvas for the certificate.
 */
export default function CertificatePageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
