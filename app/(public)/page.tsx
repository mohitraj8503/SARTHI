import Hero from '@/components/Hero';
import LazySection from '@/components/LazySection';
import type { Metadata } from 'next';
import TrustStrip from '@/components/TrustStrip';
import nextDynamic from 'next/dynamic';
import { getPublicCourses } from '@/lib/services/course.service';
import { Suspense } from 'react';

export const revalidate = 300; // 5-minute ISR cache for fast home page loads without DB spikes

export const metadata: Metadata = {
  title: 'SARTHI — Capacity Building & LMS Portal | IMD',
  description: 'Centralized Learning Management Portal for organizational training, competency development, and knowledge sharing at the India Meteorological Department.',
  keywords: [
    'capacity building',
    'LMS',
    'training',
    'competency tracking',
    'IMD',
    'skill development',
    'government training',
    'certification'
  ],
  openGraph: {
    title: 'SARTHI — Capacity Building & LMS Portal | IMD',
    description: 'Centralized Learning Management Portal for organizational training, competency development, and knowledge sharing at the India Meteorological Department.',
    type: 'website',
    siteName: 'SARTHI',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SARTHI — IMD Capacity Building & LMS Portal',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SARTHI — Capacity Building & LMS Portal | IMD',
    description: 'Centralized Learning Management Portal for organizational training, competency development, and knowledge sharing at the India Meteorological Department.',
    images: ['/og-image.png'],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "SARTHI",
  "url": "https://sarthi-woad.vercel.app",
  "logo": "https://sarthi-woad.vercel.app/sarthi-logo.png",
  "description": "Centralized Learning Management Portal for organizational training, competency development, and knowledge sharing at the India Meteorological Department.",
  "sameAs": [
    "https://facebook.com/sarthi",
    "https://twitter.com/sarthi",
    "https://instagram.com/sarthi",
    "https://linkedin.com/company/sarthi"
  ],
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://sarthi-woad.vercel.app/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
};


const Features = nextDynamic(() => import('@/components/Features'));
const FeaturedCourses = nextDynamic(() => import('@/components/FeaturedCourses'));
const Testimonials = nextDynamic(() => import('@/components/Testimonials'));
const SummerCode = nextDynamic(() => import('@/components/home/SummerCode'));



async function FeaturedCoursesSection() {
  let initialFeaturedCourses = [];
  try {
    const result = await getPublicCourses({
      limit: 100,
      sort: 'popular'
    });
    
    const targetIds = [
      'course_ai_nwp_modeling',
      'course_dwr_nowcasting',
      'course_satellite_meteorology_insat',
      'course_tropical_cyclone_warning',
      'course_agromet_gkms',
      'course_aviation_meteorology',
    ];

    // Filter to only include the target courses if available
    const matched = (result.courses || []).filter((c: any) => targetIds.includes(c.id));

    if (matched.length > 0) {
      initialFeaturedCourses = targetIds.map(id => matched.find((c: any) => c.id === id)).filter(Boolean);
    } else {
      // Fallback to all active public courses
      initialFeaturedCourses = result.courses || [];
    }
  } catch (error) {
    console.error('HOME_PAGE_DATA_FETCH_FAIL:', error);
    initialFeaturedCourses = [];
  }

  return <FeaturedCourses initialCourses={initialFeaturedCourses} />;
}

export default function Home() {
  return (
    <main className="relative min-h-screen bg-[#FAF9F6] selection:bg-[#2D6A4F]/20 overflow-x-hidden transition-colors duration-500">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero />
      <TrustStrip />

      {/* Temporarily hidden Testimonials section */}
      {/* <LazySection offset="300px">
        <Testimonials />
      </LazySection> */}


      <LazySection offset="300px">
        <Suspense fallback={<div className="h-[500px] w-full flex items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-[#1A3C2E] border-t-transparent animate-spin"></div></div>}>
          <FeaturedCoursesSection />
        </Suspense>
      </LazySection>


      <LazySection offset="400px">
        <Features />
      </LazySection>

    </main>
  );
}
