'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, BarChart3, Wallet } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Users', href: '/users', icon: Users },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col h-full border-r border-slate-800">
      {/* Branding */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800 space-x-3">
        <div className="p-1.5 bg-indigo-600 rounded-lg text-white">
          <Wallet className="w-6 h-6" />
        </div>
        <span className="font-bold text-base tracking-wide bg-gradient-to-r from-white via-slate-100 to-indigo-400 bg-clip-text text-transparent">
          Badrgo Wallet
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon
                className={`w-5 h-5 mr-3 transition-colors ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                }`}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer info */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
        Operations Control Portal v1.0
      </div>
    </aside>
  );
}
