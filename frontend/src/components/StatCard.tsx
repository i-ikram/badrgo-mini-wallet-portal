import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  iconBg: string;
  className?: string;
  valueColor?: string;
}

export default function StatCard({
  label,
  value,
  subtitle,
  icon,
  iconBg,
  className = '',
  valueColor = 'text-slate-900',
}: StatCardProps) {
  return (
    <div className={`bg-white p-5 rounded-2xl border border-slate-100 shadow-sm card-hover animate-slide-up ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider leading-tight">
          {label}
        </span>
        <div className={`p-2 rounded-xl ${iconBg}`}>
          {icon}
        </div>
      </div>
      <div>
        <span className={`text-2xl font-extrabold tracking-tight ${valueColor} animate-count-up block`}>
          {value}
        </span>
        <p className="text-[11px] text-slate-400 mt-1.5 font-medium">{subtitle}</p>
      </div>
    </div>
  );
}
