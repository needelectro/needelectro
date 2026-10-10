'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Layers, Plus, RefreshCw, X, Tag, Sparkles, FolderPlus } from 'lucide-react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [serviceCategories, setServiceCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'PRODUCT' | 'BRAND' | 'SERVICE'>('PRODUCT');

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    imageUrl: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
        setBrands(data.brands || []);
        setServiceCategories(data.serviceCategories || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/v1/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: activeTab,
          ...form,
        }),
      });
      if (res.ok) {
        setShowModal(false);
        setForm({ name: '', slug: '', description: '', imageUrl: '' });
        await loadData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full">
            Taxonomy &amp; Classification
          </span>
          <h1 className="text-2xl font-black text-slate-950 mt-1 flex items-center gap-2">
            <Layers className="w-6 h-6 text-brand-500" />
            Categories, Brands &amp; Taxonomies
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Organize products, services, and hardware manufacturer brands across the website.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
          >
            <Plus className="w-3.5 h-3.5" /> Add {activeTab === 'BRAND' ? 'Brand' : 'Category'}
          </button>
          <button
            onClick={loadData}
            className="p-2.5 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('PRODUCT')}
          className={`px-4 py-2 rounded-xl font-bold text-xs transition ${
            activeTab === 'PRODUCT' ? 'bg-brand-500 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Product Categories ({categories.length})
        </button>
        <button
          onClick={() => setActiveTab('BRAND')}
          className={`px-4 py-2 rounded-xl font-bold text-xs transition ${
            activeTab === 'BRAND' ? 'bg-brand-500 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Brands &amp; Manufacturers ({brands.length})
        </button>
        <button
          onClick={() => setActiveTab('SERVICE')}
          className={`px-4 py-2 rounded-xl font-bold text-xs transition ${
            activeTab === 'SERVICE' ? 'bg-brand-500 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Service Categories ({serviceCategories.length})
        </button>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeTab === 'PRODUCT' && categories.map((c) => (
          <div key={c.id} className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-slate-400 font-bold">{c.slug}</span>
                <span className="text-[10px] font-extrabold uppercase bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full">
                  {c._count?.products || 0} products
                </span>
              </div>
              <h3 className="font-black text-base text-slate-900 mt-1">{c.name}</h3>
              <p className="text-xs text-slate-500 line-clamp-2">{c.description || 'No description provided.'}</p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Status: <strong className="text-emerald-600">Active</strong></span>
              <Link href={`/admin/products?category=${c.slug}`} className="text-brand-600 font-bold hover:underline">
                View Products &rarr;
              </Link>
            </div>
          </div>
        ))}

        {activeTab === 'BRAND' && brands.map((b) => (
          <div key={b.id} className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-slate-400 font-bold">{b.slug}</span>
                <span className="text-[10px] font-extrabold uppercase bg-sky-50 text-sky-700 px-2 py-0.5 rounded-full">
                  {b._count?.products || 0} products
                </span>
              </div>
              <h3 className="font-black text-base text-slate-900 mt-1">{b.name}</h3>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Authorized Brand Partner</span>
              <Link href={`/admin/products?brand=${b.slug}`} className="text-brand-600 font-bold hover:underline">
                View Catalog &rarr;
              </Link>
            </div>
          </div>
        ))}

        {activeTab === 'SERVICE' && serviceCategories.map((sc) => (
          <div key={sc.id} className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-slate-400 font-bold">{sc.slug}</span>
                <span className="text-[10px] font-extrabold uppercase bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                  {sc._count?.services || 0} services
                </span>
              </div>
              <h3 className="font-black text-base text-slate-900 mt-1">{sc.name}</h3>
              <p className="text-xs text-slate-500 line-clamp-2">{sc.description || 'Electrical & Tech services.'}</p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Service Area: <strong>Moulvibazar</strong></span>
              <Link href={`/admin/services?category=${sc.slug}`} className="text-brand-600 font-bold hover:underline">
                View Services &rarr;
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-base text-slate-950">Add New {activeTab}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. CCTV & Surveillance or Dahua"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Slug (Optional, auto-generated)</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="e.g. cctv-surveillance"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-hidden"
                />
              </div>

              {activeTab !== 'BRAND' && (
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Description</label>
                  <textarea
                    rows={2}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-hidden"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Image / Icon URL</label>
                <input
                  type="text"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-slate-950 text-white font-bold hover:bg-slate-800 disabled:opacity-50"
                >
                  {saving ? 'Creating...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
