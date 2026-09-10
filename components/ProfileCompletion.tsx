'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import Link from 'next/link';



export default function ProfileCompletion({
  user,
}: {
  user: {
    id?: string;
    name?: string | null;
    username?: string | null;
    image?: string | null;
    bio?: string | null;
    headline?: string | null;
    location?: string | null;
    socialLinks?: any;
    role: string;
  };
}) {
  const [isVisible, setIsVisible] = useState(true);

  // Check completion (Matching logic with Profile Page)
  const missingFields: string[] = [];
  if (!user.name) missingFields.push('Name');
  if (!user.username) missingFields.push('Username');
  if (!user.bio) missingFields.push('Bio');
  if (!user.headline) missingFields.push('Headline');
  if (!user.location) missingFields.push('Location');
  if (!user.image) missingFields.push('Photo');
  
  // Check if at least one social link exists
  const hasSocials = user.socialLinks && 
    (user.socialLinks.twitter || user.socialLinks.github || user.socialLinks.linkedin || user.socialLinks.website);
  if (!hasSocials) missingFields.push('Social Links');

  const total = 7;
  const filled = total - missingFields.length;
  const percentage = Math.round((filled / total) * 100);

  if (filled === total || !isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-8 relative overflow-hidden group"
      >
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-4 right-4 text-gray-300 hover:text-gray-500 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col sm:flex-row gap-6 items-center">
          <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-gray-100"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              />
              <path
                className={percentage < 50 ? 'text-brand-orange' : 'text-green-500'}
                strokeDasharray={`${percentage}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className={`text-sm font-black ${percentage < 50 ? 'text-brand-orange' : 'text-green-600'}`}>
                {percentage}%
              </span>
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-lg font-black text-brand-dark mb-1">Finish Setting Up</h3>
            <p className="text-sm text-gray-500 font-medium mb-4 max-w-md">
              Your profile is {percentage}% complete. Add <span className="text-brand-dark font-bold">{missingFields[0]}</span> 
              {missingFields.length > 1 && ` and ${missingFields.length - 1} more`} to unlock full access.
            </p>
            <Link
              href={user.role === 'TEACHER' ? '/teacher/profile' : '/student/profile'}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-dark text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-brand-orange transition-all shadow-lg shadow-brand-dark/10"
            >
              Complete Profile <Check className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

