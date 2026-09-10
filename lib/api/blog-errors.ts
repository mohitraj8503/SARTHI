/**
 * Specialized Blog API Error Handling
 * Maps standard HTTP failures to user-friendly content creation contexts.
 */
export class BlogError extends Error {
  constructor(
    public message: string,
    public code: 'AUTH' | 'NETWORK' | 'VALIDATION' | 'SERVER',
    public status?: number
  ) {
    super(message);
    this.name = 'BlogError';
  }
}

export const handleBlogSyncError = (err: any): BlogError => {
  if (err instanceof TypeError && err.message.includes('fetch')) {
    return new BlogError('Connection lost. Changes saved locally.', 'NETWORK');
  }
  
  if (err.status === 401 || err.status === 403) {
    return new BlogError('Session expired. Please log in again to sync.', 'AUTH', err.status);
  }
  
  if (err.status === 413) {
    return new BlogError('Content too large for a single draft.', 'VALIDATION', err.status);
  }

  return new BlogError('Failed to sync with server. Check internet.', 'SERVER');
};
