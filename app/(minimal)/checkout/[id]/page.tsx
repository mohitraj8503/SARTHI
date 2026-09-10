import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import CheckoutClient from './CheckoutClient';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CheckoutPage({ params }: Props) {
  const { id } = await params;
  
  const course = await prisma.course.findFirst({
    where: {
      OR: [
        { id: id },
        { slug: id }
      ]
    },
    select: {
      id: true,
      slug: true,
      title: true,
      price: true,
      originalPrice: true,
      thumbnail: true,
      discountAmount: true,
      discountPercent: true,
      platformFee: true,
      features: true,
      iconUrl: true,
      thumbnailUrl: true,
    }
  });

  if (!course && id !== 'summer-camp-2026') {
    return notFound();
  }

  const formattedCourse = course ? {
    id: course.id,
    slug: course.slug,
    title: course.title,
    price: Number(course.price),
    originalPrice: course.originalPrice ? Number(course.originalPrice) : null,
    thumbnail: course.thumbnail,
    discountAmount: course.discountAmount ? Number(course.discountAmount) : null,
    discountPercent: course.discountPercent ? Number(course.discountPercent) : null,
    platformFee: course.platformFee ? Number(course.platformFee) : null,
    features: course.features,
    iconUrl: course.iconUrl,
    thumbnailUrl: course.thumbnailUrl,
  } : {
    id: 'summer-camp-2026',
    slug: 'summer-camp-2026',
    title: 'SARTHI Summer Camp 2026',
    price: 11,
    originalPrice: 2000,
    thumbnail: '/images/summer-camp-perfect-thumb.png',
    discountAmount: 1989,
    discountPercent: 99,
    platformFee: 0,
    features: JSON.stringify([
      { icon: "CheckCircle2", label: "Lifetime Access" },
      { icon: "CheckCircle2", label: "Certificate" }
    ]),
    iconUrl: null,
    thumbnailUrl: null
  };

  return <CheckoutClient course={formattedCourse} courseId={id} />;
}
