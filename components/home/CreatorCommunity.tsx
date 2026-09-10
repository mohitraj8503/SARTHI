'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Instagram, Linkedin, Github, Youtube, BadgeCheck, Compass, Link as LinkIcon, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const creators = [
  {
    name: "Surjo Banerjee",
    role: "AI Creator & Tech Community Builder",
    bio: "Exploring AI, tech and content creation while helping students learn through practical experiences and community-driven initiatives. Passionate about building meaningful tech ecosystems that empower the next generation of innovators.",
    quote: "Building communities where students can explore, create and innovate.",
    image: "/images/Surjo-final.jpeg",
    interests: [
      "AI & Machine Learning",
      "Web Development",
      "Tech Community",
      "Content Creation",
      "Open Source",
      "Student Innovation"
    ],
    socials: {
      instagram: "https://www.instagram.com/surjobanerjee207/",
      linkedin: "https://linkedin.com/in/surjobanerjee",
      github: "https://github.com/surjobanerjee",
      youtube: "https://youtube.com/@surjobanerjee",
    }
  }
];

export default function CreatorCommunity() {
  return (
    <section className="relative py-20 sm:py-28 bg-[#F5F0E8] overflow-hidden">
      <div className="container mx-auto px-6 max-w-screen-xl relative z-10">
        
        {/* Section Header */}
        <div className="mb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-center gap-4 mb-4"
          >
            <div className="w-8 h-[1px] bg-[#2D6A4F]/30"></div>
            <span className="text-[11px] font-extrabold uppercase tracking-[0.3em] text-[#2D6A4F]">
              CREATOR COMMUNITY
            </span>
            <div className="w-8 h-[1px] bg-[#2D6A4F]/30"></div>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-[44px] font-bold text-[#1A3C2E] tracking-tight mb-2"
          >
            Meet the creators building the future
          </motion.h2>
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-2xl md:text-[36px] font-bold text-[#2D6A4F] italic mb-6"
          >
            with SARTHI.
          </motion.h3>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-sm md:text-base text-[#5D705C] font-medium"
          >
            Real creators. Real impact. Real community.
          </motion.p>
        </div>

        {/* Main Card */}
        <div className="max-w-6xl mx-auto">
          {creators.map((creator) => (
            <motion.div
              key={creator.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-[40px] p-6 md:p-10 lg:p-12 shadow-[0_15px_40px_rgba(0,0,0,0.03)] border border-white"
            >
              <div className="flex flex-col lg:flex-row gap-10 lg:gap-12">
                
                {/* Column 1: Image */}
                <div className="w-full lg:w-[32%] shrink-0">
                  <div className="relative aspect-[4/4.5] rounded-[30px] overflow-hidden shadow-lg">
                    <Image
                      src={creator.image}
                      alt={creator.name}
                      fill
                      className="object-cover scale-110"
                      quality={100}
                      priority
                    />
                  </div>
                </div>

                {/* Column 2: Content */}
                <div className="flex-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2D6A4F]/10 text-[#2D6A4F] text-[9px] font-black uppercase tracking-wider mb-6">
                    <div className="w-1 h-1 rounded-full bg-[#2D6A4F]"></div>
                    FEATURED CREATOR
                  </div>
                  
                  <h3 className="text-3xl md:text-[42px] font-bold text-[#1A3C2E] tracking-tight mb-2">
                    {creator.name}
                  </h3>
                  <p className="text-base md:text-lg font-bold text-[#2D6A4F] mb-8">
                    {creator.role}
                  </p>
                  
                  <p className="text-sm md:text-[15px] text-[#5D705C] leading-[1.7] mb-10 max-w-xl font-medium">
                    {creator.bio}
                  </p>

                  <div className="relative pl-6 border-l-[3px] border-[#2D6A4F]/20 py-1">
                    <p className="text-sm md:text-base italic font-bold text-[#2D6A4F] leading-relaxed">
                      &ldquo;{creator.quote}&rdquo;
                    </p>
                  </div>
                </div>

                {/* Column 3: Stats & Socials */}
                <div className="w-full lg:w-[28%] space-y-10">
                  {/* Focus Areas */}
                  <div>
                    <div className="flex items-center gap-2 mb-6 text-[#1A3C2E]">
                      <Compass className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em]">FOCUS AREAS</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {creator.interests.map((interest) => (
                        <span 
                          key={interest}
                          className="px-3.5 py-2 bg-[#F5F5F5] text-[#2D6A4F] text-[10px] font-bold rounded-xl transition-colors hover:bg-[#2D6A4F]/5"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Connect */}
                  <div>
                    <div className="flex items-center gap-2 mb-6 text-[#1A3C2E]">
                      <LinkIcon className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em]">CONNECT</span>
                    </div>
                    <div className="flex gap-3">
                      {Object.entries(creator.socials).map(([platform, url]) => (
                        <a
                          key={platform}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center w-11 h-11 rounded-xl bg-[#F5F5F5] text-[#5D705C] hover:bg-[#2D6A4F] hover:text-white transition-all duration-300"
                        >
                          {platform === 'instagram' && <Instagram className="w-4 h-4" />}
                          {platform === 'linkedin' && <Linkedin className="w-4 h-4" />}
                          {platform === 'github' && <Github className="w-4 h-4" />}
                          {platform === 'youtube' && <Youtube className="w-4 h-4" />}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          ))}
        </div>

        {/* Coming Soon Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 flex items-center justify-center gap-6"
        >
          <div className="w-12 h-[1px] bg-[#2D6A4F]/10"></div>
          <div className="flex items-center gap-3 text-[#5D705C]">
            <Users className="w-4 h-4 opacity-60" />
            <span className="text-[11px] font-bold uppercase tracking-widest opacity-80">More creators coming soon. Stay tuned!</span>
          </div>
          <div className="w-12 h-[1px] bg-[#2D6A4F]/10"></div>
        </motion.div>

      </div>
    </section>
  );
}
