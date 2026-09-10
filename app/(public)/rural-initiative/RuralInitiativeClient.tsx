'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, CheckCircle2, Phone, MapPin, 
  GraduationCap, Trophy, Users, BookOpen, Shield, 
  ChevronDown, Loader2, Send, Building2, 
  User, PhoneCall, MapPinned, MessageCircle,
  Briefcase, UserCheck
} from 'lucide-react';
import Link from 'next/link';

const BENEFITS = [
  { icon: <BookOpen className="w-6 h-6" />, title: 'Free Coding & AI Curriculum', desc: 'Comprehensive, age-appropriate AI & Python curriculum designed for rural learners.' },
  { icon: <GraduationCap className="w-6 h-6" />, title: 'Village Study Labs', desc: 'Setting up physical and hybrid digital learning labs equipped with systems and local support.' },
  { icon: <Users className="w-6 h-6" />, title: 'Certified Vernacular Mentors', desc: 'Recruiting and training local community educators to teach in regional vernacular languages.' },
  { icon: <Trophy className="w-6 h-6" />, title: 'Academic & Career Pathways', desc: 'Connecting promising rural children with scholarships, specialized cohorts, and global programs.' },
  { icon: <Shield className="w-6 h-6" />, title: 'Verifiable Digital Credentials', desc: 'Verifiable shareable digital literacy certifications to open professional doors.' },
  { icon: <Users className="w-6 h-6" />, title: 'Community Impact Audits', desc: 'Quarterly analytics on digital inclusion progress and village-level literacy rates.' },
];

const STEPS = [
  { num: '01', title: 'Select a Village', desc: 'Identify local village schools and collaborate with community leaders (Panchayats)' },
  { num: '02', title: 'Setup & Onboarding', desc: 'Deliver computer workstations and certify selected local vernacular mentors' },
  { num: '03', title: 'Commence Learning', desc: 'Start live coding lessons, track academic metrics, and evaluate progress' },
];

const FAQS = [
  { q: 'Is this program really 100% free?', a: 'Yes! The entire program, computer setup, curriculum, and local mentoring are entirely free. SARTHI for SARTHI is fully supported by CSR contributions and philanthropic sponsors.' },
  { q: 'What is required from a village or center to participate?', a: 'The school or village center needs to provide an indoor classroom space and a reliable electricity connection. We coordinate all logistics, computer workstations, and educational mentoring.' },
  { q: 'How are local mentors selected?', a: 'We recruit educated young adults from the same village community and train them through our rigorous, certified Faculty Development Program, creating local opportunities.' },
  { q: 'Can corporate groups or individuals adopt a village?', a: 'Absolutely! Individuals and companies can sponsor computer hardware, fund internet connectivity, or adopt an entire village study lab. Contact us to learn more.' },
];

export default function RuralInitiativeClient() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Active Role Form State
  const [activeRole, setActiveRole] = useState<'student' | 'school' | 'partner'>('student');

  const [formData, setFormData] = useState({
    villageName: '',
    contactName: '',
    phone: '',
    city: '',
    state: '',
    district: '',
    studentsCount: '',
    message: '',
    age: '',
    organizationName: '',
    budgetRange: ''
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (videoRef.current) {
      videoRef.current.play().catch(err => {
        console.warn("Video autoplay failed:", err);
      });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
    }, 1500);
  };

  const handleRoleChange = (role: 'student' | 'school' | 'partner') => {
    setActiveRole(role);
    setFormData({
      villageName: '',
      contactName: '',
      phone: '',
      city: '',
      state: '',
      district: '',
      studentsCount: '',
      message: '',
      age: '',
      organizationName: '',
      budgetRange: ''
    });
    setSent(false);
  };

  return (
    <main className="relative min-h-screen bg-[#F5F0E8] text-slate-900 overflow-x-hidden">

      {/* Hero Section with Exact Juniors Blur Strategy and Structure */}
      <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-[#050A14] pt-14 lg:pt-20 pb-10 lg:pb-24">
        {/* Background Video with smooth opacity transition */}
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
          {mounted && (
            <video
              ref={videoRef}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              src="https://cdn.pixabay.com/video/2024/11/27/243611_large.mp4"
              onCanPlay={() => setVideoReady(true)}
              onPlaying={() => setVideoReady(true)}
              className={`absolute top-0 left-0 w-full h-full object-cover z-0 transition-opacity duration-[700ms] ease-out ${videoReady ? 'opacity-100' : 'opacity-0'}`}
              style={{ filter: 'brightness(0.9) contrast(1.06) saturate(1.05)' }}
            />
          )}
          <div className="hero-overlay absolute inset-0 z-[1] bg-gradient-to-b from-black/12 via-black/20 to-black/32 pointer-events-none" />
          <div className="absolute inset-0 z-[1] bg-gradient-to-r from-black/65 via-black/25 to-transparent pointer-events-none" />
          <div className="absolute inset-0 z-[2] opacity-[0.015] pointer-events-none bg-noise mix-blend-overlay" />
        </div>

        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 relative z-[10] flex justify-center lg:justify-start">
          <div className="max-w-[840px] w-full flex flex-col items-center lg:items-start text-center lg:text-left rounded-3xl">
            
            {/* Tag and Pill Badges */}
            <div className="flex flex-col items-center lg:items-start mb-6 w-full order-2 lg:order-1 font-inter">
              <span className="text-[11px] lg:text-[13px] font-bold tracking-[0.4em] lg:tracking-[0.6em] text-[#E8B84B] uppercase mb-5" style={{ textShadow: '0 2px 10px rgba(0, 0, 0, 0.7)' }}>
                Learn <span className="mx-2 text-white/40">-</span> Build <span className="mx-2 text-white/40">-</span> Grow
              </span>

              <div className="mb-0 px-4 py-1.5 rounded-full border border-white/20 bg-black/40 backdrop-blur-xl transition-all duration-300 shadow-md">
                <span className="text-[10px] font-bold tracking-[0.15em] text-white/95 uppercase flex items-center justify-center" style={{ textShadow: '0 1px 4px rgba(0, 0, 0, 0.5)' }}>
                  🚀 GRAND LAUNCH: COHORT 1 APPLICATIONS ARE LIVE!
                </span>
              </div>
            </div>

            {/* Main Heading & Description */}
            <div className="flex flex-col gap-[20px] mb-8 sm:mb-12 w-full order-1 lg:order-2">
              <div>
                <h1 className="text-[36px] lg:text-[clamp(3.5rem,6.5vw,6rem)] font-bold text-white tracking-tight leading-[1.05]" style={{ textShadow: '0 4px 20px rgba(0, 0, 0, 0.8), 0 2px 4px rgba(0, 0, 0, 0.6)' }}>
                  <span className="text-white/95">SARTHI for SARTHI</span>
                </h1>
              </div>

              <div>
                <p className="text-[15px] lg:text-[18px] text-white/90 font-medium leading-[1.6] bg-black/40 border border-white/20 backdrop-blur-xl rounded-[20px] p-5 lg:p-6 mx-auto lg:mx-0 max-w-[95%] lg:max-w-2xl mt-2 shadow-2xl">
                  Empowering rural youth with free coding & AI education. We are building the next generation of rural builders. Partner, study, or host a local hub with us today!
                </p>
              </div>
            </div>

            {/* Action Buttons exactly matching the design system */}
            <div className="flex flex-col sm:flex-row gap-[16px] items-stretch sm:items-start w-full sm:w-auto px-4 sm:px-0 order-3">
              <a
                href="#apply"
                className="w-full lg:w-[220px] h-12 lg:h-[52px] rounded-full bg-[#2D7A5D] text-white font-medium text-[15px] hover:bg-[#25664d] hover:shadow-lg active:scale-[0.98] transition-all duration-300 cursor-pointer flex items-center justify-center group"
              >
                <span>Join the Cohort</span>
                <ArrowRight className="ml-2 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </a>

              <a
                href="#benefits"
                className="w-full lg:w-[220px] h-12 lg:h-[52px] rounded-full bg-black/40 backdrop-blur-md text-white border border-white/20 font-medium text-[15px] hover:bg-black/60 transition-all duration-300 active:scale-[0.98] cursor-pointer flex items-center justify-center"
              >
                Explore Benefits
              </a>
            </div>

          </div>
        </div>

        {/* Bouncing Chevron down */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:block z-10">
          <ChevronDown className="w-6 h-6 text-white/40 animate-bounce" strokeWidth={2.5} />
        </div>
      </section>


      {/* Benefits Section */}
      <section className="py-16 lg:py-24 bg-[#FDFBF7]" id="benefits">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-3 border-l-4 border-[#E8B84B] pl-4 mb-6 mx-auto w-fit">
                <span className="text-xs font-bold text-[#5D705C] uppercase tracking-[0.3em]">BENEFITS</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-[#1A3C2E] mb-6">Key Benefits of <span className="text-[#E8B84B] italic">the Initiative</span></h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {BENEFITS.map((benefit, i) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-white p-8 rounded-[40px] border border-[#1A3C2E]/5 shadow-[0_16px_32px_-12px_rgba(26,60,46,0.04)] hover:shadow-[0_32px_64px_-16px_rgba(26,60,46,0.08)] hover:-translate-y-2 hover:border-[#E8B84B]/30 transition-all duration-700 group cursor-default relative overflow-hidden"
                >
                  <div className="w-14 h-14 rounded-2xl bg-[#E7F3EF] flex items-center justify-center text-[#2D7A5D] mb-6 group-hover:bg-[#E8B84B]/10 group-hover:text-[#E8B84B] transition-all duration-500 border border-[#2D7A5D]/10">
                    {benefit.icon}
                  </div>
                  <h3 className="text-lg font-bold text-[#1A3C2E] mb-3 group-hover:text-[#E8B84B] transition-colors duration-500">{benefit.title}</h3>
                  <p className="text-[#1A3C2E]/60 text-sm leading-relaxed">{benefit.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-3 border-l-4 border-[#E8B84B] pl-4 mb-6 mx-auto w-fit">
                <span className="text-xs font-bold text-[#5D705C] uppercase tracking-[0.3em]">PROCESS</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-[#1A3C2E] mb-6">How It <span className="text-[#E8B84B] italic">Works</span></h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {STEPS.map((step, i) => (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="text-center relative p-6 rounded-[32px] hover:bg-[#F5F0E8]/20 transition-all duration-500 group cursor-default"
                >
                  {i < STEPS.length - 1 && (
                    <div className="hidden md:block absolute top-16 left-[65%] w-[70%] h-0.5 bg-gradient-to-r from-[#E8B84B]/40 to-transparent" />
                  )}
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#1A3C2E] to-[#0A1410] text-[#E8B84B] text-2xl font-black flex items-center justify-center mx-auto mb-6 shadow-xl border border-white/5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    {step.num}
                  </div>
                  <h3 className="text-xl font-bold text-[#1A3C2E] mb-3 group-hover:text-[#2D7A5D] transition-colors duration-500">{step.title}</h3>
                  <p className="text-[#1A3C2E]/65 text-sm leading-relaxed max-w-xs mx-auto">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Role Selection & Interactive Form Section */}
      <section className="py-16 lg:py-24 bg-[#F5F0E8]" id="apply">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-3 border-l-4 border-[#E8B84B] pl-4 mb-6 mx-auto w-fit">
                <span className="text-xs font-bold text-[#5D705C] uppercase tracking-[0.3em]">APPLY</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-[#1A3C2E] mb-4">Choose Your <span className="text-[#E8B84B] italic">Path</span></h2>
              <p className="text-[#1A3C2E]/70 max-w-xl mx-auto">Select your profile category to access target application options for our village digital literacy movement.</p>
            </div>

            {/* Segment Selector Tab system matching Schools theme */}
            <div className="flex p-2 bg-white/70 backdrop-blur-md border border-[#0A1424]/10 rounded-[32px] max-w-2xl mx-auto mb-12 shadow-sm gap-2">
              <button 
                type="button"
                onClick={() => handleRoleChange('student')}
                className={`flex-1 py-4 px-4 rounded-[24px] font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${activeRole === 'student' ? 'bg-[#0A1424] text-white shadow-lg shadow-[#0A1424]/15' : 'text-[#0A1424] hover:bg-[#0A1424]/5'}`}
              >
                <span>🎓</span> <span className="hidden sm:inline">Rural Student</span><span className="sm:hidden">Student</span>
              </button>
              <button 
                type="button"
                onClick={() => handleRoleChange('school')}
                className={`flex-1 py-4 px-4 rounded-[24px] font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${activeRole === 'school' ? 'bg-[#0A1424] text-white shadow-lg shadow-[#0A1424]/15' : 'text-[#0A1424] hover:bg-[#0A1424]/5'}`}
              >
                <span>🏫</span> <span className="hidden sm:inline">School Principal</span><span className="sm:hidden">Principal</span>
              </button>
              <button 
                type="button"
                onClick={() => handleRoleChange('partner')}
                className={`flex-1 py-4 px-4 rounded-[24px] font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${activeRole === 'partner' ? 'bg-[#0A1424] text-white shadow-lg shadow-[#0A1424]/15' : 'text-[#0A1424] hover:bg-[#0A1424]/5'}`}
              >
                <span>🤝</span> <span className="hidden sm:inline">NGO / CSR</span><span className="sm:hidden">NGO/CSR</span>
              </button>
            </div>

            {/* Content Display and Form Grid */}
            <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
              
              {/* Dynamic Info Column */}
              <div className="lg:col-span-5 bg-[#0A1424]/90 backdrop-blur-xl rounded-[36px] p-8 sm:p-12 text-white relative overflow-hidden border border-white/10 flex flex-col justify-between shadow-2xl hover:shadow-[#0A1424]/30 hover:border-white/20 transition-all duration-500">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#E8B84B]/5 rounded-full blur-[80px] -mr-32 -mt-32" />
                <div className="relative z-10 space-y-6">
                  
                  <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-[#E8B84B]">
                    {activeRole === 'student' && <GraduationCap className="w-7 h-7" />}
                    {activeRole === 'school' && <Building2 className="w-7 h-7" />}
                    {activeRole === 'partner' && <Users className="w-7 h-7" />}
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeRole}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      <h3 className="text-2xl font-black tracking-tight uppercase text-white" style={{ color: '#ffffff' }}>
                        {activeRole === 'student' && 'Free Student Scholarship'}
                        {activeRole === 'school' && 'Host a Study Hub'}
                        {activeRole === 'partner' && 'Adopt a Village'}
                      </h3>
                      
                      <p className="text-white/80 text-sm leading-relaxed font-medium" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                        {activeRole === 'student' && 'Apply for 100% free digital skills, logic, python coding, and AI lessons. No system or prior coding experience required.'}
                        {activeRole === 'school' && 'Transform your government or rural aided school. Get computer workstation terminals and active curriculum support.'}
                        {activeRole === 'partner' && 'Directly fund equipment, connection points, or stipends for student clusters with verifiable quarterly audit reports.'}
                      </p>

                      <div className="h-px bg-white/15 my-6" />

                      <div className="space-y-4">
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>Target Requirements</p>
                        <ul className="space-y-3">
                          {activeRole === 'student' && [
                            'Age limit 14 to 22 years',
                            'Resident of target rural district',
                            '12-week commitment',
                            'Zero enrollment fees required'
                          ].map((req, i) => (
                            <li key={i} className="flex items-center gap-2.5 text-xs font-bold text-white/95" style={{ color: '#ffffff' }}>
                              <CheckCircle2 className="w-4 h-4 text-[#E8B84B] shrink-0" />
                              <span>{req}</span>
                            </li>
                          ))}
                          {activeRole === 'school' && [
                            'Govt or village aided institution',
                            'Basic electricity & safe space',
                            'Ready to select a mentor helper',
                            'No hardware costs to school'
                          ].map((req, i) => (
                            <li key={i} className="flex items-center gap-2.5 text-xs font-bold text-white/95" style={{ color: '#ffffff' }}>
                              <CheckCircle2 className="w-4 h-4 text-[#E8B84B] shrink-0" />
                              <span>{req}</span>
                            </li>
                          ))}
                          {activeRole === 'partner' && [
                            'Fully tax-exempt CSR eligible',
                            'Realtime telemetry impact data',
                            'Branding placements at village hub',
                            'Adopt 1, 5, or 10 village blocks'
                          ].map((req, i) => (
                            <li key={i} className="flex items-center gap-2.5 text-xs font-bold text-white/95" style={{ color: '#ffffff' }}>
                              <CheckCircle2 className="w-4 h-4 text-[#E8B84B] shrink-0" />
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="relative z-10 pt-8 border-t border-white/10 mt-8 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#E8B84B]" />
                  <span className="text-[10px] font-bold text-white/60 uppercase tracking-wider" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                    Verified Selection • Zero Hidden Costs
                  </span>
                </div>
              </div>

              {/* Dynamic Interactive Form Container */}
              <div className="lg:col-span-7 bg-white rounded-[36px] p-8 sm:p-12 border border-[#1A3C2E]/10 shadow-2xl shadow-[#1A3C2E]/5 flex flex-col justify-center">
                {!sent ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeRole}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-5"
                      >
                        
                        {/* Dynamic Field 1 */}
                        {activeRole === 'partner' ? (
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-[#1A3C2E]/85 uppercase tracking-[0.2em]">Company / NGO Organization Name *</label>
                            <div className="relative">
                              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5D705C]" />
                              <input
                                required type="text" value={formData.organizationName}
                                onChange={(e) => setFormData({...formData, organizationName: e.target.value})}
                                className="w-full bg-white border border-[#1A3C2E]/15 rounded-2xl px-12 py-4 text-[#1A3C2E] font-medium placeholder-[#5D705C]/40 focus:outline-none focus:bg-white focus:border-[#2D7A5D] focus:ring-4 focus:ring-[#2D7A5D]/10 transition-all duration-300 shadow-sm"
                                placeholder="Enter organization name"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-[#1A3C2E]/85 uppercase tracking-[0.2em]">
                              {activeRole === 'student' ? 'Full Name *' : 'Village School / Center Name *'}
                            </label>
                            <div className="relative">
                              {activeRole === 'student' ? (
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5D705C]" />
                              ) : (
                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5D705C]" />
                              )}
                              <input
                                required type="text" value={formData.villageName}
                                onChange={(e) => setFormData({...formData, villageName: e.target.value})}
                                className="w-full bg-white border border-[#1A3C2E]/15 rounded-2xl px-12 py-4 text-[#1A3C2E] font-medium placeholder-[#5D705C]/40 focus:outline-none focus:bg-white focus:border-[#2D7A5D] focus:ring-4 focus:ring-[#2D7A5D]/10 transition-all duration-300 shadow-sm"
                                placeholder={activeRole === 'student' ? 'Enter your full name' : 'Enter school name'}
                              />
                            </div>
                          </div>
                        )}

                        {/* Row 2 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-[#1A3C2E]/85 uppercase tracking-[0.2em]">Contact Coordinator *</label>
                            <div className="relative">
                              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5D705C]" />
                              <input
                                required type="text" value={formData.contactName}
                                onChange={(e) => setFormData({...formData, contactName: e.target.value})}
                                className="w-full bg-white border border-[#1A3C2E]/15 rounded-2xl px-12 py-4 text-[#1A3C2E] font-medium placeholder-[#5D705C]/40 focus:outline-none focus:bg-white focus:border-[#2D7A5D] focus:ring-4 focus:ring-[#2D7A5D]/10 transition-all duration-300 shadow-sm"
                                placeholder="Name of coordinator"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-[#1A3C2E]/85 uppercase tracking-[0.2em]">Phone Number *</label>
                            <div className="relative">
                              <PhoneCall className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5D705C]" />
                              <input
                                required type="tel" value={formData.phone}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                className="w-full bg-white border border-[#1A3C2E]/15 rounded-2xl px-12 py-4 text-[#1A3C2E] font-medium placeholder-[#5D705C]/40 focus:outline-none focus:bg-white focus:border-[#2D7A5D] focus:ring-4 focus:ring-[#2D7A5D]/10 transition-all duration-300 shadow-sm"
                                placeholder="+91 ..."
                              />
                            </div>
                          </div>
                        </div>

                        {/* Dynamic Row 3 */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                          <div className="space-y-2 md:col-span-1">
                            <label className="text-xs font-bold text-[#1A3C2E]/85 uppercase tracking-[0.2em]">City / Taluka *</label>
                            <input
                              required type="text" value={formData.city}
                              onChange={(e) => setFormData({...formData, city: e.target.value})}
                              className="w-full bg-white border border-[#1A3C2E]/15 rounded-2xl px-5 py-4 text-[#1A3C2E] font-medium placeholder-[#5D705C]/40 focus:outline-none focus:bg-white focus:border-[#2D7A5D] focus:ring-4 focus:ring-[#2D7A5D]/10 transition-all duration-300 shadow-sm"
                              placeholder="City"
                            />
                          </div>
                          <div className="space-y-2 md:col-span-1">
                            <label className="text-xs font-bold text-[#1A3C2E]/85 uppercase tracking-[0.2em]">District *</label>
                            <input
                              required type="text" value={formData.district}
                              onChange={(e) => setFormData({...formData, district: e.target.value})}
                              className="w-full bg-white border border-[#1A3C2E]/15 rounded-2xl px-5 py-4 text-[#1A3C2E] font-medium placeholder-[#5D705C]/40 focus:outline-none focus:bg-white focus:border-[#2D7A5D] focus:ring-4 focus:ring-[#2D7A5D]/10 transition-all duration-300 shadow-sm"
                              placeholder="District"
                            />
                          </div>
                          <div className="space-y-2 md:col-span-1">
                            <label className="text-xs font-bold text-[#1A3C2E]/85 uppercase tracking-[0.2em]">State *</label>
                            <input
                              required type="text" value={formData.state}
                              onChange={(e) => setFormData({...formData, state: e.target.value})}
                              className="w-full bg-white border border-[#1A3C2E]/15 rounded-2xl px-5 py-4 text-[#1A3C2E] font-medium placeholder-[#5D705C]/40 focus:outline-none focus:bg-white focus:border-[#2D7A5D] focus:ring-4 focus:ring-[#2D7A5D]/10 transition-all duration-300 shadow-sm"
                              placeholder="State"
                            />
                          </div>
                        </div>

                        {/* Extra conditional items */}
                        {activeRole === 'student' && (
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-[#1A3C2E]/85 uppercase tracking-[0.2em]">Age *</label>
                            <input
                              required type="number" value={formData.age} min={14} max={22}
                              onChange={(e) => setFormData({...formData, age: e.target.value})}
                              className="w-full bg-white border border-[#1A3C2E]/15 rounded-2xl px-5 py-4 text-[#1A3C2E] font-medium placeholder-[#5D705C]/40 focus:outline-none focus:bg-white focus:border-[#2D7A5D] focus:ring-4 focus:ring-[#2D7A5D]/10 transition-all duration-300 shadow-sm"
                              placeholder="Age (between 14 and 22)"
                            />
                          </div>
                        )}

                        {activeRole === 'school' && (
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-[#1A3C2E]/85 uppercase tracking-[0.2em]">Expected Student Capacity *</label>
                            <div className="relative">
                              <select
                                required
                                value={formData.studentsCount}
                                onChange={(e) => setFormData({...formData, studentsCount: e.target.value})}
                                className="w-full bg-white border border-[#1A3C2E]/15 rounded-2xl px-5 py-4 text-[#1A3C2E] font-medium focus:outline-none focus:bg-white focus:border-[#2D7A5D] focus:ring-4 focus:ring-[#2D7A5D]/10 transition-all duration-300 shadow-sm cursor-pointer appearance-none"
                              >
                                <option value="">Select Capacity</option>
                                <option value="0-100">0–100 students</option>
                                <option value="100-300">100–300 students</option>
                                <option value="300-500">300–500 students</option>
                                <option value="500+">500+ students</option>
                              </select>
                              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-[#5D705C]">
                                <ChevronDown className="w-4 h-4" />
                              </div>
                            </div>
                          </div>
                        )}

                        {activeRole === 'partner' && (
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-[#1A3C2E]/85 uppercase tracking-[0.2em]">CSR / NGO Budget Range *</label>
                            <div className="relative">
                              <select
                                required
                                value={formData.budgetRange}
                                onChange={(e) => setFormData({...formData, budgetRange: e.target.value})}
                                className="w-full bg-white border border-[#1A3C2E]/15 rounded-2xl px-5 py-4 text-[#1A3C2E] font-medium focus:outline-none focus:bg-white focus:border-[#2D7A5D] focus:ring-4 focus:ring-[#2D7A5D]/10 transition-all duration-300 shadow-sm cursor-pointer appearance-none"
                              >
                                <option value="">Select Range</option>
                                <option value="5l-10l">₹5 Lakhs – ₹10 Lakhs</option>
                                <option value="10l-25l">₹10 Lakhs – ₹25 Lakhs</option>
                                <option value="25l+">₹25 Lakhs +</option>
                              </select>
                              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-[#5D705C]">
                                <ChevronDown className="w-4 h-4" />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* General Message */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-[#1A3C2E]/85 uppercase tracking-[0.2em]">Message / Special requests</label>
                          <textarea
                            rows={3} value={formData.message}
                            onChange={(e) => setFormData({...formData, message: e.target.value})}
                            className="w-full bg-white border border-[#1A3C2E]/15 rounded-2xl px-5 py-4 text-[#1A3C2E] font-medium placeholder-[#5D705C]/40 focus:outline-none focus:bg-white focus:border-[#2D7A5D] focus:ring-4 focus:ring-[#2D7A5D]/10 transition-all duration-300 shadow-sm resize-none"
                            placeholder="Add message details..."
                          />
                        </div>

                      </motion.div>
                    </AnimatePresence>

                    <button
                      type="submit" disabled={sending}
                      className="w-full bg-[#1A3C2E] text-white border border-transparent px-10 py-5 rounded-full font-bold transition-all duration-500 ease-out flex items-center justify-center gap-3 disabled:opacity-50 shadow-lg hover:bg-[#E8B84B] hover:text-[#1A3C2E] hover:shadow-[#E8B84B]/20 hover:-translate-y-1 active:scale-[0.98] group cursor-pointer"
                    >
                      {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Submit Application <Send className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" /></>}
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-[#E8B84B]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="w-10 h-10 text-[#E8B84B]" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#1A3C2E] mb-4">Application Submitted!</h3>
                    <p className="text-[#1A3C2E]/70 mb-6 font-medium">Thank you for your application. Our SARTHI Initiative expert coordinator will contact you within 24 hours.</p>
                    <button onClick={() => setSent(false)} className="text-[#1A3C2E] font-black hover:text-[#E8B84B] transition-colors uppercase tracking-widest text-[10px]">
                      Submit another request →
                    </button>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 lg:py-24 bg-[#FCFAF7]">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-3 border-l-4 border-[#E8B84B] pl-4 mb-6 mx-auto w-fit">
                <span className="text-xs font-bold text-[#5D705C] uppercase tracking-[0.3em]">FAQ</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-[#1A3C2E] mb-6">Common <span className="text-[#E8B84B] italic">Questions</span></h2>
            </div>

            <div className="space-y-4">
              {FAQS.map((faq, i) => (
                <details key={i} className="group bg-white rounded-[24px] overflow-hidden hover:shadow-lg hover:shadow-[#1A3C2E]/5 border border-[#1A3C2E]/5 border-l-4 border-l-transparent hover:border-l-[#E8B84B] transition-all duration-300">
                  <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                    <span className="font-bold text-[#1A3C2E] group-hover:text-[#E8B84B] transition-colors duration-300 pr-4">{faq.q}</span>
                    <ChevronDown className="w-5 h-5 text-[#5D705C] group-open:rotate-180 transition-transform shrink-0" />
                  </summary>
                  <div className="px-6 pb-6 text-[#1A3C2E]/70 leading-relaxed border-t border-[#1A3C2E]/5 pt-4">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-20 lg:py-28 bg-[#F5F0E8] border-t border-[#1A3C2E]/10">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-[#0F1E36] via-[#0A1424] to-[#050A10] rounded-[48px] p-12 lg:p-16 text-center border border-white/10 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#E8B84B]/5 rounded-full blur-[100px] -mr-48 -mt-48" />
              <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#2D7A5D]/5 rounded-full blur-[100px] -ml-48 -mb-48" />
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 relative z-10 leading-tight">Still have <br/><span className="text-[#E8B84B] italic">Questions?</span></h2>
              <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto relative z-10 font-medium">
                Our rural coordinator experts are ready to assist you in establishing your village program.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10">
                <a href="tel:+919835019509" className="w-full sm:w-auto flex items-center justify-center gap-4 bg-white/10 border border-white/20 text-white px-10 py-5 rounded-full font-black hover:bg-white/20 transition-all uppercase tracking-widest text-[10px]">
                  <Phone className="w-4 h-4" /> +91 98350 19509
                </a>
                <a href="https://api.whatsapp.com/send?phone=919835019509" className="w-full sm:w-auto flex items-center justify-center gap-4 bg-[#E8B84B] text-[#1A3C2E] px-10 py-5 rounded-full font-black hover:bg-[#F0C855] hover:shadow-2xl hover:shadow-[#E8B84B]/30 hover:-translate-y-1 active:scale-95 transition-all uppercase tracking-widest text-[10px]">
                  <MessageCircle className="w-4 h-4" /> WhatsApp Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
