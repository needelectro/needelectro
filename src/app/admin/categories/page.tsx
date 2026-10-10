'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Layers, Plus, RefreshCw, X, Tag, Sparkles, FolderPlus,
  Edit2, Trash2, Search, CheckCircle2, AlertTriangle, AlertCircle
} from 'lucide-react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [serviceCategories, setServiceCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'PRODUCT' | 'BRAND' | 'SERVICE'>('PRODUCT');

  // Add / Edit Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    imageUrl: '',
  });
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Delete Confirmation Modal
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; item: any | null }>({
    isOpen: false,
    item: null,
  });

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

  const handleOpenAdd = () => {
    setEditingItem(null);
    setForm({ name: '', slug: '', description: '', imageUrl: '' });
    setShowModal(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingItem(item);
    setForm({
      name: item.name || '',
      slug: item.slug || '',
      description: item.description || '',
      imageUrl: item.imageUrl || item.logoUrl || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setNotification(null);
    try {
      if (editingItem) {
        // Edit existing
        const res = await fetch('/api/v1/admin/categories', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingItem.id,
            type: activeTab,
            ...form,
            logoUrl: form.imageUrl,
          }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setNotification({ type: 'success', message: `${form.name} updated successfully.` });
          setShowModal(false);
          await loadData();
        } else {
          setNotification({ type: 'error', message: data.error || 'Failed to update category.' });
        }
      } else {
        // Create new
        const res = await fetch('/api/v1/admin/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: activeTab,
            ...form,
            logoUrl: form.imageUrl,
          }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setNotification({ type: 'success', message: `${form.name} created successfully.` });
          setShowModal(false);
          await loadData();
        } else {
          setNotification({ type: 'error', message: data.error || 'Failed to create category.' });
        }
      }
    } catch (e: any) {
      setNotification({ type: 'error', message: e.message || 'Operation failed.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.item) return;
    const item = deleteModal.item;
    setSaving(true);
    setNotification(null);
    try {
      const res = await fetch(`/api/v1/admin/categories?id=${item.id}&type=${activeTab}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNotification({ type: 'success', message: `${item.name} deleted successfully.` });
        setDeleteModal({ isOpen: false, item: null });
        await loadData();
      } else {
        setNotification({ type: 'error', message: data.error || 'Cannot delete item.' });
      }
    } catch (e: any) {
      setNotification({ type: 'error', message: e.message || 'Deletion error.' });
    } finally {
      setSaving(false);
    }
  };

  const getFilteredItems = () => {
    let list = categories;
    if (activeTab === 'BRAND') list = brands;
    if (activeTab === 'SERVICE') list = serviceCategories;

    if (!search.trim()) return list;
    return list.filter(
      (item) =>
        item.name?.toLowerCase().includes(search.toLowerCase()) ||
        item.slug?.toLowerCase().includes(search.toLowerCase())
    );
  };

  const filteredItems = getFilteredItems();

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
            Full CRUD control: Create, edit, rename, and manage product categories, service categories, and brands.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAdd}
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

      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-xs font-semibold ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Controls Bar: Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveTab('PRODUCT')}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition ${
              activeTab === 'PRODUCT' ? 'bg-[#008CFF] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Product Categories ({categories.length})
          </button>
          <button
            onClick={() => setActiveTab('BRAND')}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition ${
              activeTab === 'BRAND' ? 'bg-[#008CFF] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Brands &amp; Hardware ({brands.length})
          </button>
          <button
            onClick={() => setActiveTab('SERVICE')}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition ${
              activeTab === 'SERVICE' ? 'bg-[#008CFF] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Service Categories ({serviceCategories.length})
          </button>
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${activeTab.toLowerCase()}s...`}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#008CFF]"
          />
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full p-12 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#008CFF] mb-2" />
            Loading taxonomies...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="col-span-full p-12 text-center text-slate-400 bg-white rounded-3xl border border-slate-200">
            No items matching your search.
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3 flex flex-col justify-between hover:border-slate-300 transition"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-slate-400 font-bold">{item.slug}</span>
                  <span className="text-[10px] font-extrabold uppercase bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full">
                    {item._count?.products ?? item._count?.services ?? 0} {activeTab === 'SERVICE' ? 'services' : 'products'}
                  </span>
                </div>
                <h3 className="font-black text-base text-slate-900 mt-1">{item.name}</h3>
                {item.description && (
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">{item.description}</p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="Edit Details"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteModal({ isOpen: true, item })}
                    className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <Link
                  href={
                    activeTab === 'SERVICE'
                      ? `/admin/services?category=${item.slug}`
                      : `/admin/products?${activeTab === 'BRAND' ? 'brand' : 'category'}=${item.slug}`
                  }
                  className="text-[#008CFF] font-bold text-xs hover:underline"
                >
                  View Catalog &rarr;
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-base text-slate-950">
                {editingItem ? `Edit ${activeTab}` : `Add New ${activeTab}`}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. CCTV & Surveillance, Dahua, Networking"
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
                    placeholder="Brief description of this category..."
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
                  placeholder="https://..."
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
                  className="px-5 py-2 rounded-xl bg-[#008CFF] text-white font-bold hover:bg-blue-600 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingItem ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && deleteModal.item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 bg-rose-100 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Delete {deleteModal.item.name}?</h3>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Are you sure you want to delete this {activeTab.toLowerCase()}? If it contains products or services, the system will prevent deletion to preserve catalog integrity.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModal({ isOpen: false, item: null })}
                className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 text-xs"
              >
                {saving ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
