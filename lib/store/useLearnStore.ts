import { create } from 'zustand';

interface LearnState {
  currentLessonId: string;
  completedLessons: string[];
  progressPercent: number;
  sidebarOpen: boolean;
  activeTab: 'overview' | 'resources' | 'discussion' | 'quiz';
  isZenMode: boolean;
  videoProgress: Record<string, number>;
  
  // Actions
  setLesson: (lessonId: string) => void;
  markComplete: (lessonId: string) => void;
  setCompletedLessons: (lessonIds: string[]) => void;
  setProgressPercent: (percent: number) => void;
  setSidebarOpen: (open: boolean) => void;
  setTab: (tab: 'overview' | 'resources' | 'discussion' | 'quiz') => void;
  setZenMode: (enabled: boolean) => void;
  saveVideoProgress: (lessonId: string, time: number) => void;
}

export const useLearnStore = create<LearnState>((set) => ({
  currentLessonId: '',
  completedLessons: [],
  progressPercent: 0,
  sidebarOpen: true,
  activeTab: 'overview',
  isZenMode: false,
  videoProgress: {},

  setLesson: (lessonId) => set({ currentLessonId: lessonId }),
  
  markComplete: (lessonId) => set((state) => {
    if (state.completedLessons.includes(lessonId)) return {};
    const nextCompleted = [...state.completedLessons, lessonId];
    return { completedLessons: nextCompleted };
  }),
  
  setCompletedLessons: (lessonIds) => set({ completedLessons: lessonIds }),
  
  setProgressPercent: (percent) => set({ progressPercent: percent }),
  
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  
  setTab: (tab) => set({ activeTab: tab }),
  
  setZenMode: (enabled) => set({ isZenMode: enabled }),
  
  saveVideoProgress: (lessonId, time) => set((state) => ({
    videoProgress: {
      ...state.videoProgress,
      [lessonId]: time,
    }
  })),
}));
