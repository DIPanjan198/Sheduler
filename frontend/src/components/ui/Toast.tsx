import React from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success', onClose }) => {
  const getColors = () => {
    switch (type) {
      case 'error':
        return { bg: 'bg-rose-50 border-rose-200 text-rose-800', icon: <AlertTriangle className="w-5 h-5 text-rose-600" /> };
      case 'info':
        return { bg: 'bg-sky-50 border-sky-200 text-sky-800', icon: <Info className="w-5 h-5 text-sky-600" /> };
      default:
        return { bg: 'bg-emerald-50 border-emerald-200 text-emerald-800', icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" /> };
    }
  };

  const { bg, icon } = getColors();

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-[92%] max-w-md animate-bounce-short">
      <div className={`flex items-center justify-between p-4 rounded-card border shadow-lifted ${bg}`}>
        <div className="flex items-center gap-3">
          {icon}
          <span className="text-sm font-medium">{message}</span>
        </div>
        <button onClick={onClose} className="p-1 hover:opacity-70 rounded-md">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
