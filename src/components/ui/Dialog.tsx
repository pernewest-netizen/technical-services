import React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const Dialog: React.FC<DialogProps> = ({ isOpen, onClose, title, description, children, className }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={cn(
        'relative z-50 w-full max-w-lg rounded-xl border bg-card p-6 shadow-lg',
        'animate-in fade-in zoom-in-95 duration-200',
        className
      )}>
        <button
          onClick={onClose}
          className="absolute left-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
        {title && <h2 className="text-lg font-semibold">{title}</h2>}
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
};

export const ConfirmDialog: React.FC<{
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ isOpen, title, message, confirmText = 'تأكيد', cancelText = 'إلغاء', variant = 'danger', onConfirm, onCancel }) => {
  if (!isOpen) return null;

  const variantStyles = {
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    warning: 'bg-amber-600 hover:bg-amber-700 text-white',
    info: 'bg-blue-600 hover:bg-blue-700 text-white',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative z-50 w-full max-w-md rounded-xl border bg-card p-6 shadow-lg">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground mt-2">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-input bg-background hover:bg-accent transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={cn('px-4 py-2 rounded-lg transition-colors', variantStyles[variant])}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
