'use client';

import React from 'react';
import { Github, Linkedin, Twitter, Youtube, ArrowUp } from 'lucide-react';

export default function InternshipFooter() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#FCFBF8] border-t border-[#ECECEC] py-12 px-6">
      <div className="container mx-auto max-w-[1200px]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand/Title */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-extrabold text-[#111111]">
              SARTHI <span className="text-[#16A34A]">Student Interns</span>
            </span>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-5">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white border border-[#ECECEC] flex items-center justify-center text-[#6B7280] hover:border-[#16A34A] hover:text-[#16A34A] transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white border border-[#ECECEC] flex items-center justify-center text-[#6B7280] hover:border-[#16A34A] hover:text-[#16A34A] transition-colors"
            >
              <Linkedin className="w-5 h-5" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white border border-[#ECECEC] flex items-center justify-center text-[#6B7280] hover:border-[#16A34A] hover:text-[#16A34A] transition-colors"
            >
              <Twitter className="w-5 h-5" />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white border border-[#ECECEC] flex items-center justify-center text-[#6B7280] hover:border-[#16A34A] hover:text-[#16A34A] transition-colors"
            >
              <Youtube className="w-5 h-5" />
            </a>
          </div>

          {/* Scroll to Top */}
          <button
            onClick={scrollToTop}
            className="w-10 h-10 rounded-full bg-white border border-[#ECECEC] flex items-center justify-center text-[#6B7280] hover:border-[#16A34A] hover:text-[#16A34A] transition-colors"
            aria-label="Back to top"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-8 pt-8 border-t border-[#ECECEC] text-center text-xs text-[#6B7280]">
          &copy; {new Date().getFullYear()} SARTHI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
