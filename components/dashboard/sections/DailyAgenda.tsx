import { Calendar, PlayCircle, Clock, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO, isValid } from 'date-fns';
import Link from 'next/link';

interface Session {
    id: string;
    title: string;
    date: string;
    startTime?: string;
    endTime?: string;
    type?: string;
    courseName?: string;
    isLive?: boolean;
}

interface DailyAgendaProps {
    sessions: Session[];
}

export default function DailyAgenda({ sessions = [] }: DailyAgendaProps) {
    const isActuallyLive = (s: Session) => {
        if (s.isLive) return true;
        const start = new Date(s.date).getTime();
        const now = new Date().getTime();
        const diff = (start - now) / (1000 * 60);
        return diff <= 30 && diff >= -120;
    };

    return (
        <section className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm group antialiased">
            <div className="flex items-center gap-4 mb-10 border-b border-gray-50 pb-6">
                <div className="p-3 rounded-2xl bg-[#1B4332]/5 text-[#1B4332]">
                    <Calendar className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-[#1B4332]">Masterclass</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Daily Schedule</p>
                </div>
            </div>

            <div className="space-y-6">
                {sessions.length > 0 ? (
                    sessions.slice(0, 3).map((session, i) => {
                        const active = isActuallyLive(session);
                        return (
                            <div key={session.id || i} className="group/item">
                                <div className={cn(
                                    "p-6 rounded-3xl border transition-all duration-500",
                                    active 
                                        ? "bg-[#1B4332] border-transparent text-white shadow-xl shadow-[#1B4332]/20" 
                                        : "bg-gray-50 border-transparent hover:bg-white hover:border-gray-100 hover:shadow-lg"
                                )}>
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center gap-2">
                                            <Clock className={cn("w-3 h-3", active ? "text-[#D4915C]" : "text-gray-400")} />
                                            <span className={cn(
                                                "text-[10px] font-bold uppercase tracking-widest",
                                                active ? "text-[#D4915C]" : "text-gray-400"
                                            )}>
                                                {(() => {
                                                    if (!session.date) return 'TBD';
                                                    const date = parseISO(session.date);
                                                    return isValid(date) ? format(date, 'hh:mm a') : 'TBD';
                                                })()}
                                            </span>
                                        </div>
                                        {active && <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />}
                                    </div>

                                    <h4 className="text-base font-bold leading-tight line-clamp-2 group-hover/item:text-[#D4915C] transition-colors">
                                        {session.title}
                                    </h4>

                                    {active ? (
                                        <Link 
                                            href={`/seminars/${session.id}/live`}
                                            className="mt-4 flex items-center justify-center gap-2 w-full py-3 bg-[#D4915C] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-[#1B4332] transition-all"
                                        >
                                            <PlayCircle className="w-4 h-4 fill-current" />
                                            Join Now
                                        </Link>
                                    ) : (
                                        <p className="text-[10px] mt-2 font-bold uppercase tracking-widest text-gray-400 opacity-60">
                                            {session.courseName || 'Live Session'}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="py-12 text-center rounded-[32px] bg-gray-50/50 border border-dashed border-gray-200">
                        <Clock className="w-8 h-8 text-gray-300 mx-auto mb-4" />
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">No live sessions scheduled for today</p>
                    </div>
                )}
            </div>
            
            <Link 
                href="/seminars" 
                className="mt-8 flex items-center justify-center gap-3 w-full py-4 bg-gray-50 text-[#1B4332] rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#1B4332] hover:text-white transition-all group"
            >
                <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                Full Calendar
            </Link>
        </section>
    );
}

