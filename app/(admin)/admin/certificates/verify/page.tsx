'use client';

import { useState } from 'react';
import { Search, CheckCircle, XCircle, Award, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CertificateVerificationPage() {
  const [certificateId, setCertificateId] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certificateId.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch(`/api/certificates/verify?id=${certificateId}`);
      if (!res.ok) {
        if (res.status === 404) throw new Error('Certificate not found');
        throw new Error('Verification failed');
      }
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            Certificate Validation
            <Award className="w-8 h-8 text-brand-orange" />
          </h1>
          <p className="text-gray-500 font-medium mt-1">
            Verify authenticity of issued credentials
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Verification Form */}
        <div className="bg-white dark:bg-gray-800 p-10 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700">
          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                Certificate ID / Number
              </label>
              <div className="relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={certificateId}
                  onChange={(e) => setCertificateId(e.target.value)}
                  placeholder="e.g. CERT-2024-XYZ"
                  className="w-full pl-14 pr-6 py-5 bg-gray-50 dark:bg-gray-900 rounded-2xl text-lg font-bold text-gray-900 dark:text-white border-2 border-transparent focus:border-brand-orange focus:bg-white dark:focus:bg-black transition-all"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || !certificateId}
              className="w-full py-5 bg-brand-orange text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-brand-orange/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Verify Credential</>}
            </button>
          </form>
        </div>

        {/* Result Area */}
        <div className="flex items-center justify-center">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center p-10"
              >
                <div className="w-24 h-24 bg-red-50 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <XCircle className="w-12 h-12 text-red-500" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
                  Invalid Certificate
                </h3>
                <p className="text-gray-500">{error}</p>
              </motion.div>
            )}

            {result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-700 w-full max-w-md relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />

                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 bg-green-50 dark:bg-green-900/30 rounded-2xl flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white">
                      Verified Valid
                    </h3>
                    <p className="text-xs font-bold text-green-600 uppercase tracking-widest">
                      Official Record Found
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                      Student
                    </p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {result.user?.name || 'Unknown'}
                    </p>
                    <p className="text-xs text-gray-500">{result.user?.email}</p>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                      Course
                    </p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {result.course?.title}
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                        Issued
                      </p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {new Date(result.issuedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {result.certificateUrl && (
                    <a
                      href={result.certificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-center rounded-xl font-bold text-sm uppercase tracking-widest hover:scale-[1.02] transition-transform"
                    >
                      View Original
                    </a>
                  )}
                </div>
              </motion.div>
            )}

            {!result && !error && !loading && (
              <div className="text-center opacity-30">
                <Award className="w-32 h-32 mx-auto mb-4" />
                <p className="font-black text-xl">Enter ID to verify</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

