import React from 'react';
import { AlertCircle, HelpCircle, X } from 'lucide-react';
import { useSchoolPick } from '../../context/SchoolPickContext';

export const ConfirmModal: React.FC = () => {
  const { confirmDialog, closeConfirmation } = useSchoolPick();

  if (!confirmDialog) return null;

  const {
    title,
    message,
    confirmLabel = 'Xác nhận',
    cancelLabel = 'Hủy',
    isDestructive = false,
    onConfirm,
    onCancel,
  } = confirmDialog;

  const handleConfirm = () => {
    onConfirm();
    closeConfirmation();
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    closeConfirmation();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start space-x-3 mb-4">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
              isDestructive ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
            }`}
          >
            {isDestructive ? (
              <AlertCircle className="w-5 h-5" />
            ) : (
              <HelpCircle className="w-5 h-5" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-base font-extrabold text-slate-900 leading-snug">{title}</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{message}</p>
          </div>
          <button
            onClick={handleCancel}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-6 flex items-center justify-end space-x-2.5 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`px-5 py-2 rounded-xl text-xs font-black shadow-md transition-transform active:scale-95 cursor-pointer ${
              isDestructive
                ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/20'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
