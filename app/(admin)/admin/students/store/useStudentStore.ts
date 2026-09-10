import { create } from 'zustand';
import { Student } from '../types';

interface StudentSelection {
  type: 'manual' | 'all';
  ids: Set<string>;
  excludedIds: Set<string>;
}

interface StudentStore {
  // Filters
  searchTerm: string;
  filter: string;
  segment: 'all' | 'main' | 'junior' | 'pending';
  page: number;
  sortBy: string | null;
  sortOrder: 'asc' | 'desc' | null;
  visibleCount: number;
  setSearchTerm: (term: string) => void;
  setFilter: (filter: string) => void;
  setSegment: (segment: 'all' | 'main' | 'junior' | 'pending') => void;
  setPage: (page: number) => void;
  setSort: (sortBy: string | null, sortOrder: 'asc' | 'desc' | null) => void;
  toggleSort: (column: string) => void;
  setVisibleCount: (count: number | ((prev: number) => number)) => void;
  showMore: (step?: number) => void;
  resetVisibleCount: () => void;

  // Selection
  selection: StudentSelection;
  toggleSelect: (id: string) => void;
  selectAll: (allIds: string[]) => void;
  clearSelection: () => void;

  // Modals
  modals: {
    add: boolean;
    edit: boolean;
    delete: boolean;
    suspend: boolean;
    bulkEmail: boolean;
    bulkSuspend: boolean;
    bulkDelete: boolean;
    courses: boolean;
    resetPassword: boolean;
  };
  selectedStudent: Student | null;
  openModal: (type: keyof StudentStore['modals'], student?: Student | null) => void;
  closeModals: () => void;
}

export const useStudentStore = create<StudentStore>((set) => ({
  // Filters Initial State
  searchTerm: '',
  filter: 'all',
  segment: 'all',
  page: 1,
  sortBy: 'createdAt',
  sortOrder: 'desc',
  visibleCount: 10,

  setSearchTerm: (searchTerm) => set({ searchTerm, page: 1, visibleCount: 10 }),
  setFilter: (filter) => set({ filter, page: 1, visibleCount: 10 }),
  setSegment: (segment) => set({ segment, page: 1, visibleCount: 10 }),
  setPage: (page) => set({ page }),
  setSort: (sortBy, sortOrder) => set({ sortBy, sortOrder }),
  toggleSort: (column) => set((state) => {
    if (state.sortBy !== column) {
      return { sortBy: column, sortOrder: 'asc' };
    } else if (state.sortOrder === 'asc') {
      return { sortBy: column, sortOrder: 'desc' };
    } else {
      // 3rd click: Return to default (Joined date desc)
      return { sortBy: 'createdAt', sortOrder: 'desc' };
    }
  }),
  setVisibleCount: (count) => set((state) => ({
    visibleCount: typeof count === 'function' ? count(state.visibleCount) : count
  })),
  showMore: (step = 10) => set((state) => ({ visibleCount: state.visibleCount + step })),
  resetVisibleCount: () => set({ visibleCount: 10 }),

  // Selection Initial State
  selection: {
    type: 'manual',
    ids: new Set(),
    excludedIds: new Set(),
  },
  toggleSelect: (id) => set((state) => {
    const nextIds = new Set(state.selection.ids);
    const nextExcluded = new Set(state.selection.excludedIds);
    
    if (state.selection.type === 'all') {
      if (nextExcluded.has(id)) nextExcluded.delete(id);
      else nextExcluded.add(id);
    } else {
      if (nextIds.has(id)) nextIds.delete(id);
      else nextIds.add(id);
    }
    
    return {
      selection: {
        ...state.selection,
        ids: nextIds,
        excludedIds: nextExcluded,
      }
    };
  }),
  selectAll: (allIds) => set((state) => ({
    selection: {
      type: state.selection.type === 'all' ? 'manual' : 'all',
      ids: state.selection.type === 'all' ? new Set() : new Set(allIds),
      excludedIds: new Set(),
    }
  })),
  clearSelection: () => set({
    selection: { type: 'manual', ids: new Set(), excludedIds: new Set() }
  }),

  // Modals Initial State
  modals: {
    add: false,
    edit: false,
    delete: false,
    suspend: false,
    bulkEmail: false,
    bulkSuspend: false,
    bulkDelete: false,
    courses: false,
    resetPassword: false,
  },
  selectedStudent: null,
  openModal: (type, student = null) => set((state) => ({
    modals: { ...state.modals, [type]: true },
    selectedStudent: student || state.selectedStudent
  })),
  closeModals: () => set({
    modals: {
      add: false,
      edit: false,
      delete: false,
      suspend: false,
      bulkEmail: false,
      bulkSuspend: false,
      bulkDelete: false,
      courses: false,
      resetPassword: false,
    },
    selectedStudent: null
  })
}));

