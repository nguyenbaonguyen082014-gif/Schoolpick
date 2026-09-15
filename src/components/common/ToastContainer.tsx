import React from 'react';
import { CheckCircle2, Info, AlertTriangle, XCircle, X } from 'lucide-react';
import { useSchoolPick } from '../../context/SchoolPickContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useSchoolPick();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-6 right-4 sm:right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
      {toasts.map(toast => {
        const isSuccess = toast.type === 'success' || !toast.type;
        const isInfo = toast.type === 'info';
        const isWarning = toast.type === 'warning';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-2xl shadow-lg border backdrop-blur-md transition-all duration-300 transform translate-y-0 animate-in fade-in slide-in-from-bottom-3 ${
              isSuccess
                ? 'bg-slate-900/95 text-white border-emerald-500/40'
                : isInfo
                ? 'bg-blue-900/95 text-white border-blue-400/40'
                : isWarning
                ? 'bg-amber-900/95 text-white border-amber-400/40'
                : 'bg-red-900/95 text-white border-red-400/40'
            }`}
          >
            <div className="flex items-center space-x-2.5 mr-2">
              {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
              {isInfo && <Info className="w-4 h-4 text-blue-300 shrink-0" />}
              {isWarning && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />}
              {isError && <XCircle className="w-4 h-4 text-red-400 shrink-0" />}
              <span className="text-xs font-semibold tracking-wide leading-snug">
                {toast.message}
              </span>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
              aria-label="Đóng thông báo"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
