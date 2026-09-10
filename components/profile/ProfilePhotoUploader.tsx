'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Camera, Upload, X, Loader2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProfilePhotoUploaderProps {
  currentPhoto?: string | null;
  onUploadComplete: (url: string) => void;
  onDelete?: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  editable?: boolean;
}

const SIZE_CONFIG = {
  sm: { container: 'w-16 h-16 rounded-2xl', avatar: 'w-14 h-14 rounded-xl', button: 'w-8 h-8 rounded-lg' },
  md: { container: 'w-24 h-24 rounded-[1.5rem]', avatar: 'w-20 h-20 rounded-2xl', button: 'w-10 h-10 rounded-xl' },
  lg: { container: 'w-32 h-32 rounded-[2rem]', avatar: 'w-28 h-28 rounded-[1.5rem]', button: 'w-12 h-12 rounded-2xl' },
  xl: { container: 'w-40 h-40 rounded-[3rem]', avatar: 'w-36 h-36 rounded-[2.5rem]', button: 'w-16 h-16 rounded-[1.25rem]' },
};

export default function ProfilePhotoUploader({
  currentPhoto,
  onUploadComplete,
  onDelete,
  size = 'md',
  editable = true,
}: ProfilePhotoUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [showFullSize, setShowFullSize] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const config = SIZE_CONFIG[size];

  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a JPG, PNG, GIF, or WebP image');
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image must be less than 5MB');
        return;
      }

      setIsUploading(true);

      try {
        const formData = new FormData();
        formData.append('image', file); // Sync with new API field name

        const response = await fetch('/api/user/profile/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Upload failed');
        }

        const data = await response.json();
        onUploadComplete(data.url);
      } catch (error) {
        console.error('Upload error:', error);
        alert(error instanceof Error ? error.message : 'Failed to upload image');
      } finally {
        setIsUploading(false);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [onUploadComplete]
  );

  const handleDelete = useCallback(async () => {
    if (!currentPhoto) return;

    if (!confirm('Are you sure you want to delete your profile photo?')) {
      return;
    }

    setIsUploading(true);

    try {
      const response = await fetch('/api/upload/profile-photo/delete', {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Delete failed');
      }

      onDelete?.();
    } catch (error) {
      console.error('Delete error:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete image');
    } finally {
      setIsUploading(false);
    }
  }, [currentPhoto, onDelete]);

  // Generate fallback avatar URL
  const getFallbackAvatar = () => {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=User&backgroundColor=ff5a1f`;
  };

  const displayPhoto = currentPhoto || getFallbackAvatar();

  return (
    <>
      <div className="relative group">
        {/* Avatar Display */}
        <div
          className={`${config.container} overflow-hidden bg-gray-50 border border-gray-100 relative cursor-pointer group shadow-inner transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#174F3A]/10`}
          onClick={() => editable && setShowFullSize(true)}
        >
          {displayPhoto ? (
            <Image
              src={displayPhoto}
              alt="Profile photo"
              fill
              unoptimized={displayPhoto.includes('api.dicebear.com') || displayPhoto.endsWith('.svg')}
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#174F3A]/5">
              <Camera className="w-8 h-8 text-[#174F3A]/40" />
            </div>
          )}

          {/* Hover Overlay */}
          {editable && (
            <div className="absolute inset-0 bg-[#174F3A]/40 opacity-0 group-hover:opacity-100 backdrop-blur-sm transition-all duration-500 flex items-center justify-center">
              <Camera className="w-10 h-10 text-white" />
            </div>
          )}
        </div>

        {/* Upload Button */}
        {editable && (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className={`absolute -bottom-2 -right-2 ${config.button} bg-[#174F3A] text-white shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all disabled:opacity-50 border-4 border-white`}
          >
            {isUploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Camera className="w-5 h-5" />
            )}
          </button>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />
      </div>

      {/* Delete Button */}
      {editable && currentPhoto && onDelete && (
        <button
          onClick={handleDelete}
          disabled={isUploading}
          className="mt-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-red-600 flex items-center gap-2 transition-all disabled:opacity-50 font-outfit"
        >
          <Trash2 className="w-4 h-4" />
          Purge Node
        </button>
      )}

      {/* Full Size Modal */}
      <AnimatePresence>
        {showFullSize && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-4"
            onClick={() => setShowFullSize(false)}
          >
            <button
              onClick={() => setShowFullSize(false)}
              className="absolute top-4 right-4 text-white/80 hover:text-white"
            >
              <X className="w-8 h-8" />
            </button>

            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-2xl max-h-[80vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={displayPhoto}
                alt="Profile photo full size"
                width={400}
                height={400}
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />

              {editable && (
                <div className="absolute bottom-0 left-0 right-0 p-10 bg-gradient-to-t from-black/80 to-transparent flex justify-center gap-6">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="h-16 px-8 bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-2xl flex items-center gap-4 hover:bg-white/20 transition-all disabled:opacity-50 text-[11px] font-black uppercase tracking-widest font-outfit italic"
                  >
                    {isUploading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Upload className="w-5 h-5" />
                    )}
                    Synchronize New Identity
                  </button>

                  {currentPhoto && onDelete && (
                    <button
                      onClick={handleDelete}
                      disabled={isUploading}
                      className="h-16 px-8 bg-red-500/20 backdrop-blur-xl border border-red-500/20 text-red-200 rounded-2xl flex items-center gap-4 hover:bg-red-500/30 transition-all disabled:opacity-50 text-[11px] font-black uppercase tracking-widest font-outfit italic"
                    >
                      <Trash2 className="w-5 h-5" />
                      Terminate Node
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

