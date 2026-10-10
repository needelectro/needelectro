'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import {
  Building2,
  ArrowLeft,
  Plus,
  MapPin,
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  RefreshCw,
  Navigation,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function AdminBranchesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    division: 'Sylhet',
    district: 'Moulvibazar',
    upazila: '',
    address: '',
    phone: '',
    email: '',
    managerName: '',
    isHeadquarters: false,
    coverageAreas: '',
    workingHours: 'Saturday - Thursday: 9:00 AM - 8:00 PM',
    emergencyHotline: '',
  });

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      router.push('/customer/dashboard');
      return;
    }
    loadBranches();
  }, [user]);

  const loadBranches = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/branches');
      const data = await res.json();
      if (data.branches) {
        setBranches(data.branches);
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  const handleAddBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setErrorMessage(null);
      const res = await fetch('/api/v1/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to add branch');
        return;
      }
      setShowAddModal(false);
      setForm({
        name: '',
        division: 'Sylhet',
        district: 'Moulvibazar',
        upazila: '',
        address: '',
        phone: '',
        email: '',
        managerName: '',
        isHeadquarters: false,
        coverageAreas: '',
        workingHours: 'Saturday - Thursday: 9:00 AM - 8:00 PM',
        emergencyHotline: '',
      });
      await loadBranches();
    } catch {
      setErrorMessage('Network error');
    } finally {
      setSubmitting(false);
    }
  };

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
            <div className="w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                Physical Branch Network Management
              </h1>
              <p className="text-xs text-slate-500">
                Configure regional centers, coverage regions, and local emergency dispatch contact numbers.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 shadow-glass-glow"
          >
            <Plus className="w-4 h-4" />
            Add New Branch
          </button>
          <button onClick={loadBranches} className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>
      </div>

      {/* Branches Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">Loading branch network...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {branches.map((b) => (
            <div
              key={b.id}
              className={`glass-card p-6 rounded-3xl border border-white/80 space-y-4 relative ${
                b.isHeadquarters ? 'ring-2 ring-brand-500/30' : ''
              }`}
            >
              {b.isHeadquarters && (
                <span className="absolute top-4 right-4 text-[10px] bg-brand-600 text-white font-black px-2.5 py-0.5 rounded-full uppercase">
                  Headquarters
                </span>
              )}

              <div>
                <span className="text-[10px] font-bold uppercase text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
                  {b.district} &bull; {b.upazila}
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-2">{b.name}</h3>
                <p className="text-xs text-slate-500 flex items-start gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  {b.address}
                </p>
              </div>

              <div className="space-y-1 text-xs text-slate-600 bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
                <p><strong className="text-slate-800">Manager:</strong> {b.managerName}</p>
                <p><strong className="text-slate-800">Phone:</strong> {b.phone}</p>
                <p><strong className="text-slate-800">Email:</strong> {b.email}</p>
                <p><strong className="text-slate-800">Hours:</strong> {b.workingHours}</p>
              </div>

              <div className="text-xs text-slate-500 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                  <Navigation className="w-3 h-3 text-brand-500" /> Coverage:
                </span>
                <p className="text-[11px] leading-relaxed text-slate-600">{b.coverageAreas}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD BRANCH MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in">
          <div className="glass-card bg-white max-w-lg w-full rounded-3xl p-6 sm:p-8 shadow-2xl border border-white space-y-4 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-5 right-5 p-1 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-slate-900">Add New Branch Location</h3>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleAddBranch} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Branch Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NEED ELECTRO Kulaura Service Hub"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">District *</label>
                  <input
                    type="text"
                    required
                    value={form.district}
                    onChange={(e) => setForm({ ...form, district: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Upazila *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kulaura"
                    value={form.upazila}
                    onChange={(e) => setForm({ ...form, upazila: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Address *</label>
                <input
                  type="text"
                  required
                  placeholder="Full physical address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Branch Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="017xxxxxxxx"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Branch Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="branch@needelectro.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Manager Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Engr. Kabir Ahmed"
                  value={form.managerName}
                  onChange={(e) => setForm({ ...form, managerName: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Coverage Areas *</label>
                <input
                  type="text"
                  required
                  placeholder="Comma-separated coverage regions"
                  value={form.coverageAreas}
                  onChange={(e) => setForm({ ...form, coverageAreas: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary text-xs py-2 px-5 shadow-glass-glow disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
