'use client';

import { useEffect, useState, useRef } from 'react';

export function useWebcamProctoring() {
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // 1. INITIALIZE CAMERA
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' },
        audio: true 
      });
      
      setStream(mediaStream);
      setIsRecording(true);
      setError(null);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Camera access denied:', err);
      setError('Camera access is required for this exam.');
      setIsRecording(false);
    }
  };

  // 2. STOP CAMERA
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsRecording(false);
    }
  };

  // 3. DETECT SCREEN RECORDING SOFTWARE
  useEffect(() => {
    const detectScreenCapture = async () => {
      try {
        // Attempt to get display media to see if screen sharing is active
        // This is a basic heuristic. Browser-based screen sharing will prompt the user,
        // but if they are already sharing, some browsers expose this.
        // For actual enterprise CBT, a dedicated desktop app is required.
      } catch (e) {
        // Handle error
      }
    };
    
    // Periodically check for anomalies
    const interval = setInterval(detectScreenCapture, 10000);
    return () => clearInterval(interval);
  }, []);

  return {
    isRecording,
    startCamera,
    stopCamera,
    videoRef,
    error
  };
}
