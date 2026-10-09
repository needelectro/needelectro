import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { RotateCcw, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Refund & Return Policy | NEED ELECTRO',
  description: 'Learn about NEED ELECTRO return, replacement, and service refund policies.',
};

export default function RefundPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center">
            <RotateCcw className="w-5 h-5" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950">Refund &amp; Return Policy</h1>
        </div>
        <p className="text-xs text-slate-500">Last updated: October 2024 · Effective: October 2024</p>
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-800 font-medium">
        NEED ELECTRO is committed to transparent customer satisfaction. We provide clear refund and replacement terms for both technological hardware purchases and on-site electrical technical services.
      </div>

      <div className="prose prose-sm max-w-none space-y-6 text-slate-700">
        {[
          {
            title: '1. Product Return & Replacement Window',
            content: `• Products purchased through our store can be returned or exchanged within 7 days of delivery if defective, damaged upon arrival, or incorrect.\n• To qualify for a full return or exchange, the product must be in its original packaging with all included accessories, manuals, warranty cards, and purchase invoice.\n• Software, activated operating systems, or products with tampered serial numbers are not eligible for return.`,
          },
          {
            title: '2. Damaged or Dead-on-Arrival (DOA) Hardware',
            content: `• If an item (such as a laptop, monitor, CCTV camera, router, or inverter) is received broken or dead on arrival, please report it via our Support Portal or hotline (01733 983752) within 48 hours.\n• We will arrange a free technician pickup or direct exchange at our Moulvibazar shop (Shop #5, MR Plaza, Kusumbag).`,
          },
          {
            title: '3. Electrical & Technical Service Refunds',
            content: `• If a service was not completed satisfactorily, our Quality Assurance team will dispatch a senior supervising technician for a free re-inspection and correction within 48 hours.\n• If the technical problem cannot be resolved due to reasons within NEED ELECTRO's control, a full or partial refund of service labor charges will be credited to your account wallet or original payment method.\n• Fixed diagnostic inspection fees (৳150) are non-refundable once on-site diagnostic testing has been performed.`,
          },
          {
            title: '4. Refund Processing Time',
            content: `• bKash / Nagad / Mobile Banking refunds are processed within 24 to 72 business hours upon approval.\n• Bank card and online gateway refunds take 5 to 7 working days depending on issuing bank settlement schedules.\n• Cash refunds are available immediately in person at our Moulvibazar head branch.`,
          },
          {
            title: '5. Warranty Claims vs. Refunds',
            content: `• Beyond the initial 7-day return window, hardware issues are handled through the standard Manufacturer or NEED ELECTRO Warranty Claim process.\n• Warranty repairs or manufacturer replacements do not constitute monetary refunds.`,
          },
        ].map((section, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-3 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-500 shrink-0" />
              {section.title}
            </h2>
            <div className="text-sm text-slate-600 space-y-1.5 leading-relaxed whitespace-pre-line">
              {section.content}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Need help submitting a refund or return request?</h3>
          <p className="text-xs text-slate-500">Our customer support team is available from 9 AM to 9 PM daily.</p>
        </div>
        <Link
          href="/support"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 text-white font-semibold text-xs hover:bg-brand-600 transition shrink-0"
        >
          Open Support Ticket
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
