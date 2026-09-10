'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock, Video, MapPin, Users, Filter } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { data: eventsData, isLoading } = useQuery({
    queryKey: ['calendar-events', currentMonth],
    queryFn: async () => {
      const start = startOfMonth(currentMonth);
      const end = endOfMonth(currentMonth);
      const res = await fetch(
        `/api/teacher/calendar/events?start=${start.toISOString()}&end=${end.toISOString()}`
      );
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
  });

  const events = eventsData?.events || [];
  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const getEventsForDay = (day: Date) => {
    return events.filter((e: any) => isSameDay(new Date(e.startTime), day));
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-10">
      <div className="flex items-center justify-between mb-12">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Studio <span className="text-orange-500">Scheduler</span></h1>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Manage your teaching schedule</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="bg-white rounded-2xl border border-slate-100 p-1 flex shadow-sm">
              <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-3 hover:bg-slate-50 rounded-xl transition-all">
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>
              <div className="px-6 flex items-center text-sm font-black uppercase tracking-widest text-slate-900">
                {format(currentMonth, 'MMMM yyyy')}
              </div>
              <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-3 hover:bg-slate-50 rounded-xl transition-all">
                <ChevronRight className="w-5 h-5 text-slate-600" />
              </button>
           </div>
           <button className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 active:scale-95">
              <Plus className="w-5 h-5" />
              Schedule Class
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Calendar Grid */}
        <main className="lg:col-span-8 bg-white rounded-[40px] border border-slate-100 shadow-xl overflow-hidden">
          <div className="grid grid-cols-7 border-b border-slate-50 bg-slate-50/50">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{day}</div>
            ))}
          </div>
          
          <div className="grid grid-cols-7">
            {days.map((day, idx) => {
              const dayEvents = getEventsForDay(day);
              const isSelected = isSameDay(day, selectedDate);
              const isToday = isSameDay(day, new Date());
              
              return (
                <div 
                  key={day.toString()} 
                  onClick={() => setSelectedDate(day)}
                  className={`min-h-[140px] p-4 border-r border-b border-slate-50 cursor-pointer transition-all hover:bg-slate-50/80 group ${!isSameMonth(day, currentMonth) ? 'bg-slate-50/30' : ''}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`w-8 h-8 flex items-center justify-center rounded-xl text-xs font-black transition-all ${
                      isToday ? 'bg-orange-500 text-white' : 
                      isSelected ? 'bg-slate-900 text-white' : 
                      'text-slate-400 group-hover:text-slate-900'
                    }`}>
                      {format(day, 'd')}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map((event: any) => (
                      <div key={event.id} className="px-2 py-1 bg-orange-50 text-orange-600 text-[9px] font-black uppercase tracking-tight rounded-md truncate">
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-[9px] text-slate-300 font-bold pl-2">+{dayEvents.length - 2} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </main>

        {/* Selected Day View */}
        <aside className="lg:col-span-4 space-y-8">
           <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  {format(selectedDate, 'MMM d, yyyy')}
                </h3>
                <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-full">
                  {getEventsForDay(selectedDate).length} Events
                </span>
              </div>

              <div className="space-y-4">
                {getEventsForDay(selectedDate).length === 0 ? (
                  <div className="py-12 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CalendarIcon className="w-8 h-8 text-slate-200" />
                    </div>
                    <p className="text-slate-400 text-xs font-black uppercase tracking-widest">No classes scheduled</p>
                  </div>
                ) : (
                  getEventsForDay(selectedDate).map((event: any) => (
                    <div key={event.id} className="p-6 bg-slate-50 rounded-3xl border border-transparent hover:border-orange-100 hover:bg-white hover:shadow-xl transition-all group">
                      <div className="flex items-start justify-between mb-4">
                        <div className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest">
                          {event.type}
                        </div>
                        <span className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                          <Clock className="w-3 h-3" />
                          {format(new Date(event.startTime), 'h:mm a')}
                        </span>
                      </div>
                      
                      <h4 className="text-sm font-black text-slate-900 mb-2">{event.title}</h4>
                      
                      <div className="flex items-center gap-4 mt-6 pt-4 border-t border-slate-100/50">
                         {event.meetingLink && (
                           <a 
                             href={event.meetingLink} 
                             target="_blank"
                             className="flex-1 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest py-3 rounded-xl text-center hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                           >
                             <Video className="w-3 h-3" />
                             Join Class
                           </a>
                         )}
                         <button className="p-3 text-slate-300 hover:text-slate-900 transition-colors">
                           <Filter className="w-4 h-4" />
                         </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
           </div>

           <div className="bg-slate-900 rounded-[40px] p-8 text-white relative overflow-hidden group">
              <div className="relative z-10">
                <h3 className="text-xl font-black mb-2">Sync Your Studio</h3>
                <p className="text-xs text-white/50 font-medium mb-6 leading-relaxed">Connect your external calendars to avoid teaching conflicts automatically.</p>
                <button className="w-full py-4 bg-white/10 hover:bg-white/20 transition-all rounded-2xl text-[10px] font-black uppercase tracking-widest">
                  Configure Integrations
                </button>
              </div>
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-orange-600/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
           </div>
        </aside>
      </div>
    </div>
  );
}

