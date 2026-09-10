'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
  </svg>
);

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const YoutubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

export default function Footer() {
  return (
    <footer 
      role="contentinfo" 
      className="border-t border-[#184533] pt-12 sm:pt-14 pb-8 relative bg-[#0B251B] text-white antialiased [text-rendering:optimizeLegibility] selection:bg-emerald-500/20"
    >
      <div className="w-full max-w-[1320px] mx-auto px-4 sm:px-8 lg:px-10 pb-[calc(70px+env(safe-area-inset-bottom,16px))] lg:pb-0">
        
        {/* Main Grid: 5 Columns with compact, readable layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-12 gap-8 lg:gap-10 mb-10">

          {/* Column 1: Brand & Identity (Span 4) */}
          <div className="sm:col-span-2 md:col-span-3 lg:col-span-4 pr-0 lg:pr-4">
            <div className="flex items-center gap-4 mb-4">
              <Link href="/" className="shrink-0 group block" aria-label="SARTHI Home">
                <img
                  src="/images/moes-logo-256.png"
                  srcSet="/images/moes-logo-128.png 1x, /images/moes-logo-256.png 2x, /images/moes-logo-512.png 3x"
                  alt="Ministry of Earth Sciences Logo"
                  className="w-18 h-18 sm:w-20 sm:h-20 md:w-[84px] md:h-[84px] object-contain shrink-0 group-hover:scale-105 transition-transform drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]"
                  style={{ imageRendering: '-webkit-optimize-contrast' }}
                />
              </Link>
              <div className="flex flex-col justify-center">
                <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-none">
                  SARTHI
                </span>
                <span className="text-[11px] sm:text-xs font-bold text-[#34d399] uppercase tracking-[0.14em] leading-tight mt-1.5">
                  Ministry of Earth Sciences
                </span>
                <span className="text-[11px] sm:text-[12px] font-bold text-white uppercase tracking-[0.12em] leading-tight mt-1">
                  India Meteorological Department
                </span>
              </div>
            </div>
            
            <p className="text-sm text-white/90 mb-5 leading-relaxed max-w-md font-normal">
              Unified digital training, competency tracking, and skill development architecture for the India Meteorological Department.
            </p>

            <div className="flex gap-2 mb-4">
              <SocialLink icon={<LinkedinIcon className="w-3.5 h-3.5" />} href="https://linkedin.com/company/sarthi" label="LinkedIn" />
              <SocialLink icon={<TwitterIcon className="w-3.5 h-3.5" />} href="https://twitter.com/sarthi" label="Twitter" />
              <SocialLink icon={<InstagramIcon className="w-3.5 h-3.5" />} href="https://www.instagram.com/sarthi/" label="Instagram" />
              <SocialLink icon={<YoutubeIcon className="w-3.5 h-3.5" />} href="https://youtube.com/@mohitraj8503" label="YouTube" />
            </div>

            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#071b13] border border-[#184533] text-xs font-medium text-white shadow-xs">
              <img
                src="/images/moes-logo-84.png"
                alt="MoES Seal"
                className="w-5 h-5 object-contain rounded-full shrink-0"
                style={{ imageRendering: '-webkit-optimize-contrast' }}
              />
              <span className="tracking-wide font-medium">Ministry of Earth Sciences • Govt. of India</span>
            </div>
          </div>

          {/* Column 2: Training Modules (Span 2) */}
          <div className="lg:col-span-2">
            <h3 className="text-white text-xs sm:text-[13px] font-bold uppercase tracking-wider mb-4">
              Curriculum
            </h3>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li><FooterLink href="/courses" label="All Modules" /></li>
              <li><FooterLink href="/courses" label="Satellite Meteorology" /></li>
              <li><FooterLink href="/courses" label="Numerical Prediction" /></li>
              <li><FooterLink href="/internship" label="Internship Cohort" /></li>
              <li><FooterLink href="/workshops" label="Operational Labs" /></li>
              <li><FooterLink href="/blogs" label="Technical Bulletins" /></li>
            </ul>
          </div>

          {/* Column 3: IMD Divisions (Span 2) */}
          <div className="lg:col-span-2">
            <h3 className="text-white text-xs sm:text-[13px] font-bold uppercase tracking-wider mb-4">
              Divisions
            </h3>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li><FooterLink href="/courses" label="NWP & Forecasting" /></li>
              <li><FooterLink href="/courses" label="Radar & Sat-Met" /></li>
              <li><FooterLink href="/courses" label="Agro-Met Services" /></li>
              <li><FooterLink href="/courses" label="Regional Met Centers" /></li>
              <li><FooterLink href="/about" label="Mandate & Standards" /></li>
            </ul>
          </div>

          {/* Column 4: Portals & Verification (Span 2) */}
          <div className="lg:col-span-2">
            <h3 className="text-white text-xs sm:text-[13px] font-bold uppercase tracking-wider mb-4">
              Verification
            </h3>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li>
                <Link href="/verify" className="text-white hover:text-emerald-300 transition-colors font-semibold flex items-center gap-1.5">
                  <span>Verify Certificate</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#34d399]" />
                </Link>
              </li>
              <li><FooterLink href="/verify" label="Credentials Hub" /></li>
              <li><FooterLink href="/login" label="Officer & Staff Login" /></li>
              <li><FooterLink href="/about" label="Competency Framework" /></li>
            </ul>
          </div>

          {/* Column 5: Legal & Support (Span 2) */}
          <div className="lg:col-span-2">
            <h3 className="text-white text-xs sm:text-[13px] font-bold uppercase tracking-wider mb-4">
              Organization
            </h3>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li><FooterLink href="/about" label="About SARTHI" /></li>
              <li><FooterLink href="/contact" label="Helpdesk & Support" /></li>
              <li><FooterLink href="/faqs" label="Portal FAQs" /></li>
              <li><FooterLink href="/privacy" label="Privacy Policy" /></li>
              <li><FooterLink href="/terms" label="Terms of Service" /></li>
              <li><FooterLink href="/accessibility" label="Accessibility" /></li>
            </ul>
          </div>

        </div>

        {/* Clean Newsletter / Bulletin Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#071b13] border border-[#184533] mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="max-w-xl text-center md:text-left">
            <h4 className="text-white font-bold text-sm sm:text-[15px] mb-0.5">
              IMD Capacity Building Bulletins
            </h4>
            <p className="text-xs sm:text-sm text-white/85 leading-relaxed">
              Official updates on training schedules, atmospheric modeling sessions, and institutional certifications.
            </p>
          </div>
          <form onSubmit={(e) => e.preventDefault()} className="flex items-center gap-2.5 w-full md:w-auto">
            <input 
              type="email"
              placeholder="Enter official email"
              required
              className="h-10 px-3.5 bg-[#040f0a] border border-[#184533] rounded-xl text-xs sm:text-sm text-white placeholder:text-white/50 focus:outline-none focus:border-[#34d399]/70 focus:ring-1 focus:ring-[#34d399]/40 w-full sm:w-64 transition-all"
            />
            <button
              type="submit"
              className="h-10 px-4 bg-[#34d399] hover:bg-[#10b981] text-[#052115] font-semibold text-xs sm:text-sm rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer shrink-0"
            >
              Subscribe
            </button>
          </form>
        </div>

        {/* Bottom Bar */}
        <div className="pt-4 pb-2 border-t border-[#184533] flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-white/80">
          <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
            <p>© {new Date().getFullYear()} SARTHI. India Meteorological Department, Ministry of Earth Sciences.</p>
            <span className="hidden sm:inline text-white/40">•</span>
            <p className="text-white font-medium">Govt. of India</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <Link href="/privacy" className="text-white/80 hover:text-white transition-colors">Privacy Policy</Link>
            <span>•</span>
            <Link href="/terms" className="text-white/80 hover:text-white transition-colors">Terms</Link>
            <span>•</span>
            <Link href="/accessibility" className="text-white/80 hover:text-white transition-colors">Accessibility</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="text-white/85 hover:text-white transition-colors duration-150 inline-block font-normal text-sm"
    >
      {label}
    </Link>
  );
}

function SocialLink({ icon, href, label }: { icon: React.ReactNode; href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#071b13] border border-[#184533] text-white hover:text-white hover:bg-[#143a2b] hover:border-emerald-500 transition-all"
    >
      {icon}
    </a>
  );
}
