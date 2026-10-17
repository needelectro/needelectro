'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import {
  Wrench, MapPin, Clock, Calendar, CheckCircle2, AlertCircle,
  ExternalLink, ChevronRight, Zap, RefreshCw, ShieldCheck, DollarSign,
  Check, Navigation, Play, Pause
} from 'lucide-react';

const STATUS_BADGES: Record<string, { label: string; color: string }> = {
  ASSIGNED: { label: 'Assigned', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  ACCEPTED: { label: 'Accepted', color: 'bg-brand-50 text-brand-700 border-brand-200' },
  ON_THE_WAY: { label: 'En Route', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  ARRIVED: { label: 'Arrived at Site', color: 'bg-sky-50 text-sky-700 border-sky-200' },
  INSPECTION_STARTED: { label: 'Inspection', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  AWAITING_APPROVAL: { label: 'Awaiting Approval', color: 'bg-amber-50 text-amber-900 border-amber-300' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  WORK_STARTED: { label: 'In Progress', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  ON_HOLD: { label: 'On Hold', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  COMPLETED: { label: 'Completed', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  WORK_COMPLETED: { label: 'Completed', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  CANCELLED: { label: 'Cancelled', color: 'bg-slate-50 text-slate-700 border-slate-200' },
  REJECTED: { label: 'Rejected', color: 'bg-slate-50 text-slate-700 border-slate-200' },
  DISPUTED: { label: 'Disputed', color: 'bg-red-50 text-red-700 border-red-300' },
};

export default function TechnicianJobsPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'active' | 'available' | 'completed'>('active');
  const [profile, setProfile] = useState<any>(null);
  const [assignedJobs, setAssignedJobs] = useState<any[]>([]);
  const [availableJobs, setAvailableJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/technician/login?redirect=/technician/jobs');
      return;
    }
    if (user.role !== 'TECHNICIAN' && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      router.push('/customer/dashboard');
      return;
    }
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [profileRes, assignedRes, availableRes] = await Promise.all([
        fetch('/api/v1/technicians/me'),
        fetch('/api/v1/bookings?role=technician'),
        fetch('/api/v1/bookings?status=AVAILABLE'),
      ]);

      if (profileRes.ok) {
        const pData = await profileRes.json();
        setProfile(pData.technician);
      }
      if (assignedRes.ok) {
        const aData = await assignedRes.json();
        setAssignedJobs(aData.bookings || []);
      }
      if (availableRes.ok) {
        const avData = await availableRes.json();
        setAvailableJobs(avData.bookings || []);
      }
    } catch (err: any) {
      setError('Failed to load technician jobs.');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimJob = async (bookingId: string) => {
    setActionLoading(bookingId);
    setError('');
    setSuccessMsg('');
    try {
      const res = await fetch(`/api/v1/bookings/${bookingId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to claim job.');
      }

      setSuccessMsg('Job successfully accepted and assigned to you!');
      await loadData();
      router.push(`/technician/jobs/${bookingId}`);
    } catch (err: any) {
      setError(err.message || 'Could not claim job.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleQuickStatusUpdate = async (bookingId: string, nextStatus: string) => {
    setActionLoading(bookingId);
    setError('');
    setSuccessMsg('');
    try {
      const isComplete = nextStatus === 'COMPLETED' || nextStatus === 'WORK_COMPLETED';
      const res = await fetch(`/api/v1/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: nextStatus,
          quickUpdate: true,
          quickComplete: isComplete,
          note: `Work status updated to ${nextStatus.replace('_', ' ')} by technician.`,
          workPerformed: 'On-site technical service completed and verified.',
          technicianNotes: 'Work executed and verified.',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update work status.');
      }

      setSuccessMsg(`Status updated to ${nextStatus.replace('_', ' ')}!`);
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Error updating status.');
    } finally {
      setActionLoading(null);
    }
  };

  const activeJobs = assignedJobs.filter(
    (j) => !['COMPLETED', 'WORK_COMPLETED', 'CANCELLED', 'CLOSED'].includes(j.status)
  );

  const completedJobs = assignedJobs.filter(
    (j) => ['COMPLETED', 'WORK_COMPLETED', 'CLOSED'].includes(j.status)
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Wrench className="w-6 h-6 text-brand-500" /> Job Marketplace &amp; Orders
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse available customer bookings across Bangladesh, claim jobs, and manage active service dispatches.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Verification Gate Notice */}
      {profile && profile.verificationStatus !== 'VERIFIED' && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Technician Profile Under Review ({profile.verificationStatus})</p>
            <p>
              Your account is currently being verified by NEED ELECTRO technical managers. Once approved, you can claim live jobs.
            </p>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 space-x-2">
        <button
          onClick={() => setActiveTab('active')}
          className={`pb-3 px-4 text-xs font-black transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'active'
              ? 'border-brand-500 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <span>Active Assigned Jobs</span>
          {activeJobs.length > 0 && (
            <span className="px-2 py-0.5 text-[10px] bg-brand-500 text-white rounded-full">
              {activeJobs.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('available')}
          className={`pb-3 px-4 text-xs font-black transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'available'
              ? 'border-brand-500 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <span>Available Job Offers</span>
          {availableJobs.length > 0 && (
            <span className="px-2 py-0.5 text-[10px] bg-amber-500 text-white rounded-full animate-pulse">
              {availableJobs.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`pb-3 px-4 text-xs font-black transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'completed'
              ? 'border-brand-500 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <span>Completed History ({completedJobs.length})</span>
        </button>
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="p-12 text-center text-xs text-slate-500 space-y-2">
          <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto" />
          <p>Loading jobs and assignments...</p>
        </div>
      )}

      {!loading && activeTab === 'active' && (
        <div className="space-y-4">
          {activeJobs.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
              <Wrench className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-black text-slate-800">No Active Jobs In Progress</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                You do not have any open dispatches right now. Check the "Available Job Offers" tab to claim new customer requests.
              </p>
              <button
                onClick={() => setActiveTab('available')}
                className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-2 mt-2"
              >
                <Zap className="w-4 h-4" /> View Available Offers
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeJobs.map((job) => {
                const badge = STATUS_BADGES[job.status] || { label: job.status, color: 'bg-slate-100 text-slate-700' };
                const techCut = Math.round((job.totalAmount || 0) * 0.85);

                return (
                  <div
                    key={job.id}
                    className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4 hover:border-brand-300 transition"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-mono text-slate-400">
                          #{job.bookingNumber || job.id.slice(-6)}
                        </span>
                        <h3 className="font-black text-slate-900 text-sm mt-0.5">
                          {job.service?.name || job.service?.title || 'NEED ELECTRO Technical Service'}
                        </h3>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl">
                      <p className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="line-clamp-1">{job.address?.addressLine || job.location?.area || 'Moulvibazar'}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
                          {job.preferredDate || (job.scheduledDate ? new Date(job.scheduledDate).toLocaleDateString('en-BD') : 'Today')} · {job.preferredTimeSlot || 'Standard Dispatch'}
                        </span>
                      </p>
                    </div>

                    {/* ═══ EASY 1-TAP WORK STATUS UPDATE ═══ */}
                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                        <span className="flex items-center gap-1 text-brand-600">
                          <Zap className="w-3 h-3 text-amber-500" /> Quick Status Update:
                        </span>
                        <span className="text-slate-400 font-normal">1-Click</span>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        {job.status === 'ASSIGNED' && (
                          <button
                            onClick={() => handleQuickStatusUpdate(job.id, 'ACCEPTED')}
                            disabled={actionLoading === job.id}
                            className="px-2.5 py-1 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1 shadow-xs transition active:scale-95"
                          >
                            <Check className="w-3 h-3" /> Accept
                          </button>
                        )}
                        {job.status === 'ACCEPTED' && (
                          <button
                            onClick={() => handleQuickStatusUpdate(job.id, 'ON_THE_WAY')}
                            disabled={actionLoading === job.id}
                            className="px-2.5 py-1 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1 shadow-xs transition active:scale-95"
                          >
                            <Navigation className="w-3 h-3" /> En Route
                          </button>
                        )}
                        {job.status === 'ON_THE_WAY' && (
                          <button
                            onClick={() => handleQuickStatusUpdate(job.id, 'ARRIVED')}
                            disabled={actionLoading === job.id}
                            className="px-2.5 py-1 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white flex items-center gap-1 shadow-xs transition active:scale-95"
                          >
                            <MapPin className="w-3 h-3" /> Arrived
                          </button>
                        )}
                        {(job.status === 'ARRIVED' || job.status === 'INSPECTION_STARTED') && (
                          <button
                            onClick={() => handleQuickStatusUpdate(job.id, 'IN_PROGRESS')}
                            disabled={actionLoading === job.id}
                            className="px-2.5 py-1 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-1 shadow-xs transition active:scale-95"
                          >
                            <Wrench className="w-3 h-3" /> Start Work
                          </button>
                        )}
                        {(job.status === 'IN_PROGRESS' || job.status === 'WORK_STARTED') && (
                          <button
                            onClick={() => handleQuickStatusUpdate(job.id, 'COMPLETED')}
                            disabled={actionLoading === job.id}
                            className="px-2.5 py-1 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 shadow-xs transition active:scale-95"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> ✅ Complete
                          </button>
                        )}
                        {job.status === 'ON_HOLD' && (
                          <button
                            onClick={() => handleQuickStatusUpdate(job.id, 'IN_PROGRESS')}
                            disabled={actionLoading === job.id}
                            className="px-2.5 py-1 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-1 shadow-xs transition active:scale-95"
                          >
                            <Play className="w-3 h-3" /> Resume
                          </button>
                        )}

                        {/* Direct Quick Dropdown */}
                        <select
                          value={job.status}
                          onChange={(e) => handleQuickStatusUpdate(job.id, e.target.value)}
                          disabled={actionLoading === job.id}
                          className="text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl px-2 py-1 cursor-pointer focus:outline-none"
                        >
                          <option value={job.status} disabled>Set Status...</option>
                          <option value="ACCEPTED">Accepted</option>
                          <option value="ON_THE_WAY">En Route</option>
                          <option value="ARRIVED">Arrived</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="COMPLETED">✅ Completed</option>
                          <option value="ON_HOLD">⏸ On Hold</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Your Earning (85%)</span>
                        <p className="text-sm font-black text-emerald-600">৳{techCut.toLocaleString()}</p>
                      </div>

                      <Link
                        href={`/technician/jobs/${job.id}`}
                        className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 shadow-xs"
                      >
                        Open Workspace <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {!loading && activeTab === 'available' && (
        <div className="space-y-4">
          {availableJobs.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
              <Zap className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-black text-slate-800">No New Job Offers At This Moment</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Customer bookings are matched based on your active service area. Check back shortly or make sure your status is set to Available.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableJobs.map((job) => {
                const estCut = Math.round((job.totalAmount || 0) * 0.85);

                return (
                  <div
                    key={job.id}
                    className="bg-amber-50/40 border border-amber-200 rounded-3xl p-5 shadow-xs space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-mono text-amber-700 font-bold bg-amber-100 px-2 py-0.5 rounded-md">
                          NEW OFFER
                        </span>
                        <h3 className="font-black text-slate-900 text-sm mt-1.5">
                          {job.service?.name || job.service?.title || 'Technical Service Call'}
                        </h3>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Estimated Payout</span>
                        <p className="text-sm font-black text-emerald-600">৳{estCut.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-700 bg-white/80 p-3 rounded-2xl border border-amber-100">
                      <p className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Area: {job.address?.upazila || job.location?.area || 'Moulvibazar'}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Date: {job.preferredDate || 'Prompt'} ({job.preferredTimeSlot || 'Flexible'})</span>
                      </p>
                      {job.description && (
                        <p className="text-[11px] text-slate-500 line-clamp-2 pt-1 border-t border-slate-100">
                          {job.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-500">
                        Total Bill: ৳{job.totalAmount?.toLocaleString()}
                      </span>

                      <button
                        onClick={() => handleClaimJob(job.id)}
                        disabled={actionLoading === job.id || profile?.verificationStatus !== 'VERIFIED'}
                        className="btn-primary text-xs py-2 px-5 flex items-center gap-2 shadow-md shadow-brand-500/20 disabled:opacity-50"
                      >
                        {actionLoading === job.id ? 'Claiming...' : 'Accept Job'}
                        <Zap className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {!loading && activeTab === 'completed' && (
        <div className="space-y-4">
          {completedJobs.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-xs text-slate-500">
              No completed jobs on record yet.
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="divide-y divide-slate-100">
                {completedJobs.map((job) => {
                  const cut = Math.round((job.totalAmount || 0) * 0.85);

                  return (
                    <div
                      key={job.id}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-500">
                            #{job.bookingNumber || job.id.slice(-6)}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Completed &amp; Credited
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm">
                          {job.service?.name || job.service?.title || 'Technical Service Call'}
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          Completed on {new Date(job.updatedAt || job.createdAt).toLocaleDateString('en-BD', { dateStyle: 'medium' })}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 self-end sm:self-auto">
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 uppercase font-bold">Earned</span>
                          <p className="text-base font-black text-emerald-600">৳{cut.toLocaleString()}</p>
                        </div>
                        <Link
                          href={`/technician/jobs/${job.id}`}
                          className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 transition"
                          title="View Details"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
