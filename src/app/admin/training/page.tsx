'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import {
  GraduationCap,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Award,
  Search,
  Filter,
  RefreshCw,
  UserCheck,
  ShieldCheck,
  Eye,
  Send,
  X
} from 'lucide-react';

export default function AdminTrainingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Certify modal state
  const [certifyingApp, setCertifyingApp] = useState<any | null>(null);
  const [certNotes, setCertNotes] = useState('');

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      router.push('/customer/dashboard');
      return;
    }
    loadApplications();
  }, [user]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/training?applications=true');
      const data = await res.json();
      if (data.applications) {
        setApplications(data.applications);
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (appId: string, status: string, notes?: string) => {
    try {
      setActionLoading(appId);
      const res = await fetch('/api/v1/training', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: appId,
          status,
          notes,
        }),
      });
      if (res.ok) {
        await loadApplications();
        setCertifyingApp(null);
      }
    } catch {
      // error
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = applications.filter((app) => {
    const matchesStatus = filterStatus === 'ALL' || app.status === filterStatus;
    const matchesSearch =
      app.fullName.toLowerCase().includes(search.toLowerCase()) ||
      app.phone.includes(search) ||
      (app.course?.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (app.certificateNumber || '').toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-brand-600 font-semibold mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                Skills Academy &amp; Student Management
              </h1>
              <p className="text-xs text-slate-500">
                Manage enrollment applications, approve student admissions, and issue authentic graduate certificates.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/verify-certificate" target="_blank" className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Certificate Validator
          </Link>
          <button onClick={loadApplications} className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="glass-card p-4 rounded-2xl flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student name, phone, course..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white/80 focus:outline-brand-500"
          />
        </div>

        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {['ALL', 'SUBMITTED', 'ADMITTED', 'IN_TRAINING', 'CERTIFIED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`text-[11px] font-bold px-3 py-1.5 rounded-xl border transition ${
                filterStatus === st
                  ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                  : 'bg-white/70 text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Applications Table */}
      <div className="glass-card rounded-3xl overflow-hidden border border-white/80 shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading student applications...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">No applications match your filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-5 py-3.5">Student Details</th>
                  <th className="px-5 py-3.5">Course Program</th>
                  <th className="px-5 py-3.5">Education &amp; Level</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Certificate ID</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((app) => (
                  <tr key={app.id} className="hover:bg-white/60 transition">
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-900">{app.fullName}</p>
                      <p className="text-[11px] text-slate-500">{app.phone} &bull; {app.email}</p>
                      <p className="text-[10px] text-slate-400">{app.address}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800 line-clamp-1">{app.course?.title}</p>
                      <p className="text-[10px] text-brand-600 font-bold">{app.course?.category} &bull; {app.course?.durationWeeks} Weeks</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-800">{app.education}</p>
                      <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-bold">
                        {app.experienceLevel}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                        app.status === 'CERTIFIED' ? 'bg-emerald-100 text-emerald-800' :
                        app.status === 'ADMITTED' ? 'bg-sky-100 text-sky-800' :
                        app.status === 'IN_TRAINING' ? 'bg-purple-100 text-purple-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono text-[11px] font-bold text-slate-900">
                      {app.certificateNumber ? (
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {app.certificateNumber}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-normal">Not Issued</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right space-x-2">
                      {app.status === 'SUBMITTED' && (
                        <button
                          onClick={() => handleUpdateStatus(app.id, 'ADMITTED')}
                          disabled={actionLoading === app.id}
                          className="text-[11px] font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-300 px-2.5 py-1 rounded-lg transition"
                        >
                          Admit
                        </button>
                      )}
                      {app.status === 'ADMITTED' && (
                        <button
                          onClick={() => handleUpdateStatus(app.id, 'IN_TRAINING')}
                          disabled={actionLoading === app.id}
                          className="text-[11px] font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-300 px-2.5 py-1 rounded-lg transition"
                        >
                          Start Training
                        </button>
                      )}
                      {app.status !== 'CERTIFIED' && (
                        <button
                          onClick={() => {
                            setCertifyingApp(app);
                            setCertNotes(`Passed lab assessment with Honors. Ready for verified technician dispatch.`);
                          }}
                          className="text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-lg transition"
                        >
                          Issue Certificate
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

      {/* CERTIFY MODAL */}
      {certifyingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in">
          <div className="glass-card bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl border border-white space-y-4 relative">
            <button
              onClick={() => setCertifyingApp(null)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-black text-slate-900">
                Issue Official Certificate
              </h3>
            </div>

            <p className="text-xs text-slate-600">
              Issuing certificate to <strong className="text-slate-900">{certifyingApp.fullName}</strong> for program <strong className="text-slate-900">{certifyingApp.course?.title}</strong>. This credential will be instantly verifiable on the public validation portal.
            </p>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Assessment Notes / Honors</label>
              <textarea
                rows={3}
                value={certNotes}
                onChange={(e) => setCertNotes(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCertifyingApp(null)}
                className="btn-secondary text-xs py-2 px-4"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateStatus(certifyingApp.id, 'CERTIFIED', certNotes)}
                disabled={actionLoading === certifyingApp.id}
                className="btn-primary text-xs py-2 px-5 flex items-center gap-1.5 shadow-glass-glow"
              >
                {actionLoading === certifyingApp.id ? 'Certifying...' : 'Certify & Issue ID'}
                <CheckCircle2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
