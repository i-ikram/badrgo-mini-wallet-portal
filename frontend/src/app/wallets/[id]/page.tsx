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
  Activity,
  Sparkles,
  Zap,
  Copy,
  Check
} from 'lucide-react';

export default function WalletDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const walletId = resolvedParams.id;

  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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

  const handleCopyId = async () => {
    await navigator.clipboard.writeText(walletId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
    <div className="space-y-6">
      {/* Back Link */}
      <div className="flex items-center justify-between animate-fade-in">
        <Link 
          href="/" 
          className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-slate-900 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5 group-hover:-translate-x-0.5 transition-transform" /> Back to Dashboard
        </Link>
        <button
          onClick={fetchWalletDetails}
          className="p-2 bg-white rounded-xl border border-slate-100 hover:bg-slate-50 active:scale-95 transition-all shadow-sm focus-ring"
          title="Refresh ledger details"
        >
          <RefreshCw className="w-4 h-4 text-slate-500" />
        </button>
      </div>

      {/* Header and Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-slide-up">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Wallet Account</h1>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${
              wallet.status === 'ACTIVE' 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                : 'bg-rose-50 text-rose-700 border border-rose-100'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                wallet.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'
              }`} />
              {wallet.status}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <p className="text-slate-400 text-xs font-mono">{wallet.id}</p>
            <button 
              onClick={handleCopyId}
              className="p-0.5 rounded hover:bg-slate-100 transition-colors"
              title="Copy wallet ID"
            >
              {copied ? (
                <Check className="w-3 h-3 text-emerald-500" />
              ) : (
                <Copy className="w-3 h-3 text-slate-300 hover:text-slate-500" />
              )}
            </button>
          </div>
        </div>

        {/* Currency badge */}
        <div className="bg-white px-4 py-2.5 rounded-xl border border-slate-100 shadow-sm flex items-center gap-2.5">
          <Coins className="w-4 h-4 text-amber-500" />
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Currency:</span>
          <span className="text-xs font-extrabold text-slate-900">{wallet.currency}</span>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left/Middle Columns: Balance card and transaction history */}
        <div className="lg:col-span-2 space-y-6">
          {/* Balance Display Card */}
          <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-brand-950 p-7 rounded-2xl text-white shadow-xl overflow-hidden border border-slate-700/30 animate-slide-up">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-brand-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl" />
            
            <div className="relative">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Available Balance</span>
              <div className="text-4xl font-extrabold tracking-tight mt-2 animate-count-up">
                {formatMoney(wallet.balance, wallet.currency)}
              </div>
              <div className="border-t border-white/10 mt-5 pt-4 flex justify-between text-xs text-slate-400">
                <span>Owner Account Reference</span>
                <span className="font-mono text-slate-300">{wallet.userId.slice(0, 16)}...</span>
              </div>
            </div>
          </div>

          {/* Ledger History List */}
          <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-500" />
                Ledger Transactions
              </h2>
              <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
                {transactions.length} entries
              </span>
            </div>

            {transactions.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-2xl bg-gradient-to-b from-white to-slate-50/50">
                <Activity className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-500 text-sm font-semibold">No transactions found</p>
                <p className="text-slate-400 text-xs mt-1">Wallet hasn&apos;t been credited or debited yet.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
                {transactions.map((tx, index) => (
                  <div 
                    key={tx.id} 
                    className="p-4 flex items-center justify-between table-row-hover"
                    style={{ animationDelay: `${index * 0.03}s` }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl shrink-0 ${
                        tx.type === 'CREDIT' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'
                      }`}>
                        {tx.type === 'CREDIT' ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : (
                          <ArrowDownLeft className="w-4 h-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 text-sm">
                          {tx.type === 'CREDIT' ? 'Credit Deposit' : 'Debit Charge'}
                        </div>
                        {tx.description && (
                          <div className="text-xs text-slate-400 mt-0.5 truncate max-w-[250px]">{tx.description}</div>
                        )}
                        <div className="text-[10px] text-slate-300 mt-1 font-mono select-all">
                          Ref: {tx.referenceId}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 ml-4">
                      <div className={`font-bold text-sm tabular-nums ${
                        tx.type === 'CREDIT' ? 'text-emerald-600' : 'text-slate-900'
                      }`}>
                        {tx.type === 'CREDIT' ? '+' : '-'}{formatMoney(tx.amount, wallet.currency)}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 tabular-nums">
                        Bal: {formatMoney(tx.balanceAfter, wallet.currency)}
                      </div>
                      <div className="text-[10px] text-slate-300 mt-0.5">
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
        <div className="space-y-5 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-lg font-bold text-slate-900">Execute Operation</h2>
          
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
                className={`flex-1 py-3.5 text-xs font-bold border-b-2 uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'credit' 
                    ? 'border-emerald-500 text-emerald-600 bg-emerald-50/30' 
                    : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50/50'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                Credit
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('debit');
                  setOpError(null);
                  setOpSuccess(null);
                }}
                className={`flex-1 py-3.5 text-xs font-bold border-b-2 uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'debit' 
                    ? 'border-brand-500 text-brand-600 bg-brand-50/30' 
                    : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50/50'
                }`}
              >
                <Minus className="w-3.5 h-3.5" />
                Debit
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleOperationSubmit} className="p-5 space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5 tracking-wide">
                  Amount ({wallet.currency})
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 transition-all tabular-nums"
                  required
                />
                <p className="text-[10px] text-slate-300 mt-1">Provide amount in standard decimal units (e.g. 10.50).</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                    Reference ID
                  </label>
                  <button
                    type="button"
                    onClick={generateReferenceId}
                    className="text-[10px] text-brand-600 font-bold hover:text-brand-800 transition-colors flex items-center gap-1"
                  >
                    <Zap className="w-3 h-3" />
                    Auto Generate
                  </button>
                </div>
                <input
                  type="text"
                  value={referenceId}
                  onChange={(e) => setReferenceId(e.target.value)}
                  placeholder="Unique idempotent key"
                  className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5 tracking-wide">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional memo..."
                  rows={2}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 transition-all resize-none"
                />
              </div>

              {opError && (
                <div className="p-3 text-xs bg-rose-50 text-rose-600 border border-rose-100 rounded-xl font-medium">
                  {opError}
                </div>
              )}

              {opSuccess && (
                <div className="p-3 text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl font-medium flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  {opSuccess}
                </div>
              )}

              <button
                type="submit"
                disabled={opLoading || wallet.status !== 'ACTIVE'}
                className={`w-full py-2.5 px-4 text-xs font-bold rounded-xl text-white transition-all shadow-sm flex items-center justify-center active:scale-[0.98] focus-ring ${
                  activeTab === 'credit'
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                    : 'bg-brand-600 hover:bg-brand-700 shadow-brand-600/20'
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

          {/* Info card */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 p-4 rounded-2xl border border-slate-200/60 text-xs text-slate-500 leading-relaxed">
            <span className="font-bold text-slate-700 text-xs block mb-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
              Idempotency Note
            </span>
            Each Reference ID ensures that duplicate submissions are safely rejected. Use the auto-generate feature for unique references.
          </div>
        </div>

      </div>
    </div>
  );
}
