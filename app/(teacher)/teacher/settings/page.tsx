'use client';

export const dynamic = 'force-dynamic';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Lock, Bell, Settings as SettingsIcon,
    Camera, Save, Mail, Globe, Shield,
    Trash2, ChevronRight,
    Eye, EyeOff, Loader2, Upload, X,
    Key, CreditCard, ExternalLink
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { useUser } from '@/hooks/useUser';
import { useToast } from '@/components/ToastProvider';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const NOTIF_STORAGE_KEY = 'teacher-notification-settings';

const defaultNotifications = {
    newEnrollments: true,
    assignmentSubmissions: true,
    courseReviews: false,
    weeklyReports: true,
    promotionalUpdates: false,
    newMessages: true,
    seminarReminders: true,
};

type NotificationKeys = keyof typeof defaultNotifications;

function loadNotifications(): typeof defaultNotifications {
    if (typeof window === 'undefined') return defaultNotifications;
    try {
        const stored = localStorage.getItem(NOTIF_STORAGE_KEY);
        if (stored) return { ...defaultNotifications, ...JSON.parse(stored) };
    } catch { }
    return defaultNotifications;
}

export default function TeacherSettingsPage() {
    const { user: authUser, updateUser: updateAuthUser } = useAuth();
    const { user, updateProfile, isUpdating, isLoading } = useUser(authUser?.id);
    const { addToast } = useToast();
    const [activeTab, setActiveTab] = useState('Profile');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Profile form state
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [expertise, setExpertise] = useState('');
    const [location, setLocation] = useState('');
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

    // Password form state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // Notification state
    const [notifications, setNotifications] = useState(defaultNotifications);

    // Delete account state
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setBio(user.bio || '');
            setExpertise(user.expertise || '');
            setLocation(user.location || '');
            setProfileImage(user.image || null);
        }
    }, [user]);

    useEffect(() => {
        setNotifications(loadNotifications());
    }, []);

    const tabs = [
        { id: 'Profile', icon: User, label: 'Profile' },
        { id: 'Account', icon: SettingsIcon, label: 'Account' },
        { id: 'Security', icon: Shield, label: 'Security' },
        { id: 'Notifications', icon: Bell, label: 'Notifications' },
    ];

    const accountHealth = (() => {
        let score = 0;
        if (user?.name) score += 20;
        if (user?.email) score += 20;
        if (user?.bio) score += 20;
        if (user?.image) score += 20;
        if (user?.expertise) score += 10;
        if (user?.location) score += 10;
        return score;
    })();

    const handleSaveProfile = async () => {
        try {
            await updateProfile({ name, bio, expertise, image: profileImage });
            updateAuthUser({ name, bio, expertise, image: profileImage || undefined });
            addToast({ message: 'Profile updated successfully', type: 'success' });
        } catch (err: any) {
            addToast({ message: err.message || 'Failed to update profile', type: 'error' });
        }
    };

    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            addToast({ message: 'Image must be less than 5MB', type: 'error' });
            return;
        }

        setIsUploadingPhoto(true);
        try {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64 = reader.result as string;
                setProfileImage(base64);
                try {
                    await updateProfile({ name, bio, expertise, image: base64 });
                    updateAuthUser({ image: base64 });
                    addToast({ message: 'Photo updated successfully', type: 'success' });
                } catch (err: any) {
                    addToast({ message: err.message || 'Failed to upload photo', type: 'error' });
                } finally {
                    setIsUploadingPhoto(false);
                }
            };
            reader.readAsDataURL(file);
        } catch {
            addToast({ message: 'Failed to read file', type: 'error' });
            setIsUploadingPhoto(false);
        }
    };

    const toggleNotification = (key: NotificationKeys) => {
        setNotifications(prev => {
            const updated = { ...prev, [key]: !prev[key] };
            localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
    };

    if (isLoading) return <SettingsSkeleton />;

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20">
            {/* Directory Header */}
            <header className="bg-white border-b border-slate-100 sticky top-0 z-30 px-10 py-8">
                <div className="max-w-[1600px] mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="h-1 w-4 bg-orange-500 rounded-full" />
                                <span className="text-[10px] font-black text-orange-600 uppercase tracking-[0.3em]">STUDIO PREFERENCES</span>
                            </div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                                STUDIO <span className="text-orange-500">SETTINGS</span>
                            </h1>
                            <p className="text-sm text-slate-500 font-medium mt-3">Configure your professional profile, security protocols, and operational preferences.</p>
                        </div>

                        <div className="flex items-center gap-4">
                           <div className="text-right">
                              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Account Health</p>
                              <div className="flex items-center gap-3">
                                 <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${accountHealth}%` }} />
                                 </div>
                                 <span className="text-xs font-black text-slate-900">{accountHealth}%</span>
                              </div>
                           </div>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100 w-fit">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "px-8 py-3 text-[11px] font-black uppercase tracking-[0.15em] rounded-xl transition-all flex items-center gap-3",
                                    activeTab === tab.id 
                                        ? "bg-white text-slate-900 shadow-xl shadow-slate-900/5 border border-slate-100" 
                                        : "text-slate-400 hover:text-slate-600"
                                )}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <main className="max-w-[1600px] mx-auto px-10 mt-12">
                <AnimatePresence mode="wait">
                    {activeTab === 'Profile' && (
                        <motion.div
                            key="profile"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="grid grid-cols-12 gap-8"
                        >
                            <div className="col-span-12 lg:col-span-8 space-y-8">
                                {/* Profile Information */}
                                <div className="bg-white rounded-[32px] p-10 border border-[#F1F5F9] shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight mb-8">Professional Identity</h3>
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Legal Name</label>
                                            <input 
                                                type="text" 
                                                value={name}
                                                onChange={e => setName(e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all"
                                                placeholder="Enter your full name"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Professional Expertise</label>
                                            <input 
                                                type="text" 
                                                value={expertise}
                                                onChange={e => setExpertise(e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all"
                                                placeholder="E.g. Senior Systems Architect"
                                            />
                                        </div>
                                        <div className="col-span-2 space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Public Biography</label>
                                            <textarea 
                                                value={bio}
                                                onChange={e => setBio(e.target.value)}
                                                rows={4}
                                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all resize-none"
                                                placeholder="Describe your professional journey and teaching philosophy..."
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</label>
                                            <div className="relative">
                                                <Globe className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-300" />
                                                <input 
                                                    type="text" 
                                                    value={location}
                                                    onChange={e => setLocation(e.target.value)}
                                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all"
                                                    placeholder="E.g. New Delhi, India"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Email (Immutable)</label>
                                            <div className="relative">
                                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-300" />
                                                <input 
                                                    type="text" 
                                                    value={user?.email || ''} 
                                                    disabled
                                                    className="w-full bg-slate-100 border border-slate-100 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-slate-400 cursor-not-allowed"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-12 pt-8 border-t border-slate-50 flex justify-end">
                                        <button 
                                            onClick={handleSaveProfile}
                                            disabled={isUpdating}
                                            className="bg-slate-900 text-white px-12 py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 active:scale-95"
                                        >
                                            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                            Save Profile Changes
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="col-span-12 lg:col-span-4 space-y-8">
                                {/* Profile Media */}
                                <div className="bg-white rounded-[32px] p-8 border border-[#F1F5F9] shadow-[0_8px_30px_rgba(0,0,0,0.02)] text-center">
                                    <div className="relative w-40 h-40 mx-auto mb-8">
                                        <div className="w-full h-full rounded-[40px] bg-slate-50 border-4 border-white shadow-2xl overflow-hidden flex items-center justify-center relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                            {profileImage ? (
                                                <Image src={profileImage} alt="Avatar" fill className="object-cover" />
                                            ) : (
                                                <span className="text-5xl font-black text-slate-900">{name?.[0]?.toUpperCase()}</span>
                                            )}
                                            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-2">
                                                <Camera className="w-6 h-6 text-white" />
                                                <span className="text-[10px] font-black text-white uppercase tracking-widest">Update</span>
                                            </div>
                                        </div>
                                        {isUploadingPhoto && (
                                            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-[40px] flex items-center justify-center z-10">
                                                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                                            </div>
                                        )}
                                    </div>
                                    <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                                    
                                    <h4 className="text-lg font-black text-slate-900 tracking-tight">Studio Avatar</h4>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Recommended: 800x800px</p>
                                    
                                    <div className="mt-8 flex flex-col gap-3">
                                       <button 
                                         onClick={() => fileInputRef.current?.click()}
                                         className="w-full py-4 bg-slate-50 text-slate-900 rounded-2xl text-[11px] font-black uppercase tracking-widest border border-slate-100 hover:bg-slate-100 transition-all"
                                       >
                                         Replace Image
                                       </button>
                                       <button className="w-full py-4 text-rose-500 text-[11px] font-black uppercase tracking-widest hover:bg-rose-50 rounded-2xl transition-all">
                                         Remove Photo
                                       </button>
                                    </div>
                                </div>

                                {/* Access Control Info */}
                                <div className="bg-slate-900 rounded-[32px] p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
                                     <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[60px] rounded-full pointer-events-none" />
                                     <div className="relative z-10">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                                                <Shield className="w-5 h-5" />
                                            </div>
                                            <h4 className="text-sm font-black text-white tracking-tight">Enterprise Access</h4>
                                        </div>
                                        <p className="text-xs text-slate-400 font-medium leading-relaxed mb-6">Your instructor account is protected by industry-standard encryption and role-based access control.</p>
                                        <button onClick={() => setActiveTab('Security')} className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2 group">
                                            Review Security Protocols
                                            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                     </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'Security' && (
                         <motion.div
                            key="security"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="max-w-3xl mx-auto space-y-8"
                        >
                             <div className="bg-white rounded-[32px] p-10 border border-[#F1F5F9] shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
                                <div className="flex items-center gap-4 mb-10">
                                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                                        <Key className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Security Credentials</h3>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Update your authentication keys</p>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                     <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Studio Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-300" />
                                            <input 
                                                type="password"
                                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all"
                                                placeholder="••••••••••••"
                                            />
                                        </div>
                                     </div>

                                     <div className="grid grid-cols-2 gap-8">
                                         <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">New Password</label>
                                            <input 
                                                type="password"
                                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all"
                                                placeholder="Min. 8 characters"
                                            />
                                         </div>
                                         <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Confirm New Password</label>
                                            <input 
                                                type="password"
                                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all"
                                                placeholder="Repeat password"
                                            />
                                         </div>
                                     </div>

                                     <div className="pt-8 flex justify-end">
                                         <button className="bg-slate-900 text-white px-10 py-4 rounded-xl font-black text-xs uppercase tracking-[0.15em] hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 active:scale-95">
                                            Update Password
                                         </button>
                                     </div>
                                </div>
                             </div>

                             <div className="bg-white rounded-[32px] p-10 border border-[#F1F5F9] shadow-[0_8px_30px_rgba(0,0,0,0.02)] flex items-center justify-between group cursor-pointer hover:border-emerald-200 transition-all">
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Shield className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-black text-slate-900 tracking-tight leading-none mb-2">Two-Factor Authentication</h4>
                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest italic">Add an extra layer of protection to your studio</p>
                                    </div>
                                </div>
                                <button className="text-[10px] font-black text-emerald-600 uppercase tracking-widest px-6 py-3 rounded-xl border border-emerald-100 hover:bg-emerald-50 transition-all">Configure</button>
                             </div>
                        </motion.div>
                    )}

                    {activeTab === 'Notifications' && (
                         <motion.div
                            key="notifications"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="max-w-4xl mx-auto grid grid-cols-2 gap-8"
                        >
                            <div className="bg-white rounded-[32px] p-10 border border-[#F1F5F9] shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
                                <div className="flex items-center gap-4 mb-10">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                        <Mail className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Email Alerts</h3>
                                </div>
                                
                                <div className="space-y-6">
                                    {[
                                        { id: 'newEnrollments', label: 'Learner Enrollments', desc: 'Real-time course entry signals' },
                                        { id: 'assignmentSubmissions', label: 'Evaluation Tasks', desc: 'New submissions ready for audit' },
                                        { id: 'courseReviews', label: 'Quality Feedback', desc: 'Direct learner ratings and reviews' },
                                    ].map(item => (
                                        <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors">
                                            <div>
                                                <p className="text-[13px] font-black text-slate-900 tracking-tight mb-1">{item.label}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.desc}</p>
                                            </div>
                                            <button 
                                                onClick={() => toggleNotification(item.id as any)}
                                                className={cn(
                                                    "w-12 h-6 rounded-full relative transition-all duration-500",
                                                    notifications[item.id as any] ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "bg-slate-200"
                                                )}
                                            >
                                                <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-500", notifications[item.id as any] ? "left-7" : "left-1")} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white rounded-[32px] p-10 border border-[#F1F5F9] shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
                                <div className="flex items-center gap-4 mb-10">
                                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                                        <Bell className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Push Protocol</h3>
                                </div>

                                <div className="space-y-6">
                                    {[
                                        { id: 'newMessages', label: 'Direct Messaging', desc: 'Instant student query alerts' },
                                        { id: 'seminarReminders', label: 'Stream Proximity', desc: 'Alerts before live classroom start' },
                                        { id: 'weeklyReports', label: 'Performance Audit', desc: 'Weekly summarized insights' },
                                    ].map(item => (
                                        <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors">
                                            <div>
                                                <p className="text-[13px] font-black text-slate-900 tracking-tight mb-1">{item.label}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.desc}</p>
                                            </div>
                                            <button 
                                                onClick={() => toggleNotification(item.id as any)}
                                                className={cn(
                                                    "w-12 h-6 rounded-full relative transition-all duration-500",
                                                    notifications[item.id as any] ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "bg-slate-200"
                                                )}
                                            >
                                                <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-500", notifications[item.id as any] ? "left-7" : "left-1")} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'Account' && (
                        <motion.div
                            key="account"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="max-w-3xl mx-auto space-y-8"
                        >
                            {/* Account Identity */}
                            <div className="bg-white rounded-[32px] p-10 border border-[#F1F5F9] shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
                                 <h3 className="text-xl font-black text-slate-900 tracking-tight mb-10">Studio Identity</h3>
                                 <div className="space-y-8">
                                     <div className="flex items-center justify-between py-6 border-b border-slate-50">
                                         <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Authenticated ID</p>
                                            <p className="text-sm font-black text-slate-900">{user?.email}</p>
                                         </div>
                                         <button className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-1.5 hover:underline">
                                            <ExternalLink className="w-3.5 h-3.5" />
                                            Verify Status
                                         </button>
                                     </div>
                                     {user?.teacherId && (
                                       <div className="flex items-center justify-between py-6 border-b border-slate-50">
                                           <div>
                                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Professional Teacher ID</p>
                                              <p className="text-sm font-black text-emerald-600 font-mono tracking-tight">{user.teacherId}</p>
                                           </div>
                                           <span className="bg-emerald-500/10 text-emerald-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">Official</span>
                                       </div>
                                     )}
                                     <div className="flex items-center justify-between py-6 border-b border-slate-50">
                                         <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Operational Role</p>
                                            <p className="text-sm font-black text-slate-900 capitalize">{user?.role || 'Senior Instructor'}</p>
                                         </div>
                                         <span className="bg-emerald-500/10 text-emerald-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">Master Studio</span>
                                     </div>
                                     <div className="flex items-center justify-between py-6">
                                         <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Account Lifecycle</p>
                                            <p className="text-sm font-black text-slate-900">
                                                Active Since {user?.registrationDate ? new Date(user.registrationDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'April 2024'}
                                            </p>
                                         </div>
                                     </div>
                                 </div>
                            </div>

                            {/* Payment Logic */}
                            <div className="bg-white rounded-[32px] p-10 border border-[#F1F5F9] shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
                                 <div className="flex items-center gap-4 mb-10">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                        <CreditCard className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Payout Configuration</h3>
                                 </div>
                                 <div className="bg-slate-50 border border-dashed border-slate-200 rounded-[24px] p-12 text-center">
                                     <CreditCard className="w-12 h-12 text-slate-200 mx-auto mb-6" />
                                     <p className="text-sm font-black text-slate-900 tracking-tight">No Settlement Method Attached</p>
                                     <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-2 mb-8">Connect your professional bank account to receive course revenue.</p>
                                     <button className="bg-slate-900 text-white px-8 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 active:scale-95">Link Payout Method</button>
                                 </div>
                            </div>

                            {/* Termination Protocols */}
                            <div className="bg-rose-50/30 rounded-[32px] p-10 border border-rose-100 flex flex-col md:flex-row items-center justify-between gap-8">
                                 <div>
                                    <h4 className="text-lg font-black text-slate-900 tracking-tight leading-none mb-2">Deactivation Protocol</h4>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest italic">Warning: This action initiates permanent data expulsion</p>
                                 </div>
                                 <button onClick={() => setShowDeleteConfirm(true)} className="px-8 py-3 bg-white text-rose-500 rounded-xl text-[10px] font-black uppercase tracking-widest border border-rose-100 hover:bg-rose-500 hover:text-white transition-all">Initiate Expulsion</button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Expulsion Modal */}
            <AnimatePresence>
                {showDeleteConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-xl p-4"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-[40px] p-12 max-w-lg w-full text-center shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-rose-500" />
                            <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-rose-500/10">
                                <Trash2 className="w-10 h-10" />
                            </div>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-4">CONFIRM EXPULSION</h3>
                            <p className="text-sm font-medium text-slate-500 leading-relaxed mb-10">
                                Initiating account expulsion will permanently erase your professional identity, curriculum assets, and student analytics from the SARTHI ecosystem. This protocol is irreversible.
                            </p>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="w-full py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-all"
                                >
                                    Abort Protocol
                                </button>
                                <button
                                    onClick={() => {}}
                                    className="w-full py-5 bg-rose-500 text-white rounded-[24px] text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-rose-500/20 hover:bg-rose-600 transition-all active:scale-95 flex items-center justify-center gap-3"
                                >
                                    <Trash2 className="w-4.5 h-4.5" />
                                    Permanently Expel Account
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function SettingsSkeleton() {
    return (
        <div className="min-h-screen bg-[#F8FAFC] p-10 animate-pulse">
            <div className="max-w-[1600px] mx-auto space-y-10">
                <div className="h-40 bg-white rounded-[32px]" />
                <div className="h-16 w-1/2 bg-white rounded-2xl" />
                <div className="grid grid-cols-12 gap-8">
                   <div className="col-span-8 h-[600px] bg-white rounded-[32px]" />
                   <div className="col-span-4 h-[600px] bg-white rounded-[32px]" />
                </div>
            </div>
        </div>
    );
}

