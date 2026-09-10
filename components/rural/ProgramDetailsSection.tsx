import { MapPin, Laptop, FileCheck, Briefcase, CheckCircle2, FileText } from 'lucide-react';
import Image from 'next/image';

export function ProgramDetailsSection() {
  const steps = [
    {
      phase: '01. Village Selection',
      title: 'Strategic Government Partnership',
      details: [
        'District education officers identify underserved high schools',
        'Infrastructure Audit: Connectivity, space & security',
        'Formal MoU signed with district administration',
        'Direct community engagement for student enrollment'
      ],
      icon: <MapPin className="w-6 h-6 text-emerald-600" />,
      image: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=800&fit=crop'
    },
    {
      phase: '02. Hub Infrastructure',
      title: 'Digital Lab Deployment',
      details: [
        'Deploy 10 high-performance laptops & peripherals',
        'High-speed internet setup with offline backup server',
        'Local Facilitator Training: Stipend-based employment',
        'Modular learning space optimized for coding'
      ],
      icon: <Laptop className="w-6 h-6 text-emerald-600" />,
      image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=800&fit=crop'
    },
    {
      phase: '03. Learning Journey',
      title: 'Structured Skill Building',
      details: [
        '12-week intensive: 3 sessions/week, 2 hours/session',
        'Curriculum: Digital Basics → Logic → Web Foundations',
        'Hands-on Projects: Build real applications for the community',
        'Weekly industry mentor sessions (Virtual)'
      ],
      icon: <FileCheck className="w-6 h-6 text-emerald-600" />,
      image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=800&fit=crop'
    },
    {
      phase: '04. Professional Outcome',
      title: 'Career Pipeline & Placement',
      details: [
        'NSDC-aligned certification assessment',
        'Remote internship opportunities with tech partners',
        'Freelance micro-tasking training for early income',
        'Entrepreneurship micro-grants for outstanding projects'
      ],
      icon: <Briefcase className="w-6 h-6 text-emerald-600" />,
      image: 'https://images.unsplash.com/photo-1454165833767-02a698d58743?q=80&w=800&fit=crop'
    }
  ];

  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 mb-4">
             <div className="h-px w-8 bg-emerald-200" />
             <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em]">Operational Framework</span>
             <div className="h-px w-8 bg-emerald-200" />
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-6 uppercase">
            HOW THE PROGRAM <br />
            <span className="text-emerald-600">ACTUALLY WORKS</span>
          </h2>
          <p className="text-slate-500 font-medium leading-relaxed">
            A transparent, audit-ready view of our 12-week rural digital transformation lifecycle.
          </p>
        </div>
        
        <div className="space-y-12">
          {steps.map((step, index) => (
            <div key={index} className="group relative">
              {/* Connector line for large screens */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute left-12 top-24 bottom-[-60px] w-0.5 bg-slate-200 group-hover:bg-emerald-200 transition-colors duration-500" />
              )}
              
              <div className="bg-white rounded-[3rem] p-8 lg:p-12 border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 overflow-hidden relative">
                {/* Background number */}
                <div className="absolute top-8 right-12 text-8xl font-black text-slate-50 opacity-[0.03] select-none uppercase">
                  Step {index + 1}
                </div>

                <div className="grid lg:grid-cols-[1fr_400px] gap-12 items-center relative z-10">
                  <div className="space-y-8">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500">
                        {step.icon}
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none mb-2">{step.phase}</p>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase leading-none">{step.title}</h3>
                      </div>
                    </div>
                    
                    <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
                      {step.details.map((detail, i) => (
                        <li key={i} className="flex items-start gap-3 group/item">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0 group-hover/item:scale-110 transition-transform" />
                          <span className="text-sm text-slate-600 font-medium leading-tight">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="relative aspect-[16/10] lg:aspect-square rounded-3xl overflow-hidden shadow-lg">
                    <Image 
                      src={step.image} 
                      alt={step.title} 
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-20 text-center">
          <a 
            href="/rural-initiative/program-brochure.pdf"
            download
            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-emerald-700 font-black text-xs uppercase tracking-widest rounded-2xl border-2 border-emerald-100 hover:bg-emerald-50 hover:border-emerald-200 transition-all shadow-sm active:scale-95 group"
          >
            <FileText className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
            Full Program Brochure (PDF)
          </a>
          <p className="mt-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            Detailed Curriculum • Budgets • Facilitator Guides
          </p>
        </div>
      </div>
    </section>
  );
}
