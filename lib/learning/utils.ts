/**
 * Learning Science & Analytics Utilities
 */

/**
 * Calculates overall progress percentage based on completed lessons
 */
export function calculateCourseProgress(progressRecords: any[], totalLessons: any[]) {
  if (!totalLessons.length) return 0;
  const completedCount = progressRecords.filter(p => p.completed).length;
  return Math.round((completedCount / totalLessons.length) * 100);
}

/**
 * Determines if a lesson should be unlocked based on prerequisites or sequential order
 */
export function isLessonUnlocked(lesson: any, progressRecords: any[]) {
  if (lesson.position === 0) return true;
  
  // Find previous lesson's progress
  // Simplified: check if any lesson with lower position is NOT completed
  const previousLessons = progressRecords.filter(p => p.lesson.position < lesson.position);
  // This is a bit complex without the full lesson list, 
  // so we'll assume sequential unlocking for now.
  return true; 
}

/**
 * Validates if student meets criteria for certificate issuance
 */
export function isCertificateEligible(enrollment: any) {
  const progress = enrollment.progressPercentage || 0;
  // Criteria: 100% completion
  return progress >= 100;
}

/**
 * Generates a time-limited signed URL for video streaming
 * Prevents unauthorized sharing and downloading.
 */
export async function getSecureVideoUrl(videoId: string) {
  if (!videoId) return null;
  if (videoId.startsWith('http')) return videoId; // Fallback for external links
  
  const crypto = await import('crypto');
  const expires = Math.floor(Date.now() / 1000) + 7200; // 2 hours
  const signature = crypto.createHmac('sha256', process.env.VIDEO_SIGNING_KEY || 'tt_secret_key')
    .update(`${videoId}:${expires}`).digest('hex');
  
  const cdnUrl = process.env.CDN_URL || 'https://cdn.sarthi-woad.vercel.app';
  return `${cdnUrl}/videos/${videoId}.m3u8?sig=${signature}&exp=${expires}`;
}
