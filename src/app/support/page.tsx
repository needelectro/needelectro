'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import { LifeBuoy, MessageCircle, ChevronRight, Send, CheckCircle2, AlertCircle, Clock, Package, Shield } from 'lucide-react';

const TICKET_TYPES = [
  { value: 'GENERAL', label: 'General Inquiry', icon: '💬' },
  { value: 'BOOKING_ISSUE', label: 'Booking Issue', icon: '🔧' },
  { value: 'ORDER_ISSUE', label: 'Order / Delivery', icon: '📦' },
  { value: 'WARRANTY_CLAIM', label: 'Warranty Claim', icon: '🛡️' },
  { value: 'PAYMENT_ISSUE', label: 'Payment Issue', icon: '💳' },
  { value: 'TECHNICIAN_DISPUTE', label: 'Technician Dispute', icon: '⚠️' },
  { value: 'PRODUCT_QUALITY', label: 'Product Quality', icon: '📋' },
];

const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Low', color: 'text-slate-600 bg-slate-100' },
  { value: 'MEDIUM', label: 'Medium', color: 'text-amber-700 bg-amber-100' },
  { value: 'HIGH', label: 'High', color: 'text-orange-700 bg-orange-100' },
  { value: 'URGENT', label: 'Urgent', color: 'text-red-700 bg-red-100' },
];

export default function SupportPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    type: 'GENERAL',
    subject: '',
    message: '',
    priority: 'MEDIUM',
    phone: '',
    refNumber: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [ticketId, setTicketId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/v1/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: form.type,
          subject: form.subject,
          message: form.message,
          priority: form.priority,
          contactPhone: form.phone,
          referenceNumber: form.refNumber,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTicketId(data.ticket?.id || data.ticket?.ticketNumber || '');
        setSubmitted(true);
      } else {
        setError(data.error || 'Failed to submit ticket. Please try again or call us.');
      }
    } catch {
      setError('Network error. Please call 01733-983752 directly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-0">
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-brand-950 to-slate-900 text-white py-14 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-brand-500/20 border border-brand-500/30 rounded-full px-4 py-1.5 text-xs font-bold text-brand-300 uppercase tracking-wider">
            <LifeBuoy className="w-3.5 h-3.5" />
            Customer Support
          </div>
          <h1 className="text-3xl sm:text-4xl font-black">How Can We Help You?</h1>
          <p className="text-sm text-slate-300 max-w-lg mx-auto">
            Submit a support ticket and our team will respond within one business day. For urgent issues, call us directly.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <a href="tel:+8801733983752"
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold py-2.5 px-5 rounded-xl transition">
              📞 01733-983752
            </a>
            <a href="https://wa.me/8801733983752" target="_blank" rel="noreferrer"
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2.5 px-5 rounded-xl transition">
              💬 WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Support Form */}
        <div className="lg:col-span-2">
          {submitted ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-10 text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">Ticket Submitted!</h2>
                {ticketId && <p className="text-xs text-slate-500 mt-1">Ticket ID: <strong className="font-mono text-brand-600">{ticketId}</strong></p>}
              </div>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Our support team will respond within <strong>1 business day</strong>. You&apos;ll receive a confirmation by phone. For urgent issues, call <strong>01733-983752</strong>.
              </p>
              <div className="flex gap-3 justify-center">
                {user && (
                  <Link href="/customer/dashboard" className="btn-primary text-xs py-2.5">
                    View My Tickets
                  </Link>
                )}
                <button onClick={() => { setSubmitted(false); setForm({ type: 'GENERAL', subject: '', message: '', priority: 'MEDIUM', phone: '', refNumber: '' }); }}
                  className="btn-secondary text-xs py-2.5">
                  Submit Another
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-5">
              <h2 className="text-lg font-black text-slate-900">Open a Support Ticket</h2>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs text-red-700">{error}</div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Ticket Type */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-700">Issue Type *</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {TICKET_TYPES.map((t) => (
                      <label key={t.value}
                        className={`flex items-center gap-2 text-xs font-bold py-2.5 px-3 rounded-xl border cursor-pointer transition ${
                          form.type === t.value ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}>
                        <input type="radio" name="type" value={t.value} checked={form.type === t.value}
                          onChange={() => setForm((p) => ({ ...p, type: t.value }))} className="sr-only" />
                        <span>{t.icon}</span>
                        <span>{t.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Subject *</label>
                    <input type="text" required value={form.subject}
                      onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                      placeholder="Brief description of your issue"
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Priority</label>
                    <div className="flex gap-2">
                      {PRIORITY_OPTIONS.map((p) => (
                        <label key={p.value} className={`flex-1 text-center text-[10px] font-black py-2 rounded-xl border cursor-pointer transition ${
                          form.priority === p.value ? `${p.color} border-current` : 'border-slate-200 text-slate-500 bg-white hover:bg-slate-50'
                        }`}>
                          <input type="radio" name="priority" value={p.value} checked={form.priority === p.value}
                            onChange={() => setForm((pr) => ({ ...pr, priority: p.value }))} className="sr-only" />
                          {p.label}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Your Phone *</label>
                    <input type="tel" required value={form.phone}
                      onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                      placeholder="01XXXXXXXXX"
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Order / Booking Ref (Optional)</label>
                    <input type="text" value={form.refNumber}
                      onChange={(e) => setForm((p) => ({ ...p, refNumber: e.target.value }))}
                      placeholder="e.g. ORD-2024-001"
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Describe Your Issue *</label>
                  <textarea required value={form.message} rows={5}
                    onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                    placeholder="Please provide as much detail as possible — what happened, when, what you expected, and what actually occurred..."
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none resize-none" />
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-xs gap-2">
                  {loading ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Submitting...</>
                  ) : (
                    <><Send className="w-4 h-4" />Submit Support Ticket</>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Contact */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 space-y-4">
            <h3 className="font-black text-slate-900 text-sm">Contact Options</h3>
            <div className="space-y-3 text-xs">
              {[
                { icon: '📞', label: 'Phone / WhatsApp', value: '01733-983752', href: 'tel:+8801733983752' },
                { icon: '📧', label: 'Email', value: 'needelectro23@gmail.com', href: 'mailto:needelectro23@gmail.com' },
                { icon: '🕐', label: 'Business Hours', value: 'Sat–Thu 9AM–8PM\nFri 2PM–8PM', href: null },
              ].map((c) => (
                <div key={c.label}>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{c.icon} {c.label}</p>
                  {c.href ? (
                    <a href={c.href} className="font-bold text-slate-800 hover:text-brand-600 transition whitespace-pre-line">{c.value}</a>
                  ) : (
                    <p className="font-semibold text-slate-700 whitespace-pre-line">{c.value}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 space-y-3">
            <h3 className="font-black text-slate-900 text-sm">Quick Answers</h3>
            <div className="space-y-2 text-xs">
              {[
                { q: 'How long until my booking is confirmed?', a: 'Within 30 minutes during business hours.' },
                { q: 'Can I reschedule a booking?', a: 'Yes — call us or update via your dashboard.' },
                { q: 'How do I track my order?', a: 'Sign in → My Account → Orders.' },
                { q: 'Warranty claim timeline?', a: 'Inspection within 3 business days of claim submission.' },
              ].map(({ q, a }) => (
                <div key={q} className="border-b border-slate-50 pb-2 last:border-0">
                  <p className="font-bold text-slate-800">{q}</p>
                  <p className="text-slate-500">{a}</p>
                </div>
              ))}
            </div>
            <Link href="/faq" className="text-[11px] text-brand-600 font-bold hover:underline">
              View Full FAQ →
            </Link>
          </div>

          {user && (
            <Link href="/customer/dashboard?tab=support"
              className="flex items-center justify-between bg-brand-50 border border-brand-200 rounded-2xl p-4 text-xs font-bold text-brand-700 hover:bg-brand-100 transition">
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                View My Previous Tickets
              </span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
