import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { METRIC_REGISTRY } from "@/lib/services/ai-registry";

export const dynamic = 'force-dynamic';

export default async function IntelligenceDashboard() {
  const unmatchedQueries = await prisma.unmatchedQuery.findMany({
    where: { resolved: false },
    orderBy: { frequency: 'desc' }
  });

  const overrideMetric = async (formData: FormData) => {
    'use server';
    const phrase = formData.get('phrase') as string;
    const metricId = formData.get('metricId') as string;
    const queryId = formData.get('queryId') as string;

    if (phrase && metricId) {
      await prisma.metricOverride.upsert({
        where: { phrase },
        create: { phrase, metricId },
        update: { metricId }
      });
      await prisma.unmatchedQuery.update({
        where: { id: queryId },
        data: { resolved: true }
      });
      revalidatePath('/admin/intelligence');
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-[32px] font-black text-[#0F172A] uppercase tracking-tighter">
          Intelligence <span className="text-amber-500">Training</span>
        </h1>
        <p className="text-slate-500 font-medium">Map unknown queries to metrics to train the AI without code.</p>
      </div>

      <div className="bg-white border border-slate-100 shadow-sm rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-slate-50 bg-slate-50/50">
          <h2 className="text-[12px] font-black text-[#0F172A] uppercase tracking-widest">Unmatched Queries ({unmatchedQueries.length})</h2>
        </div>
        
        {unmatchedQueries.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="font-bold text-[14px]">All caught up!</p>
            <p className="text-[12px]">The AI understands all recent questions.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {unmatchedQueries.map(q => (
              <div key={q.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                <div>
                  <p className="font-bold text-[#0F172A] text-[15px]">&quot;{q.phrase}&quot;</p>
                  <p className="text-[11px] font-black text-amber-600 uppercase tracking-widest mt-1">
                    Asked {q.frequency} times
                  </p>
                </div>
                
                <form action={overrideMetric} className="flex gap-3">
                  <input type="hidden" name="phrase" value={q.phrase} />
                  <input type="hidden" name="queryId" value={q.id} />
                  <select 
                    name="metricId" 
                    className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-[13px] font-medium outline-none focus:border-amber-500"
                    required
                  >
                    <option value="">Select Metric Mapping...</option>
                    {Object.keys(METRIC_REGISTRY).map(k => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                  <button 
                    type="submit"
                    className="bg-[#0F172A] text-amber-500 hover:bg-amber-500 hover:text-white px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all"
                  >
                    Train AI
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

