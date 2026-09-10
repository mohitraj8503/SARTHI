'use client';

import React from 'react';
import { Edit2, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import UserAvatar from '@/components/ui/UserAvatar';

interface RightSidebarProps {
    user?: any;
    upcomingLessons?: any[];
}

export default function RightSidebar({ user, upcomingLessons }: RightSidebarProps) {
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = React.useState(false);
    const [currentImage, setCurrentImage] = React.useState(user?.image);

    React.useEffect(() => {
        setCurrentImage(user?.image);
    }, [user?.image]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch('/api/user/profile/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            if (data.success) {
                setCurrentImage(data.url);
            } else {
                alert(data.error || 'Upload failed');
            }
        } catch (err) {
            console.error('Upload error:', err);
            alert('Failed to upload image');
        } finally {
            setIsUploading(false);
        }
    };

    const events = (upcomingLessons || []).slice(0, 5).map(s => ({
        name: s.title,
        color: s.isLiveNow ? 'bg-red-500 shadow-red-500/20' : 'bg-[#174F3A] shadow-[#174F3A]/20',
        time: s.startTime ? new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Scheduled'
    }));

    const initials = user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'ST';

    return (
        <div className="w-full lg:w-80 space-y-8 bg-white lg:bg-transparent p-6 lg:p-0 rounded-2xl lg:rounded-none shadow-sm lg:shadow-none">
            {/* Profile Section */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm text-center border border-gray-100">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Operational Identity</h3>
                    <Link href="/dashboard/settings" className="p-2.5 bg-gray-50 rounded-xl text-gray-400 hover:text-[#174F3A] hover:bg-white transition-all border border-transparent hover:border-gray-100">
                        <Edit2 size={14} />
                    </Link>
                </div>
                
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleImageUpload}
                />

                <div 
                    className="relative w-32 h-32 mx-auto mb-8 cursor-pointer group"
                    onClick={() => fileInputRef.current?.click()}
                    title="Click to change profile photo"
                >
                    <div className="p-1 rounded-[2.5rem] border-2 border-dashed border-gray-100 group-hover:border-[#174F3A]/20 transition-all duration-500 group-hover:scale-105">
                        <UserAvatar 
                            user={{
                                name: user?.name,
                                avatar_url: currentImage || user?.avatar_url
                            }} 
                            size="lg" 
                        />
                    </div>
                    {isUploading && (
                        <div className="absolute inset-2 bg-white/80 rounded-[2.2rem] backdrop-blur-sm flex items-center justify-center z-20">
                            <div className="w-8 h-8 border-4 border-[#174F3A] border-t-transparent rounded-full animate-spin shadow-xl shadow-[#174F3A]/20" />
                        </div>
                    )}
                    <div className="absolute inset-2 bg-[#174F3A]/80 rounded-[2.2rem] opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center text-white text-[9px] font-black uppercase tracking-[0.2em] backdrop-blur-md z-10 font-outfit italic">
                        SYNC PHOTO
                    </div>
                </div>
                
                <h4 className="text-xl font-black text-gray-900 font-outfit uppercase italic leading-none">{user?.name || 'Student'}</h4>
                <p className="text-[10px] text-[#174F3A] font-black uppercase tracking-widest mt-2 opacity-50">{user?.role || 'Academy Member'}</p>
            </div>

            {/* Calendar Section */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <button className="p-2 hover:bg-gray-50 rounded-xl transition-all text-gray-400 border border-transparent hover:border-gray-100">
                        <ChevronLeft size={16} />
                    </button>
                    <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em] font-outfit italic">
                        {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </h3>
                    <button className="p-2 hover:bg-gray-50 rounded-xl transition-all text-gray-400 border border-transparent hover:border-gray-100">
                        <ChevronRight size={16} />
                    </button>
                </div>

                <div className="grid grid-cols-6 gap-3 text-center">
                    {/* Simplified calendar for current week */}
                    {Array.from({ length: 6 }).map((_, i) => {
                        const date = new Date();
                        date.setDate(date.getDate() - 2 + i);
                        const isToday = date.toDateString() === new Date().toDateString();
                        return (
                            <div key={i} className="space-y-3">
                                <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest leading-none">
                                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                                </p>
                                <div className={cn(
                                    "w-9 h-9 flex items-center justify-center rounded-2xl text-[11px] font-black transition-all shadow-sm",
                                    isToday 
                                        ? 'bg-[#174F3A] text-white shadow-xl shadow-[#174F3A]/20' 
                                        : 'text-gray-900 hover:bg-gray-50 border border-transparent hover:border-gray-100 bg-gray-50/50'
                                )}>
                                    {date.getDate()}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Upcoming Events Timeline */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
                <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.3em] font-outfit italic">Upcoming Trajectories</h3>
                
                {events.length > 0 ? (
                    <div className="space-y-8 relative pl-4 border-l border-gray-50">
                        {events.map((event, i) => (
                            <div key={i} className="relative">
                                <div className={cn("absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white", event.color.split(' ')[0])} />
                                <div className="space-y-2">
                                    <div className="text-[8px] font-black text-gray-300 uppercase tracking-widest">{event.time}</div>
                                    <div className={cn("px-5 py-2.5 rounded-xl text-white text-[9px] font-black uppercase tracking-widest shadow-lg", event.color)}>
                                        {event.name}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 space-y-4">
                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto shadow-inner">
                            <Clock className="w-6 h-6 text-gray-200" />
                        </div>
                        <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest italic">Zero Scheduled Tasks</p>
                    </div>
                )}
            </div>
        </div>
    );
}
