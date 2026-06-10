'use client';

import React, { useEffect, useState } from 'react';
import { reportsApi, DailySummary, formatMoney } from '@/lib/api';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';
import { 
  BarChart3, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Activity, 
  Wallet,
  Scale
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Daily Summary Report</h1>
          <p className="text-slate-500 text-sm mt-1">Aggregated platform statistics and ledger accounting metrics per day.</p>
        </div>

        {/* Date Filter Card */}
        <div className="bg-white px-4 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
          <Calendar className="w-5 h-5 text-indigo-500" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Select Target Date</span>
            <input
              type="date"
              value={date}
              onChange={handleDateChange}
              max={getTodayDateString()}
              className="text-xs font-bold text-slate-700 bg-transparent focus:outline-none cursor-pointer border-none p-0 mt-0.5"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingState message={`Generating metrics for ${date}...`} />
      ) : error ? (
        <ErrorState message={error} onRetry={() => fetchReport(date)} />
      ) : summary ? (
        <div className="space-y-8">
          
          {/* Main Grid: Analytical Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Credits Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Credits</span>
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-2xl font-bold text-slate-900">
                  {formatMoney(summary.totalCredits)}
                </span>
                <p className="text-xs text-slate-500 mt-1">Deposits processed on date</p>
              </div>
            </div>

            {/* Debits Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Debits</span>
                <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                  <ArrowDownLeft className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-2xl font-bold text-slate-900">
                  {formatMoney(summary.totalDebits)}
                </span>
                <p className="text-xs text-slate-500 mt-1">Withdrawals/charges processed</p>
              </div>
            </div>

            {/* Net Flow Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Net Cash Flow</span>
                <div className="p-2 bg-slate-50 text-slate-600 rounded-lg">
                  <Scale className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <span className={`text-2xl font-bold ${
                  summary.totalCredits - summary.totalDebits >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {formatMoney(summary.totalCredits - summary.totalDebits)}
                </span>
                <p className="text-xs text-slate-500 mt-1">Credits minus debits volume</p>
              </div>
            </div>

            {/* Event Count Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Transaction Count</span>
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Activity className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-2xl font-bold text-slate-900">
                  {summary.transactionCount}
                </span>
                <p className="text-xs text-slate-500 mt-1">Processed ledger entries</p>
              </div>
            </div>

          </div>

          {/* Active Wallets Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between gap-6">
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 text-base">Daily Active Transacting Wallets</h3>
                <p className="text-slate-500 text-xs leading-relaxed max-w-md">
                  This metrics indicates the number of distinct wallets that generated at least one transaction event (credit or debit) on the selected date. High active wallets indicate healthy transaction distribution.
                </p>
              </div>
              
              <div className="bg-indigo-50 p-6 rounded-2xl flex flex-col items-center justify-center min-w-32 border border-indigo-100">
                <Wallet className="w-6 h-6 text-indigo-600 mb-2" />
                <span className="text-3xl font-extrabold text-indigo-950">{summary.activeWallets}</span>
                <span className="text-[10px] font-bold text-indigo-500 uppercase mt-1">Wallets</span>
              </div>
            </div>

            {/* Note info card */}
            <div className="bg-slate-900 text-slate-200 p-6 rounded-2xl border border-slate-800 shadow-md flex flex-col justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Report Scope</span>
                <span className="font-bold text-sm text-white block">Audit Date: {date}</span>
                <p className="text-xs text-slate-400 leading-relaxed pt-1">
                  All metrics are generated by queryaggregations directly computed in PostgreSQL, preventing inconsistencies between raw ledger transaction logs and live balances.
                </p>
              </div>
              <div className="text-[10px] text-slate-500 mt-4 border-t border-slate-800 pt-3">
                Report generated relative to UTC time.
              </div>
            </div>
          </div>

        </div>
      ) : null}
    </div>
  );
}
