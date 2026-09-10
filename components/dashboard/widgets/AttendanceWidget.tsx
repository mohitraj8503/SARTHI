import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AttendanceData {
    overallPercentage: number;
    totalSessions: number;
    attendedSessions: number;
    thisWeekAttended: number;
    thisWeekTotal: number;
}

function AttendanceWidget({ attendance }: { attendance: AttendanceData }) {
    const getColorClass = (percentage: number) => {
        if (percentage >= 80) return 'text-green-500';
        if (percentage >= 60) return 'text-yellow-500';
        return 'text-red-500';
    };
    
    return (
        <div className="bg-white p-6 rounded-[16px] border border-[#EAE6DF]/60 shadow-[0_2px_8px_rgba(45,74,62,0.02)] transition-all hover:border-[#D4956A]/10">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-[#1F2937]" />
                    <span className="text-[13px] font-outfit font-bold text-[#1F2937] tracking-wider uppercase text-[9px]">Attendance</span>
                </div>
                <span className={cn("px-3 py-1 rounded-full text-[12px] font-bold", 
                    attendance.overallPercentage >= 80 ? 'bg-green-100 text-green-700' :
                    attendance.overallPercentage >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                )}>
                    {attendance.overallPercentage}%
                </span>
            </div>
            <div className="w-full h-1 bg-[#F7F4EF] rounded-full overflow-hidden mb-4">
                <div 
                    className={cn("h-full rounded-full transition-all duration-700", 
                        attendance.overallPercentage >= 80 ? 'bg-green-500/60' :
                        attendance.overallPercentage >= 60 ? 'bg-yellow-500/60' : 'bg-red-500/60'
                    )}
                    style={{ width: `${attendance.overallPercentage}%` }}
                />
            </div>
            <div className="flex justify-between text-[10px] text-[#5D705C]/60 italic font-nunito">
                <span>{attendance.attendedSessions} sessions done</span>
                <span>Goal met: {attendance.thisWeekAttended}/{attendance.thisWeekTotal}</span>
            </div>
        </div>
    );
}

export default AttendanceWidget;

