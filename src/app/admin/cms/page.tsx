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
  Calendar,
  Percent,
  CheckCircle2,
  Eye,
  Megaphone
} from "lucide-react";

interface Banner {
  id: string;
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  linkUrl?: string | null;
  buttonText?: string | null;
  position: string;
  sortOrder: number;
  isActive: boolean;
}

interface Promotion {
  id: string;
  code: string;
  title: string;
  description?: string | null;
  discountType: string;
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number | null;
  usageCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export default function CmsPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"banners" | "promotions">("banners");
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

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
    title: "",
    description: "",
    discountType: "PERCENTAGE",
    discountValue: 10,
    minOrderValue: 1000,
    maxDiscount: 500,
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
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCmsData();
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Megaphone className="w-7 h-7 text-[#008CFF]" />
            CMS & Marketing Campaigns
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage storefront hero banners, seasonal marketing sliders, and discount coupon codes.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {activeTab === "banners" ? (
            <button
              onClick={() => setIsBannerModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#008CFF] text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Banner
            </button>
          ) : (
            <button
              onClick={() => setIsPromoModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#008CFF] text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              New Coupon
            </button>
          )}
          <button
            onClick={fetchCmsData}
            className="p-2 border border-slate-300 rounded-lg text-slate-700 bg-white hover:bg-slate-50 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab("banners")}
          className={`px-5 py-2.5 font-semibold text-sm border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "banners"
              ? "border-[#008CFF] text-[#008CFF]"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Image className="w-4 h-4" />
          Storefront Banners ({banners.length})
        </button>
        <button
          onClick={() => setActiveTab("promotions")}
          className={`px-5 py-2.5 font-semibold text-sm border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "promotions"
              ? "border-[#008CFF] text-[#008CFF]"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Tag className="w-4 h-4" />
          Coupon Codes & Promotions ({promotions.length})
        </button>
      </div>

      {activeTab === "banners" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
              No banners active. Click &quot;Add Banner&quot; to configure hero slides.
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
                      Link: {b.linkUrl}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-[#008CFF]">
                      {b.position}
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
      ) : (
        /* Promotions Table */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Coupon Code</th>
                  <th className="px-4 py-3">Campaign Title</th>
                  <th className="px-4 py-3">Discount Value</th>
                  <th className="px-4 py-3">Min. Order</th>
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
                      <td className="px-4 py-3.5 font-medium text-slate-900">
                        {p.title}
                        {p.description && <div className="text-xs text-slate-400 font-normal">{p.description}</div>}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-emerald-600">
                        {p.discountType === "PERCENTAGE" ? `${p.discountValue}% OFF` : `৳${p.discountValue} FLAT OFF`}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-700">
                        ৳{p.minOrderValue.toLocaleString()}
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

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Campaign Title *</label>
                <input
                  type="text"
                  required
                  value={promoForm.title}
                  onChange={(e) => setPromoForm({ ...promoForm, title: e.target.value })}
                  placeholder="e.g. Moulvibazar Tech Fest Discount"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
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
