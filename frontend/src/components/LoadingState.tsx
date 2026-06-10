import React from 'react';

export default function LoadingState({ message = 'Loading details...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 space-y-5 animate-fade-in">
      <div className="relative w-14 h-14">
        {/* Outer glow ring */}
        <div className="absolute inset-0 rounded-full bg-brand-500/10 animate-ping" style={{ animationDuration: '1.5s' }} />
        {/* Track */}
        <div className="absolute inset-0 rounded-full border-[3px] border-slate-100" />
        {/* Spinner */}
        <div className="absolute inset-0 rounded-full border-[3px] border-brand-500 border-t-transparent animate-spin" style={{ animationDuration: '0.8s' }} />
        {/* Inner dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
        </div>
      </div>
      <div className="text-center space-y-1">
        <p className="text-sm font-semibold text-slate-700">{message}</p>
        <p className="text-xs text-slate-400">Please wait a moment</p>
      </div>
    </div>
  );
}
