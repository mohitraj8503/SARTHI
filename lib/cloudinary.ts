import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
});

export interface UploadResult {
  success: boolean;
  url?: string;
  publicId?: string;
  error?: string;
}

export interface DeleteResult {
  success: boolean;
  error?: string;
}

/**
 * Upload a profile photo to Cloudinary
 * @param file - The file buffer or base64 data
 * @param userId - User ID for unique public ID
 * @returns UploadResult with success status and URL
 */
export async function uploadProfilePhoto(
  file: Buffer | string,
  userId: string,
  mimeType: string = 'image/jpeg'
): Promise<UploadResult> {
  try {
    let fileData: any = file;

    if (Buffer.isBuffer(file)) {
      // For Buffer, use base64 directly with proper format using actual mime type
      fileData = `data:${mimeType};base64,${file.toString('base64')}`;
    }

    const result = await cloudinary.uploader.upload(fileData, {
      folder: 'profile-photos',
      public_id: `user_${userId}_${Date.now()}`,
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        { quality: 'auto', fetch_format: 'auto' },
      ],
      resource_type: 'image',
    });

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Delete a profile photo from Cloudinary
 * @param publicId - The public ID of the image to delete
 * @returns DeleteResult with success status
 */
export async function deleteProfilePhoto(publicId: string): Promise<DeleteResult> {
  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: 'image',
    });

    return { success: true };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed',
    };
  }
}

/**
 * Get optimized profile photo URL
 * @param url - Original Cloudinary URL
 * @param size - Desired size
 * @returns Optimized URL
 */
export function getOptimizedPhotoUrl(
  url: string,
  size: 'sm' | 'md' | 'lg' = 'md'
): string {
  if (!url) return '';

  const sizes = {
    sm: 80,
    md: 200,
    lg: 400,
  };

  const width = sizes[size];

  // Check if it's a Cloudinary URL
  if (url.includes('cloudinary.com')) {
    // Insert transformation into URL
    const parts = url.split('/upload/');
    if (parts.length === 2) {
      return `${parts[0]}/upload/w_${width},h_${width},c_fill,g_face,q_auto,f_auto/${parts[1]}`;
    }
  }

  return url;
}

/**
 * Check if Cloudinary is configured
 */
export function isCloudinaryConfigured(): boolean {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

/**
 * Upload a generated certificate PDF to Cloudinary
 * @param pdfBuffer - The PDF file buffer
 * @param verificationId - Verification ID for public ID
 * @returns UploadResult
 */
export async function uploadCertificate(
  pdfBuffer: Buffer,
  verificationId: string
): Promise<UploadResult> {
  try {
    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'certificates',
          public_id: verificationId,
          resource_type: 'auto',
          format: 'pdf',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(pdfBuffer);
    });

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error('Cloudinary certificate upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}


/**
 * Upload a teacher application document to Cloudinary
 * @param fileBuffer - The file buffer
 * @param fileName - Original filename or purpose
 * @param folder - Subfolder name
 * @returns UploadResult
 */
export async function uploadTeacherDoc(
  fileBuffer: Buffer,
  fileName: string,
  folder: string = 'teacher-applications'
): Promise<UploadResult> {
  try {
    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          public_id: `${fileName}_${Date.now()}`,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(fileBuffer);
    });

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error('Cloudinary doc upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Upload a course thumbnail to Cloudinary
 * @param file - The file buffer or base64 data
 * @param courseId - Course ID or slug for identifier
 * @returns UploadResult
 */
export async function uploadCourseThumbnail(
  file: Buffer | string,
  courseId: string,
  mimeType: string = 'image/jpeg'
): Promise<UploadResult> {
  try {
    let fileData: any = file;

    if (Buffer.isBuffer(file)) {
      fileData = `data:${mimeType};base64,${file.toString('base64')}`;
    }

    const result = await cloudinary.uploader.upload(fileData, {
      folder: 'course-thumbnails',
      public_id: `course_${courseId}_${Date.now()}`,
      transformation: [
        { width: 1280, height: 720, crop: 'fill' },
        { quality: 'auto', fetch_format: 'auto' },
      ],
      resource_type: 'image',
    });

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error('Cloudinary thumbnail upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Generic upload helper for various file types
 */
export async function uploadToCloudinary(
  file: File | Buffer | string,
  options: {
    folder: string;
    allowedFormats?: string[];
    maxSize?: number;
    resource_type?: 'image' | 'video' | 'raw' | 'auto';
  }
): Promise<any> {
  try {
    let fileData: any;
    
    if (file instanceof File) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      fileData = `data:${file.type};base64,${buffer.toString('base64')}`;
    } else if (Buffer.isBuffer(file)) {
      fileData = `data:application/octet-stream;base64,${file.toString('base64')}`;
    } else {
      fileData = file;
    }

    const result = await cloudinary.uploader.upload(fileData, {
      folder: options.folder,
      resource_type: options.resource_type || 'auto',
      allowed_formats: options.allowedFormats,
    });

    return result;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
}

export default cloudinary;
