import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Shield, Search, AlertCircle, CheckCircle2, Clock, Phone, ChevronRight, Zap, FileText } from 'lucide-react';
import WarrantyCheckForm from './WarrantyCheckForm';

export const metadata: Metadata = {
  title: 'Warranty Check & Registration | NEED ELECTRO – Moulvibazar',
  description:
    'Check your NEED ELECTRO product warranty status by serial number or invoice, register a new device, or submit a warranty claim.',
};

const WARRANTY_STEPS = [
  { icon: Search, title: 'Enter Serial No.', desc: 'Input your product serial number or invoice number' },
  { icon: Shield, title: 'Instant Verification', desc: 'Our system checks your warranty status in seconds' },
  { icon: CheckCircle2, title: 'View Status', desc: 'See coverage details, claim history, and service records' },
];

const WARRANTY_INFO = [
  { category: 'Laptops & Computers', period: '6 – 12 months', scope: 'Hardware defects, manufacturing issues' },
  { category: 'CCTV Systems', period: '12 months', scope: 'Equipment failure, connection issues' },
  { category: 'Electrical Equipment', period: '6 months', scope: 'Defects, failure under normal use' },
  { category: 'Networking Devices', period: '6 – 12 months', scope: 'Hardware defects, port failure' },
  { category: 'Smart Devices', period: '6 months', scope: 'Manufacturer defects' },
  { category: 'IPS / Inverter', period: '12 months', scope: 'Battery & system failure (terms apply)' },
];

export default function WarrantyPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Hero - Glass Dark Panel */}
      <section className="glass-card-dark text-white rounded-3xl py-14 px-6 relative overflow-hidden shadow-2xl text-center">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-brand-500/25 blur-[100px] pointer-events-none rounded-full" />
        <div className="max-w-3xl mx-auto space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 rounded-full px-4 py-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider backdrop-blur-md">
            <Shield className="w-3.5 h-3.5" />
            Warranty &amp; Device Protection
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">Check Your Warranty</h1>
          <p className="text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
            Enter your product serial number or invoice number to instantly check warranty status, remaining coverage, and service history.
          </p>
        </div>
      </section>

      {/* How it Works - Glass Cards */}
      <section className="glass-card rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-4 justify-center">
          {WARRANTY_STEPS.map(({ icon: Icon, title, desc }, i) => (
            <React.Fragment key={title}>
              <div className="flex items-center gap-3 text-left max-w-xs">
                <div className="w-11 h-11 rounded-2xl bg-brand-500/15 border border-brand-500/30 text-brand-600 flex items-center justify-center shrink-0 backdrop-blur-md">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-900">{title}</p>
                  <p className="text-[10px] text-slate-500">{desc}</p>
                </div>
              </div>
              {i < 2 && <ChevronRight className="hidden sm:block w-4 h-4 text-slate-400 shrink-0" />}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* Warranty Check Form Section */}
      <section className="max-w-xl mx-auto space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-black text-slate-900">Warranty Lookup</h2>
          <p className="text-xs text-slate-500">Search by serial number, invoice number, or order ID</p>
        </div>
        <WarrantyCheckForm />
      </section>

      {/* Warranty Coverage Table - Glass Container */}
      <section className="glass-card rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-black text-slate-900">Standard Warranty Coverage</h2>
          <p className="text-xs text-slate-500">All NEED ELECTRO products come with minimum warranty coverage</p>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-white/80">
          <table className="w-full text-xs border-collapse bg-white/40 backdrop-blur-md">
            <thead>
              <tr className="bg-slate-100/60 border-b border-white/60">
                <th className="text-left p-3.5 font-black text-slate-800">Product Category</th>
                <th className="text-left p-3.5 font-black text-slate-800">Warranty Period</th>
                <th className="text-left p-3.5 font-black text-slate-800">Coverage Scope</th>
              </tr>
              </thead>
              <tbody>
                {WARRANTY_INFO.map(({ category, period, scope }) => (
                  <tr key={category} className="border-b border-slate-100 hover:bg-slate-50 transition">
                    <td className="p-3 font-bold text-slate-900">{category}</td>
                    <td className="p-3 text-brand-700 font-bold">{period}</td>
                    <td className="p-3 text-slate-600">{scope}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-slate-400 text-center">
            * Warranty does not cover physical damage, misuse, water damage, or unauthorized modifications.
          </p>
      </section>

      {/* Warranty Claim */}
      <section className="py-12 px-4 bg-slate-50">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="font-black text-slate-900">Submit a Warranty Claim</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              If your product is defective within the warranty period, you can submit a claim. Our team will inspect and either repair or replace the product.
            </p>
            <div className="space-y-2 text-xs text-slate-600">
              <p className="font-semibold text-slate-700">What you need:</p>
              <ul className="space-y-1 list-disc list-inside text-slate-600">
                <li>Original invoice / purchase receipt</li>
                <li>Serial number of the product</li>
                <li>Brief description of the defect</li>
                <li>Photos of the issue (if applicable)</li>
              </ul>
            </div>
            <Link href="/support?type=WARRANTY_CLAIM" className="btn-primary text-xs py-2.5 inline-flex w-full justify-center">
              Submit Warranty Claim
            </Link>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-black text-slate-900">Register a Device</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Register your NEED ELECTRO purchased product to activate digital warranty tracking, service reminders, and faster claim processing.
            </p>
            <div className="space-y-2 text-xs text-slate-600">
              <p className="font-semibold text-slate-700">Benefits of registration:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Instant warranty status lookup</li>
                <li>Service history tracking</li>
                <li>Faster claim processing</li>
                <li>Warranty expiry reminders</li>
              </ul>
            </div>
            <Link href="/customer/dashboard?tab=warranty" className="btn-secondary text-xs py-2.5 inline-flex w-full justify-center">
              Register in My Account
            </Link>
          </div>
        </div>
      </section>

      {/* Contact for Warranty */}
      <section className="py-10 px-4 bg-brand-600 text-white text-center">
        <div className="max-w-2xl mx-auto space-y-3">
          <h2 className="text-xl font-black">Need Warranty Assistance?</h2>
          <p className="text-sm text-brand-100">Our team is ready to help with warranty claims, product repairs, and replacements.</p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <a href="tel:+8801733983752" className="flex items-center gap-2 bg-white text-brand-700 font-bold text-xs py-2.5 px-5 rounded-xl">
              <Phone className="w-3.5 h-3.5" />
              01733-983752
            </a>
            <Link href="/contact" className="bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs py-2.5 px-5 rounded-xl transition">
              Contact Support
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
