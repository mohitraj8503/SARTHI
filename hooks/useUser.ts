'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/components/AuthProvider';

export function useUser(userId?: string) {
  const { user: authUser } = useAuth();
  const queryClient = useQueryClient();
  const id = userId || authUser?.id;

  const { data: user, isLoading, error, refetch } = useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await fetch(`/api/users/${id}`);
      if (!res.ok) throw new Error('Failed to fetch user');
      return res.json();
    },
    enabled: !!id,
    staleTime: 60 * 1000, // 1 minute
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update profile');
      return res.json();
    },
    onSuccess: () => {
      // Invalidate both the specific user query and the general auth state if needed
      queryClient.invalidateQueries({ queryKey: ['user', id] });
    },
  });

  return {
    user,
    isLoading,
    error,
    refetch,
    updateProfile: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}
