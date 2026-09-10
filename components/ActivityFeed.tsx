'use client';

import { CheckCircle, PlayCircle, Star, Award, Zap, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface ActivityItem {
    id: string;
    type: string;
    action?: string;
    title?: string;
    subtitle?: string;
    timestamp: string;
    details?: any;
}

export default function ActivityFeed({ activities }: { activities: ActivityItem[] }) {
    const getIcon = (type: string) => {
        switch (type) {
            case 'LESSON_COMPLETED':
            case 'LESSON_COMPLETE': 
                return <CheckCircle className="w-4 h-4 text-emerald-500" />;
            case 'COURSE_ENROLL': 
                return <Star className="w-4 h-4 text-primary" />;
            case 'CERTIFICATE_EARNED':
            case 'CERTIFICATE_GENERATED': 
                return <Award className="w-4 h-4 text-orange-500" />;
            case 'SEMINAR_REGISTERED':
            case 'SEMINAR_ATTENDANCE': 
                return <Zap className="w-4 h-4 text-purple-500" />;
            case 'ASSIGNMENT_SUBMITTED':
            case 'ASSIGNMENT_SUBMISSION': 
                return <CheckCircle className="w-4 h-4 text-blue-500" />;
            default: 
                return <Clock className="w-4 h-4 text-muted-foreground" />;
        }
    };

    // Get activity display text - support both old format (action) and new format (title/subtitle)
    const getActivityText = (activity: ActivityItem) => {
        // If we have action (old format), use it
        if (activity.action) return activity.action;
        // Otherwise use title and subtitle (new format)
        if (activity.title) {
            return activity.subtitle ? `${activity.title} - ${activity.subtitle}` : activity.title;
        }
        return 'Activity';
    };

    if (!activities || activities.length === 0) {
        return (
            <div className="p-8 text-center bg-secondary/30 rounded-3xl border border-dashed border-border">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">No recent activity</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {activities.map((activity, i) => (
                <div key={activity.id} className="relative flex gap-4 group">
                    {i < activities.length - 1 && (
                        <div className="absolute left-4 top-8 bottom-0 w-px bg-border" />
                    )}
                    <div className="w-8 h-8 rounded-xl bg-secondary border border-border flex items-center justify-center shrink-0 z-10 transition-transform group-hover:scale-110">
                        {getIcon(activity.type)}
                    </div>
                    <div className="flex-1 pb-4">
                        <div className="flex justify-between items-start">
                            <h4 className="text-[13px] font-bold text-foreground leading-tight">{getActivityText(activity)}</h4>
                            <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                                {new Date(activity.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                        </div>
                        {activity.details?.courseName && (
                            <p className="text-[11px] text-muted-foreground mt-1">{activity.details.courseName}</p>
                        )}
                        {activity.type === 'LESSON_COMPLETE' && (
                             <p className="text-[11px] text-emerald-600 font-bold mt-1 uppercase tracking-tighter">+10 XP</p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

