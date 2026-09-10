'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ToastProvider';
import { useStudentStore } from '../store/useStudentStore';

export const useStudentMutations = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const { closeModals, clearSelection, selection } = useStudentStore();

  const handleSuccess = (message: string, invalidateSummary = false) => {
    addToast({ type: 'success', title: 'Success', message });
    queryClient.invalidateQueries({ queryKey: ['admin-students'] });
    if (invalidateSummary) {
      queryClient.invalidateQueries({ queryKey: ['admin-students-summary'] });
    }
    closeModals();
    clearSelection();
  };

  const addStudentMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add', data }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to add student');
      return result.data;
    },
    onSuccess: () => handleSuccess('Student has been successfully added', true),
    onError: (error: any) => addToast({ type: 'error', title: 'Error', message: error.message }),
  });

  const editStudentMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'edit', studentId: data.id, data }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to edit student');
      return result.data;
    },
    onSuccess: () => handleSuccess('Student has been successfully updated'),
    onError: (error: any) => addToast({ type: 'error', title: 'Error', message: error.message }),
  });

  const deleteStudentMutation = useMutation({
    mutationFn: async (studentId: string) => {
      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', studentId }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error?.message || result.error || 'Failed to deactivate student');
      return result.data;
    },
    onSuccess: () => handleSuccess('Student has been deactivated', true),
    onError: (error: any) => addToast({ type: 'error', title: 'Deletion Failed', message: error.message }),
  });

  const suspendStudentMutation = useMutation({
    mutationFn: async ({ studentId, reason, policy, action }: { studentId: string, reason?: string, policy?: string, action: 'suspend' | 'restore' }) => {
      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, studentId, reason, policy }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to update status');
      return result.data;
    },
    onSuccess: (_, variables) => {
      const isRestoring = variables.action === 'restore';
      handleSuccess(isRestoring ? 'Student access has been restored' : 'Student has been suspended');
    },
    onError: (error: any) => addToast({ type: 'error', title: 'Error', message: error.message }),
  });

  const bulkActionMutation = useMutation({
    mutationFn: async ({ action, data }: { action: string, data?: any }) => {
      const ids = selection.type === 'all' ? null : Array.from(selection.ids);
      const excludedIds = selection.type === 'all' ? Array.from(selection.excludedIds) : null;
      
      const res = await fetch('/api/admin/bulk-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action, 
          ids, 
          excludedIds,
          selectAll: selection.type === 'all',
          ...data 
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Bulk action failed');
      return result;
    },
    onSuccess: (_, variables) => {
      handleSuccess(`Bulk ${variables.action} completed successfully`, true);
    },
    onError: (error: any) => addToast({ type: 'error', title: 'Error', message: error.message }),
  });


  const resetPasswordMutation = useMutation({
    mutationFn: async (studentId: string) => {
      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset-password', studentId }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to send reset link');
      return result.data;
    },
    onSuccess: () => handleSuccess('Password reset link has been sent to the student'),
    onError: (error: any) => addToast({ type: 'error', title: 'Error', message: error.message }),
  });

  return {
    addStudentMutation,
    editStudentMutation,
    deleteStudentMutation,
    suspendStudentMutation,
    bulkActionMutation,
    resetPasswordMutation
  };
};

