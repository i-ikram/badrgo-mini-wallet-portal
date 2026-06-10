import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({
  title = 'An error occurred',
  message = 'We encountered an error loading this section. Please try again.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 border border-rose-100 rounded-2xl bg-gradient-to-b from-rose-50/50 to-white animate-fade-in">
      <div className="p-4 bg-white rounded-2xl shadow-sm border border-rose-100 mb-5">
        <AlertCircle className="w-8 h-8 text-rose-500" />
      </div>
      <h3 className="text-base font-bold text-rose-900 mb-1.5">{title}</h3>
      <p className="text-sm text-rose-500/80 max-w-sm leading-relaxed mb-5">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          type="button"
          className="inline-flex items-center px-5 py-2.5 text-xs font-bold rounded-xl bg-rose-600 text-white hover:bg-rose-700 active:scale-[0.97] transition-all shadow-sm shadow-rose-600/20 focus-ring"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-2" />
          Try Again
        </button>
      )}
    </div>
  );
}
