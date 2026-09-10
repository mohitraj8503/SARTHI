import { ShieldAlert } from 'lucide-react';
import { Metadata } from 'next';
import { getSession } from '@/lib/auth/session';
import { redirect, notFound } from 'next/navigation';
import { getCertificationBySlug } from '@/lib/services/certification.service';
import CertificationAssessmentClient from '../../../../(public)/certification-exams/_components/CertificationAssessmentClient';

// Helper to load questions based on slug
// Helper to load questions based on slug with a "No-Failure" fallback policy
// Helper to load questions based on slug with a "No-Failure" fallback policy
async function loadQuestions(slug: string) {
  const slugToQuestions: Record<string, string> = {
    'python-professional': '@/app/(public)/certification-exams/python-professional-questions',
    'python-professional-developer': '@/app/(public)/certification-exams/python-professional-questions',
    'python-pro-dev': '@/app/(public)/certification-exams/python-professional-questions',
    'cpp-master': '@/app/(public)/certification-exams/cpp-master-questions',
    'cpp-professional': '@/app/(public)/certification-exams/cpp-professional-questions',
    'ai-ml-foundations': '@/app/(public)/certification-exams/python-professional-questions',
    'web-dev-hard': '@/app/(public)/certification-exams/web-dev-hard-questions',
    'fullstack-mastery': '@/app/(public)/certification-exams/web-dev-hard-questions',
    'java-backend-arch': '@/app/(public)/certification-exams/python-professional-questions',
    'cloud-infra-spec': '@/app/(public)/certification-exams/web-dev-hard-questions',
  };

  const path = slugToQuestions[slug] || '@/app/(public)/certification-exams/python-professional-questions';
  
  try {
    const qsModule = await import(`${path}`);
    // Try to find a key containing 'questions' or use default
    const questionsKey = Object.keys(qsModule).find(k => k.toLowerCase().includes('questions'));
    return questionsKey ? qsModule[questionsKey] : (qsModule.default || []);
  } catch (e) {
    console.error(`Failed to load questions for ${slug} from ${path}. Falling back to core assessment.`, e);
    try {
      const fallback = await import('@/app/(public)/certification-exams/python-professional-questions');
      return fallback.pythonHardQuestions || fallback.default || [];
    } catch {
      return [];
    }
  }
}

// Helper for scoring with fallback
async function loadScoring(slug: string) {
  try {
    const slugToQuestionsMapping: Record<string, string> = {
      'python': '@/app/(public)/certification-exams/python-professional-questions',
      'cpp': '@/app/(public)/certification-exams/cpp-professional-questions',
      'web': '@/app/(public)/certification-exams/web-dev-hard-questions',
      'ai': '@/app/(public)/certification-exams/python-professional-questions'
    };

    const searchKey = Object.keys(slugToQuestionsMapping).find(key => slug.includes(key));
    const path = searchKey ? slugToQuestionsMapping[searchKey] : '@/app/(public)/certification-exams/python-professional-questions';
    
    const scoringModule = await import(`${path}`);
    const scoringKey = Object.keys(scoringModule).find(k => k.toLowerCase().includes('scoring'));
    return scoringKey ? scoringModule[scoringKey] : { passingScore: 85 };
  } catch (e) {
    return { passingScore: 85 };
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const result = await getCertificationBySlug(slug);
  const cert = result.data;
  if (!cert) return { title: 'Assessment Not Found | SARTHI' };

  return {
    title: `${cert.title} Assessment | SARTHI`,
    description: `Validate your expertise in ${cert.title} with our advanced proctored assessment.`,
  };
}

export default async function DynamicAssessmentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await getSession();
  
  if (!session) {
    redirect(`/login?callbackUrl=/certification-exams/${slug}/assessment`);
  }

  const result = await getCertificationBySlug(slug);
  const certification = result.data;
  if (!certification) {
    notFound();
  }

  let questions = await loadQuestions(slug);
  const scoring = await loadScoring(slug);

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6 relative overflow-hidden">
        {/* Mirror the premium background from the assessment client */}
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-[#40916C] rounded-full blur-[150px] opacity-[0.05]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#1B4332] rounded-full blur-[120px] opacity-[0.05]" />
        
        <div className="bg-white rounded-[48px] p-12 md:p-16 max-w-2xl w-full shadow-[0_40px_80px_-15px_rgba(27,67,50,0.1)] border border-emerald-50 text-center relative z-10">
           <div className="w-20 h-20 bg-red-50 rounded-[28px] flex items-center justify-center mx-auto mb-8 border border-red-100">
              <ShieldAlert className="w-10 h-10 text-red-500" />
           </div>
           <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 uppercase italic">Assessment Offline</h1>
            <p className="text-gray-500 mb-10 font-medium leading-relaxed">
             The assessment content for <span className="text-emerald-900 font-bold">{certification?.title || 'this track'}</span> is undergoing a scheduled update to meet the latest industry standards.
           </p>
           <div className="flex justify-center">
             <a href={`/certification-exams/${slug}`} className="px-12 py-5 bg-[#11261C] text-white rounded-2xl font-black uppercase tracking-tighter hover:scale-105 active:scale-95 transition-all shadow-xl">
               Back to Details
             </a>
           </div>
        </div>
      </div>
    );
  }

  // Dynamic Question Selection: group by section name containing "set" or "variant" (case-insensitive)
  const setGroups = new Map<string, typeof questions>();
  questions.forEach((q: any) => {
    const sec = q.section || '';
    if (/set\s*[a-z0-9]|variant\s*[a-z0-9]/i.test(sec)) {
      const normalizedSec = sec.trim();
      if (!setGroups.has(normalizedSec)) {
        setGroups.set(normalizedSec, []);
      }
      setGroups.get(normalizedSec)!.push(q);
    }
  });

  if (setGroups.size > 1) {
    const keys = Array.from(setGroups.keys());
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    questions = setGroups.get(randomKey)!;
  }

  // Hard limit: Exactly 40 questions for final master certification exams, 20 for milestones
  const isFinalExam = slug.includes('python') || slug.includes('professional') || slug.includes('master');
  if (isFinalExam) {
    questions = questions.slice(0, 40);
  } else {
    questions = questions.slice(0, 20);
  }

  return (
    <CertificationAssessmentClient 
      user={session} 
      certification={certification} 
      questions={questions}
      scoring={scoring}
    />
  );
}
