// SkillIntelligenceWidget Component
'use client';

import { useQuery } from '@tanstack/react-query';
import { Rocket, Target, TrendingUp } from 'lucide-react';

interface SkillGap {
  skillName: string;
  proficiency: number;
}

interface Analysis {
  marketReadiness: number;
  skillGaps: SkillGap[];
  recommendations: any[];
  totalAssessments: number;
  needsMoreData: boolean;
}

export function SkillIntelligenceWidget() {
  const { data, isLoading } = useQuery({
    queryKey: ['skill-analysis'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/skills/analysis');
        if (!res.ok) throw new Error('Failed to fetch skill analysis');
        return res.json() as Promise<Analysis>;
      } catch {
        // Return default "needs more data" state on error
        return {
          marketReadiness: 0,
          skillGaps: [],
          recommendations: [],
          totalAssessments: 0,
          needsMoreData: true,
        };
      }
    },
  });

  if (isLoading) {
    return (
      <section className="bg-gradient-to-br from-brand-dark to-[#0f172a] rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 text-white relative overflow-hidden shadow-2xl border border-white/5">
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-white/10 rounded w-1/2"></div>
          <div className="h-20 bg-white/10 rounded"></div>
          <div className="space-y-2">
            <div className="h-2 bg-white/10 rounded"></div>
            <div className="h-2 bg-white/10 rounded w-5/6"></div>
          </div>
        </div>
      </section>
    );
  }

  // Fallback if data is missing or error occurred
  const analysis: Analysis = data || {
    marketReadiness: 0,
    skillGaps: [],
    recommendations: [],
    totalAssessments: 0,
    needsMoreData: true,
  };

  const hasEnoughData = !analysis.needsMoreData;

  return (
    <section className="bg-gradient-to-br from-brand-dark to-[#0f172a] rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 text-white relative overflow-hidden group shadow-2xl border border-white/5">
      <div className="absolute top-0 right-0 p-6 md:p-8 text-white/5 group-hover:text-white/10 transition-colors pointer-events-none">
        <Rocket className="w-24 h-24 md:w-32 md:h-32 rotate-12" />
      </div>
      <div className="relative z-10 space-y-6 md:space-y-8">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg md:text-xl font-black tracking-tight mb-2">
              Skill Intelligence
            </h3>
            <div className="h-1 w-12 bg-brand-orange rounded-full" />
          </div>
        </div>

        {hasEnoughData ? (
          <>
            <div className="flex items-center gap-4 md:gap-6">
              <div className="relative w-16 h-16 md:w-20 md:h-20 shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="50%"
                    cy="50%"
                    r="36"
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="6"
                  />
                  <circle
                    cx="50%"
                    cy="50%"
                    r="36"
                    fill="none"
                    stroke="rgb(251, 146, 60)"
                    strokeWidth="6"
                    strokeDasharray={`${2 * Math.PI * 36}`}
                    strokeDashoffset={`${2 * Math.PI * 36 * (1 - analysis.marketReadiness / 100)}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center font-black text-lg md:text-xl text-brand-orange">
                  {analysis.marketReadiness}%
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                  Market Readiness
                </p>
                <div className="flex items-center gap-2">
                  <h4 className="text-base md:text-lg font-black text-white leading-tight">
                    {analysis.marketReadiness >= 70
                      ? 'Strong'
                      : analysis.marketReadiness >= 50
                      ? 'Developing'
                      : 'Building'}
                  </h4>
                  {analysis.marketReadiness >= 70 && (
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {analysis.skillGaps.length > 0 ? (
                <>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                    Focus Areas
                  </p>
                  {analysis.skillGaps.slice(0, 3).map((gap, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between text-[10px]">
                        <span className="font-bold text-gray-300 truncate">{gap.skillName}</span>
                        <span className="font-black text-brand-orange">{gap.proficiency}%</span>
                      </div>
                      <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-orange rounded-full"
                          style={{ width: `${gap.proficiency}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <p className="text-[11px] text-emerald-400 font-bold">
                  ✓ No skill gaps detected! You&apos;re performing well across all areas.
                </p>
              )}
            </div>

            {analysis.recommendations.length > 0 && (
              <button
                className="w-full py-3 md:py-4 bg-brand-orange hover:bg-orange-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                onClick={() => (window.location.href = '/courses')}
              >
                <Target className="w-3 h-3 inline mr-2" />
                View Practice Recommendations
              </button>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center gap-4 md:gap-6">
              <div className="relative w-16 h-16 md:w-20 md:h-20 shrink-0 opacity-30">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="50%"
                    cy="50%"
                    r="36"
                    fill="none"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="6"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center font-black text-[10px] text-gray-500 uppercase">
                  ...
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                  Market Readiness
                </p>
                <h4 className="text-base md:text-lg font-black text-white/40 leading-tight italic">
                  Gathering data...
                </h4>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2 opacity-20">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-1 rounded-full bg-white/20" />
                ))}
              </div>
              <p className="text-[11px] text-gray-400 font-medium leading-relaxed">
                Complete {3 - analysis.totalAssessments} more assessments to unlock AI insights.
              </p>
            </div>

            <button
              disabled
              className="w-full py-3 md:py-4 bg-gray-800 text-gray-500 rounded-2xl text-[10px] font-black uppercase tracking-widest cursor-not-allowed"
            >
              Analysis Pending
            </button>
          </>
        )}
      </div>
    </section>
  );
}

