'use client';

export const dynamic = 'force-dynamic';

import { useState, useRef, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Radio,
  Trash2,
  X,
  Play,
  Loader2,
  Plus,
  GripVertical,
  Paperclip,
  CheckCircle,
  UploadCloud,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { useToast } from '@/components/ToastProvider';
import { useAuth } from '@/components/AuthProvider';

interface Assignment {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
}

interface Lesson {
  id: string;
  title: string;
  contentType: string; // 'video' | 'assignment' | 'quiz' | 'note' | 'live-session'
  isPublished: boolean;
  orderNumber: number;
  duration?: number | null;
  description?: string | null;
  videoUrl?: string | null;
  isFreePreview?: boolean;
  scheduledAt?: string | null;
  liveStatus?: string;
  type?: string;
  moduleId?: string | null;
  assignments?: Assignment[];
  content?: string | null;
}

interface CourseDetails {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnail: string;
  lessons: Lesson[];
  _count: {
    enrollments: number;
  };
}

export default function CourseManagementPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const router = useRouter();
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  // Selected Lecture & Milestone
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedModule, setSelectedModule] = useState<any | null>(null);
  const [editModuleTitle, setEditModuleTitle] = useState('');
  const [editModuleDescription, setEditModuleDescription] = useState('');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');

  // Collapsed modules state
  const [collapsedModules, setCollapsedModules] = useState<Record<string, boolean>>({});

  // Inline editing states
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [inlineEditTitle, setInlineEditTitle] = useState('');

  // Autosave status state
  const [autosaveStatus, setAutosaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Student preview mode state
  const [previewMode, setPreviewMode] = useState(false);

  // Quiz builder questions state
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);

  // Tab systems
  const [editorTab, setEditorTab] = useState<'content' | 'settings' | 'resources' | 'notes' | 'quiz'>('content');
  const [postLiveTab, setPostLiveTab] = useState<'recording' | 'notes' | 'assignments'>('recording');

  // Get active teacher user data
  const { user: authUser } = useAuth();
  const currentUser = {
    name: authUser?.name || "Mohit Raj",
    role: "Host",
    avatarUrl: authUser?.image || authUser?.avatar_url || authUser?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(authUser?.name || "Mohit Raj")}&background=random`
  };

  // Edit Lecture state
  const [editTitle, setEditTitle] = useState('');
  const [editType, setEditType] = useState('video');
  const [editDuration, setEditDuration] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editVideoUrl, setEditVideoUrl] = useState('');
  const [editIsFreePreview, setEditIsFreePreview] = useState(false);
  const [editIsPublished, setEditIsPublished] = useState(true);
  const [editScheduledAt, setEditScheduledAt] = useState('');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [resourceFile, setResourceFile] = useState<File | null>(null);

  // Post-live assignments creator state
  const [asgTitle, setAsgTitle] = useState('');
  const [asgDesc, setAsgDesc] = useState('');
  const [asgDueDate, setAsgDueDate] = useState('');
  const [asgFile, setAsgFile] = useState<File | null>(null);
  const [isCreatingAsg, setIsCreatingAsg] = useState(false);

  // Course Settings & Thumbnail Modal State
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [courseThumbnailInput, setCourseThumbnailInput] = useState('');
  const [courseTitleInput, setCourseTitleInput] = useState('');
  const [coursePriceInput, setCoursePriceInput] = useState('');
  const [isUploadingCourseThumbnail, setIsUploadingCourseThumbnail] = useState(false);
  const [isSavingCourseSettings, setIsSavingCourseSettings] = useState(false);

  // Load Course
  const { data: course, isLoading, refetch } = useQuery<CourseDetails>({
    queryKey: ['course', courseId],
    queryFn: async () => {
      if (!courseId) throw new Error('No course ID found');
      const res = await fetch(`/api/teacher/courses/${courseId}`);
      if (!res.ok) throw new Error('Failed to load course');
      return res.json();
    },
    enabled: !!courseId,
  });

  const milestones = useMemo(() => ((course as any)?.modules || []) as any[], [course]);
  const lessons = useMemo(() => (course?.lessons || []) as Lesson[], [course]);

  const isCompletedClass = selectedLesson?.contentType === 'live-session' && selectedLesson?.liveStatus === 'ENDED';

  const lessonsByMilestoneId = useMemo(() => {
    const grouped: Record<string, Lesson[]> = {};
    for (const lesson of lessons) {
      const key = lesson.moduleId || '';
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(lesson);
    }
    return grouped;
  }, [lessons]);

  const unassignedLessons = useMemo(() => {
    const validMilestoneIds = new Set(milestones.map((m: any) => m.id));
    return lessons.filter((lesson) => !lesson.moduleId || !validMilestoneIds.has(lesson.moduleId));
  }, [lessons, milestones]);

  // Keep selectedLesson / selectedModule local state in sync with query cache updates
  useEffect(() => {
    if (course) {
      if (selectedLesson) {
        const updated = course.lessons.find(l => l.id === selectedLesson.id);
        if (updated) {
          setSelectedLesson(updated);
          setEditVideoUrl(updated.videoUrl || '');
        }
      }
      if (selectedModule) {
        const updated = (course as any).modules?.find((m: any) => m.id === selectedModule.id);
        if (updated) {
          setSelectedModule(updated);
        }
      }
    }
  }, [course, selectedLesson, selectedModule]);

  // Auto-poll query when a completed live class is waiting for its recording to process
  useEffect(() => {
    if (selectedLesson && selectedLesson.contentType === 'live-session' && !selectedLesson.videoUrl) {
      const timer = setInterval(() => {
        console.log("Polling course data for recording sync...");
        refetch();
      }, 10000);
      return () => clearInterval(timer);
    }
  }, [selectedLesson, refetch]);

  // Keep track of the active lesson ID to avoid auto-saving when changing selection
  const lastActiveLessonId = useRef<string | null>(null);
  
  useEffect(() => {
    if (!selectedLesson) {
      lastActiveLessonId.current = null;
      return;
    }

    // If we just selected a new lesson, set the ref and skip saving
    if (lastActiveLessonId.current !== selectedLesson.id) {
      lastActiveLessonId.current = selectedLesson.id;
      return;
    }

    // Debounce the save
    setAutosaveStatus('saving');
    const delay = setTimeout(async () => {
      try {
        const formData = new FormData();
        formData.append('lessonId', selectedLesson.id);
        formData.append('title', editTitle);
        formData.append('contentType', editType);
        formData.append('duration', editDuration);
        formData.append('description', editDescription);
        formData.append('videoUrl', editVideoUrl);
        formData.append('isFreePreview', String(editIsFreePreview));
        formData.append('isPublished', String(editIsPublished));
        
        if (editType === 'live-session') {
          formData.append('type', 'LIVE');
          formData.append('scheduledAt', editScheduledAt ? new Date(editScheduledAt).toISOString() : '');
        } else {
          formData.append('type', 'VIDEO');
        }

        if (editType === 'quiz') {
          formData.append('content', JSON.stringify(quizQuestions));
        }

        const res = await fetch('/api/teacher/lessons/update', {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          setAutosaveStatus('saved');
          // Silently update cache without full refetch loading indicators
          queryClient.invalidateQueries({ queryKey: ['course', courseId] });
        } else {
          setAutosaveStatus('error');
        }
      } catch (err) {
        setAutosaveStatus('error');
      }
    }, 1200);

    return () => clearTimeout(delay);
  }, [
    editTitle,
    editType,
    editDuration,
    editDescription,
    editVideoUrl,
    editIsFreePreview,
    editIsPublished,
    editScheduledAt,
    quizQuestions,
    selectedLesson,
    courseId,
    queryClient
  ]);

  // Handle select lecture
  const handleSelectLesson = (lesson: Lesson) => {
    setSelectedModule(null);
    setSelectedLesson(lesson);
    setEditTitle(lesson.title || '');
    setEditType(lesson.contentType || 'video');
    setEditDuration(lesson.duration ? String(lesson.duration) : '');
    setEditDescription(lesson.description || '');
    setEditVideoUrl(lesson.videoUrl || '');
    setEditIsFreePreview(!!lesson.isFreePreview);
    setEditIsPublished(!!lesson.isPublished);
    if (lesson.scheduledAt) {
      const date = new Date(lesson.scheduledAt);
      const isoStr = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      setEditScheduledAt(isoStr);
    } else {
      setEditScheduledAt('');
    }
    setUploadProgress(null);
    setResourceFile(null);
    
    // Parse quiz questions
    if (lesson.contentType === 'quiz') {
      try {
        const parsed = lesson.content ? JSON.parse(lesson.content as string) : [];
        setQuizQuestions(parsed);
      } catch (e) {
        setQuizQuestions([]);
      }
    } else {
      setQuizQuestions([]);
    }

    // Clear assignment form
    setAsgTitle('');
    setAsgDesc('');
    setAsgDueDate('');
    setAsgFile(null);
  };

  // Handle select milestone (module)
  const handleSelectModule = (mod: any) => {
    setSelectedLesson(null);
    setSelectedModule(mod);
    setEditModuleTitle(mod.title || '');
    setEditModuleDescription(mod.description || '');
  };

  // Add new milestone (module)
  const handleAddModule = async () => {
    try {
      const nextNum = ((course as any)?.modules?.length || 0) + 1;
      const res = await fetch('/api/teacher/modules/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          title: `Milestone ${nextNum}: New Phase`
        }),
      });

      if (res.ok) {
        const newMod = await res.json();
        addToast({ message: 'Milestone added successfully!', type: 'success' });
        refetch();
        handleSelectModule(newMod);
      } else {
        throw new Error('Failed to add milestone');
      }
    } catch (err: any) {
      addToast({ message: err.message, type: 'error' });
    }
  };

  // Add lesson inside a milestone
  const handleAddLessonToModule = async (moduleId: string) => {
    try {
      const formData = new FormData();
      formData.append('courseId', courseId);
      const moduleLectureCount = (lessonsByMilestoneId[moduleId] || []).length;
      formData.append('title', `Lecture ${moduleLectureCount + 1}`);
      formData.append('contentType', 'video');
      formData.append('isPublished', 'true');
      formData.append('duration', '10');
      formData.append('moduleId', moduleId);

      const res = await fetch('/api/teacher/lessons/add', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const newLesson = await res.json();
        addToast({ message: 'Lecture added to milestone successfully!', type: 'success' });
        refetch();
        handleSelectLesson(newLesson);
      } else {
        throw new Error('Failed to add lecture');
      }
    } catch (err: any) {
      addToast({ message: err.message, type: 'error' });
    }
  };

  // Add new flat lecture (fallback/unassigned)
  const handleAddLesson = async () => {
    try {
      const formData = new FormData();
      formData.append('courseId', courseId);
      formData.append('title', `Lecture ${lessons.length + 1}`);
      formData.append('contentType', 'video');
      formData.append('isPublished', 'true');
      formData.append('duration', '10');

      const res = await fetch('/api/teacher/lessons/add', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const newLesson = await res.json();
        addToast({ message: 'Lecture added successfully!', type: 'success' });
        refetch();
        handleSelectLesson(newLesson);
      } else {
        throw new Error('Failed to add lecture');
      }
    } catch (err: any) {
      addToast({ message: err.message, type: 'error' });
    }
  };

  // Save milestone details
  const handleSaveModuleDetails = async () => {
    if (!selectedModule) return;
    try {
      const res = await fetch('/api/teacher/modules/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleId: selectedModule.id,
          title: editModuleTitle,
          description: editModuleDescription
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        addToast({ message: 'Milestone updated successfully!', type: 'success' });
        setSelectedModule(updated);
        refetch();
      } else {
        throw new Error('Failed to update milestone');
      }
    } catch (err: any) {
      addToast({ message: err.message, type: 'error' });
    }
  };

  // Delete milestone
  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Are you sure you want to delete this milestone? Lectures inside it will become unassigned.')) return;
    try {
      const res = await fetch('/api/teacher/modules/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleId }),
      });
      if (res.ok) {
        addToast({ message: 'Milestone deleted successfully.', type: 'success' });
        setSelectedModule(null);
        refetch();
      } else {
        throw new Error('Failed to delete milestone');
      }
    } catch (err: any) {
      addToast({ message: err.message, type: 'error' });
    }
  };

  // Save changes to lecture
  const handleSaveLessonDetails = async () => {
    if (!selectedLesson) return;
    try {
      const formData = new FormData();
      formData.append('lessonId', selectedLesson.id);
      formData.append('title', editTitle);
      formData.append('contentType', editType);
      formData.append('duration', editDuration);
      formData.append('description', editDescription);
      formData.append('videoUrl', editVideoUrl);
      formData.append('isFreePreview', String(editIsFreePreview));
      formData.append('isPublished', String(editIsPublished));
      if (editType === 'live-session') {
        formData.append('type', 'LIVE');
        formData.append('scheduledAt', editScheduledAt ? new Date(editScheduledAt).toISOString() : '');
      } else {
        formData.append('type', 'VIDEO');
      }

      if (resourceFile) {
        formData.append('file', resourceFile);
      }

      if (resourceFile) {
        setUploadProgress(10);
        const timer = setInterval(() => {
          setUploadProgress(prev => {
            if (prev === null) return null;
            if (prev >= 90) {
              clearInterval(timer);
              return 95;
            }
            return prev + 15;
          });
        }, 150);
      }

      const res = await fetch('/api/teacher/lessons/update', {
        method: 'POST',
        body: formData,
      });

      setUploadProgress(null);

      if (res.ok) {
        const updated = await res.json();
        addToast({ message: 'Lecture updated successfully!', type: 'success' });
        setSelectedLesson(updated);
        refetch();
      } else {
        throw new Error('Failed to update lecture');
      }
    } catch (err: any) {
      addToast({ message: err.message, type: 'error' });
    }
  };

  // Delete lecture
  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('Are you sure you want to delete this lecture?')) return;
    try {
      const res = await fetch('/api/teacher/lessons/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId }),
      });
      if (res.ok) {
        addToast({ message: 'Lecture deleted successfully.', type: 'success' });
        setSelectedLesson(null);
        refetch();
      } else {
        throw new Error('Failed to delete lecture');
      }
    } catch (err: any) {
      addToast({ message: err.message, type: 'error' });
    }
  };

  // Inline save for module titles
  const handleInlineSaveModule = async (moduleId: string) => {
    if (!inlineEditTitle.trim()) {
      setEditingModuleId(null);
      return;
    }
    try {
      const res = await fetch('/api/teacher/modules/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleId,
          title: inlineEditTitle
        }),
      });
      if (res.ok) {
        refetch();
        addToast({ message: 'Milestone title updated!', type: 'success' });
      }
    } catch (err) {
      console.error(err);
    }
    setEditingModuleId(null);
  };

  // Inline save for lecture titles
  const handleInlineSaveLesson = async (lesson: Lesson) => {
    if (!inlineEditTitle.trim()) {
      setEditingLessonId(null);
      return;
    }
    try {
      const formData = new FormData();
      formData.append('lessonId', lesson.id);
      formData.append('title', inlineEditTitle);
      formData.append('contentType', lesson.contentType);
      
      const res = await fetch('/api/teacher/lessons/update', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        refetch();
        addToast({ message: 'Lecture title updated!', type: 'success' });
      }
    } catch (err) {
      console.error(err);
    }
    setEditingLessonId(null);
  };

  // Duplicate a lecture
  const handleDuplicateLesson = async (lesson: Lesson) => {
    try {
      const formData = new FormData();
      formData.append('courseId', courseId);
      formData.append('title', `${lesson.title} (Copy)`);
      formData.append('contentType', lesson.contentType);
      formData.append('isPublished', String(lesson.isPublished));
      formData.append('duration', String(lesson.duration || 10));
      if (lesson.moduleId) {
        formData.append('moduleId', lesson.moduleId);
      }
      if (lesson.description) {
        formData.append('description', lesson.description);
      }
      if (lesson.videoUrl) {
        formData.append('videoUrl', lesson.videoUrl);
      }

      const res = await fetch('/api/teacher/lessons/add', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        addToast({ message: 'Lecture duplicated successfully!', type: 'success' });
        refetch();
      } else {
        throw new Error('Failed to duplicate lecture');
      }
    } catch (err: any) {
      addToast({ message: err.message, type: 'error' });
    }
  };

  // Move lecture position up or down
  const handleMoveLesson = async (lessonId: string, direction: 'up' | 'down') => {
    const allLessons = course?.lessons || [];
    const idx = allLessons.findIndex(l => l.id === lessonId);
    if (idx === -1) return;
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === allLessons.length - 1) return;

    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    
    // Swap
    const newLessons = [...allLessons];
    const temp = newLessons[idx];
    newLessons[idx] = newLessons[targetIdx];
    newLessons[targetIdx] = temp;

    const reorderedList = newLessons.map((l, index) => ({
      id: l.id,
      orderNumber: index + 1
    }));

    try {
      const res = await fetch('/api/teacher/lessons/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessons: reorderedList }),
      });
      if (res.ok) {
        addToast({ message: 'Lecture moved successfully!', type: 'success' });
        refetch();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Drag and drop reordering
  const [draggedLessonId, setDraggedLessonId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedLessonId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetLesson: Lesson) => {
    e.preventDefault();
    if (!draggedLessonId) return;

    const allLessons = course?.lessons || [];
    const draggedLesson = allLessons.find(l => l.id === draggedLessonId);
    if (!draggedLesson) return;

    try {
      // Reassign moduleId to targetLesson's moduleId
      if (draggedLesson.moduleId !== (targetLesson as any).moduleId) {
        await fetch('/api/teacher/lessons/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lessonId: draggedLessonId,
            moduleId: (targetLesson as any).moduleId || null
          })
        });
      }

      // Reorder inside the list
      if (draggedLessonId !== targetLesson.id) {
        const remainingLessons = allLessons.filter(l => l.id !== draggedLessonId);
        const targetIdx = remainingLessons.findIndex(l => l.id === targetLesson.id);
        remainingLessons.splice(targetIdx + 1, 0, draggedLesson);

        const reorderedList = remainingLessons.map((lesson, idx) => ({
          id: lesson.id,
          orderNumber: idx + 1
        }));

        const res = await fetch('/api/teacher/lessons/reorder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lessons: reorderedList }),
        });
        if (!res.ok) throw new Error('Failed to reorder lectures');
      }

      addToast({ message: 'Lectures reordered successfully!', type: 'success' });
      refetch();
    } catch (err: any) {
      addToast({ message: err.message, type: 'error' });
    }
    setDraggedLessonId(null);
  };

  const handleDropOnModule = async (e: React.DragEvent, targetModuleId: string | null) => {
    e.preventDefault();
    if (!draggedLessonId) return;

    try {
      const res = await fetch('/api/teacher/lessons/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId: draggedLessonId,
          moduleId: targetModuleId
        })
      });
      if (res.ok) {
        addToast({ message: 'Lecture moved to milestone!', type: 'success' });
        refetch();
      } else {
        throw new Error('Failed to move lecture');
      }
    } catch (err: any) {
      addToast({ message: err.message, type: 'error' });
    }
    setDraggedLessonId(null);
  };

  // Instant Live Class Fix (ALWAYS WORKS)
  const handleInstantLive = async () => {
    try {
      const timeLabel = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      const dateLabel = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      const res = await fetch('/api/live-class/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          title: `Live Session - ${dateLabel} (${timeLabel})`,
          description: `Instant Live Session started on ${dateLabel} at ${timeLabel}`
        })
      });

      if (res.ok) {
        const json = await res.json();
        if (json.liveClass?.id) {
          refetch();
          router.push(`/teacher/live-class/${json.liveClass.id}`);
          return;
        }
      }
      throw new Error('Failed to create instant live session');
    } catch (err: any) {
      addToast({ message: err.message, type: 'error' });
    }
  };

  // Publish Assignment
  const handlePublishAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLesson || !asgTitle.trim()) return;
    setIsCreatingAsg(true);

    try {
      const res = await fetch('/api/teacher/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          lessonId: selectedLesson.id,
          title: asgTitle,
          description: asgDesc,
          dueAt: asgDueDate || null,
          totalQuestions: 1
        }),
      });

      if (res.ok) {
        addToast({ message: 'Assignment published successfully!', type: 'success' });
        setAsgTitle('');
        setAsgDesc('');
        setAsgDueDate('');
        refetch();
        // Update selected lesson with assignments locally
        const freshRes = await fetch(`/api/teacher/courses/${courseId}`);
        if (freshRes.ok) {
          const freshData = await freshRes.json();
          const freshLesson = freshData.lessons.find((l: Lesson) => l.id === selectedLesson.id);
          if (freshLesson) setSelectedLesson(freshLesson);
        }
      } else {
        throw new Error('Failed to publish assignment');
      }
    } catch (err: any) {
      addToast({ message: err.message, type: 'error' });
    } finally {
      setIsCreatingAsg(false);
    }
  };

  const openSettingsModal = () => {
    if (course) {
      setCourseThumbnailInput(course.thumbnail || '');
      setCourseTitleInput(course.title || '');
      setCoursePriceInput(course.price !== undefined ? String(course.price) : '0');
    }
    setShowSettingsModal(true);
  };

  const handleCourseThumbnailFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingCourseThumbnail(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload/blog-media', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setCourseThumbnailInput(data.url);
        addToast({ message: 'Thumbnail image uploaded successfully!', type: 'success' });
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (err: any) {
      addToast({ message: err.message || 'Image upload failed', type: 'error' });
    } finally {
      setIsUploadingCourseThumbnail(false);
    }
  };

  const handleSaveCourseSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingCourseSettings(true);
    try {
      const res = await fetch(`/api/teacher/courses/${courseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          thumbnail: courseThumbnailInput,
          title: courseTitleInput,
          price: Number(coursePriceInput || 0),
        }),
      });
      if (res.ok) {
        addToast({ message: 'Course thumbnail & details updated successfully!', type: 'success' });
        setShowSettingsModal(false);
        refetch();
      } else {
        const data = await res.json();
        throw new Error(data.message || data.error || 'Failed to update course settings');
      }
    } catch (err: any) {
      addToast({ message: err.message, type: 'error' });
    } finally {
      setIsSavingCourseSettings(false);
    }
  };

  const enrollmentCount = course?._count?.enrollments ?? 0;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24 w-full font-sans antialiased text-slate-900">
      
      {/* Studio Header */}
      <div className="bg-white border-b border-slate-100 py-6 sticky top-0 z-10 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/teacher/courses')}
              className="p-3 bg-slate-50 hover:bg-emerald-50 text-slate-500 hover:text-emerald-700 rounded-xl transition-all border border-slate-100 shadow-sm group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2.5 py-1 rounded-md">Course Studio</span>
                <span className="text-xs text-slate-400 font-bold">₹{Number(course?.price || 0).toLocaleString()}</span>
              </div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 mt-1">{course?.title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={openSettingsModal}
              className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-sm transition-all"
            >
              <UploadCloud className="w-4 h-4 text-emerald-400" />
              EDIT THUMBNAIL & SETTINGS
            </button>
            <button
              onClick={handleInstantLive}
              className="bg-red-650 hover:bg-red-750 text-white px-6 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-red-600/10 active:scale-98 transition-all"
            >
              <Radio className="w-4 h-4" />
              START INSTANT LIVE
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 md:px-10 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Milestone-based Curriculum Tree */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
              
              <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                <div>
                  <h3 className="font-black text-slate-900 uppercase text-xs tracking-wider">Course Curriculum</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                    {milestones.length} Milestones • {lessons.length} Lectures
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAddLesson}
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider"
                    title="Add unassigned lecture"
                  >
                    <Plus className="w-4 h-4" />
                    + LECTURE
                  </button>
                  <button
                    onClick={handleAddModule}
                    className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl transition-all flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider"
                  >
                    <Plus className="w-4 h-4" />
                    + MILESTONE
                  </button>
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/30">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search lectures or milestones..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-9 pr-8 py-2.5 text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all font-semibold"
                  />
                  <span className="absolute left-3 top-3.5 text-[10px]">🔍</span>
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-650 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Milestones Accordion / Tree */}
              <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto no-scrollbar">
                {/* Milestones list */}
                {milestones
                  .filter((module: any) => {
                    const moduleLessons = lessonsByMilestoneId[module.id] || [];
                    const matchModule = module.title.toLowerCase().includes(searchQuery.toLowerCase());
                    const matchLessons = moduleLessons.some(l => l.title.toLowerCase().includes(searchQuery.toLowerCase()));
                    return searchQuery === '' || matchModule || matchLessons;
                  })
                  .map((module: any, mIdx: number) => {
                    const moduleLessons = (lessonsByMilestoneId[module.id] || []).filter(l => 
                      searchQuery === '' || l.title.toLowerCase().includes(searchQuery.toLowerCase())
                    );
                    const isCollapsed = !!collapsedModules[module.id];
                    const publishedCount = moduleLessons.filter(l => l.isPublished).length;
                    const totalCount = moduleLessons.length;
                    
                    return (
                      <div 
                        key={module.id}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDropOnModule(e, module.id)}
                        className={`border rounded-2xl p-4 transition-all relative group/module ${
                          selectedModule?.id === module.id 
                            ? "border-emerald-300 bg-emerald-50/10" 
                            : "border-slate-150 hover:border-slate-200"
                        }`}
                      >
                        <div 
                          onClick={() => handleSelectModule(module)}
                          className="flex items-center justify-between cursor-pointer group"
                        >
                          <div className="min-w-0 flex-1 pr-2">
                            <div className="flex items-center gap-2">
                              {/* Collapse/Expand toggle arrow */}
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCollapsedModules(prev => ({ ...prev, [module.id]: !prev[module.id] }));
                                }}
                                className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors"
                              >
                                {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                              </button>

                              {/* Inline Editing for Module title */}
                              {editingModuleId === module.id ? (
                                <input
                                  type="text"
                                  value={inlineEditTitle}
                                  onChange={(e) => setInlineEditTitle(e.target.value)}
                                  onBlur={() => handleInlineSaveModule(module.id)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleInlineSaveModule(module.id);
                                    if (e.key === 'Escape') setEditingModuleId(null);
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  autoFocus
                                  className="bg-white border border-slate-300 rounded px-2 py-0.5 text-xs font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 w-full"
                                />
                              ) : (
                                <h4 
                                  onDoubleClick={(e) => {
                                    e.stopPropagation();
                                    setEditingModuleId(module.id);
                                    setInlineEditTitle(module.title);
                                  }}
                                  className="text-xs font-black text-slate-800 uppercase tracking-wide group-hover:text-emerald-700 truncate cursor-text"
                                >
                                  {module.title}
                                </h4>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2 mt-1 block">
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                Milestone {mIdx + 1} • {totalCount} Lectures
                              </span>
                              {totalCount > 0 && (
                                <span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                  {publishedCount}/{totalCount} complete
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover/module:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddLessonToModule(module.id);
                              }}
                              className="p-1.5 bg-white border border-slate-200 hover:border-emerald-500 rounded-lg text-slate-500 hover:text-emerald-600 transition-all"
                              title="Add lecture to this milestone"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if(confirm("Delete this milestone? Lectures will become unassigned.")) {
                                  handleDeleteModule(module.id);
                                }
                              }}
                              className="p-1.5 bg-white border border-slate-200 hover:border-red-500 rounded-lg text-slate-400 hover:text-red-650 transition-all"
                              title="Delete Milestone"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Lessons inside milestone */}
                        {!isCollapsed && (
                          <div className="space-y-2 mt-3 pt-3 border-t border-slate-100">
                            {moduleLessons.length > 0 ? (
                              moduleLessons.map((lesson) => {
                                const isLiveSession = lesson.contentType === 'live-session';
                                const isLessonEnded = lesson.liveStatus === 'ENDED' || lesson.videoUrl;
                                const isProcessing = lesson.contentType === 'video' && !lesson.videoUrl;

                                return (
                                  <div
                                    key={lesson.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, lesson.id)}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, lesson)}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSelectLesson(lesson);
                                    }}
                                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer relative group/lesson ${
                                      selectedLesson?.id === lesson.id 
                                        ? "bg-emerald-50/30 border-emerald-300 shadow-sm" 
                                        : "bg-slate-50/50 border-slate-100 hover:border-slate-200"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                      <div className="cursor-grab text-slate-350 hover:text-slate-450 pr-0.5 shrink-0">
                                        <GripVertical className="w-3.5 h-3.5" />
                                      </div>
                                      
                                      <div className={`p-1.5 rounded-lg shrink-0 ${
                                        isLiveSession 
                                          ? (isLessonEnded ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-500') 
                                          : 'bg-white border border-slate-200 text-slate-650'
                                      }`}>
                                        {isLiveSession ? (
                                          isLessonEnded ? <CheckCircle className="w-3.5 h-3.5" /> : <Radio className="w-3.5 h-3.5 animate-pulse" />
                                        ) : (
                                          <Play className="w-3.5 h-3.5" />
                                        )}
                                      </div>

                                      <div className="min-w-0 flex-1">
                                        {/* Inline Editing for Lecture title */}
                                        {editingLessonId === lesson.id ? (
                                          <input
                                            type="text"
                                            value={inlineEditTitle}
                                            onChange={(e) => setInlineEditTitle(e.target.value)}
                                            onBlur={() => handleInlineSaveLesson(lesson)}
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter') handleInlineSaveLesson(lesson);
                                              if (e.key === 'Escape') setEditingLessonId(null);
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                            autoFocus
                                            className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-[11px] font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 w-full"
                                          />
                                        ) : (
                                          <p 
                                            onDoubleClick={(e) => {
                                              e.stopPropagation();
                                              setEditingLessonId(lesson.id);
                                              setInlineEditTitle(lesson.title);
                                            }}
                                            className="text-[11px] font-bold text-slate-700 truncate cursor-text"
                                          >
                                            {lesson.title}
                                          </p>
                                        )}
                                        
                                        {/* Per-lecture status indicators */}
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                          {!lesson.isPublished && (
                                            <span className="text-[8px] font-extrabold uppercase bg-amber-50 text-amber-700 px-1 rounded">Draft</span>
                                          )}
                                          {lesson.isPublished && (
                                            <span className="text-[8px] font-extrabold uppercase bg-emerald-50 text-emerald-700 px-1 rounded">Published</span>
                                          )}
                                          {isProcessing && (
                                            <span className="text-[8px] font-extrabold uppercase bg-blue-50 text-blue-700 px-1 rounded animate-pulse">Processing Video</span>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Action items kebab menu on hover */}
                                    <div className="flex items-center gap-1 opacity-0 group-hover/lesson:opacity-100 transition-opacity shrink-0">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDuplicateLesson(lesson);
                                        }}
                                        className="p-1 hover:bg-white rounded text-slate-500 hover:text-emerald-600 border border-transparent hover:border-slate-100 shadow-sm transition-all"
                                        title="Duplicate Lecture"
                                      >
                                        Copy
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleMoveLesson(lesson.id, 'up');
                                        }}
                                        className="p-1 hover:bg-white rounded text-slate-500 hover:text-emerald-600 border border-transparent hover:border-slate-100 shadow-sm transition-all text-[10px]"
                                        title="Move Up"
                                      >
                                        ↑
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleMoveLesson(lesson.id, 'down');
                                        }}
                                        className="p-1 hover:bg-white rounded text-slate-500 hover:text-emerald-600 border border-transparent hover:border-slate-100 shadow-sm transition-all text-[10px]"
                                        title="Move Down"
                                      >
                                        ↓
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteLesson(lesson.id);
                                        }}
                                        className="p-1 hover:bg-white rounded text-slate-400 hover:text-red-600 border border-transparent hover:border-slate-100 shadow-sm transition-all"
                                        title="Delete Lecture"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                    
                                    <ChevronRight className="w-3 h-3 text-slate-400 shrink-0 group-hover/lesson:hidden" />
                                  </div>
                                );
                              })
                            ) : (
                              <p className="text-[10px] text-slate-450 italic mt-1 text-center">
                                No lectures in this milestone.
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                {/* Flat/Unassigned Lessons */}
                {(() => {
                  const filteredUnassigned = unassignedLessons.filter(lesson => 
                    searchQuery === '' || lesson.title.toLowerCase().includes(searchQuery.toLowerCase())
                  );
                  if (filteredUnassigned.length === 0) return null;

                  return (
                    <div 
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDropOnModule(e, null)}
                      className="border border-dashed border-slate-200 rounded-2xl p-4 bg-slate-50/40 animate-in fade-in duration-200"
                    >
                      <h4 className="text-xs font-black text-slate-500 uppercase tracking-wide">
                        Unassigned Lectures
                      </h4>
                      <p className="text-[9px] text-slate-450 font-bold uppercase mt-0.5">
                        These are not in any milestone. Drag them into one.
                      </p>
                      
                      <div className="space-y-2 mt-3">
                        {filteredUnassigned.map((lesson) => {
                          const isLiveSession = lesson.contentType === 'live-session';
                          const isLessonEnded = lesson.liveStatus === 'ENDED' || lesson.videoUrl;

                          return (
                            <div
                              key={lesson.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, lesson.id)}
                              onDragOver={handleDragOver}
                              onDrop={(e) => handleDrop(e, lesson)}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectLesson(lesson);
                              }}
                              className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer bg-white relative group/unassigned ${
                                selectedLesson?.id === lesson.id 
                                  ? "border-emerald-300 shadow-sm" 
                                  : "border-slate-100 hover:border-slate-200"
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <div className="cursor-grab text-slate-300 hover:text-slate-450 pr-0.5 shrink-0">
                                  <GripVertical className="w-3.5 h-3.5" />
                                </div>
                                <div className={`p-1.5 rounded-lg shrink-0 ${
                                  isLiveSession 
                                    ? (isLessonEnded ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-500') 
                                    : 'bg-slate-105 text-slate-650'
                                }`}>
                                  {isLiveSession ? (
                                    isLessonEnded ? <CheckCircle className="w-3.5 h-3.5" /> : <Radio className="w-3.5 h-3.5 animate-pulse" />
                                  ) : (
                                    <Play className="w-3.5 h-3.5" />
                                  )}
                                </div>

                                <div className="min-w-0 flex-1">
                                  {/* Inline Editing for Lecture title */}
                                  {editingLessonId === lesson.id ? (
                                    <input
                                      type="text"
                                      value={inlineEditTitle}
                                      onChange={(e) => setInlineEditTitle(e.target.value)}
                                      onBlur={() => handleInlineSaveLesson(lesson)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleInlineSaveLesson(lesson);
                                        if (e.key === 'Escape') setEditingLessonId(null);
                                      }}
                                      onClick={(e) => e.stopPropagation()}
                                      autoFocus
                                      className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-[11px] font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 w-full"
                                    />
                                  ) : (
                                    <p 
                                      onDoubleClick={(e) => {
                                        e.stopPropagation();
                                        setEditingLessonId(lesson.id);
                                        setInlineEditTitle(lesson.title);
                                      }}
                                      className="text-[11px] font-bold text-slate-700 truncate cursor-text"
                                    >
                                      {lesson.title}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-1 opacity-0 group-hover/unassigned:opacity-100 transition-opacity shrink-0">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDuplicateLesson(lesson);
                                  }}
                                  className="p-1 hover:bg-white rounded text-slate-500 hover:text-emerald-600 border border-transparent hover:border-slate-100 shadow-sm transition-all"
                                  title="Duplicate Lecture"
                                >
                                  Copy
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteLesson(lesson.id);
                                  }}
                                  className="p-1 hover:bg-white rounded text-slate-400 hover:text-red-650 transition-colors"
                                  title="Delete Lecture"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>

                              <ChevronRight className="w-3 h-3 text-slate-400 shrink-0 group-hover/unassigned:hidden" />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {milestones.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-xs text-slate-450 italic">No milestones yet. Start with “+ Add Milestone”, then add lectures inside it.</p>
                  </div>
                )}
              </div>

            </div>
          </div>
          {/* RIGHT COLUMN: Lesson Editor OR Completed Class view */}
          <div className="lg:col-span-8">
            {selectedModule ? (
              /* MILESTONE EDITOR VIEW */
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden animate-in fade-in duration-200">
                <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[9px] font-black text-emerald-600 uppercase tracking-wider">Milestone Editor</span>
                    <h3 className="text-lg font-black text-slate-900 mt-0.5">{selectedModule.title}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDeleteModule(selectedModule.id)}
                      className="p-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-all border border-rose-100"
                      title="Delete Milestone"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={handleSaveModuleDetails}
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md shadow-emerald-600/10"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>

                <div className="p-8 space-y-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-450 uppercase tracking-widest block">Milestone Title</label>
                    <input
                      type="text"
                      value={editModuleTitle}
                      onChange={(e) => setEditModuleTitle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-450 uppercase tracking-widest block">Description & Objectives</label>
                    <textarea
                      value={editModuleDescription}
                      onChange={(e) => setEditModuleDescription(e.target.value)}
                      rows={6}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 font-medium"
                      placeholder="e.g. In this milestone, we will learn basic Python syntax, data structures, and conditional flow logic."
                    />
                  </div>
                </div>
              </div>
            ) : selectedLesson ? (
              isCompletedClass ? (
                /* SPECIAL VIEW: COMPLETED CLASS EDITOR */
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden animate-in fade-in duration-200">
                  
                  <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-[9px] font-black text-emerald-650 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded">Completed Class</span>
                      <h3 className="text-lg font-black text-slate-900 mt-1">{selectedLesson.title}</h3>
                    </div>

                    <button
                      onClick={() => handleDeleteLesson(selectedLesson.id)}
                      className="p-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-all border border-rose-100 self-end sm:self-auto"
                      title="Delete Lecture"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Completed Class Editor Tabs */}
                  <div className="flex border-b border-slate-50 bg-slate-50/50 p-1.5">
                    {[
                      { id: 'recording', label: '🎥 Class Recording' },
                      { id: 'notes', label: '📝 Class Notes' },
                      { id: 'assignments', label: '📄 Assignments' }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setPostLiveTab(tab.id as any)}
                        className={`flex-1 py-3 text-center text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
                          postLiveTab === tab.id
                            ? 'bg-white text-slate-900 shadow-sm border border-slate-100'
                            : 'text-slate-450 hover:text-slate-800'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="p-8 space-y-6">
                    
                    {/* TAB 1: Recording playback */}
                    {postLiveTab === 'recording' && (
                       <div className="space-y-4">
                         {selectedLesson.videoUrl ? (
                           <>
                             <div className="bg-emerald-50 text-emerald-800 px-4 py-3 rounded-xl border border-emerald-100 text-xs font-bold flex items-center justify-between gap-2">
                               <div className="flex items-center gap-2">
                                 <CheckCircle className="w-4 h-4 text-emerald-600" />
                                 <span>✅ Recording saved to Drive. Students can now watch this.</span>
                               </div>
                               <button 
                                 onClick={() => refetch()} 
                                 className="text-[10px] bg-white border border-emerald-200 px-2 py-1 rounded hover:bg-emerald-50 text-emerald-800"
                               >
                                 Refresh
                               </button>
                             </div>
                             
                             <div className="aspect-video bg-slate-900 rounded-2xl overflow-hidden relative flex items-center justify-center text-white border border-slate-950 shadow-inner">
                               <video 
                                 src={selectedLesson.videoUrl} 
                                 controls 
                                 className="w-full h-full object-contain"
                                 poster={course?.thumbnail || '/course-placeholder.jpg'}
                               />
                             </div>
                           </>
                         ) : (
                           <div className="p-8 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-4">
                             <div className="flex justify-center">
                               <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                             </div>
                             <div className="space-y-1">
                               <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">Syncing & Processing Recording...</h4>
                               <p className="text-[10px] text-slate-400 font-bold uppercase leading-relaxed max-w-md mx-auto">
                                 The live session has ended. We are currently uploading the recording to Google Drive. This usually takes 1-2 minutes. The page will update automatically.
                               </p>
                             </div>
                             <div>
                               <button
                                 onClick={() => refetch()}
                                 className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                               >
                                 Force Sync / Refresh
                               </button>
                             </div>
                           </div>
                         )}
                       </div>
                     )}

                    {/* TAB 2: Add Notes */}
                    {postLiveTab === 'notes' && (
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">Class Notes & Summary</h4>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Provide bullet points or summaries of what was taught in this class.</p>
                        </div>

                        <textarea
                          placeholder="Type notes and detailed description for students here..."
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          rows={10}
                          className="w-full bg-slate-50/80 border border-slate-200 rounded-2xl p-4 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all font-medium leading-relaxed resize-none"
                        />

                        <div className="flex justify-end">
                          <button
                            onClick={handleSaveLessonDetails}
                            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider"
                          >
                            Save Notes
                          </button>
                        </div>
                      </div>
                    )}

                    {/* TAB 3: Add Assignments */}
                    {postLiveTab === 'assignments' && (
                      <div className="space-y-6">
                        
                        {/* Assignment List */}
                        {selectedLesson.assignments && selectedLesson.assignments.length > 0 && (
                          <div className="space-y-3">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block pl-1">Published Assignments</span>
                            <div className="space-y-2">
                              {selectedLesson.assignments.map((asg) => (
                                <div key={asg.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs font-bold">
                                  <div>
                                    <p className="text-slate-800">{asg.title}</p>
                                    <p className="text-slate-400 font-normal mt-1 leading-relaxed">{asg.description}</p>
                                  </div>
                                  {asg.dueDate && (
                                    <span className="text-[9px] bg-white border border-slate-200 px-2 py-1 rounded text-slate-500">
                                      Due: {new Date(asg.dueDate).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Assignment form */}
                        <form onSubmit={handlePublishAssignment} className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-4">
                          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">Homework & Assignments Form</h4>
                          
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-slate-450 uppercase tracking-wider block">Assignment Title</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Write a Hello World program"
                              value={asgTitle}
                              onChange={(e) => setAsgTitle(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-slate-450 uppercase tracking-wider block">Description & Instructions</label>
                            <textarea
                              placeholder="Instructions for students..."
                              value={asgDesc}
                              onChange={(e) => setAsgDesc(e.target.value)}
                              rows={4}
                              className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-[9px] font-black text-slate-450 uppercase tracking-wider block">Deadline / Due Date (Optional)</label>
                              <input
                                type="date"
                                value={asgDueDate}
                                onChange={(e) => setAsgDueDate(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-emerald-500/20"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[9px] font-black text-slate-450 uppercase tracking-wider block">Attachment (PDF/ZIP)</label>
                              <div className="border border-dashed border-slate-350 bg-white rounded-xl p-2.5 text-center flex items-center justify-center relative cursor-pointer hover:border-emerald-500/50">
                                <input
                                  type="file"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      setAsgFile(file);
                                      addToast({ message: `Attachment staged: ${file.name}`, type: 'info' });
                                    }
                                  }}
                                  className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                                <span className="text-[10px] font-bold text-slate-500">{asgFile ? asgFile.name : 'Choose File'}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-end pt-2">
                            <button
                              type="submit"
                              disabled={isCreatingAsg}
                              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider rounded-xl flex items-center gap-1.5 disabled:opacity-50"
                            >
                              {isCreatingAsg ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Paperclip className="w-3.5 h-3.5" />}
                              Publish Assignment
                            </button>
                          </div>
                        </form>

                      </div>
                    )}

                  </div>
                </div>
              ) : (
                /* REGULAR LECTURE EDITOR VIEW */
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                  
                  <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-wider">Lecture Editor</span>
                      <h3 className="text-lg font-black text-slate-900 mt-1">{selectedLesson.title}</h3>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Autosave Tag */}
                      <div className="mr-2">
                        {autosaveStatus === 'saving' && (
                          <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-full font-black uppercase tracking-wider animate-pulse">
                            Saving...
                          </span>
                        )}
                        {autosaveStatus === 'saved' && (
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full font-black uppercase tracking-wider">
                            ✓ Saved
                          </span>
                        )}
                        {autosaveStatus === 'error' && (
                          <span className="text-[10px] text-rose-700 bg-rose-50 border border-rose-100 px-2.5 py-1 rounded-full font-black uppercase tracking-wider">
                            ⚠️ Save Error
                          </span>
                        )}
                      </div>

                      {/* Preview Toggle */}
                      <button
                        onClick={() => setPreviewMode(!previewMode)}
                        className={`px-4 py-2 border rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                          previewMode 
                            ? 'bg-slate-950 text-white border-slate-950 shadow-md' 
                            : 'bg-white text-slate-650 hover:bg-slate-50 border-slate-200'
                        }`}
                      >
                        {previewMode ? '✏️ Edit Mode' : '👁️ Preview'}
                      </button>

                      <button
                        onClick={() => handleDeleteLesson(selectedLesson.id)}
                        className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-all border border-rose-100"
                        title="Delete Lecture"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Student Preview Representation */}
                  {previewMode ? (
                    <div className="p-8 space-y-6 bg-slate-50/50 min-h-[500px]">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[9px] font-black text-slate-450 uppercase tracking-widest bg-slate-200/60 px-2 py-0.5 rounded">STUDENT PREVIEW</span>
                      </div>

                      {/* Video Area */}
                      {editType === 'video' && (
                        <div className="aspect-video bg-slate-950 rounded-2xl overflow-hidden relative border border-slate-900 shadow-lg flex items-center justify-center text-white">
                          {editVideoUrl ? (
                            <video src={editVideoUrl} controls className="w-full h-full object-contain" />
                          ) : (
                            <div className="text-center p-6 space-y-2">
                              <span className="text-3xl">🎥</span>
                              <h4 className="text-xs font-bold text-slate-400">No Video Uploaded Yet</h4>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Live Area */}
                      {editType === 'live-session' && (
                        <div className="p-8 bg-slate-900 text-white rounded-2xl text-center space-y-4 border border-slate-950">
                          <span className="text-3xl">📡</span>
                          <h4 className="font-bold text-sm">Scheduled Live Stream</h4>
                          <p className="text-xs text-slate-400">This class starts at: {editScheduledAt ? new Date(editScheduledAt).toLocaleString() : 'TBD'}</p>
                          <button className="px-6 py-3 bg-red-600 text-xs font-bold rounded-xl tracking-wider uppercase">Join Stream</button>
                        </div>
                      )}

                      {/* Quiz Builder Area */}
                      {editType === 'quiz' && (
                        <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-6 shadow-sm">
                          <h4 className="font-black text-slate-800 text-sm border-b pb-3 uppercase tracking-wider">Quiz: {editTitle}</h4>
                          {quizQuestions.length > 0 ? (
                            <div className="space-y-6">
                              {quizQuestions.map((q, idx) => (
                                <div key={idx} className="space-y-3">
                                  <p className="text-xs font-bold text-slate-800">{idx + 1}. {q.question || 'Untitled Question'}</p>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-3">
                                    {(q.options || []).map((opt: string, oIdx: number) => (
                                      <div key={oIdx} className="flex items-center gap-2 border border-slate-100 rounded-xl p-3 text-xs bg-slate-50 hover:bg-slate-100 transition-colors">
                                        <input type="radio" name={`q_${idx}`} disabled />
                                        <span>{opt}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400 italic">No questions added yet.</p>
                          )}
                        </div>
                      )}

                      {/* Notes & Description */}
                      <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm space-y-3">
                        <h4 className="font-bold text-xs uppercase tracking-widest text-slate-400">Description</h4>
                        <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                          {editDescription || 'No description provided.'}
                        </div>
                      </div>

                      {/* Resources / Attachments */}
                      <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm space-y-3">
                        <h4 className="font-bold text-xs uppercase tracking-widest text-slate-400">Resources & Downloads</h4>
                        {resourceFile ? (
                          <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-xs">
                            <span className="font-bold text-emerald-800">📎 {resourceFile.name} (Staged)</span>
                            <span className="text-[10px] text-emerald-600 font-bold uppercase">Download</span>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 italic">No attachments for this lecture.</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Regular Editor Navigation */}
                      <div className="flex border-b border-slate-50 bg-slate-50/50 p-1.5">
                        {([
                          { id: 'content', label: '🎥 Content' },
                          { id: 'resources', label: '📎 Resources' },
                          { id: 'notes', label: '📝 Description' },
                          ...(editType === 'quiz' ? [{ id: 'quiz', label: '❓ Quiz Builder' }] : []),
                          { id: 'settings', label: '⚙️ Settings' }
                        ] as const).map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => setEditorTab(tab.id as any)}
                            className={`flex-1 py-3 text-center text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
                              editorTab === tab.id
                                ? 'bg-white text-slate-900 shadow-sm border border-slate-100'
                                : 'text-slate-450 hover:text-slate-800'
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>

                      <div className="p-8 space-y-6">
                        
                        {/* Content Tab */}
                        {editorTab === 'content' && (
                          <div className="space-y-6">
                            
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-450 uppercase tracking-wider block">Lecture Title</label>
                              <input
                                type="text"
                                placeholder="Introduction to data structures"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all font-semibold"
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-450 uppercase tracking-wider block">Lecture Type</label>
                                <select
                                  value={editType}
                                  onChange={(e) => setEditType(e.target.value)}
                                  className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                                >
                                  <option value="video">Video Lecture</option>
                                  <option value="live-session">Live Class</option>
                                  <option value="quiz">Quiz</option>
                                  <option value="note">Resource / Reading</option>
                                </select>
                              </div>

                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-450 uppercase tracking-wider block">Duration (minutes)</label>
                                <input
                                  type="number"
                                  placeholder="15"
                                  value={editDuration}
                                  onChange={(e) => setEditDuration(e.target.value)}
                                  className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                                />
                              </div>
                            </div>

                            {editType === 'video' && (
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-450 uppercase tracking-wider block">Video Asset Source</label>
                                
                                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-emerald-500/50 transition-all bg-slate-50/30 flex flex-col items-center justify-center cursor-pointer relative group">
                                  <input
                                    type="file"
                                    accept="video/*"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        setResourceFile(file);
                                        addToast({ message: `Video staged: ${file.name}. Save to upload!`, type: 'info' });
                                      }
                                    }}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                  />
                                  <UploadCloud className="w-10 h-10 text-slate-400 group-hover:text-emerald-600 transition-colors mb-3" />
                                  <span className="text-xs font-bold text-slate-700">Drag video file here or click to browse</span>
                                  <span className="text-[9px] text-slate-400 font-bold uppercase mt-1">MP4, MOV, AVI (Max 1GB)</span>
                                </div>

                                {resourceFile && (
                                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between text-xs">
                                    <span className="font-bold text-emerald-800">Staged: {resourceFile.name} ({(resourceFile.size / (1024 * 1024)).toFixed(1)} MB)</span>
                                    <button onClick={() => setResourceFile(null)} className="text-slate-450 hover:text-red-500"><X className="w-4 h-4" /></button>
                                  </div>
                                )}

                                {uploadProgress !== null && (
                                  <div className="space-y-1">
                                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                      <div className="bg-emerald-600 h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                                    </div>
                                    <span className="text-[9px] text-slate-400 font-black uppercase">Uploading... {uploadProgress}%</span>
                                  </div>
                                )}

                                <div className="pt-2">
                                  <span className="text-[9px] text-slate-400 font-bold block mb-1">OR DIRECT PLAYBACK URL:</span>
                                  <input
                                    type="text"
                                    placeholder="https://example.com/stream.mp4"
                                    value={editVideoUrl}
                                    onChange={(e) => setEditVideoUrl(e.target.value)}
                                    className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:bg-white"
                                  />
                                </div>
                              </div>
                            )}

                            {editType === 'live-session' && (
                              <div className="p-5 bg-emerald-50/30 rounded-2xl border border-emerald-100/50 space-y-4">
                                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                                  <Radio className="w-4 h-4 text-red-500 animate-pulse" />
                                  Live Class Scheduling
                                </h4>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Scheduled Start Time</label>
                                    <input
                                      type="datetime-local"
                                      value={editScheduledAt}
                                      onChange={(e) => setEditScheduledAt(e.target.value)}
                                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-emerald-500/20"
                                    />
                                  </div>

                                  <div className="space-y-1.5 flex flex-col justify-end">
                                    <button
                                      onClick={() => setIsLiveOpen(true)}
                                      className="w-full py-2.5 bg-red-650 hover:bg-red-750 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md shadow-red-650/10 active:scale-95 transition-all"
                                    >
                                      START LIVE CLASS NOW
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Transcript box */}
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-450 uppercase tracking-wider block">Video Transcript (Optional)</label>
                              <textarea
                                placeholder="Add or generate video transcript here..."
                                rows={4}
                                className="w-full bg-slate-50/80 border border-slate-200 rounded-xl p-3 text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all resize-none"
                              />
                            </div>

                          </div>
                        )}

                        {/* Resources Tab */}
                        {editorTab === 'resources' && (
                          <div className="space-y-6">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-450 uppercase tracking-wider block">Upload Lecture Materials</label>
                              
                              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-emerald-500/50 transition-all bg-slate-50/30 flex flex-col items-center justify-center cursor-pointer relative group">
                                <input
                                  type="file"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      setResourceFile(file);
                                      addToast({ message: `Attachment staged: ${file.name}`, type: 'info' });
                                    }
                                  }}
                                  className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                                <Paperclip className="w-10 h-10 text-slate-400 group-hover:text-emerald-600 transition-colors mb-3" />
                                <span className="text-xs font-bold text-slate-700">Drag supporting PDF, ZIP, or slides here</span>
                              </div>

                              {resourceFile && (
                                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between text-xs animate-in slide-in-from-bottom duration-150">
                                  <span className="font-bold text-emerald-800">Staged Attachment: {resourceFile.name}</span>
                                  <button onClick={() => setResourceFile(null)} className="text-slate-450 hover:text-red-500"><X className="w-4 h-4" /></button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Notes / Description Tab with formatting toolbar */}
                        {editorTab === 'notes' && (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                <label className="text-[10px] font-black text-slate-450 uppercase tracking-wider block">Lecture Notes & Description</label>
                                <span className="text-[10px] text-slate-400 block">Provide rich textual contents for your lecture.</span>
                              </div>
                              
                              {/* Formatting toolbar */}
                              <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-lg border border-slate-200">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const tx = document.getElementById('notes-area') as HTMLTextAreaElement;
                                    if(tx) {
                                      const s = tx.selectionStart, e = tx.selectionEnd, val = tx.value;
                                      setEditDescription(val.slice(0, s) + `**${val.slice(s, e) || 'bold'}**` + val.slice(e));
                                    }
                                  }}
                                  className="px-2 py-1 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded shadow-sm transition-colors border border-slate-200"
                                  title="Bold"
                                >
                                  B
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const tx = document.getElementById('notes-area') as HTMLTextAreaElement;
                                    if(tx) {
                                      const s = tx.selectionStart, e = tx.selectionEnd, val = tx.value;
                                      setEditDescription(val.slice(0, s) + `*${val.slice(s, e) || 'italic'}*` + val.slice(e));
                                    }
                                  }}
                                  className="px-2 py-1 bg-white hover:bg-slate-50 text-slate-700 text-xs italic rounded shadow-sm transition-colors border border-slate-200"
                                  title="Italic"
                                >
                                  I
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const tx = document.getElementById('notes-area') as HTMLTextAreaElement;
                                    if(tx) {
                                      const s = tx.selectionStart, e = tx.selectionEnd, val = tx.value;
                                      setEditDescription(val.slice(0, s) + `\n- ${val.slice(s, e) || 'item'}` + val.slice(e));
                                    }
                                  }}
                                  className="px-2 py-1 bg-white hover:bg-slate-50 text-slate-700 text-xs rounded shadow-sm transition-colors border border-slate-200"
                                  title="Bullet List"
                                >
                                  • List
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const tx = document.getElementById('notes-area') as HTMLTextAreaElement;
                                    if(tx) {
                                      const s = tx.selectionStart, e = tx.selectionEnd, val = tx.value;
                                      setEditDescription(val.slice(0, s) + `[${val.slice(s, e) || 'link text'}](url)` + val.slice(e));
                                    }
                                  }}
                                  className="px-2 py-1 bg-white hover:bg-slate-50 text-slate-700 text-xs rounded shadow-sm transition-colors border border-slate-200"
                                  title="Link"
                                >
                                  Link
                                </button>
                              </div>
                            </div>

                            <textarea
                              id="notes-area"
                              placeholder="Add detailed reading text, core concepts, or lesson takeaways..."
                              value={editDescription}
                              onChange={(e) => setEditDescription(e.target.value)}
                              rows={12}
                              className="w-full bg-slate-50/85 border border-slate-200 rounded-2xl p-4 text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all font-medium leading-relaxed font-sans"
                            />
                          </div>
                        )}

                        {/* Quiz Builder Tab */}
                        {editorTab === 'quiz' && editType === 'quiz' && (
                          <div className="space-y-6">
                            <div className="flex items-center justify-between border-b pb-3">
                              <div>
                                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Logic Quiz Builder</h4>
                                <p className="text-[10px] text-slate-400">Design dynamic multiple choice questions.</p>
                              </div>
                              <button
                                onClick={() => {
                                  setQuizQuestions(prev => [
                                    ...prev,
                                    { question: '', options: ['', '', '', ''], correctAnswer: 0, points: 10 }
                                  ]);
                                }}
                                className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-black rounded-xl uppercase tracking-wider flex items-center gap-1.5 transition-all"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                Add Question
                              </button>
                            </div>

                            {quizQuestions.length > 0 ? (
                              <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
                                {quizQuestions.map((q, idx) => (
                                  <div key={idx} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 relative group/q animate-in slide-in-from-bottom-2 duration-200">
                                    <button
                                      onClick={() => {
                                        setQuizQuestions(prev => prev.filter((_, i) => i !== idx));
                                      }}
                                      className="absolute right-4 top-4 text-slate-400 hover:text-red-600 text-xs"
                                    >
                                      ✕ Delete
                                    </button>

                                    <div className="space-y-1.5">
                                      <label className="text-[9px] font-black text-slate-450 uppercase tracking-wider block">Question {idx + 1}</label>
                                      <input
                                        type="text"
                                        placeholder="e.g. Which of the following is NOT a Python primitive?"
                                        value={q.question}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          setQuizQuestions(prev => prev.map((item, i) => i === idx ? { ...item, question: val } : item));
                                        }}
                                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold"
                                      />
                                    </div>

                                    {/* 4 Options Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      {(q.options || ['', '', '', '']).map((opt: string, oIdx: number) => (
                                        <div key={oIdx} className="space-y-1.5">
                                          <label className="text-[8px] font-bold text-slate-450 uppercase block">Option {oIdx + 1}</label>
                                          <input
                                            type="text"
                                            value={opt}
                                            onChange={(e) => {
                                              const val = e.target.value;
                                              setQuizQuestions(prev => prev.map((item, i) => {
                                                if (i === idx) {
                                                  const newOpts = [...item.options];
                                                  newOpts[oIdx] = val;
                                                  return { ...item, options: newOpts };
                                                }
                                                return item;
                                              }));
                                            }}
                                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-emerald-500/20"
                                          />
                                        </div>
                                      ))}
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      <div className="space-y-1.5">
                                        <label className="text-[8px] font-bold text-slate-450 uppercase block">Correct Answer Option</label>
                                        <select
                                          value={q.correctAnswer}
                                          onChange={(e) => {
                                            const val = parseInt(e.target.value);
                                            setQuizQuestions(prev => prev.map((item, i) => i === idx ? { ...item, correctAnswer: val } : item));
                                          }}
                                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs outline-none"
                                        >
                                          <option value={0}>Option 1</option>
                                          <option value={1}>Option 2</option>
                                          <option value={2}>Option 3</option>
                                          <option value={3}>Option 4</option>
                                        </select>
                                      </div>

                                      <div className="space-y-1.5">
                                        <label className="text-[8px] font-bold text-slate-450 uppercase block">Points / Score</label>
                                        <input
                                          type="number"
                                          value={q.points || 10}
                                          onChange={(e) => {
                                            const val = parseInt(e.target.value) || 10;
                                            setQuizQuestions(prev => prev.map((item, i) => i === idx ? { ...item, points: val } : item));
                                          }}
                                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs outline-none"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-12 border border-dashed rounded-2xl bg-slate-50/50">
                                <p className="text-xs text-slate-450 italic">No questions added yet. Click &quot;+ Add Question&quot; above.</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Settings Tab */}
                        {editorTab === 'settings' && (
                          <div className="space-y-6">
                            
                            <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 flex items-center justify-between">
                              <div className="space-y-0.5 pr-4">
                                <label className="text-xs font-bold text-slate-800 uppercase block">Free Preview Lecture</label>
                                <span className="text-[10px] text-slate-400 block font-medium">Non-enrolled users can preview this lecture before purchasing.</span>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={editIsFreePreview}
                                  onChange={(e) => setEditIsFreePreview(e.target.checked)}
                                  className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-650"></div>
                              </label>
                            </div>

                            <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 flex items-center justify-between">
                              <div className="space-y-0.5 pr-4">
                                <label className="text-xs font-bold text-slate-800 uppercase block">Publish Status</label>
                                <span className="text-[10px] text-slate-400 block font-medium">Visible to enrolled students in their course curriculum.</span>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={editIsPublished}
                                  onChange={(e) => setEditIsPublished(e.target.checked)}
                                  className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-650"></div>
                              </label>
                            </div>

                          </div>
                        )}

                      </div>
                    </>
                  )}

                </div>
              )
            ) : (
              /* Upgraded Actionable Empty State */
              <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm space-y-8 animate-in fade-in duration-200">
                <div className="text-center py-6 border-b pb-6 max-w-xl mx-auto space-y-4">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto border border-emerald-100 shadow-inner overflow-hidden">
                    <Image
                      src="/sarthi-logo.png"
                      alt="SARTHI"
                      width={44}
                      height={44}
                      className="h-11 w-11 object-contain"
                    />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-md font-black text-slate-900 uppercase tracking-wider">Welcome to your Course Studio</h3>
                    <p className="text-xs text-slate-450 font-medium">
                      Manage milestones, design interactive lectures, and schedule live streams seamlessly.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                  {/* Guided Setup Checklist */}
                  <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-200/60 space-y-4">
                    <h4 className="text-xs font-black text-slate-850 uppercase tracking-widest pl-1">Guided Checklist</h4>
                    
                    <div className="space-y-3">
                      {[
                        { label: 'Add curriculum milestones', checked: milestones.length > 0 },
                        { label: 'Create your first lecture', checked: lessons.length > 0 },
                        { label: 'Set course thumbnail & details', checked: !!course?.thumbnail },
                        { label: 'Configure pricing parameters', checked: Number(course?.price || 0) > 0 }
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                          <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-black shrink-0 ${
                            item.checked 
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-650' 
                              : 'bg-slate-50 border-slate-200 text-slate-300'
                          }`}>
                            {item.checked ? '✓' : idx + 1}
                          </span>
                          <span className={`text-xs font-semibold ${item.checked ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick-Start Templates */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-slate-850 uppercase tracking-widest pl-1">Quick-Start Templates</h4>
                    
                    <div className="space-y-3">
                      {[
                        { title: '👋 Course Introduction & Syllabus', desc: 'Adds a module layout with intro lecture' },
                        { title: '📝 Lecture + Homework Core Concept', desc: 'Standard concept delivery template' },
                        { title: '❓ Quiz & Final Milestone Assessment', desc: 'Pre-seeds a complete test module' }
                      ].map((item, idx) => (
                        <div 
                          key={idx} 
                          onClick={async () => {
                            try {
                              // Auto-seed a new module & lecture as a template
                              const modRes = await fetch('/api/teacher/modules/add', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ courseId, title: item.title }),
                              });
                              if (modRes.ok) {
                                const newMod = await modRes.json();
                                await fetch('/api/teacher/lessons/add', {
                                  method: 'POST',
                                  body: (() => {
                                    const fd = new FormData();
                                    fd.append('courseId', courseId);
                                    fd.append('moduleId', newMod.id);
                                    fd.append('title', 'Get Started Lecture');
                                    fd.append('contentType', 'video');
                                    fd.append('isPublished', 'true');
                                    return fd;
                                  })()
                                });
                                addToast({ message: 'Template seeded successfully!', type: 'success' });
                                refetch();
                              }
                            } catch (e) {
                              addToast({ message: 'Seeding template failed.', type: 'error' });
                            }
                          }}
                          className="p-4 bg-white border border-slate-200/80 hover:border-emerald-500 rounded-2xl shadow-sm hover:shadow cursor-pointer transition-all space-y-1 text-left"
                        >
                          <h5 className="text-xs font-bold text-slate-800">{item.title}</h5>
                          <p className="text-[10px] text-slate-450">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="text-center pt-2">
                  <button 
                    onClick={handleAddLesson}
                    className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition-all"
                  >
                    + Create Your First Lecture
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Faculty Course Settings & Thumbnail Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-xl w-full p-6 space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 uppercase tracking-wide">Course Thumbnail & Settings</h3>
                <p className="text-xs text-slate-450 font-medium mt-0.5">Update thumbnail asset, course title, and pricing</p>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCourseSettings} className="space-y-5">
              {/* Thumbnail Image Preview */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wide block">Course Thumbnail Image</label>
                
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner group">
                  {courseThumbnailInput ? (
                    <img
                      src={courseThumbnailInput}
                      alt="Thumbnail Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/course-placeholder.jpg';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center space-y-2">
                      <UploadCloud className="w-8 h-8 text-slate-300" />
                      <span className="text-xs font-semibold">No thumbnail image selected</span>
                    </div>
                  )}
                  {isUploadingCourseThumbnail && (
                    <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-2">
                      <Loader2 className="w-7 h-7 animate-spin text-emerald-400" />
                      <span className="text-xs font-bold uppercase tracking-wider">Uploading Image...</span>
                    </div>
                  )}
                </div>

                {/* Dual Upload Options: File Upload OR Paste URL */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[10px] font-bold text-slate-450 uppercase block mb-1">Upload New Image File</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCourseThumbnailFileUpload}
                      disabled={isUploadingCourseThumbnail}
                      className="w-full text-xs text-slate-500 file:mr-2 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-450 uppercase block mb-1">OR Paste Image URL</label>
                    <input
                      type="text"
                      placeholder="https://... or /course-thumbnails/..."
                      value={courseThumbnailInput}
                      onChange={(e) => setCourseThumbnailInput(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>
              </div>

              {/* Course Title Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wide block">Course Title</label>
                <input
                  type="text"
                  required
                  value={courseTitleInput}
                  onChange={(e) => setCourseTitleInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {/* Course Price Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wide block">Course Price (INR ₹)</label>
                <input
                  type="number"
                  min="0"
                  value={coursePriceInput}
                  onChange={(e) => setCoursePriceInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingCourseSettings || isUploadingCourseThumbnail}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {isSavingCourseSettings ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
