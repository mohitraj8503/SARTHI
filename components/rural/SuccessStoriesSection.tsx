import Link from 'next/link';
import { ShieldCheck, Play, ArrowRight, MapPin } from 'lucide-react';
import Image from 'next/image';

export function SuccessStoriesSection() {
  const stories = [
    {
      name: 'Priya Kumari',
      location: 'Madhubani, Bihar',
      age: 19,
      photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&fit=crop',
      quote: "Before this program, I had never touched a computer. Now I build websites for local shops and earn ₹4,000/month while studying.",
      outcome: {
        before: 'No digital skills, no income',
        after: 'Freelance web developer, ₹4,000/month',
        certification: 'NSDC Digital Maker Certified'
      },
      verified: true,
      videoUrl: '#'
    },
    {
      name: 'Rahul Singh',
      location: 'Khagaria, Bihar', 
      age: 21,
      photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&fit=crop',
      quote: "The mentorship program connected me with a developer in Bangalore. I now work remotely fixing bugs for a global startup.",
      outcome: {
        before: 'Unemployed, limited opportunities',
        after: 'Remote Junior Dev, ₹12,000/month',
        certification: 'NSDC Full-Stack Certified'
      },
      verified: true
    },
    {
      name: 'Sunita Devi',
      location: 'Supaul, Bihar',
      age: 42,
      photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&fit=crop', 
      quote: "As a teacher, I learned to use digital tools for my classroom. Now I train 15+ other teachers in my school block every week.",
      outcome: {
        before: 'Traditional teaching methods',
        after: 'Digital Facilitator & Lead Trainer',
        certification: 'Digital Educator Badge'
      },
      verified: true
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 mb-4">
             <div className="h-px w-8 bg-emerald-200" />
             <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em]">Living Proof</span>
             <div className="h-px w-8 bg-emerald-200" />
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-6 uppercase">
            REAL STORIES FROM <br />
            <span className="text-emerald-600">REAL STUDENTS</span>
          </h2>
          <p className="text-slate-500 font-medium">
            Verified outcomes independently confirmed by district coordinators.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {stories.map((story, index) => (
            <article key={index} className="group bg-slate-50 rounded-[3rem] p-8 border border-slate-100 hover:bg-white hover:shadow-2xl hover:shadow-emerald-600/5 transition-all duration-500 relative flex flex-col">
              {/* Verification badge */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm">
                  <ShieldCheck className="w-3 h-3 stroke-[3]" />
                  Verified Story
                </div>
                {story.videoUrl && (
                  <button className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-slate-900/20">
                    <Play className="w-3 h-3 fill-current ml-0.5" />
                  </button>
                )}
              </div>
              
              {/* Identity */}
              <div className="flex items-center gap-4 mb-6">
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-md group-hover:scale-105 transition-transform">
                  <Image 
                    src={story.photo} 
                    alt={story.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-black text-slate-900 uppercase tracking-tight text-lg leading-none">{story.name}, {story.age}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {story.location}
                  </p>
                </div>
              </div>
              
              {/* Quote */}
              <blockquote className="text-slate-600 font-medium italic mb-8 leading-relaxed relative grow">
                <span className="text-emerald-300 text-4xl absolute -top-4 -left-2 select-none">&quot;</span>
                {story.quote}
              </blockquote>
              
              {/* Outcome Table */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                <div className="grid grid-cols-2 gap-4 text-[10px] font-black uppercase tracking-widest">
                  <div>
                    <p className="text-slate-400 mb-1">Before</p>
                    <p className="text-slate-900 leading-tight">{story.outcome.before}</p>
                  </div>
                  <div>
                    <p className="text-emerald-600 mb-1">After</p>
                    <p className="text-slate-900 leading-tight">{story.outcome.after}</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-50">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Certification</p>
                  <p className="text-[11px] font-bold text-slate-900">{story.outcome.certification}</p>
                </div>
              </div>
              
              {/* Link to full story */}
              <Link 
                href={`/rural-initiative/stories/${story.name.toLowerCase().replace(' ', '-')}`}
                className="mt-8 flex items-center justify-between group/link"
              >
                <span className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] group-hover/link:text-emerald-600 transition-colors">Read Full Journey</span>
                <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center group-hover/link:border-emerald-500 group-hover/link:bg-emerald-500 group-hover/link:text-white transition-all">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            </article>
          ))}
        </div>
        
        <div className="mt-20 text-center">
          <Link 
            href="/rural-initiative/stories"
            className="inline-flex items-center gap-3 px-10 py-5 bg-emerald-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-[2rem] hover:bg-emerald-700 hover:-translate-y-1 transition-all shadow-xl shadow-emerald-600/20 active:scale-95"
          >
            Explore 47+ Student Journeys
            <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="mt-6 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            Stories updated monthly • 100% verified outcomes
          </p>
        </div>
      </div>
    </section>
  );
}
