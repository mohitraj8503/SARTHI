'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Shield,
  Bell,
  Palette,
  HelpCircle,
  Mail,
  Lock,
  Globe,
  Moon,
  Sun,
  ChevronRight,
  Smartphone,
  Loader2,
  Camera,
  Save,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/components/ToastProvider';
import { updateProfile, changePassword, updateNotificationSettings } from '@/app/actions/profile';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

interface SettingsClientProps {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    passwordEnabled: boolean;
    authProvider: string | null;
    notificationSettings: string | null;
    privacySettings: string | null;
  };
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={cn(
        "relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border border-slate-200 transition-all duration-300 ease-in-out focus:outline-none",
        checked ? "bg-emerald-600 shadow-sm" : "bg-slate-100"
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition-all duration-300 ease-in-out mt-[3px] ml-[3px]",
          checked ? "translate-x-5 bg-white" : "translate-x-0 bg-slate-300"
        )}
      />
    </button>
  );
}

export default function SettingsClient({ user }: SettingsClientProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('identity');

  // Form States
  const [name, setName] = useState(user.name || '');
  const [photoUrl, setPhotoUrl] = useState<string | null>(user.image);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Password States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  // Notification States
  const initialNotifs = user.notificationSettings
    ? JSON.parse(user.notificationSettings)
    : { email: true, push: true, sms: false, marketing: false };
  const [notifSettings, setNotifSettings] = useState(initialNotifs);
  const [savingNotifs, setSavingNotifs] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const tabs = [
    { id: 'identity', label: 'Profile', icon: User },
    { id: 'account', label: 'Account', icon: Globe },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'communication', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Preferences', icon: Palette },
    { id: 'support', label: 'Help & Support', icon: HelpCircle },
  ];

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      addToast({ type: 'error', message: 'Name cannot be empty' });
      return;
    }
    setSavingProfile(true);
    try {
      const res = await updateProfile({ name });
      if (res.success) {
        addToast({ type: 'success', message: 'Profile updated successfully' });
        router.refresh();
      } else {
        throw new Error(res.error);
      }
    } catch (error: any) {
      addToast({ type: 'error', message: error.message || 'Failed to update profile' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      addToast({ type: 'error', message: 'Image must be smaller than 5MB' });
      return;
    }

    setUploadingPhoto(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/user/profile/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        setPhotoUrl(data.url);
        addToast({ type: 'success', message: 'Profile photo updated' });
        router.refresh(); // Update layout and other components
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (error: any) {
      addToast({ type: 'error', message: error.message || 'Failed to upload photo' });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      addToast({ type: 'error', message: 'Passwords do not match' });
      return;
    }
    setSavingPassword(true);
    try {
      const res = await changePassword({ 
        current: currentPassword, 
        new: newPassword, 
        confirm: confirmPassword 
      });
      if (res.success) {
        addToast({ type: 'success', message: 'Password updated successfully' });
        router.refresh();
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        throw new Error(res.error);
      }
    } catch (error: any) {
      addToast({ type: 'error', message: error.message || 'Failed to change password' });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent p-4 lg:p-12 pb-40 font-inter">
      <div className="max-w-[1400px] mx-auto" style={{ zoom: 1.1 }}>
        {/* CINEMATIC HEADER */}
        <div className="mb-16 relative border-b border-slate-200/80 pb-6">
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
          <h1 className="text-5xl md:text-6xl font-black text-slate-800 tracking-tighter uppercase font-outfit italic leading-none flex items-center gap-4">
            Settings
            <div className="h-1 w-24 bg-gradient-to-r from-emerald-500 to-transparent rounded-full mt-4 hidden md:block" />
          </h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.4em] text-[11px] mt-6 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[#174F3A]/40 animate-pulse" />
            Operational Parameters & User Configurations
          </p>
        </div>

        <div className="grid lg:grid-cols-[320px_1fr] gap-12 items-start">
          {/* CINEMATIC SIDEBAR */}
          <aside className="space-y-6 sticky top-8">
            <nav className="bg-white border border-slate-200/80 p-3 rounded-[2.5rem] shadow-sm space-y-1 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group/nav relative overflow-hidden",
                      isActive 
                        ? "bg-[#174F3A]/10 text-[#174F3A] border border-[#174F3A]/20 shadow-sm" 
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-800 border border-transparent"
                    )}
                  >
                    {isActive && <motion.div layoutId="active-tab-glow" className="absolute left-0 w-1 h-6 bg-[#174F3A] rounded-full blur-sm" />}
                    <Icon className={cn("w-5 h-5 transition-transform duration-300", isActive ? "text-[#174F3A] scale-110" : "text-slate-400 group-hover/nav:text-slate-800 group-hover/nav:rotate-6")} />
                    <span className="text-[11px] font-black uppercase tracking-[0.2em]">{tab.label}</span>
                    {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#174F3A] shadow-sm" />}
                  </button>
                );
              })}
            </nav>
 
            <Link 
              href="/dashboard"
              className="w-full flex items-center justify-center gap-3 px-6 py-5 bg-white border border-slate-200 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 hover:bg-slate-50 hover:text-slate-800 hover:border-slate-300 transition-all group relative overflow-hidden shadow-sm"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Portal Nexus
            </Link>
          </aside>

          {/* MAIN CONTENT AREA */}
          <main className="space-y-8 min-h-[600px]">
            <AnimatePresence mode="wait">
              {activeTab === 'identity' && (
                <motion.div
                  key="identity"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  {/* PROFILE HEADER CARD */}
                  <div className="bg-white border border-slate-200/80 rounded-[3rem] p-8 md:p-10 flex flex-col md:flex-row items-center gap-10 relative overflow-hidden group shadow-sm">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-50" />
                    
                    <div className="relative">
                      <div className="w-32 h-32 rounded-full bg-slate-50 flex items-center justify-center overflow-hidden border-2 border-slate-200 shadow-sm relative">
                        {photoUrl ? (
                          <Image 
                            src={photoUrl} 
                            alt="Profile" 
                            fill 
                            className="object-cover" 
                            quality={100}
                            unoptimized
                          />
                        ) : (
                          <span className="text-4xl font-black text-slate-400 font-outfit uppercase italic">{user.name?.charAt(0)}</span>
                        )}
                        {uploadingPhoto && (
                          <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                          </div>
                        )}
                      </div>
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute -bottom-2 -right-2 p-3 bg-emerald-600 text-white rounded-2xl shadow-2xl border border-white/20 hover:bg-emerald-500 hover:scale-110 active:scale-95 transition-all group/btn"
                      >
                        <Camera className="w-5 h-5 group-hover/btn:rotate-12 transition-transform" />
                      </button>
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                    </div>
 
                    <div className="flex-1 text-center md:text-left space-y-3 z-10">
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                        <h2 className="text-3xl md:text-4xl font-black text-slate-800 uppercase italic tracking-tighter font-outfit">{user.name}</h2>
                        <span className="px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 border border-emerald-100 shadow-sm">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Identity Verified
                        </span>
                      </div>
                      <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.2em] leading-none">{user.email}</p>
                    </div>
                  </div>
 
                  {/* EDIT FORM */}
                  <div className="bg-white border border-slate-200/80 rounded-[3rem] p-8 md:p-12 space-y-10 relative shadow-sm">
                    <div className="grid md:grid-cols-2 gap-10">
                      <div className="space-y-3">
                        <label className="text-[11px] font-black text-[#174F3A] uppercase tracking-[0.25em] ml-1">Full Identity Name</label>
                        <div className="relative group">
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:border-emerald-500/50 transition-all font-bold text-base text-slate-800 outline-none placeholder:text-slate-450"
                            placeholder="Your full legal name"
                          />
                          <User className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500/30 transition-colors" />
                        </div>
                      </div>
 
                      <div className="space-y-3">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] ml-1">Registered Email</label>
                        <div className="relative">
                          <input
                            type="email"
                            defaultValue={user.email || ''}
                            disabled
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-base text-slate-400 cursor-not-allowed italic"
                          />
                          <Lock className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                        </div>
                      </div>
                    </div>
 
                    <div className="p-8 bg-emerald-500/5 rounded-3xl border border-emerald-500/10 flex flex-col md:flex-row items-center gap-6 group hover:bg-emerald-500/10 transition-colors">
                      <div className="p-4 bg-white rounded-2xl shadow-sm text-emerald-600 border border-slate-200 group-hover:scale-110 transition-transform">
                        <Shield className="w-6 h-6" />
                      </div>
                      <div className="text-center md:text-left">
                        <p className="text-[12px] font-black text-slate-850 uppercase tracking-[0.2em]">Vault Protection Enabled</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2 leading-relaxed">
                          Your sensitive profile data is secured with AES-256 equivalent encryption and multi-factor protocol compliance.
                        </p>
                      </div>
                    </div>
 
                    <div className="flex justify-end pt-4">
                      <button
                        onClick={handleSaveProfile}
                        disabled={savingProfile}
                        className="group/save relative px-10 py-5 bg-[#174F3A] text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] hover:bg-emerald-800 hover:-translate-y-1 active:scale-95 transition-all flex items-center gap-3 shadow-lg overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/save:translate-x-full transition-transform duration-1000" />
                        {savingProfile ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5 group-hover/save:rotate-12 transition-transform" />}
                        Commit Changes
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
 
              {/* ACCOUNT TAB */}
              {activeTab === 'account' && (
                <motion.div
                  key="account"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white border border-slate-200/80 rounded-[3rem] p-10 md:p-12 space-y-10 relative overflow-hidden shadow-sm"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full" />
                  
                  <div>
                    <h2 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter font-outfit">Synchronized Account</h2>
                    <p className="text-[11px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-2">Global access and platform visibility parameters.</p>
                  </div>
 
                  <div className="grid gap-8">
                    <div className="p-8 bg-slate-50 border border-slate-200 rounded-[2.5rem] relative group hover:bg-slate-50 transition-all">
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl">
                            <Globe className="w-5 h-5" />
                          </div>
                          <span className="text-[12px] font-black text-slate-800 uppercase tracking-[0.2em]">Platform ID Matrix</span>
                        </div>
                        <span className="px-4 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-sm">Primary Node</span>
                      </div>
 
                      <div className="space-y-2">
                        <div className="flex items-center justify-between py-5 border-b border-slate-200 group/row">
                          <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] group-hover/row:text-slate-800 transition-colors">Credential Role</span>
                          <span className="text-[11px] font-black text-[#174F3A] uppercase tracking-[0.2em]">{user.enrollmentNumber?.includes('TCH') ? 'Master Faculty' : 'Premium Student'}</span>
                        </div>
                        <div className="flex items-center justify-between py-5 border-b border-slate-200 group/row">
                          <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] group-hover/row:text-slate-800 transition-colors">Access Method</span>
                          <span className="text-[11px] font-black text-slate-700 uppercase tracking-[0.2em]">{user.authProvider || 'Email/Matrix'}</span>
                        </div>
                        <div className="flex items-center justify-between py-5 group/row">
                          <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] group-hover/row:text-slate-800 transition-colors">Directory Listing</span>
                          <span className="text-[11px] font-black text-slate-700 uppercase tracking-[0.2em]">Anonymous / Internal</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
 
              {/* SECURITY TAB */}
              {activeTab === 'security' && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="bg-white border border-slate-200/80 rounded-[3rem] p-10 md:p-12 space-y-10 shadow-sm">
                    <div>
                      <h2 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter font-outfit">Security Protocol</h2>
                      <p className="text-[11px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-2">Manage your cryptographic access tokens.</p>
                    </div>
 
                    <div className="space-y-8 max-w-2xl">
                      <div className="space-y-3">
                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.25em] ml-1">Current Master Password</label>
                        <div className="relative group">
                          <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:border-emerald-500/50 transition-all outline-none text-slate-800 font-bold placeholder:text-slate-400"
                            placeholder="••••••••••••"
                          />
                          <Lock className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-400/30 transition-colors" />
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.25em] ml-1">New Access Key</label>
                          <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:border-emerald-500/50 transition-all outline-none text-slate-800 font-bold placeholder:text-slate-400"
                            placeholder="Min 8 Characters"
                          />
                        </div>
                        <div className="space-y-3">
                          <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.25em] ml-1">Confirm Access Key</label>
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:border-emerald-500/50 transition-all outline-none text-slate-800 font-bold placeholder:text-slate-400"
                            placeholder="Repeat Access Key"
                          />
                        </div>
                      </div>
                    </div>
 
                    <div className="flex justify-end pt-6">
                      <button
                        onClick={handleChangePassword}
                        disabled={savingPassword}
                        className="group/btn relative px-10 py-5 bg-[#174F3A] text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] hover:bg-emerald-800 hover:-translate-y-1 transition-all flex items-center gap-3 shadow-lg"
                      >
                        {savingPassword ? <Loader2 className="w-5 h-5 animate-spin" /> : <Shield className="w-5 h-5" />}
                        Refresh Protocol
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
 
              {/* NOTIFICATIONS TAB */}
              {activeTab === 'communication' && (
                <motion.div
                  key="communication"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white border border-slate-200/80 rounded-[3rem] p-10 md:p-12 space-y-10 relative shadow-sm"
                >
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full" />
                  
                  <div>
                    <h2 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter font-outfit">Transmission Relay</h2>
                    <p className="text-[11px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-2">Configure how information flows to your devices.</p>
                  </div>
 
                  <div className="space-y-4">
                    {[
                      { id: 'email', title: 'System Telemetry (Email)', desc: 'Mission updates, course launches, and grade reports.', icon: Mail },
                      { id: 'push', title: 'Real-Time Pulses (Push)', desc: 'Immediate alerts for live classes and mentor responses.', icon: Smartphone },
                      { id: 'marketing', title: 'Platform Intelligence', desc: 'Curated industry insights and event invitations.', icon: Globe },
                    ].map((item) => (
                      <div key={item.id} className="p-8 hover:bg-slate-50 rounded-[2rem] border border-transparent hover:border-slate-100 flex flex-col md:flex-row items-center justify-between transition-all group gap-6 md:gap-0">
                        <div className="flex items-center gap-6 text-center md:text-left">
                          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl shadow-sm text-slate-400 group-hover:text-[#174F3A] group-hover:border-emerald-500/20 transition-all group-hover:scale-110">
                            <item.icon className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-slate-800 uppercase tracking-[0.15em]">{item.title}</h4>
                            <p className="text-[10px] text-slate-550 font-bold uppercase tracking-[0.2em] mt-2 max-w-[300px]">{item.desc}</p>
                          </div>
                        </div>
                        <ToggleSwitch
                          checked={notifSettings[item.id]}
                          onChange={() => setNotifSettings({ ...notifSettings, [item.id]: !notifSettings[item.id] })}
                        />
                      </div>
                    ))}
                  </div>
 
                  <div className="flex justify-end pt-6">
                    <button
                      onClick={async () => {
                        setSavingNotifs(true);
                        try {
                          const res = await updateNotificationSettings(notifSettings);
                          if (res.success) {
                            addToast({ type: 'success', message: 'Transmission relay updated' });
                            router.refresh();
                          }
                        } finally { setSavingNotifs(false); }
                      }}
                      className="group/relay relative px-10 py-5 bg-[#174F3A] text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] hover:bg-emerald-800 hover:-translate-y-1 transition-all flex items-center gap-3 shadow-lg"
                    >
                      {savingNotifs ? <Loader2 className="w-5 h-5 animate-spin" /> : <Bell className="w-5 h-5 group-hover/relay:animate-bounce" />}
                      Update Relay Settings
                    </button>
                  </div>
                </motion.div>
              )}
 
              {/* PREFERENCES TAB */}
              {activeTab === 'appearance' && (
                <motion.div
                  key="appearance"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white border border-slate-200/80 rounded-[3rem] p-10 md:p-12 space-y-10 shadow-sm"
                >
                  <div>
                    <h2 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter font-outfit">Visual Environment</h2>
                    <p className="text-[11px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-2">Adjust the UI luminescence to your ocular comfort.</p>
                  </div>
 
                  <div className="grid md:grid-cols-2 gap-8">
                    <button
                      onClick={() => setTheme('light')}
                      className={cn(
                        "p-10 rounded-[2.5rem] cursor-pointer transition-all border-2 flex flex-col items-center gap-6 group relative overflow-hidden",
                        theme === 'light' 
                          ? 'border-[#174F3A] bg-[#174F3A]/5 shadow-sm' 
                          : 'border-slate-200 hover:border-slate-300 bg-slate-55'
                      )}
                    >
                      <div className={cn("p-5 rounded-3xl transition-all", theme === 'light' ? 'bg-[#174F3A]/20 text-[#174F3A]' : 'bg-slate-100 text-slate-450 group-hover:text-slate-600')}>
                        <Sun className="w-8 h-8" />
                      </div>
                      <div className="text-center">
                        <span className="block text-sm font-black text-slate-800 uppercase tracking-[0.2em]">Solar Active</span>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">Standard high-contrast luminescence</p>
                      </div>
                    </button>
 
                    <button
                      onClick={() => setTheme('dark')}
                      className={cn(
                        "p-10 rounded-[2.5rem] cursor-pointer transition-all border-2 flex flex-col items-center gap-6 group relative overflow-hidden",
                        theme === 'dark' 
                          ? 'border-[#174F3A] bg-[#174F3A]/5 shadow-sm' 
                          : 'border-slate-200 hover:border-slate-300 bg-slate-55'
                      )}
                    >
                      <div className={cn("p-5 rounded-3xl transition-all", theme === 'dark' ? 'bg-[#174F3A]/20 text-[#174F3A]' : 'bg-slate-100 text-slate-450 group-hover:text-slate-600')}>
                        <Moon className="w-8 h-8" />
                      </div>
                      <div className="text-center">
                        <span className="block text-sm font-black text-slate-800 uppercase tracking-[0.2em]">Lunar Shield</span>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">Low-glare ocular optimization</p>
                      </div>
                    </button>
                  </div>
                </motion.div>
              )}
 
              {/* HELP TAB */}
              {activeTab === 'support' && (
                <motion.div
                  key="support"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-8"
                >
                  <Link href="/dashboard/support" className="bg-white border border-slate-200/80 p-10 md:p-12 rounded-[3.5rem] relative group overflow-hidden transition-all hover:bg-slate-50 shadow-sm">
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/5 blur-[60px] group-hover:bg-emerald-500/10 transition-colors" />
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-8 text-slate-400 border border-slate-200 group-hover:scale-110 group-hover:bg-[#174F3A] group-hover:text-white transition-all shadow-sm">
                      <HelpCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter font-outfit">Intelligence Base</h3>
                    <p className="mt-3 text-[11px] text-slate-500 font-bold uppercase tracking-[0.2em] leading-relaxed">
                      Deep dive into our knowledge repositories or initiate a direct uplink with support specialists.
                    </p>
                    <div className="mt-8 flex items-center text-[10px] font-black uppercase tracking-[0.3em] text-[#174F3A] group-hover:translate-x-2 transition-transform">
                      Initiate Uplink <ChevronRight className="w-4 h-4 ml-2" />
                    </div>
                  </Link>
 
                  <Link href="/dashboard/support?action=report" className="bg-white border border-slate-200/80 p-10 md:p-12 rounded-[3.5rem] relative group overflow-hidden transition-all hover:bg-slate-50 shadow-sm">
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-rose-500/5 blur-[60px] group-hover:bg-rose-500/10 transition-colors" />
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-8 text-slate-400 border border-slate-200 group-hover:scale-110 group-hover:bg-rose-600 group-hover:text-white transition-all shadow-sm">
                      <AlertTriangle className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter font-outfit">Anomaly Report</h3>
                    <p className="mt-3 text-[11px] text-slate-500 font-bold uppercase tracking-[0.2em] leading-relaxed">
                      Detected a system glitch? Log the anomaly immediately for high-priority resolution by engineering.
                    </p>
                    <div className="mt-8 flex items-center text-[10px] font-black uppercase tracking-[0.3em] text-rose-500 group-hover:translate-x-2 transition-transform">
                      Log Anomaly <ChevronRight className="w-4 h-4 ml-2" />
                    </div>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}

