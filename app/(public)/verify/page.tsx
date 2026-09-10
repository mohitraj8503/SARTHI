'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ArrowRight, Loader2, Award, Search, ChevronRight } from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';

export default function CertificateVerifyIndexPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'id' | 'email'>('id');
  const [certId, setCertId] = useState('');
  const [email, setEmail] = useState('');
  const [certsList, setCertsList] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Standardized Parallax Orbs
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const orbs = document.querySelectorAll('.verify-orb');
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;

      orbs.forEach((orb, index) => {
        const speed = (index + 1) * 20;
        const xOffset = (0.5 - x) * speed;
        const yOffset = (0.5 - y) * speed;
        (orb as HTMLElement).style.transform = `translate(${xOffset}px, ${yOffset}px)`;
      });
    };
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = certId.trim();
    if (!trimmed) return;

    triggerHaptic('medium');
    setLoading(true);
    router.push(`/verify/${encodeURIComponent(trimmed)}`);
  };

  const handleEmailSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      setError('Please enter an email address');
      return;
    }
    setError('');
    setLoading(true);
    setCertsList(null);
    try {
      const res = await fetch(`/api/certificates/verify?email=${encodeURIComponent(trimmed)}`);
      const data = await res.json();
      if (res.ok) {
        setCertsList(data.certificates || []);
        if (!data.certificates || data.certificates.length === 0) {
          setError('No certificates found for this email address.');
        }
      } else {
        setError(data.error || 'Failed to search certificates.');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="induction-page-wrapper">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        
        .induction-page-wrapper {
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: linear-gradient(135deg, #FDFBF7 0%, #F8F5F0 100%);
          color: #1F2937;
          min-height: calc(100vh - 72px);
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
        }

        .induction-orbs {
          position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden;
        }

        .verify-orb {
          position: absolute; border-radius: 50%; opacity: 0.08;
          animation: induction-float 20s infinite ease-in-out;
          transition: transform 0.1s ease-out;
        }

        .induction-orb-1 { width: 600px; height: 600px; background: #1B4332; top: -200px; right: -100px; }
        .induction-orb-2 { width: 400px; height: 400px; background: #40916C; bottom: -100px; left: -100px; }

        @keyframes induction-float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 30px) scale(0.9); }
        }

        .induction-shell {
          position: relative; z-index: 10;
          max-width: 900px; width: 100%; margin: 0 auto;
          padding: 7.5rem 1.5rem 5rem;
        }

        .induction-hero { margin-bottom: 3rem; }

        .induction-badge {
          display: inline-flex; align-items: center; gap: 0.5rem;
          background: linear-gradient(135deg, rgba(27, 67, 50, 0.1) 0%, rgba(45, 106, 79, 0.1) 100%);
          color: #1B4332; padding: 0.625rem 1.25rem; border-radius: 50px;
          font-size: 0.875rem; font-weight: 600; margin-bottom: 1.5rem; letter-spacing: 0.5px;
        }

        .induction-title {
          font-size: clamp(2.5rem, 5vw, 4rem); font-weight: 800; color: #1B4332;
          line-height: 1.1; margin-bottom: 1.5rem; letter-spacing: -1px;
        }

        .induction-subtitle {
          font-size: 1.25rem; color: #6B7280; max-width: 650px; line-height: 1.7;
        }

        .verify-tabs {
          display: flex; gap: 0.5rem; background: #FCFBF8;
          padding: 0.375rem; border-radius: 12px;
          border: 1px solid #E5E7EB; margin-bottom: 2rem;
        }

        .verify-tab-btn {
          flex: 1; padding: 0.75rem; border-radius: 8px; font-size: 0.875rem;
          font-weight: 700; border: none; background: transparent; cursor: pointer;
          color: #6B7280; transition: all 0.25s ease;
        }

        .verify-tab-btn.active {
          background: #1B4332; color: white;
        }
      `}</style>

      {/* Floating background orbs */}
      <div className="induction-orbs">
        <div className="verify-orb induction-orb-1" />
        <div className="verify-orb induction-orb-2" />
      </div>

      <div className="induction-shell">
        {/* Hero Section */}
        <section className="induction-hero text-left">
          <div className="induction-badge">
            <ShieldCheck className="w-4 h-4 text-[#1B4332]" />
            <span>🔒 SECURE VERIFICATION</span>
          </div>
          <h1 className="induction-title">Verify Certificate</h1>
          <p className="induction-subtitle">
            Validate the authenticity of certifications issued by SARTHI. Enter your unique Certificate ID to verify credentials.
          </p>
        </section>

        {/* Verification Form Card Container */}
        <div className="p-6 sm:p-8 md:p-12 lg:p-16 bg-white/60 backdrop-blur-md rounded-[2.5rem] sm:rounded-[3rem] border border-white/80 shadow-xl text-left relative z-10">
          
          {/* Tabs */}
          <div className="verify-tabs">
            <button
              onClick={() => { setTab('id'); setError(''); setCertsList(null); }}
              className={`verify-tab-btn ${tab === 'id' ? 'active' : ''}`}
            >
              Certificate ID
            </button>
            <button
              onClick={() => { setTab('email'); setError(''); setCertsList(null); }}
              className={`verify-tab-btn ${tab === 'email' ? 'active' : ''}`}
            >
              Email Address
            </button>
          </div>

          {tab === 'id' ? (
            <form onSubmit={handleVerify} className="space-y-6">
              <div>
                <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest block mb-2">
                  Certificate / Verification ID
                </label>
                <input
                  type="text"
                  required
                  value={certId}
                  onChange={e => setCertId(e.target.value)}
                  placeholder="e.g. TT-PY-PRO-2026-000008"
                  className="w-full h-14 bg-white border border-[#E5E7EB] rounded-2xl px-5 text-sm font-semibold text-[#1F2937] focus:outline-none focus:border-[#1B4332] focus:ring-4 focus:ring-[#1B4332]/5 transition-all shadow-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-[#1B4332] hover:bg-[#2D6A4F] disabled:bg-gray-400 text-white font-bold rounded-2xl text-xs uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-[#1B4332]/20 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <Award className="w-4 h-4" />
                    <span>Verify Credential</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleEmailSearch} className="space-y-6">
              <div>
                <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest block mb-2">
                  Registered Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="e.g. student@example.com"
                  className="w-full h-14 bg-white border border-[#E5E7EB] rounded-2xl px-5 text-sm font-semibold text-[#1F2937] focus:outline-none focus:border-[#1B4332] focus:ring-4 focus:ring-[#1B4332]/5 transition-all shadow-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-[#1B4332] hover:bg-[#2D6A4F] disabled:bg-gray-400 text-white font-bold rounded-2xl text-xs uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-[#1B4332]/20 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                <span>Search Certificates</span>
              </button>
            </form>
          )}

          {error && <p className="text-red-500 text-xs font-bold mt-4">{error}</p>}

          {/* Results List */}
          {certsList && certsList.length > 0 && (
            <div className="mt-8 border-t border-gray-100 pt-6 space-y-3">
              <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block mb-2">Issued Certificates ({certsList.length}):</span>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {certsList.map(c => (
                  <div
                    key={c.id}
                    onClick={() => router.push(`/verify/${encodeURIComponent(c.id)}`)}
                    className="flex items-center justify-between p-4 bg-[#FCFBF8] hover:bg-[#1B4332]/5 border border-gray-100 hover:border-[#1B4332]/20 rounded-2xl cursor-pointer transition-all duration-300 group"
                  >
                    <div className="flex-1 min-w-0 pr-3">
                      <div className="font-bold text-sm text-[#1B4332] truncate">{c.title}</div>
                      <div className="text-[9px] text-gray-400 font-extrabold mt-0.5 uppercase tracking-wide">ID: {c.certificateNumber}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#1B4332] transition-transform transform group-hover:translate-x-1" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
