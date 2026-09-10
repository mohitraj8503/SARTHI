'use client';

import { ShieldCheck, Download, Share2, Award } from 'lucide-react';
import Image from 'next/image';

interface CertificateViewerProps {
  userCert: any;
  issueDate: string;
}

export default function CertificateViewer({ userCert, issueDate }: CertificateViewerProps) {
  return (
    <div className="min-h-screen bg-[#F3F4F6] py-16 px-4">
      <div className="container mx-auto max-w-5xl">
        
        {/* Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6 bg-white p-6 rounded-3xl shadow-sm border border-[#EEEEEE]">
            <div className="flex items-center gap-4">
                <div className="bg-[#2D7A6E]/10 p-3 rounded-xl">
                    <Award className="w-6 h-6 text-[#2D7A6E]" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-[#1A1A1A]">Official Certification</h1>
                    <p className="text-sm text-[#666666]">Verified by SARTHI Academic Board</p>
                </div>
            </div>
            <div className="flex gap-4">
                <button className="flex items-center gap-2 px-6 py-3 rounded-xl border border-[#E5E7EB] text-[#374151] font-semibold hover:bg-gray-50 transition-all">
                    <Share2 className="w-5 h-5" /> Share
                </button>
                <button 
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[#1B4D3E] text-white font-bold hover:bg-[#163f33] transition-all shadow-lg shadow-[#1B4D3E]/20"
                >
                    <Download className="w-5 h-5" /> Download PDF
                </button>
            </div>
        </div>

        {/* Certificate Frame */}
        <div className="bg-white p-4 md:p-8 rounded-[40px] shadow-2xl border-[12px] border-[#1B4D3E]/10 relative print:p-0 print:shadow-none print:border-none">
          <div className="border-[2px] border-[#D4AF37] h-full w-full rounded-[24px] p-8 md:p-20 flex flex-col items-center text-center relative overflow-hidden">
            
            {/* Background Watermark/Patterns */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#2D7A6E]/5 rounded-full blur-3xl -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#D4AF37]/5 rounded-full blur-3xl -ml-32 -mb-32" />

            {/* Logo */}
            <div className="mb-12">
                <span className="text-2xl font-black tracking-tight text-[#1A1A1A]">
                    Tech<span className="text-[#2D7A6E]">Tomorrow</span>
                </span>
            </div>

            <span className="text-[12px] uppercase tracking-[6px] text-[#A37E2C] font-black mb-8">
              CERTIFICATE OF ACHIEVEMENT
            </span>

            <p className="text-[#666666] italic mb-4">This is to certify that</p>
            
            <h2 className="text-4xl md:text-6xl font-serif font-black text-[#1A1A1A] mb-8 border-b-2 border-[#1B4D3E]/20 pb-4 min-w-[300px]">
              {userCert.user.name}
            </h2>

            <p className="text-[#666666] max-w-2xl text-lg leading-relaxed mb-12">
              has successfully cleared all professional requirements and assessments for the 
              comprehensive program in
            </p>

            <h3 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#1B4D3E] to-[#2D7A6E] mb-16 uppercase tracking-wider">
              {userCert.certification.title}
            </h3>

            {/* Footer Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 w-full gap-12 mt-auto border-t border-gray-100 pt-16">
              <div className="flex flex-col items-center">
                <span className="text-[#999999] text-[10px] uppercase font-bold tracking-[2px] mb-4">Verification ID</span>
                <span className="text-[#1A1A1A] font-mono font-bold">{userCert.certificateNumber}</span>
              </div>
              
              <div className="flex flex-col items-center relative gap-4">
                {/* Signature Image or Stylized Text */}
                <div className="font-serif text-3xl text-[#1A1A1A] italic">Mohit Raj</div>
                <div className="h-[1px] w-48 bg-gray-200" />
                <span className="text-[#999999] text-[10px] uppercase font-bold tracking-[2px]">Director & CEO</span>
              </div>

              <div className="flex flex-col items-center">
                <span className="text-[#999999] text-[10px] uppercase font-bold tracking-[2px] mb-4">Issue Date</span>
                <span className="text-[#1A1A1A] font-bold">{issueDate}</span>
              </div>
            </div>

            {/* Seal */}
            <div className="absolute bottom-10 right-10 md:bottom-20 md:right-20">
              <div className="w-24 h-24 rounded-full border-4 border-[#D4AF37]/30 flex items-center justify-center p-2">
                <div className="w-full h-full rounded-full border-2 border-[#D4AF37] flex items-center justify-center bg-[#D4AF37]/5">
                  <ShieldCheck className="w-10 h-10 text-[#D4AF37]" />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Helper */}
        <div className="mt-8 text-center">
            <p className="text-[#999999] text-sm">
                SARTHI Academic verification. This certificate can be verified at sarthi-woad.vercel.app/verify
            </p>
        </div>

      </div>
      
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            padding: 0 !important;
          }
          nav, footer, button, .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

