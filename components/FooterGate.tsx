"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function FooterGate() {
  const pathname = usePathname();

  // Always show footer on verify index search pages (/verify, /verify/interns)
  if (pathname === '/verify' || pathname === '/verify/' || pathname === '/verify/interns' || pathname === '/verify/interns/') {
    return <Footer />;
  }

  // Hide footer on specific pages if needed (e.g., checkout, search focus, certificate viewer)
  const hideFooterOn = ['/login', '/signup', '/auth', '/assessment', '/register', '/seminars/', '/teach/apply', '/verify/', '/internship/apply'];
  const shouldHide = hideFooterOn.some(path => pathname?.startsWith(path));

  if (shouldHide) return null;
  return <Footer />;
}

