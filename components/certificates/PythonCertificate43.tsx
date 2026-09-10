'use client';

import React from 'react';

export interface PythonCertificate43Props {
  studentName?: string;
  courseName?: string;
  specialization?: string;
  completionDate?: string;
  credentialId?: string;
  directorName?: string;
  brandName?: string;
  tagline?: string;
}

export default function PythonCertificate43({
  studentName = 'John Doe',
  courseName = 'Python Masterclass & Automation',
  specialization = 'Python Full-Stack & Automation',
  completionDate = '13.06.2025',
  credentialId = 'TT-PM-2026-04819',
  directorName = 'Dr. Mukul Pandey',
  brandName = 'SARTHI',
  tagline = 'INNOVATE TODAY',
}: PythonCertificate43Props) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@1,600&family=Alex+Brush&display=swap"
        rel="stylesheet"
      />

      <div
        id="exact-python-certificate-43-root"
        className="print-certificate-root relative mx-auto aspect-[1050/787.5] w-full overflow-hidden rounded-[2.8cqi] border-[0.2cqi] border-white/80 p-[4.8cqi] shadow-[0_20px_50px_rgba(0,0,0,0.05)] backdrop-blur-2xl select-none text-left"
        style={{
          containerType: 'inline-size',
          fontFamily: "'Montserrat', sans-serif",
          backgroundImage: "url('/python-bg.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.60)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        } as React.CSSProperties}
      >
        <div className="flex h-full flex-col justify-between rounded-[2cqi] bg-white/60 p-[3cqi] backdrop-blur-xl border border-white/80">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-[2.5cqi]">
            <div className="flex items-center gap-[1.1cqi]">
              {/* Python Colorful SVG Logo */}
              <svg className="w-[3.8cqi] h-[3.8cqi]" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M50 15 L85 75 L15 75 Z" fill="url(#pyGrad1)"/>
                <path d="M50 15 L85 75 L50 85 Z" fill="url(#pyGrad2)" style={{ mixBlendMode: 'multiply' }}/>
                <path d="M15 75 L85 75 L50 85 Z" fill="url(#pyGrad3)" style={{ mixBlendMode: 'multiply' }}/>
                <defs>
                  <linearGradient id="pyGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#306998', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#FFD43B', stopOpacity: 1 }} />
                  </linearGradient>
                  <linearGradient id="pyGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" style={{ stopColor: '#1E415E', stopOpacity: 0.9 }} />
                    <stop offset="100%" style={{ stopColor: '#151A30', stopOpacity: 0.9 }} />
                  </linearGradient>
                  <linearGradient id="pyGrad3" x1="100%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" style={{ stopColor: '#FFD43B', stopOpacity: 0.8 }} />
                    <stop offset="100%" style={{ stopColor: '#306998', stopOpacity: 0.8 }} />
                  </linearGradient>
                </defs>
              </svg>
              <div className="flex flex-col justify-center">
                <p className="m-0 text-[1.35cqi] font-[800] tracking-[1px] text-[#151A30] leading-tight uppercase">
                  {brandName}
                </p>
                <p className="m-0 text-[0.95cqi] font-[500] tracking-[4px] text-[#5A5A5A] leading-tight uppercase">
                  {tagline}
                </p>
              </div>
            </div>

            {/* Official Brand Logo */}
            <img src="/sarthi-logo.png" alt="SARTHI Logo" className="h-[5.5cqi] object-contain" />
          </div>

          {/* Main Title Area */}
          <div className="text-center mb-[2cqi]">
            <h1 className="text-[5.2cqi] font-[800] tracking-[1.5px] text-[#151A30] m-0 leading-tight uppercase">
              PYTHON CERTIFICATE
            </h1>
            <div className="mx-auto mt-[0.6cqi] flex w-[48cqi] items-center justify-center gap-[1.8cqi]">
              <div className="h-[1.5px] flex-grow bg-gradient-to-r from-transparent to-[#306998]" />
              <span className="text-[1.7cqi] font-[500] tracking-[6px] text-[#151A30] uppercase">
                OF COMPLETION
              </span>
              <div className="h-[1.5px] flex-grow bg-gradient-to-r from-[#FFD43B] to-transparent" />
            </div>
          </div>

          {/* Recipient Details */}
          <div className="text-center mb-[2.2cqi]">
            <p className="text-[1.15cqi] font-[600] tracking-[2px] text-[#5A5A5A] uppercase mb-[0.4cqi]">
              This certifies that
            </p>
            <h2
              className="my-[0.3cqi] text-[6.8cqi] font-[600] italic leading-tight text-transparent bg-clip-text bg-gradient-to-r from-[#306998] via-[#1E415E] to-[#E5A823]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {studentName}
            </h2>
            <p className="mx-auto max-w-[650px] text-[1.35cqi] font-[500] leading-[1.8] text-[#5A5A5A]">
              has successfully completed a comprehensive program in <strong className="text-[#151A30] font-[700]">{courseName}</strong>,<br />
              covering core and advanced modules in data structures, algorithms,<br />
              backend development, and automation engineering.
            </p>
          </div>

          {/* Specialization Section */}
          <div className="text-center mb-auto">
            <div className="relative mx-auto my-[1.8cqi] flex w-[28cqi] items-center justify-center">
              <div className="h-[1px] w-full bg-[#D3D3D3]" />
              <div className="absolute w-[0.6cqi] h-[0.6cqi] rounded-full bg-[#306998]" />
            </div>
            <p className="text-[1.5cqi] text-[#151A30]">
              <strong>Specialization:</strong> {specialization}
            </p>
          </div>

          {/* Footer Section */}
          <div className="flex items-end justify-between px-[3.5cqi]">
            
            {/* Date of Issue */}
            <div className="flex flex-col items-center flex-1">
              <div className="mb-[1.2cqi] flex h-[4.2cqi] w-[4.2cqi] items-center justify-center rounded-[1.1cqi] border border-white/80 bg-white/60 shadow-[0_4px_10px_rgba(0,0,0,0.03)]">
                <svg className="w-[1.9cqi] h-[1.9cqi] stroke-[#306998]" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                  <circle cx="9" cy="15" r="1"></circle>
                  <circle cx="15" cy="15" r="1"></circle>
                </svg>
              </div>
              <div className="text-[1cqi] font-[700] tracking-[1px] text-[#151A30] mb-[0.6cqi] uppercase">DATE OF ISSUE</div>
              <div className="text-[1.3cqi] font-[500] text-[#5A5A5A]">{completionDate}</div>
            </div>

            {/* Certificate ID */}
            <div className="flex flex-col items-center flex-1 border-x border-[#D3D3D3]">
              <div className="mb-[1.2cqi] flex h-[4.2cqi] w-[4.2cqi] items-center justify-center rounded-[1.1cqi] border border-white/80 bg-white/60 shadow-[0_4px_10px_rgba(0,0,0,0.03)]">
                <svg className="w-[1.9cqi] h-[1.9cqi] stroke-[#306998]" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="5" width="18" height="14" rx="2" ry="2"></rect>
                  <circle cx="8" cy="12" r="3"></circle>
                  <line x1="14" y1="10" x2="19" y2="10"></line>
                  <line x1="14" y1="14" x2="19" y2="14"></line>
                </svg>
              </div>
              <div className="text-[1cqi] font-[700] tracking-[1px] text-[#151A30] mb-[0.6cqi] uppercase">CERTIFICATE ID</div>
              <div className="text-[1.3cqi] font-[500] text-[#5A5A5A] font-mono">{credentialId}</div>
            </div>

            {/* Program Director */}
            <div className="flex flex-col items-center flex-1">
              <div className="mb-[1.2cqi] flex h-[4.2cqi] w-[4.2cqi] items-center justify-center rounded-[1.1cqi] border border-white/80 bg-white/60 shadow-[0_4px_10px_rgba(0,0,0,0.03)]">
                <svg className="w-[1.9cqi] h-[1.9cqi] stroke-[#306998]" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <div className="text-[1cqi] font-[700] tracking-[1px] text-[#151A30] mb-[0.6cqi] uppercase">PROGRAM DIRECTOR</div>
              <div className="text-[1.3cqi] font-[500] text-[#5A5A5A]">{directorName}</div>
            </div>

            {/* Signature */}
            <div className="flex items-center justify-center flex-1 pl-[1.8cqi]">
              <div className="text-[3.8cqi] text-[#222] font-semibold -rotate-[5deg]" style={{ fontFamily: "'Alex Brush', cursive" }}>
                {directorName}
              </div>
            </div>

          </div>

        </div>
      </div>
    </>
  );
}
