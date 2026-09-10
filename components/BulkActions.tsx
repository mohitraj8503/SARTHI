'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckSquare, Square, Users, GraduationCap, BookOpen, UserX, Calendar, Award, X, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';

interface BulkAction {
  id: string;
  label: string;
  icon: any;
  description: string;
  confirmMessage: string;
  variant: 'primary' | 'secondary' | 'danger';
}

interface BulkActionsProps {
  entityType: 'students' | 'teachers' | 'courses' | 'enrollments';
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  totalItems: number;
  actions: BulkAction[];
  onActionComplete?: () => void;
}

export default function BulkActions({
  entityType,
  selectedIds,
  onSelectionChange,
  totalItems,
  actions,
  onActionComplete
}: BulkActionsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [executingAction, setExecutingAction] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const { addToast } = useToast();

  const isAllSelected = selectedIds.length === totalItems && totalItems > 0;
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < totalItems;

  const handleSelectAll = () => {
    if (isAllSelected) {
      onSelectionChange([]);
    } else {
      // In a real implementation, you'd fetch all IDs
      // For now, we'll just show the concept
      addToast({
        type: 'info',
        title: 'Select All',
        message: 'This would select all items on current page/all pages',
        duration: 3000
      });
    }
  };

  const handleActionPreview = async (actionId: string) => {
    setExecutingAction(actionId);
    setShowPreview(true);

    try {
      const response = await fetch('/api/admin/bulk-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity: entityType,
          ids: selectedIds,
          action: actionId,
          dryRun: true
        })
      });

      const data = await response.json();

      if (response.ok) {
        setPreviewData(data);
      } else {
        addToast({
          type: 'error',
          title: 'Preview Failed',
          message: data.error || 'Could not generate preview',
          duration: 4000
        });
        setShowPreview(false);
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Preview Failed',
        message: 'Network error occurred',
        duration: 4000
      });
      setShowPreview(false);
    } finally {
      setExecutingAction(null);
    }
  };

  const handleActionExecute = async (actionId: string) => {
    setExecutingAction(actionId);

    try {
      const response = await fetch('/api/admin/bulk-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity: entityType,
          ids: selectedIds,
          action: actionId,
          dryRun: false
        })
      });

      const data = await response.json();

      if (response.ok) {
        const action = actions.find(a => a.id === actionId);
        addToast({
          type: 'success',
          title: 'Bulk Action Completed',
          message: `${data.updated} items updated successfully${data.rollbackToken ? ' (undo available for 15 minutes)' : ''}`,
          duration: 5000
        });

        onSelectionChange([]);
        onActionComplete?.();
        setShowPreview(false);
        setPreviewData(null);
      } else {
        addToast({
          type: 'error',
          title: 'Action Failed',
          message: data.error || 'Bulk action failed',
          duration: 5000
        });
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Action Failed',
        message: 'Network error occurred',
        duration: 5000
      });
    } finally {
      setExecutingAction(null);
    }
  };

  const getEntityIcon = () => {
    switch (entityType) {
      case 'students':
        return <Users className="w-4 h-4" />;
      case 'teachers':
        return <GraduationCap className="w-4 h-4" />;
      case 'courses':
        return <BookOpen className="w-4 h-4" />;
      case 'enrollments':
        return <UserX className="w-4 h-4" />;
      default:
        return <Square className="w-4 h-4" />;
    }
  };

  const getVariantStyles = (variant: string) => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-500 hover:bg-blue-600 text-white';
      case 'secondary':
        return 'bg-gray-500 hover:bg-gray-600 text-white';
      case 'danger':
        return 'bg-red-500 hover:bg-red-600 text-white';
      default:
        return 'bg-gray-500 hover:bg-gray-600 text-white';
    }
  };

  if (selectedIds.length === 0) {
    return null;
  }

  return (
    <>
      {/* Selection Header */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleSelectAll}
              className="flex items-center gap-2 text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
            >
              {isAllSelected ? (
                <CheckSquare className="w-5 h-5" />
              ) : (
                <Square className="w-5 h-5" />
              )}
              <span className="font-medium">
                {selectedIds.length} of {totalItems} selected
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-blue-600 dark:text-blue-400">
              {selectedIds.length} items selected
            </span>
            <button
              onClick={() => onSelectionChange([])}
              className="p-1 hover:bg-blue-100 dark:hover:bg-blue-800/50 rounded transition-colors"
            >
              <X className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Action Bar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 min-w-[400px]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {getEntityIcon()}
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {selectedIds.length} {entityType} selected
                  </span>
                </div>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    ⌄
                  </motion.div>
                </button>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-2"
                  >
                    {actions.map((action) => (
                      <button
                        key={action.id}
                        onClick={() => handleActionPreview(action.id)}
                        disabled={executingAction === action.id}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${getVariantStyles(action.variant)} disabled:opacity-50`}
                      >
                        <action.icon className="w-4 h-4" />
                        <div className="flex-1">
                          <div className="font-medium">{action.label}</div>
                          <div className="text-sm opacity-90">{action.description}</div>
                        </div>
                        {executingAction === action.id && (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && previewData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-md w-full shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Confirm Bulk Action</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Review the impact before proceeding</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Items to be affected:</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{previewData.willAffect}</div>
                </div>

                {previewData.errors && previewData.errors.length > 0 && (
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
                    <div className="text-sm text-red-600 dark:text-red-400 mb-2">Potential issues:</div>
                    <div className="text-sm text-red-700 dark:text-red-300">
                      {previewData.errors.length} items may fail
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleActionExecute(executingAction!)}
                  disabled={executingAction !== null}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  {executingAction ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <CheckCircle className="w-5 h-5" />
                  )}
                  Confirm Action
                </button>
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

