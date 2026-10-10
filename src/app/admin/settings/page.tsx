"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Save,
  Building2,
  Phone,
  MapPin,
  Percent,
  Truck,
  Shield,
  RefreshCw,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings || {});
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/v1/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
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

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-7 h-7 text-[#008CFF]" />
            Central System Settings & Configuration
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure business identity, hotline, commission ratios, delivery pricing, and operations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {savedSuccess && (
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Changes Saved
            </span>
          )}
          <button
            onClick={fetchSettings}
            className="p-2 border border-slate-300 rounded-lg text-slate-700 bg-white hover:bg-slate-50 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Brand & Organization Identity */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Building2 className="w-5 h-5 text-[#008CFF]" />
            <h2 className="text-base font-bold text-slate-900">Brand & Organization Profile</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Official Brand Name</label>
              <input
                type="text"
                value={settings.site_name || "NEED ELECTRO"}
                onChange={(e) => handleChange("site_name", e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Parent Enterprise</label>
              <input
                type="text"
                value={settings.parent_company || "AMDADS GROUP"}
                onChange={(e) => handleChange("parent_company", e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Brand Tagline</label>
            <input
              type="text"
              value={settings.tagline || "Trusted Electrical and Technological Solutions"}
              onChange={(e) => handleChange("tagline", e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Support Hotline</label>
              <input
                type="text"
                value={settings.hotline || "01733 983752"}
                onChange={(e) => handleChange("hotline", e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Standard Currency</label>
              <input
                type="text"
                disabled
                value="Bangladeshi Taka (BDT / ৳)"
                className="w-full px-3 py-2 border border-slate-200 bg-slate-50 text-slate-500 rounded-lg text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Central Physical Address</label>
            <input
              type="text"
              value={settings.address || "Shop #5, MR Plaza, Kusumbag, Moulvibazar"}
              onChange={(e) => handleChange("address", e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>
        </div>

        {/* Financial & Delivery Policies */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Percent className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">Financial Commissions & Delivery Charges</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Technician Platform Fee (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={settings.commission_rate || "15"}
                  onChange={(e) => handleChange("commission_rate", e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Deducted from completed jobs.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Delivery (Inside Moulvibazar)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={settings.delivery_charge_inside || "60"}
                  onChange={(e) => handleChange("delivery_charge_inside", e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">৳</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Delivery (Outside District)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={settings.delivery_charge_outside || "120"}
                  onChange={(e) => handleChange("delivery_charge_outside", e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">৳</span>
              </div>
            </div>
          </div>
        </div>

        {/* Save button bar */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#008CFF] text-white rounded-lg text-sm font-bold hover:bg-blue-600 transition shadow-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving Changes..." : "Save System Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
