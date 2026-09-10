'use client'

import { useState, useEffect, useRef } from 'react';
import { ContentRenderer } from '../common/ContentRenderer';
import { markLessonComplete, saveProgress } from '@/lib/services/learning';

interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'document' | 'quiz' | 'assignment';
  contentUrl: string;
}

/**
 * Enterprise Lesson Player
 * Mobile-optimized, supporting video and document content with auto-progression.
 */
export function LessonPlayer({ lesson, onComplete }: { lesson: Lesson; onComplete: () => void }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const playerRef = useRef<HTMLVideoElement>(null);

  // Sync video progress with the server and track completion
  useEffect(() => {
    const video = playerRef.current;
    if (!video || lesson.type !== 'video') return;
    
    const handleEnd = () => {
      markLessonComplete(lesson.id);
      setProgress(100);
      onComplete();
    };
    
    const handleTimeUpdate = () => {
      const currentProgress = (video.currentTime / video.duration) * 100;
      setProgress(currentProgress);
      
      // Auto-save progress every 30s of watch time
      if (Math.floor(video.currentTime) % 30 === 0 && video.currentTime > 0) {
        saveProgress(lesson.id, currentProgress / 100);
      }
    };

    video.addEventListener('ended', handleEnd);
    video.addEventListener('timeupdate', handleTimeUpdate);
    
    return () => {
      video.removeEventListener('ended', handleEnd);
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [lesson.id, lesson.type, onComplete]);

  // For documents, we allow manual completion or scroll-based completion
  const handleDocumentComplete = async () => {
    await markLessonComplete(lesson.id);
    setProgress(100);
    onComplete();
  };

  return (
    <div className="lesson-player space-y-6">
      <div className="overflow-hidden rounded-2xl bg-slate-900 shadow-2xl">
        {lesson.type === 'video' ? (
          <video
            ref={playerRef}
            src={lesson.contentUrl}
            className="w-full aspect-video object-cover"
            controls
            controlsList="nodownload"
            preload="metadata"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            playsInline
          />
        ) : (
          <div className="bg-white p-6 md:p-10">
            <article className="prose prose-slate max-w-none">
              <ContentRenderer content={lesson.contentUrl} />
            </article>
          </div>
        )}
      </div>
      
      {/* Visual Feedback: Progress and Controls */}
      <div className="px-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            {lesson.type === 'video' ? 'Video Progress' : 'Reading Content'}
          </span>
          <span className="text-xs font-black text-emerald-600">
            {Math.round(progress)}% Complete
          </span>
        </div>
        
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-emerald-600 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(16,185,129,0.5)]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      
      {/* Learning CTA: Accessible for touch devices */}
      <button
        onClick={lesson.type === 'video' ? onComplete : handleDocumentComplete}
        disabled={progress < 90 && lesson.type === 'video'}
        className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-[0.98] shadow-xl 
                   ${progress >= 90 || lesson.type !== 'video'
                     ? 'bg-emerald-800 text-white shadow-emerald-900/20 hover:bg-emerald-900' 
                     : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'}`}
      >
        {progress >= 90 || lesson.type !== 'video' ? 'Continue to Next Lesson →' : `Watch ${100 - Math.round(progress)}% more to unlock`}
      </button>
    </div>
  );
}
