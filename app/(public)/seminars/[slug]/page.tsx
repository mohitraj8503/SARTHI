export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { withResiliency } from '@/lib/resilient-db';
import { Metadata } from 'next';
import Link from 'next/link';
import { getSession } from '@/lib/auth/session';
import SeminarDetailClient from './SeminarDetailClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  let seminar: any = null;
  try {
    const fetched = await withResiliency(() =>
      prisma.seminar.findUnique({ where: { slug } })
        .then(res => res || prisma.seminar.findUnique({ where: { id: slug } }))
    , `seminar_meta_${slug}`);
    seminar = fetched.data;
  } catch (err) {
    console.error('SERVER_METADATA_ERROR:', err);
  }

  if (!seminar) return { title: 'Seminar Not Found | SARTHI' };

  return {
    title: `${seminar.title} | SARTHI Seminar`,
    description: seminar.description?.split('\n')[0] || 'Join our SARTHI seminar to master new skills.',
    keywords: seminar.tags ? JSON.parse(seminar.tags) : [],
    openGraph: {
      title: seminar.title,
      description: seminar.description?.split('\n')[0] || '',
      images: [seminar.thumbnailUrl || '/og-image.png'],
    },
  };
}

export default async function SeminarPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let seminar: any = null;
  try {
    const fetched = await withResiliency(() =>
      prisma.seminar.findUnique({
        where: { slug },
        include: { _count: { select: { registrations: true } } },
      }).then(res => res || prisma.seminar.findUnique({
        where: { id: slug },
        include: { _count: { select: { registrations: true } } },
      }))
    , `seminar_page_${slug}`);
    seminar = fetched.data;
  } catch (err) {
    console.error('SERVER_SEMINAR_FETCH_ERROR:', err);
  }

  if (!seminar) {
    return (
      <div className="min-h-screen bg-[#F7F6F2] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center">
          <h1 className="text-2xl font-bold text-[#1A3C2E] mb-2">Seminar Not Found</h1>
          <p className="text-gray-500 mb-6">The seminar you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <Link href="/seminars" className="inline-flex items-center px-6 py-3 bg-[#1A3C2E] text-white rounded-xl font-medium hover:bg-[#2D6A4F] transition-colors">
            View All Seminars
          </Link>
        </div>
      </div>
    );
  }

  // Check if user is already registered
  let isRegistered = false;
  try {
    const session = await getSession();
    if (session?.id) {
      const reg = await prisma.seminarRegistration.findUnique({
        where: { seminarId_userId: { seminarId: seminar.id, userId: session.id } },
      });
      isRegistered = !!reg;
    }
  } catch (_) {}

  return (
    <SeminarDetailClient
      seminar={JSON.parse(JSON.stringify(seminar))}
      isRegistered={isRegistered}
    />
  );
}
