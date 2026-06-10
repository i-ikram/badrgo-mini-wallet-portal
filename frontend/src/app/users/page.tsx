'use client';

import React, { useEffect, useState } from 'react';
import { usersApi, User } from '@/lib/api';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';
import { UserPlus, User as UserIcon, Calendar, Mail, Phone, ShieldCheck } from 'lucide-react';

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
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">User Administration</h1>
        <p className="text-slate-500 text-sm mt-1">Register new platform users and manage existing user accounts.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Create User Form */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Add New User</h2>
          
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/25 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. john.doe@example.com"
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/25 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +1234567890"
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/25 transition"
                  required
                />
              </div>

              {createError && (
                <div className="p-3 text-xs bg-rose-50 text-rose-600 border border-rose-100 rounded-lg">
                  {createError}
                </div>
              )}

              {createSuccess && (
                <div className="p-3 text-xs bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg">
                  User registered successfully!
                </div>
              )}

              <button
                type="submit"
                disabled={createLoading}
                className="w-full py-2.5 px-4 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-sm disabled:opacity-50 flex items-center justify-center"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                {createLoading ? 'Registering...' : 'Register User'}
              </button>
            </form>
          </div>
        </div>

        {/* Right: Users List */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Registered Platform Users</h2>

          {users.length === 0 ? (
            <div className="text-center py-16 border border-slate-100 rounded-2xl bg-white shadow-sm">
              <UserIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-slate-700 text-sm">No Users Found</h3>
              <p className="text-slate-400 text-xs mt-1">Add a new user using the registration form.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {users.map((user) => (
                <div 
                  key={user.id} 
                  className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:border-slate-200 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-slate-900 text-base">{user.name}</div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        user.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {user.status}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-500">
                      <div className="flex items-center">
                        <Mail className="w-3.5 h-3.5 mr-2 text-slate-400" />
                        <span className="select-all">{user.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-3.5 h-3.5 mr-2 text-slate-400" />
                        <span className="select-all">{user.phone}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-3.5 h-3.5 mr-2 text-slate-400" />
                        <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-50 mt-4 pt-3 flex items-center justify-between text-[10px] text-slate-400">
                    <span>ID: {user.id.slice(0, 8)}...</span>
                    <span className="flex items-center text-indigo-600 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Verified Account
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
