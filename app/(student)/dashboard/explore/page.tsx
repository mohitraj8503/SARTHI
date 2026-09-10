import { getPublishedCourses, type Course } from '@/app/actions/courses';
import ExploreClient from '@/components/explore/ExploreClient';

export default async function ExplorePage() {
    const { data: courses } = await getPublishedCourses();

    return (
      <div className="max-w-[1440px] mx-auto space-y-12 animate-fade-in pb-16 antialiased pt-10">
          <div className="space-y-2 px-4 border-b border-gray-100 pb-12">
             <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight tracking-tighter font-outfit uppercase italic">
                Portal <span className="text-[#174F3A]">Discovery</span>
             </h1>
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-2">Discover elite technical specializations and enroll in the future</p>
          </div>
         <div className="px-4">
            <ExploreClient initialCourses={courses} />
         </div>
      </div>
   );
}

