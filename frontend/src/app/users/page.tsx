'use client';

import React, { useEffect, useState } from 'react';
import { usersApi, User } from '@/lib/api';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';
import PageHeader from '@/components/PageHeader';
import { UserPlus, User as UserIcon, Calendar, Mail, Phone, ShieldCheck, Sparkles } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await usersApi.list();
      setUsers(data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load users list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) {
      setCreateError('Please fill out all fields.');
      return;
    }

    try {
      setCreateLoading(true);
      setCreateError(null);
      setCreateSuccess(false);

      await usersApi.create({ name, email, phone });

      setCreateSuccess(true);
      setName('');
      setEmail('');
      setPhone('');
      
      // Refresh list
      const data = await usersApi.list();
      setUsers(data);
    } catch (err: any) {
      setCreateError(err.response?.data?.message || 'Failed to create user.');
    } finally {
      setCreateLoading(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading registered users..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchUsers} />;
  }

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <PageHeader
        title="User Administration"
        description="Register new platform users and manage existing user accounts."
      >
        <span className="text-xs font-medium text-slate-400 bg-white px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm">
          {users.length} registered
        </span>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Create User Form */}
        <div className="space-y-5 animate-slide-up">
          <h2 className="text-lg font-bold text-slate-900">Add New User</h2>
          
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2.5 pb-3 mb-4 border-b border-slate-50">
              <div className="p-1.5 rounded-lg bg-brand-50 text-brand-600">
                <UserPlus className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-slate-800">Registration Form</h3>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5 tracking-wide">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5 tracking-wide">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. john.doe@example.com"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5 tracking-wide">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +1234567890"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 transition-all"
                  required
                />
              </div>

              {createError && (
                <div className="p-3 text-xs bg-rose-50 text-rose-600 border border-rose-100 rounded-xl font-medium">
                  {createError}
                </div>
              )}

              {createSuccess && (
                <div className="p-3 text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl font-medium flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  User registered successfully!
                </div>
              )}

              <button
                type="submit"
                disabled={createLoading}
                className="w-full py-2.5 px-4 text-xs font-bold rounded-xl bg-brand-600 text-white hover:bg-brand-700 active:scale-[0.98] transition-all shadow-sm shadow-brand-600/20 disabled:opacity-50 flex items-center justify-center focus-ring"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                {createLoading ? 'Registering...' : 'Register User'}
              </button>
            </form>
          </div>
        </div>

        {/* Right: Users List */}
        <div className="lg:col-span-2 space-y-5 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-lg font-bold text-slate-900">Platform Users</h2>

          {users.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-2xl bg-gradient-to-b from-white to-slate-50/50">
              <UserIcon className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <h3 className="font-bold text-slate-600 text-sm">No Users Found</h3>
              <p className="text-slate-400 text-xs mt-1">Add a new user using the registration form.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {users.map((user, index) => (
                <div 
                  key={user.id} 
                  className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm card-hover animate-slide-up flex flex-col justify-between"
                  style={{ animationDelay: `${0.1 + index * 0.05}s` }}
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-100 to-purple-100 flex items-center justify-center text-brand-700 font-bold text-sm shrink-0">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-900 text-sm truncate">{user.name}</div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold mt-0.5 ${
                          user.status === 'ACTIVE' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                            : 'bg-slate-50 text-slate-500 border border-slate-100'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1 ${
                            user.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-400'
                          }`} />
                          {user.status}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                        <span className="select-all truncate">{user.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                        <span className="select-all">{user.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                        <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-50 mt-4 pt-3 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-mono">ID: {user.id.slice(0, 8)}...</span>
                    <span className="flex items-center text-brand-600 font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Verified
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
