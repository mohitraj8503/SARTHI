import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getCertificationBySlug } from '@/lib/services/certification.service';
import PathClient from '../paths/[slug]/PathClient';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  if (slug && slug.startsWith('TT-')) {
    return { title: 'Verify Certificate | SARTHI' };
  }
  const result = await getCertificationBySlug(slug);
  const cert = result.data;
  if (!cert) return { title: 'Certification Not Found | SARTHI' };

  return {
    title: `${cert.title} | SARTHI`,
    description: cert.description,
  };
}

export default async function DynamicCertificationPage({ params }: Props) {
  const { slug } = await params;
  if (slug && slug.startsWith('TT-')) {
    redirect(`/certification-exams/verify/${slug}`);
  }
  const result = await getCertificationBySlug(slug);
  const certification = result.data;

  if (!certification) {
    notFound();
  }

  return <PathClient slug={slug} />;
}
