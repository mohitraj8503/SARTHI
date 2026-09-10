'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    ChevronLeft,
    ChevronRight,
    Calendar,
    ArrowRight
} from 'lucide-react';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths
} from 'date-fns';

export default function CalendarCard() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

    const renderCalendar = () => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
        const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

        const days = eachDayOfInterval({ start: startDate, end: endDate });

        return days.map((day, idx) => {
            const isSelected = isSameDay(day, selectedDate);
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isToday = isSameDay(day, new Date());

            return (
                <button
                    key={day.toString()}
                    onClick={() => setSelectedDate(day)}
                    aria-label={format(day, 'MMMM d, yyyy')}
                    aria-pressed={isSelected}
                    className={`
                        h-11 w-11 flex items-center justify-center text-sm font-semibold rounded-full transition-all duration-200 mx-auto focus-visible:ring-2 focus-visible:ring-blue-600 focus:outline-none
                        ${isSelected
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                            : isToday
                                ? 'bg-blue-50 text-blue-600 font-bold'
                                : isCurrentMonth
                                    ? 'text-slate-700 hover:bg-slate-100'
                                    : 'text-slate-400'
                        }
                    `}
                >
                    {format(day, 'd')}
                </button>
            );
        });
    };

    return (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-lg shadow-slate-100/50 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                        <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 text-sm">Schedule</h3>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                            {format(selectedDate, 'MMMM d')}
                        </p>
                    </div>
                </div>
                <div className="flex gap-1 bg-slate-50 p-1 rounded-lg">
                    <button 
                        onClick={handlePrevMonth} 
                        aria-label="Previous month"
                        className="p-2.5 hover:bg-white text-slate-400 hover:text-slate-700 rounded-md transition-all shadow-sm hover:shadow focus-visible:ring-2 focus-visible:ring-blue-600 focus:outline-none"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={handleNextMonth} 
                        aria-label="Next month"
                        className="p-2.5 hover:bg-white text-slate-400 hover:text-slate-700 rounded-md transition-all shadow-sm hover:shadow focus-visible:ring-2 focus-visible:ring-blue-600 focus:outline-none"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-y-2 text-center mb-4">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day) => (
                    <div key={day} className="text-xs font-bold text-slate-500 uppercase py-2">
                        {day}
                    </div>
                ))}
                {renderCalendar()}
            </div>

            <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    Upcoming
                </h4>
                <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 group/event hover:bg-blue-50 transition-colors cursor-pointer">
                        <div className="w-1.5 h-8 bg-blue-500 rounded-full" />
                        <div>
                            <p className="text-xs font-bold text-slate-700 group-hover/event:text-blue-700">UI Design Fundamentals</p>
                            <p className="text-xs text-slate-500">10:00 AM • Live Class</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 group/event hover:bg-purple-50 transition-colors cursor-pointer">
                        <div className="w-1.5 h-8 bg-purple-500 rounded-full" />
                        <div>
                            <p className="text-xs font-bold text-slate-700 group-hover/event:text-purple-700">React Mastery Quiz</p>
                            <p className="text-xs text-slate-500">2:00 PM • Assignment</p>
                        </div>
                    </div>
                </div>

                <button className="w-full mt-4 py-2.5 text-xs font-bold text-slate-500 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 rounded-xl transition-all flex items-center justify-center gap-2">
                    View Full Schedule <ArrowRight className="w-3 h-3" />
                </button>
            </div>
        </div>
    );
}

