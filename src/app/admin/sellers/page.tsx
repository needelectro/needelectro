'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import {
  Store,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Search,
  Filter,
  RefreshCw,
  Phone,
  Mail,
  FileText,
  DollarSign
} from 'lucide-react';

export default function AdminSellersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      router.push('/customer/dashboard');
      return;
    }
    loadSellers();
  }, [user]);

  const loadSellers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/sellers');
      const data = await res.json();
      if (data.sellers) {
        setSellers(data.sellers);
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (sellerId: string, status: string) => {
    try {
      setActionLoading(sellerId);
      const res = await fetch('/api/v1/sellers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sellerId, status }),
      });
      if (res.ok) {
        await loadSellers();
      }
    } catch {
      // error
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = sellers.filter((s) => {
    const matchesStatus = filterStatus === 'ALL' || s.status === filterStatus;
    const matchesSearch =
      s.businessName.toLowerCase().includes(search.toLowerCase()) ||
      s.tradeLicenseNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
      s.phone.includes(search);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-brand-600 font-semibold mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                Merchant &amp; Seller Partner Approvals
              </h1>
              <p className="text-xs text-slate-500">
                Audit Trade Licenses, distributor credentials, and approve hardware merchant partners.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={loadSellers} className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="glass-card p-4 rounded-2xl flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by business, trade license, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white/80 focus:outline-brand-500"
          />
        </div>

        <div className="flex gap-2">
          {['ALL', 'PENDING', 'VERIFIED', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`text-[11px] font-bold px-3 py-1.5 rounded-xl border transition ${
                filterStatus === st
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-white/70 text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Sellers List */}
      <div className="glass-card rounded-3xl overflow-hidden border border-white/80 shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading merchant applications...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">No merchants found for this filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-5 py-3.5">Business &amp; License</th>
                  <th className="px-5 py-3.5">Contact Person</th>
                  <th className="px-5 py-3.5">Categories Supplied</th>
                  <th className="px-5 py-3.5">Settlement Info</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-white/60 transition">
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-900">{s.businessName}</p>
                      <p className="text-[11px] font-mono text-brand-600">License: {s.tradeLicenseNumber}</p>
                      <p className="text-[10px] text-slate-400">{s.address}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-900">{s.contactPerson}</p>
                      <p className="text-[11px] text-slate-500">{s.phone}</p>
                      <p className="text-[10px] text-slate-400">{s.email}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-slate-800 line-clamp-2">{s.productCategories}</p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Commission: {s.commissionRate}%</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-[11px] text-slate-600 line-clamp-2">{s.bankAccountDetails || 'Pending bank details'}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
                        s.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' :
                        s.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right space-x-2">
                      {s.status !== 'VERIFIED' && (
                        <button
                          onClick={() => handleUpdateStatus(s.id, 'VERIFIED')}
                          disabled={actionLoading === s.id}
                          className="text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-lg transition"
                        >
                          Approve
                        </button>
                      )}
                      {s.status !== 'REJECTED' && (
                        <button
                          onClick={() => handleUpdateStatus(s.id, 'REJECTED')}
                          disabled={actionLoading === s.id}
                          className="text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-300 px-2.5 py-1 rounded-lg transition"
                        >
                          Reject
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
