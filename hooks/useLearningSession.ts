'use client'

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';

/**
 * Cognitive Load & Focus Hook
 * Implements Pomodoro-style sessions and automatic progression tracking.
 */
export function useLearningSession(courseId: string) {
  const [sessionStart] = useState(Date.now());
  const [focusMode, setFocusMode] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  
  // Pomodoro: Notify student after 25 minutes of deep study
  useEffect(() => {
    if (!focusMode) return;
    
    const studyTimer = setTimeout(() => {
      toast('🧠 Time for a cognitive reset! Take 5 mins.', {
        duration: 10000,
        icon: '☕',
        style: { borderRadius: '20px', background: '#1e293b', color: '#fff' }
      });
    }, 25 * 60 * 1000);
    
    return () => clearTimeout(studyTimer);
  }, [focusMode]);
  
  // High-frequency heartbeats to track actual study time
  useEffect(() => {
    const interval = setInterval(() => {
      const activeTime = Math.floor((Date.now() - sessionStart) / 1000);
      setTimeSpent(activeTime);
      
      // Heartbeat to server every 2 minutes
      if (activeTime > 0 && activeTime % 120 === 0) {
        syncSessionTime(courseId, 120);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [courseId, sessionStart]);
  
  const syncSessionTime = async (id: string, seconds: number) => {
    try {
      navigator.sendBeacon('/api/student/analytics/session', JSON.stringify({ courseId: id, seconds }));
    } catch (err) { /* Silent fail */ }
  };
  
  return { focusMode, setFocusMode, timeSpent };
}
