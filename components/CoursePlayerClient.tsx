'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UnifiedVideoPlayer } from './UnifiedVideoPlayer';
import CourseCompletionDialog from '@/components/dialogs/CourseCompletionDialog';
import { cn } from '@/lib/utils';

interface Lesson {
    id: string;
    title: string;
    videoUrl?: string | null;
    youtube_video_id?: string | null;
    youtubeVideoId?: string | null;
    muxPlaybackId?: string | null;
    position: number;
    duration?: number | null;
}

interface CoursePlayerClientProps {
    courseSlug: string;
    courseTitle: string;
    activeLesson: Lesson;
    lessons: Lesson[];
    initialProgress: number;
}

export default function CoursePlayerClient({
    courseSlug,
    courseTitle,
    activeLesson,
    lessons,
    initialProgress
}: CoursePlayerClientProps) {
    const router = useRouter();
    const [isZenMode, setIsZenMode] = useState(false);
    const [showCompletion, setShowCompletion] = useState(false);

    // Communicate Zen Mode to the parent layout/page
    useEffect(() => {
        if (isZenMode) {
            document.body.classList.add('zen-mode-active');
        } else {
            document.body.classList.remove('zen-mode-active');
        }
    }, [isZenMode]);

    const handleLessonComplete = () => {
        // Find next lesson
        const currentIndex = lessons.findIndex(l => l.id === activeLesson.id);
        const nextLesson = lessons[currentIndex + 1];

        if (nextLesson) {
            router.push(`/courses/${courseSlug}/learn?lessonId=${nextLesson.id}`);
        } else {
            // Last lesson — show completion celebration!
            setShowCompletion(true);
        }
    };

    const handleProgressUpdate = (progress: number) => {
        // Optional: Handle progress updates for analytics
        console.log(`Lesson progress: ${progress * 100}%`);
    };

    return (
        <>
            <CourseCompletionDialog
                isOpen={showCompletion}
                onClose={() => { setShowCompletion(false); router.refresh(); }}
                courseTitle={courseTitle}
                courseSlug={courseSlug}
                certificateUrl="/dashboard/certificates"
            />
            <UnifiedVideoPlayer
                src={activeLesson.videoUrl || undefined}
                youtubeId={activeLesson.youtubeVideoId || activeLesson.youtube_video_id || undefined}
                muxPlaybackId={activeLesson.muxPlaybackId || undefined}
                title={activeLesson.title}
                lessonId={activeLesson.id}
                courseId={courseSlug}
                initialProgress={initialProgress}
                onProgress={handleProgressUpdate}
                onComplete={handleLessonComplete}
                autoplay={false}
                muted={false}
                controls={true}
                playsInline={true}
                enableKeyboardShortcuts={true}
                enableMobileControls={true}
                captions={[]}
                isZenMode={isZenMode}
                onZenToggle={() => setIsZenMode(!isZenMode)}
                className={cn(
                    "rounded-[2rem] transition-all duration-500",
                    isZenMode && "rounded-none h-[calc(100vh-80px)]"
                )}
            />
        </>
    );
}

