'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  reportsApi, 
  walletsApi, 
  usersApi, 
  DashboardStats, 
  Wallet, 
  User, 
  formatMoney 
} from '@/lib/api';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import { 
  Wallet as WalletIcon, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Activity,
  Plus,
  ArrowRight,
  TrendingUp,
  Sparkles
} from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [wallets, setWallets] = useState<(Wallet & { user: { name: string; email: string } })[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Create wallet form state
  const [selectedUserId, setSelectedUserId] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [statsData, walletsData, usersData] = await Promise.all([
        reportsApi.getDashboardStats(),
        walletsApi.list(),
        usersApi.list()
      ]);
      
      setStats(statsData);
      setWallets(walletsData);
      setUsers(usersData);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to fetch dashboard data. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) {
      setCreateError('Please select a user');
      return;
    }
    
    try {
      setCreateLoading(true);
      setCreateError(null);
      setCreateSuccess(false);
      
      await walletsApi.create({
        userId: selectedUserId,
        currency
      });
      
      setCreateSuccess(true);
      setSelectedUserId('');
      // Refresh statistics and list
      await Promise.all([
        reportsApi.getDashboardStats().then(setStats),
        walletsApi.list().then(setWallets)
      ]);
    } catch (err: any) {
      setCreateError(err.response?.data?.message || 'Failed to create wallet');
    } finally {
      setCreateLoading(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading dashboard statistics..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchData} />;
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <PageHeader
        title="Financial Control Dashboard"
        description="Real-time overview of user accounts, transaction volume, and system wallets."
      />

      {/* Metrics Cards Grid */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            label="Total Wallets"
            value={stats.totalWallets}
            subtitle="Registered wallets"
            icon={<WalletIcon className="w-4.5 h-4.5" />}
            iconBg="bg-brand-50 text-brand-600"
            className="stagger-1"
          />
          <StatCard
            label="System Balance"
            value={formatMoney(stats.totalBalance)}
            subtitle="Across all users"
            icon={<TrendingUp className="w-4.5 h-4.5" />}
            iconBg="bg-emerald-50 text-emerald-600"
            className="stagger-2"
          />
          <StatCard
            label="Total Credits"
            value={formatMoney(stats.totalCredits)}
            subtitle="Total inputs credited"
            icon={<ArrowUpRight className="w-4.5 h-4.5" />}
            iconBg="bg-blue-50 text-blue-600"
            className="stagger-3"
          />
          <StatCard
            label="Total Debits"
            value={formatMoney(stats.totalDebits)}
            subtitle="Total outputs debited"
            icon={<ArrowDownLeft className="w-4.5 h-4.5" />}
            iconBg="bg-rose-50 text-rose-600"
            className="stagger-4"
          />
          <StatCard
            label="Transactions"
            value={stats.transactionCount}
            subtitle="Processed events"
            icon={<Activity className="w-4.5 h-4.5" />}
            iconBg="bg-amber-50 text-amber-600"
            className="stagger-5"
          />
        </div>
      )}

      {/* Main Grid: Wallets list and Quick creation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Wallets Table Column */}
        <div className="lg:col-span-2 space-y-5 animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Registered Wallets</h2>
            <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
              {wallets.length} total
            </span>
          </div>

          {wallets.length === 0 ? (
            <div className="text-center py-14 border-2 border-dashed border-slate-200 rounded-2xl bg-gradient-to-b from-white to-slate-50/50">
              <WalletIcon className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500 text-sm font-semibold">No wallets found</p>
              <p className="text-slate-400 text-xs mt-1">Create one using the form on the right.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80">
                    <th className="px-5 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">User</th>
                    <th className="px-5 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Wallet ID</th>
                    <th className="px-5 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Currency</th>
                    <th className="px-5 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Balance</th>
                    <th className="px-5 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {wallets.map((wallet) => (
                    <tr key={wallet.id} className="table-row-hover">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-100 to-purple-100 flex items-center justify-center text-brand-700 font-bold text-xs shrink-0">
                            {wallet.user?.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 text-sm">{wallet.user?.name}</div>
                            <div className="text-[11px] text-slate-400">{wallet.user?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-500 text-[11px] font-mono select-all">
                        {wallet.id.slice(0, 8)}...
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-50 text-slate-600 border border-slate-100">
                          {wallet.currency}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="font-bold text-slate-900 text-sm tabular-nums">
                          {formatMoney(wallet.balance, wallet.currency)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link 
                          href={`/wallets/${wallet.id}`}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-600 hover:text-brand-800 transition-colors px-3 py-1.5 rounded-lg hover:bg-brand-50"
                        >
                          Details <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions Column */}
        <div className="space-y-5 animate-slide-up" style={{ animationDelay: '0.25s' }}>
          <h2 className="text-lg font-bold text-slate-900">Quick Actions</h2>
          
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-50">
              <div className="p-1.5 rounded-lg bg-brand-50 text-brand-600">
                <Plus className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-slate-800">Create Wallet</h3>
            </div>
            
            <form onSubmit={handleCreateWallet} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5 tracking-wide">Owner User</label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 transition-all"
                  required
                >
                  <option value="">— Select Owner User —</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
                {users.length === 0 && (
                  <p className="text-[11px] text-rose-500 mt-1.5 font-medium">No users found. Please create a user first.</p>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5 tracking-wide">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 transition-all"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="AED">AED (Dh)</option>
                </select>
              </div>

              {createError && (
                <div className="p-3 text-xs bg-rose-50 text-rose-600 border border-rose-100 rounded-xl font-medium">
                  {createError}
                </div>
              )}

              {createSuccess && (
                <div className="p-3 text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl font-medium flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  Wallet created successfully!
                </div>
              )}

              <button
                type="submit"
                disabled={createLoading || users.length === 0}
                className="w-full py-2.5 px-4 text-xs font-bold rounded-xl bg-brand-600 text-white hover:bg-brand-700 active:scale-[0.98] transition-all shadow-sm shadow-brand-600/20 disabled:opacity-50 disabled:cursor-not-allowed focus-ring"
              >
                {createLoading ? 'Creating...' : 'Create Wallet'}
              </button>
            </form>
          </div>

          <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 p-5 rounded-2xl border border-slate-200/60 text-xs text-slate-500 leading-relaxed">
            <span className="font-bold text-slate-700 text-xs block mb-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 inline-block" />
              Quick Note
            </span>
            Wallets default to a balance of 0.00 and an ACTIVE status upon initialization. You can credit or debit funds inside the Wallet Details view.
          </div>
        </div>
      </div>
    </div>
  );
}
