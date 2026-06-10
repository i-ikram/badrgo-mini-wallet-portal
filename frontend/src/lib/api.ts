import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface Wallet {
  id: string;
  userId: string;
  currency: string;
  balance: number; // in cents/minor units
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  walletId: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number; // in cents/minor units
  balanceBefore: number;
  balanceAfter: number;
  referenceId: string;
  description?: string;
  createdAt: string;
}

export interface DailySummary {
  date: string;
  totalCredits: number; // in cents/minor units
  totalDebits: number; // in cents/minor units
  transactionCount: number;
  activeWallets: number;
}

export interface DashboardStats {
  totalWallets: number;
  totalBalance: number; // in cents/minor units
  totalCredits: number; // in cents/minor units
  totalDebits: number; // in cents/minor units
  transactionCount: number;
}

export const usersApi = {
  create: async (data: { name: string; phone: string; email: string }) => {
    const response = await apiClient.post<User>('/users', data);
    return response.data;
  },
  list: async () => {
    const response = await apiClient.get<User[]>('/users');
    return response.data;
  },
};

export const walletsApi = {
  create: async (data: { userId: string; currency?: string }) => {
    const response = await apiClient.post<Wallet>('/wallets', data);
    return response.data;
  },
  get: async (id: string) => {
    const response = await apiClient.get<Wallet>(`/wallets/${id}`);
    return response.data;
  },
  list: async () => {
    const response = await apiClient.get<(Wallet & { user: { name: string; email: string } })[]>('/wallets');
    return response.data;
  },
  credit: async (id: string, data: { amount: number; referenceId: string; description?: string }) => {
    const response = await apiClient.post<Transaction>(`/wallets/${id}/credit`, data);
    return response.data;
  },
  debit: async (id: string, data: { amount: number; referenceId: string; description?: string }) => {
    const response = await apiClient.post<Transaction>(`/wallets/${id}/debit`, data);
    return response.data;
  },
  getTransactions: async (id: string, page = 1, limit = 10) => {
    const response = await apiClient.get<Transaction[]>(`/wallets/${id}/transactions`, {
      params: { page, limit },
    });
    return response.data;
  },
};

export const reportsApi = {
  getDailySummary: async (date?: string) => {
    const response = await apiClient.get<DailySummary>('/reports/daily-summary', {
      params: date ? { date } : {},
    });
    return response.data;
  },
  getDashboardStats: async () => {
    const response = await apiClient.get<DashboardStats>('/reports/dashboard-stats');
    return response.data;
  },
};

export function formatMoney(amount: number, currency = 'USD'): string {
  const value = amount / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(value);
}
