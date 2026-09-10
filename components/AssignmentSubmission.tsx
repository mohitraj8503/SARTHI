'use client';

import { useState } from 'react';
import {
  FileText,
  X,
  Upload,
  CheckCircle,
  AlertCircle,
  Loader2,
  File as FileIcon,
  FileArchive,
  ImageIcon,
} from 'lucide-react';
import { useToast } from '@/components/ToastProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface Props {
  courseId: string;
  lessonId: string;
  onSuccess?: () => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/zip',
  'application/x-zip-compressed',
  'image/jpeg',
  'image/png',
];

export default function AssignmentSubmission({ courseId, lessonId, onSuccess }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { addToast } = useToast();
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles: File[] = [];

    for (const file of selectedFiles) {
      if (file.size > MAX_FILE_SIZE) {
        addToast({ message: `${file.name} is too large (max 10MB)`, type: 'error' });
        continue;
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        addToast({ message: `${file.name} type not supported`, type: 'error' });
        continue;
      }
      validFiles.push(file);
    }

    setFiles((prev) => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (files.length === 0) return;
    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    // Simulate upload progress
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 90 ? 90 : prev + 10));
    }, 200);

    try {
      const res = await fetch(`/api/course/${courseId}/assignment/${lessonId}/submit`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Submission failed');

      clearInterval(interval);
      setProgress(100);
      addToast({ message: 'Solution submitted 🚀', type: 'success' });
      setFiles([]);
      
      // Refresh to update the status in the server-side LearnPage
      router.refresh();
      onSuccess?.();
    } catch (err: any) {
      addToast({ message: err.message, type: 'error' });
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const getFileIcon = (type: string) => {
    if (type.includes('image')) return <ImageIcon className="w-5 h-5" />;
    if (type.includes('zip')) return <FileArchive className="w-5 h-5" />;
    if (type.includes('pdf')) return <FileText className="w-5 h-5" />;
    return <FileIcon className="w-5 h-5" />;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border-2 border-dashed border-gray-100 dark:border-gray-700 transition-all">
      <div className="flex flex-col items-center text-center p-4">
        <Upload className="w-12 h-12 text-brand-orange mb-4 opacity-50" />
        <h3 className="text-lg font-black text-gray-900 dark:text-white">Upload Your Solution</h3>
        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">
          PDF, DOC, ZIP, or Images (Max 10MB)
        </p>

        <label className="mt-6">
          <input
            type="file"
            multiple
            className="hidden"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.zip,.jpg,.jpeg,.png"
          />
          <div className="px-8 py-3 bg-brand-dark text-white rounded-xl font-black uppercase tracking-widest cursor-pointer hover:bg-brand-orange transition-all shadow-lg text-xs">
            Select Files
          </div>
        </label>
      </div>

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 space-y-2"
          >
            {files.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-center gap-3">
                  <div className="text-brand-orange">{getFileIcon(file.type)}</div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-gray-900 dark:text-white truncate max-w-[200px]">
                      {file.name}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(idx)}
                  className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}

            <div className="pt-4 border-t border-gray-100 dark:border-gray-700 mt-4">
              {uploading && (
                <div className="mb-4">
                  <div className="flex justify-between text-[10px] font-black uppercase text-gray-400 mb-1">
                    <span>Uploading...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-brand-orange"
                      animate={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={uploading}
                className="w-full py-4 bg-brand-orange text-white rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xl shadow-brand-orange/20"
              >
                {uploading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <CheckCircle className="w-5 h-5" />
                )}
                Submit {files.length} {files.length === 1 ? 'File' : 'Files'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

