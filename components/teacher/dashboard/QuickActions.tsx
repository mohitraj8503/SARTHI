import { 
  Plus, 
  Megaphone, 
  Calendar, 
  FileText, 
  MessageSquare, 
  Upload,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function QuickActions() {
  const actions = [
    { 
      id: 'new-course',
      label: 'New Course', 
      icon: Plus, 
      color: 'bg-emerald-50 text-emerald-600', 
      description: 'Design your curriculum',
      href: '/teacher/courses/new'
    },
    { 
      id: 'schedule',
      label: 'Schedule', 
      icon: Calendar, 
      color: 'bg-amber-50 text-amber-600', 
      description: 'Set live class times',
      href: '/teacher/seminars/new'
    },
    { 
      id: 'upload',
      label: 'Upload Video', 
      icon: Upload, 
      color: 'bg-slate-900 text-white', 
      description: 'Add media to vault',
      href: '/teacher/videos'
    },
  ];

  return (
    <div className="bg-white rounded-[32px] p-8 border border-[#EAF0F7] shadow-[0_12px_35px_rgba(15,23,42,0.06)] h-auto">
      <div className="flex items-center justify-between mb-8 px-2">
        <div className="space-y-1">
          <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">DIRECT WORKFLOWS</h3>
          <p className="text-xl font-black text-slate-900 tracking-tight">Quick Actions</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-2 pt-2">
          {actions.map((action) => {
            const Content = (
              <div className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all duration-300 group cursor-pointer border border-transparent hover:border-slate-200 hover:shadow-sm">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform ${action.color}`}>
                  <action.icon className="w-4.5 h-4.5" />
                </div>
                <div className="flex-1">
                  <p className="text-[12px] font-black text-slate-900 tracking-tight leading-none mb-1.5">{action.label}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{action.description}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
              </div>
            );

            if (action.href) {
              return <Link key={action.id} href={action.href}>{Content}</Link>;
            }

            return <button key={action.id} onClick={action.onClick} className="w-full text-left">{Content}</button>;
          })}
        </div>
      </div>
    </div>
  );
}

