import React from 'react';
import { AlertCircle } from 'lucide-react';

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
    <div className="flex flex-col items-center justify-center text-center py-12 px-4 border border-rose-100 rounded-2xl bg-rose-50/50">
      <div className="p-3 bg-white rounded-full shadow-sm mb-4">
        <AlertCircle className="w-8 h-8 text-rose-500" />
      </div>
      <h3 className="text-base font-semibold text-rose-950 mb-1">{title}</h3>
      <p className="text-sm text-rose-600 max-w-sm mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          type="button"
          className="inline-flex items-center px-4 py-2 text-xs font-semibold rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition shadow-sm"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
