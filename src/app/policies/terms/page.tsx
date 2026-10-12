import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service | NEED ELECTRO',
  description: 'NEED ELECTRO Terms of Service — read our rules, booking terms, warranties, and platform policies.',
};

export default function TermsOfServicePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950">Terms of Service</h1>
        </div>
        <p className="text-xs text-slate-500">Last updated: October 2024 · Effective: October 2024</p>
      </div>

      <div className="bg-brand-50 border border-brand-200 rounded-2xl p-4 text-xs text-brand-800 font-medium">
        Welcome to NEED ELECTRO (A Sister Concern of Amdads Group). By accessing or using our website, PWA, or services, you agree to be bound by these Terms of Service.
      </div>

      <div className="prose prose-sm max-w-none space-y-6 text-slate-700">
        {[
          {
            title: '1. Platform Overview',
            content: `NEED ELECTRO operates an on-demand electrical services, technological solutions, hardware e-commerce, and verified technician dispatch network across Sylhet Division and Bangladesh. All bookings, purchases, and warranties facilitated through the platform are governed by these Terms.`,
          },
          {
            title: '2. User Accounts & Responsibilities',
            content: `• You must provide accurate, current, and complete information during registration.\n• You are responsible for safeguarding your password and account credentials.\n• You must promptly notify NEED ELECTRO of any unauthorized use or security compromise.\n• Customers must ensure safe, reasonable physical access and electrical safety conditions for technicians arriving on-site.`,
          },
          {
            title: '3. Service Bookings & Cancellations',
            content: `• Bookings are subject to technician availability and schedule confirmation.\n• Inspection charges (if applicable) apply if the technician conducts diagnostics on-site, even if you choose not to proceed with repairs.\n• Cancellations made at least 2 hours before the scheduled appointment incur no fee.\n• Late cancellations after technician dispatch may incur a nominal conveyance compensation charge of ৳150.`,
          },
          {
            title: '4. Products & E-Commerce Purchases',
            content: `• All prices are in Bangladeshi Taka (৳) and include applicable statutory taxes unless stated otherwise.\n• Delivery timelines range from 24–48 hours in Moulvibazar/Sylhet and 2–5 days nationally.\n• Cash on Delivery (COD) orders require phone confirmation before shipment.\n• Defective or damaged items must be reported within 48 hours of delivery for immediate exchange.`,
          },
          {
            title: '5. Warranty Terms & Claim Eligibility',
            content: `• Products carry manufacturer or NEED ELECTRO warranty coverage as specified on the product page and official invoice.\n• Service workmanship warranty is valid for 30 days from job completion for the specific work performed.\n• Physical impact, water submersion (non-waterproof units), lightning strikes, unauthorized tampering, or repairs done by non-NEED ELECTRO personnel void all warranty claims.\n• Serial number verification is required for all hardware warranty claims.`,
          },
          {
            title: '6. Payments & Pricing Integrity',
            content: `• Payments may be made via Cash on Delivery, bKash, Nagad, Rocket, or designated online payment methods.\n• Technicians are prohibited from charging rates above the agreed quote or official NEED ELECTRO invoice.\n• Any extra materials required during repair will be invoiced with transparent receipts.`,
          },
          {
            title: '7. Limitation of Liability',
            content: `NEED ELECTRO ensures rigorous vetting and verification of all technicians. However, to the maximum extent permitted by Bangladesh law, NEED ELECTRO shall not be liable for pre-existing electrical structural defects, power surge damage from national grid fluctuations, or unapproved side agreements made privately with technicians outside the platform.`,
          },
          {
            title: '8. Governing Law & Dispute Resolution',
            content: `These terms are governed by the laws of the People's Republic of Bangladesh. Any disputes shall be settled through amicable negotiation or within the legal jurisdiction of the courts of Moulvibazar, Bangladesh.`,
          },
          {
            title: '9. Contact & Support',
            content: `For questions regarding these Terms:\n\nNEED ELECTRO SHOP\nMoulvibazar, Bangladesh\nPhone: 01733 983752\nEmail: needelectro23@gmail.com`,
          },
        ].map(({ title, content }) => (
          <div key={title} className="space-y-3">
            <h2 className="text-base font-black text-slate-900">{title}</h2>
            <p className="text-sm text-slate-600 whitespace-pre-line leading-relaxed">{content}</p>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-100 pt-6 flex flex-wrap gap-4 text-xs">
        <Link href="/policies/privacy" className="text-brand-600 font-bold hover:underline">Privacy Policy</Link>
        <Link href="/policies/technician" className="text-brand-600 font-bold hover:underline">Technician Policy</Link>
        <Link href="/contact" className="text-brand-600 font-bold hover:underline">Contact Us</Link>
      </div>
    </div>
  );
}
