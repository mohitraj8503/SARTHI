'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Download, Pause, Trash2, X } from 'lucide-react';

interface BulkActionsBarProps {
  selectedCount: number;
  onEmailClick: () => void;
  onExportClick: () => void;
  onSuspendClick: () => void;
  onDeleteClick: () => void;
  onClearSelection: () => void;
}

export const BulkActionsBar = ({
  selectedCount,
  onEmailClick,
  onExportClick,
  onSuspendClick,
  onDeleteClick,
  onClearSelection
}: BulkActionsBarProps) => {
  if (selectedCount === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#1C2B4A] text-white px-8 py-4 rounded-2xl shadow-2xl z-[60] flex items-center gap-6 border border-white/10 backdrop-blur-md"
      >
        <div className="flex items-center gap-3 pr-6 border-r border-white/10">
          <span className="bg-[#E8B84B] text-[#1C2B4A] w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
            {selectedCount}
          </span>
          <span className="text-sm font-bold uppercase tracking-wider">Students Selected</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onEmailClick}
            className="flex items-center gap-2 text-sm font-bold hover:text-[#E8B84B] transition-colors px-3 py-1 rounded-lg"
            title="Send Bulk Email"
          >
            <Mail className="w-4 h-4" /> Email
          </button>

          <button
            onClick={onExportClick}
            className="flex items-center gap-2 text-sm font-bold hover:text-[#E8B84B] transition-colors px-3 py-1 rounded-lg"
            title="Export selected students"
          >
            <Download className="w-4 h-4" /> Export
          </button>

          <button
            onClick={onSuspendClick}
            className="flex items-center gap-2 text-sm font-bold hover:text-orange-400 transition-colors px-3 py-1 rounded-lg"
            title="Suspend selected students"
          >
            <Pause className="w-4 h-4" /> Suspend
          </button>

          <button
            onClick={onDeleteClick}
            className="flex items-center gap-2 text-sm font-bold hover:text-red-400 transition-colors px-3 py-1 rounded-lg"
            title="Deactivate selected students"
          >
            <Trash2 className="w-4 h-4" /> Deactivate
          </button>

          <div className="w-px h-6 bg-white/10 mx-2" />

          <button
            onClick={onClearSelection}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white"
            title="Clear Selection"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

