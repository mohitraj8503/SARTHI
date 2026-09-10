import { PlayCircle, Zap } from 'lucide-react';
import Link from 'next/link';

interface Workshop {
    id: string;
    title: string;
    date: string;
    status: string;
    instructor: string;
}

// Empty State Component
function EmptyState({
    icon: Icon,
    title,
    description,
    actions
}: {
    icon: any;
    title: string;
    description: string;
    actions?: { label: string; href: string }[];
}) {
    return (
        <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 bg-[#F7F4EF] rounded-full flex items-center justify-center mx-auto text-[#1F2937]/20 relative overflow-hidden">
                <Icon className="w-8 h-8 relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[#D4956A]/5" />
            </div>
            <p className="text-[15px] font-outfit text-[#1F2937] max-w-[280px] mx-auto leading-relaxed font-light">
                {description}
            </p>
            {actions && actions.length > 0 && (
                <div className="flex flex-wrap justify-center gap-4 mt-8">
                    {actions.map((action, i) => (
                        <Link
                            key={i}
                            href={action.href}
                            className="px-6 py-2.5 rounded-full border border-[#D4956A]/30 text-[11px] font-outfit font-medium text-[#1F2937] tracking-[0.1em] hover:bg-[#F7F4EF] transition-all duration-300"
                            aria-label={`Go to ${action.label}`}
                        >
                            {action.label}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

function WorkshopsWidget({ workshops }: { workshops: Workshop[] }) {
    return (
        <section className="bg-white p-8 rounded-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.035)] border-transparent group">
            <div className="flex items-center justify-between mb-6 border-b border-[#F7F4EF] pb-5">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full bg-emerald-50 text-emerald-600">
                        <PlayCircle className="w-5 h-5" />
                    </div>
                    <span className="text-[14px] font-outfit font-bold text-[#1F2937] tracking-wider uppercase text-[10px]">Workshops</span>
                </div>
            </div>

            <div className="space-y-3">
                {workshops.length > 0 ? (
                    workshops.slice(0, 2).map((workshop, i) => (
                        <div key={workshop.id || i} className="p-4 bg-[#F8FBF9] rounded-2xl border border-[#E8F5EE] group hover:border-emerald-200 transition-all">
                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">{workshop.status}</p>
                            <h4 className="text-[12px] font-bold text-[#1A3C2E] line-clamp-1 group-hover:text-emerald-700 transition-colors uppercase tracking-tight">{workshop.title}</h4>
                            <div className="flex items-center justify-between mt-3 text-[10px] font-medium text-[#5D705C]">
                                <span>{new Date(workshop.date).toLocaleDateString()}</span>
                                <span className="font-bold text-[#1A3C2E]">{workshop.instructor}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <EmptyState
                        icon={Zap}
                        title="No workshops"
                        description="Start with beginner-friendly skill labs."
                        actions={[
                            { label: 'View Workshops', href: '/workshops' }
                        ]}
                    />
                )}
            </div>
        </section>
    );
}

export default WorkshopsWidget;

