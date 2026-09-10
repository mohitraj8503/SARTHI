'use client';

import React, { useEffect, useRef, useState } from 'react';

export interface SummerCampCertificateProps {
  studentName?: string;
  campName?: string;
  completionDate?: string;
  credentialId?: string;
  verificationUrl?: string;
  founderName?: string;
  directorName?: string;
}

export default function SummerCampCertificate({
  studentName = 'Mohit Raj',
  completionDate = 'June 20, 2026',
  founderName = 'Dr. Mukul Pandey',
  directorName = 'Neha Sharma',
}: SummerCampCertificateProps) {
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        // The original width of the certificate is 1491px
        const containerWidth = containerRef.current.clientWidth;
        // Padding/margin buffer if needed, but we can just fit width
        const newScale = Math.min(1, containerWidth / 1491);
        setScale(newScale);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,500;0,600;0,700;0,800;0,900;1,600&family=Alex+Brush&family=Dancing+Script:wght@500;600;700&display=swap" rel="stylesheet" />

      <style dangerouslySetInnerHTML={{
        __html: `
          .cert-container-outer {
            --gold: #c99a3e;
            --gold-dark: #b8862e;
            --teal: #12494c;
            --teal-deep: #0d3a3c;
            --gray-text: #4a4a4a;
            --gray-label: #57606a;
            --green: #4f8a3d;
            --orange: #c07a2e;
            --bg: #f6f5f2;
            width: 100%;
            display: flex;
            justify-content: center;
            background: #d9d9d6;
            padding: 24px 0;
            overflow: hidden;
            font-family: 'Poppins', sans-serif;
          }
          .cert-container-outer * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          .cert-scale-wrapper {
            width: 1491px;
            height: 1057px;
            transform-origin: top center;
          }
          .certificate-box {
            position: relative;
            width: 1491px !important;
            height: 1057px !important;
            min-width: 1491px !important;
            min-height: 1057px !important;
            max-width: 1491px !important;
            background: var(--bg);
            overflow: hidden;
            box-shadow: 0 10px 40px rgba(0,0,0,0.25);
            border: 1px solid #e2e0da;
          }
          
          @media print {
            @page {
              size: 1491px 1057px;
              margin: 0;
            }
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            body * {
              visibility: hidden;
            }
            .cert-container-outer, .cert-container-outer * {
              visibility: visible;
            }
            .cert-container-outer {
              position: absolute;
              left: 0;
              top: 0;
              margin: 0;
              padding: 0;
              width: 1491px;
              height: 1057px !important;
              background: transparent;
            }
            .cert-scale-wrapper {
              transform: none !important;
            }
            .certificate-box {
              box-shadow: none;
              border: none;
            }
          }

          /* Explicitly force SVG to match exactly */
          .certificate-box .deco { position: absolute; top: 0; left: 0; width: 1491px !important; height: 1057px !important; }
          .certificate-box .content { position: absolute; top: 0; left: 0; width: 1491px !important; height: 1057px !important; }
          
          .certificate-box .label-top { position: absolute; left: 159px; top: 378px; font-size: 19px; letter-spacing: 2.5px; color: var(--gray-label); font-weight: 600; }
          .certificate-box .title-word { position: absolute; left: 155px; top: 186px; font-size: 96px; font-weight: 800; letter-spacing: 2px; color: var(--gold); line-height: 1; }
          .certificate-box .subtitle { position: absolute; left: 159px; top: 298px; font-size: 33px; font-style: italic; font-weight: 600; letter-spacing: 3px; color: var(--gold); }
          .certificate-box .name { position: absolute; left: 150px; top: 410px; font-family: 'Alex Brush', cursive; font-size: 130px; color: var(--teal); line-height: 1; }
          .certificate-box .name-underline { position: absolute; left: 159px; top: 545px; width: 527px; height: 1px; background: #9fb3b3; }
          .certificate-box .desc { position: absolute; left: 159px; top: 592px; width: 720px; font-size: 20.5px; line-height: 35px; color: var(--gray-text); font-weight: 400; }
          .certificate-box .desc b { font-weight: 700; }
          .certificate-box .c-teal { color: var(--teal); font-weight: 700; }
          .certificate-box .c-green { color: var(--green); font-weight: 700; }
          .certificate-box .c-orange { color: var(--orange); font-weight: 700; }
          .certificate-box .date-block { position: absolute; left: 159px; top: 748px; font-size: 21px; color: var(--gray-text); font-weight: 400; }
          .certificate-box .date-block b { color: var(--teal); font-weight: 700; }
          .certificate-box .date-line { position: absolute; left: 159px; top: 785px; width: 270px; height: 1px; background: #9fb3b3; }
          .certificate-box .sign { position: absolute; left: 498px; top: 695px; font-family: 'Dancing Script', cursive; font-size: 56px; font-weight: 600; color: #2b3a63; transform: rotate(-3deg); }
          .certificate-box .sign-line { position: absolute; left: 487px; top: 786px; width: 232px; height: 1px; background: #9fb3b3; }
          .certificate-box .footer-name { position: absolute; left: 207px; top: 872px; font-size: 21px; font-weight: 700; color: var(--teal); letter-spacing: 0.3px; }
          .certificate-box .footer-role { position: absolute; left: 196px; top: 910px; font-size: 15px; color: var(--gray-label); letter-spacing: 2px; font-weight: 500; }
          .certificate-box .footer-name2 { position: absolute; left: 1030px; top: 891px; font-size: 21px; font-weight: 700; color: var(--teal); letter-spacing: 0.3px; }
          .certificate-box .footer-role2 { position: absolute; left: 1030px; top: 925px; font-size: 15px; color: var(--gray-label); letter-spacing: 2px; font-weight: 500; }
          .certificate-box .logo { position: absolute; left: 583px; top: 882px; display: flex; align-items: center; gap: 12px; }
          .certificate-box .logo-mark { width: 46px; height: 46px; }
          .certificate-box .logo-text { font-size: 31px; font-weight: 700; color: #173a63; letter-spacing: 0.3px; }
          .certificate-box .logo-text span { color: #3a9142; }
          .certificate-box .logo-tagline { position: absolute; left: 600px; top: 930px; font-size: 12.5px; letter-spacing: 3px; color: var(--gray-label); font-weight: 500; }
        `
      }} />

      <div 
        className="cert-container-outer" 
        ref={containerRef}
        style={{ height: `\${1057 * scale + 48}px` }}
      >
        <div className="cert-scale-wrapper" style={{ transform: `scale(\${scale})` }}>
          <div className="certificate-box">
            {/* decorative background */}
            <svg className="deco" viewBox="0 0 1491 1057" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="circGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#155356"/>
                  <stop offset="100%" stopColor="#0c3839"/>
                </linearGradient>
              </defs>

              {/* top-left gold arc */}
              <circle cx="-30" cy="-50" r="285" fill="none" stroke="var(--gold)" strokeWidth="2.5"/>
              {/* bottom-left gold arc */}
              <circle cx="-55" cy="1145" r="330" fill="none" stroke="var(--gold)" strokeWidth="2.5"/>

              {/* right side big teal circles */}
              <circle cx="1580" cy="180" r="430" fill="url(#circGrad)"/>
              <circle cx="1580" cy="180" r="410" fill="none" stroke="var(--gold)" strokeWidth="3"/>

              <circle cx="1660" cy="640" r="460" fill="url(#circGrad)"/>
              <circle cx="1660" cy="640" r="438" fill="none" stroke="var(--gold)" strokeWidth="3"/>

              <circle cx="1370" cy="980" r="330" fill="none" stroke="var(--gold)" strokeWidth="2.5"/>

              {/* soft white crescent separators to mimic overlap gaps */}
              <circle cx="1430" cy="330" r="230" fill="var(--bg)" opacity="0.9"/>
              <circle cx="1300" cy="760" r="120" fill="var(--bg)" opacity="0.85"/>
            </svg>

            <div className="content">
              <div className="title-word">CERTIFICATE</div>
              <div className="subtitle">OF APPRECIATION</div>
              <div className="label-top">THIS CERTIFICATE IS PROUDLY PRESENTED TO</div>

              <div className="name">{studentName}</div>
              <div className="name-underline"></div>

              <div className="desc">
                for successfully completing the <span className="c-teal">SARTHI Summer Camp 2026.</span><br />
                A hands-on summer experience for young innovators to <span className="c-green">build</span>, <span className="c-orange">create</span>,<br />
                and <span className="c-green">explore</span> the future of technology.
              </div>

              <div className="date-block">Date: <b>{completionDate}</b></div>
              <div className="date-line"></div>

              <div className="sign">Mukul</div>
              <div className="sign-line"></div>

              <div className="footer-name">{founderName}</div>
              <div className="footer-role">CEO &amp; FOUNDER</div>

              <div className="logo">
                <svg className="logo-mark" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="48" fill="#eef7ee" stroke="#3a9142" strokeWidth="3"/>
                  <path d="M30 40 L50 25 L70 40 L70 65 L30 65 Z" fill="none" stroke="#173a63" strokeWidth="4" strokeLinejoin="round"/>
                  <circle cx="50" cy="50" r="8" fill="#3a9142"/>
                </svg>
                <div className="logo-text">Tech<span>Tomorrow</span></div>
              </div>
              <div className="logo-tagline">LEARN &nbsp;·&nbsp; BUILD &nbsp;·&nbsp; INNOVATE</div>

              <div className="footer-name2">{directorName}</div>
              <div className="footer-role2">PROGRAM DIRECTOR</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


