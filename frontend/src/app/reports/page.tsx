'use client';

import React, { useEffect, useState } from 'react';
import { reportsApi, DailySummary, formatMoney } from '@/lib/api';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import { 
  Calendar, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Activity, 
  Wallet,
  Scale,
  Info
} from 'lucide-react';

export default function ReportsPage() {
  const getTodayDateString = () => {
    return new Date().toISOString().split('T')[0];
  };

  const [date, setDate] = useState(getTodayDateString());
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = async (filterDate: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportsApi.getDailySummary(filterDate);
      setSummary(data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to generate summary report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(date);
  }, [date]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value);
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <PageHeader
        title="Daily Summary Report"
        description="Aggregated platform statistics and ledger accounting metrics per day."
      >
        {/* Date Filter Card */}
        <div className="bg-white px-4 py-3 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3 animate-fade-in">
          <div className="p-2 bg-brand-50 rounded-lg text-brand-600">
            <Calendar className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Target Date</span>
            <input
              type="date"
              value={date}
              onChange={handleDateChange}
              max={getTodayDateString()}
              className="text-xs font-bold text-slate-700 bg-transparent focus:outline-none cursor-pointer border-none p-0 mt-0.5"
            />
          </div>
        </div>
      </PageHeader>

      {loading ? (
        <LoadingState message={`Generating metrics for ${date}...`} />
      ) : error ? (
        <ErrorState message={error} onRetry={() => fetchReport(date)} />
      ) : summary ? (
        <div className="space-y-6">
          
          {/* Main Grid: Analytical Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Credits"
              value={formatMoney(summary.totalCredits)}
              subtitle="Deposits processed on date"
              icon={<ArrowUpRight className="w-4.5 h-4.5" />}
              iconBg="bg-emerald-50 text-emerald-600"
              className="stagger-1"
            />
            <StatCard
              label="Total Debits"
              value={formatMoney(summary.totalDebits)}
              subtitle="Withdrawals/charges processed"
              icon={<ArrowDownLeft className="w-4.5 h-4.5" />}
              iconBg="bg-rose-50 text-rose-600"
              className="stagger-2"
            />
            <StatCard
              label="Net Cash Flow"
              value={formatMoney(summary.totalCredits - summary.totalDebits)}
              subtitle="Credits minus debits volume"
              icon={<Scale className="w-4.5 h-4.5" />}
              iconBg="bg-slate-50 text-slate-600"
              valueColor={summary.totalCredits - summary.totalDebits >= 0 ? 'text-emerald-600' : 'text-rose-600'}
              className="stagger-3"
            />
            <StatCard
              label="Transaction Count"
              value={summary.transactionCount}
              subtitle="Processed ledger entries"
              icon={<Activity className="w-4.5 h-4.5" />}
              iconBg="bg-brand-50 text-brand-600"
              className="stagger-4"
            />
          </div>

          {/* Active Wallets & Report Info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Active Wallets Card */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between gap-6 card-hover animate-slide-up">
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 text-base">Daily Active Transacting Wallets</h3>
                <p className="text-slate-400 text-xs leading-relaxed max-w-md">
                  The number of distinct wallets that generated at least one transaction event (credit or debit) on the selected date. High active wallets indicate healthy transaction distribution.
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-brand-50 to-purple-50 p-5 rounded-2xl flex flex-col items-center justify-center min-w-[120px] border border-brand-100/50 shrink-0">
                <Wallet className="w-5 h-5 text-brand-600 mb-2" />
                <span className="text-3xl font-extrabold text-brand-900 animate-count-up">{summary.activeWallets}</span>
                <span className="text-[10px] font-bold text-brand-500 uppercase mt-1">Wallets</span>
              </div>
            </div>

            {/* Report Scope Card */}
            <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 text-slate-200 p-5 rounded-2xl border border-slate-700/30 shadow-md flex flex-col justify-between overflow-hidden animate-slide-up" style={{ animationDelay: '0.1s' }}>
              {/* Decorative */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-brand-500/10 rounded-full blur-2xl" />
              
              <div className="relative space-y-2">
                <div className="flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-brand-400" />
                  <span className="text-[10px] font-bold text-brand-400 uppercase tracking-wider">Report Scope</span>
                </div>
                <span className="font-bold text-sm text-white block">Audit Date: {date}</span>
                <p className="text-xs text-slate-400 leading-relaxed pt-1">
                  All metrics are generated by query aggregations directly computed in PostgreSQL, preventing inconsistencies between raw ledger logs and live balances.
                </p>
              </div>
              <div className="text-[10px] text-slate-500 mt-4 border-t border-white/5 pt-3 relative">
                Report generated relative to UTC time.
              </div>
            </div>
          </div>

        </div>
      ) : null}
    </div>
  );
}
