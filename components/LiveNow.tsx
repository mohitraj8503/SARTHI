'use client';

import { motion } from 'framer-motion';
import { Play, Users, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import { storage } from '@/lib/storage';

interface LiveSeminar {
  id: string;
  title: string;
  startTime: string;
  meetingLink: string;
  instructor: {
    name: string;
    image: string;
  };
}

export default function LiveNow() {
  const { data: seminar, isLoading } = useQuery<LiveSeminar | null>({
    queryKey: ['liveSeminar'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      const seminars = storage.list<LiveSeminar>('seminars:', true);
      // Return the first one for now, or find one that is live
      return seminars.length > 0 ? seminars[0] : null;
    },
    refetchInterval: 5000
  });

  if (isLoading || !seminar) return null; // Or return a different visual state if no seminar

  return (
    <section id="seminars" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-400 font-semibold text-lg">LIVE NOW</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Join Our Live Seminar
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Learn from industry experts in real-time. Interactive sessions with Q&A and networking opportunities.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 md:p-12"
        >
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                {seminar.title}
              </h3>
              <p className="text-gray-300 mb-6">
                Join {seminar.instructor.name} for this exclusive live session.
              </p>

              <div className="flex items-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-400" />
                  <span className="text-gray-300">200+ registered</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-400" />
                  <span className="text-gray-300">
                    {new Date(seminar.startTime) > new Date()
                      ? `Starting in ${formatDistanceToNow(new Date(seminar.startTime))}`
                      : 'Started ' + formatDistanceToNow(new Date(seminar.startTime), { addSuffix: true })}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href={seminar.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Play className="h-5 w-5" />
                  Join Live Session
                </a>
                <button className="bg-slate-700/50 backdrop-blur-sm border border-slate-600 hover:bg-slate-600/50 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300">
                  View Schedule
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-video bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg overflow-hidden relative">
                {seminar.instructor.image && (
                  <Image
                    src={seminar.instructor.image}
                    alt={seminar.instructor.name}
                    fill
                    quality={85}
                    sizes="(max-width: 768px) 100vw, 600px"
                    className="object-cover"
                  />
                )}
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mb-4 mx-auto cursor-pointer hover:scale-110 transition-transform">
                      <Play className="h-8 w-8 text-white ml-1" />
                    </div>
                    <p className="text-gray-400 font-semibold drop-shadow-md">Live Stream</p>
                  </div>
                </div>
                <div className="absolute top-4 left-4 z-20">
                  <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2 shadow-lg">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    LIVE
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

