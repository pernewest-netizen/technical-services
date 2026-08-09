import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useUIStore } from '@/stores';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useUIStore();

  return (
    <div className="fixed top-4 left-4 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: any; onClose: () => void }> = ({ toast, onClose }) => {
  const icons = {
    success: <CheckCircle className="h-5 w-5 text-emerald-500" />,
    error: <XCircle className="h-5 w-5 text-red-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
  };

  const borders = {
    success: 'border-emerald-500/30',
    error: 'border-red-500/30',
    warning: 'border-amber-500/30',
    info: 'border-blue-500/30',
  };

  return (
    <div className={cn(
      'flex items-start gap-3 rounded-lg border bg-card p-4 shadow-lg min-w-[320px] max-w-[420px]',
      'animate-in slide-in-from-left-5 fade-in duration-300',
      borders[toast.type]
    )}>
      {icons[toast.type]}
      <div className="flex-1">
        <h4 className="font-medium text-sm">{toast.title}</h4>
        {toast.message && <p className="text-sm text-muted-foreground mt-0.5">{toast.message}</p>}
      </div>
      <button onClick={onClose} className="opacity-60 hover:opacity-100 transition-opacity">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};
