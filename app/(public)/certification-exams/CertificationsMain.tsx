'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, CheckCircle2, Clock, Search, Award } from 'lucide-react';

interface Certification {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  level: string;
  durationMinutes: number;
  passingScore: number;
  slug: string;
}

interface Props {
  initialData: Certification[];
  layout?: 'public' | 'dashboard';
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80';

export default function CertificationsMain({ initialData = [], layout = 'public' }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const orbs = document.querySelectorAll<HTMLElement>('.certifications-orb');
      const x = event.clientX / window.innerWidth;
      const y = event.clientY / window.innerHeight;

      orbs.forEach((orb, index) => {
        const speed = (index + 1) * 20;
        const xOffset = (0.5 - x) * speed;
        const yOffset = (0.5 - y) * speed;
        orb.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
      });
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const normalizedCertifications = useMemo(
    () => {
      const base = initialData.map((cert) => {
        return {
          ...cert,
          title: cert.title,
          description: cert.description || '',
          durationMinutes: cert.durationMinutes || 60,
          passingScore: cert.passingScore || 80,
          level: cert.level || 'Intermediate',
          imageUrl: cert.imageUrl?.trim() || FALLBACK_IMAGE,
        };
      });

      return base;
    },
    [initialData]
  );
  const filterTabs = useMemo(() => {
    const counts = new Map<string, number>();

    normalizedCertifications.forEach((cert) => {
      const level = cert.level;
      counts.set(level, (counts.get(level) || 0) + 1);
    });

    const orderedLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
    const dynamicLevels = Array.from(counts.keys()).sort((a, b) => {
      const indexA = orderedLevels.indexOf(a);
      const indexB = orderedLevels.indexOf(b);
      if (indexA === -1 && indexB === -1) return a.localeCompare(b);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });

    return [
      { label: 'All', value: 'All', count: normalizedCertifications.length },
      ...dynamicLevels.map((level) => ({
        label: level,
        value: level,
        count: counts.get(level) || 0,
      })),
    ];
  }, [normalizedCertifications]);

  const filteredCertifications = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();

    return normalizedCertifications.filter((cert) => {
      const matchesSearch =
        term.length === 0 ||
        cert.title.toLowerCase().includes(term) ||
        cert.description.toLowerCase().includes(term);
      const matchesLevel = activeFilter === 'All' || cert.level === activeFilter;
      return matchesSearch && matchesLevel;
    });
  }, [normalizedCertifications, searchQuery, activeFilter]);

  return (
    <div className="certifications-page-wrapper">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        .certifications-page-wrapper {
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #FDFBF7 0%, #F8F5F0 100%);
          color: #1F2937;
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          zoom: 1.1;
        }

        .certifications-orbs {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }

        .certifications-orb {
          position: absolute;
          border-radius: 9999px;
          opacity: 0.08;
          transition: transform 0.1s ease-out;
          animation: certifications-float 20s infinite ease-in-out;
        }

        .certifications-orb-1 {
          width: 600px;
          height: 600px;
          top: -200px;
          right: -100px;
          background: #1B4332;
          animation-delay: 0s;
        }

        .certifications-orb-2 {
          width: 400px;
          height: 400px;
          bottom: -100px;
          left: -100px;
          background: #40916C;
          animation-delay: 5s;
        }

        .certifications-orb-3 {
          width: 300px;
          height: 300px;
          top: 46%;
          right: 10%;
          background: #2D6A4F;
          animation-delay: 10s;
        }

        @keyframes certifications-float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 30px) scale(0.9);
          }
        }

        .certifications-shell {
          position: relative;
          z-index: 1;
        }

        .certifications-hero {
          max-width: 1400px;
          margin: 0 auto;
          padding: 10rem 2rem 3rem;
        }

        .certifications-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1.25rem;
          margin-bottom: 1.5rem;
          border-radius: 9999px;
          background: linear-gradient(135deg, rgba(27, 67, 50, 0.1) 0%, rgba(45, 106, 79, 0.1) 100%);
          color: #1B4332;
          font-size: 0.875rem;
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        .certifications-title {
          margin: 0 0 1.5rem;
          color: #1B4332;
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -1px;
        }

        .certifications-subtitle {
          max-width: 650px;
          margin: 0 0 3rem;
          color: #6B7280;
          font-size: 1.25rem;
          line-height: 1.7;
        }

        .certifications-controls {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 2rem;
          margin-bottom: 1rem;
        }

        .certifications-search {
          position: relative;
          flex: 1;
          min-width: 300px;
        }

        .certifications-search-input {
          width: 100%;
          border: 2px solid #E5E7EB;
          border-radius: 16px;
          background: #FFFFFF;
          padding: 1.25rem 1.5rem 1.25rem 3.5rem;
          font: inherit;
          font-size: 1rem;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
        }

        .certifications-search-input:focus {
          outline: none;
          border-color: #40916C;
          box-shadow: 0 0 0 4px rgba(64, 145, 108, 0.1), 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .certifications-search-icon {
          position: absolute;
          top: 50%;
          left: 1.25rem;
          transform: translateY(-50%);
          color: #6B7280;
        }

        .certifications-filters {
          display: flex;
          gap: 0.75rem;
          overflow-x: auto;
          padding: 0.5rem;
          border-radius: 12px;
          background: #FFFFFF;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          scrollbar-width: none;
        }

        .certifications-filters::-webkit-scrollbar {
          display: none;
        }

        .certifications-filter-tab {
          border: none;
          background: transparent;
          color: #6B7280;
          padding: 0.875rem 1.75rem;
          border-radius: 10px;
          font: inherit;
          font-size: 0.95rem;
          font-weight: 600;
          white-space: nowrap;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .certifications-filter-tab:hover {
          background: #F8F5F0;
          color: #1B4332;
        }

        .certifications-filter-tab.is-active {
          background: #1B4332;
          color: #FFFFFF;
          box-shadow: 0 4px 12px rgba(27, 67, 50, 0.3);
        }

        .certifications-filter-count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 1.5rem;
          height: 1.5rem;
          margin-left: 0.5rem;
          padding: 0 0.5rem;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.25);
          font-size: 0.75rem;
          font-weight: 700;
        }

        .certifications-grid-shell {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem 6rem;
        }

        .certifications-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 2.5rem;
        }

        .certifications-card {
          background: #FFFFFF;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(27, 67, 50, 0.08);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          animation: certifications-fade-up 0.6s ease-out both;
        }

        .certifications-card:hover {
          transform: translateY(-12px) scale(1.01);
          box-shadow: 0 30px 80px rgba(27, 67, 50, 0.15);
        }

        @keyframes certifications-fade-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .certifications-card-image {
          position: relative;
          aspect-ratio: 16 / 9;
          overflow: hidden;
          background: #1B4332;
        }

        .certifications-card-image-element {
          object-fit: cover;
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .certifications-level-badge {
          position: absolute;
          top: 1.25rem;
          left: 1.25rem;
          z-index: 1;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.95);
          padding: 0.5rem 1rem;
          color: #1B4332;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
        }

        .certifications-card-content {
          padding: 2rem;
        }

        .certifications-card-title {
          margin: 0 0 1rem;
          color: #1B4332;
          font-size: 1.5rem;
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.5px;
          text-transform: uppercase;
          font-style: italic;
        }

        .certifications-card-description {
          margin: 0 0 1.75rem;
          color: #6B7280;
          font-size: 0.95rem;
          line-height: 1.7;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 3;
          overflow: hidden;
          min-height: 4.9rem;
        }

        .certifications-card-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem 1.5rem;
          padding-bottom: 1.75rem;
          margin-bottom: 1.75rem;
          border-bottom: 1px solid #E5E7EB;
        }

        .certifications-meta-item {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: #1B4332;
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .certifications-meta-item svg {
          color: #40916C;
          flex-shrink: 0;
        }

        .certifications-cta {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          width: 100%;
          border: none;
          border-radius: 14px;
          padding: 1.125rem 2rem;
          background: linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%);
          color: #FFFFFF;
          font-size: 1rem;
          font-weight: 700;
          text-decoration: none;
          box-shadow: 0 4px 12px rgba(27, 67, 50, 0.3);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .certifications-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(27, 67, 50, 0.4);
        }

        .certifications-cta-arrow {
          transition: transform 0.3s ease;
        }

        .certifications-cta:hover .certifications-cta-arrow {
          transform: translateX(4px);
        }

        .certifications-empty {
          border-radius: 24px;
          background: #FFFFFF;
          padding: 6rem 2rem;
          text-align: center;
          box-shadow: 0 20px 60px rgba(27, 67, 50, 0.08);
        }

        .certifications-empty-icon {
          margin-bottom: 1rem;
          font-size: 3rem;
        }

        .certifications-empty-title {
          margin: 0;
          color: #1F2937;
          font-size: 1.75rem;
          font-weight: 700;
        }

        .certifications-empty-copy {
          margin: 0.75rem 0 0;
          color: #6B7280;
          font-size: 1rem;
          line-height: 1.7;
        }

        @media (max-width: 1024px) {
          .certifications-grid {
            grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
            gap: 2rem;
          }
        }

        @media (max-width: 768px) {
          .certifications-orb-1 {
            width: 250px;
            height: 250px;
            top: -50px;
            right: -50px;
            opacity: 0.04;
          }
          .certifications-orb-2 {
            width: 200px;
            height: 200px;
            bottom: -50px;
            left: -50px;
            opacity: 0.04;
          }
          .certifications-orb-3 {
            width: 150px;
            height: 150px;
            top: 40%;
            right: 5%;
            opacity: 0.04;
          }

          .certifications-hero {
            padding: 8rem 1.5rem 2rem;
          }

          .certifications-controls {
            flex-direction: column;
            align-items: stretch;
          }

          .certifications-search {
            min-width: 100%;
          }

          .certifications-grid-shell {
            padding: 0 1.5rem 4rem;
          }

          .certifications-grid {
            grid-template-columns: 1fr;
            gap: 1.75rem;
          }
        }
      `}</style>

      {layout === 'public' && (
        <div className="certifications-orbs" aria-hidden="true">
          <div className="certifications-orb certifications-orb-1" />
          <div className="certifications-orb certifications-orb-2" />
          <div className="certifications-orb certifications-orb-3" />
        </div>
      )}

      <div className="certifications-shell">
        {layout === 'public' ? (
          <section className="certifications-hero">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 mb-10">
              <div className="flex-1">
                <div className="certifications-badge mb-4">🏆 Govt Approved & Verified Certifications</div>
                <h1 className="certifications-title !mb-3">Get Certified</h1>
                <p className="certifications-subtitle !mb-4">
                  Get industry-recognized certificates to prove your skills and grow your career. Our examinations are completely free to attempt. A certificate issuance fee of ₹2000 applies only upon successfully passing the exam.
                </p>
                <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-emerald-50 border border-emerald-200/80 rounded-xl text-[#1B4332] font-bold text-xs md:text-sm shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse flex-shrink-0" />
                  <span>We provide you Government approved certificates (Ministry of MSME, Govt. of India)</span>
                </div>
              </div>

              {/* Prominent MSME Government Badge */}
              <div className="flex-shrink-0 bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-emerald-900/10 flex flex-col items-center justify-center text-center w-full lg:w-auto max-w-md hover:shadow-2xl transition-shadow">
                <div className="relative w-72 md:w-96 h-28 md:h-36">
                  <Image
                    src="/msme-full-official-logo.png"
                    alt="Ministry of MSME, Govt. of India Logo"
                    fill
                    className="object-contain"
                    priority
                    unoptimized
                  />
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100 w-full flex items-center justify-center gap-2">
                  <span className="text-[12px] font-black text-[#1B4332] uppercase tracking-wider">
                    Ministry of MSME, Govt. of India Approved
                  </span>
                </div>
              </div>
            </div>

            <div className="certifications-controls">
              <div className="certifications-search">
                <Search className="certifications-search-icon" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="certifications-search-input"
                  placeholder="Search certifications, skills..."
                  aria-label="Search certifications"
                />
              </div>

              <div className="certifications-filters" role="tablist" aria-label="Certification level filters">
                {filterTabs.map((tab) => (
                  <button
                    key={tab.value}
                    type="button"
                    role="tab"
                    aria-selected={activeFilter === tab.value}
                    onClick={() => setActiveFilter(tab.value)}
                    className={`certifications-filter-tab${activeFilter === tab.value ? ' is-active' : ''}`}
                  >
                    {tab.label}
                    <span className="certifications-filter-count">{tab.count}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>
        ) : (
          <div className="p-8 pb-4">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                   <h1 className="text-3xl font-black text-[#1B4332] uppercase italic tracking-tighter mb-2">Professional_Certifications</h1>
                   <p className="text-gray-500 font-medium">Validate your technical proficiency with free industry-recognized assessments. A verified certificate generation fee of ₹2000 applies upon passing.</p>
                </div>
                <div className="flex items-center gap-4">
                   <div className="certifications-filters !shadow-none !bg-gray-50/50 p-1">
                      {filterTabs.slice(0, 3).map((tab) => (
                        <button
                          key={tab.value}
                          onClick={() => setActiveFilter(tab.value)}
                          className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                            activeFilter === tab.value ? 'bg-[#1B4332] text-white shadow-lg shadow-[#1B4332]/20' : 'text-gray-400 hover:text-[#1B4332]'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                   </div>
                </div>
             </div>
             
             <div className="relative mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-gray-50 border-2 border-transparent focus:border-[#1B4332]/10 focus:bg-white rounded-2xl outline-none transition-all font-medium text-[#1B4332]"
                  placeholder="Filter certifications..."
                />
             </div>
          </div>
        )}

        <main className="certifications-grid-shell">
          {filteredCertifications.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
              {filteredCertifications.map((cert, index) => (
                <div
                  key={cert.id}
                  className="group bg-white rounded-[24px] border border-[#E8E2D9] overflow-hidden transition-all duration-300 hover:shadow-[0_20px_40px_rgba(26,60,46,0.08)] flex flex-col h-full cursor-pointer"
                >
                  {/* Thumbnail Area */}
                  <div className="relative aspect-[16/10] overflow-hidden p-3 pb-0">
                    <div className="relative w-full h-full rounded-[20px] overflow-hidden bg-[#1B4332]">
                      <Image
                        src={cert.imageUrl}
                        alt={cert.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                        priority={index < 2}
                        unoptimized={true}
                      />
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-grow bg-white">
                    {/* Level / Category */}
                    <div className="mb-4 flex items-center gap-2 text-[#2D6A4F]">
                      <Award className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-[0.15em]">
                        {cert.level || "EXPERT"} • CERTIFICATION
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-[22px] font-black text-[#1A3C2E] mb-3 leading-[1.2] tracking-tight group-hover:text-[#2D6A4F] transition-colors uppercase italic">
                      {cert.title}
                    </h3>

                    {/* Description */}
                    <p className="text-[14px] text-[#5D705C] font-medium leading-[1.6] line-clamp-2 mb-6">
                      {cert.description}
                    </p>

                    {/* Violet Divider & Henry Harvin badge */}
                    <div className="mt-4 pt-3 border-t-2 border-violet-600 flex items-center gap-1.5 text-violet-700 font-bold text-[11px] uppercase tracking-wider">
                      <span className="w-2 h-2 rounded-full bg-violet-600" />
                      Support & Certified by {cert.slug === 'cloud-fundamentals-by-microsoft' ? 'Microsoft' : 'Henry Harvin'}
                    </div>

                    {/* Bottom Section: Investment & Button */}
                    <div className="mt-4 flex items-end justify-between">
                      <div className="flex flex-col mb-1.5">
                        <span className="text-[13px] font-black text-[#2D6A4F] uppercase tracking-[0.15em]">
                          FREE EXAMINATION
                        </span>
                        <span className="text-[11px] text-[#5D705C] font-semibold mt-1">
                          ₹2000 certificate fee on passing
                        </span>
                      </div>

                      <Link
                        href={`/certification-exams/${cert.slug}`}
                        className="flex items-center gap-2 px-6 py-3 bg-[#1A3C2E] text-white rounded-full font-black uppercase tracking-[0.1em] text-[11px] transition-all duration-300 hover:bg-[#2D6A4F] active:scale-95 shadow-md"
                      >
                        Explore Curriculum <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="certifications-empty">
              <div className="certifications-empty-icon">🔍</div>
              <h2 className="certifications-empty-title">No certifications found</h2>
              <p className="certifications-empty-copy">
                Try adjusting your search or switching the level filter.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

