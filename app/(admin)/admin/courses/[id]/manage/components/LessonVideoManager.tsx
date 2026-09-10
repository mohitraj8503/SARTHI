'use client';

import { useState, useRef } from 'react';
import { 
    Upload, Loader2, CheckCircle2, AlertCircle, 
    Play, Trash2, Link, Download, Zap, X
} from 'lucide-react';
import { useToast } from '@/components/ToastProvider';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface LessonVideoManagerProps {
    lesson: any;
    onClose: () => void;
    onUpdate: () => void;
}

export default function LessonVideoManager({ lesson, onClose, onUpdate }: LessonVideoManagerProps) {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [uploadStep, setUploadStep] = useState<'IDLE' | 'INITIATING' | 'UPLOADING' | 'COMPLETED' | 'ERROR'>('IDLE');
    const [videoId, setVideoId] = useState<string | null>(lesson.youtube_video_id || null);
    const [bindId, setBindId] = useState('');
    const { addToast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const initiateUpload = async () => {
        if (!file) return;
        
        try {
            setUploadStep('INITIATING');
            setIsUploading(true);
            
            // 1. Get Resumable Upload URL from our Backend
            const sessionRes = await fetch('/api/admin/youtube/upload/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: lesson.title,
                    description: `Teaching session for course lesson: ${lesson.title}`,
                    privacy: 'private',
                    lessonId: lesson.id
                })
            });

            const sessionData = await sessionRes.json();
            if (!sessionData.success) {
                throw new Error(sessionData.error?.message || "Failed to initiate session");
            }

            const uploadUrl = sessionData.data.uploadUrl;
            setUploadStep('UPLOADING');

            // 2. Perform the actual upload to Google (using XMLHttpRequest for progress)
            const xhr = new XMLHttpRequest();
            xhr.open('PUT', uploadUrl, true);
            xhr.setRequestHeader('Content-Type', file.type);
            
            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable) {
                    const pct = Math.round((e.loaded / e.total) * 100);
                    setProgress(pct);
                }
            };

            xhr.onload = async () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    const response = JSON.parse(xhr.responseText);
                    const newVideoId = response.id;
                    setVideoId(newVideoId);
                    setUploadStep('COMPLETED');
                    
                    // 3. Finalize: Bind to Lesson in our DB
                    await finalizeBinding(newVideoId);
                    
                    addToast({ message: "Video uploaded and linked successfully!", type: "success" });
                    onUpdate();
                } else {
                    setUploadStep('ERROR');
                    setIsUploading(false);
                }
            };

            xhr.onerror = () => {
                setUploadStep('ERROR');
                setIsUploading(false);
            };

            xhr.send(file);

        } catch (err: any) {
            console.error(err);
            setUploadStep('ERROR');
            setIsUploading(false);
            addToast({ message: err.message || "Upload failed", type: "error" });
        }
    };

    const finalizeBinding = async (id: string) => {
        try {
            const res = await fetch(`/api/admin/lessons/${lesson.id}/bind-video`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ videoId: id })
            });
            return res.json();
        } catch (e) {
            console.error("Binding failed:", e);
        }
    }

    const handleBindExisting = async () => {
        if (!bindId) return;
        try {
            setIsUploading(true);
            const data = await finalizeBinding(bindId);
            setVideoId(bindId);
            addToast({ message: "Lesson bound to YouTube Video ID", type: "success" });
            onUpdate();
        } catch (e) {
            addToast({ message: "Linking failed", type: "error" });
        } finally {
            setIsUploading(false);
        }
    }

    return (
        <div className="flex flex-col h-full bg-white relative overflow-hidden">
             {/* Stage Header */}
             <div className="p-8 border-b border-[#F0F4F8] flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#3A6BC4]/5 flex items-center justify-center text-[#3A6BC4]">
                        <Zap className="w-6 h-6 fill-current" />
                    </div>
                    <div>
                        <h4 className="text-[18px] font-black text-[#1C2B4A]">Terminal Teaching Studio</h4>
                        <p className="text-[12px] text-[#7A8FAF] font-medium">Fast-track your content delivery with private teaching flows.</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-[#F8F9FC] rounded-lg transition-all text-[#7A8FAF] hover:text-[#1C2B4A]">
                    <X className="w-6 h-6" />
                </button>
             </div>

             <div className="flex-1 overflow-y-auto p-10">
                <div className="max-w-3xl mx-auto space-y-12">
                   
                   {/* Status Card */}
                   <div className={cn(
                       "p-8 rounded-[32px] border-2 transition-all duration-500 flex items-center gap-8",
                       videoId ? "bg-green-50/50 border-green-100" : "bg-[#F8F9FC]/50 border-[#F0F4F8]"
                   )}>
                        <div className={cn(
                            "w-20 h-20 rounded-[24px] flex items-center justify-center transition-all duration-700",
                            videoId ? "bg-green-600 text-white shadow-xl shadow-green-600/20" : "bg-[#1C2B4A]/5 text-[#1C2B4A]"
                        )}>
                            {videoId ? <CheckCircle2 className="w-10 h-10" /> : <Play className="w-10 h-10" />}
                        </div>
                        <div className="flex-1">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7A8FAF] mb-1 block">Live Synchronization</span>
                            <h5 className="text-[20px] font-black text-[#1C2B4A]">{videoId ? "Content Stream Active" : "Waiting for Stream Source"}</h5>
                            <p className="text-[13px] text-[#7A8FAF] font-medium mt-1">
                                {videoId ? `Bound to YouTube ID: ${videoId}` : "This lesson requires a video source to be accessible to students."}
                            </p>
                        </div>
                   </div>

                   {/* Main Actions Grid */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        
                        {/* Action: Fast Upload */}
                        <div className={cn(
                            "group p-8 rounded-[32px] border-2 transition-all duration-300 flex flex-col items-center text-center",
                            uploadStep === 'IDLE' ? "bg-white border-[#F0F4F8] hover:border-[#1C2B4A]" : "bg-[#F8F9FC] border-[#1C2B4A]"
                        )}>
                            <div className="w-16 h-16 rounded-[20px] bg-[#1C2B4A]/5 flex items-center justify-center text-[#1C2B4A] group-hover:scale-110 transition-transform mb-6">
                                <Download className="w-8 h-8" />
                            </div>
                            <h6 className="text-[16px] font-black text-[#1C2B4A]">Fast Private Upload</h6>
                            <p className="text-[12px] text-[#7A8FAF] font-medium mt-2 mb-8">Best for new recordings. Private on site by default.</p>
                            
                            {uploadStep === 'IDLE' ? (
                                <>
                                    <input 
                                        type="file" 
                                        accept="video/*" 
                                        className="hidden" 
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                    />
                                    {file ? (
                                        <div className="w-full space-y-4">
                                            <div className="p-3 bg-white border border-[#E2E8F4] rounded-xl text-[11px] font-bold text-[#1C2B4A] truncate">
                                                {file.name}
                                            </div>
                                            <button 
                                                onClick={initiateUpload}
                                                className="w-full py-4 bg-[#1C2B4A] text-white rounded-2xl text-[12px] font-bold uppercase tracking-widest hover:bg-[#2C3E5F] transition-all shadow-lg shadow-[#1C2B4A]/20"
                                            >
                                                Start Teaching Flow
                                            </button>
                                            <button onClick={() => setFile(null)} className="text-[10px] font-black uppercase text-red-500 tracking-widest hover:underline">
                                                Cancel Selection
                                            </button>
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-full py-4 bg-white border border-[#E2E8F4] text-[#1C2B4A] rounded-2xl text-[12px] font-bold uppercase tracking-widest hover:bg-[#1C2B4A] hover:text-white transition-all"
                                        >
                                            Select Local File
                                        </button>
                                    )}
                                </>
                            ) : (
                                <div className="w-full space-y-6">
                                    <div className="relative pt-1">
                                        <div className="flex mb-2 items-center justify-between">
                                            <div>
                                                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-[#1C2B4A] bg-[#1C2B4A]/10">
                                                    {uploadStep === 'COMPLETED' ? 'Synced' : 'Uploading'}
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs font-semibold inline-block text-[#1C2B4A]">
                                                    {progress}%
                                                </span>
                                            </div>
                                        </div>
                                        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-[#1C2B4A]/10">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progress}%` }}
                                                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-[#1C2B4A] transition-all"
                                            />
                                        </div>
                                    </div>
                                    {uploadStep === 'INITIATING' && <p className="text-[11px] text-[#7A8FAF] animate-pulse">Requesting Terminal Access...</p>}
                                    {uploadStep === 'ERROR' && (
                                        <div className="flex flex-col items-center gap-3">
                                            <AlertCircle className="w-6 h-6 text-red-500" />
                                            <p className="text-[11px] text-red-500 font-bold uppercase tracking-widest">Protocol Sync Error</p>
                                            <button onClick={() => setUploadStep('IDLE')} className="text-[10px] font-medium text-[#7A8FAF] underline">Try Again</button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Action: Link ID */}
                        <div className="p-8 rounded-[32px] border-2 border-[#F0F4F8] hover:border-[#1C2B4A] transition-all duration-300 flex flex-col text-left">
                            <div className="w-14 h-14 rounded-[18px] bg-[#3A6BC4]/5 flex items-center justify-center text-[#3A6BC4] mb-6">
                                <Link className="w-6 h-6" />
                            </div>
                            <h6 className="text-[16px] font-black text-[#1C2B4A]">Link Metadata</h6>
                            <p className="text-[12px] text-[#7A8FAF] font-medium mt-2 mb-6">Already have it on YouTube? Bind the ID instantly.</p>
                            
                            <div className="space-y-4 mt-auto">
                                <input 
                                    type="text" 
                                    placeholder="YouTube Video ID"
                                    value={bindId}
                                    onChange={(e) => setBindId(e.target.value)}
                                    className="w-full px-5 py-4 bg-[#F8F9FC] border border-[#E2E8F4] rounded-2xl text-[14px] font-bold text-[#1C2B4A] outline-none focus:border-[#1C2B4A] transition-all"
                                />
                                <button 
                                    onClick={handleBindExisting}
                                    className="w-full py-4 bg-[#1C2B4A] text-white rounded-2xl text-[12px] font-bold uppercase tracking-widest hover:bg-[#2C3E5F] transition-all"
                                    disabled={!bindId || isUploading}
                                >
                                    Instant Bind
                                </button>
                            </div>
                        </div>

                   </div>

                   {/* Pro Tips / Information */}
                   <div className="p-6 bg-amber-50/50 border border-amber-100 rounded-[28px] flex items-start gap-5">
                        <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-1" />
                        <div>
                            <h6 className="text-[14px] font-bold text-amber-900 uppercase tracking-tight">Teaching Protocol Reminders</h6>
                            <p className="text-[12px] text-amber-800/70 font-medium leading-relaxed mt-1">
                                Uploaded videos are set to &quot;Private&quot; on your YouTube channel. Ensure your students have the necessary access permissions through the platform portal. Resumable uploads allow you to recover from connection drops.
                            </p>
                        </div>
                   </div>

                </div>
             </div>
        </div>
    );
}
