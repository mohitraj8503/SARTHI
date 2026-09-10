'use client';

import React, { useState } from 'react';
import { Award, CheckCircle, Clock, ExternalLink, Shield, Download, FileText, Search, Eye, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface TabCertificationsProps {
  data: any;
}

export default function TabCertifications({ data }: TabCertificationsProps) {
  const certificates = data?.certificates || [];
  const availableCertifications = data?.discovery?.trendingCourses?.filter((c: any) => c.category === 'Certification') || [];
  const [previewCert, setPreviewCert] = useState<any | null>(null);

  return (
    <div className="space-y-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#D4915C]/10 rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6 text-[#D4915C]" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4915C]">Credentials Terminal</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-[#1B4332] italic uppercase tracking-tighter">My Certifications</h2>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-[11px]">Verify and manage your professional industry-grade credentials</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white px-6 py-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Earned</p>
              <p className="text-2xl font-black text-[#1B4332]">{certificates.length}</p>
            </div>
            <div className="w-10 h-10 bg-[#1B4332]/5 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#1B4332]" />
            </div>
          </div>
        </div>
      </div>

      {/* Earned Certificates Grid */}
      <div className="space-y-6">
        <h3 className="text-xl font-black text-[#1B4332] italic uppercase tracking-tight px-2">Earned Credentials</h3>

        {certificates.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {certificates.map((cert: any, idx: number) => (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden"
              >
                {/* Certificate Preview Thumbnail */}
                {(cert.htmlSnapshot || cert.imageUrl) && (
                  <div className="relative w-full overflow-hidden" style={{ aspectRatio: '4/3', background: '#0f172a' }}>
                    {cert.htmlSnapshot ? (
                      <iframe
                        srcDoc={cert.htmlSnapshot}
                        title={cert.courseTitle}
                        sandbox="allow-same-origin"
                        style={{ width: '100%', height: '100%', border: 0, display: 'block', pointerEvents: 'none' }}
                      />
                    ) : (
                      <img
                        src={cert.imageUrl}
                        alt={cert.courseTitle}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                    )}
                    {/* Overlay with preview button */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button
                        onClick={() => setPreviewCert(cert)}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-[#1B4332] rounded-xl font-black uppercase tracking-widest text-[9px] hover:scale-105 transition-transform shadow-lg"
                      >
                        <Eye className="w-3 h-3" /> Preview
                      </button>
                      <Link
                        href={`/certification-exams/verify/${cert.certificateNumber}`}
                        className="flex items-center gap-2 px-4 py-2 bg-[#1B4332] text-white rounded-xl font-black uppercase tracking-widest text-[9px] hover:scale-105 transition-transform shadow-lg"
                      >
                        <ExternalLink className="w-3 h-3" /> Verify
                      </Link>
                    </div>
                  </div>
                )}

                <div className="p-6">
                  <div className={`flex gap-4 items-start ${!(cert.htmlSnapshot || cert.imageUrl) ? '' : ''}`}>
                    {!(cert.htmlSnapshot || cert.imageUrl) && (
                      <div className="w-16 h-16 bg-[#FAF9F6] rounded-2xl flex items-center justify-center shrink-0 border border-gray-50 group-hover:border-[#D4915C]/20 transition-colors">
                        <Award className="w-8 h-8 text-[#1B4332]/20 group-hover:text-[#D4915C] transition-colors" />
                      </div>
                    )}

                    <div className="flex-1 space-y-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle className="w-3 h-3 text-emerald-500" />
                          <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Verified Credential</span>
                        </div>
                        <h4 className="text-base font-black text-[#1B4332] uppercase italic leading-tight">{cert.courseTitle}</h4>
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-1">
                          ID: {cert.certificateNumber}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <Clock className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">
                            {new Date(cert.issuedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-1">
                        <a
                          href={cert.downloadUrl || `/api/pdf/${cert.certificateNumber}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-2.5 bg-[#1B4332] text-white rounded-xl font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-2 hover:bg-[#D4915C] transition-all shadow-lg shadow-[#1B4332]/10"
                        >
                          <Download className="w-3 h-3" /> Download PDF
                        </a>
                        <Link
                          href={`/certification-exams/verify/${cert.certificateNumber}`}
                          className="px-3 py-2.5 bg-gray-50 text-[#1B4332] rounded-xl font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-1.5 hover:bg-gray-100 transition-all"
                        >
                          <ExternalLink className="w-3 h-3" /> Verify
                        </Link>
                        {(cert.htmlSnapshot || cert.imageUrl) && (
                          <button
                            onClick={() => setPreviewCert(cert)}
                            className="px-3 py-2.5 bg-gray-50 text-[#1B4332] rounded-xl font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-1.5 hover:bg-gray-100 transition-all"
                          >
                            <Eye className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[40px] p-20 text-center border-2 border-dashed border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-[#FAF9F6] rounded-full flex items-center justify-center mx-auto mb-8">
              <Award className="w-10 h-10 text-gray-200" />
            </div>
            <h4 className="text-xl font-black text-[#1B4332] uppercase italic">No Credentials Yet</h4>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[11px] mt-2 mb-8 max-w-xs mx-auto">
              Complete your professional tracks to earn industry-grade certifications.
            </p>
            <Link href="/dashboard?tab=courses" className="inline-flex px-10 py-4 bg-[#1B4332] text-white rounded-2xl font-black uppercase tracking-widest text-[11px] italic shadow-xl shadow-[#1B4332]/20 hover:bg-[#D4915C] transition-all">
              Continue Learning <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        )}
      </div>

      {/* Available Certifications */}
      <div className="space-y-6 pt-8">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-xl font-black text-[#1B4332] italic uppercase tracking-tight">Available Path Certifications</h3>
          <Link href="/certification-exams" className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-[#1B4332] transition-colors flex items-center gap-2 italic">
            View Public Catalog <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(availableCertifications.length > 0 ? availableCertifications : data?.courses?.slice(0, 3) || []).map((path: any, idx: number) => (
            <Link key={path.id} href={`/courses/${path.slug || path.id}`} className="group">
              <div className="bg-white rounded-[28px] border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                <div className="aspect-video relative overflow-hidden bg-gray-100">
                  {path.thumbnail ? (
                    <img src={path.thumbnail} alt={path.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FileText className="w-8 h-8 text-gray-200" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4 px-3 py-1 bg-black/80 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest rounded-full italic">
                    Certification Path
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <h5 className="font-black text-[#1B4332] text-sm md:text-base uppercase italic leading-tight group-hover:text-[#D4915C] transition-colors line-clamp-2">{path.title}</h5>
                  <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                    <span className="text-[10px] font-black text-[#D4915C] uppercase tracking-widest">{path.price}</span>
                    <div className="flex items-center gap-1.5 bg-[#1B4332]/5 px-3 py-1 rounded-full">
                      <Search className="w-3 h-3 text-[#1B4332]" />
                      <span className="text-[9px] font-black text-[#1B4332] uppercase tracking-widest">Enroll</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Certificate Preview Modal */}
      <AnimatePresence>
        {previewCert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setPreviewCert(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="relative w-full max-w-4xl"
              style={{
                background: 'rgba(15,23,42,0.6)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 24,
                padding: '20px',
              }}
            >
              <button
                onClick={() => setPreviewCert(null)}
                className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-10"
              >
                <X className="w-4 h-4 text-gray-800" />
              </button>
              <div style={{ width: '100%', aspectRatio: '4/3', borderRadius: 16, overflow: 'hidden' }}>
                {previewCert.htmlSnapshot ? (
                  <iframe
                    srcDoc={previewCert.htmlSnapshot}
                    title={previewCert.courseTitle}
                    sandbox="allow-same-origin"
                    style={{ width: '100%', height: '100%', border: 0, display: 'block' }}
                  />
                ) : previewCert.imageUrl ? (
                  <img src={previewCert.imageUrl} alt={previewCert.courseTitle} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : null}
              </div>
              <div className="flex gap-3 mt-4 justify-center">
                <a
                  href={previewCert.downloadUrl || `/api/pdf/${previewCert.certificateNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-600 transition-all shadow-lg"
                >
                  <Download className="w-3.5 h-3.5" /> Download Official PDF
                </a>
                <Link
                  href={`/certification-exams/verify/${previewCert.certificateNumber}`}
                  className="flex items-center gap-2 px-6 py-3 bg-white text-[#1B4332] rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-50 transition-all shadow-lg"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Open Verify Page
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ArrowRight({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>;
}
