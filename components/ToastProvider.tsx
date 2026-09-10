'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, AlertCircle, X, Info, AlertTriangle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  addToast: (toast: Omit<Toast, 'id'> | string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toastOrMessage: Omit<Toast, 'id'> | string, maybeType?: ToastType) => {
    const id = Math.random().toString(36).substring(7);
    
    let toastObj: Omit<Toast, 'id'>;
    if (typeof toastOrMessage === 'string') {
      toastObj = {
        message: toastOrMessage,
        type: maybeType || 'info'
      };
    } else {
      toastObj = { ...toastOrMessage };
    }

    // Ensure message and title are strictly strings to prevent React Error #31
    if (typeof toastObj.message !== 'string') {
      const msgObj: any = toastObj.message;
      if (msgObj && typeof msgObj === 'object') {
        toastObj.message = String(msgObj.message || msgObj.code || JSON.stringify(msgObj));
      } else {
        toastObj.message = String(msgObj || 'An error occurred');
      }
    }

    if (toastObj.title && typeof toastObj.title !== 'string') {
      const titleObj: any = toastObj.title;
      if (titleObj && typeof titleObj === 'object') {
        toastObj.title = String(titleObj.message || titleObj.code || JSON.stringify(titleObj));
      } else {
        toastObj.title = String(titleObj || '');
      }
    }

    const duration = toastObj.duration || 5000;
    setToasts(prev => [...prev, { ...toastObj, id }]);

    // Auto dismiss
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const value = React.useMemo(() => ({ addToast }), [addToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="pointer-events-auto min-w-[350px] flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-gray-700 backdrop-blur-md"
            >
              <div className={`
                                w-8 h-8 rounded-full flex items-center justify-center mt-0.5
                                ${toast.type === 'success' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : ''}
                                ${toast.type === 'error' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : ''}
                                ${toast.type === 'warning' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' : ''}
                                ${toast.type === 'info' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : ''}
                            `}>
                {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
                {toast.type === 'error' && <AlertCircle className="w-5 h-5" />}
                {toast.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
                {toast.type === 'info' && <Info className="w-5 h-5" />}
              </div>

              <div className="flex-1 min-w-0">
                {toast.title && (
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                    {toast.title}
                  </h4>
                )}
                <p className="text-sm text-gray-700 dark:text-gray-200">
                  {toast.message}
                </p>
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>

          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

