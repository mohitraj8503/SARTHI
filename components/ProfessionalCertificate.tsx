import CertificateTemplate, { CertificateTemplateProps } from './certificate/CertificateTemplate';

export type { CertificateTemplateProps as ProfessionalCertificateProps };

export default function ProfessionalCertificate(props: CertificateTemplateProps) {
  return <CertificateTemplate {...props} />;
}
