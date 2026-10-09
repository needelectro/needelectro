'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';

const INQUIRY_TYPES = [
  'Service Booking', 'Product Inquiry', 'Warranty Support',
  'Technician Application', 'Partnership / B2B', 'General Inquiry',
];

export default function ContactForm() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', inquiryType: '', message: '',
  });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/v1/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: form.inquiryType || 'General Inquiry',
          message: `From: ${form.name} (${form.phone})\n\n${form.message}`,
          contactEmail: form.email,
          type: 'GENERAL',
        }),
      });
      if (res.ok) {
        setSent(true);
      } else {
        const d = await res.json();
        setError(d.error || 'Could not send message. Please email us directly.');
      }
    } catch {
      setError('Network error. Please try again or call 01733-983752.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-10 text-center space-y-3">
        <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
        <h3 className="font-black text-slate-900 text-lg">Message Sent!</h3>
        <p className="text-xs text-slate-600">
          Thank you for reaching out. We&apos;ll get back to you within one business day.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs text-red-700">{error}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Full Name *</label>
          <input
            type="text" required value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="Your name"
            className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Phone Number *</label>
          <input
            type="tel" required value={form.phone}
            onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
            placeholder="01XXXXXXXXX"
            className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700">Email Address</label>
        <input
          type="email" value={form.email}
          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          placeholder="Optional — for email reply"
          className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700">Type of Inquiry *</label>
        <select
          required value={form.inquiryType}
          onChange={(e) => setForm((p) => ({ ...p, inquiryType: e.target.value }))}
          className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
        >
          <option value="">Select inquiry type</option>
          {INQUIRY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700">Your Message *</label>
        <textarea
          required value={form.message}
          onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
          rows={4} placeholder="Describe your inquiry in detail..."
          className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none resize-none"
        />
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-xs gap-2">
        {loading ? (
          <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending...</>
        ) : (
          <><Send className="w-4 h-4" />Send Message</>
        )}
      </button>
    </form>
  );
}
