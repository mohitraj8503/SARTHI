'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Lightbulb, Award, Users, ArrowRight, Globe, Shield, Terminal, ArrowLeft, Mail, Phone } from 'lucide-react';
import { useState } from 'react';
import BrandStoryModal from '@/components/BrandStoryModal';

export default function AboutPage() {
  const [isBrandStoryOpen, setIsBrandStoryOpen] = useState(false);

  return (
    <div
      className="min-h-screen bg-[#F5F0E8] text-[#1A3C2E] font-sans selection:bg-[#2D6A4F] selection:text-white overflow-x-hidden"
      style={{ zoom: '112%' }}
    >
      <BrandStoryModal isOpen={isBrandStoryOpen} onClose={() => setIsBrandStoryOpen(false)} />

      {/* 1. HERO SECTION */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#2D6A4F]/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-[10%] left-[-10%] w-[500px] h-[500px] bg-[#E8B84B]/10 rounded-full blur-[100px]" />
        </div>

        <div className="container mx-auto max-w-[1100px] relative z-10 flex flex-col items-center text-center">

          {/* Pill */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <span className="bg-[#E8F5EE] text-[#2D6A4F] border border-[#C5D5C0] rounded-full px-4 py-1.5 text-[11px] font-bold tracking-[2.5px] uppercase">
              Centralized Capacity Building
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl leading-[1.1] font-bold mb-6 tracking-tight"
          >
            Capacity Building for the <br />
            <span className="text-[#2D6A4F]">India Meteorological Department.</span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[#5D705C] text-[16px] leading-[1.7] max-w-[620px] mb-10 font-medium"
          >
            SARTHI is the centralized Learning Management and Competency Development Portal for the India Meteorological Department (IMD), Ministry of Earth Sciences. Empowering meteorological cadres, technical divisions, and forecasting operations nationwide.
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex items-center gap-4"
          >
            <Link href="/courses">
              <button className="bg-[#1A3C2E] text-white px-8 py-3.5 rounded-full text-[13px] font-bold tracking-widest uppercase hover:bg-[#2D6A4F] transition-all shadow-lg shadow-[#1A3C2E]/20">
                Explore Training Modules
              </button>
            </Link>
            <button
              onClick={() => setIsBrandStoryOpen(true)}
              className="bg-transparent border border-[#1A3C2E] text-[#1A3C2E] px-8 py-3.5 rounded-full text-[13px] font-bold tracking-widest uppercase hover:bg-[#1A3C2E] hover:text-white transition-all cursor-pointer"
            >
              About SARTHI
            </button>
          </motion.div>
        </div>
      </section>


      {/* 2. FEATURE CARDS SECTION */}
      <section className="py-24 px-6 bg-white border-y border-[#E8E2D9]">
        <div className="container mx-auto max-w-[1100px]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* Card 1 */}
            <FeatureCard
              icon={<Shield className="w-6 h-6 text-[#2D6A4F]" />}
              title="Role-Based Training"
              text="Tailored competency curricula for meteorologists, radar engineers, forecasters, and scientific administrative teams across divisions."
            />

            {/* Card 2 */}
            <FeatureCard
              icon={<Award className="w-6 h-6 text-[#2D6A4F]" />}
              title="Standardized Curriculum"
              text="Institutional courses covering NWP modeling, satellite meteorology, Doppler weather radar workflows, and disaster warning protocols."
            />

            {/* Card 3 */}
            <FeatureCard
              icon={<Lightbulb className="w-6 h-6 text-[#2D6A4F]" />}
              title="Competency Tracking"
              text="Real-time divisional skill matrices, verifiable departmental certifications, and comprehensive organizational readiness tracking."
            />

          </div>
        </div>
      </section>


      {/* 3. MISSION SECTION */}
      <section className="py-24 px-6 bg-[#F5F0E8] overflow-hidden">
        <div className="container mx-auto max-w-[1100px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Image Side */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative rounded-[20px] overflow-hidden aspect-[4/5] shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A3C2E]/80 via-[#1A3C2E]/20 to-transparent z-10" />
              <Image
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="IMD Capacity Building Mandate"
                fill
                priority
                loading="eager"
                fetchPriority="high"
                className="object-cover"
              />
              <div className="absolute bottom-[28px] left-[28px] z-20">
                <span className="text-white/60 text-xs font-bold tracking-widest uppercase mb-2 block">Our Operational Principle</span>
                <h3 className="text-white text-2xl font-bold">Operational Readiness over Regularity.</h3>
              </div>
            </motion.div>

            {/* Text Side */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <span className="bg-[#E8F5EE] text-[#2D6A4F] border border-[#C5D5C0] rounded-full px-4 py-1.5 text-[11px] font-bold tracking-[2.5px] uppercase mb-6 inline-block">
                IMD Mission & Mandate
              </span>

              <h2 className="text-[36px] font-bold leading-[1.2] mb-6 text-[#1A3C2E]">
                Modernizing technical training & <span className="text-[#2D6A4F]">meteorological competency.</span>
              </h2>

              <p className="text-[#5D705C] text-[16px] leading-[1.7] mb-8 font-medium">
                Under the Ministry of Earth Sciences mandate, SARTHI unifies training across all IMD divisions, regional centers, and observational observatories into a single, synchronized digital capacity building platform.
              </p>

              <ul className="space-y-4 mb-10">
                <MissionPoint text="Standardized meteorological training across all Regional Meteorological Centres (RMCs)." />
                <MissionPoint text="Continuous tracking of scientific competencies and operational readiness." />
                <MissionPoint text="Certified assessments for radar systems, satellite meteorology, and climate modeling." />
              </ul>

              <Link href="/courses" className="inline-flex items-center gap-2 text-[#2D6A4F] font-bold text-sm tracking-widest uppercase hover:underline hover:text-[#1A3C2E] transition-colors">
                Explore Curriculum <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

          </div>
        </div>
      </section>


      {/* 4. STATS BAR */}
      <section className="py-24 px-6 bg-white border-y border-[#E8E2D9]">
        <div className="container mx-auto max-w-[1100px]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-[#E8E2D9]">
            <StatItem number="6" label="Regional Met Centres" />
            <StatItem number="40+" label="Training Modules" />
            <StatItem number="10K+" label="Departmental Capacity" />
            <StatItem number="100%" label="Institutional Alignment" />
          </div>
        </div>
      </section>


      {/* 5. OUR TEAM SECTION - SMART INDIA HACKATHON */}
      <section className="py-20 px-6 bg-[#F5F0E8] border-t border-[#E8E2D9]">
        <div className="container mx-auto max-w-[1240px]">

          <div className="text-center mb-14">
            <div className="inline-flex flex-wrap items-center justify-center gap-2 bg-[#E8F5EE] text-[#2D6A4F] border border-[#C5D5C0] rounded-full px-4 py-1.5 text-[11px] font-bold tracking-[1.5px] uppercase mb-4 shadow-xs">
              <span className="text-[#E8B84B]">🏆</span>
              <span>Smart India Hackathon</span>
              <span className="text-[#2D6A4F]/40">•</span>
              <span className="font-extrabold text-[#1A3C2E]">Team Catalytic Coders</span>
              <span className="text-[#2D6A4F]/40">•</span>
              <span className="text-[#2D6A4F]">ID: 126479</span>
            </div>
            <h2 className="text-[34px] md:text-[40px] font-bold text-[#1A3C2E] tracking-tight">
              The People Behind <span className="text-[#2D6A4F]">SARTHI.</span>
            </h2>
            <p className="text-[#5D705C] text-sm md:text-base font-medium max-w-2xl mx-auto mt-3">
              Conceptualized, engineered, and delivered by Team <strong className="text-[#1A3C2E] font-semibold">Catalytic Coders</strong> from <strong className="text-[#1A3C2E] font-semibold">ARKA JAIN University, Jharkhand</strong> to empower the India Meteorological Department&apos;s digital workforce.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 max-w-[1200px] mx-auto justify-items-center">
            {/* 1. Mohit Raj - Project Lead */}
            <div className="w-full max-w-[380px]">
              <TeamCard
                initials="MR"
                bg="#1A3C2E"
                badge="⚡ TEAM LEADER & ARCHITECT"
                name="Mohit Raj"
                role="Team Leader & Lead Full Stack Platform Architect"
                institution="ARKA JAIN University, Jharkhand"
                description="Led system architecture and core engineering of the SARTHI centralized capacity-building LMS portal for IMD, delivering role-based workflows, analytics pipelines, and secure cloud infrastructure."
                canFlip={true}
                socials={[
                  { platform: "Email", url: "mailto:mohitraj8503@gmail.com", label: "mohitraj8503@gmail.com" },
                  { platform: "Phone", url: "tel:+917654212171", label: "+91 76542 12171" },
                  { platform: "LinkedIn", url: "https://www.linkedin.com/in/mohitraj8503", label: "LinkedIn Profile" },
                  { platform: "GitHub", url: "https://github.com/mohitraj8503", label: "github.com/mohitraj8503" },
                ]}
              />
            </div>

            {/* 2. Krish Rishikesh */}
            <div className="w-full max-w-[380px]">
              <TeamCard
                initials="KR"
                bg="#2D6A4F"
                badge="🛠️ CORE PLATFORM & BACKEND"
                name="Krish Rishikesh"
                role="Core Systems & Backend Engineer"
                institution="ARKA JAIN University, Jharkhand"
                description="Architected scalable backend APIs, database schemas, and microservice integrations ensuring fault-tolerant data synchronisation and robust session security across ministerial nodes."
                canFlip={true}
                socials={[
                  { platform: "Email", url: "mailto:rishikeshkrishna590@gmail.com", label: "rishikeshkrishna590@gmail.com" },
                  { platform: "Phone", url: "tel:+917991138814", label: "+91 79911 38814" },
                ]}
              />
            </div>

            {/* 3. Ranjan Singh */}
            <div className="w-full max-w-[380px]">
              <TeamCard
                initials="RS"
                bg="#1F5C1F"
                badge="🎨 FRONTEND & UI ARCHITECTURE"
                name="Ranjan Singh"
                role="Frontend Architecture & Interactive UI"
                institution="ARKA JAIN University, Jharkhand"
                description="Spearheaded responsive interface engineering, design systems, and interactive LMS learning modules, ensuring high accessibility and intuitive desktop-to-mobile user journeys."
                canFlip={true}
                socials={[
                  { platform: "Email", url: "mailto:ranjansingh.w@gmail.com", label: "ranjansingh.w@gmail.com" },
                  { platform: "Phone", url: "tel:+916206704867", label: "+91 62067 04867" },
                ]}
              />
            </div>

            {/* 4. Nisha Chand */}
            <div className="w-full max-w-[380px]">
              <TeamCard
                initials="NC"
                bg="#245842"
                badge="📋 RESEARCH & TECH DOCS"
                name="Nisha Chand"
                role="Research, Competency & Tech Docs"
                institution="ARKA JAIN University, Jharkhand"
                description="Led domain requirements research, competency matrix alignment with IMD operational guidelines, curriculum benchmarks, and comprehensive technical documentation."
                canFlip={true}
                socials={[
                  { platform: "Email", url: "mailto:nisha144chand@gmail.com", label: "nisha144chand@gmail.com" },
                  { platform: "Phone", url: "tel:+918825271541", label: "+91 88252 71541" },
                ]}
              />
            </div>

            {/* 5. Trisha Singh */}
            <div className="w-full max-w-[380px]">
              <TeamCard
                initials="TS"
                bg="#1B4D3E"
                badge="✨ UI/UX & COURSE DESIGN"
                name="Trisha Singh"
                role="UI/UX & Meteorological Course Design"
                institution="ARKA JAIN University, Jharkhand"
                description="Crafted cohesive design prototypes, user journey workflows, and instructional layouts for specialized weather forecasting, radar data analysis, and climate training modules."
                canFlip={true}
                socials={[
                  { platform: "Email", url: "mailto:trishasingh3242@gmail.com", label: "trishasingh3242@gmail.com" },
                  { platform: "Phone", url: "tel:+919234684785", label: "+91 92346 84785" },
                ]}
              />
            </div>

            {/* 6. Janvi Sinha */}
            <div className="w-full max-w-[380px]">
              <TeamCard
                initials="JS"
                bg="#235A46"
                badge="🔬 QA & DATA VERIFICATION"
                name="Janvi Sinha"
                role="QA & Data Verification Engineer"
                institution="ARKA JAIN University, Jharkhand"
                description="Directed quality assurance pipelines, automated assessment validation, cross-browser compatibility testing, and data verification routines across all LMS modules."
                canFlip={true}
                socials={[
                  { platform: "Email", url: "mailto:sinhajanvi.2005@gmail.com", label: "sinhajanvi.2005@gmail.com" },
                  { platform: "Phone", url: "tel:+919508889380", label: "+91 95088 89380" },
                ]}
              />
            </div>
          </div>

        </div>
      </section>


      {/* 6. CTA SECTION */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-[1100px]">
          <div className="bg-[#1A3C2E] rounded-[24px] px-10 py-16 md:px-20 md:py-16 text-center shadow-2xl relative overflow-hidden">

            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#2D6A4F]/30 rounded-full blur-[100px] pointer-events-none" />

            <h2 className="text-[40px] font-bold text-white mb-2 relative z-10">
              Empowering India&apos;s Weather & <span className="text-[#E8B84B]">Climate Readiness.</span>
            </h2>
            <p className="text-white/75 text-lg mb-10 max-w-lg mx-auto relative z-10">
              Access specialized training modules, verify departmental competency certifications, and elevate operational readiness.
            </p>

            <Link href="/courses" className="relative z-10">
              <button className="bg-[#E8B84B] text-[#1A3C2E] px-10 py-3.5 rounded-full text-[14px] font-bold tracking-widest uppercase hover:bg-[#F0C855] hover:shadow-[0_0_20px_rgba(232,184,75,0.4)] transition-all">
                Explore Training Modules
              </button>
            </Link>

          </div>
        </div>
      </section>

    </div>
  );
}

/* --- COMPONENTS --- */

function FeatureCard({ icon, title, text }: { icon: React.ReactNode, title: string, text: string }) {
  return (
    <div className="bg-white border border-[#E8E2D9] rounded-[16px] p-7 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-shadow">
      <div className="w-12 h-12 bg-[#E8F5EE] rounded-[10px] flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-[17px] font-bold text-[#1A3C2E] mb-3">{title}</h3>
      <p className="text-[#5D705C] text-[14px] leading-[1.6] font-medium">{text}</p>
    </div>
  );
}

function MissionPoint({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-3">
      <div className="w-2 h-2 rounded-full bg-[#2D6A4F]" />
      <span className="text-[#1A3C2E] font-medium">{text}</span>
    </li>
  );
}

function StatItem({ number, label }: { number: string, label: string }) {
  return (
    <div className="text-center px-4">
      <div className="text-[48px] font-bold text-[#1A3C2E] mb-1">{number}</div>
      <div className="text-[11px] font-bold text-[#5D705C] uppercase tracking-[2px]">{label}</div>
    </div>
  );
}

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);

interface TeamCardProps {
  initials: string;
  bg?: string;
  photoUrl?: string;
  imageObjectPosition?: string;
  name: string;
  role: string;
  badge?: string;
  description?: string;
  quote?: string;
  institution?: string;
  canFlip?: boolean;
  socials?: { platform: string; url: string; label?: string }[];
}

function TeamCard({
  initials,
  bg = '#1A3C2E',
  photoUrl,
  imageObjectPosition = 'object-cover',
  name,
  role,
  badge,
  description,
  quote,
  institution = 'ARKA JAIN University, Jharkhand',
  canFlip = false,
  socials = []
}: TeamCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    if (canFlip) {
      setIsFlipped(!isFlipped);
    }
  };

  return (
    <div
      className={`group w-full h-[460px] ${canFlip ? 'cursor-pointer' : 'cursor-default'}`}
      onClick={handleFlip}
      style={{ perspective: '1000px' }}
    >
      <div
        className="relative w-full h-full transition-transform duration-700"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}
      >

        {/* FRONT SIDE */}
        <div
          className={`absolute inset-0 bg-white border border-[#E8E2D9] rounded-[20px] p-6 flex flex-col justify-between shadow-[0_2px_16px_rgba(26,60,46,0.07)] transition-all duration-300 hover:border-[#2D6A4F]/30 hover:shadow-[0_8px_24px_rgba(26,60,46,0.12)] ${isFlipped ? 'pointer-events-none' : ''}`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Subtle accent line at the top */}
          <div className="absolute top-0 left-6 right-6 h-[3px] rounded-b-full bg-gradient-to-r from-transparent via-[#2D6A4F]/30 to-transparent" />

          <div className="relative z-10 flex flex-col items-start h-full">

            {/* Top row: Avatar & Badge */}
            <div className="w-full flex items-start justify-between gap-3 mb-4">
              <div
                className="w-[84px] h-[84px] rounded-full overflow-hidden shrink-0 relative border-2 border-[#1A3C2E]/10 shadow-sm"
                style={{ backgroundColor: bg }}
              >
                {photoUrl ? (
                  <Image
                    src={photoUrl}
                    alt={name}
                    width={300}
                    height={300}
                    quality={95}
                    unoptimized
                    className={`w-full h-full object-cover ${imageObjectPosition}`}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-[28px] font-bold tracking-wider">
                    {initials}
                  </div>
                )}
              </div>

              {badge && (
                <div className="pt-1 text-right">
                  <span className="inline-block bg-[#E8F5EE] text-[#1A3C2E] border border-[#C5D5C0] text-[9.5px] font-extrabold tracking-wider px-2.5 py-1 rounded-full uppercase shadow-xs">
                    {badge}
                  </span>
                </div>
              )}
            </div>

            {/* Content Container */}
            <div className="mb-auto space-y-2 w-full">
              <div>
                <h3 className="text-[19px] font-bold text-[#1A3C2E] leading-snug">{name}</h3>
                <div className="text-[11px] font-bold text-[#2D6A4F] tracking-[0.5px] uppercase mt-0.5">{role}</div>
              </div>

              {institution && (
                <div className="flex items-center gap-1.5 text-[11px] text-[#5D705C] font-medium pt-0.5">
                  <span className="text-[#2D6A4F]">🏛️</span>
                  <span className="truncate">{institution}</span>
                </div>
              )}

              {description && (
                <p className="text-[#5D705C] text-[12.5px] leading-[1.5] font-medium line-clamp-4 pt-1">
                  {description}
                </p>
              )}

              {quote && (
                <div className="relative mt-2 p-2.5 bg-[#F5F0E8]/70 border border-[#E8E2D9] rounded-xl">
                  <p className="text-[#1A3C2E] text-[12px] italic font-medium leading-[1.5]">
                    &ldquo;{quote}&rdquo;
                  </p>
                </div>
              )}
            </div>

            {canFlip && (
              <div className="relative z-10 flex items-center justify-between w-full text-[#5D705C] text-[11.5px] font-medium mt-auto group-hover:text-[#2D6A4F] transition-colors pt-3 border-t border-[#F0EBE1]">
                <span className="flex items-center gap-1.5">
                  Click to view contacts &amp; links <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
                <span className="text-[10px] font-bold text-[#2D6A4F] bg-[#E8F5EE] px-2 py-0.5 rounded-full">
                  Team Member
                </span>
              </div>
            )}
          </div>
        </div>

        {/* BACK SIDE */}
        <div
          className={`absolute inset-0 bg-[#1A3C2E] rounded-[20px] p-6 flex flex-col justify-between shadow-xl ${isFlipped ? 'pointer-events-auto' : 'pointer-events-none'}`}
          style={{
            transform: 'rotateY(180deg)',
            backfaceVisibility: 'hidden'
          }}
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <h3 className="text-white text-[18px] font-bold">Connect with {name.split(' ')[0]}</h3>
              <span className="text-[9.5px] font-bold px-2 py-0.5 rounded bg-white/10 text-[#E8B84B] uppercase tracking-wider">
                Catalytic Coders
              </span>
            </div>
            <p className="text-white/70 text-xs font-medium">ARKA JAIN University • SIH ID: 126479</p>
            <div className="h-[2px] w-12 bg-[#E8B84B] mt-2.5 rounded-full" />
          </div>

          <div className="flex flex-col gap-2.5 my-auto">
            {socials.map((social) => {
              const isMail = social.platform === 'Email';
              const isPhone = social.platform === 'Phone';
              const href = isMail && !social.url.startsWith('mailto:')
                ? `mailto:${social.url}`
                : isPhone && !social.url.startsWith('tel:')
                ? `tel:${social.url.replace(/\s+/g, '')}`
                : social.url;

              let displayLabel = social.label || social.url;
              if (!social.label) {
                if (isMail) {
                  displayLabel = social.url.replace(/^mailto:/, '');
                } else if (isPhone) {
                  displayLabel = social.url.replace(/^tel:/, '');
                } else if (social.platform === 'LinkedIn') {
                  displayLabel = 'LinkedIn Profile';
                } else if (social.platform === 'GitHub') {
                  displayLabel = 'GitHub Profile';
                } else if (social.platform === 'Portfolio') {
                  displayLabel = 'Portfolio Website';
                }
              }

              return (
                <a
                  key={`${social.platform}-${social.url}`}
                  href={href}
                  target={isMail || isPhone ? '_self' : '_blank'}
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-3 bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/25 rounded-[10px] px-3.5 py-2.5 transition-all z-20 relative cursor-pointer group/link"
                  title={displayLabel}
                >
                  {social.platform === 'LinkedIn' && <LinkedinIcon className="w-4 h-4 text-[#0077B5] fill-current shrink-0" />}
                  {social.platform === 'Email' && <Mail className="w-4 h-4 text-[#E8B84B] shrink-0" />}
                  {social.platform === 'Phone' && <Phone className="w-4 h-4 text-[#4ADE80] shrink-0" />}
                  {social.platform === 'GitHub' && <GithubIcon className="w-4 h-4 text-white shrink-0" />}
                  {social.platform === 'Portfolio' && <Globe className="w-4 h-4 text-[#2D6A4F] shrink-0" />}

                  <span className="text-white/90 text-[12.5px] font-medium truncate group-hover/link:text-white">
                    {displayLabel}
                  </span>
                </a>
              );
            })}
          </div>

          <div className="pt-3 border-t border-white/10 text-white/50 text-[11px] flex items-center justify-between">
            <span className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">
              <ArrowLeft className="w-3 h-3" /> Click to flip back
            </span>
            <span className="text-[10px] text-[#E8B84B] font-mono font-medium">SIH 2024</span>
          </div>
        </div>

      </div>
    </div>
  );
}
