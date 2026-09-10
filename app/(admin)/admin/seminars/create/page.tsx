'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Calendar,
  DollarSign,
  Video,
  Type,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/components/ToastProvider';
import Link from 'next/link';

export default function CreateSeminarPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduledAt: '',
    durationMinutes: 60,
    isFree: true,
    price: 0,
    createYoutubeEvent: false,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch('/api/seminars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create seminar');
      }
      return res.json();
    },
    onSuccess: () => {
      addToast({ message: 'Seminar Event Created', type: 'success' });
      queryClient.invalidateQueries({ queryKey: ['seminars'] });
      router.push('/admin/seminars');
    },
    onError: (err) => {
      addToast({ message: err.message, type: 'error' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <div className="max-w-3xl mx-auto pb-20">
      <div className="mb-8">
        <Link
          href="/admin/seminars"
          className="text-sm font-bold text-gray-500 hover:text-brand-orange transition-colors mb-2 inline-block"
        >
          ← Back to Seminars
        </Link>
        <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
          Host New Seminar
        </h1>
        <p className="text-gray-500 font-medium mt-2">
          Configure event details and streaming options.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-gray-100 dark:border-gray-700 space-y-8"
      >
        {/* Basic Info */}
        <div className="space-y-6">
          <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
            <Type className="w-5 h-5 text-brand-orange" />
            Event Details
          </h3>

          <div className="space-y-2">
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">
              Title
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl font-bold focus:ring-4 focus:ring-brand-orange/10 transition-all"
              placeholder="e.g. The Future of AI in EdTech"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">
              Description
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl font-medium focus:ring-4 focus:ring-brand-orange/10 transition-all resize-none"
              placeholder="What will be covered in this session?"
            />
          </div>
        </div>

        <hr className="border-gray-100 dark:border-gray-700" />

        {/* Scheduling */}
        <div className="space-y-6">
          <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            Scheduling
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">
                Start Time
              </label>
              <input
                type="datetime-local"
                required
                value={formData.scheduledAt}
                onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl font-bold focus:ring-4 focus:ring-brand-orange/10 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">
                Duration (Minutes)
              </label>
              <input
                type="number"
                value={formData.durationMinutes}
                onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
                className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl font-bold focus:ring-4 focus:ring-brand-orange/10 transition-all"
              />
            </div>
          </div>
        </div>

        <hr className="border-gray-100 dark:border-gray-700" />

        {/* Access */}
        <div className="space-y-6">
          <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-500" />
            Access & Pricing
          </h3>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, isFree: true, price: 0 })}
              className={`flex-1 py-4 rounded-2xl font-bold transition-all border-2 ${formData.isFree
                ? 'border-brand-orange bg-orange-50 text-brand-orange'
                : 'border-gray-100 bg-gray-50 text-gray-500'
                }`}
            >
              Free Event
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, isFree: false })}
              className={`flex-1 py-4 rounded-2xl font-bold transition-all border-2 ${!formData.isFree
                ? 'border-brand-orange bg-orange-50 text-brand-orange'
                : 'border-gray-100 bg-gray-50 text-gray-500'
                }`}
            >
              Paid Ticket
            </button>
          </div>

          {!formData.isFree && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-4">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">
                Price (INR)
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl font-bold focus:ring-4 focus:ring-brand-orange/10 transition-all"
              />
            </div>
          )}
        </div>

        <hr className="border-gray-100 dark:border-gray-700" />

        {/* Integration */}
        <div className="space-y-6">
          <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
            <Video className="w-5 h-5 text-red-500" />
            YouTube Integration
          </h3>

          <label className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 cursor-pointer hover:bg-gray-100 transition-colors">
            <input
              type="checkbox"
              checked={formData.createYoutubeEvent}
              onChange={(e) => setFormData({ ...formData, createYoutubeEvent: e.target.checked })}
              className="w-6 h-6 rounded-lg text-brand-orange focus:ring-brand-orange border-gray-300"
            />
            <div>
              <span className="block font-bold text-gray-900 dark:text-white">
                Auto-create YouTube Event
              </span>
              <span className="text-xs text-gray-500">
                Will generate broadcast and stream key automatically (requires connected account)
              </span>
            </div>
          </label>
        </div>

        <div className="pt-8">
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="w-full py-5 bg-brand-orange text-white rounded-[2rem] font-black uppercase tracking-widest shadow-xl shadow-brand-orange/20 hover:bg-orange-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createMutation.isPending ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Sparkles className="w-6 h-6" />
            )}
            Create Event
          </button>
        </div>
      </form>
    </div>
  );
}

