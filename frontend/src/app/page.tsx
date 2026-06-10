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
import { 
  Wallet as WalletIcon, 
  Users as UsersIcon, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Activity,
  Plus,
  ArrowRight,
  TrendingUp
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
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Financial Control Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Real-time overview of users accounts, total transaction volume, and system wallets.</p>
      </div>

      {/* Metrics Cards Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Wallets</span>
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <WalletIcon className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-2xl font-bold text-slate-900">{stats.totalWallets}</span>
              <p className="text-xs text-slate-500 mt-1">Registered wallets</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total System Balance</span>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-2xl font-bold text-slate-900">{formatMoney(stats.totalBalance)}</span>
              <p className="text-xs text-slate-500 mt-1">Across all users</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Credits</span>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-2xl font-bold text-slate-900">{formatMoney(stats.totalCredits)}</span>
              <p className="text-xs text-slate-500 mt-1">Total inputs credited</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Debits</span>
              <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                <ArrowDownLeft className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-2xl font-bold text-slate-900">{formatMoney(stats.totalDebits)}</span>
              <p className="text-xs text-slate-500 mt-1">Total outputs debited</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Transactions count</span>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                <Activity className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-2xl font-bold text-slate-900">{stats.transactionCount}</span>
              <p className="text-xs text-slate-500 mt-1">Processed events</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Wallets list and Quick creation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Wallets Table Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Registered Wallets</h2>
          </div>

          {wallets.length === 0 ? (
            <div className="text-center py-12 border border-slate-100 rounded-2xl bg-white shadow-sm">
              <WalletIcon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm font-medium">No wallets found in the system.</p>
              <p className="text-slate-400 text-xs mt-1">Create one using the form on the right.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">User</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Wallet ID</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Currency</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Balance</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {wallets.map((wallet) => (
                    <tr key={wallet.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-950 text-sm">{wallet.user?.name}</div>
                        <div className="text-xs text-slate-400">{wallet.user?.email}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-xs font-mono select-all">
                        {wallet.id}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-800">
                          {wallet.currency}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-slate-950 text-sm">
                        {formatMoney(wallet.balance, wallet.currency)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link 
                          href={`/wallets/${wallet.id}`}
                          className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
                        >
                          Details <ArrowRight className="w-3.5 h-3.5 ml-1" />
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
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Wallet Actions</h2>
          
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-800 flex items-center">
              <Plus className="w-4 h-4 mr-2 text-indigo-600" /> Create Wallet
            </h3>
            
            <form onSubmit={handleCreateWallet} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Owner User</label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/25 transition"
                  required
                >
                  <option value="">-- Select Owner User --</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
                {users.length === 0 && (
                  <p className="text-xs text-rose-500 mt-1">No users found. Please create a user first.</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/25 transition"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="AED">AED (Dh)</option>
                </select>
              </div>

              {createError && (
                <div className="p-3 text-xs bg-rose-50 text-rose-600 border border-rose-100 rounded-lg">
                  {createError}
                </div>
              )}

              {createSuccess && (
                <div className="p-3 text-xs bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg">
                  Wallet created successfully!
                </div>
              )}

              <button
                type="submit"
                disabled={createLoading || users.length === 0}
                className="w-full py-2.5 px-4 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createLoading ? 'Creating...' : 'Create Wallet'}
              </button>
            </form>
          </div>

          <div className="bg-slate-900/5 p-6 rounded-2xl border border-slate-200/40 text-xs text-slate-500 leading-relaxed">
            <span className="font-bold text-slate-800 block mb-1">Quick Note</span>
            Wallets default to a balance of 0.00 and an ACTIVE status upon initialization. You can credit or debit funds inside the Wallet Details view.
          </div>
        </div>
      </div>
    </div>
  );
}
