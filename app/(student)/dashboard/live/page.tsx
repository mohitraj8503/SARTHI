'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  FileText,
  Target,
  Users,
  PlayCircle,
  ChevronLeft,
  ChevronRight,
  Bell,
  ArrowUpRight,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addDays,
  parseISO
} from 'date-fns';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import UserAvatar from '@/components/ui/UserAvatar';

interface TimelineEvent {
  id: string;
  type: 'class' | 'assignment' | 'exam' | 'meeting' | 'seminar';
  title: string;
  courseName: string;
  start: string;
  end?: string;
  status: 'pending' | 'completed' | 'live' | 'upcoming' | 'scheduled';
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
  instructor?: string;
  instructorImage?: string;
}

export default function SchedulePage() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [hasCourses, setHasCourses] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const fetchSchedule = useCallback(async () => {
    try {
      setLoading(true);
      const [scheduleRes, coursesRes] = await Promise.all([
        fetch('/api/student/schedule'),
        fetch('/api/student/my-courses')
      ]);

      const scheduleData = await scheduleRes.json();
      const coursesData = await coursesRes.json();

      let scheduleEvents = scheduleData.events || [];
      
      // PRE-LAUNCH FALLBACK: If schedule is empty, inject launch events
      if (scheduleEvents.length === 0) {
        scheduleEvents = [
          {
            id: 'orientation',
            type: 'meeting',
            title: '🚀 Orientation Session',
            courseName: 'Summer Camp 2026',
            start: '2026-05-12T17:00:00Z',
            status: 'scheduled',
            priority: 'high',
            instructor: 'Expert Mentor'
          },
          {
            id: 'launch',
            type: 'class',
            title: '🔥 Module 1: Python Engine Start',
            courseName: 'Summer Camp 2026',
            start: '2026-05-15T17:00:00Z',
            status: 'scheduled',
            priority: 'high',
            instructor: 'Expert Mentor'
          }
        ];
      }

      setEvents(scheduleEvents);
      setHasCourses(coursesData.courses?.length > 0 || false);
      setIsConnected(scheduleData.calendarConnected || false);
    } catch (error) {
      console.error('Failed to fetch schedule data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const handleLinkCalendar = () => {
    window.location.href = '/api/auth/google-calendar/login';
  };

  const filteredEvents = useMemo(() => {
    if (activeTab === 'ALL') return events;

    const typeMap: Record<string, TimelineEvent['type']> = {
      CLASSES: 'class',
      ASSIGNMENTS: 'assignment',
      EXAMS: 'exam',
      MEETINGS: 'meeting'
    };

    return events.filter((e) => e.type === typeMap[activeTab]);
  }, [events, activeTab]);

  const selectedDateEvents = useMemo(() => {
    return filteredEvents
      .filter((e) => isSameDay(parseISO(e.start), selectedDate))
      .sort((a, b) => +new Date(a.start) - +new Date(b.start));
  }, [filteredEvents, selectedDate]);

  const weeklyPreview = useMemo(() => {
    return filteredEvents
      .filter((e) => {
        const eventDate = parseISO(e.start);
        const dayDiff = Math.floor((+eventDate - +new Date()) / (1000 * 60 * 60 * 24));
        return dayDiff >= 0 && dayDiff <= 7;
      })
      .slice(0, 3);
  }, [filteredEvents]);

  const highAlerts = filteredEvents.filter((e) => e.priority === 'high' && e.status !== 'completed').length;

  return (
    <div className="w-full bg-transparent p-3 sm:p-4 lg:p-10 pb-24 lg:pb-20 space-y-8 sm:space-y-12 min-h-screen">
      <div className="space-y-12 max-w-[1600px] mx-auto">
        <header className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 lg:gap-8 border-b border-slate-100 pb-8">
          <div className="space-y-1.5 text-left relative">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-1.5 w-5 bg-emerald-500 rounded-full" />
              <span className="text-[10px] sm:text-xs font-black text-emerald-600 uppercase tracking-[0.25em]">LIVE STUDIO</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-[0.95]">
              LIVE <span className="text-emerald-500">CLASSES</span>
            </h1>
            <p className="text-slate-500 font-medium text-xs sm:text-sm mt-1.5">
              Track classes, deadlines, and live sessions in one place.
            </p>
          </div>

          <div className="flex items-stretch gap-3 md:gap-4">
            <StatPill label="Daily Load" value={selectedDateEvents.length} dotClass="bg-emerald-500" />
            <StatPill label="Alerts" value={highAlerts} dotClass="bg-rose-500" />
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-10">
          <section className="xl:col-span-6 2xl:col-span-6">
            <div className="mx-auto w-full max-w-[800px] rounded-3xl border border-slate-200/80 bg-white p-4 md:p-6 shadow-sm">
              <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl md:text-2xl font-bold text-slate-800 uppercase italic tracking-tight">{format(currentDate, 'MMMM yyyy')}</h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                      className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50"
                      aria-label="Previous month"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                      className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50"
                      aria-label="Next month"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {['ALL', 'CLASSES', 'ASSIGNMENTS', 'MEETINGS'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        'rounded-full px-4 py-2 text-[11px] font-bold tracking-wide border transition-colors',
                        activeTab === tab
                          ? 'bg-[#174F3A] text-white border-transparent'
                          : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                      )}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <CalendarGrid
                currentDate={currentDate}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                events={filteredEvents}
              />
            </div>
          </section>

          <aside className="xl:col-span-4 2xl:col-span-4 space-y-6">
            <section className="rounded-3xl border border-slate-200/80 bg-white p-5 md:p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-500">Today&apos;s Agenda</p>
                  <h3 className="mt-1 text-lg font-black text-slate-800 uppercase italic tracking-tight">{format(selectedDate, 'eeee, MMM d')}</h3>
                </div>
                <div className="rounded-xl bg-[#174F3A]/10 p-2 text-[#174F3A]">
                  <Bell size={18} />
                </div>
              </div>

              <div className="relative pl-5">
                <div className="absolute left-0 top-0 bottom-0 w-px bg-slate-100" />

                {loading ? (
                  <div className="py-8 text-sm text-slate-500">Loading agenda...</div>
                ) : selectedDateEvents.length === 0 ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                    No items scheduled for this day.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedDateEvents.map((event, idx) => (
                      <div key={event.id} className="relative">
                        <span
                          className={cn(
                            'absolute -left-[22px] top-5 h-2.5 w-2.5 rounded-full ring-4 ring-white',
                            event.status === 'live' ? 'bg-rose-500' : 'bg-emerald-500'
                          )}
                        />
                        <AgendaCard event={event} index={idx} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200/80 bg-white p-5 md:p-8 relative overflow-hidden group shadow-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-50" />
              <div className="relative z-10">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#174F3A]">Calendar Sync</p>
                <h3 className="mt-2 text-xl font-black text-slate-800 uppercase italic tracking-tight leading-none">Google + SARTHI</h3>

                <div className="mt-6 flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-5 transition-all group-hover:bg-slate-50">
                  <div className="relative">
                    <div className="absolute inset-0 bg-slate-200/20 blur-md rounded-full animate-pulse" />
                    <Image src="https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png" alt="Google" width={32} height={32} className="relative" />
                  </div>
                  <div className="h-px w-8 bg-gradient-to-r from-slate-200 to-transparent" />
                  <div className="relative">
                    <div className="absolute inset-0 bg-emerald-500/15 blur-md rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Image src="/sarthi-logo.png" alt="SARTHI" width={32} height={32} className="relative rounded-lg shadow-md" />
                  </div>
                  <span
                    className={cn(
                      'ml-auto rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] shadow-sm transition-all',
                      isConnected ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                    )}
                  >
                    {isConnected ? 'Sync Active' : 'Offline'}
                  </span>
                </div>

                <p className="mt-5 text-xs font-bold text-slate-500 leading-relaxed uppercase tracking-widest">
                  Automate your academic workflow. Sync live sessions and deadlines directly to your personal calendar.
                </p>

                <button
                  onClick={handleLinkCalendar}
                  className="mt-6 w-full inline-flex items-center justify-center gap-3 rounded-2xl bg-emerald-600 px-6 py-4 text-xs font-black text-white shadow-lg hover:bg-emerald-500 hover:-translate-y-1 transition-all uppercase tracking-[0.2em] group/btn"
                >
                  Connect Calendar <ExternalLink size={14} className="transition-transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" />
                </button>
              </div>
            </section>

            {weeklyPreview.length > 0 && (
              <section className="rounded-3xl border border-slate-200/80 bg-white p-5 md:p-8 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Upcoming This Week</p>
                <div className="mt-5 space-y-3">
                  {weeklyPreview.map((event) => (
                    <div key={event.id} className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 hover:bg-slate-50 transition-colors">
                      <p className="text-xs font-black text-slate-800 uppercase italic tracking-tight">{event.title}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <Clock size={10} className="text-[#174F3A]" />
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{format(parseISO(event.start), 'EEE, MMM d • p')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {!hasCourses && (
              <section className="rounded-[2.5rem] border border-slate-200/80 bg-white p-6 md:p-8 relative overflow-hidden shadow-sm">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[60px] rounded-full" />
                <div className="relative z-10">
                  <h4 className="text-lg font-black text-slate-800 uppercase italic tracking-tight font-outfit">Enlightenment Pending</h4>
                  <p className="mt-2 text-xs font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                    Enroll in a program to unlock your personalized synaptic calendar and live mentorship sessions.
                  </p>
                  <Link 
                    href="/courses" 
                    className="mt-6 inline-flex items-center gap-3 rounded-2xl bg-[#174F3A] text-white px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-xl"
                  >
                    Explore Programs <ArrowUpRight size={14} />
                  </Link>
                </div>
              </section>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

function StatPill({ label, value, dotClass }: { label: string; value: number; dotClass: string }) {
  return (
    <div className="min-w-[120px] rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">{label}</p>
      <div className="mt-1 flex items-center gap-2">
        <span className={cn('h-2 w-2 rounded-full', dotClass)} />
        <p className="text-xl font-black text-slate-800 font-outfit italic tracking-tighter">{value}</p>
      </div>
    </div>
  );
}

function CalendarGrid({ currentDate, selectedDate, setSelectedDate, events }: any) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarRows = [];
  let days = [];
  let day = startDate;

  if (!isMounted) {
    return <div className="h-[600px] bg-slate-50 animate-pulse rounded-2xl border border-slate-200" />;
  }

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      const cloneDay = day;
      const dayEvents = events.filter((e: TimelineEvent) => isSameDay(parseISO(e.start), cloneDay));
      const isSelected = isSameDay(day, selectedDate);
      const isToday = isSameDay(day, new Date());
      const isCurrentMonth = isSameMonth(day, monthStart);

      days.push(
        <button
          key={`day-${format(day, 'yyyy-MM-dd')}`}
          onClick={() => setSelectedDate(cloneDay)}
          className={cn(
            'h-24 md:h-28 w-full border-r border-b border-slate-100 p-2 md:p-3 text-left transition-colors',
            !isCurrentMonth && 'bg-slate-50 text-slate-300',
            isSelected && 'bg-emerald-50',
            i === 0 && 'border-l'
          )}
        >
          <div className="flex items-start justify-between">
            <span
              className={cn(
                'text-sm md:text-base font-black font-outfit italic tracking-tighter',
                isToday ? 'inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white' : 'text-slate-700'
              )}
            >
              {format(day, 'd')}
            </span>
            {dayEvents.length > 0 && (
              <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] text-slate-700">
                {dayEvents.length}
              </span>
            )}
          </div>

          {dayEvents[0] && isCurrentMonth && (
            <p className="mt-2 truncate text-[11px] text-slate-500">{dayEvents[0].title}</p>
          )}
        </button>
      );

      day = addDays(day, 1);
    }

    calendarRows.push(
      <div key={`row-${day.getTime()}`} className="grid grid-cols-7">
        {days}
      </div>
    );
    days = [];
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200">
      <div className="grid grid-cols-7 bg-slate-50">
        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((d) => (
          <div key={d} className="border-b border-slate-200 py-2 text-center text-[11px] font-semibold text-slate-500">
            {d}
          </div>
        ))}
      </div>
      {calendarRows}
    </div>
  );
}

function AgendaCard({ event, index }: { event: TimelineEvent; index: number }) {
  const router = useRouter();

  const typeIcon: Record<TimelineEvent['type'], JSX.Element> = {
    class: <Video className="w-4 h-4" />,
    assignment: <FileText className="w-4 h-4" />,
    exam: <Target className="w-4 h-4" />,
    meeting: <Users className="w-4 h-4" />,
    seminar: <PlayCircle className="w-4 h-4" />
  };

  const typeBadgeClass: Record<TimelineEvent['type'], string> = {
    class: 'bg-blue-50 text-blue-700 border border-blue-200',
    assignment: 'bg-amber-50 text-amber-700 border border-amber-200',
    exam: 'bg-purple-50 text-purple-700 border border-purple-200',
    meeting: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
    seminar: 'bg-rose-50 text-rose-700 border border-rose-200'
  };

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => event.actionUrl && router.push(event.actionUrl)}
      className={cn(
        "w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-4 text-left hover:bg-slate-50 transition-all shadow-none",
        event.id === 'orientation' && "border-left-3 border-l-emerald-500"
      )}
      style={event.id === 'orientation' ? { borderLeft: '3px solid #22c55e' } : {}}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{format(parseISO(event.start), 'p')}</p>
          <h4 className="mt-1 text-sm font-black text-slate-800 uppercase italic tracking-tight">{event.title}</h4>
          <p className="mt-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">{event.courseName}</p>
        </div>
        <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-widest', typeBadgeClass[event.type])}>
          {typeIcon[event.type]}
          {event.status === 'live' ? 'LIVE NOW' : 'SCHEDULED'}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
        <div className="flex items-center gap-2">
          <UserAvatar user={{ name: event.instructor || 'Instructor', avatar_url: event.instructorImage }} size="xs" />
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{event.instructor || 'Instructor'}</span>
        </div>
        {event.status === 'completed' && (
          <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
            <CheckCircle2 className="h-3.5 w-3.5" /> Done
          </span>
        )}
      </div>
    </motion.button>
  );
}

