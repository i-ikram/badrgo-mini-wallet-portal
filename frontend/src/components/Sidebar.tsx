'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, BarChart3, Wallet, ChevronRight } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard, description: 'Overview & stats' },
    { name: 'Users', href: '/users', icon: Users, description: 'Manage accounts' },
    { name: 'Reports', href: '/reports', icon: BarChart3, description: 'Daily summaries' },
  ];

  return (
    <aside className="w-[260px] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex flex-col h-full border-r border-slate-800/50 shrink-0 animate-slide-right">
      {/* Branding */}
      <div className="h-[72px] flex items-center px-6 border-b border-white/[0.06] space-x-3">
        <div className="relative p-2 bg-gradient-to-br from-brand-600 to-purple-600 rounded-xl text-white shadow-lg shadow-brand-600/20">
          <Wallet className="w-5 h-5" />
          <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-950" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-sm tracking-wide text-white">
            Badrgo Wallet
          </span>
          <span className="text-[10px] text-slate-500 font-medium">Operations Portal</span>
        </div>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 px-3 py-6">
        <p className="px-3 mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-600">
          Navigation
        </p>
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-white/[0.08] text-white shadow-sm border border-white/[0.06]'
                    : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200 border border-transparent'
                }`}
              >
                <div className="flex items-center">
                  <div className={`p-1.5 rounded-lg mr-3 transition-colors ${
                    isActive
                      ? 'bg-brand-600/20 text-brand-400'
                      : 'bg-slate-800/50 text-slate-500 group-hover:text-slate-300 group-hover:bg-slate-800'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="leading-tight">{item.name}</span>
                    <span className={`text-[10px] font-normal leading-tight mt-0.5 ${
                      isActive ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      {item.description}
                    </span>
                  </div>
                </div>
                {isActive && (
                  <ChevronRight className="w-3.5 h-3.5 text-brand-400" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-white/[0.04]">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.04]">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-600/30 to-purple-600/30 flex items-center justify-center text-brand-400 text-xs font-bold shrink-0">
            OP
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-300 truncate">Control Portal</p>
            <p className="text-[10px] text-slate-600">v1.0 • Assessment</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
