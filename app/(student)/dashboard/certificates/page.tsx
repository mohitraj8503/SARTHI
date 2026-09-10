'use client';

import { useState, useEffect, useRef } from 'react';
import { PageHeader, StatCard, EmptyState } from '@/components/ui/DashboardUI';
import { Award, Download, Share2, Calendar, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { downloadCertificateAsPdf } from '@/lib/client-certificate-export';

function CertificatePreview({ htmlSnapshot, title }: { htmlSnapshot: string; title: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.35);

  useEffect(() => {
    if (!containerRef.current) return;
    const handleResize = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        setScale(width / 1050);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div ref={containerRef} className="w-full relative overflow-hidden aspect-[4/3] rounded-[24px] bg-[#0f172a]">
      <iframe
        srcDoc={htmlSnapshot}
        title={title}
        sandbox="allow-same-origin allow-popups"
        className="absolute top-0 left-0 border-0 pointer-events-none origin-top-left"
        style={{
          width: '1050px',
          height: '787.5px',
          transform: `scale(${scale})`,
        }}
      />
    </div>
  );
}

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/student/certificates')
      .then(res => {
        if (!res.ok) throw new Error('API_ERROR');
        return res.json();
      })
      .then(data => {
        setCertificates(data.certificates || []);
        setLoading(false);
      })
      .catch(() => {
        setCertificates([]);
        setLoading(false);
      });
  }, []);

  const totalEarned = certificates.length;

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-20">
      {/* Unified Header */}
      <PageHeader
        title="MY CERTIFICATES"
        subtitle="Validate your expertise with production-grade credentials."
      />

      <div className="max-w-7xl mx-auto px-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
          <StatCard
            icon={<Award className="w-6 h-6 text-[#D4915C]" />}
            label="Total Credentials"
            value={totalEarned}
            sublabel="Issued"
            index={0}
          />
          <StatCard
            icon={<Calendar className="w-6 h-6 text-[#1B4332]" />}
            label="Courses Completed"
            value={totalEarned}
            sublabel="100% Finished"
            index={1}
          />
          <StatCard
            icon={<Award className="w-6 h-6 text-emerald-600" />}
            label="Platform XP"
            value={totalEarned * 100}
            sublabel="Accumulated"
            index={2}
          />
        </div>

        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-black text-[#1B4332] uppercase tracking-tight font-outfit">
            Verified Credentials
          </h3>
          <div className="flex gap-2">
            <button className="px-6 py-2 bg-[#1B4332] text-white rounded-xl text-xs font-black uppercase tracking-widest">Grid View</button>
            <button className="px-6 py-2 bg-white text-gray-400 rounded-xl text-xs font-black uppercase tracking-widest border border-gray-100 shadow-sm">List View</button>
          </div>
        </div>

        {/* Content - Mobile Single Column Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-[#1B4332] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : certificates.length === 0 ? (
          <EmptyState
            icon={<Award className="w-12 h-12 text-gray-300" />}
            title="No Credentials Found"
            message="Your professional achievements will automatically appear here once you successfully complete your course curriculum or certification exams."
            buttonText="Browse My Courses"
            buttonHref="/dashboard/courses"
            buttonIcon={<Search className="w-5 h-5" />}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {(certificates || []).map((cert: any, idx: number) => (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-[32px] md:rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group overflow-hidden"
              >
                {/* Certificate thumbnail preview */}
                {(cert.htmlSnapshot || cert.imageUrl) ? (
                  <div className="relative w-full overflow-hidden" style={{ aspectRatio: '4/3', background: '#0f172a' }}>
                    {cert.htmlSnapshot ? (
                      <CertificatePreview
                        htmlSnapshot={cert.htmlSnapshot}
                        title={cert.courseTitle}
                      />
                    ) : (
                      <img src={cert.imageUrl} alt={cert.courseTitle} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <a
                        href={`/verify/${cert.certificateNumber || cert.verificationId || cert.id}`}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white text-[#1B4332] rounded-xl font-black uppercase tracking-widest text-[9px] hover:scale-105 transition-transform shadow-lg"
                      >
                        View Full Certificate
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start p-6 md:p-8 pb-0">
                    <div className="w-14 h-14 md:w-16 md:h-16 bg-[#D4915C]/10 rounded-[1.2rem] md:rounded-[1.5rem] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Award className="w-7 h-7 md:w-8 md:h-8 text-[#D4915C]" />
                    </div>
                    <span className="px-3 py-1 md:px-4 md:py-1.5 bg-emerald-50 text-emerald-700 text-[9px] md:text-[10px] font-black uppercase tracking-[1px] md:tracking-[2px] rounded-full border border-emerald-100">
                      VERIFIED
                    </span>
                  </div>
                )}

                <div className="p-5 md:p-6">
                  {(cert.htmlSnapshot || cert.imageUrl) && (
                    <div className="flex justify-between items-center mb-3">
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase tracking-[2px] rounded-full border border-emerald-100">VERIFIED</span>
                    </div>
                  )}
                  <h4 className="text-[18px] md:text-xl font-black text-[#1B4332] mb-1 font-outfit uppercase leading-tight line-clamp-2 italic">{cert.courseTitle || cert.course?.title}</h4>
                  <p className="text-xs text-gray-400 font-bold mb-4 uppercase tracking-widest italic opacity-60">
                    {cert.certificateNumber && <span className="block text-[9px] font-mono tracking-wider mb-1 opacity-80">{cert.certificateNumber}</span>}
                    Issued {new Date(cert.issuedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                  <div className="flex gap-3 md:gap-4">
                    {cert.status === 'PENDING_PAYMENT' ? (
                      <a
                        href={`/verify/${cert.verificationId || cert.certNumber || cert.id}`}
                        className="flex-1 flex items-center justify-center gap-3 h-[50px] md:h-14 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-[2px] shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 transition-all text-[11px] italic"
                      >
                        <Award className="w-4 h-4" /> UNLOCK CERTIFICATE
                      </a>
                    ) : cert.htmlSnapshot ? (
                      <button
                        onClick={() => {
                          if (cert.htmlSnapshot) {
                            downloadCertificateAsPdf(cert.htmlSnapshot);
                          } else if (cert.downloadUrl) {
                            window.open(cert.downloadUrl, '_blank');
                          } else {
                            window.location.href = `/verify/${cert.certificateNumber || cert.id}`;
                          }
                        }}
                        className="flex-1 flex items-center justify-center gap-3 h-[50px] md:h-14 bg-[#1B4332] text-white rounded-2xl font-black uppercase tracking-[2px] shadow-xl shadow-[#1B4332]/20 hover:bg-[#2D6A4F] transition-all text-[11px] italic"
                      >
                        <Download className="w-4 h-4 group-hover/btn:scale-110 transition-transform" /> DOWNLOAD PDF
                      </button>
                    ) : (
                      <a
                        href={cert.downloadUrl || `/verify/${cert.certificateNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-3 h-[50px] md:h-14 bg-[#1B4332] text-white rounded-2xl font-black uppercase tracking-[2px] shadow-xl shadow-[#1B4332]/20 hover:bg-[#2D6A4F] transition-all text-[11px] italic"
                      >
                        <Download className="w-4 h-4 group-hover/btn:scale-110 transition-transform" /> DOWNLOAD PDF
                      </a>
                    )}
                    {cert.status !== 'PENDING_PAYMENT' && (
                      <a
                        href={`/verify/${cert.certificateNumber || cert.verificationId || cert.id}`}
                        className="w-[50px] h-[50px] md:w-14 md:h-14 flex items-center justify-center bg-gray-50 text-[#1B4332] rounded-2xl hover:text-[#D4915C] hover:bg-white border border-transparent hover:border-gray-100 transition-all shadow-sm"
                        title="Verify Certificate"
                      >
                        <Share2 className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
