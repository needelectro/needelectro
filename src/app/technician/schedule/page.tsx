'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import {
  Calendar as CalendarIcon, Clock, MapPin, AlertTriangle,
  ChevronLeft, ChevronRight, CheckCircle2, Wrench, RefreshCw,
  Plus, ExternalLink, X, AlertCircle
} from 'lucide-react';

export default function TechnicianSchedulePage() {
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Selected View: 'all' | 'today' | 'upcoming'
  const [filterView, setFilterView] = useState<'today' | 'upcoming' | 'all'>('today');

  // Reschedule Modal State
  const [rescheduleModal, setRescheduleModal] = useState<{
    isOpen: boolean;
    jobId: string;
    bookingNumber: string;
    currentDate: string;
    currentTimeSlot: string;
  }>({
    isOpen: false,
    jobId: '',
    bookingNumber: '',
    currentDate: '',
    currentTimeSlot: '',
  });

  const [proposedDate, setProposedDate] = useState('');
  const [proposedTimeSlot, setProposedTimeSlot] = useState('10:00 AM - 12:00 PM');
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [submittingReschedule, setSubmittingReschedule] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/technician/login?redirect=/technician/schedule');
      return;
    }
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/v1/bookings?role=technician');
      if (!res.ok) throw new Error('Failed to load schedule appointments');
      const data = await res.json();
      setJobs(data.bookings || []);
    } catch {
      setError('Failed to fetch schedule data.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposedDate || !rescheduleReason || rescheduleReason.trim().length < 5) {
      setError('Please provide proposed date, time slot, and reason (min 5 chars).');
      return;
    }

    setSubmittingReschedule(true);
    setError('');
    try {
      const res = await fetch(`/api/v1/bookings/${rescheduleModal.jobId}/reschedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposedDate,
          proposedTimeSlot,
          reason: rescheduleReason.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit reschedule request');

      setSuccessMsg(`Reschedule request submitted for Job #${rescheduleModal.bookingNumber}. Customer and dispatch notified.`);
      setRescheduleModal({ isOpen: false, jobId: '', bookingNumber: '', currentDate: '', currentTimeSlot: '' });
      setProposedDate('');
      setRescheduleReason('');
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Error submitting reschedule request');
    } finally {
      setSubmittingReschedule(false);
    }
  };

  const todayStr = new Date().toISOString().slice(0, 10);

  // Group appointments
  const activeJobs = jobs.filter((j) => !['COMPLETED', 'CANCELLED', 'REJECTED'].includes(j.status));

  // Overlap detection: Warn if 2 active jobs share the same date and time slot
  const overlaps: Record<string, string[]> = {};
  activeJobs.forEach((job) => {
    const key = `${job.preferredDate}_${job.preferredTimeSlot}`;
    if (!overlaps[key]) overlaps[key] = [];
    overlaps[key].push(job.bookingNumber);
  });

  const filteredList = activeJobs.filter((job) => {
    if (filterView === 'today') {
      return job.preferredDate && job.preferredDate.includes(todayStr);
    }
    if (filterView === 'upcoming') {
      return job.preferredDate && !job.preferredDate.includes(todayStr);
    }
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-brand-500" /> Technician Dispatch Calendar
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your daily appointment commitments, travel buffers, and verified reschedule requests.
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

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          {successMsg}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilterView('today')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition ${
            filterView === 'today'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Today's Calls ({jobs.filter((j) => j.preferredDate?.includes(todayStr) && !['COMPLETED', 'CANCELLED'].includes(j.status)).length})
        </button>
        <button
          onClick={() => setFilterView('upcoming')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition ${
            filterView === 'upcoming'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Upcoming Bookings
        </button>
        <button
          onClick={() => setFilterView('all')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition ${
            filterView === 'all'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          All Active ({activeJobs.length})
        </button>
      </div>

      {/* Overlapping Appointment Warnings */}
      {Object.entries(overlaps).some(([_, bList]) => bList.length > 1) && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-black text-sm">Schedule Buffer Notice</h4>
            <p className="text-[11px] leading-relaxed">
              You have multiple appointments booked for the same time window. If you foresee travel delays between premises, please submit a Reschedule Request promptly.
            </p>
          </div>
        </div>
      )}

      {/* Appointments List */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-brand-600 rounded-full animate-spin" />
        </div>
      ) : filteredList.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <CalendarIcon className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="font-bold text-slate-700 text-sm">No scheduled appointments for this filter.</p>
          <Link href="/technician/jobs" className="btn-primary text-xs py-2 px-4 inline-block">
            Browse Job Marketplace
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredList.map((job) => {
            const isToday = job.preferredDate && job.preferredDate.includes(todayStr);
            const key = `${job.preferredDate}_${job.preferredTimeSlot}`;
            const hasConflict = (overlaps[key]?.length || 0) > 1;

            return (
              <div
                key={job.id}
                className={`bg-white rounded-3xl border p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition ${
                  hasConflict ? 'border-amber-300' : 'border-slate-200'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-slate-900 text-sm">
                      Job #{job.bookingNumber}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {job.status}
                    </span>
                    {isToday && (
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                        TODAY
                      </span>
                    )}
                    {hasConflict && (
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Time Window Overlap
                      </span>
                    )}
                  </div>

                  <p className="font-bold text-slate-800 text-xs">
                    {job.service?.name}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap pt-1">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {job.preferredDate} ({job.preferredTimeSlot})
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {job.address?.area || 'Moulvibazar'}, {job.address?.upazila || 'Moulvibazar Sadar'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                  <button
                    onClick={() =>
                      setRescheduleModal({
                        isOpen: true,
                        jobId: job.id,
                        bookingNumber: job.bookingNumber,
                        currentDate: job.preferredDate,
                        currentTimeSlot: job.preferredTimeSlot,
                      })
                    }
                    className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition shadow-xs"
                  >
                    Request Reschedule
                  </button>
                  <Link
                    href={`/technician/jobs/${job.id}`}
                    className="btn-primary text-xs py-2 px-4 shadow-xs"
                  >
                    Open Workspace
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleRequestReschedule}
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm text-slate-900">
                Request Reschedule — Job #{rescheduleModal.bookingNumber}
              </h3>
              <button
                type="button"
                onClick={() => setRescheduleModal({ isOpen: false, jobId: '', bookingNumber: '', currentDate: '', currentTimeSlot: '' })}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Technicians must request rescheduling rather than silently missing customer appointments. The customer will receive this proposal on their portal.
            </p>

            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Current Slot</span>
              <p className="font-bold text-slate-800">{rescheduleModal.currentDate} ({rescheduleModal.currentTimeSlot})</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Proposed New Date <span className="text-rose-500">*</span></label>
              <input
                type="date"
                value={proposedDate}
                onChange={(e) => setProposedDate(e.target.value)}
                min={todayStr}
                className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-brand-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Proposed Time Slot <span className="text-rose-500">*</span></label>
              <select
                value={proposedTimeSlot}
                onChange={(e) => setProposedTimeSlot(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-brand-500"
              >
                <option value="09:00 AM - 11:00 AM">09:00 AM - 11:00 AM</option>
                <option value="11:00 AM - 01:00 PM">11:00 AM - 01:00 PM</option>
                <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM</option>
                <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM</option>
                <option value="06:00 PM - 08:00 PM">06:00 PM - 08:00 PM</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Reason for Rescheduling <span className="text-rose-500">*</span></label>
              <textarea
                rows={3}
                value={rescheduleReason}
                onChange={(e) => setRescheduleReason(e.target.value)}
                placeholder="Explain the reason (e.g. prior job overran due to complex wiring)..."
                className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-brand-500"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRescheduleModal({ isOpen: false, jobId: '', bookingNumber: '', currentDate: '', currentTimeSlot: '' })}
                className="px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingReschedule}
                className="btn-primary text-xs py-2 px-4"
              >
                {submittingReschedule ? 'Submitting...' : 'Send Reschedule Proposal'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
