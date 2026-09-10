import { getPublicCourses, getCourseCategories } from '@/lib/services/course.service';
import CoursesClient from './CoursesClient';
import CategoryNavHub from '@/components/CategoryNavHub';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'All Courses | SARTHI',
  description: 'Explore our production-grade tech courses. Learn Python, AI, and more with project-based learning.',
};

export default async function CourseCatalogPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ q?: string; category?: string; sort?: string; page?: string; view?: string }>
}) {
  const params = await searchParams;
  const q = params.q || '';
  const category = params.category || 'All';
  const page = parseInt(params.page || '1');
  const sort = (params.sort as any) || 'newest';
  const view = params.view || 'library';

  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || '';
  const isMobile = /mobile|android|iphone|ipad|phone/i.test(userAgent);

  // Render the landing Category Navigation Hub page by default if not looking at the library catalog list (only on desktop)
  if (!isMobile && view !== 'library' && !q && category === 'All') {
    return (
      <CategoryNavHub 
        categoryLabel="Courses"
        categoryEmoji="📚"
        categorySubtitle="Structured pathways to master top skills."
        subItems={[
          { label: 'All Courses', href: '/courses?view=library', icon: 'BookOpen', iconColor: '#0D9488', desc: 'Explore our wide range of topics' },
          { label: 'Find My Course', href: '/courses/featured', icon: 'Star', iconColor: '#EAB308', desc: 'Answer a few fun questions and discover the best course for you.', badge: 'QUIZ' },
          { label: 'Career Roadmaps', href: '/courses/paths', icon: 'Target', iconColor: '#6366F1', desc: 'Choose your dream career and follow a guided roadmap.', badge: 'NEW' },
          { label: 'Demand a Course', href: '/courses/demand', icon: 'Lightbulb', iconColor: '#EC4899', desc: 'Suggest topics you want to learn' }
        ]}
        featuredData={{
          title: "AI & Data Science Professional",
          icon: "BookOpen",
          iconColor: "#0D9488",
          meta: "38 Hours • 24 Projects • Verified Certificate",
          badge: "RECOMMENDED",
          ctaText: "Start Learning",
          ctaHref: "/courses?view=library"
        }}
      />
    );
  }

  let result = { courses: [], total: 0 };
  let categoriesList: string[] = [];

  try {
    const fetchCategory = (!category || category === 'All') ? undefined : category;
    const coursesResult = await getPublicCourses({
      category: fetchCategory as any,
      search: q,
      page,
      limit: 12,
      sort
    });
    const allReturned = (coursesResult.courses as any[]) || [];
    result = {
      courses: allReturned,
      total: coursesResult.total || allReturned.length
    };
  } catch (error) {
    console.error('CRITICAL: getPublicCourses fetch failure:', error);
  }

  try {
    categoriesList = await getCourseCategories();
  } catch (error) {
    console.error('CRITICAL: getCourseCategories fetch failure:', error);
    categoriesList = ['Business', 'Development', 'Finance'];
  }

  return (
    <CoursesClient 
      initialCourses={result.courses} 
      categories={['All', ...categoriesList]} 
      initialTotal={result.total}
    />
  );
}
