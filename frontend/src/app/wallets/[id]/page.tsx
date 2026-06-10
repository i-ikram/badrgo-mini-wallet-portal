'use client';

import React, { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  walletsApi, 
  Wallet, 
  Transaction, 
  formatMoney 
} from '@/lib/api';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';
import { 
  ArrowLeft, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Wallet as WalletIcon, 
  Plus, 
  Minus,
  RefreshCw,
  Coins,
  FileText,
  Activity
} from 'lucide-react';

export default function WalletDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const walletId = resolvedParams.id;

  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Operations Forms State
  const [activeTab, setActiveTab] = useState<'credit' | 'debit'>('credit');
  const [amount, setAmount] = useState('');
  const [referenceId, setReferenceId] = useState('');
  const [description, setDescription] = useState('');
  const [opLoading, setOpLoading] = useState(false);
  const [opError, setOpError] = useState<string | null>(null);
  const [opSuccess, setOpSuccess] = useState<string | null>(null);

  const fetchWalletDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const [walletData, transactionsData] = await Promise.all([
        walletsApi.get(walletId),
        walletsApi.getTransactions(walletId, 1, 50) // fetch latest 50 transactions
      ]);
      setWallet(walletData);
      setTransactions(transactionsData);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to fetch wallet details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletDetails();
  }, [walletId]);

  // Helper to generate a random unique transaction reference
  const generateReferenceId = () => {
    const timestamp = Date.now();
    const rand = Math.floor(Math.random() * 1000000);
    setReferenceId(`TX-${timestamp}-${rand}`);
  };

  // Convert decimal text input to integer cents
  const parseAmountToCents = (val: string): number => {
    const num = parseFloat(val);
    if (isNaN(num)) return 0;
    return Math.round(num * 100);
  };

  const handleOperationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOpError(null);
    setOpSuccess(null);

    const amountInCents = parseAmountToCents(amount);
    if (amountInCents <= 0) {
      setOpError('Please enter a valid amount greater than 0.');
      return;
    }

    if (!referenceId.trim()) {
      setOpError('Please provide a unique reference ID.');
      return;
    }

    try {
      setOpLoading(true);
      
      const payload = {
        amount: amountInCents,
        referenceId: referenceId.trim(),
        description: description.trim() || undefined,
      };

      let tx: Transaction;
      if (activeTab === 'credit') {
        tx = await walletsApi.credit(walletId, payload);
        setOpSuccess(`Successfully credited ${formatMoney(tx.amount, wallet?.currency)}! Ref: ${tx.referenceId}`);
      } else {
        tx = await walletsApi.debit(walletId, payload);
        setOpSuccess(`Successfully debited ${formatMoney(tx.amount, wallet?.currency)}! Ref: ${tx.referenceId}`);
      }

      // Reset operation inputs
      setAmount('');
      setReferenceId('');
      setDescription('');

      // Refresh wallet & transactions
      const [walletData, transactionsData] = await Promise.all([
        walletsApi.get(walletId),
        walletsApi.getTransactions(walletId, 1, 50)
      ]);
      setWallet(walletData);
      setTransactions(transactionsData);
    } catch (err: any) {
      setOpError(err.response?.data?.message || 'Failed to execute wallet operation.');
    } finally {
      setOpLoading(false);
    }
  };

  if (loading) {
    return <LoadingState message="Fetching wallet balances & ledger..." />;
  }

  if (error || !wallet) {
    return <ErrorState message={error || 'Wallet not found.'} onRetry={fetchWalletDetails} />;
  }

  return (
    <div className="space-y-8">
      {/* Back Link */}
      <div className="flex items-center justify-between">
        <Link 
          href="/" 
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Dashboard
        </Link>
        <button
          onClick={fetchWalletDetails}
          className="p-2 bg-white rounded-xl border border-slate-100 hover:bg-slate-50 transition shadow-sm"
          title="Refresh ledger details"
        >
          <RefreshCw className="w-4 h-4 text-slate-600" />
        </button>
      </div>

      {/* Header and Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Wallet Account</h1>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
              wallet.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
            }`}>
              {wallet.status}
            </span>
          </div>
          <p className="text-slate-400 text-xs mt-1 font-mono">{wallet.id}</p>
        </div>

        {/* Currency badge */}
        <div className="bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm flex items-center gap-2">
          <Coins className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-bold text-slate-600">Base Currency:</span>
          <span className="text-xs font-extrabold text-slate-900">{wallet.currency}</span>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left/Middle Columns: Balance card and transaction history */}
        <div className="lg:col-span-2 space-y-6">
          {/* Balance Display Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden border border-slate-800">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Available Balance</span>
            <div className="text-4xl font-extrabold tracking-tight mt-2">
              {formatMoney(wallet.balance, wallet.currency)}
            </div>
            <div className="border-t border-slate-700/50 mt-6 pt-4 flex justify-between text-xs text-slate-400">
              <span>Owner Account Reference:</span>
              <span className="font-mono text-slate-300">{wallet.userId}</span>
            </div>
          </div>

          {/* Ledger History List */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center">
              <FileText className="w-4 h-4 mr-2 text-indigo-600" /> Ledger Transactions ({transactions.length})
            </h2>

            {transactions.length === 0 ? (
              <div className="text-center py-16 border border-slate-100 rounded-2xl bg-white shadow-sm">
                <Activity className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm font-medium">No transactions found.</p>
                <p className="text-slate-400 text-xs mt-1">Wallet hasn't been credited or debited yet.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-100">
                {transactions.map((tx) => (
                  <div key={tx.id} className="p-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${
                        tx.type === 'CREDIT' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {tx.type === 'CREDIT' ? (
                          <ArrowUpRight className="w-5 h-5" />
                        ) : (
                          <ArrowDownLeft className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">
                          {tx.type === 'CREDIT' ? 'Credit Deposit' : 'Debit Charge'}
                        </div>
                        {tx.description && (
                          <div className="text-xs text-slate-500 mt-0.5">{tx.description}</div>
                        )}
                        <div className="text-[10px] text-slate-400 mt-1 font-mono select-all">
                          Ref: {tx.referenceId}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`font-bold text-sm ${
                        tx.type === 'CREDIT' ? 'text-emerald-600' : 'text-slate-900'
                      }`}>
                        {tx.type === 'CREDIT' ? '+' : '-'}{formatMoney(tx.amount, wallet.currency)}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        Bal: {formatMoney(tx.balanceAfter, wallet.currency)}
                      </div>
                      <div className="text-[9px] text-slate-400 mt-0.5">
                        {new Date(tx.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Operations Panel */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-slate-900">Execute Balance Change</h2>
          
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Tabs Selector */}
            <div className="flex border-b border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('credit');
                  setOpError(null);
                  setOpSuccess(null);
                }}
                className={`flex-1 py-4 text-xs font-bold border-b-2 uppercase tracking-wider transition ${
                  activeTab === 'credit' 
                    ? 'border-indigo-600 text-indigo-600 bg-slate-50/50' 
                    : 'border-transparent text-slate-400 hover:text-slate-800'
                }`}
              >
                Credit (+)
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('debit');
                  setOpError(null);
                  setOpSuccess(null);
                }}
                className={`flex-1 py-4 text-xs font-bold border-b-2 uppercase tracking-wider transition ${
                  activeTab === 'debit' 
                    ? 'border-indigo-600 text-indigo-600 bg-slate-50/50' 
                    : 'border-transparent text-slate-400 hover:text-slate-800'
                }`}
              >
                Debit (-)
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleOperationSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Amount ({wallet.currency})</label>
                <div className="relative rounded-lg shadow-sm">
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/25 transition"
                    required
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Provide amount in standard decimal units (e.g. 10.50).</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5 flex justify-between items-center">
                  <span>Reference ID (Idempotent)</span>
                  <button
                    type="button"
                    onClick={generateReferenceId}
                    className="text-[10px] text-indigo-600 font-bold hover:underline"
                  >
                    Generate Ref
                  </button>
                </label>
                <input
                  type="text"
                  value={referenceId}
                  onChange={(e) => setReferenceId(e.target.value)}
                  placeholder="Unique ID or click generate"
                  className="w-full px-3.5 py-2 text-xs font-mono rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/25 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional memo..."
                  rows={2}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/25 transition resize-none"
                />
              </div>

              {opError && (
                <div className="p-3 text-xs bg-rose-50 text-rose-600 border border-rose-100 rounded-lg">
                  {opError}
                </div>
              )}

              {opSuccess && (
                <div className="p-3 text-xs bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg">
                  {opSuccess}
                </div>
              )}

              <button
                type="submit"
                disabled={opLoading || wallet.status !== 'ACTIVE'}
                className={`w-full py-2.5 px-4 text-xs font-semibold rounded-xl text-white transition shadow-sm flex items-center justify-center ${
                  activeTab === 'credit'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {activeTab === 'credit' ? (
                  <Plus className="w-4 h-4 mr-2" />
                ) : (
                  <Minus className="w-4 h-4 mr-2" />
                )}
                {opLoading 
                  ? 'Processing...' 
                  : activeTab === 'credit' 
                    ? 'Credit Wallet' 
                    : 'Debit Wallet'
                }
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
