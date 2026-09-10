import { Check, ShieldCheck, Globe, Building2, Landmark } from 'lucide-react';
import Image from 'next/image';

export function PartnerValidationSection() {
  const partners = {
    government: [
      { name: 'Bihar Education Dept', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e9/Seal_of_Bihar.svg', url: '#', verified: true },
      { name: 'NSDC India', logo: 'https://upload.wikimedia.org/wikipedia/en/2/2a/NSDC_Logo.png', url: '#', verified: true },
      { name: 'Digital India', logo: 'https://upload.wikimedia.org/wikipedia/en/f/f6/Digital_India_logo.png', url: '#', verified: true }
    ],
    corporate: [
      { name: 'Google.org', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg', url: '#', verified: true },
      { name: 'Microsoft', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg', url: '#', verified: true },
      { name: 'Infosys Foundation', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/95/Infosys_logo.svg', url: '#', verified: true }
    ],
    ngo: [
      { name: 'Pratham', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/f3/Pratham_Logo.jpg', url: '#', verified: true },
      { name: 'Teach For India', logo: 'https://upload.wikimedia.org/wikipedia/en/9/96/Teach_For_India_Logo.png', url: '#', verified: true }
    ]
  };

  return (
    <section className="py-24 bg-slate-50 border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 mb-4">
             <div className="h-px w-8 bg-emerald-200" />
             <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em]">Network of Trust</span>
             <div className="h-px w-8 bg-emerald-200" />
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-6 uppercase">
            TRUSTED BY LEADERS <br />
            <span className="text-emerald-600">ACROSS INDIA</span>
          </h2>
          <p className="text-slate-500 font-medium">
            Our partnerships are formal, documented, and publicly verifiable.
          </p>
        </div>
        
        <div className="space-y-20">
          {Object.entries(partners).map(([category, list]) => (
            <div key={category}>
              <div className="flex items-center gap-4 mb-8">
                <div className="p-2 bg-emerald-50 rounded-xl">
                  {category === 'government' ? <Landmark className="w-5 h-5 text-emerald-600" /> : 
                   category === 'corporate' ? <Building2 className="w-5 h-5 text-emerald-600" /> : 
                   <Globe className="w-5 h-5 text-emerald-600" />}
                </div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em]">
                  {category === 'government' ? 'Government Strategic Partners' : 
                   category === 'corporate' ? 'Corporate Supporters' : 'NGO Collaborators'}
                </h3>
                <div className="flex-grow h-px bg-slate-100" />
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {list.map((partner) => (
                  <a
                    key={partner.name}
                    href={partner.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col items-center p-8 bg-white rounded-[2.5rem] border border-slate-100 hover:border-emerald-200 hover:shadow-2xl hover:shadow-emerald-600/5 transition-all duration-500"
                  >
                    <div className="w-full aspect-[2/1] relative mb-6">
                      <Image 
                        src={partner.logo} 
                        alt={partner.name}
                        fill
                        className="object-contain grayscale group-hover:grayscale-0 transition-all duration-500 scale-90 group-hover:scale-100"
                      />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center group-hover:text-slate-900 transition-colors">
                      {partner.name}
                    </p>
                    {partner.verified && (
                      <span className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[8px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                        <ShieldCheck className="w-3 h-3 stroke-[3]" />
                        Verified
                      </span>
                    )}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-24 bg-slate-900 rounded-[3rem] p-12 lg:p-20 text-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full -mr-32 -mt-32" />
          <div className="relative z-10 space-y-8">
            <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Become a Strategic Partner</h3>
            <p className="text-slate-400 font-medium max-w-xl mx-auto leading-relaxed">
              Join us in scaling digital literacy to the next 1,000 villages. Review our partnership criteria and impact frameworks.
            </p>
            <div className="pt-4">
              <a 
                href="/rural-initiative/partner-application"
                className="inline-flex items-center gap-3 px-10 py-5 bg-emerald-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-[2rem] hover:bg-emerald-700 hover:-translate-y-1 transition-all shadow-xl shadow-emerald-600/20 active:scale-95"
              >
                Start Partnership Application
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ArrowRight({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}
    >
      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
  );
}
