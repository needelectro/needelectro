import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Wrench, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Service Policy & Safety Standards | NEED ELECTRO',
  description: 'Understand NEED ELECTRO safety standards, technician code of conduct, and service guarantees.',
};

export default function ServicePolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center">
            <Wrench className="w-5 h-5" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950">Service Policy &amp; Safety Standards</h1>
        </div>
        <p className="text-xs text-slate-500">Last updated: October 2024 · Effective: October 2024</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 font-medium flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <p>
          Electrical work carries inherent physical safety risks. NEED ELECTRO mandates that all on-site work follow National Building Code (BNBC) and International Electrotechnical Commission (IEC) safety regulations.
        </p>
      </div>

      <div className="prose prose-sm max-w-none space-y-6 text-slate-700">
        {[
          {
            title: '1. Technician Qualification & Verification Standards',
            content: `• Only technicians with verified government NID, verified physical address, technical trade certification or validated apprenticeship, and background screening are dispatched.\n• Technicians must display their official NEED ELECTRO digital verification ID upon arrival at the customer premise.\n• Unverified apprentice assistants are not permitted to execute electrical work independently without a lead verified technician present.`,
          },
          {
            title: '2. Safety Protocols & Protective Equipment (PPE)',
            content: `• All field personnel must utilize insulated hand tools rated for voltage protection (up to 1,000V AC), dielectric rubber shoes, and eye protection during live or switchboard work.\n• Main circuit breakers must be tagged and locked out (LOTO) prior to conducting house wiring, high-voltage panel upgrades, or solar inverter integration.\n• Technicians are strictly prohibited from bypassing safety fuses, earth leakage circuit breakers (ELCB/RCCB), or grounding requirements.`,
          },
          {
            title: '3. Pricing Transparency & Material Invoicing',
            content: `• Standard labor rates are fixed and visible on the NEED ELECTRO platform before booking.\n• If parts or materials (wires, conduit pipes, circuit breakers, switches, gang boxes) need replacement, the customer may supply the parts or request genuine parts sourced by NEED ELECTRO.\n• Technicians are prohibited from demanding arbitrary off-platform fees or off-book side payments.`,
          },
          {
            title: '4. 30-Day Workmanship Guarantee',
            content: `• All electrical and technical repair work completed through an official platform booking includes our 30-day Quality Assurance guarantee.\n• If the specific issue reoccurs within 30 days due to installation or repair flaws, a technician will revisit and resolve it with zero service labor charges.\n• Guarantee does not cover damages caused by grid lightning strikes, municipal surge anomalies, or customer tampering.`,
          },
          {
            title: '5. Emergency Electrical Protocol',
            content: `• For burning smell, sparking switchboards, or submerged lines, our system flags emergency priority.\n• Customers are immediately instructed to shut off main breakers from a dry location before the emergency rapid-response team arrives.`,
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
          <h3 className="font-bold text-slate-900 text-sm">Have questions regarding our service policies?</h3>
          <p className="text-xs text-slate-500">Contact our Moulvibazar office or open a support query.</p>
        </div>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 text-white font-semibold text-xs hover:bg-brand-600 transition shrink-0"
        >
          Contact Office
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
