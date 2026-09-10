/**
 * Learning Progress Service
 * Handles client-side progression tracking and server-side synchronization.
 */

export async function markLessonComplete(lessonId: string) {
  try {
    const res = await fetch(`/api/student/lessons/${lessonId}/complete`, {
      method: 'POST'
    });
    return res.ok;
  } catch (err) {
    console.error('Failed to mark lesson as complete:', err);
    return false;
  }
}

export async function saveProgress(lessonId: string, percentage: number) {
  try {
    // Fire and forget progress update
    navigator.sendBeacon(`/api/student/lessons/${lessonId}/progress`, JSON.stringify({ percentage }));
  } catch (err) {
    // Ignore errors for non-critical tracking
  }
}
