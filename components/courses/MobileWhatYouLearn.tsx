import { CheckCircle } from 'lucide-react';

interface MobileWhatYouLearnProps {
  benefits: string[];
}

export default function MobileWhatYouLearn({ benefits }: MobileWhatYouLearnProps) {
  const defaultBenefits = [
    {
      title: "Master production-grade techniques",
      desc: "from India's leading practitioners"
    },
    {
      title: "Direct exposure to industry workflows",
      desc: "and specialized implementation focus"
    },
    {
      title: "Build complex, portfolio-ready systems",
      desc: "using the SARTHI methodology"
    },
    {
      title: "Accelerate career growth",
      desc: "by mastering the nuances of high-performance work"
    }
  ];

  const displayBenefits = benefits.length > 0 
    ? benefits.map(b => ({ title: b, desc: "Professional competency module" }))
    : defaultBenefits;

  return (
    <div className="space-y-5 font-plus-jakarta">
      <h2 className="text-[22px] font-semibold text-[#1A1916]">What You&apos;ll Learn</h2>

      {/* Stack cards vertically on mobile */}
      <div className="space-y-3">
        {displayBenefits.map((benefit, index) => (
          <div 
            key={index}
            className="p-5 bg-white rounded-2xl border border-[#EEECE6] shadow-sm flex gap-4 items-start active:scale-[0.98] transition-transform"
          >
            <div className="w-[36px] h-[36px] rounded-full bg-[#E8F4E8] flex items-center justify-center shrink-0 border border-[#C8DFC8]">
              <svg className="w-4 h-4 text-[#1F5C1F] stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1A1916] leading-snug mb-1">
                {benefit.title}
              </p>
              <p className="text-xs text-[#555550] font-normal leading-relaxed">
                {benefit.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

