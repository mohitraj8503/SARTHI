/**
 * Secure File Validation Middleware
 * Enforces strict MIME-type and size limits to prevent malicious uploads.
 */
export const fileUploadConfig = {
  allowedTypes: {
    assignment: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
    thumbnail: ['image/jpeg', 'image/png', 'image/webp'],
    video: ['video/mp4', 'video/webm', 'video/quicktime']
  },
  maxSize: {
    assignment: 20 * 1024 * 1024, // 20MB
    thumbnail: 5 * 1024 * 1024,   // 5MB
    video: 500 * 1024 * 1024      // 500MB
  }
} as const;

export async function validateFileUpload(file: File, type: keyof typeof fileUploadConfig.allowedTypes) {
  const errors: string[] = [];
  
  // 1. Content Type Verification
  if (!(fileUploadConfig.allowedTypes[type] as readonly string[]).includes(file.type)) {
    errors.push(`Invalid file type: ${file.type}. Allowed: ${fileUploadConfig.allowedTypes[type].join(', ')}`);
  }
  
  // 2. Size Constraint Verification
  if (file.size > fileUploadConfig.maxSize[type]) {
    const maxMb = fileUploadConfig.maxSize[type] / (1024 * 1024);
    errors.push(`File too large (${(file.size / (1024 * 1024)).toFixed(2)}MB). Max allowed: ${maxMb}MB`);
  }
  
  return { 
    valid: errors.length === 0, 
    errors 
  };
}
