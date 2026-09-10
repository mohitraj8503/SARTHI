'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/components/ToastProvider';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import {
  Globe,
  Shield,
  Bell,
  CreditCard,
  Link2,
  Mail,
  Server,
  Users,
  Loader2,
  AlertCircle,
  Save,
  User as UserIcon,
  Camera,
  ChevronRight,
  Lock as LockIcon,
  ExternalLink,
  ChevronLeft,
  Settings
} from 'lucide-react';
import { updateProfile } from '@/app/actions/profile';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const tabs = [
    { id: 'profile', label: 'My Identity', icon: UserIcon },
    { id: 'platform', label: 'Platform Core', icon: Globe },
    { id: 'security', label: 'Security Protocols', icon: Shield },
    { id: 'notifications', label: 'Communication', icon: Bell },
    { id: 'payments', label: 'Financials', icon: CreditCard },
    { id: 'integrations', label: 'Integrations', icon: Link2 },
    { id: 'system', label: 'Infrastructure', icon: Server },
  ];

  const { data: settingsData, isLoading, error: queryError } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const res = await fetch('/api/admin/settings');
      if (!res.ok) throw new Error('Failed to fetch settings');
      const json = await res.json();
      return json.data || {};
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (vars: any) => {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: vars }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || 'Failed to save settings');
      }
      return res.json();
    },
    onSuccess: () => {
      addToast({ title: 'Success', message: 'Portal state synchronized', type: 'success' });
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
    },
    onError: (err: any) => {
      addToast({ title: 'System Error', message: err.message || 'Failed to sync settings', type: 'error' });
    },
  });

  const handleSave = (category: string, key: string, value: any) => {
    saveMutation.mutate({ [category]: { [key]: value } });
  };

  const getSetting = (category: string, key: string, defaultValue: any = '') => {
    return settingsData?.[category]?.[key] ?? defaultValue;
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      addToast({ type: 'error', title: 'File too large', message: 'Maximum size is 5MB' });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload/profile-photo', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        addToast({ type: 'success', title: 'Identity Synced', message: 'Profile photo updated' });
        window.location.reload();
      } else {
        const err = await res.json();
        throw new Error(err.message || 'Upload failed');
      }
    } catch (err: any) {
      addToast({ type: 'error', title: 'Upload Failed', message: err.message });
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
        <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em]">Synchronizing Portal State...</p>
      </div>
    );
  }

  return (
    <div className="relative flex-1 w-full animate-fade-in overflow-hidden">
      {/* Background Atmosphere - Premium Decoration */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        {/* Top Right Header Bubble */}
        <div className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full bg-blue-500/5 blur-[80px] animate-pulse" />
        
        {/* Floating Blob Right */}
        <div className="absolute top-[20%] -right-10 w-[300px] h-[300px] rounded-full bg-amber-500/5 blur-[60px] animate-float" style={{ animationDuration: '8s' }} />
        
        {/* Bottom Left Bubble */}
        <div className="absolute bottom-[10%] -left-20 w-[350px] h-[350px] rounded-full bg-emerald-500/5 blur-[70px] animate-float-delayed" style={{ animationDuration: '10s' }} />
      </div>

      <div className="space-y-10 pb-20">
        {/* Header Section */}
        <header className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 lg:gap-8 border-b border-slate-100 pb-8 mb-8">
          <div className="space-y-1.5 text-left relative">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-1.5 w-5 bg-[#F97316] rounded-full" />
              <span className="text-[10px] sm:text-xs font-black text-[#F97316] uppercase tracking-[0.25em]">SYSTEM CONFIGURATION</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-[0.95]">
              PORTAL <span className="text-[#F97316]">SETTINGS</span>
            </h1>
            <p className="text-slate-500 font-medium text-xs sm:text-sm mt-1.5">
              Global configuration for platform behavior, administrative identity, and security protocols.
            </p>
          </div>
        </header>
 
        <div className="flex flex-col lg:flex-row gap-10 px-4 sm:px-0">
          {/* Sidebar Navigation */}
          <div className="w-full lg:w-[320px] shrink-0">
            <div className="sticky top-8 space-y-6">
                <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.02)] p-2">
                  {tabs.map((tab) => (
                    <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                        "w-full flex items-center justify-between px-6 py-4 rounded-[1.5rem] transition-all group",
                        activeTab === tab.id
                        ? "bg-[#0F172A] text-white shadow-xl shadow-black/10"
                        : "text-slate-400 hover:bg-slate-50 hover:text-[#0F172A]"
                    )}
                    >
                    <div className="flex items-center gap-4">
                        <tab.icon className={cn("w-5 h-5", activeTab === tab.id ? "text-amber-500" : "text-slate-300 group-hover:text-[#0F172A]")} />
                        <span className="text-[12px] font-black uppercase tracking-widest">{tab.label}</span>
                    </div>
                    <ChevronRight className={cn("w-4 h-4 opacity-30", activeTab === tab.id ? "text-white opacity-100" : "")} />
                    </button>
                  ))}
                </div>
 
                <button 
                    onClick={() => window.location.href = '/'}
                    className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-white border border-slate-100 rounded-[2rem] text-[11px] font-black text-[#0F172A] uppercase tracking-[0.2em] hover:bg-slate-50 transition-all group shadow-sm"
                >
                    <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-amber-500 transition-colors" />
                    Return to Ecosystem
                </button>
            </div>
          </div>
 
          {/* Main Content Area */}
          <div className="flex-1 min-w-0 space-y-10">
            {/* Dynamic Section Header */}
            <div className="bg-white p-6 sm:p-10 rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50/50 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
                
                <div className="relative flex flex-col md:flex-row items-center gap-6 md:gap-10">
                    <div className="relative group/avatar">
                        <div className="w-32 h-32 rounded-[2.5rem] bg-[#0F172A] border-[6px] border-white shadow-2xl flex items-center justify-center text-[40px] font-black text-white overflow-hidden transition-transform duration-500 group-hover/avatar:scale-105">
                            {isUploading ? (
                                <Loader2 className="w-10 h-10 animate-spin text-white opacity-50" />
                            ) : (
                                <Image 
                                    src="/images/mukul-pandey.jpg" 
                                    alt="Mukul Pandey" 
                                    width={128}
                                    height={128}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        const target = e.currentTarget as HTMLImageElement;
                                        target.style.display = 'none';
                                        if (target.parentElement) {
                                            target.parentElement.innerHTML = `<span>${user?.name?.[0] || 'A'}</span>`;
                                        }
                                    }}
                                />
                            )}
                        </div>
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute -bottom-2 -right-2 w-12 h-12 bg-amber-500 text-white rounded-2xl border-4 border-white shadow-xl flex items-center justify-center hover:bg-[#0F172A] transition-all hover:scale-110 active:scale-90"
                        >
                            <Camera className="w-5 h-5" />
                        </button>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*" 
                            onChange={handlePhotoUpload} 
                        />
                    </div>
 
                    <div className="flex-1 text-center md:text-left space-y-2">
                        <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-4">
                            <h2 className="text-2xl sm:text-[28px] font-black text-[#0F172A] tracking-tight">{user?.name || 'Authorized Admin'}</h2>
                            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-wider rounded-lg border border-emerald-100">Verified</span>
                        </div>
                        <p className="text-[15px] text-slate-400 font-bold">{user?.email || 'nexus.root@sarthi-woad.vercel.app'}</p>
                        <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-4 md:gap-6 pt-2">
                            <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4 text-amber-500" />
                                <span className="text-[11px] font-black text-[#0F172A] uppercase tracking-widest">{user?.role || 'ROOT'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Server className="w-4 h-4 text-blue-500" />
                                <span className="text-[11px] font-black text-[#0F172A] uppercase tracking-widest">Master Node</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Specific Content */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
                {activeTab === 'profile' && (
                    <div className="p-6 sm:p-10 space-y-10 animate-fade-in">
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Public Admin Name</label>
                                    <div className="relative group">
                                        <UserIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-[#0F172A] transition-colors" />
                                        <input
                                            type="text"
                                            defaultValue={user?.name || ''}
                                            onBlur={async (e) => {
                                                if (e.target.value === user?.name) return;
                                                try {
                                                    const res = await updateProfile({ name: e.target.value });
                                                    if (res.success) {
                                                        addToast({ type: 'success', title: 'State Updated', message: 'Identity synchronized' });
                                                        window.location.reload();
                                                    }
                                                } catch (err) {
                                                    addToast({ type: 'error', title: 'Error', message: 'Failed to update record' });
                                                }
                                            }}
                                            className="w-full pl-14 pr-6 py-5 bg-slate-50/50 border border-transparent rounded-[1.5rem] text-[15px] font-bold text-[#0F172A] focus:bg-white focus:border-amber-100 outline-none transition-all"
                                            placeholder="Admin Display Name"
                                        />
                                    </div>
                                </div>
 
                                <div className="space-y-3 opacity-60">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Registered Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                        <input
                                            type="email"
                                            value={user?.email || ''}
                                            disabled
                                            className="w-full pl-14 pr-6 py-5 bg-slate-50/50 border border-transparent rounded-[1.5rem] text-[15px] font-bold text-[#0F172A] cursor-not-allowed outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
 
                            <div className="p-6 sm:p-8 bg-amber-50/50 rounded-[2rem] border border-amber-100/50 flex flex-col sm:flex-row items-start gap-6">
                                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-amber-500 border border-amber-50 shrink-0">
                                    <Shield className="w-6 h-6" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-[16px] font-black text-[#0F172A] tracking-tight">Enterprise Security</h4>
                                    <p className="text-[13px] text-slate-400 font-medium leading-relaxed">Your email is used for mission-critical notifications and cannot be changed without ROOT authorization.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
 
                {activeTab === 'security' && (
                    <div className="p-6 sm:p-10 space-y-10 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-4">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Session Protocol</label>
                                <div className="p-6 bg-slate-50/50 rounded-2xl border border-transparent flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-[14px] font-black text-[#0F172A]">Idle Timeout</p>
                                        <p className="text-[11px] text-slate-400 font-medium">Automatic logout after inactivity</p>
                                    </div>
                                    <select 
                                        defaultValue={getSetting('security', 'sessionTimeoutMinutes', 60)}
                                        onChange={(e) => handleSave('security', 'sessionTimeoutMinutes', parseInt(e.target.value))}
                                        className="bg-white border border-slate-100 rounded-xl px-4 py-2 text-[12px] font-black outline-none focus:border-amber-500 transition-all shrink-0"
                                    >
                                        <option value={30}>30 Min</option>
                                        <option value={60}>1 Hour</option>
                                        <option value={240}>4 Hours</option>
                                        <option value={1440}>24 Hours</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Identity Shield</label>
                                <div className="p-6 bg-slate-50/50 rounded-2xl border border-transparent flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-[14px] font-black text-[#0F172A]">Two-Factor Auth</p>
                                        <p className="text-[11px] text-slate-400 font-medium">Require OTP for administrative login</p>
                                    </div>
                                    <button 
                                        onClick={() => handleSave('security', 'twoFactorEnabled', !getSetting('security', 'twoFactorEnabled'))}
                                        className={cn(
                                            "w-12 h-6 rounded-full p-1 transition-all shrink-0",
                                            getSetting('security', 'twoFactorEnabled') ? "bg-emerald-500" : "bg-slate-200"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-4 h-4 bg-white rounded-full transition-all",
                                            getSetting('security', 'twoFactorEnabled') ? "translate-x-6" : "translate-x-0"
                                        )} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
 
                {activeTab === 'payments' && (
                    <div className="p-6 sm:p-10 space-y-10 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Default Currency</label>
                                <select 
                                    defaultValue={getSetting('payment', 'currency', 'INR')}
                                    onChange={(e) => handleSave('payment', 'currency', e.target.value)}
                                    className="w-full px-8 py-5 bg-slate-50/50 border border-transparent rounded-[1.5rem] text-[15px] font-bold text-[#0F172A] focus:bg-white focus:border-amber-100 outline-none transition-all"
                                >
                                    <option value="INR">Indian Rupee (₹)</option>
                                    <option value="USD">US Dollar ($)</option>
                                    <option value="EUR">Euro (€)</option>
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Tax Percentage (GST/VAT)</label>
                                <input
                                    type="number"
                                    defaultValue={getSetting('payment', 'taxPercentage', 18)}
                                    onBlur={(e) => handleSave('payment', 'taxPercentage', parseFloat(e.target.value))}
                                    className="w-full px-8 py-5 bg-slate-50/50 border border-transparent rounded-[1.5rem] text-[15px] font-bold text-[#0F172A] focus:bg-white focus:border-amber-100 outline-none transition-all"
                                />
                            </div>
                            <div className="md:col-span-2 space-y-3">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Razorpay Key ID</label>
                                <input
                                    type="password"
                                    defaultValue={getSetting('payment', 'razorpayKeyId', '')}
                                    onBlur={(e) => handleSave('payment', 'razorpayKeyId', e.target.value)}
                                    className="w-full px-8 py-5 bg-slate-50/50 border border-transparent rounded-[1.5rem] text-[15px] font-bold text-[#0F172A] focus:bg-white focus:border-amber-100 outline-none transition-all"
                                    placeholder="rzp_live_..."
                                />
                            </div>
                        </div>
                    </div>
                )}
 
                {/* Other tabs */}
                {activeTab !== 'profile' && activeTab !== 'platform' && (
                    <div className="p-10 sm:p-20 text-center space-y-6">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200 animate-pulse">
                            <Settings className="w-12 h-12" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-[20px] font-black text-[#0F172A] uppercase tracking-tight">Module Under Optimization</h3>
                            <p className="text-[14px] text-slate-400 max-w-sm mx-auto font-medium">This configuration sector is currently being synchronized with the new command-center architecture.</p>
                        </div>
                        <button 
                            onClick={() => setActiveTab('profile')}
                            className="px-10 py-4 bg-[#0F172A] text-white rounded-full text-[11px] font-black uppercase tracking-[0.2em] hover:bg-amber-500 transition-all active:scale-95 shadow-lg shadow-black/10"
                        >
                            Return to Personal
                        </button>
                    </div>
                )}
            </div>

            {/* Footer Audit Message */}
            <div className="flex items-center justify-center gap-3 text-slate-300 text-[11px] font-black uppercase tracking-[0.3em] pt-4">
                <LockIcon className="w-4 h-4 opacity-50" />
                Portal configuration access is logged and encrypted.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

