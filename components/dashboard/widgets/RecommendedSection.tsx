// Recommended Content Component
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { BookOpen, Video, Zap, PlayCircle, Star } from 'lucide-react';

export interface RecommendedItem {
    id: string;
    title: string;
    type: 'course' | 'seminar' | 'workshop' | 'video';
    description: string;
    thumbnail?: string;
    link: string;
    reason: string;
}

export default function RecommendedSection({ recommendations }: { recommendations: RecommendedItem[] }) {
    if (recommendations.length === 0) return null;
    
    const getIcon = (type: string) => {
        switch (type) {
            case 'course': return BookOpen;
            case 'seminar': return Video;
            case 'workshop': return Zap;
            case 'video': return PlayCircle;
            default: return Star;
        }
    };
    
    const getColor = (type: string) => {
        switch (type) {
            case 'course': return 'bg-blue-50 text-blue-500';
            case 'seminar': return 'bg-purple-50 text-purple-500';
            case 'workshop': return 'bg-green-50 text-green-500';
            case 'video': return 'bg-orange-50 text-orange-500';
            default: return 'bg-gray-50 text-gray-500';
        }
    };
    
    return (
        <section>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-[4px] h-6 bg-[#D4956A] rounded-full"></div>
                    <h2 className="text-[20px] font-lora italic font-normal text-[#2A3828] tracking-tight">
                        Recommended for You
                    </h2>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {recommendations.slice(0, 4).map(item => {
                    const Icon = getIcon(item.type);
                    return (
                        <Link 
                            key={item.id} 
                            href={item.link}
                            className="bg-white p-5 rounded-[24px] border border-[#EAE6DF] hover:border-[#D4956A]/30 hover:shadow-lg transition-all group"
                        >
                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", getColor(item.type))}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <p className="text-[10px] font-bold text-[#D4956A] uppercase tracking-wider mb-1">{item.type}</p>
                            <h4 className="text-[14px] font-medium text-[#2A3828] line-clamp-2 mb-2 group-hover:text-[#D4956A] transition-colors">
                                {item.title}
                            </h4>
                            <p className="text-[10px] text-[#5D705C] line-clamp-1">{item.reason}</p>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}

