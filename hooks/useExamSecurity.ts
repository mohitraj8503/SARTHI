'use client';

import { useEffect, useState, useCallback } from 'react';

export function useExamSecurity(examId: string, onTerminated: () => void) {
  const [violations, setViolations] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 7. LOG VIOLATIONS TO SERVER
  const logViolation = useCallback(async (type: string, details: string, count: number) => {
    try {
      await fetch(`/api/certifications/${examId}/violations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          details,
          timestamp: new Date().toISOString(),
          violationCount: count,
        }),
      });
    } catch (error) {
      console.error('Failed to log violation:', error);
    }
  }, [examId]);

  // 1. PREVENT TAB SWITCHING
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setViolations(prev => {
          const newViolations = prev + 1;
          logViolation('TAB_SWITCH', 'User switched to another tab', newViolations);
          
          if (newViolations >= 15) {
            alert('Exam terminated: Too many tab switches detected');
            onTerminated();
          }
          return newViolations;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [onTerminated, logViolation]);

  // 2. FORCE FULLSCREEN MODE
  const enterFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  }, []);

  // 3. DETECT FULLSCREEN EXIT
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
        setViolations(prev => {
          const newViolations = prev + 1;
          logViolation('FULLSCREEN_EXIT', 'User exited fullscreen mode', newViolations);
          return newViolations;
        });
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [logViolation]);

  // 4. PREVENT RIGHT-CLICK
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      setViolations(prev => {
        const newViolations = prev + 1;
        logViolation('RIGHT_CLICK', 'User attempted right-click', newViolations);
        return newViolations;
      });
      return false;
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.body.style.userSelect = 'none'; // Prevent text selection
    
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.body.style.userSelect = 'auto';
    };
  }, [logViolation]);

  // 5. PREVENT COPY/PASTE/CUT
  useEffect(() => {
    const preventShortcut = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && ['c', 'v', 'x', 'p', 's'].includes(e.key.toLowerCase())) ||
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && ['i', 'j', 'c'].includes(e.key.toLowerCase()))
      ) {
        e.preventDefault();
        setViolations(prev => {
          const newViolations = prev + 1;
          logViolation('KEYBOARD_SHORTCUT', `Blocked shortcut: ${e.key}`, newViolations);
          return newViolations;
        });
      }
    };

    document.addEventListener('keydown', preventShortcut);
    return () => document.removeEventListener('keydown', preventShortcut);
  }, [logViolation]);

  // 6. DETECT DEVTOOLS OPENING
  useEffect(() => {
    const detectDevTools = () => {
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      
      if (widthThreshold || heightThreshold) {
        setViolations(prev => {
          const newViolations = prev + 1;
          logViolation('DEVTOOLS_DETECTED', 'Browser DevTools opened', newViolations);
          return newViolations;
        });
      }
    };

    const interval = setInterval(detectDevTools, 1000);
    return () => clearInterval(interval);
  }, [logViolation]);

  // 8. HEARTBEAT MONITORING
  useEffect(() => {
    const sendHeartbeat = async () => {
      try {
        await fetch(`/api/certifications/${examId}/heartbeat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            timestamp: Date.now(),
            isActive: true,
          }),
        });
      } catch (error) {
        console.error('Heartbeat failed:', error);
      }
    };

    const interval = setInterval(sendHeartbeat, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, [examId]);

  return {
    violations,
    isFullscreen,
    enterFullscreen,
  };
}
