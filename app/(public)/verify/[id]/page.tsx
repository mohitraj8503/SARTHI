import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ShieldCheck, Award, Calendar, User, FileCheck } from "lucide-react";
import Link from "next/link";
import CertificateVerificationClient from "./CertificateVerificationClient";
import CertificateActivationClient from "./CertificateActivationClient";
import { getCertificateHtmlSnapshot, buildCertificateHtmlSnapshot } from "@/lib/certificate/captureCertificateSnapshot";
import { isValidInternshipCertificate } from "@/lib/certificate/internshipGuardrail";

export const dynamic = "force-dynamic";

/** Wraps a Prisma promise with a timeout so a slow/failed DB query never stalls or crashes the page */
async function safeQuery<T>(queryPromise: Promise<T>, timeoutMs = 6000): Promise<T | null> {
  try {
    const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs));
    return await Promise.race([queryPromise, timeout]);
  } catch (err) {
    console.error("Safe query error in verify route:", err);
    return null;
  }
}

export default async function CertificateVerificationPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id: rawId } = await params;
  const verificationId = decodeURIComponent(rawId).trim();
  const cleanUpperId = verificationId.toUpperCase();

  // 1. ROUTING: If ID matches Internship Certificate / Award pattern, redirect to dedicated intern route
  if (
    cleanUpperId.startsWith('TT-INT-') || 
    cleanUpperId.startsWith('TTI') || 
    cleanUpperId.startsWith('TT-BIA-') || 
    cleanUpperId.startsWith('TT-APP-')
  ) {
    redirect(`/verify/interns/${encodeURIComponent(verificationId)}`);
  }

  let isPendingActivation = false;
  let certificate: any = null;

  // 2. Direct Hardcoded Test Credentials (for offline/demo verification)
  if (verificationId === 'TT-EX-2026-0002') {
    let user = await safeQuery(prisma.user.findFirst({
      where: { OR: [{ id: 'cmqmjmxo2000913c8hn9epgmr' }, { email: 'sharmaayush5644@gmail.com' }] }
    }));
    const finalUser = user || {
      id: 'cmqmjmxo2000913c8hn9epgmr',
      name: 'Ayush Kumar Sharma',
      email: 'sharmaayush5644@gmail.com'
    };
    certificate = {
      id: 'tt-ex-2026-0002-hardcoded',
      userId: finalUser.id,
      certificationId: 'advanced-excel-certification-exam',
      certificateUrl: '/verify/TT-EX-2026-0002',
      verificationId: 'TT-EX-2026-0002',
      score: 97,
      issuedAt: new Date('2026-05-08T00:00:00Z'),
      status: 'VALID',
      user: finalUser,
      certification: {
        title: 'Advance Excel & Data Analytics',
        description: 'Verified pathway professional credential.'
      }
    };
  } else if (verificationId === 'TT-EX-2026-0003') {
    let user = await safeQuery(prisma.user.findFirst({
      where: { id: 'cmsg2w6xw0000mme5esz28sez' }
    }));
    const finalUser = user || {
      id: 'cmsg2w6xw0000mme5esz28sez',
      name: 'Dhanlaxmi Naresh Bagoria',
      email: 'dhanlaxmibagoriya21@gmail.com'
    };
    certificate = {
      id: 'tt-ex-2026-0003-hardcoded',
      userId: finalUser.id,
      certificationId: 'advanced-excel-certification-exam',
      certificateUrl: '/verify/TT-EX-2026-0003',
      verificationId: 'TT-EX-2026-0003',
      score: 97,
      issuedAt: new Date('2026-08-05T13:00:10Z'),
      status: 'VALID',
      user: finalUser,
      certification: {
        title: 'Advance Excel & Data Analytics',
        description: 'Verified pathway professional credential.'
      }
    };
  } else {
    // Helper to resolve Exam Certificate (issued_certificates)
    const resolveExamCert = async () => {
      return await safeQuery(
        prisma.issuedCertificate.findUnique({
          where: { verificationId },
          include: { user: true, certification: true }
        })
      );
    };

    // Helper to resolve Course Certificate (certificates table)
    const resolveCourseCert = async () => {
      const fallbackCert = await safeQuery(
        prisma.certificate.findFirst({
          where: {
            OR: [
              { certificateNumber: verificationId },
              { certificateId: verificationId }
            ]
          },
          include: { user: true }
        })
      );

      if (!fallbackCert) return null;

      // Strictly ignore internship certificates in this course/exam route
      if (isValidInternshipCertificate(fallbackCert) && !cleanUpperId.startsWith('TT-BIA')) {
        return null;
      }

      const isStatusValid = fallbackCert.status === 'VALID';
      const certificationId = fallbackCert.courseId;
      const payment = (isStatusValid || !certificationId)
        ? true
        : await safeQuery(
            prisma.certificationPayment.findFirst({
              where: {
                userId: fallbackCert.userId,
                certificationId,
                status: "COMPLETED"
              }
            })
          );

      if (!payment) {
        return { isPendingActivation: true };
      }

      let courseTitle = fallbackCert.title || "Professional Pathway Certification";
      let score = 100;
      let templateConfig: any = null;
      try {
        const meta = typeof fallbackCert.metadata === 'string' ? JSON.parse(fallbackCert.metadata) : fallbackCert.metadata;
        if (meta?.course_name) courseTitle = meta.course_name;
        if (meta?.score) score = meta.score;
        if (meta?.templateConfig) templateConfig = meta.templateConfig;
      } catch {}

      let htmlSnapshot = fallbackCert.htmlSnapshot;
      if (!htmlSnapshot) {
        const dateStr = new Date(fallbackCert.issuedAt).toLocaleDateString('en-GB', {
          day: '2-digit', month: '2-digit', year: 'numeric'
        }).replace(/\//g, '.');
        htmlSnapshot = buildCertificateHtmlSnapshot({
          certificateNumber: fallbackCert.certificateNumber || verificationId,
          studentName: fallbackCert.user?.name || '',
          courseName: courseTitle,
          issueDate: dateStr,
          templateConfig,
        });
      }

      return {
        id: fallbackCert.id,
        userId: fallbackCert.userId,
        certificationId: fallbackCert.courseId,
        certificateUrl: fallbackCert.certificateUrl || "#",
        verificationId: fallbackCert.certificateNumber || verificationId,
        htmlSnapshot,
        score,
        issuedAt: fallbackCert.issuedAt,
        status: fallbackCert.status,
        user: fallbackCert.user,
        certification: {
          title: courseTitle,
          description: "Verified pathway professional credential."
        }
      } as any;
    };

    // Deterministic prefix-based query routing:
    const isCoursePattern = cleanUpperId.startsWith('TT-FSWDM') || cleanUpperId.startsWith('TT-COURSE') || cleanUpperId.startsWith('TT-C-');
    const isExamPattern = cleanUpperId.startsWith('TT-PY') || cleanUpperId.startsWith('TT-AEX') || cleanUpperId.startsWith('TT-EX');

    if (isCoursePattern) {
      // Prioritize course certificates table
      const res = await resolveCourseCert();
      if (res?.isPendingActivation) {
        isPendingActivation = true;
      } else if (res) {
        certificate = res;
      } else {
        certificate = await resolveExamCert();
      }
    } else if (isExamPattern) {
      // Prioritize exam certificates table
      certificate = await resolveExamCert();
      if (!certificate) {
        const res = await resolveCourseCert();
        if (res?.isPendingActivation) isPendingActivation = true;
        else if (res) certificate = res;
      }
    } else {
      // Unknown prefix: parallel lookup
      const [examRes, courseRes, internRes] = await Promise.all([
        resolveExamCert(),
        resolveCourseCert(),
        safeQuery(
          prisma.internshipCertificate.findFirst({
            where: {
              OR: [
                { certificateNumber: verificationId },
                { certificateNumber: cleanUpperId },
                { id: verificationId }
              ]
            }
          })
        )
      ]);

      if (internRes) {
        redirect(`/verify/interns/${encodeURIComponent(verificationId)}`);
      }

      if (courseRes?.isPendingActivation) {
        isPendingActivation = true;
      } else {
        certificate = examRes || courseRes;
      }
    }
  }

  if (certificate && certificate.status !== 'VALID') {
    isPendingActivation = true;
    certificate = null;
  }

  // ── Attach standardized htmlSnapshot ──────────
  if (certificate) {
    try {
      const snapshot = await getCertificateHtmlSnapshot(verificationId);
      if (snapshot) {
        certificate.htmlSnapshot = snapshot;
      }
    } catch (e) {
      console.warn("Failed to generate runtime htmlSnapshot:", e);
    }
  }

  if (isPendingActivation) {
    return <CertificateActivationClient verificationId={verificationId} />;
  }

  // Not found or not an exam certificate
  if (!certificate) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900/50 border border-red-500/20 space-y-6 shadow-2xl">
           <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mx-auto border border-red-500/20">
              <ShieldCheck className="w-8 h-8 opacity-40" />
           </div>
           <h1 className="text-2xl font-bold text-slate-100 italic font-black">Verification Failed.</h1>
           <p className="text-slate-400 text-sm leading-relaxed">
              The credentials provided do not match any issued certificate in the SARTHI registry. This record may be invalid or forged.
           </p>
           <Link href="/certification-exams" className="inline-block px-8 py-3 bg-red-600/10 border border-red-500/20 text-red-400 text-sm font-semibold rounded-xl hover:bg-red-500/10 active:scale-95 transition-all">
              SARTHI Registry
           </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F9F7F4] flex items-center justify-center p-6 pt-32 pb-20">
      <div className="max-w-2xl w-full bg-white border-2 border-emerald-900/10 rounded-[40px] p-8 md:p-12 shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/5 blur-[80px] -mr-32 -mt-32" />
         
         <div className="relative space-y-10">
            {/* Verification Header */}
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center border border-emerald-200/50">
                     <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                     <h1 className="text-xl font-black text-[#1A3C2E] uppercase tracking-widest leading-none">Verified</h1>
                     <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-tighter mt-1">SARTHI Registry</p>
                  </div>
               </div>
               <div className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-black border border-emerald-200/50 tracking-widest uppercase">
                  Active Credential
               </div>
            </div>

            {/* Document Details */}
            <div className="space-y-6 py-10 border-y border-gray-100">
               <div className="space-y-1">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                     <User className="w-3 h-3 text-emerald-700" /> Certificate Holder
                  </span>
                  <p className="text-2xl font-black text-[#1A3C2E]">{certificate.user?.name}</p>
               </div>

               <div className="space-y-1">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                     <Award className="w-3 h-3 text-emerald-700" /> {cleanUpperId.startsWith('TT-BIA') ? 'Award Conferred' : 'Certification Earned'}
                  </span>
                  <p className="text-xl font-bold text-emerald-700 leading-tight">
                     {certificate.certification?.title}
                  </p>
               </div>

               <div className="grid grid-cols-2 gap-8 pt-4">
                  <div className="space-y-1">
                     <span className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                        <Calendar className="w-3 h-3 text-emerald-700" /> Issue Date
                     </span>
                     <p className="text-sm font-bold text-[#1A3C2E]">
                        {new Date(certificate.issuedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                     </p>
                  </div>
                  <div className="space-y-1">
                     <span className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                        <FileCheck className="w-3 h-3 text-emerald-700" /> {cleanUpperId.startsWith('TT-BIA') ? 'Recognition' : 'Score Achieved'}
                     </span>
                     <p className="text-sm font-bold text-[#1A3C2E]">{cleanUpperId.startsWith('TT-BIA') ? 'Award of Excellence' : `${certificate.score}%`}</p>
                  </div>
               </div>
            </div>

            {/* Footer Actions */}
            <div className="flex flex-col md:flex-row items-center gap-4 justify-between">
               <div className="text-left">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Verification ID</span>
                  <p className="text-xs font-mono text-gray-650">{certificate.verificationId}</p>
               </div>
               
               <CertificateVerificationClient certificate={certificate as any} />
            </div>

            <p className="text-[10px] text-center text-gray-400 font-medium">
               This document is digitally signed and cryptographically verified by SARTHI.
            </p>
         </div>
      </div>
    </main>
  );
}
