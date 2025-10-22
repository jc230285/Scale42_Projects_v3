'use client';

import { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const getToastClasses = () => {
    const baseClasses = 'flex items-center gap-2 text-white px-6 py-3 rounded shadow-lg border animate-fade-in';

    switch (type) {
      case 'success':
        return `${baseClasses} bg-green-600 border-green-500`;
      case 'error':
        return `${baseClasses} bg-red-600 border-red-500`;
      case 'warning':
        return `${baseClasses} bg-yellow-600 border-yellow-500`;
      case 'info':
      default:
        return `${baseClasses} bg-blue-600 border-blue-500`;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
      default:
        return 'ℹ';
    }
  };

  return (
    <div className={getToastClasses()}>
      <span className='text-lg'>{getIcon()}</span>
      <span className='text-sm font-medium flex-1'>{message}</span>
      <button
        onClick={onClose}
        className='ml-2 text-white hover:text-gray-200 text-lg leading-none'
      >
        ×
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: Array<{ id: string; message: string; type: ToastType }>;
  onRemove: (id: string) => void;
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
}

export function ToastContainer({ toasts, onRemove, position = 'bottom-left' }: ToastContainerProps) {
  const getContainerClasses = () => {
    const baseClasses = 'fixed z-50 space-y-2';

    switch (position) {
      case 'bottom-left':
        return `${baseClasses} bottom-8 left-8`;
      case 'bottom-right':
        return `${baseClasses} bottom-8 right-8`;
      case 'top-left':
        return `${baseClasses} top-8 left-8`;
      case 'top-right':
        return `${baseClasses} top-8 right-8`;
      default:
        return `${baseClasses} bottom-8 left-8`;
    }
  };

  return (
    <div className={getContainerClasses()}>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </div>
  );
}

// Toast hook for easy usage
export function useToast() {
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: ToastType }>>([]);

  const addToast = (message: string, type: ToastType = 'info') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return {
    toasts,
    addToast,
    removeToast,
    success: (message: string) => addToast(message, 'success'),
    error: (message: string) => addToast(message, 'error'),
    warning: (message: string) => addToast(message, 'warning'),
    info: (message: string) => addToast(message, 'info'),
  };
}