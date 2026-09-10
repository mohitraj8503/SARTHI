'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { Menu, X, ChevronDown, ChevronRight, Download, Smartphone, GraduationCap, Wrench, Factory, Mic, Check, Trophy, Lightbulb, Brain, Zap, Rocket, Medal, BookOpen, PenTool, FileText, Heart, Flame, Tag, Megaphone, Users, Award, Star, Target, Building2, BadgeCheck, NotebookPen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProfileDropdown } from './profile-dropdown/ProfileDropdown';
import PWAInstallModal from './PWAInstallModal';
import BrandStoryModal from './BrandStoryModal';
import { cn } from '@/lib/utils';
import { getDashboardRouteForRole } from '@/lib/auth-ui';

const MOBILE_NAV_EMOJI: Record<string, string> = {
  Courses: '📚',
  Workshops: '🛠️',
  Seminars: '🎤',
  Internship: '🎓',
  'Knowledge Base': '📖',
  About: 'ℹ️',
  Blog: '✍️',
  Blogs: '✍️',
};
const NAV_LINKS = [
  {
    label: 'Courses',
    desc: 'Acquire new skills & credentials',
    href: '/courses',
  },
  {
    label: 'Workshops',
    desc: 'Live interactive build sessions',
    href: '/workshops',
  },
  {
    label: 'Seminars',
    desc: 'Expert talks & tech lectures',
    href: '/seminars',
  },
  {
    label: 'Internship',
    desc: 'Internship cohort & applications',
    href: '/internship',
  },
  {
    label: 'Knowledge Base',
    desc: 'Scientific bulletins & learning resources',
    href: '/blogs',
  },
  {
    label: 'About',
    desc: 'Our mission, architecture & leadership',
    href: '/about',
  },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [hoveredSubItem, setHoveredSubItem] = useState<any>(null);
  const [mobileActiveSubMenu, setMobileActiveSubMenu] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const { user, loading, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [isPwaModalOpen, setIsPwaModalOpen] = useState(false);
  const [isLogoRotating, setIsLogoRotating] = useState(false);

  const handleLogoClick = (e: React.MouseEvent) => {
    if (pathname === "/") {
      e.preventDefault();
      setIsLogoRotating(true);
      setTimeout(() => setIsLogoRotating(false), 800);
      setIsBrandModalOpen(true);
    }
  };

  useEffect(() => {
    if (!isMobileMenuOpen) {
      setMobileActiveSubMenu(null);
    }
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (!activeDropdown) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveDropdown(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeDropdown]);

  const handleDropdownKeyDown = (e: React.KeyboardEvent, index: number, total: number) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextEl = document.getElementById(`dropdown-item-${index + 1}`);
      if (nextEl) nextEl.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevEl = document.getElementById(`dropdown-item-${index - 1}`);
      if (prevEl) {
        prevEl.focus();
      } else {
        const parentBtn = document.getElementById('academy-trigger-btn');
        if (parentBtn) parentBtn.focus();
      }
    }
  };

  const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveDropdown('Academy');
      setTimeout(() => {
        const firstEl = document.getElementById('dropdown-item-0');
        if (firstEl) firstEl.focus();
      }, 50);
    }
  };
  const isDarkHeader = pathname === '/teach/apply' || pathname?.startsWith('/teach/apply');
  const isCoursesPage = pathname === '/courses' || pathname?.startsWith('/courses/');

  const isAuthenticated = !!user;
  const role = (user?.role as string)?.toUpperCase() || '';
  const dashboardUrl = getDashboardRouteForRole(role, user?.onboarded ?? true);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isAuthPage =
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname?.startsWith('/auth/');
  if (isAuthPage) return null;

  const isDashboard =
    pathname?.startsWith('/teacher') ||
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/dashboard');
  if (isDashboard) return null;

  const isMinimalLayout = pathname?.includes('/assessment') || pathname?.includes('/register') || pathname?.includes('/test-certificate');
  if (isMinimalLayout) return null;

  const transparent = !isScrolled && pathname === '/';

  return (
    <>
      <AnimatePresence>
        {activeDropdown && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => {
              setActiveDropdown(null);
              setHoveredSubItem(null);
            }}
            className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40"
          />
        )}
      </AnimatePresence>
      <header
        role="banner"
        className={cn(
          "fixed top-0 left-0 right-0 z-[1000] transition-all duration-300 ease-in-out",
          // Reduced mobile height to 64px, desktop set to 96px luxury height
          "h-[64px] lg:h-[96px] flex items-center",
          transparent
            ? "bg-gradient-to-b from-black/60 via-black/30 to-transparent lg:from-[#050B14]/95 lg:via-[#050B14]/75 lg:to-transparent backdrop-blur-sm lg:backdrop-blur-md border-b-0 text-white"
            : "bg-white/95 backdrop-blur-[18px] border-b border-gray-200/80 text-gray-900 shadow-md"
        )}
      >
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 flex items-center justify-between gap-4 relative">
          <div className="flex justify-start items-center flex-shrink-0">
            <Link
              href="/"
              onClick={handleLogoClick}
              className="z-10 flex items-center transition-transform hover:scale-[1.02] duration-200"
              aria-label="SARTHI Home"
            >
              <span className={cn(
                "font-instrument text-[22px] sm:text-[24px] lg:text-[26px] font-bold tracking-[0.14em] block whitespace-nowrap select-none transition-all duration-300 uppercase",
                transparent ? "text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]" : "text-slate-900"
              )}>
                SARTHI
              </span>
            </Link>
          </div>

          {/* CENTER NAV */}
          <nav
            className="hidden lg:flex justify-center items-center gap-3.5 xl:gap-5 mx-4 flex-shrink-0"
            aria-label="Main navigation"
          >
            {NAV_LINKS.map((link) => {
              const isParentActive = link.subItems ? link.subItems.some((sub: any) => pathname === sub.href) : false;
              const isActive = pathname === link.href || isParentActive;
              const isExcluded = link.label === 'Home';

              return (
                <div
                  key={link.label}
                  className="relative group py-2 lg:py-3"
                  onMouseEnter={() => (link as any).subItems && setActiveDropdown(link.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  {(link as any).subItems ? (
                    <button
                      id="academy-trigger-btn"
                      aria-haspopup="true"
                      aria-expanded={activeDropdown === link.label}
                      onClick={() => setActiveDropdown(activeDropdown === link.label ? null : link.label)}
                      onKeyDown={handleTriggerKeyDown}
                      className={cn(
                        "flex items-center gap-1 text-[13.5px] xl:text-[15.5px] 2xl:text-[16.5px] font-bold transition-all duration-150 whitespace-nowrap tracking-[0.4px] xl:tracking-[0.6px] cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#FF8A00] rounded px-1.5 py-0.5",
                        transparent ? "text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] hover:text-[#FF8A00]" : "text-gray-700 hover:text-black",
                        isActive && "text-[#FF8A00]"
                      )}
                    >
                      {link.label}
                      <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", activeDropdown === link.label && "rotate-180")} />

                      {!isExcluded && (
                        <div className={cn(
                          "absolute -bottom-1 left-0 h-[2px] transition-all duration-300 bg-[#FF8A00]",
                          isActive ? "w-full" : "w-0 group-hover:w-full"
                        )} />
                      )}
                    </button>
                  ) : (
                    <Link
                      href={link.href}
                      aria-current={isActive ? 'page' : undefined}
                      className={cn(
                        "relative text-[13.5px] xl:text-[15.5px] 2xl:text-[16.5px] font-bold transition-all duration-150 whitespace-nowrap tracking-[0.4px] xl:tracking-[0.6px] py-0.5 px-1.5 outline-none focus-visible:ring-2 focus-visible:ring-[#FF8A00] rounded",
                        transparent ? "text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] hover:text-[#FF8A00]" : "text-gray-700 hover:text-black",
                        isActive && "text-[#FF8A00]"
                      )}
                    >
                      {link.label}

                      {!isExcluded && (
                        <div className={cn(
                          "absolute -bottom-1 left-0 h-[2px] transition-all duration-300",
                          isDarkHeader ? "bg-[#4ade80]" : "bg-[#FF8A00]",
                          isActive ? "w-full" : "w-0 group-hover:w-full"
                        )} />
                      )}
                    </Link>
                  )}

                  {(link as any).subItems && (
                    <AnimatePresence>
                      {activeDropdown === link.label && (
                        <motion.div
                          initial={{ opacity: 0, y: -14, scale: 0.985, filter: "blur(8px)" }}
                          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                          exit={{ opacity: 0, y: -12, scale: 0.985, filter: "blur(8px)" }}
                          transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                          className="absolute top-full left-1/2 -translate-x-1/2 pt-4 z-50"
                        >
                          <div className={cn(
                            "rounded-[24px] border backdrop-blur-3xl saturate-[180%] transition-all duration-300 overflow-hidden flex flex-col p-6",
                            isDarkHeader
                              ? "bg-[#15171C]/96 border-white/[0.08] text-white shadow-[0_30px_80px_rgba(0,0,0,0.5)]"
                              : "bg-[#FCFCFD]/98 border-black/[0.08] text-[#111827] shadow-[0_20px_60px_rgba(15,23,42,0.18),0_8px_20px_rgba(15,23,42,0.08)]",
                            (link as any).subItems.length > 6 ? "w-[760px]" : "w-[660px]"
                          )}>
                            {/* Header info */}
                            <div className="px-2 pb-3 flex flex-col select-none text-left">
                              <div className="flex items-baseline gap-1.5">
                                <span className={cn(
                                  "text-[22px] font-bold tracking-tight",
                                  isDarkHeader ? "text-white" : "text-black"
                                )}>
                                  SARTHI
                                </span>
                                <span className={cn(
                                  "text-[22px] font-bold tracking-tight",
                                  isDarkHeader ? "text-zinc-100" : "text-[#111827]"
                                )}>
                                  {link.label === 'Academy'
                                    ? 'Academy 🎓'
                                    : link.label === 'Challenges'
                                      ? 'Challenges 🏆'
                                      : link.label === 'Courses'
                                        ? 'Courses 📚'
                                        : link.label === 'Certifications'
                                          ? 'Certifications 🏅'
                                          : 'Blogs ✍️'}
                                </span>
                              </div>
                              <span className={cn(
                                "text-[13.5px] font-medium mt-1 leading-normal",
                                isDarkHeader ? "text-zinc-400" : "text-[#6B7280]"
                              )}>
                                {link.label === 'Academy'
                                  ? 'Programs & Hands-on Learning'
                                  : link.label === 'Challenges'
                                    ? 'Compete, innovate and showcase your skills.'
                                    : link.label === 'Courses'
                                      ? 'Structured pathways to master top skills.'
                                      : link.label === 'Certifications'
                                        ? 'Industry-recognized credentials that validate your skills.'
                                        : 'Insights, tutorials and community stories.'}
                              </span>
                            </div>

                            {/* Cards-Based Grid of Links */}
                            <div className={cn(
                              "grid gap-4 flex-shrink-0",
                              (link as any).subItems.length > 6
                                ? "grid-cols-3"
                                : (link as any).subItems.length > 4
                                  ? "grid-cols-3"
                                  : "grid-cols-2"
                            )}>
                              {(link as any).subItems.map((sub: any, idx: number) => {
                                const isSubActive = pathname === sub.href;
                                const SubIcon = sub.icon;
                                // Keep only highly essential badges
                                const showBadge = sub.badge === 'LIVE' || sub.badge === 'NEW';

                                return (
                                  <motion.div
                                    key={sub.label}
                                    initial={{ opacity: 0, x: -25, y: 6, scale: 0.98, filter: "blur(4px)" }}
                                    animate={{ opacity: 1, x: 0, y: 0, scale: 1, filter: "blur(0px)" }}
                                    transition={{ duration: 0.42, delay: idx * 0.04, ease: [0.16, 1, 0.3, 1] }}
                                    className="h-full"
                                  >
                                    <Link
                                      id={`dropdown-item-${idx}`}
                                      href={sub.href}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        router.push(sub.href);
                                        setTimeout(() => {
                                          setActiveDropdown(null);
                                          setHoveredSubItem(null);
                                        }, 100);
                                      }}
                                      onMouseEnter={() => setHoveredSubItem(sub)}
                                      onMouseMove={(e) => {
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        const x = e.clientX - rect.left;
                                        const y = e.clientY - rect.top;
                                        e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
                                        e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
                                      }}
                                      onKeyDown={(e) => handleDropdownKeyDown(e, idx, (link as any).subItems.length)}
                                      style={{
                                        background: hoveredSubItem?.label === sub.label
                                          ? `radial-gradient(100px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${isDarkHeader ? 'rgba(255,255,255,0.05)' : 'rgba(15,23,42,0.035)'}, transparent), ${isDarkHeader ? '#22242e' : '#F5F7FA'}`
                                          : undefined
                                      }}
                                      className={cn(
                                        "group/item relative flex flex-col p-4 rounded-2xl transition-all duration-[380ms] ease-[cubic-bezier(.16,1,.3,1)] delay-[60ms] outline-none text-left border min-h-[116px] justify-between hover:-translate-y-1.5 hover:scale-[1.015] hover:shadow-lg overflow-hidden",
                                        isDarkHeader
                                          ? (isSubActive
                                            ? "bg-white/[0.04] border-[#4ade80]/20"
                                            : "border-white/[0.04] bg-white/[0.02] hover:border-white/[0.08]")
                                          : (isSubActive
                                            ? "bg-[#F5F7FA] border-[#E2E8F0] shadow-sm text-[#111827]"
                                            : "border-[#F3F4F6] bg-[#FFFFFF] hover:border-[#E2E8F0] text-[#111827]")
                                      )}
                                    >
                                      {/* Apple/Stripe hover sweep */}
                                      <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
                                        <div className={cn(
                                          "absolute inset-0 w-[200%] h-full -translate-x-[120%] group-hover/item:translate-x-[120%] transition-transform duration-[850ms] ease-[cubic-bezier(.16,1,.3,1)] delay-[60ms]",
                                          isDarkHeader
                                            ? "bg-gradient-to-r from-transparent via-white/[0.06] to-transparent"
                                            : "bg-gradient-to-r from-transparent via-black/[0.035] to-transparent"
                                        )} />
                                      </div>

                                      {/* Linear active bar */}
                                      {isSubActive && (
                                        <div className={cn(
                                          "absolute left-0 top-3.5 bottom-3.5 w-[3px] rounded-r-md animate-pulse",
                                          isDarkHeader ? "bg-[#4ade80]" : "bg-[#1A3C2E]"
                                        )} />
                                      )}

                                      <span className={cn(
                                        "w-8.5 h-8.5 rounded-xl flex items-center justify-center transition-all duration-[300ms] ease-[cubic-bezier(.16,1,.3,1)] delay-[60ms] shadow-sm flex-shrink-0 mb-3",
                                        isDarkHeader
                                          ? "bg-zinc-900 border border-white/[0.04]"
                                          : "bg-gray-50 border border-black/[0.03]"
                                      )}>
                                        <SubIcon
                                          className="w-[17px] h-[17px] transition-all duration-[300ms] ease-[cubic-bezier(.16,1,.3,1)] delay-[60ms] group-hover/item:scale-[1.08] group-hover/item:rotate-[2deg]"
                                          style={{ color: sub.iconColor }}
                                        />
                                      </span>

                                      <div className="flex flex-col flex-1">
                                        <span className={cn(
                                          "text-[13.5px] font-bold leading-none transition-colors flex items-center gap-1.5",
                                          isDarkHeader
                                            ? "text-zinc-100 group-hover/item:text-[#4ade80]"
                                            : "text-[#111827] group-hover/item:text-[#1A3C2E]"
                                        )}>
                                          <span>{sub.label}</span>
                                          <span className="opacity-0 group-hover/item:opacity-100 translate-x-[-4px] group-hover/item:translate-x-0 transition-all duration-[280ms] ease-[cubic-bezier(.16,1,.3,1)] delay-[60ms] text-xs">→</span>
                                        </span>
                                        <span className={cn(
                                          "text-[10.5px] font-semibold mt-2 leading-normal line-clamp-2",
                                          isDarkHeader ? "text-zinc-400" : "text-[#6B7280]"
                                        )}>
                                          {sub.desc}
                                        </span>
                                      </div>

                                      {/* Indicator badge */}
                                      {showBadge && (
                                        <span className={cn(
                                          "absolute top-4 right-4 text-[8px] font-bold px-1.5 py-0.5 rounded leading-none tracking-wider scale-90 select-none",
                                          isDarkHeader
                                            ? "bg-[#4ade80]/10 text-[#4ade80] border border-[#4ade80]/20"
                                            : "bg-[#1A3C2E]/10 text-[#1A3C2E] border border-[#1A3C2E]/20"
                                        )}>
                                          {sub.badge}
                                        </span>
                                      )}
                                    </Link>
                                  </motion.div>
                                );
                              })}
                            </div>

                            {/* Bottom horizontal Featured Banner */}
                            {(() => {
                              let featuredData = {
                                title: "",
                                icon: Medal,
                                iconColor: "#CA8A04",
                                meta: "",
                                badge: "FEATURED",
                                ctaText: "Explore",
                                ctaHref: "#"
                              };

                              if (link.label === 'Academy') {
                                featuredData = {
                                  title: "Upcoming Internship Cohort 2026",
                                  icon: GraduationCap,
                                  iconColor: "#22C55E",
                                  meta: "Applications Open  •  Live Cohort  •  Hands-on Industry Projects",
                                  badge: "APPLICATIONS OPEN",
                                  ctaText: "Apply for Internship",
                                  ctaHref: "/internship"
                                };
                              } else if (link.label === 'Courses' || link.label === 'Training Modules') {
                                featuredData = {
                                  title: "AI & Data Science Professional",
                                  icon: BookOpen,
                                  iconColor: "#0D9488",
                                  meta: "38 Hours  •  24 Projects  •  Verified Certificate",
                                  badge: "RECOMMENDED",
                                  ctaText: "Start Learning",
                                  ctaHref: "/courses"
                                };
                              } else {
                                featuredData = {
                                  title: "Featured: AI Trends in 2026",
                                  icon: FileText,
                                  iconColor: "#4F46E5",
                                  meta: "Explore deep dives, coding tutorials and industry news.",
                                  badge: "FEATURED ARTICLE",
                                  ctaText: "Read Article",
                                  ctaHref: "/blogs"
                                };
                              }

                              const FeatIcon = featuredData.icon;
                              return (
                                <div className={cn(
                                  "p-4 rounded-2xl flex items-center justify-between gap-6 select-none text-left transition-all duration-300 border mt-5",
                                  isDarkHeader
                                    ? "bg-white/[0.02] border-white/[0.06]"
                                    : "bg-[#F8FAFC] border-[#E2E8F0] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]"
                                )}>
                                  <div className="flex items-center gap-4">
                                    <div className={cn(
                                      "w-10 h-10 rounded-xl flex items-center justify-center border flex-shrink-0",
                                      isDarkHeader ? "bg-zinc-900 border-white/[0.06]" : "bg-white border-black/[0.04]"
                                    )}>
                                      <FeatIcon className="w-5 h-5 animate-pulse" style={{ color: featuredData.iconColor }} />
                                    </div>
                                    <div className="flex flex-col">
                                      <div className="flex items-center gap-2">
                                        <span className={cn(
                                          "text-[9px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 leading-none",
                                          isDarkHeader
                                            ? "bg-[#4ade80]/10 text-[#4ade80] border border-[#4ade80]/15"
                                            : "bg-[#1A3C2E]/10 text-[#1A3C2E] border border-[#1A3C2E]/15"
                                        )}>
                                          {featuredData.badge}
                                        </span>
                                      </div>
                                      <span className={cn(
                                        "text-[13.5px] font-extrabold tracking-tight mt-2.5",
                                        isDarkHeader ? "text-white" : "text-[#111827]"
                                      )}>
                                        {featuredData.title}
                                      </span>
                                      <span className={cn(
                                        "text-[11px] leading-normal font-semibold mt-0.5 max-w-[420px] line-clamp-1",
                                        isDarkHeader ? "text-zinc-400" : "text-[#6B7280]"
                                      )}>
                                        {featuredData.meta}
                                      </span>
                                    </div>
                                  </div>
                                  <Link
                                    href={featuredData.ctaHref}
                                    onClick={() => {
                                      setActiveDropdown(null);
                                      setHoveredSubItem(null);
                                    }}
                                    className={cn(
                                      "py-2.5 px-6 rounded-full text-xs font-bold transition-all duration-200 text-center active:scale-95 shadow-sm border flex-shrink-0 flex items-center gap-1 hover:gap-1.5 cursor-pointer",
                                      isDarkHeader
                                        ? "bg-[#4ade80] hover:bg-[#3ec471] text-[#090d16] border-transparent"
                                        : "bg-[#1A3C2E] hover:bg-[#153025] text-white border-transparent"
                                    )}
                                  >
                                    <span>{featuredData.ctaText}</span>
                                    <span className="text-xs font-bold">→</span>
                                  </Link>
                                </div>
                              );
                            })()}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              );
            })}
          </nav>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center justify-end gap-3.5 xl:gap-5 flex-shrink-0">

            {!mounted || loading ? (
              <div className="flex items-center">
                <div
                  className={cn(
                    "w-20 sm:w-28 h-8 sm:h-9 rounded-full animate-pulse",
                    transparent
                      ? "bg-white/10 ring-1 ring-white/20"
                      : "bg-gray-200"
                  )}
                />
              </div>
            ) : (
              <>
                {loading ? (
                  <div className="w-24 h-9 bg-gray-200/50 dark:bg-gray-700/50 rounded-full animate-pulse" />
                ) : !isAuthenticated ? (
                  <Link href="/login" className="flex items-center">
                    <div
                      className={cn(
                        "rounded-full font-extrabold uppercase tracking-wider transition-all active:scale-95",
                        "px-4 xl:px-5 py-2 text-[10px] xl:text-[11px] border shadow-md whitespace-nowrap",
                        "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 border-amber-400 hover:from-amber-600 hover:to-yellow-600 hover:shadow-yellow-500/20 hover:scale-105"
                      )}
                    >
                      Sign In
                    </div>
                  </Link>
                ) : (
                  <div className="flex items-center gap-3.5 xl:gap-4">
                    <Link href={dashboardUrl} className="hidden lg:flex items-center">
                      <div
                        className={cn(
                          "px-3.5 xl:px-5 py-2 rounded-full text-[10.5px] xl:text-[11.5px] font-bold uppercase tracking-wider transition-all active:scale-95 shadow-md whitespace-nowrap",
                          transparent
                            ? "bg-white text-gray-900 hover:bg-white/90"
                            : "bg-[#1A3C2E] text-white hover:bg-[#1A3C2E]/90"
                        )}
                      >
                        Go to Dashboard
                      </div>
                    </Link>

                    <div className="relative">
                      <ProfileDropdown
                        user={{
                          name: user?.name,
                          email: user?.email,
                          image: user?.image,
                          role: user?.role,
                          onboarded: (user as any).onboarded
                        }}
                        signOut={signOut}
                        profileCompletion={(user as any).onboarded ? 100 : 40}
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            <button
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
              className={cn(
                "lg:hidden w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-90 no-transform",
                transparent
                  ? "bg-white/10 text-white backdrop-blur-md border border-white/20"
                  : "bg-[#1A3C2E]/5 text-[#1A3C2E]"
              )}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>



      {/* MOBILE MENU */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1100] lg:hidden" // Semi-transparent overlay
            />
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 340, damping: 32 }}
              className="fixed top-0 right-0 h-full w-[85vw] max-w-[320px] bg-white z-[1200] shadow-2xl lg:hidden flex flex-col"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
            >
              <div className="flex justify-between items-center h-16 px-6 border-b border-gray-100 shrink-0">
                <span className="text-xl font-black tracking-tight">
                  <span className="text-[#FF8A00]">SAR</span>
                  <span className="text-[#16A34A]">THI</span>
                </span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label="Close menu"
                  className="w-12 h-12 rounded-full flex items-center justify-center text-[#1A3C2E] hover:bg-gray-100 transition-colors no-transform focus:outline-none"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-3">
                {NAV_LINKS.map((link, navIdx) => {
                  const isParentActive = link.subItems ? link.subItems.some((sub: any) => pathname === sub.href) : false;
                  const isActive = pathname === link.href || isParentActive;
                  const navEmoji = MOBILE_NAV_EMOJI[link.label] ?? '📄';

                  return (
                    <motion.div
                      key={link.label}
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.06 + navIdx * 0.055, type: 'spring', stiffness: 320, damping: 28 }}
                    >
                      {(link as any).subItems ? (
                        <div className="border-b border-gray-50">
                          <button
                            onClick={() => setMobileActiveSubMenu(mobileActiveSubMenu === link.label ? null : link.label)}
                            className="w-full flex items-center justify-between min-h-[58px] py-4 px-5 font-bold text-[#1A3C2E] text-[16px] text-left outline-none cursor-pointer hover:bg-[#F5F0E8]/60 transition-colors active:scale-[0.98]"
                          >
                            <span className="flex items-center gap-3">
                              <span className="w-9 h-9 rounded-xl bg-[#2D6A4F]/8 flex items-center justify-center text-[18px] leading-none shrink-0">
                                {navEmoji}
                              </span>
                              <span>{link.label}</span>
                            </span>
                            <motion.span
                              animate={{ rotate: mobileActiveSubMenu === link.label ? 180 : 0 }}
                              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                              className="text-[#1A3C2E]/50 text-sm"
                            >
                              ▾
                            </motion.span>
                          </button>
                          <AnimatePresence initial={false}>
                            {mobileActiveSubMenu === link.label && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                                className="overflow-hidden bg-[#F5F0E8]/40"
                              >
                                <div className="pb-3 pt-1 flex flex-col gap-0.5">
                                  {(link as any).subItems.map((sub: any, subIdx: number) => {
                                    const isSubActive = pathname === sub.href;
                                    const SubIcon = sub.icon;
                                    return (
                                      <motion.div
                                        key={sub.label}
                                        initial={{ opacity: 0, x: 12 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: subIdx * 0.04, type: 'spring', stiffness: 300, damping: 26 }}
                                      >
                                        <Link
                                          href={sub.href}
                                          onClick={(e) => {
                                            e.preventDefault();
                                            router.push(sub.href);
                                            setTimeout(() => {
                                              setIsMobileMenuOpen(false);
                                            }, 100);
                                          }}
                                          className={cn(
                                            "flex items-center justify-between py-3 px-5 border-l-2 transition-colors",
                                            isSubActive
                                              ? "border-[#2D6A4F] bg-white text-[#1A3C2E]"
                                              : "border-transparent text-gray-700 hover:text-[#1A3C2E] hover:bg-white/60"
                                          )}
                                        >
                                          <span className="flex items-center gap-3">
                                            <span className="w-8 h-8 rounded-lg bg-white shadow-sm border border-gray-100 flex items-center justify-center shrink-0">
                                              <SubIcon className="w-4 h-4" style={{ color: sub.iconColor }} />
                                            </span>
                                            <span className="flex flex-col">
                                              <span className="text-[13.5px] font-semibold text-gray-800 leading-normal">{sub.label}</span>
                                              <span className="text-[11px] font-normal text-gray-400 leading-normal">{sub.desc}</span>
                                            </span>
                                          </span>
                                          {isSubActive && <Check className="w-4 h-4 text-[#2D6A4F] ml-2 shrink-0" />}
                                        </Link>
                                      </motion.div>
                                    );
                                  })}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ) : (
                        <Link
                          href={link.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={cn(
                            "flex items-center justify-between min-h-[58px] py-4 px-5 border-b border-gray-50 transition-colors active:scale-[0.98]",
                            isActive ? "bg-[#F5F0E8]/60 font-bold text-[#1A3C2E]" : "active:bg-gray-50 text-gray-900 hover:bg-[#F5F0E8]/40"
                          )}
                        >
                          <span className="flex items-center gap-3">
                            <span className="w-9 h-9 rounded-xl bg-[#2D6A4F]/8 flex items-center justify-center text-[18px] leading-none shrink-0">
                              {navEmoji}
                            </span>
                            <span className="text-[16px] font-medium">{link.label}</span>
                          </span>
                          <span className="text-gray-400">→</span>
                        </Link>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Download App Action Card - Apple Minimalist Aesthetic */}
              <div className="mx-5 mt-3 mb-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsPwaModalOpen(true);
                  }}
                  className="w-full p-3.5 bg-gradient-to-r from-slate-950 via-slate-900 to-[#1A3C2E] hover:from-black hover:to-[#153025] text-white rounded-2xl border border-white/10 flex items-center justify-between shadow-xl transition-all cursor-pointer active:scale-[0.98] group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
                      <Download className="w-5 h-5" />
                    </div>
                    <span className="text-[15px] font-bold text-white font-plus-jakarta tracking-tight">
                      Download Our App
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-300 group-hover:text-white group-hover:bg-white/20 transition-all">
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              </div>

              <div className="p-6 pb-[calc(24px+env(safe-area-inset-bottom))] border-t border-gray-100 flex flex-col gap-3">
                {loading ? (
                  <div className="w-full h-12 bg-gray-200/50 dark:bg-gray-700/50 rounded-full animate-pulse" />
                ) : !isAuthenticated ? (
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full py-3 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-sm hover:from-amber-600 hover:to-yellow-600 shadow-md shadow-yellow-500/10 transition-all no-transform flex items-center justify-center cursor-pointer"
                  >
                    Sign In
                  </Link>
                ) : (
                  <Link
                    href={dashboardUrl}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full py-4 rounded-full bg-[#1A3C2E] text-white font-bold text-base shadow-lg active:scale-[0.97] transition-all no-transform flex items-center justify-center cursor-pointer"
                  >
                    Go to Dashboard
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Brand Story Modal */}
      <BrandStoryModal isOpen={isBrandModalOpen} onClose={() => setIsBrandModalOpen(false)} />

      {/* PWA App Install Modal */}
      <PWAInstallModal isOpen={isPwaModalOpen} onClose={() => setIsPwaModalOpen(false)} />
    </>
  );
}

