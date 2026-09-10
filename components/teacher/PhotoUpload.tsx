'use client';

import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Camera, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface PhotoUploadProps {
  value?: string;
  onChange: (url: string) => void;
  email: string;
  compact?: boolean;
}

export function PhotoUpload({ value, onChange, email, compact = false }: PhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxSize: 5 * 1024 * 1024, // 5MB
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      try {
        const file = acceptedFiles[0];
        console.log("📸 Starting upload for file:", file.name, "type:", file.type, "size:", file.size);
        setIsUploading(true);
        setError('');

        const fd = new FormData();
        fd.append('file', file);
        fd.append('type', 'profilePhoto');
        fd.append('email', email);

        console.log("🚀 Sending POST request to /api/upload/teacher-docs...");
        const res = await fetch('/api/upload/teacher-docs', {
          method: 'POST',
          body: fd
        });

        if (!res.ok) {
          const data = await res.json();
          console.error("❌ Upload failed with status:", res.status, "Error:", data.error);
          throw new Error(data.error || 'Upload failed');
        }

        const data = await res.json();
        console.log("✅ Upload successful! URL:", data.url);
        onChange(data.url);
      } catch (err: any) {
        console.error("🧨 Upload caught error:", err);
        setError(err.message || "Upload failed. Try again.");
      } finally {
        setIsUploading(false);
      }
    },
  });

  return (
    <div className="">
      <div 
        {...getRootProps()} 
        className={`relative rounded-none border-[2px] border-dashed transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center gap-2 ${
          compact ? 'w-full aspect-square' : 'w-[220px] h-[220px]'
        } ${
          isDragActive ? 'border-[#4ade80] bg-[#4ade80]/5' : value ? 'border-[#4ade80]/40' : 'border-white/30 hover:border-white/50 bg-white/[0.03]'
        }`}
      >
        <input {...getInputProps()} />
        
        {value ? (
          <>
            { }
            <img
              src={value}
              alt="Profile Preview"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
            {/* hover overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0,0,0,0.5)',
                opacity: 0,
                transition: 'opacity 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
              }}
              className="group-hover:opacity-100 hover:opacity-100"
            >
              <Camera className="w-7 h-7 text-[#4ade80]" />
            </div>
            {isUploading && (
              <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm flex items-center justify-center" style={{ zIndex: 20 }}>
                <Loader2 className="w-7 h-7 animate-spin text-[#4ade80]" />
              </div>
            )}
          </>
        ) : isUploading ? (
          <Loader2 className="w-7 h-7 animate-spin text-[#4ade80]" />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 text-center px-4">
            <div className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/5 flex items-center justify-center mb-1 text-white shadow-inner">
              <Camera className="w-4 h-4 text-white/80" />
            </div>
            <span className="text-[13px] font-bold text-white block mt-1 tracking-wide">Upload photo</span>
            <span className="text-[10px] font-medium text-slate-500 block">.JPG, .PNG up to 5MB</span>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-red-500 font-medium mt-2">
          <AlertCircle className="w-3 h-3" /> {error}
        </div>
      )}

      {value && !isUploading && (
        <div className="flex items-center gap-2 text-xs text-[#4ade80] font-bold mt-2">
          <CheckCircle2 className="w-3 h-3" /> Photo verified
        </div>
      )}
    </div>
  );
}
