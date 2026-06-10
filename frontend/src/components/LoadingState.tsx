import React from 'react';

export default function LoadingState({ message = 'Loading details...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 space-y-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-indigo-100 dark:border-indigo-900"></div>
        <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
      </div>
      <p className="text-sm font-medium text-slate-500 animate-pulse">{message}</p>
    </div>
  );
}
