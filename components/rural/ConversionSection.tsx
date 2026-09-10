import Link from 'next/link';
import { UserPlus, School, Handshake, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

export function ConversionSection() {
  const userTypes = [
    {
      type: 'student',
      title: 'Rural Student?',
      description: 'Apply for free digital skills training in your village school.',
      cta: 'Check Eligibility & Apply',
      href: '/rural-initiative/apply-student',
      icon: <UserPlus className="w-6 h-6 text-emerald-600" />,
      requirements: [
        'Age 14-22 years',
        'Reside in active program district',
        'Commit to 12-week intensive',
        'No prior coding skills required'
      ],
      theme: 'emerald'
    },
    {
      type: 'school',
      title: 'School Principal?',
      description: 'Bring the digital classroom to your government high school.',
      cta: 'Request Program Hub',
      href: '/rural-initiative/apply-school',
      icon: <School className="w-6 h-6 text-slate-600" />,
      requirements: [
        'Govt or Aided institution',
        'Basic electricity & secure space',
        'Willingness to host labs',
        'Identify 2 local facilitators'
      ],
      theme: 'slate'
    },
    {
      type: 'partner',
      title: 'CSR/NGO Partner?',
      description: 'Fund equipment, training, or stipends for a cluster of villages.',
      cta: 'View CSR Opportunities',
      href: '/rural-initiative/partner-application',
      icon: <Handshake className="w-6 h-6 text-slate-900" />,
      requirements: [
        'Direct impact tracking',
        'Tax-exempt donations (80G)',
        'Quarterly impact reporting',
        'Strategic cluster alignment'
      ],
      theme: 'dark'
    }
  ];

  return (
    <section className="py-24 bg-emerald-600 relative overflow-hidden">
      {/* Decorative patterns */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[120px] rounded-full -mr-48 -mt-48" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 blur-[100px] rounded-full -ml-32 -mb-32" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 mb-4">
             <div className="h-px w-8 bg-emerald-400" />
             <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Join the movement</span>
             <div className="h-px w-8 bg-emerald-400" />
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-6 uppercase">
            GET INVOLVED <br />
            <span className="text-emerald-200">TODAY</span>
          </h2>
          <p className="text-emerald-50 font-medium">
            Choose your path to support rural digital empowerment. 
            All applications reviewed within 5 business days.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {userTypes.map((user) => (
            <div key={user.type} className="group bg-white rounded-[3rem] p-10 shadow-2xl shadow-black/10 hover:-translate-y-2 transition-all duration-500 relative overflow-hidden">
              <div className="relative z-10 space-y-8">
                {/* Icon + Header */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all duration-500">
                    {user.icon}
                  </div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{user.title}</h3>
                </div>
                
                <p className="text-slate-500 font-medium leading-relaxed">{user.description}</p>
                
                {/* Requirements */}
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Core Requirements</p>
                  <ul className="space-y-3">
                    {user.requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span className="text-xs font-bold text-slate-700">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* CTA */}
                <div className="pt-4">
                  <Link
                    href={user.href}
                    className="w-full inline-flex items-center justify-center px-6 py-4 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-emerald-600 transition-all shadow-lg active:scale-95 group/btn"
                  >
                    {user.cta}
                    <ArrowRight className="w-3 h-3 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                  <Link 
                    href={`/rural-initiative/faq#${user.type}`}
                    className="mt-4 block text-center text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors"
                  >
                    Have Questions? View FAQ
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Trust reinforcement */}
        <div className="mt-20 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-emerald-700/50 backdrop-blur-md rounded-full border border-white/10 shadow-lg">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span className="text-[10px] font-black text-emerald-50 uppercase tracking-[0.2em]">
              Data Privacy Protected • Zero Application Fees • Verified Selection
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
