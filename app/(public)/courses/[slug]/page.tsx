import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '../../../../lib/prisma';
import CourseDetailClient from './CourseDetailClient';

export const dynamicParams = true;

interface Props {
  params: Promise<{ slug: string }>;
}

function isAuditPlaceholder(value: string) {
  return value === 'sample-id' || value === 'sample-slug' || value.startsWith('sample-');
}

async function getCourse(slug: string) {
  try {
    const course = await prisma.course.findUnique({
      where: { slug: slug },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            image: true,
            bio: true,
            headline: true,
            company: true,
          }
        },
        modules: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              where: { isPublished: true },
              orderBy: { orderNumber: 'asc' },
              select: {
                id: true,
                title: true,
                duration: true,
                isFreePreview: true,
                orderNumber: true,
              }
            }
          }
        },
        _count: {
          select: { 
            lessons: true,
            enrollments: true 
          }
        }
      }
    });

    if (!course) return null;

    // Format for client consumption, mapping modules with nested lessons to curriculum
    const enrolledStudents = ((course as any).enrolledStudentsCount || 0) + (course._count?.enrollments || (course as any).studentsEnrolled || 0);
    const modulesList = Array.isArray(course.modules) ? course.modules : (Array.isArray((course as any).curriculum) ? (course as any).curriculum : []);

    return {
      ...course,
      price: Number(course.price || 0),
      pricing_type: Number(course.price) > 0 ? 'PAID' : ((course as any).pricing_type || 'FREE'),
      originalPrice: course.originalPrice ? Number(course.originalPrice) : null,
      enrolledCount: enrolledStudents,
      curriculum: modulesList.map((mod: any) => ({
        id: mod.id || 'mod_1',
        title: mod.title || 'Course Modules',
        description: mod.description || '',
        lessons: mod.lessons || []
      }))
    };
  } catch (error) {
    console.error(`[COURSE_FETCH_ERROR]`, error);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourse(slug);
  if (!course) return { title: 'Course Not Found | SARTHI' };

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://sarthi-woad.vercel.app';
  const rawImage = course.thumbnail || '/course-thumbnails/gst-income-tax-combo.png';
  const ogImageUrl = rawImage.startsWith('http') ? rawImage : `${siteUrl.replace(/\/$/, '')}${rawImage.startsWith('/') ? '' : '/'}${rawImage}`;
  const courseUrl = `${siteUrl.replace(/\/$/, '')}/courses/${slug}`;
  const metaDescription = course.shortDescription || course.description?.substring(0, 160) || `Master ${course.title} with India's top mentors at SARTHI.`;

  return {
    title: `${course.title} | SARTHI Masterclass`,
    description: metaDescription,
    metadataBase: new URL(siteUrl),
    keywords: [
      course.title,
      `${course.title} course`,
      'Python AI',
      'tech skills India',
      'career courses',
      'SARTHI courses'
    ],
    openGraph: {
      title: `${course.title} | SARTHI`,
      description: metaDescription,
      url: courseUrl,
      siteName: 'SARTHI',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: course.title,
        }
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${course.title} | SARTHI`,
      description: metaDescription,
      images: [ogImageUrl],
    },
  };
}

export default async function CoursePage({ params }: Props) {
  const { slug } = await params;
  const course = await getCourse(slug);

  if (!course) {
    return notFound();
  }

  const courseJsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": course.title,
    "description": course.description,
    "provider": {
      "@type": "Organization",
      "name": "SARTHI",
      "sameAs": "https://sarthi-woad.vercel.app"
    },
    "image": course.thumbnail,
    "offers": {
      "@type": "Offer",
      "price": course.price,
      "priceCurrency": "INR",
      "availability": "https://schema.org/InStock"
    },
    "instructor": {
      "@type": "Person",
      "name": course.instructor?.name || "SARTHI Expert"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }}
      />
      <CourseDetailClient course={course as any} />
    </>
  );
}
