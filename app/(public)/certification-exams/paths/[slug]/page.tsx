import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PathClient from './PathClient';

interface Props {
  params: Promise<{ slug: string }>;
}

// Generates dynamic SEO title and tags
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const titleMap: Record<string, string> = {
    'python-professional-developer': 'Python Development Professional Certification',
    'ai-ml-foundations': 'AI & Machine Learning Foundations Certificate',
    'fullstack-mastery': 'Full Stack Web Mastery Certification Path',
    'cloud-infra-spec': 'Enterprise Cloud Infrastructure Specialist',
    'advanced-excel-certification-exam': 'Advanced Excel Professional Certification',
  };

  const title = titleMap[slug] || 'Professional Certification Pathway';

  return {
    title: `${title} | SARTHI Learn`,
    description: `Master high-income tech skills, complete hands-on modules, pass assessments, and unlock your verified digital certificate.`,
  };
}

export default async function PathPage({ params }: Props) {
  const { slug } = await params;
  const validSlugs = [
    'python-professional-developer',
    'ai-ml-foundations',
    'fullstack-mastery',
    'cloud-infra-spec',
    'advanced-excel-certification-exam'
  ];

  if (!validSlugs.includes(slug)) {
    notFound();
  }

  return <PathClient slug={slug} />;
}
