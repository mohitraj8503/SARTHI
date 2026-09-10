import { ArrowUpRight, ShieldAlert, PieChart, FileText, Landmark } from 'lucide-react';

export function TransparencySection() {
  const transparencyItems = [
    {
      title: 'Program Budgeting',
      content: '₹2.5 lakh per village/year covers: Lab infrastructure (₹1.2L), facilitator stipends (₹96K), curriculum (₹24K), monitoring (₹10K).',
      link: '/rural-initiative/budget-breakdown.pdf',
      icon: <PieChart className="w-5 h-5 text-emerald-600" />
    },
    {
      title: 'Site Selection Criteria',
      content: 'Villages selected based on: Digital access index < 30%, school space readiness, and local government strategic partnership.',
      link: '/rural-initiative/selection-criteria',
      icon: <Landmark className="w-5 h-5 text-emerald-600" />
    },
    {
      title: 'Impact Methodology',
      content: 'We track 12 key KPIs: from enrollment to income increase. All data is verified by a third-party impact auditor quarterly.',
      link: '/rural-initiative/methodology',
      icon: <ShieldAlert className="w-5 h-5 text-emerald-600" />
    },
    {
      title: 'Financial Accountability',
      content: 'Annual audited financial statements published publicly. Donor funds are tracked in separate dedicated project accounts.',
      link: '/reports/financials-2025.pdf',
      icon: <FileText className="w-5 h-5 text-emerald-600" />
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 mb-4">
             <div className="h-px w-8 bg-emerald-200" />
             <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em]">Radical Openness</span>
             <div className="h-px w-8 bg-emerald-200" />
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-6 uppercase">
            FULL TRANSPARENCY, <br />
            <span className="text-emerald-600">ALWAYS</span>
          </h2>
          <p className="text-slate-500 font-medium">
            We believe trust is earned through evidence. Explore our operations, finances, and impact methodology.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {transparencyItems.map((item, index) => (
            <div key={index} className="group bg-slate-50 rounded-[2.5rem] p-10 border border-slate-100 hover:bg-white hover:shadow-2xl hover:shadow-emerald-600/5 transition-all duration-500 relative">
              <div className="flex items-start justify-between mb-8">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500">
                  {item.icon}
                </div>
                <a 
                  href={item.link}
                  className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center group-hover:border-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-4">{item.title}</h3>
              <p className="text-slate-500 font-medium text-sm leading-relaxed mb-8">{item.content}</p>
              <a 
                href={item.link}
                className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] border-b-2 border-emerald-100 hover:border-emerald-500 transition-all pb-1"
              >
                Download Evidence Details
              </a>
            </div>
          ))}
        </div>
        
        <div className="mt-20 bg-emerald-50 rounded-[3rem] p-10 lg:p-16 border border-emerald-100">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="text-center lg:text-left space-y-4">
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none">Questions or Concerns?</h3>
              <p className="text-slate-600 font-medium leading-relaxed max-w-md">
                Contact our impact accountability team directly. We maintain a 48-hour response guarantee for all inquiries.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <a 
                href="mailto:impact@sarthi.com"
                className="flex items-center justify-center gap-3 px-8 py-4 bg-white text-slate-900 font-black text-[10px] uppercase tracking-widest rounded-2xl border border-slate-200 hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-600/5 transition-all active:scale-95 min-h-[56px]"
              >
                Email: impact@sarthi.com
              </a>
              <a 
                href="tel:+917061600818"
                className="flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-emerald-600 transition-all shadow-xl shadow-slate-900/20 active:scale-95 min-h-[56px]"
              >
                Call: +91-7061600818
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
