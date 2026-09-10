import { useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/components/ToastProvider';

interface UseAutoSaveOptions {
  onSave: () => Promise<void>;
  delay?: number;
  enabled?: boolean;
}

export const useAutoSave = ({ onSave, delay = 2000, enabled = true }: UseAutoSaveOptions) => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const { addToast } = useToast();

  const save = useCallback(async () => {
    try {
      await onSave();
      addToast({
        type: 'success',
        title: 'Auto-saved',
        message: 'Your changes have been saved automatically',
        duration: 2000
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Auto-save failed',
        message: 'Please save manually',
        duration: 4000
      });
    }
  }, [onSave, addToast]);

  const triggerAutoSave = useCallback(() => {
    if (!enabled) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(save, delay);
  }, [save, delay, enabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { triggerAutoSave };
};
