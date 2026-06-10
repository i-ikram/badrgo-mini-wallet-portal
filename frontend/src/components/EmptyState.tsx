import React from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export default function EmptyState({
  title = 'No records found',
  description = 'There is no data to show in this view right now.',
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
      <div className="p-4 bg-white rounded-full shadow-sm mb-4">
        <Inbox className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm">{description}</p>
    </div>
  );
}
