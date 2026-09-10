// Deadline Item Component
import { cn } from '@/lib/utils';
import { FileText } from 'lucide-react';

export interface Deadline {
    id: string;
    title: string;
    courseName: string;
    dueDate: string;
    type: 'assignment' | 'quiz' | 'project';
    urgency: 'today' | 'this-week' | 'later';
}

export default function DeadlineItem({ deadline }: { deadline: Deadline }) {
    // Calculate daysUntil relative to user's local "today"
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    const due = new Date(deadline.dueDate);
    const dueDate = new Date(due.getFullYear(), due.getMonth(), due.getDate()).getTime();
    
    const diffTime = dueDate - today;
    const daysUntil = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return (
        <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-[#F7F4EF]/50 transition-colors group">
            <div className={cn("p-2 rounded-lg shrink-0", getUrgencyColor(deadline.urgency))}>
                <FileText className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-[#1F2937] truncate group-hover:text-[#D4956A] transition-colors">
                    {deadline.title}
                </p>
                <p className="text-[11px] text-[#1F2937]/50 truncate">{deadline.courseName}</p>
            </div>
            <div className="text-right shrink-0">
                <p className={cn("text-[10px] font-bold", 
                    deadline.urgency === 'today' ? 'text-red-500' : 
                    deadline.urgency === 'this-week' ? 'text-orange-500' : 'text-green-500'
                )}>
                    {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil}d`}
                </p>
            </div>
        </div>
    );
}

// Helper to get urgency color
function getUrgencyColor(urgency: string): string {
    switch (urgency) {
        case 'today': return 'bg-red-50 text-red-600 border-red-100';
        case 'this-week': return 'bg-orange-50 text-orange-600 border-orange-100';
        default: return 'bg-green-50 text-green-600 border-green-100';
    }
}

