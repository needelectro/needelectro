'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import {
  Wrench, Plus, Search, RefreshCw, Edit2, Trash2,
  CheckCircle2, AlertTriangle, Eye, Zap, Clock, Archive, X
} from 'lucide-react';
import { fastFetch, invalidateFastCache } from '@/lib/fastFetch';

interface Service {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  priceType: string;
  estimatedDuration: string;
  isEmergencyService: boolean;
  shortDescription: string;
  fullDescription?: string;
  isActive: boolean;
  category?: { id: string; name: string; slug: string };
  createdAt: string;
}

export default function AdminServicesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Form
  const [form, setForm] = useState({
    name: '',
    categorySlug: '',
    basePrice: 500,
    pricingType: 'STARTING_AT',
    estimatedDuration: '1-2 Hours',
    isEmergencyService: false,
    shortDescription: '',
    isActive: true,
  });

  const loadServices = async (forceRefresh = false) => {
    if (services.length === 0) setLoading(true);
    try {
      const data = await fastFetch('/api/v1/services', { forceRefresh });
      if (data) {
        setServices(data.services || []);
        setCategories(data.categories || []);
        if (data.categories?.length > 0 && !form.categorySlug) {
          setForm((prev) => ({ ...prev, categorySlug: data.categories[0].slug }));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const handleOpenAdd = () => {
    setForm({
      name: '',
      categorySlug: categories[0]?.slug || '',
      basePrice: 500,
      pricingType: 'STARTING_AT',
      estimatedDuration: '1-2 Hours',
      isEmergencyService: false,
      shortDescription: '',
      isActive: true,
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (s: Service) => {
    setEditingService(s);
    setForm({
      name: s.name,
      categorySlug: s.category?.slug || '',
      basePrice: s.basePrice,
      pricingType: s.priceType || 'FIXED',
      estimatedDuration: s.estimatedDuration || '1-2 Hours',
      isEmergencyService: s.isEmergencyService,
      shortDescription: s.shortDescription || '',
      isActive: s.isActive,
    });
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      if (editingService) {
        const res = await fetch('/api/v1/services', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingService.id,
            name: form.name,
            basePrice: Number(form.basePrice),
            priceType: form.pricingType,
            estimatedDuration: form.estimatedDuration,
            isEmergencyService: form.isEmergencyService,
            shortDescription: form.shortDescription,
            isActive: form.isActive,
          }),
        });
        if (res.ok) {
          setMessage('Service updated successfully!');
          setEditingService(null);
          invalidateFastCache('/api/v1/services');
          loadServices(true);
        } else {
          setMessage('Failed to update service.');
        }
      } else {
        const res = await fetch('/api/v1/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          setMessage('Service added successfully!');
          setShowAddModal(false);
          invalidateFastCache('/api/v1/services');
          loadServices(true);
        } else {
          setMessage('Failed to create service.');
        }
      }
    } catch {
      setMessage('Network error while saving service.');
    } finally {
      setSaving(false);
    }
  };

  const handleArchiveOrDelete = async (id: string, permanent = false) => {
    const actionText = permanent ? 'permanently delete' : 'archive';
    if (!confirm(`Are you sure you want to ${actionText} this service?`)) return;

    try {
      const res = await fetch(`/api/v1/services?id=${id}${permanent ? '&permanent=true' : ''}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'Operation successful.');
        invalidateFastCache('/api/v1/services');
        loadServices(true);
      } else {
        alert(data.error || 'Failed to remove service.');
      }
    } catch {
      alert('Network error.');
    }
  };

  const filteredServices = services.filter((s) => {
    const matchesSearch =
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.shortDescription?.toLowerCase().includes(search.toLowerCase());
    const matchesCat = !selectedCategory || s.category?.slug === selectedCategory;
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && s.isActive) ||
      (statusFilter === 'ARCHIVED' && !s.isActive);

    return matchesSearch && matchesCat && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Wrench className="w-7 h-7 text-[#008CFF]" />
            Electrical & Technical Services Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure pricing tiers, emergency service availability, categories, and technician durations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#008CFF] text-white rounded-lg text-xs font-bold hover:bg-blue-600 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add New Service
          </button>
          <button
            onClick={() => loadServices(true)}
            className="p-2 border border-slate-300 rounded-lg text-slate-700 bg-white hover:bg-slate-50 shadow-sm"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Total Services</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{services.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-sm">
          <p className="text-xs font-medium text-emerald-700">Active Online</p>
          <p className="text-2xl font-bold text-emerald-800 mt-1">
            {services.filter((s) => s.isActive).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/20 shadow-sm">
          <p className="text-xs font-medium text-rose-700">24/7 Emergency</p>
          <p className="text-2xl font-bold text-rose-800 mt-1">
            {services.filter((s) => s.isEmergencyService).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Service Categories</p>
          <p className="text-2xl font-bold text-slate-700 mt-1">{categories.length}</p>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search service title or details..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#008CFF]"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="ARCHIVED">Archived / Hidden</option>
          </select>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-700"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Service Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Base Price</th>
                <th className="px-4 py-3">Estimated Duration</th>
                <th className="px-4 py-3">Emergency</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#008CFF]" />
                    Loading services catalog...
                  </td>
                </tr>
              ) : filteredServices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No services found matching filters.
                  </td>
                </tr>
              ) : (
                filteredServices.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5 max-w-xs">
                      <div className="font-semibold text-slate-900">{s.name}</div>
                      <div className="text-xs text-slate-400 line-clamp-1 mt-0.5">{s.shortDescription}</div>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-800 text-xs">
                      {s.category?.name || 'General'}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-900">
                      ৳{s.basePrice.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-600">
                      {s.estimatedDuration}
                    </td>
                    <td className="px-4 py-3.5">
                      {s.isEmergencyService ? (
                        <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-rose-100 text-rose-700 flex items-center gap-1 w-max">
                          <Zap className="w-3 h-3" /> Yes
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Standard</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${
                          s.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}
                      >
                        {s.isActive ? 'Active' : 'Archived'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap space-x-1">
                      <button
                        onClick={() => handleOpenEdit(s)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Edit Service"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleArchiveOrDelete(s.id, false)}
                        className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                        title="Archive / Hide"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleArchiveOrDelete(s.id, true)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete"
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

      {/* Add / Edit Service Modal */}
      {(showAddModal || editingService) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">
                {editingService ? `Edit Service: ${editingService.name}` : 'Add New Electrical Service'}
              </h2>
              <button
                onClick={() => { setShowAddModal(false); setEditingService(null); }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Service Title *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Distribution Board Repair & Fuse Replacement"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={form.categorySlug}
                    onChange={(e) => setForm({ ...form, categorySlug: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.slug} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Base Price (৳ BDT) *</label>
                  <input
                    type="number"
                    required
                    value={form.basePrice}
                    onChange={(e) => setForm({ ...form, basePrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Pricing Model</label>
                  <select
                    value={form.pricingType}
                    onChange={(e) => setForm({ ...form, pricingType: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  >
                    <option value="STARTING_AT">Starting At</option>
                    <option value="FIXED">Fixed Price</option>
                    <option value="INSPECTION_BASED">Inspection Based</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Estimated Duration</label>
                  <input
                    type="text"
                    value={form.estimatedDuration}
                    onChange={(e) => setForm({ ...form, estimatedDuration: e.target.value })}
                    placeholder="e.g. 1-2 Hours"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Service Description *</label>
                <textarea
                  rows={3}
                  required
                  value={form.shortDescription}
                  onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                  placeholder="Detail what the electrician will perform during this service..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isEmergencyService}
                    onChange={(e) => setForm({ ...form, isEmergencyService: e.target.checked })}
                    className="rounded text-rose-600 focus:ring-rose-500"
                  />
                  24/7 Emergency Service
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="rounded text-[#008CFF]"
                  />
                  Active (Bookable Online)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setEditingService(null); }}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#008CFF] text-white rounded-lg text-sm font-bold hover:bg-blue-600 shadow-sm"
                >
                  {saving ? 'Saving...' : editingService ? 'Save Changes' : 'Create Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
