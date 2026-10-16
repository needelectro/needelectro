'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Code2, 
  Smartphone, 
  Database, 
  Layers, 
  CheckCircle2, 
  ArrowRight, 
  PhoneCall, 
  ShieldCheck, 
  BarChart3, 
  Cpu, 
  Laptop, 
  Sparkles,
  HelpCircle,
  FileCheck
} from 'lucide-react';

const SOLUTIONS = [
  {
    id: 'WEB_DEV',
    title: 'Custom Website & Web Application',
    desc: 'High-performance Next.js and React web apps, e-commerce storefronts, and business portals engineered for speed, SEO, and national scalability.',
    icon: Code2,
    badge: 'Fast & Modern',
    features: ['Mobile-first Responsive Design', 'SEO & Core Web Vitals Tuned', 'Custom Admin CMS & Analytics', 'Payment Gateway Integration'],
  },
  {
    id: 'APP_DEV',
    title: 'iOS & Android Mobile Apps',
    desc: 'Native and hybrid mobile applications with Progressive Web App (PWA) offline capabilities, real-time push notifications, and hardware sensor integration.',
    icon: Smartphone,
    badge: 'Cross-Platform',
    features: ['Offline Syncing Capability', 'Biometric & SMS Authentication', 'Push Notifications Support', 'App Store & Play Store Deployment'],
  },
  {
    id: 'ACCOUNTING_SOFTWARE',
    title: 'Accounting & Retail POS Software',
    desc: 'Bilingual (Bengali/English) accounting and Point-of-Sale systems designed for Bangladeshi retailers, computer shops, electronics stores, and wholesalers.',
    icon: BarChart3,
    badge: 'NBR & VAT Ready',
    features: ['Thermal Invoice Printing', 'Customer Due & Ledger Records', 'Daily Cash & Bank Reconciliation', 'Fast Barcode Inventory Lookup'],
  },
  {
    id: 'CUSTOM_ERP',
    title: 'NEED ELECTRO ERP & Custom Enterprise',
    desc: 'Comprehensive multi-branch Enterprise Resource Planning software covering inventory, purchase orders, warranties, technician dispatch, and HR.',
    icon: Database,
    badge: 'Enterprise Architecture',
    features: ['Multi-Branch Realtime Sync', 'Serial-Number Warranty Tracking', 'Role-Based Access & Audit Logs', 'Automated Daily Financial Reports'],
  },
];

export default function SoftwarePage() {
  const [activeTab, setActiveTab] = useState<'software' | 'erp'>('software');
  const [submitting, setSubmitting] = useState(false);
  const [submittedLead, setSubmittedLead] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const [form, setForm] = useState({
    businessName: '',
    contactPerson: '',
    phone: '',
    email: '',
    serviceType: 'WEB_DEV',
    projectScope: '',
    estimatedBudget: '',
    preferredTimeline: '1-2 Months',
    industry: 'ELECTRONICS',
    branchCount: '1',
    userCount: '5',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/v1/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: activeTab === 'erp' ? 'erp' : 'digital',
          businessName: form.businessName,
          contactPerson: form.contactPerson,
          phone: form.phone,
          email: form.email,
          serviceType: form.serviceType,
          projectScope: form.projectScope,
          estimatedBudget: form.estimatedBudget ? Number(form.estimatedBudget) : undefined,
          preferredTimeline: form.preferredTimeline,
          industry: form.industry,
          branchCount: form.branchCount,
          userCount: form.userCount,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmittedLead(data.leadNumber);
      } else {
        setErrorMsg(data.error || 'Failed to submit inquiry.');
      }
    } catch {
      setErrorMsg('Network error while submitting. Please call 01733 983752.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col space-y-16 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-16 md:pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="glass-card-dark text-white rounded-3xl p-8 sm:p-14 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-10 w-[500px] h-[350px] bg-brand-500/25 blur-[120px] rounded-full pointer-events-none" />

          <div className="text-center max-w-3xl mx-auto space-y-5 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-brand-300 text-xs font-semibold tracking-wide border border-white/20">
              <Layers className="w-4 h-4 text-brand-400" />
              <span>AMDADS GROUP Software &amp; Technology Division</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.15]">
              Enterprise Software, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-sky-400 to-blue-200">
                Web, Mobile &amp; NEED ELECTRO ERP
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
              We architect secure, scalable software solutions engineered for Bangladesh&apos;s growing enterprises — from custom responsive web portals and mobile apps to comprehensive multi-branch ERP systems.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <a
                href="#inquiry-form"
                className="btn-primary text-sm py-3 px-6 shadow-lg shadow-brand-500/30"
              >
                Request Free Quotation
                <ArrowRight className="w-4 h-4 ml-2" />
              </a>
              <a
                href="tel:01733983752"
                className="btn-secondary text-sm py-3 px-5 bg-white/10 hover:bg-white/20 text-white border-white/20"
              >
                <PhoneCall className="w-4 h-4 mr-2" />
                Direct Hotline: 01733 983752
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CORE SOLUTION OFFERINGS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">Engineered For Reliability</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Digital Solutions Portfolio</h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Tailored software architecture designed to modernize operations, eliminate manual paperwork, and protect business data.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SOLUTIONS.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.id} className="card-premium p-6 sm:p-7 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>

                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                    {item.features.map((feat) => (
                      <li key={feat} className="flex items-center gap-2 text-[11px] font-semibold text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2">
                  <a
                    href="#inquiry-form"
                    onClick={() => {
                      if (item.id === 'CUSTOM_ERP') setActiveTab('erp');
                      else {
                        setActiveTab('software');
                        setForm((p) => ({ ...p, serviceType: item.id }));
                      }
                    }}
                    className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 group"
                  >
                    <span>Inquire for {item.title}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. DEDICATED INQUIRY & DEMO FLOW (Req F) */}
      <section id="inquiry-form" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full">
              Confidential Consultation
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Request Quotation or Software Demo
            </h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Tell us about your organization and requirements. Our engineering team will review your project and provide a transparent proposal.
            </p>
          </div>

          {/* Toggle Type Selector */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl max-w-md mx-auto">
            <button
              type="button"
              onClick={() => setActiveTab('software')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                activeTab === 'software'
                  ? 'bg-white text-brand-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Custom Software / Web / App
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('erp')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                activeTab === 'erp'
                  ? 'bg-white text-brand-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              NEED ELECTRO ERP Demo
            </button>
          </div>

          {submittedLead ? (
            <div className="p-8 bg-emerald-50 border border-emerald-200 rounded-3xl text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <FileCheck className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-black text-emerald-950">Inquiry Received Successfully!</h3>
                <p className="text-xs text-emerald-700 mt-1">
                  Your lead tracking reference is:
                </p>
                <p className="text-lg font-mono font-black text-emerald-800 mt-1">{submittedLead}</p>
                <p className="text-xs text-slate-600 mt-3 max-w-md mx-auto">
                  Our systems architect will contact you within 2 business hours. If your project is urgent, call us directly at <strong>01733 983752</strong>.
                </p>
              </div>
              <button
                onClick={() => setSubmittedLead(null)}
                className="btn-secondary text-xs py-2 px-5 bg-white text-slate-800 border-slate-200"
              >
                Submit Another Project Inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMsg && (
                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Business / Company Name *</label>
                  <input
                    type="text"
                    required
                    name="businessName"
                    value={form.businessName}
                    onChange={handleChange}
                    placeholder="e.g. Apex Electronics Ltd"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Contact Person Name *</label>
                  <input
                    type="text"
                    required
                    name="contactPerson"
                    value={form.contactPerson}
                    onChange={handleChange}
                    placeholder="Full Name"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Mobile Phone Number *</label>
                  <input
                    type="tel"
                    required
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="01XXXXXXXXX"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Email Address (Optional)</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="contact@company.com"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                {activeTab === 'software' ? (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Solution Category</label>
                      <select
                        name="serviceType"
                        value={form.serviceType}
                        onChange={handleChange}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      >
                        <option value="WEB_DEV">Custom Web App / E-commerce Store</option>
                        <option value="APP_DEV">Mobile App (iOS &amp; Android)</option>
                        <option value="ACCOUNTING_SOFTWARE">Retail POS &amp; Accounting System</option>
                        <option value="CUSTOM_ERP">Custom Business Management Software</option>
                        <option value="CONSULTING">IT Infrastructure &amp; Technical Consulting</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Target Timeline</label>
                      <select
                        name="preferredTimeline"
                        value={form.preferredTimeline}
                        onChange={handleChange}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      >
                        <option value="Urgent (2-4 Weeks)">Urgent (2-4 Weeks)</option>
                        <option value="1-2 Months">1-2 Months</option>
                        <option value="3-6 Months">3-6 Months</option>
                        <option value="Flexible">Flexible Planning</option>
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Industry Sector</label>
                      <select
                        name="industry"
                        value={form.industry}
                        onChange={handleChange}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      >
                        <option value="ELECTRONICS">Electronics &amp; Gadgets Shop</option>
                        <option value="COMPUTER_SHOP">Computer Hardware &amp; Servicing</option>
                        <option value="RETAIL">Multi-Branch Super Shop / Retail</option>
                        <option value="PHARMACY">Pharmacy &amp; Health Store</option>
                        <option value="HARDWARE">Electrical &amp; Sanitary Hardware</option>
                        <option value="SME">Manufacturing / SME Enterprise</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Number of Branches</label>
                      <select
                        name="branchCount"
                        value={form.branchCount}
                        onChange={handleChange}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      >
                        <option value="1">Single Branch (1 Store)</option>
                        <option value="2-5">2 to 5 Branches</option>
                        <option value="6-15">6 to 15 Branches</option>
                        <option value="16+">16+ National Outlets</option>
                      </select>
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Project Scope &amp; Key Requirements *
                </label>
                <textarea
                  required
                  rows={4}
                  name="projectScope"
                  value={form.projectScope}
                  onChange={handleChange}
                  placeholder="Describe what you want the system to do (e.g., number of daily invoices, barcode printing, multi-store stock transfers, bKash automated payment...)"
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl resize-none"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Your information is protected under AMDADS GROUP enterprise privacy guidelines and never shared.</span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full py-3 text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25"
              >
                {submitting ? 'Submitting Details...' : 'Submit Inquiry & Request Proposal'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </section>

      {/* 4. SECURITY & SCALABILITY GUARANTEES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="glass-card p-6 rounded-2xl space-y-2">
            <Cpu className="w-6 h-6 text-brand-600" />
            <h4 className="font-bold text-sm text-slate-900">Modern Architecture</h4>
            <p className="text-xs text-slate-600">Built using Next.js 15, PostgreSQL, and resilient microservices with automated backups.</p>
          </div>
          <div className="glass-card p-6 rounded-2xl space-y-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            <h4 className="font-bold text-sm text-slate-900">Data Sovereignty</h4>
            <p className="text-xs text-slate-600">Enterprise data encryption, role-based access control, and complete database backup export.</p>
          </div>
          <div className="glass-card p-6 rounded-2xl space-y-2">
            <PhoneCall className="w-6 h-6 text-purple-600" />
            <h4 className="font-bold text-sm text-slate-900">Dedicated Support</h4>
            <p className="text-xs text-slate-600">Direct technical assistance and regular updates provided by our software engineering team.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
