'use client';

import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStudentStore } from '../store/useStudentStore';
import { Student, StudentSummary } from '../types';

export const useStudents = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const {
    searchTerm,
    setSearchTerm,
    filter,
    setFilter,
    segment,
    setSegment,
    page,
    setPage,
    sortBy,
    sortOrder,
    setSort,
    toggleSort,
    visibleCount,
    setVisibleCount,
    showMore,
    resetVisibleCount,
    selection,
    toggleSelect,
    selectAll,
    clearSelection
  } = useStudentStore();

  // Sync URL with store on mount
  useEffect(() => {
    const s = searchParams.get('search') || searchParams.get('q');
    const f = searchParams.get('filter');
    const seg = searchParams.get('segment');
    const sb = searchParams.get('sortBy');
    const so = searchParams.get('sortOrder') as 'asc' | 'desc';
    
    if (s) setSearchTerm(s);
    if (f) setFilter(f);
    if (seg && ['all', 'main', 'junior'].includes(seg.toLowerCase())) {
      setSegment(seg.toLowerCase() as any);
    }
    if (sb) setSort(sb, so || 'asc');
  }, [searchParams, setFilter, setSearchTerm, setSegment, setSort]);

  // Sync store with URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (filter !== 'all') params.set('filter', filter);
    if (segment !== 'all') params.set('segment', segment);
    if (sortBy && sortBy !== 'createdAt') params.set('sortBy', sortBy);
    if (sortOrder && sortOrder !== 'desc') params.set('sortOrder', sortOrder);
    
    const queryString = params.toString();
    router.replace(`/admin/students${queryString ? `?${queryString}` : ''}`, { scroll: false });
  }, [searchTerm, filter, segment, sortBy, sortOrder, router]);

  // Fetch Full Student Dataset (high-performance lean query)
  const { 
    data: studentsData, 
    isLoading: isStudentsLoading, 
    isFetching: isStudentsFetching,
    isError: isStudentsError,
    error: studentsError,
    refetch: refetchStudents
  } = useQuery({
    queryKey: ['admin-students-all'],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: '1',
        pageSize: '5000',
        filter: 'all',
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      const res = await fetch(`/api/admin/students?${params.toString()}`);
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson?.error?.message || errJson?.message || 'Failed to fetch students');
      }
      return res.json();
    },
    staleTime: 1000 * 30, // 30 seconds
  });

  // Fetch Summary
  const { data: summaryData, isLoading: isSummaryLoading } = useQuery<StudentSummary>({
    queryKey: ['admin-students-summary'],
    queryFn: async () => {
      const res = await fetch('/api/admin/students/summary');
      if (!res.ok) throw new Error('Failed to fetch summary');
      const result = await res.json();
      return result.data;
    }
  });

  const rawStudents = (studentsData?.data as Student[]) || [];

  // 1. Filter Dataset
  const filteredStudents = useMemo(() => {
    let list = [...rawStudents];

    // Apply Segment Filter (All | Main | Junior | Pending)
    if (segment && segment !== 'all') {
      if (segment === 'pending') {
        list = list.filter(s => (s.status || '').toUpperCase() === 'PENDING');
      } else {
        const target = segment.toUpperCase();
        list = list.filter(s => (s.platformSegment || 'MAIN').toUpperCase() === target);
      }
    }

    // Apply Filter Dropdown
    if (filter && filter !== 'all' && filter !== 'All') {
      const lowerF = filter.toLowerCase();
      if (lowerF === 'active') {
        list = list.filter(s => (s.status || '').toUpperCase() === 'ACTIVE');
      } else if (lowerF === 'pending') {
        list = list.filter(s => (s.status || '').toUpperCase() === 'PENDING');
      } else if (lowerF === 'inactive') {
        list = list.filter(s => ['INACTIVE', 'SUSPENDED', 'BANNED', 'DELETED'].includes((s.status || '').toUpperCase()));
      } else if (lowerF.startsWith('course_')) {
        const courseId = filter.replace('course_', '');
        list = list.filter(s => s.enrollments?.some((e: any) => e.course?.id === courseId));
      }
    }

    // Apply Search Query across Name, Email, Enrollment Number/ID
    if (searchTerm && searchTerm.trim().length > 0) {
      const query = searchTerm.trim().toLowerCase();
      list = list.filter(s => 
        (s.name && s.name.toLowerCase().includes(query)) ||
        (s.email && s.email.toLowerCase().includes(query)) ||
        (s.enrollmentNumber && s.enrollmentNumber.toLowerCase().includes(query)) ||
        (s.studentId && s.studentId.toLowerCase().includes(query)) ||
        (s.id && s.id.toLowerCase().includes(query))
      );
    }

    return list;
  }, [rawStudents, segment, filter, searchTerm]);

  // 2. Sort across ALL Filtered Students
  const sortedStudents = useMemo(() => {
    if (!sortBy || !sortOrder) return filteredStudents;

    const list = [...filteredStudents];

    list.sort((a, b) => {
      let valA: any = '';
      let valB: any = '';

      if (sortBy === 'name') {
        valA = (a.name || '').toLowerCase();
        valB = (b.name || '').toLowerCase();
      } else if (sortBy === 'email') {
        valA = (a.email || '').toLowerCase();
        valB = (b.email || '').toLowerCase();
      } else if (sortBy === 'createdAt') {
        valA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        valB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      } else if (sortBy === 'status') {
        const statusRank: Record<string, number> = {
          'ACTIVE': 1,
          'SUSPENDED': 2,
          'PENDING': 3,
          'INACTIVE': 4,
          'DELETED': 5,
        };
        valA = statusRank[a.status] || 99;
        valB = statusRank[b.status] || 99;
      } else {
        valA = (a as any)[sortBy] || '';
        valB = (b as any)[sortBy] || '';
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;

      // Secondary deterministic sort (Email comparison then ID)
      const emailA = (a.email || '').toLowerCase();
      const emailB = (b.email || '').toLowerCase();
      return emailA.localeCompare(emailB);
    });

    return list;
  }, [filteredStudents, sortBy, sortOrder]);

  // 3. Slice for Visible Rendering (Incremental Show More)
  const totalFilteredCount = sortedStudents.length;
  const visibleStudents = useMemo(() => {
    return sortedStudents.slice(0, visibleCount);
  }, [sortedStudents, visibleCount]);

  const hasMore = visibleCount < totalFilteredCount;

  // Derived Selection State
  const selectedCount = selection.type === 'all' 
    ? totalFilteredCount - selection.excludedIds.size
    : selection.ids.size;

  const isSelected = (id: string) => {
    if (selection.type === 'all') return !selection.excludedIds.has(id);
    return selection.ids.has(id);
  };

  return {
    students: visibleStudents,
    allFilteredStudents: sortedStudents,
    totalCount: totalFilteredCount,
    rawTotalCount: rawStudents.length,
    visibleCount,
    showingCount: visibleStudents.length,
    hasMore,
    showMore,
    resetVisibleCount,
    selectedCount,
    isSelected,
    toggleSelect,
    selectAll: () => selectAll(sortedStudents.map(s => s.id)),
    clearSelection,
    isStudentsLoading,
    isStudentsFetching,
    isStudentsError,
    studentsError,
    refetchStudents,
    isSummaryLoading,
    summaryData,
    sortBy,
    sortOrder,
    setSort,
    toggleSort
  };
};
