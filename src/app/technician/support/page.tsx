'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import {
  LifeBuoy, Phone, AlertTriangle, CheckCircle2, AlertCircle,
  Send, RefreshCw, Clock, ShieldAlert, MessageSquare
} from 'lucide-react';

const TICKET_STATUS_BADGES: Record<string, { label: string; color: string }> = {
  OPEN: { label: 'Open', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  UNDER_REVIEW: { label: 'Under Technical Review', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  AWAITING_INFO: { label: 'Awaiting Response', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  RESOLVED: { label: 'Resolved', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  CLOSED: { label: 'Closed', color: 'bg-slate-100 text-slate-700 border-slate-200' },
};

export default function TechnicianSupportPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Ticket Form
  const [category, setCategory] = useState('GENERAL_INQUIRY');
  const [priority, setPriority] = useState('NORMAL');
  const [bookingId, setBookingId] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/technician/login?redirect=/technician/support');
      return;
    }
    loadTickets();
  }, [user]);

  const loadTickets = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/v1/technicians/support');
      if (!res.ok) throw new Error('Failed to load tickets');
      const data = await res.json();
      setTickets(data.tickets || []);
    } catch {
      setError('Failed to fetch support history.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/v1/technicians/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          priority,
          bookingId: bookingId.trim() || undefined,
          subject: subject.trim(),
          message: message.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit ticket');
      }

      setSuccessMsg(data.message || 'Support ticket logged. Our technical dispatch team is reviewing it.');
      setSubject('');
      setMessage('');
      setBookingId('');
      await loadTickets();
    } catch (err: any) {
      setError(err.message || 'Error submitting ticket.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <LifeBuoy className="w-6 h-6 text-brand-500" /> Technician Support &amp; Disputes Desk
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Report safety concerns, payment disputes, customer no-shows, or request job reassignment assistance.
          </p>
        </div>

        <button
          onClick={loadTickets}
          disabled={loading}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Emergency Hotline Banner */}
      <div className="bg-rose-50 border border-rose-200 rounded-3xl p-5 text-rose-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h3 className="font-black text-sm text-rose-950">Immediate Electrical Hazard or Workplace Incident?</h3>
            <p className="text-xs text-rose-800">
              For live electrical shocks, building fires, or threats to physical safety, evacuate immediately and call emergency management.
            </p>
          </div>
        </div>

        <a
          href="tel:01733983752"
          className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-black shadow-md shadow-rose-600/20 hover:bg-rose-700 transition shrink-0"
        >
          <Phone className="w-3.5 h-3.5" /> Emergency Hotline: 01733-983752
        </a>
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

      {/* Create Ticket Form */}
      <form onSubmit={handleSubmitTicket} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-2 border-b border-slate-100 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-brand-500" /> Open New Support Ticket or Dispute
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Issue Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="GENERAL_INQUIRY">General Inquiry</option>
              <option value="PAYMENT_DISPUTE">Payment / Earnings Dispute</option>
              <option value="CUSTOMER_NO_SHOW">Customer Unreachable / No-Show</option>
              <option value="MISLEADING_JOB_DETAILS">Misleading / High-Risk Job Details</option>
              <option value="SAFETY_EMERGENCY">Safety Concern on Premises</option>
              <option value="ADMIN_DECISION_APPEAL">Appeal Administrative Decision</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Priority Level</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="NORMAL">Normal</option>
              <option value="HIGH">High (Urgent Dispatch Issue)</option>
              <option value="URGENT">Urgent (Safety / Critical)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Booking / Job ID (Optional)</label>
            <input
              type="text"
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
              placeholder="e.g. SRV-20261018-001"
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Ticket Subject *</label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief summary of the issue"
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Detailed Description *</label>
          <textarea
            rows={4}
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Please detail what happened, actions taken, and the desired resolution..."
            className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="btn-primary w-full py-3 text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25"
        >
          <Send className="w-4 h-4" />
          {submitting ? 'Submitting Ticket...' : 'Submit Support Ticket'}
        </button>
      </form>

      {/* Ticket History */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-500" /> Previous Tickets &amp; Resolutions
          </h3>
          <span className="text-xs text-slate-400 font-semibold">{tickets.length} tickets</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading history...</div>
        ) : tickets.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No previous support tickets filed.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {tickets.map((t) => {
              const badge = TICKET_STATUS_BADGES[t.status] || {
                label: t.status,
                color: 'bg-slate-100 text-slate-700',
              };

              return (
                <div key={t.id} className="p-6 space-y-2 hover:bg-slate-50/50 transition">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-900 text-xs sm:text-sm">
                        {t.subject}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {new Date(t.createdAt).toLocaleDateString('en-BD', {
                        dateStyle: 'medium',
                      })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 whitespace-pre-wrap">{t.message}</p>

                  {t.bookingId && (
                    <p className="text-[11px] font-mono text-slate-400">
                      Ref Booking: #{t.bookingId}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
