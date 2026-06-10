import React from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}

export default function EmptyState({
  title = 'No records found',
  description = 'There is no data to show in this view right now.',
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 border-2 border-dashed border-slate-200 rounded-2xl bg-gradient-to-b from-white to-slate-50/50 animate-fade-in">
      <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 mb-5">
        {icon || <Inbox className="w-8 h-8 text-slate-300" />}
      </div>
      <h3 className="text-base font-bold text-slate-800 mb-1.5">{title}</h3>
      <p className="text-sm text-slate-400 max-w-xs leading-relaxed">{description}</p>
    </div>
  );
}
