'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Plus, ThumbsUp, Check, ShieldCheck, ArrowRight } from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';

interface RequestedTopic {
  id: string;
  title: string;
  category: string;
  votes: number;
  voted: boolean;
}

const INITIAL_REQUESTS: RequestedTopic[] = [
  { id: '1', title: 'Algorithmic Trading & Quantitative Finance using Python', category: 'Finance & Taxation', votes: 243, voted: false },
  { id: '2', title: 'Kubernetes & Docker Orchestration for Production Scaling', category: 'AI & Programming', votes: 198, voted: false },
  { id: '3', title: 'GST Practitioner Case Studies & Advanced Returns Filing', category: 'Finance & Taxation', votes: 165, voted: false },
  { id: '4', title: 'Custom GPT Assistants & LLM API Integration Mastery', category: 'AI & Programming', votes: 154, voted: false }
];

export default function DemandCoursePage() {
  const [requests, setRequests] = useState<RequestedTopic[]>(INITIAL_REQUESTS);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('AI & Programming');
  const [success, setSuccess] = useState(false);

  // Standardized Parallax Orbs
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const orbs = document.querySelectorAll('.demand-orb');
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

  const handleVote = (id: string) => {
    triggerHaptic('light');
    setRequests(prev => prev.map(req => {
      if (req.id === id) {
        return {
          ...req,
          votes: req.voted ? req.votes - 1 : req.votes + 1,
          voted: !req.voted
        };
      }
      return req;
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    triggerHaptic('medium');
    const newRequest: RequestedTopic = {
      id: Date.now().toString(),
      title: title.trim(),
      category: category,
      votes: 1,
      voted: true
    };

    setRequests(prev => [newRequest, ...prev]);
    setTitle('');
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="induction-page-wrapper">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        
        .induction-page-wrapper {
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: linear-gradient(135deg, #FDFBF7 0%, #F8F5F0 100%);
          color: #1F2937;
          min-height: calc(100vh - 60px);
          position: relative;
        }

        .induction-orbs {
          position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden;
        }

        .demand-orb {
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
          max-width: 1600px; margin: 0 auto;
          padding: 8rem 2rem 6rem;
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

        .induction-grid {
          display: grid; grid-template-cols: repeat(auto-fill, minmax(360px, 1fr)); gap: 2.5rem;
        }
      `}</style>

      {/* Floating background orbs */}
      <div className="induction-orbs">
        <div className="demand-orb induction-orb-1" />
        <div className="demand-orb induction-orb-2" />
      </div>

      <div className="induction-shell">
        {/* Hero Section */}
        <section className="induction-hero text-left">
          <div className="induction-badge">
            <span>💡 VOTE & SUGGEST</span>
          </div>
          <h1 className="induction-title">Demand a Course</h1>
          <p className="induction-subtitle">
            Suggest topics you want our expert instructors to cover, or vote on community requests. We build the highest demanded tracks.
          </p>
        </section>

        {/* Suggest Form Container (Matching creator track styling) */}
        <div className="p-6 sm:p-8 md:p-12 lg:p-16 bg-white/60 backdrop-blur-md rounded-[2.5rem] sm:rounded-[3rem] border border-white/80 shadow-xl mb-12 text-left relative z-10">
          <div className="space-y-4 max-w-3xl mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#40916C]/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-[#40916C]">
              ⚡ REQUEST PATH
            </div>
            <h2 className="text-2xl font-extrabold text-[#1B4332] tracking-tight uppercase">
              Suggest a New Topic
            </h2>
            <p className="text-sm text-gray-600 font-medium">
              Submit your specific curriculum suggestions. Once a topic gains enough community upvotes, our content specialists build and launch it.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest block mb-2">
                Course Title / Topic Name
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Advanced Next.js Microfrontends"
                className="w-full h-14 bg-white border border-[#E5E7EB] rounded-2xl px-5 text-sm font-semibold text-[#1F2937] focus:outline-none focus:border-[#1B4332] focus:ring-4 focus:ring-[#1B4332]/5 transition-all shadow-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest block mb-2">
                  Category
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full h-14 bg-white border border-[#E5E7EB] rounded-xl px-4 text-sm font-semibold text-[#1F2937] focus:outline-none focus:border-[#1B4332] transition-all shadow-sm"
                >
                  <option>AI & Programming</option>
                  <option>Finance & Taxation</option>
                  <option>Excel & Data Science</option>
                  <option>Industrial Automation</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full h-14 bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-bold rounded-2xl text-xs uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-[#1B4332]/20 flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Submit Suggestion</span>
                </button>
              </div>
            </div>
          </form>

          {/* Success Banner */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Your request has been added and upvoted!</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Requests Grid (Unified Card Structure) */}
        <div className="text-left relative z-10">
          <h3 className="text-lg md:text-xl font-extrabold text-[#1B4332] mb-6">Popular Community Demands</h3>
          
          <div className="induction-grid">
            {requests.map((req, index) => (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ 
                  duration: 0.8,
                  ease: [0.16, 1, 0.3, 1],
                  delay: (index % 2) * 0.1 
                }}
                className="group bg-white rounded-[2.5rem] overflow-hidden shadow-[0_20px_60px_-15px_rgba(27,67,50,0.1)] hover:shadow-[0_30px_80px_-20px_rgba(27,67,50,0.2)] transition-all duration-500 border border-white flex flex-col justify-between p-8 min-h-[220px]"
              >
                <div>
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#40916C] mb-4">
                    <Lightbulb className="w-3.5 h-3.5" />
                    {req.category}
                  </div>
                  <h4 className="text-base font-extrabold text-[#1F2937] leading-tight mb-6 line-clamp-3">
                    {req.title}
                  </h4>
                </div>

                <div className="pt-4 border-t border-[#F3F4F6] flex items-center justify-between gap-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mb-1">Upvotes</span>
                    <span className="text-base md:text-lg font-black text-[#1B4332]">{req.votes} Votes</span>
                  </div>
                  
                  <button
                    onClick={() => handleVote(req.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3.5 font-bold rounded-xl text-[10px] uppercase tracking-widest active:scale-95 transition-all shadow-lg ${
                      req.voted
                        ? 'bg-[#40916C]/10 border border-[#40916C] text-[#40916C] shadow-none'
                        : 'bg-[#1B4332] text-white hover:bg-[#2D6A4F] shadow-[#1B4332]/20'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{req.voted ? 'Upvoted' : 'Upvote Track'}</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
