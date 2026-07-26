import React, { useEffect } from 'react';
import { CheckCircle2, XCircle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error';
  title: string;
  message: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    if (!toast) return;

    // Auto dismiss after 5 seconds
    const timer = setTimeout(() => {
      onDismiss();
    }, 5000);

    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  const isSuccess = toast.type === 'success';

  return (
    <div className="fixed top-5 right-5 z-50 max-w-md w-full px-4 animate-slide-in-right">
      <div
        className={`p-4 rounded-2xl border shadow-2xl backdrop-blur-lg flex items-start gap-3 relative ${
          isSuccess
            ? 'bg-slate-900/95 border-emerald-500/40 text-slate-100 shadow-emerald-950/20'
            : 'bg-slate-900/95 border-rose-500/40 text-slate-100 shadow-rose-950/20'
        }`}
      >
        <div className={`p-2 rounded-xl flex-shrink-0 ${isSuccess ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
          {isSuccess ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
        </div>

        <div className="flex-1 pr-6">
          <h4 className={`text-xs font-bold uppercase tracking-wider ${isSuccess ? 'text-emerald-400' : 'text-rose-400'}`}>
            {toast.title}
          </h4>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed break-words">
            {toast.message}
          </p>
        </div>

        <button
          onClick={onDismiss}
          className="absolute top-3 right-3 p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
          title="Dismiss Toast"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
