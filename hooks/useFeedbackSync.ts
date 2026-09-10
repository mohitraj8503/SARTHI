import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'react-hot-toast';

/**
 * Student Feedback Synchronization Hook
 * Listens for grading events and provides instant UI feedback.
 */
export function useFeedbackSync(studentId: string) {
  useEffect(() => {
    if (!studentId || typeof window === 'undefined') return;

    const socket: Socket = io(process.env.NEXT_PUBLIC_APP_URL || '', {
      path: '/api/socket',
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      // Authenticate with session token
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('next-auth.session-token='))
        ?.split('=')[1];
      
      if (token) {
        socket.emit('authenticate', token);
      }
    });

    // Handle incoming feedback notifications
    socket.on('feedback:received', (data: any) => {
      console.log('🎉 Grading Update Received:', data);
      
      toast.success(`🎉 Your work was graded! Score: ${data.score}%`, {
        duration: 8000,
        position: 'top-center',
        icon: '🎓',
        style: {
          borderRadius: '20px',
          background: '#064e3b',
          color: '#fff',
          fontWeight: 'bold',
          padding: '20px'
        }
      });
      
      // Optionally trigger data re-validation here (e.g., queryClient.invalidateQueries)
    });

    return () => {
      socket.off('feedback:received');
      socket.disconnect();
    };
  }, [studentId]);
}
