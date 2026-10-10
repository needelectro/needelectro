"use client";

import React, { useState, useEffect } from "react";
import {
  Image,
  Tag,
  Plus,
  Trash2,
  ExternalLink,
  RefreshCw,
  X,
  FileText,
  Globe,
  Share2,
  Shield,
  HelpCircle,
  Megaphone,
  Save,
  CheckCircle2
} from "lucide-react";

interface Banner {
  id: string;
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  ctaLink?: string | null;
  ctaText?: string | null;
  placement: string;
  sortOrder: number;
  isActive: boolean;
}

interface Promotion {
  id: string;
  code: string;
  discountPercent?: number | null;
  discountAmount?: number | null;
  minOrderAmount: number;
  usageCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export default function CmsPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "banners" | "promotions" | "policies" | "about" | "seo" | "social"
  >("banners");

  // Modals & form saving
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Forms
  const [bannerForm, setBannerForm] = useState({
    title: "",
    subtitle: "",
    imageUrl: "/images/hero-banner.jpg",
    linkUrl: "/products",
    buttonText: "Shop Now",
    position: "HOMEPAGE_HERO",
    sortOrder: 0,
  });

  const [promoForm, setPromoForm] = useState({
    code: "",
    discountType: "PERCENTAGE",
    discountValue: 10,
    minOrderValue: 1000,
    startDate: new Date().toISOString().substring(0, 10),
    endDate: new Date(Date.now() + 30 * 86400000).toISOString().substring(0, 10),
  });

  const fetchCmsData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/cms");
      if (res.ok) {
        const data = await res.json();
        setBanners(data.banners || []);
        setPromotions(data.promotions || []);
        setSettings(data.settings || {});
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCmsData();
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab && ["banners", "promotions", "policies", "about", "seo", "social"].includes(tab)) {
        setActiveTab(tab as any);
      }
    }
  }, []);

  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/v1/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "banner", ...bannerForm }),
      });
      if (res.ok) {
        setIsBannerModalOpen(false);
        fetchCmsData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/v1/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "promo", ...promoForm }),
      });
      if (res.ok) {
        setIsPromoModalOpen(false);
        fetchCmsData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/v1/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "content_bulk", settings }),
      });
      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (type: "banner" | "promo", id: string) => {
    if (!confirm(`Delete this ${type}?`)) return;
    try {
      const res = await fetch(`/api/v1/admin/cms?type=${type}&id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchCmsData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSettingChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Megaphone className="w-7 h-7 text-[#008CFF]" />
            Full Website Content Management System (CMS)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage public storefront hero banners, promotional coupons, legal policies, About Us, SEO meta, and social channels.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {savedSuccess && (
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Live Content Published
            </span>
          )}
          {activeTab === "banners" && (
            <button
              onClick={() => setIsBannerModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#008CFF] text-white rounded-lg text-xs font-bold hover:bg-blue-600 transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Banner
            </button>
          )}
          {activeTab === "promotions" && (
            <button
              onClick={() => setIsPromoModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#008CFF] text-white rounded-lg text-xs font-bold hover:bg-blue-600 transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              New Coupon
            </button>
          )}
          <button
            onClick={fetchCmsData}
            className="p-2 border border-slate-300 rounded-lg text-slate-700 bg-white hover:bg-slate-50 shadow-sm"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-xl p-1.5 shadow-sm overflow-x-auto gap-1">
        {[
          { key: "banners", label: "Hero Banners", icon: Image },
          { key: "promotions", label: "Coupons & Discounts", icon: Tag },
          { key: "policies", label: "Policies & Legal", icon: Shield },
          { key: "about", label: "About Us & Story", icon: FileText },
          { key: "seo", label: "SEO & Meta Tags", icon: Globe },
          { key: "social", label: "Social Media & Footer", icon: Share2 },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                activeTab === tab.key
                  ? "bg-[#008CFF] text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Hero Banners */}
      {activeTab === "banners" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
              No hero banners active. Click &quot;Add Banner&quot; above to create storefront promotions.
            </div>
          ) : (
            banners.map((b) => (
              <div key={b.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="h-40 bg-slate-100 relative overflow-hidden flex items-center justify-center border-b border-slate-200">
                  {b.imageUrl ? (
                    <img src={b.imageUrl} alt={b.title} className="w-full h-full object-cover" />
                  ) : (
                    <Image className="w-10 h-10 text-slate-300" />
                  )}
                  <span className="absolute top-2 right-2 px-2 py-0.5 text-[10px] font-bold bg-white/90 text-slate-800 rounded shadow">
                    Order: {b.sortOrder}
                  </span>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{b.title}</h3>
                    {b.subtitle && <p className="text-xs text-slate-500 mt-0.5">{b.subtitle}</p>}
                    <div className="text-xs text-[#008CFF] font-medium mt-2 flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" />
                      Link: {b.ctaLink} ({b.ctaText || "Action"})
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-[#008CFF]">
                      {b.placement}
                    </span>
                    <button
                      onClick={() => handleDelete("banner", b.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Promotions & Coupons */}
      {activeTab === "promotions" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Coupon Code</th>
                  <th className="px-4 py-3">Discount Value</th>
                  <th className="px-4 py-3">Min. Order (BDT)</th>
                  <th className="px-4 py-3">Redemptions</th>
                  <th className="px-4 py-3">Validity</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {promotions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400">
                      No active discount coupons found.
                    </td>
                  </tr>
                ) : (
                  promotions.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5">
                        <span className="font-mono font-bold text-xs bg-slate-100 text-slate-900 px-2.5 py-1 rounded border border-slate-300">
                          {p.code}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-emerald-600">
                        {p.discountPercent ? `${p.discountPercent}% OFF` : `৳${p.discountAmount} FLAT OFF`}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-700">
                        ৳{p.minOrderAmount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-700">
                        {p.usageCount} times used
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-500">
                        {new Date(p.startDate).toLocaleDateString("en-GB")} to {new Date(p.endDate).toLocaleDateString("en-GB")}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => handleDelete("promo", p.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Policies & Legal Texts */}
      {activeTab === "policies" && (
        <form onSubmit={handleSaveContent} className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#008CFF]" />
              Store Policies & Legal Terms (Editable Live)
            </h2>
            <p className="text-xs text-slate-500">
              Edit the text that appears on `/privacy`, `/terms`, `/returns`, and warranty service pages without modifying code.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Privacy Policy
              </label>
              <textarea
                rows={5}
                value={settings.policy_privacy || "NEED ELECTRO values your privacy and secures all customer personal and payment details."}
                onChange={(e) => handleSettingChange("policy_privacy", e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Terms and Conditions
              </label>
              <textarea
                rows={5}
                value={settings.policy_terms || "By placing an order or booking an electrical technician on NEED ELECTRO, you agree to our service terms."}
                onChange={(e) => handleSettingChange("policy_terms", e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Return & Refund Policy
              </label>
              <textarea
                rows={4}
                value={settings.policy_returns || "Products can be returned within 7 days of delivery in original packaging for replacement or refund."}
                onChange={(e) => handleSettingChange("policy_returns", e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Warranty & Service Guarantee Policy
              </label>
              <textarea
                rows={4}
                value={settings.policy_warranty || "Official brand warranty valid for up to 12-24 months. Electrical technician service works include a 7-day workmanship guarantee."}
                onChange={(e) => handleSettingChange("policy_warranty", e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#008CFF] text-white rounded-lg text-xs font-bold hover:bg-blue-600 shadow-sm"
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Publish Policies"}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Tab 4: About Us & Story */}
      {activeTab === "about" && (
        <form onSubmit={handleSaveContent} className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#008CFF]" />
              About NEED ELECTRO & Company Story
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                About Us Headline
              </label>
              <input
                type="text"
                value={settings.about_headline || "Trusted Electrical and Technological Solutions in Moulvibazar & Bangladesh"}
                onChange={(e) => handleSettingChange("about_headline", e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Full Company Story & Mission
              </label>
              <textarea
                rows={6}
                value={settings.about_story || "NEED ELECTRO, a proud sister concern of AMDADS GROUP, is dedicated to delivering certified electrical installations, computer & CCTV hardware, solar technologies, and custom digital software solutions across Sylhet division and throughout Bangladesh."}
                onChange={(e) => handleSettingChange("about_story", e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Core Mission</label>
                <textarea
                  rows={3}
                  value={settings.about_mission || "To provide households and commercial enterprises with safe, certified electrical and IT infrastructure."}
                  onChange={(e) => handleSettingChange("about_mission", e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Vision</label>
                <textarea
                  rows={3}
                  value={settings.about_vision || "To be the leading electrical and enterprise tech provider across Bangladesh."}
                  onChange={(e) => handleSettingChange("about_vision", e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#008CFF] text-white rounded-lg text-xs font-bold hover:bg-blue-600 shadow-sm"
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Save About Us Content"}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Tab 5: SEO & Meta Tags */}
      {activeTab === "seo" && (
        <form onSubmit={handleSaveContent} className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-600" />
              SEO & Social Meta Tags Configuration
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Website Meta Title
              </label>
              <input
                type="text"
                value={settings.seo_title || "NEED ELECTRO | Trusted Electrical & Technological Solutions"}
                onChange={(e) => handleSettingChange("seo_title", e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Meta Description
              </label>
              <textarea
                rows={3}
                value={settings.seo_description || "Certified electrical services, CCTV, computers, and custom software in Moulvibazar and Bangladesh. A Sister Concern of AMDADS GROUP."}
                onChange={(e) => handleSettingChange("seo_description", e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                SEO Keywords (Comma Separated)
              </label>
              <input
                type="text"
                value={settings.seo_keywords || "electrician moulvibazar, cctv installation, need electro, amdads group, computer shop, erp software bangladesh"}
                onChange={(e) => handleSettingChange("seo_keywords", e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Open Graph / Social Sharing Image URL
              </label>
              <input
                type="text"
                value={settings.seo_og_image || "/logo.png"}
                onChange={(e) => handleSettingChange("seo_og_image", e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
              />
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#008CFF] text-white rounded-lg text-xs font-bold hover:bg-blue-600 shadow-sm"
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Update SEO Metadata"}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Tab 6: Social Media & Footer */}
      {activeTab === "social" && (
        <form onSubmit={handleSaveContent} className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Share2 className="w-5 h-5 text-purple-600" />
              Social Channels & Storefront Footer
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Facebook Page URL</label>
                <input
                  type="text"
                  value={settings.social_facebook || "https://facebook.com/needelectro"}
                  onChange={(e) => handleSettingChange("social_facebook", e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">WhatsApp Hotline Link</label>
                <input
                  type="text"
                  value={settings.social_whatsapp || "https://wa.me/8801733983752"}
                  onChange={(e) => handleSettingChange("social_whatsapp", e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">YouTube Channel URL</label>
                <input
                  type="text"
                  value={settings.social_youtube || "https://youtube.com/@needelectro"}
                  onChange={(e) => handleSettingChange("social_youtube", e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">LinkedIn URL</label>
                <input
                  type="text"
                  value={settings.social_linkedin || "https://linkedin.com/company/needelectro"}
                  onChange={(e) => handleSettingChange("social_linkedin", e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Footer Copyright Notice</label>
              <input
                type="text"
                value={settings.footer_copyright || "© 2026 NEED ELECTRO. All Rights Reserved. A Sister Concern of AMDADS GROUP."}
                onChange={(e) => handleSettingChange("footer_copyright", e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#008CFF] text-white rounded-lg text-xs font-bold hover:bg-blue-600 shadow-sm"
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Save Social & Footer Links"}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Add Banner Modal */}
      {isBannerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Add Homepage Banner</h2>
              <button onClick={() => setIsBannerModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateBanner} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Banner Title *</label>
                <input
                  type="text"
                  required
                  value={bannerForm.title}
                  onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                  placeholder="e.g. Mega Ramadan Discounts on Laptops"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Subtitle / Tagline</label>
                <input
                  type="text"
                  value={bannerForm.subtitle}
                  onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                  placeholder="e.g. Up to 15% OFF with official warranty"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Image URL *</label>
                <input
                  type="text"
                  required
                  value={bannerForm.imageUrl}
                  onChange={(e) => setBannerForm({ ...bannerForm, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Destination URL</label>
                  <input
                    type="text"
                    value={bannerForm.linkUrl}
                    onChange={(e) => setBannerForm({ ...bannerForm, linkUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Button Text</label>
                  <input
                    type="text"
                    value={bannerForm.buttonText}
                    onChange={(e) => setBannerForm({ ...bannerForm, buttonText: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBannerModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#008CFF] text-white rounded-lg text-sm font-semibold hover:bg-blue-600 shadow-sm"
                >
                  {saving ? "Saving..." : "Save Banner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Coupon Modal */}
      {isPromoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Create Promotion / Coupon</h2>
              <button onClick={() => setIsPromoModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreatePromo} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Coupon Code *</label>
                  <input
                    type="text"
                    required
                    value={promoForm.code}
                    onChange={(e) => setPromoForm({ ...promoForm, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. NEED10"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm uppercase font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Discount Type</label>
                  <select
                    value={promoForm.discountType}
                    onChange={(e) => setPromoForm({ ...promoForm, discountType: e.target.value })}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Flat BDT (৳)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Discount Value *</label>
                  <input
                    type="number"
                    required
                    value={promoForm.discountValue}
                    onChange={(e) => setPromoForm({ ...promoForm, discountValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Min. Order Value (৳)</label>
                  <input
                    type="number"
                    value={promoForm.minOrderValue}
                    onChange={(e) => setPromoForm({ ...promoForm, minOrderValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPromoModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#008CFF] text-white rounded-lg text-sm font-semibold hover:bg-blue-600 shadow-sm"
                >
                  {saving ? "Saving..." : "Create Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
