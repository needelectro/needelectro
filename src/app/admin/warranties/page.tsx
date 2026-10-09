'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import {
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  RefreshCw,
  QrCode,
  Wrench,
  X
} from 'lucide-react';

export default function AdminWarrantiesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [claims, setClaims] = useState<any[]>([]);
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
    loadClaims();
  }, [user]);

  const loadClaims = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/warranty');
      const data = await res.json();
      if (data.claims) {
        setClaims(data.claims);
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateClaim = async (claimId: string, status: string, adminNotes?: string) => {
    try {
      setActionLoading(claimId);
      const res = await fetch('/api/v1/warranty', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimId, status, adminNotes }),
      });
      if (res.ok) {
        await loadClaims();
      }
    } catch {
      // error
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = claims.filter((c) => {
    const matchesStatus = filterStatus === 'ALL' || c.status === filterStatus;
    const matchesSearch =
      c.claimNumber.toLowerCase().includes(search.toLowerCase()) ||
      (c.device?.serialNumber || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.device?.productName || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.device?.customer?.user?.name || '').toLowerCase().includes(search.toLowerCase());
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
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                Digital Warranty &amp; Claims Management
              </h1>
              <p className="text-xs text-slate-500">
                Review hardware warranty claims, verify serial QR codes, and authorize lab repair or component replacement.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/warranty" target="_blank" className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5">
            <QrCode className="w-3.5 h-3.5 text-emerald-600" />
            Public Serial Check
          </Link>
          <button onClick={loadClaims} className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5">
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
            placeholder="Search by claim #, serial #, device..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white/80 focus:outline-brand-500"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {['ALL', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'RESOLVED', 'REJECTED'].map((st) => (
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

      {/* Claims List */}
      <div className="glass-card rounded-3xl overflow-hidden border border-white/80 shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading warranty claims...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">No warranty claims found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-5 py-3.5">Claim ID &amp; Date</th>
                  <th className="px-5 py-3.5">Device &amp; Serial Number</th>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Reported Issue</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-white/60 transition">
                    <td className="px-5 py-4">
                      <p className="font-mono font-bold text-slate-900">{c.claimNumber}</p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(c.createdAt).toLocaleDateString('en-BD')}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-900">{c.device?.productName}</p>
                      <p className="font-mono text-[11px] text-emerald-700 font-bold">
                        SN: {c.device?.serialNumber}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Invoice: {c.device?.invoiceNumber}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-900">{c.device?.customer?.user?.name || 'Customer'}</p>
                      <p className="text-[10px] text-slate-400">{c.device?.customer?.user?.phone}</p>
                    </td>
                    <td className="px-5 py-4 max-w-xs">
                      <p className="text-slate-800 line-clamp-2">{c.issueDescription}</p>
                      {c.adminNotes && (
                        <p className="text-[10px] text-brand-600 mt-1 font-semibold">Note: {c.adminNotes}</p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
                        c.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                        c.status === 'RESOLVED' ? 'bg-sky-100 text-sky-800' :
                        c.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right space-x-2">
                      {c.status === 'SUBMITTED' && (
                        <button
                          onClick={() => handleUpdateClaim(c.id, 'APPROVED', 'Approved for Moulvibazar Lab Hardware Diagnostics')}
                          disabled={actionLoading === c.id}
                          className="text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-lg transition"
                        >
                          Approve
                        </button>
                      )}
                      {['SUBMITTED', 'APPROVED', 'UNDER_REVIEW'].includes(c.status) && (
                        <button
                          onClick={() => handleUpdateClaim(c.id, 'RESOLVED', 'Hardware verified, serviced and returned to customer')}
                          disabled={actionLoading === c.id}
                          className="text-[11px] font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-300 px-2.5 py-1 rounded-lg transition"
                        >
                          Resolve
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
