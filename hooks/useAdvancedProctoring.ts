import { useState, useCallback, useRef } from 'react';

interface ProctoringAnalysis {
  riskLevel: 'low' | 'medium' | 'high';
  flags: string[];
  confidence: number;
  requiresHumanReview: boolean;
}

export function useAdvancedProctoring(examId: string) {
  const [aiAnalysis, setAiAnalysis] = useState<ProctoringAnalysis | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastCaptureTime = useRef<number>(0);

  // Enhanced client-side collection
  const collectProctoringData = useCallback(async () => {
    // Throttle captures to every 5 seconds
    if (Date.now() - lastCaptureTime.current < 5000) return;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Capture frame from video stream
    if (videoRef.current && videoRef.current.readyState === 4) {
      canvas.width = 320;
      canvas.height = 240;
      ctx?.drawImage(videoRef.current, 0, 0, 320, 240);
      const frameData = canvas.toDataURL('image/jpeg', 0.7);
      
      lastCaptureTime.current = Date.now();

      // Send to AI analysis endpoint
      try {
        const response = await fetch(`/api/proctoring/${examId}/analyze`, {
          method: 'POST',
          body: JSON.stringify({ frame: frameData, timestamp: Date.now() }),
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.analysis) {
            setAiAnalysis(result.analysis);
          }
        }
      } catch (error) {
        console.error('Proctoring analysis failed:', error);
      }
    }
  }, [examId]);

  return {
    videoRef,
    aiAnalysis,
    collectProctoringData
  };
}
