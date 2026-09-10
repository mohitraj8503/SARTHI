import { useEffect, useRef } from 'react';

export function useScrollSystem() {
  const navbarRef = useRef<HTMLElement>(null);
  const orbsRef = useRef<(HTMLDivElement | null)[]>([]);
  const revealRef = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const navbar = navbarRef.current;
    const orbs = orbsRef.current;
    const reveals = revealRef.current;

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          
          if (navbar) {
            navbar.classList.toggle('scrolled', scrollY > 50);
          }

          orbs.forEach((orb, i) => {
            if (orb) {
              const speed = 0.03 + (i * 0.02);
              orb.style.transform = `translateY(${scrollY * speed}px)`;
            }
          });

          ticking = false;
        });
        ticking = true;
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );

    reveals.forEach(el => {
      if (el) observer.observe(el);
    });

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Trigger scroll handle immediately to catch initial state
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  return { navbarRef, orbsRef, revealRef };
}
