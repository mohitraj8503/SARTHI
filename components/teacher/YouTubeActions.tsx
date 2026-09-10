'use client';

import { useState } from 'react';
import {
    Video,
    Upload,
    X,
    Loader2,
    CheckCircle,
    AlertCircle,
    Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function YouTubeActions() {
    const [showBroadcastModal, setShowBroadcastModal] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);

    return (
        <>
            {/* Action Buttons */}
            <div className="flex gap-3">
                <button
                    onClick={() => setShowBroadcastModal(true)}
                    className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl border border-red-500 shadow-sm shadow-red-500/20 text-sm font-bold transition-all flex items-center gap-2"
                >
                    <Video className="w-4 h-4" />
                    Go Live
                </button>
                <button
                    onClick={() => setShowUploadModal(true)}
                    className="bg-white hover:bg-slate-50 text-slate-700 px-5 py-2.5 rounded-xl border border-slate-200 shadow-sm text-sm font-bold transition-all flex items-center gap-2"
                >
                    <Upload className="w-4 h-4 text-orange-500" />
                    Upload Video
                </button>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {showBroadcastModal && (
                    <BroadcastModal onClose={() => setShowBroadcastModal(false)} />
                )}
                {showUploadModal && (
                    <UploadModal onClose={() => setShowUploadModal(false)} />
                )}
            </AnimatePresence>
        </>
    );
}

function BroadcastModal({ onClose }: { onClose: () => void }) {
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<'form' | 'success'>('form');
    const [result, setResult] = useState<any>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        scheduledStartTime: new Date(Date.now() + 5 * 60000).toISOString().slice(0, 16) // Default 5 mins from now
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/teacher/youtube/broadcast', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    scheduledStartTime: new Date(formData.scheduledStartTime).toISOString()
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to create broadcast');

            setResult(data);
            setStep('success');
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden"
            >
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Video className="w-5 h-5 text-red-600" />
                        Go Live (Private)
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {step === 'form' ? (
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Title</label>
                            <input
                                required
                                type="text"
                                className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                                placeholder="e.g., Q&A Session: React Hooks"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                            <textarea
                                className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 min-h-[100px]"
                                placeholder="What will this session cover?"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Schedule Start</label>
                            <input
                                required
                                type="datetime-local"
                                className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                                value={formData.scheduledStartTime}
                                onChange={e => setFormData({ ...formData, scheduledStartTime: e.target.value })}
                            />
                            <p className="text-xs text-slate-400 mt-1">Session will be created as &quot;Private&quot; on the admin channel.</p>
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-5 py-2.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20 disabled:opacity-50 flex items-center gap-2"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Broadcast'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="p-8 text-center space-y-4">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">Broadcast Created!</h3>
                        <p className="text-slate-500">Your session is ready to go live.</p>

                        <div className="bg-slate-50 p-4 rounded-xl text-left space-y-3 mt-4 text-sm">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-slate-700">Stream Key:</span>
                                <code className="bg-white px-2 py-1 rounded border border-slate-200 text-red-500 font-mono select-all">
                                    {result.streamKey}
                                </code>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-slate-700">Ingestion URL:</span>
                                <code className="bg-white px-2 py-1 rounded border border-slate-200 text-slate-600 font-mono select-all max-w-[200px] truncate">
                                    {result.ingestionAddress}
                                </code>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="w-full py-3 rounded-xl font-bold text-white bg-slate-900 hover:bg-black mt-4"
                        >
                            Close
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
}

function UploadModal({ onClose }: { onClose: () => void }) {
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<'form' | 'success'>('form');
    const [result, setResult] = useState<any>(null);
    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', title);
        formData.append('description', description);

        try {
            const res = await fetch('/api/teacher/youtube/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to upload video');

            setResult(data);
            setStep('success');
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden"
            >
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Upload className="w-5 h-5 text-orange-600" />
                        Upload Video (Private)
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {step === 'form' ? (
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Video File</label>
                            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
                                <input
                                    type="file"
                                    accept="video/*"
                                    onChange={e => setFile(e.target.files?.[0] || null)}
                                    required
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                                <div className="flex flex-col items-center gap-2 pointer-events-none">
                                    {file ? (
                                        <>
                                            <CheckCircle className="w-8 h-8 text-green-500" />
                                            <span className="text-sm font-bold text-slate-700">{file.name}</span>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-8 h-8 text-slate-300" />
                                            <span className="text-sm font-bold text-slate-400">Click to select video</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Title</label>
                            <input
                                required
                                type="text"
                                className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                                placeholder="Video Title"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                            <textarea
                                className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 min-h-[80px]"
                                placeholder="Description..."
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                            />
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-5 py-2.5 rounded-xl font-bold text-white bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-600/20 disabled:opacity-50 flex items-center gap-2"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Start Upload'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="p-8 text-center space-y-4">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">Upload Complete!</h3>
                        <p className="text-slate-500">Your video has been uploaded privately to the channel.</p>

                        <a
                            href={result.youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block text-orange-600 font-bold hover:underline"
                        >
                            View on YouTube
                        </a>

                        <button
                            onClick={onClose}
                            className="w-full py-3 rounded-xl font-bold text-white bg-slate-900 hover:bg-black mt-4"
                        >
                            Close
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
}

