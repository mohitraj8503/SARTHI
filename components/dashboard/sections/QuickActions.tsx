import { Download, Plus } from 'lucide-react';

interface QuickActionsProps {
  onExport: () => void;
  onAddCourse: () => void;
}

export function QuickActions({ onExport, onAddCourse }: QuickActionsProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={onExport}
        className="flex items-center gap-2 px-6 py-3 border border-[#1C2B4A] text-[#1C2B4A] rounded-full text-[12px] font-bold uppercase tracking-widest hover:bg-[#1C2B4A] hover:text-white transition-all shadow-sm"
      >
        <Download className="w-4 h-4" /> Export
      </button>
      <button
        onClick={onAddCourse}
        className="flex items-center gap-2 px-8 py-3 bg-[#E8B84B] text-white rounded-full text-[12px] font-bold uppercase tracking-widest hover:bg-[#D4A53B] transition-all shadow-lg shadow-[#E8B84B]/20"
      >
        <Plus className="w-4 h-4" /> Add Course
      </button>
    </div>
  );
}

