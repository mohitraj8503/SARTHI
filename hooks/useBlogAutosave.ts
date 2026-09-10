'use client'

import { useState, useEffect } from 'react';
import { useDebouncedCallback } from './useDebouncedCallback';
import { toast } from 'react-hot-toast';

/**
 * Intelligent Blog Autosave Hook
 * Implements persistent draft syncing with multi-layer recovery (Server + LocalStorage).
 */
export function useBlogAutosave(blogId: string, getContent: () => string) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  // High-reliability autosave (30s debounce)
  const debouncedSave = useDebouncedCallback(async () => {
    const content = getContent();
    if (!content || content.trim() === '<p></p>') return; // Skip empty content
    
    setIsSaving(true);
    setSaveError(null);
    
    try {
      const response = await fetch(`/api/blogs/${blogId}/draft`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          lastModified: new Date().toISOString(),
          meta: {
            userAgent: navigator.userAgent,
            timestamp: Date.now()
          }
        })
      });
      
      if (!response.ok) throw new Error('Autosave synchronization failed');
      
      setLastSaved(new Date());
      
      // Local backup for zero-data-loss
      localStorage.setItem(`blog-draft-${blogId}`, JSON.stringify({
        content,
        savedAt: new Date().toISOString()
      }));
      
    } catch (error) {
      setSaveError('Failed to sync draft. Saving locally...');
      localStorage.setItem(`blog-draft-${blogId}`, JSON.stringify({
        content,
        savedAt: new Date().toISOString(),
        offline: true
      }));
    } finally {
      setIsSaving(false);
    }
  }, 30000);

  // Critical save on window exit
  useEffect(() => {
    const handleBeforeUnload = () => {
      const content = getContent();
      if (content && content.length > 50) {
        localStorage.setItem(`blog-draft-${blogId}`, JSON.stringify({
          content,
          savedAt: new Date().toISOString(),
          urgent: true
        }));
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [blogId, getContent]);

  return { lastSaved, isSaving, saveError, triggerSave: debouncedSave };
}
