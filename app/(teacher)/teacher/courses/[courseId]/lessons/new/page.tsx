'use client';

import { useState, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { Loader2, Save, X, Plus, Trash2, FileText } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';

export default function AddLessonPage(props: { params: Promise<{ courseId: string }> }) {
  const params = use(props.params);
  const { courseId } = params;
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = (searchParams?.get('type') as 'assignment' | 'quiz' | 'video' | 'note' | 'live-session') || 'assignment';
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  const [lesson, setLesson] = useState({
    title: '',
    description: '',
    dueDate: '',
    maxScore: '100',
    questions: [] as { question: string; options: string[]; correctAnswer: number }[],
    // Added for video:
    videoUrl: '',
    duration: 60,
    // Added for note:
    file: null as File | null,
    // Added for live-session:
    scheduledDate: '',
    scheduledTime: '',
    privacy: 'enrolled',
  });

  // Quiz state helpers
  const [currentQuestion, setCurrentQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
  });

  const addQuestion = () => {
    if (!currentQuestion.question || currentQuestion.options.some((o) => !o)) {
      addToast({ message: 'Fill all question fields', type: 'error' });
      return;
    }
    setLesson((prev) => ({
      ...prev,
      questions: [...prev.questions, { ...currentQuestion }],
    }));
    setCurrentQuestion({ question: '', options: ['', '', '', ''], correctAnswer: 0 });
  };

  const removeQuestion = (index: number) => {
    setLesson((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lesson.title) {
      addToast({ message: 'Title is required', type: 'error' });
      return;
    }
    if (type === 'quiz' && lesson.questions.length === 0) {
      addToast({ message: 'Add at least one question', type: 'error' });
      return;
    }
    if (type === 'note' && !lesson.file) {
        addToast({ message: 'Please upload a file', type: 'error' });
        return;
    }
    if (type === 'live-session' && (!lesson.scheduledDate || !lesson.scheduledTime)) {
        addToast({ message: 'Date and time are required for live sessions', type: 'error' });
        return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('courseId', courseId);
      formData.append('title', lesson.title);
      formData.append('description', lesson.description);
      formData.append('contentType', type);
      formData.append('isPublished', 'true');

      if (type === 'assignment') {
        if (lesson.dueDate) formData.append('dueDate', new Date(lesson.dueDate).toISOString());
        formData.append('maxScore', lesson.maxScore);
      } else if (type === 'quiz') {
        formData.append('questions', JSON.stringify(lesson.questions));
      } else if (type === 'video') {
        formData.append('videoUrl', lesson.videoUrl);
        formData.append('duration', String(lesson.duration));
      } else if (type === 'note' && lesson.file) {
        formData.append('file', lesson.file);
      }

      const res = await fetch('/api/teacher/lessons/add', {
        method: 'POST',
        credentials: 'include',
        // No Content-Type header, let browser set it for FormData
        body: formData,
      });

      if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || 'Failed to create content');
      }

      const lessonData = await res.json();

      // If it's a live session, we also need to schedule it and link it
      if (type === 'live-session') {
          const startTime = new Date(`${lesson.scheduledDate}T${lesson.scheduledTime}`);
          const liveRes = await fetch('/api/teacher/live-sessions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                  courseId,
                  title: lesson.title,
                  description: lesson.description,
                  scheduledStartTime: startTime.toISOString(),
                  durationMinutes: lesson.duration,
                  privacy: lesson.privacy,
                  recordingEnabled: true,
                  lessonId: lessonData.lesson?.id || lessonData.id,
                  isRequired: true,
              }),
          });
          
          if (!liveRes.ok) {
              const liveErr = await liveRes.json();
              throw new Error(liveErr.error || 'Failed to schedule live session');
          }
      }

      addToast({ message: 'Added successfully', type: 'success' });
      router.push(`/teacher/courses/${courseId}`);
    } catch (error: any) {
      addToast({ message: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-aura-gradient pt-28 pb-20 px-4 md:px-8 flex justify-center">
      <div className="bg-white dark:bg-gray-800 p-10 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700 w-full max-w-2xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">
              Add Content
            </p>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white capitalize">
              New {type}
            </h1>
          </div>
          <button
            onClick={() => router.back()}
            className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-2xl transition-all"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-2">
              Title
            </label>
            <input
              type="text"
              required
              value={lesson.title}
              onChange={(e) => setLesson({ ...lesson, title: e.target.value })}
              className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl text-lg font-bold text-gray-900 dark:text-white"
              placeholder={`e.g. ${type === 'assignment' ? 'Week 1 Project' : type === 'note' ? 'Lecture Notes' : type === 'live-session' ? "Live: Newton's Laws Deep Dive" : 'Mid-term Quiz'}`}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-2">
              Instructions / Description
            </label>
            <textarea
              rows={3}
              value={lesson.description}
              onChange={(e) => setLesson({ ...lesson, description: e.target.value })}
              className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl text-sm font-medium text-gray-900 dark:text-white resize-none"
              placeholder="Details for students..."
            />
          </div>

          {type === 'video' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-2">
                  Video URL (YouTube)
                </label>
                <input
                  type="text"
                  value={lesson.videoUrl || ''}
                  onChange={(e) => setLesson({ ...lesson, videoUrl: e.target.value })}
                  className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl font-medium text-gray-900 dark:text-white"
                  placeholder="https://youtu.be/..."
                />
                <p className="text-xs text-gray-400 pl-2">YouTube link or unlisted video URL</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-2">
                  Duration (Minutes)
                </label>
                <input
                  type="number"
                  value={lesson.duration}
                  onChange={(e) => setLesson({ ...lesson, duration: Number(e.target.value) })}
                  className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl font-bold text-gray-900 dark:text-white"
                  placeholder="10"
                />
              </div>
            </div>
          )}

          {type === 'note' && (
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-2">
                Upload File (PDF)
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => {
                    if (e.target.files) setLesson({ ...lesson, file: e.target.files[0] });
                }}
                className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl font-medium text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-deep-knowledge-blue file:text-white hover:file:bg-blue-700"
              />
            </div>
          )}

          {type === 'live-session' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-2">
                  Date
                </label>
                <input
                  type="date"
                  value={lesson.scheduledDate}
                  onChange={(e) => setLesson({ ...lesson, scheduledDate: e.target.value })}
                  className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl font-bold text-gray-900 dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-2">
                  Time
                </label>
                <input
                  type="time"
                  value={lesson.scheduledTime}
                  onChange={(e) => setLesson({ ...lesson, scheduledTime: e.target.value })}
                  className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl font-bold text-gray-900 dark:text-white"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-2">
                  Duration (Minutes)
                </label>
                <input
                  type="number"
                  value={lesson.duration}
                  onChange={(e) => setLesson({ ...lesson, duration: Number(e.target.value) })}
                  className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl font-bold text-gray-900 dark:text-white"
                  placeholder="60"
                />
              </div>
            </div>
          )}

          {type === 'assignment' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-2">
                  Due Date
                </label>
                <input
                  type="datetime-local"
                  value={lesson.dueDate}
                  onChange={(e) => setLesson({ ...lesson, dueDate: e.target.value })}
                  className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl font-bold text-gray-900 dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-2">
                  Max Points
                </label>
                <input
                  type="number"
                  value={lesson.maxScore}
                  onChange={(e) => setLesson({ ...lesson, maxScore: e.target.value })}
                  className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl font-bold text-gray-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {type === 'quiz' && (
            <div className="space-y-6 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-gray-900">
                  Questions ({lesson.questions.length})
                </h3>
              </div>

              {lesson.questions.map((q, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-gray-50 rounded-2xl flex justify-between items-start"
                >
                  <div>
                    <p className="font-bold text-sm mb-1">
                      {idx + 1}. {q.question}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                      {q.options.map((opt, i) => (
                        <span
                          key={i}
                          className={i === q.correctAnswer ? 'text-green-600 font-bold' : ''}
                        >
                          {['A', 'B', 'C', 'D'][i]}) {opt}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeQuestion(idx)}
                    className="text-red-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <div className="bg-blue-50/50 p-6 rounded-2xl space-y-4 border border-blue-100">
                <input
                  type="text"
                  placeholder="Question text..."
                  value={currentQuestion.question}
                  onChange={(e) =>
                    setCurrentQuestion({ ...currentQuestion, question: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white rounded-xl border-none text-sm font-medium"
                />
                <div className="grid grid-cols-2 gap-3">
                  {currentQuestion.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={currentQuestion.correctAnswer === i}
                        onChange={() =>
                          setCurrentQuestion({ ...currentQuestion, correctAnswer: i })
                        }
                        className="accent-brand-deep-knowledge-blue"
                      />
                      <input
                        type="text"
                        placeholder={`Option ${['A', 'B', 'C', 'D'][i]}`}
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...currentQuestion.options];
                          newOpts[i] = e.target.value;
                          setCurrentQuestion({ ...currentQuestion, options: newOpts });
                        }}
                        className="w-full px-3 py-2 bg-white rounded-lg border-none text-xs"
                      />
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="w-full py-3 bg-blue-100 text-blue-700 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-200"
                >
                  Add Question
                </button>
              </div>
            </div>
          )}

          <div className="pt-4 flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 py-4 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] py-4 bg-brand-deep-knowledge-blue text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-brand-wisdom-gold hover:text-brand-dark transition-all disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Content
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
