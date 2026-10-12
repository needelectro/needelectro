'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Globe, 
  MapPin, 
  FileCode, 
  CheckCircle2, 
  AlertTriangle, 
  Save, 
  ExternalLink, 
  RefreshCw, 
  ShieldCheck, 
  Database,
  BarChart,
  Layers,
  Sparkles,
  Truck
} from 'lucide-react';
import { BANGLADESH_DISTRICTS } from '@/lib/data/districts';

export default function AdminSeoPage() {
  const [activeTab, setActiveTab] = useState<'meta' | 'districts' | 'sitemap' | 'audit'>('meta');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [searchDistrict, setSearchDistrict] = useState('');

  const [formData, setFormData] = useState({
    seo_business_name: 'NEED ELECTRO SHOP',
    seo_founder_ceo: 'Amdadur Rahman',
    seo_parent_organization: 'AMDADS Group',
    seo_site_url: 'https://www.needelectro.store',
    seo_homepage_title: 'NEED ELECTRO SHOP | Laptops, Computers, CCTV & Electrical Services in Bangladesh',
    seo_homepage_desc: 'Shop laptops, computers, CCTV cameras, networking devices and electrical products at NEED ELECTRO SHOP. Explore electrical installation, electrician booking, repairs and technology services across Bangladesh.',
    seo_homepage_h1: 'NEED ELECTRO SHOP — Laptops, Computers, CCTV & Electrical Services in Bangladesh',
    seo_default_keywords: 'laptop price in bangladesh, computer shop bangladesh, cctv camera price in bangladesh, electrician service bangladesh, need electro shop',
    seo_google_search_console_tag: '',
    seo_google_analytics_id: '',
    seo_robots_index: 'true',
  });

  useEffect(() => {
    fetch('/api/v1/admin/seo')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setFormData((prev) => ({ ...prev, ...data.settings }));
          setStats(data.stats);
        }
      })
      .catch((err) => console.error('Failed to load SEO settings:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/v1/admin/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        alert(data.error || 'Failed to update SEO configuration');
      }
    } catch {
      alert('Error updating SEO settings.');
    } finally {
      setSaving(false);
    }
  };

  const filteredDistricts = BANGLADESH_DISTRICTS.filter(
    (d) =>
      d.name.toLowerCase().includes(searchDistrict.toLowerCase()) ||
      d.nameBn.includes(searchDistrict) ||
      d.division.toLowerCase().includes(searchDistrict.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="h-10 w-64 bg-slate-200 animate-pulse rounded-lg" />
        <div className="h-96 bg-slate-100 animate-pulse rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              National SEO Management System
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              Live Production
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure Bangladesh-wide search engine optimization, 64-district landing pages, metadata, and structured data.
          </p>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>SEO configuration updated and saved!</span>
          </div>
        )}
      </div>

      {/* Metrics Banner */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-medium block">Total Sitemap URLs</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {stats.totalSitemapUrls}
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold">100% Crawlable</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-medium block">Districts Targetable</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {stats.districtCount}
            </span>
            <span className="text-[10px] text-brand-600 font-semibold">All 8 Divisions</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-medium block">Indexed Products</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {stats.productCount}
            </span>
            <span className="text-[10px] text-purple-600 font-semibold">Product + Offer Schema</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-medium block">Active Technical Services</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {stats.serviceCount}
            </span>
            <span className="text-[10px] text-amber-600 font-semibold">Service Schema Active</span>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('meta')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'meta'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>General Metadata &amp; Identity</span>
        </button>

        <button
          onClick={() => setActiveTab('districts')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'districts'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>64 Districts Directory ({BANGLADESH_DISTRICTS.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('sitemap')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'sitemap'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>Sitemap &amp; Robots.txt</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'audit'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Technical Audit &amp; Rules</span>
        </button>
      </div>

      {/* Tab 1: Meta & Identity Form */}
      {activeTab === 'meta' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Globe className="w-5 h-5 text-brand-600" />
              <span>Homepage &amp; Corporate Brand Identity</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Business Name (Brand)
                </label>
                <input
                  type="text"
                  name="seo_business_name"
                  value={formData.seo_business_name}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Founder &amp; CEO
                </label>
                <input
                  type="text"
                  name="seo_founder_ceo"
                  value={formData.seo_founder_ceo}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Parent Organization
                </label>
                <input
                  type="text"
                  name="seo_parent_organization"
                  value={formData.seo_parent_organization}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Production Canonical Base URL
                </label>
                <input
                  type="url"
                  name="seo_site_url"
                  value={formData.seo_site_url}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Homepage SEO Title Tag
                  </label>
                  <span className="text-[10px] text-slate-400">
                    {formData.seo_homepage_title.length} / 70 characters
                  </span>
                </div>
                <input
                  type="text"
                  name="seo_homepage_title"
                  value={formData.seo_homepage_title}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Homepage Meta Description
                  </label>
                  <span className="text-[10px] text-slate-400">
                    {formData.seo_homepage_desc.length} / 160 characters
                  </span>
                </div>
                <textarea
                  rows={3}
                  name="seo_homepage_desc"
                  value={formData.seo_homepage_desc}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Homepage Primary H1 Heading
                </label>
                <input
                  type="text"
                  name="seo_homepage_h1"
                  value={formData.seo_homepage_h1}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Global Target Keywords (Comma Separated)
                </label>
                <input
                  type="text"
                  name="seo_default_keywords"
                  value={formData.seo_default_keywords}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Webmaster & Tracking */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <BarChart className="w-5 h-5 text-emerald-600" />
              <span>Google Search Console &amp; Analytics Integration</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Google Search Console Verification Tag / Content Code
                </label>
                <input
                  type="text"
                  name="seo_google_search_console_tag"
                  placeholder="e.g. google-site-verification=xxxx..."
                  value={formData.seo_google_search_console_tag}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Leave blank if verified via DNS TXT record or HTML file.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Google Analytics 4 Measurement ID
                </label>
                <input
                  type="text"
                  name="seo_google_analytics_id"
                  placeholder="e.g. G-XXXXXXXXXX"
                  value={formData.seo_google_analytics_id}
                  onChange={handleChange}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Optional tracking code for organic click conversions.
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary py-3 px-8 text-xs font-bold flex items-center gap-2"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? 'Saving...' : 'Save SEO Configuration'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: 64 Districts Directory */}
      {activeTab === 'districts' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  All 64 Verified Bangladesh Districts
                </h2>
                <p className="text-xs text-slate-500">
                  Each district has a dedicated indexable URL, localized title, delivery timeframe, and schema markup.
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search district or division..."
                  value={searchDistrict}
                  onChange={(e) => setSearchDistrict(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50/50">
                    <th className="py-3 px-4">District (Bangla)</th>
                    <th className="py-3 px-4">Division</th>
                    <th className="py-3 px-4">Slug &amp; URL</th>
                    <th className="py-3 px-4">Delivery Time</th>
                    <th className="py-3 px-4">On-Site Service</th>
                    <th className="py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDistricts.map((district) => (
                    <tr key={district.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {district.name}{' '}
                        <span className="text-slate-400 font-bangla font-normal">
                          ({district.nameBn})
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{district.division}</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                        /locations/{district.slug}
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-semibold">
                        {district.deliveryTimeDays}
                      </td>
                      <td className="py-3 px-4">
                        {district.onSiteServiceAvailable ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Available
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                            Remote / Scheduled
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Link
                          href={`/locations/${district.slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-700 font-semibold text-xs"
                        >
                          <span>Preview</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Sitemap & Robots.txt */}
      {activeTab === 'sitemap' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileCode className="w-5 h-5 text-brand-600" />
              <span>XML Sitemap &amp; Robots Configuration</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Dynamic XML Sitemap</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    Active &bull; XML
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Generated automatically by Next.js app router at{' '}
                  <code className="text-brand-600 font-bold">/sitemap.xml</code>. Includes all static routes, active products, active services, and all 64 district landing pages.
                </p>
                <div className="pt-2">
                  <a
                    href="https://www.needelectro.store/sitemap.xml"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:text-brand-600 shadow-xs"
                  >
                    <span>Inspect Live Sitemap</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Robots.txt Directive</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    Allow Root &bull; Protected Admin
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Directs Googlebot and search crawlers to index public products and services while disallowing private admin, cart, and checkout paths.
                </p>
                <div className="pt-2">
                  <a
                    href="https://www.needelectro.store/robots.txt"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:text-brand-600 shadow-xs"
                  >
                    <span>Inspect Live Robots.txt</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Technical Audit & Rules */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Compliance &amp; Quality Safeguards</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-emerald-950">Verified Corporate Address Protection</h3>
                  <p className="text-emerald-800 leading-relaxed mt-0.5">
                    All previous physical shop addresses have been completely removed across all code, metadata, footers, schema, and templates. Registered office is Moulvibazar, Bangladesh serving nationwide across all 64 districts.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-blue-950">No Fake Branches or Doorway Pages</h3>
                  <p className="text-blue-800 leading-relaxed mt-0.5">
                    District pages provide real products from stock and transparent delivery timescales (e.g. 24-48 hours via courier). No deceptive physical branches are published.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-purple-950">Server-Side JSON-LD Structured Data</h3>
                  <p className="text-purple-800 leading-relaxed mt-0.5">
                    Product pages inject Product and Offer schema with BDT pricing; service pages inject Service schema; root layout injects Organization and WebSite schema; district pages inject BreadcrumbList and FAQ schema.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-amber-950">Admin Posting Rules</h3>
                  <p className="text-amber-800 leading-relaxed mt-0.5">
                    When creating new products or services in the admin catalog, ensure unique descriptive titles, genuine high-resolution images, and realistic stock numbers are provided to maintain Google Merchant compliance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
