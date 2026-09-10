'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, PlayCircle, FileText, BookOpen, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import Image from 'next/image';
import { triggerHaptic } from '../../../../lib/haptics';
import ReceiptSuccessModal from '@/components/payments/ReceiptSuccessModal';

interface InvoiceData {
  invoiceNumber: string;
  amount: number;
  currency: string;
  paymentStatus: string;
  createdAt: string;
  course: {
    id: string;
    title: string;
    slug: string | null;
    thumbnail: string | null;
    category: string | null;
  };
  student: {
    name: string | null;
    email: string;
  };
  enrollmentCode: string | null;
  topLessons?: Array<{
    id: string;
    title: string;
    duration: number | null;
    contentType: string;
  }>;
}

export default function EnrollmentConfirmedPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const invoiceId = params?.invoiceId as string;
  const courseId = searchParams.get('courseId');
  const router = useRouter();
  const { width, height } = useWindowSize();
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(true);
  const [showInvoiceAlert, setShowInvoiceAlert] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  useEffect(() => {
    // If invoiceId is explicitly "undefined" or missing, and we have a courseId, we can try to fetch by courseId
    const isInvalidId = !invoiceId || invoiceId === 'undefined' || invoiceId === 'success';
    
    const fetchInvoice = async () => {
      try {
        let url = `/api/invoice/${invoiceId}`;
        
        // If we don't have a valid invoiceId but have courseId, use a different strategy or handle error
        if (isInvalidId && courseId) {
            // We'll still try to fetch, but maybe the API can handle courseId?
            // For now, we'll let it try or show error
            console.warn('Invalid invoiceId, relying on courseId fallback logic in UI');
        }

        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setInvoiceData(data);
          // Only show receipt print animation if we successfully have data
          setIsReceiptOpen(true);
        } else if (courseId) {
            // Second attempt: If invoice fetch fails but we have courseId, maybe fetch enrollment by courseId?
            // Actually, let's keep it simple for now as the API fix should solve most cases.
        }
      } catch (err) {
        console.error('Failed to fetch invoice:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [invoiceId, courseId]);

  const getLearnUrl = () => {
    const slug = invoiceData?.course.slug || courseId;
    if (slug === 'devops-engineering-microsoft-learn') {
      return 'https://learn.microsoft.com/en-us/plans/30xb6t40g18ey?sharingId=87043F3FB9BF8147&wt.mc_id=studentamb_511525';
    }
    if (slug === 'cloud-fundamentals-microsoft') {
      return 'https://learn.microsoft.com/en-us/plans/y36setm5126mj?sharingId=87043F3FB9BF8147&wt.mc_id=studentamb_511525';
    }
    return invoiceData?.course.slug
      ? `/courses/${invoiceData.course.slug}/learn`
      : courseId
        ? `/courses/${courseId}/learn`
        : '/dashboard/courses';
  };

  const learnUrl = getLearnUrl();

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#F5F0E8] to-[#E8F5EE] flex items-center justify-center p-4 relative overflow-hidden">
        <section className="max-w-lg w-full relative z-10 opacity-60 pointer-events-none">
          <div className="text-center mb-6 opacity-100">
            <h1 className="text-2xl font-black text-[#1A3C2E] uppercase tracking-wide">Finalizing Enrollment</h1>
            <p className="text-[#5D705C] text-sm font-medium mt-2">
              We are validating your invoice and preparing your learning access.
            </p>
          </div>
          <div className="bg-white rounded-[2.5rem] shadow-sm overflow-hidden border border-[#E8E2D9]">
            <div className="bg-gradient-to-br from-[#1A3C2E]/20 to-[#2D6A4F]/20 p-12 text-center h-[280px] animate-pulse">
              <div className="w-24 h-24 bg-white/40 rounded-full mx-auto mb-6"></div>
              <div className="h-8 w-48 bg-white/40 rounded mx-auto mb-4"></div>
              <div className="h-5 w-32 bg-white/40 rounded mx-auto"></div>
            </div>
            <div className="min-h-[100px] -mt-12">
              <div className="mx-6 bg-white border border-[#E8E2D9] rounded-2xl p-4 flex items-center gap-4 animate-pulse">
                <div className="w-16 h-16 rounded-xl bg-gray-200 shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-16 bg-gray-200 rounded"></div>
                  <div className="h-5 w-full max-w-[200px] bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
            <div className="p-8 pt-6 space-y-6">
              <div className="h-[140px] bg-gray-100 rounded-2xl animate-pulse"></div>
              <div className="h-[80px] bg-gray-100 rounded-2xl animate-pulse"></div>
              <div className="space-y-3">
                <div className="h-[60px] bg-gray-200 rounded-2xl animate-pulse"></div>
                <div className="flex gap-3">
                  <div className="h-[48px] bg-gray-200 rounded-xl flex-1 animate-pulse"></div>
                  <div className="h-[48px] bg-gray-200 rounded-xl flex-1 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (!invoiceData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F0E8] to-[#E8F5EE] flex items-center justify-center p-4">
        <div className="text-center p-6 bg-white rounded-2xl shadow-xl max-w-sm w-full border border-[#E8E2D9]">
          <CheckCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-[#1A3C2E] mb-2">Enrollment Confirmation</h1>
          <p className="text-slate-600 text-sm mb-4">
            We couldn&apos;t load the enrollment details. This might be due to an invalid invoice ID or authentication issue.
            Please check your email for confirmation or contact support.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1A3C2E] text-white rounded-lg hover:bg-[#2D6A4F] transition-colors text-sm font-medium"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F0E8] to-[#E8F5EE] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Confetti */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <Confetti
          width={width}
          height={height}
          recycle={showConfetti}
          numberOfPieces={showConfetti ? 400 : 0}
          gravity={0.12}
          colors={['#1A3C2E', '#2D6A4F', '#f59e0b', '#22c55e', '#ffffff']}
        />
      </div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', bounce: 0.3 }}
        className="max-w-lg lg:max-w-2xl w-full relative z-10"
      >
        <div className="bg-white rounded-[2.5rem] shadow-[0_32px_80px_rgba(0,0,0,0.12)] overflow-hidden border border-[#E8E2D9]">
          <div className="bg-gradient-to-br from-[#1A3C2E] to-[#2D6A4F] p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <div className="w-48 h-48 bg-white rounded-full blur-[80px] absolute -top-16 -left-16" />
              <div className="w-48 h-48 bg-[#f59e0b] rounded-full blur-[80px] absolute bottom-0 right-0" />
            </div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.6, delay: 0.2 }}
              className="flex items-center justify-center mx-auto mb-4 relative z-10"
            >
              <CheckCircle className="w-14 h-14 text-white" strokeWidth={1.5} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="relative z-10"
            >
              <h1 className="text-3xl font-black text-white mb-2 tracking-tight">
                Enrollment Confirmed
              </h1>
              <p className="text-white/90 font-semibold mt-4 text-base">
                Start learning anytime — your access never expires.
              </p>
            </motion.div>
          </div>

          <div className="min-h-[100px]">
            <AnimatePresence>
              {invoiceData?.course && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mx-6 bg-white border border-[#E8E2D9] rounded-2xl p-4 shadow-sm flex items-center gap-4 relative z-20"
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-[#1A3C2E] flex items-center justify-center">
                    {invoiceData.course.thumbnail ? (
                      <Image
                        src={invoiceData.course.thumbnail}
                        alt={invoiceData.course.title}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <BookOpen className="w-8 h-8 text-white/60" />
                    )}
                  </div>
                  <div className="min-w-0">
                    {invoiceData.course.category && (
                      <p className="text-[10px] font-black text-[#2D6A4F] uppercase tracking-[1.5px] mb-0.5">
                        {invoiceData.course.category}
                      </p>
                    )}
                    <h3 className="font-black text-[#1A3C2E] text-sm leading-snug line-clamp-2">
                      {invoiceData.course.title}
                    </h3>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="p-8 pt-6 space-y-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-[#F8FDF9] rounded-2xl p-5 border border-[#D1FAE5] space-y-3"
            >
              <p className="text-[10px] font-black text-[#2D6A4F] uppercase tracking-[1.5px]">
                Enrollment Details
              </p>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-[#5D705C] font-medium">Invoice</span>
                  <span className="font-mono font-bold text-[#1A3C2E]">#{invoiceId}</span>
                </div>
                {invoiceData?.enrollmentCode && (
                  <div className="flex justify-between items-center">
                    <span className="text-[#5D705C] font-medium">Enrollment Code</span>
                    <span className="font-mono font-bold text-[#1A3C2E]">{invoiceData.enrollmentCode}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-[#5D705C] font-medium">Amount Paid</span>
                  <span className="font-bold text-[#1A3C2E]">
                    {loading ? '—' : invoiceData?.amount === 0 ? (
                      <span className="text-[#22c55e]">Free</span>
                    ) : (
                      `₹${invoiceData?.amount.toLocaleString()}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#5D705C] font-medium">Access</span>
                  <span className="font-bold text-[#22c55e]">Lifetime ♾️</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="space-y-4"
            >

              <div className="pt-2">
                <p className="text-[10px] font-black text-[#5D705C] uppercase tracking-[1.5px] mb-3">
                  Quick Start Guide
                </p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    { icon: PlayCircle, label: 'Watch Lessons', color: 'text-[#2D6A4F] bg-[#E8F5EE]' },
                    { icon: Award, label: 'Earn Certificate', color: 'text-[#f59e0b] bg-[#FFF8EB]' },
                    { icon: FileText, label: 'Take Notes', color: 'text-[#6366f1] bg-[#EEF2FF]' },
                  ].map(({ icon: Icon, label, color }) => (
                    <div key={label} className={`${color} rounded-xl p-3 flex flex-col items-center gap-1`}>
                      <Icon className="w-5 h-5" />
                      <p className="text-[10px] font-bold leading-tight">{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Your Evolution Blueprint */}
              {invoiceData?.topLessons && invoiceData.topLessons.length > 0 && (
                <div className="pt-2 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                  <p className="text-[10px] font-black text-[#5D705C] uppercase tracking-[1.5px] mb-4">
                    Your Evolution Blueprint
                  </p>
                  <div className="space-y-3">
                    {invoiceData.topLessons.map((lesson, idx) => (
                      <div key={lesson.id} className="group bg-white border border-[#E8E2D9] rounded-2xl p-4 flex items-center gap-4 hover:border-[#1A3C2E] transition-all">
                        <div className="w-8 h-8 rounded-full bg-[#1A3C2E]/5 flex items-center justify-center text-[#1A3C2E] font-black text-xs shrink-0 group-hover:bg-[#1A3C2E] group-hover:text-white transition-colors">
                          0{idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-[#1A3C2E] truncate uppercase tracking-tight">{lesson.title}</p>
                          <p className="text-[9px] font-black text-[#5D705C] opacity-60 uppercase tracking-widest mt-0.5">
                            {lesson.contentType?.toLowerCase() === 'video' ? `Video • ${lesson.duration || 10}m` : 'Project • Core Submission'}
                          </p>
                        </div>
                        <PlayCircle className="w-5 h-5 text-brand-orange opacity-0 group-hover:opacity-100 transition-all" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="space-y-3"
            >
              <button
                onClick={() => {
                  if (learnUrl.startsWith('http')) {
                    window.location.href = learnUrl;
                  } else {
                    router.push(learnUrl);
                  }
                }}
                className="w-full bg-[#1A3C2E] text-white py-5 rounded-2xl font-black uppercase tracking-[1.5px] text-sm shadow-xl hover:-translate-y-1 hover:bg-[#2D6A4F] transition-all flex items-center justify-center gap-3"
              >
                <PlayCircle className="w-5 h-5 fill-current" />
                START LEARNING NOW
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    triggerHaptic('warning');
                    setShowInvoiceAlert(true);
                  }}
                  className="flex items-center justify-center gap-2 py-3.5 bg-[#F5F0E8] border border-[#E8E2D9] rounded-xl text-[12px] font-bold text-[#1A3C2E] hover:bg-[#E8F5EE] transition-all w-full"
                >
                  <FileText className="w-4 h-4" />
                  Download Invoice
                </button>
                <Link
                  href="/dashboard"
                  className="flex items-center justify-center gap-2 py-3.5 bg-[#F5F0E8] border border-[#E8E2D9] rounded-xl text-[12px] font-bold text-[#1A3C2E] hover:bg-[#E8F5EE] transition-all"
                >
                  <BookOpen className="w-4 h-4" />
                  My Dashboard
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-[#5D705C] text-xs font-medium mt-6"
        >
          A confirmation email has been sent to{' '}
          <span className="text-[#1A3C2E] font-bold">
            {invoiceData?.student.email || 'your email'}
          </span>
        </motion.p>
      </motion.div>

      {/* Aesthetic Warning Alert Modal */}
      <AnimatePresence>
        {showInvoiceAlert && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop with premium blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInvoiceAlert(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            {/* Modal Card */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="bg-white rounded-[2.5rem] p-8 border border-[#E8E2D9] shadow-[0_32px_80px_rgba(0,0,0,0.18)] max-w-md w-full relative z-10 text-center overflow-hidden"
            >
              {/* Premium Glow effect */}
              <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="w-32 h-32 bg-[#f59e0b] rounded-full blur-[60px] absolute -top-10 -left-10" />
                <div className="w-32 h-32 bg-[#1A3C2E] rounded-full blur-[60px] absolute -bottom-10 -right-10" />
              </div>

              {/* Warning/Thinking Icon */}
              <div className="w-20 h-20 bg-[#F5F0E8] rounded-full flex items-center justify-center mx-auto mb-6 border border-[#E8E2D9] shadow-sm">
                <span className="text-3xl">🤔</span>
              </div>

              {/* Bold message */}
              <h3 className="text-xl font-black text-[#1A3C2E] mb-4 tracking-tight uppercase">
                Invoice Status Update
              </h3>
              <p className="text-slate-700 text-base font-bold leading-relaxed mb-6">
                Invoice is not given to you because we are still thinking should we give an invoice or not. If we agree, you will get it under 1 year.
              </p>

              {/* Action Button */}
              <button
                onClick={() => setShowInvoiceAlert(false)}
                className="w-full bg-[#1A3C2E] text-white py-4 rounded-xl font-black uppercase tracking-wider text-xs shadow-md hover:bg-[#2D6A4F] transition-all"
              >
                Understood
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Tactile animated printing Receipt modal */}
      <ReceiptSuccessModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        title={invoiceData?.course?.title || "Course Enrollment"}
        amount={invoiceData?.amount === 0 ? "FREE" : `₹${invoiceData?.amount.toLocaleString()}`}
        actionLabel={learnUrl.startsWith('http') ? "Go to Microsoft Learn" : "Start Learning"}
        onAction={() => {
          setIsReceiptOpen(false);
          if (learnUrl.startsWith('http')) {
            window.location.href = learnUrl;
          }
        }}
        details={[
          { label: "Candidate", value: invoiceData?.student?.name || "Student" },
          { label: "Email", value: invoiceData?.student?.email || "" },
          { label: "Invoice No", value: invoiceId, isMono: true },
          { label: "Enrollment Code", value: invoiceData?.enrollmentCode || "Pending", isMono: true },
          { label: "Access Status", value: "LIFETIME" },
        ]}
      />
    </div>
  );
}
