'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Store, 
  ShieldCheck, 
  TrendingUp, 
  PackageCheck, 
  Truck, 
  CheckCircle2, 
  Send, 
  ArrowRight, 
  FileText, 
  DollarSign, 
  Award,
  AlertCircle
} from 'lucide-react';

export default function BecomeASellerPage() {
  const [formData, setFormData] = useState({
    businessName: '',
    tradeLicenseNumber: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    productCategories: 'Laptops, CCTV Hardware, Network Switches',
    bankAccountDetails: '',
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const res = await fetch('/api/v1/sellers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to submit application');
        return;
      }

      setSuccessMessage(data.message);
      setFormData({
        businessName: '',
        tradeLicenseNumber: '',
        contactPerson: '',
        phone: '',
        email: '',
        address: '',
        productCategories: 'Laptops, CCTV Hardware, Network Switches',
        bankAccountDetails: '',
      });
    } catch {
      setErrorMessage('Network connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* 1. HERO BANNER - GLASS DARK */}
      <div className="glass-card-dark text-white rounded-3xl p-8 sm:p-14 relative overflow-hidden shadow-2xl border border-white/10">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-brand-500/25 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-emerald-400/20 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-3xl relative z-10 space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-brand-300 text-xs font-semibold">
            <Store className="w-4 h-4 text-brand-400" />
            NEED ELECTRO Merchant &amp; Distributor Network
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Sell Genuine Technology &amp; Electrical Hardware
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            Expand your sales footprint across Moulvibazar and Sylhet Division. Partner with NEED ELECTRO to list certified enterprise laptops, security cameras, Wi-Fi networking gear, and IPS systems — backed by our unified digital warranty and certified technician installation network.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a href="#apply" className="btn-primary text-xs py-2.5 px-6 flex items-center gap-2 shadow-glass-glow">
              Apply as Verified Merchant
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* 2. WHY SELL ON NEED ELECTRO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-3xl border border-white/80 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-500/10 text-brand-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Targeted Regional Audience</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Direct access to thousands of institutional, commercial, and residential customers in Moulvibazar, Sreemangal, and Sylhet seeking authentic tech equipment.
          </p>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-white/80 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Automated QR Warranties</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Eliminate paperwork. Every product serial number sold integrates into NEED ELECTRO's digital warranty and QR claim verification portal.
          </p>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-white/80 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-600 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Transparent 7.5% - 8% Fee</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Simple, low platform commission. Reliable weekly electronic payouts to your Bangladeshi bank account or institutional bKash Merchant wallet.
          </p>
        </div>
      </div>

      {/* 3. APPLICATION SECTION */}
      <section id="apply" className="glass-card p-6 sm:p-10 rounded-3xl border border-white/90 shadow-glass space-y-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600">Merchant Onboarding</span>
          <h2 className="text-2xl font-black text-slate-900 mt-1">Merchant Application &amp; Trade Verification</h2>
          <p className="text-xs text-slate-500 mt-1">
            Please provide your registered business credentials. Only legitimate distributors with genuine warranty coverage are approved.
          </p>
        </div>

        {successMessage ? (
          <div className="p-8 rounded-3xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900">Application Submitted Successfully!</h3>
            <p className="text-xs text-slate-600 leading-relaxed max-w-lg mx-auto">{successMessage}</p>
            <div className="pt-2">
              <Link href="/shop" className="btn-primary text-xs py-2 px-6">
                Explore Marketplace
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMessage && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Business / Enterprise Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Surma Tech & Electrical Imports"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200/80 bg-white/90 focus:outline-brand-500 shadow-2xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Trade License Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TRAD/MZB/2024/09842"
                  value={formData.tradeLicenseNumber}
                  onChange={(e) => setFormData({ ...formData, tradeLicenseNumber: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200/80 bg-white/90 focus:outline-brand-500 shadow-2xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Contact Person Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Md. Tariqul Islam"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200/80 bg-white/90 focus:outline-brand-500 shadow-2xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Business Phone *</label>
                <input
                  type="tel"
                  required
                  placeholder="017xxxxxxxx"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200/80 bg-white/90 focus:outline-brand-500 shadow-2xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Official Email *</label>
                <input
                  type="email"
                  required
                  placeholder="sales@business.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200/80 bg-white/90 focus:outline-brand-500 shadow-2xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Physical Store / Office Address</label>
                <input
                  type="text"
                  placeholder="e.g. Stadium Market, Sylhet or Motijheel, Dhaka"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200/80 bg-white/90 focus:outline-brand-500 shadow-2xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Product Categories You Supply</label>
                <input
                  type="text"
                  placeholder="e.g. Laptops, CCTV Cameras, Networking, IPS"
                  value={formData.productCategories}
                  onChange={(e) => setFormData({ ...formData, productCategories: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200/80 bg-white/90 focus:outline-brand-500 shadow-2xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Payout Settlement Details (Bank Account or bKash Merchant)</label>
              <textarea
                rows={2}
                placeholder="Bank Name, Account Name, Account Number, Branch or bKash Merchant Number..."
                value={formData.bankAccountDetails}
                onChange={(e) => setFormData({ ...formData, bankAccountDetails: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200/80 bg-white/90 focus:outline-brand-500 shadow-2xs"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary text-xs py-3 px-8 flex items-center gap-2 shadow-glass-glow disabled:opacity-50"
              >
                {loading ? 'Submitting Application...' : 'Submit Merchant Application'}
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
