import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Wrench, ShieldCheck, DollarSign, Award } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Technician Policy & Code of Conduct | NEED ELECTRO',
  description: 'Standards, verification procedures, earnings structure, and professional code of conduct for NEED ELECTRO verified technicians.',
};

export default function TechnicianPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center">
            <Wrench className="w-5 h-5" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950">Technician Policy & Conduct</h1>
        </div>
        <p className="text-xs text-slate-500">Effective for all registered and verified technicians · Updated: October 2024</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
          <ShieldCheck className="w-6 h-6 text-emerald-600 mb-2" />
          <h3 className="font-bold text-sm text-emerald-950">100% Verified</h3>
          <p className="text-xs text-emerald-700 mt-1">NID verification and background check mandatory prior to receiving client jobs.</p>
        </div>
        <div className="bg-brand-50 border border-brand-200 rounded-2xl p-4">
          <DollarSign className="w-6 h-6 text-brand-600 mb-2" />
          <h3 className="font-bold text-sm text-brand-950">Fair Earnings</h3>
          <p className="text-xs text-brand-700 mt-1">Guaranteed payout schedules with transparent commission rates and tip retention.</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <Award className="w-6 h-6 text-amber-600 mb-2" />
          <h3 className="font-bold text-sm text-amber-950">Quality Ratings</h3>
          <p className="text-xs text-amber-700 mt-1">High customer ratings unlock premium industrial jobs and higher priority dispatch.</p>
        </div>
      </div>

      <div className="prose prose-sm max-w-none space-y-6 text-slate-700">
        {[
          {
            title: '1. Technician Onboarding & Verification',
            content: `• All applicants must submit valid National ID (NID) / Smart Card, recent passport-sized photo, and proof of trade experience or vocational diploma.\n• Verification takes 24–48 hours by our technical operations team in Moulvibazar.\n• Accounts remain in PENDING status until physical document review and identity verification are approved.`,
          },
          {
            title: '2. Professional Code of Conduct',
            content: `• Arrive punctually within the agreed service window.\n• Always carry your NEED ELECTRO digital technician ID pass on your mobile device.\n• Wear appropriate electrical protective equipment (PPE), insulated footwear, and carry calibrated testing instruments.\n• Maintain courteous and respectful communication with customers at all times.\n• Strictly refrain from smoking, chewing betel leaf/paan, or soliciting personal work privately from platform customers.`,
          },
          {
            title: '3. Job Acceptance & Service Protocol',
            content: `• Once a job is accepted, the technician is committed to fulfilling it. Repeated unexcused cancellations will lead to temporary suspension.\n• Follow the mandatory status flow in the technician app:\n  1. Accepted → 2. On the Way → 3. Arrived → 4. Work Started → 5. Work Completed.\n• Perform a thorough safety check before turning on main power breakers upon completion.\n• Clean up any debris, wire clippings, or discarded parts before leaving the client premises.`,
          },
          {
            title: '4. Pricing, Extra Parts & Financial Integrity',
            content: `• Technicians must NEVER quote rates independently or demand cash surcharges above the system invoice.\n• If replacement parts are required (e.g., circuit breaker, wiring, capacitors), technicians must provide authentic NEED ELECTRO or approved brand parts with genuine receipts.\n• Attempting to circumvent the platform to avoid commission fees will result in immediate permanent account termination and forfeiture of pending wallet balance.`,
          },
          {
            title: '5. Workmanship Guarantee & Callbacks',
            content: `• All services performed carry a 30-day workmanship guarantee.\n• In the event of a customer callback due to faulty assembly or oversight within 30 days, the assigned technician is required to rectify the defect promptly at no extra charge to the customer.`,
          },
          {
            title: '6. Earnings & Payout Schedule',
            content: `• Earnings for completed jobs are credited to the technician wallet immediately upon customer confirmation and payment receipt.\n• Payouts are disbursed weekly via bKash, Nagad, or direct bank transfer upon minimum threshold of ৳500.\n• Platform commission is transparently displayed on every job card before you tap Accept.`,
          },
        ].map(({ title, content }) => (
          <div key={title} className="space-y-3">
            <h2 className="text-base font-black text-slate-900">{title}</h2>
            <p className="text-sm text-slate-600 whitespace-pre-line leading-relaxed">{content}</p>
          </div>
        ))}
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center space-y-3">
        <h3 className="font-black text-slate-900 text-lg">Ready to join our verified technician network?</h3>
        <p className="text-xs text-slate-600 max-w-md mx-auto">Get steady service calls, weekly guaranteed payouts, and professional training support.</p>
        <div>
          <Link href="/technician/register" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-md transition-all">
            Apply as Technician
          </Link>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-6 flex flex-wrap gap-4 text-xs">
        <Link href="/policies/terms" className="text-brand-600 font-bold hover:underline">Terms of Service</Link>
        <Link href="/policies/privacy" className="text-brand-600 font-bold hover:underline">Privacy Policy</Link>
        <Link href="/contact" className="text-brand-600 font-bold hover:underline">Contact Support</Link>
      </div>
    </div>
  );
}
