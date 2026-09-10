"use client";

import { Download, Share2, Check } from "lucide-react";
import { useState } from "react";

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);


interface ShareActionsProps {
  certificationTitle: string;
  certificateUrl: string;
}

export default function ShareActions({ certificationTitle, certificateUrl }: ShareActionsProps) {
  const [copied, setCopied] = useState(false);

  const handleLinkedInShare = () => {
    const certTitle = encodeURIComponent(certificationTitle);
    const certUrl = encodeURIComponent(certificateUrl);
    const organizationId = "98274641"; // SARTHI LinkedIn Org ID (Example)
    
    const linkedInUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${certTitle}&organizationId=${organizationId}&issueYear=${new Date().getFullYear()}&issueMonth=${new Date().getMonth() + 1}&certUrl=${certUrl}`;
    
    window.open(linkedInUrl, "_blank");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(certificateUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      <button
        onClick={handleLinkedInShare}
        className="flex items-center gap-2 px-6 py-3 bg-[#0077b5] hover:bg-[#005a87] text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-900/20 active:scale-95"
      >
        <LinkedinIcon className="w-4 h-4" />

        ADD TO LINKEDIN
      </button>

      <a
        href={certificateUrl}
        download
        target="_blank"
        className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold rounded-xl transition-all border border-slate-700/50 active:scale-95"
      >
        <Download className="w-4 h-4" />
        DOWNLOAD PDF
      </a>

      <button
        onClick={handleCopyLink}
        className="flex items-center gap-2 px-6 py-3 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 font-bold rounded-xl transition-all border border-emerald-500/20 active:scale-95"
      >
        {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
        {copied ? "COPIED" : "COPY LINK"}
      </button>
    </div>
  );
}

