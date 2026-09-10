import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'About SARTHI — Capacity Connect Platform',
  description: 'SARTHI (Capacity Connect) provides industry-grade technology education, structured internships, and verified credentials for future-ready engineers.',
  openGraph: {
    title: 'About SARTHI — Capacity Connect Platform',
    description: 'SARTHI (Capacity Connect) provides industry-grade technology education, structured internships, and verified credentials for future-ready engineers.',
    url: 'https://sarthi-woad.vercel.app/about',
    siteName: 'SARTHI',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About SARTHI — Capacity Connect Platform',
    description: 'SARTHI (Capacity Connect) provides industry-grade technology education, structured internships, and verified credentials for future-ready engineers.',
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'SARTHI',
    alternateName: ['SARTHI', 'Capacity Connect', 'SARTHI Platform'],
    url: 'https://sarthi-woad.vercel.app',
    logo: 'https://sarthi-woad.vercel.app/sarthi-logo.png',
    description: 'SARTHI (Capacity Connect) provides practical technology education, structured internship programs, and industry-grade certifications.',
    sameAs: [
      'https://sarthi-woad.vercel.app',
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      {children}
    </>
  );
}
