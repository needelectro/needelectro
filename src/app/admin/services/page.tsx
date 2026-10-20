'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import {
  Wrench, Plus, Search, RefreshCw, Edit2, Trash2,
  CheckCircle2, AlertTriangle, Eye, Zap, Clock, Archive, X,
  UploadCloud, MapPin, FileText, Settings, Shield, Image as ImageIcon, Tag, Sparkles
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
  imageUrl?: string | null;
  serviceAreas?: string;
  requiredSkills?: string;
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

  // Modals & UI State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'basic' | 'media' | 'details' | 'dispatch'>('basic');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form
  const [form, setForm] = useState({
    name: '',
    categorySlug: '',
    basePrice: '' as unknown as number,
    pricingType: 'STARTING_FROM',
    estimatedDuration: '1-2 Hours',
    isEmergencyService: false,
    shortDescription: '',
    fullDescription: '',
    imageUrl: '',
    serviceAreas: 'Moulvibazar, Sreemangal, Kamalganj, Rajnagar',
    requiredSkills: '',
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
    setMessage('');
    setErrorMessage('');
    setActiveTab('basic');
    setForm({
      name: '',
      categorySlug: categories[0]?.slug || 'electrical-services',
      basePrice: '' as any,
      pricingType: 'STARTING_FROM',
      estimatedDuration: '1-2 Hours',
      isEmergencyService: false,
      shortDescription: '',
      fullDescription: '',
      imageUrl: '',
      serviceAreas: 'Moulvibazar, Sreemangal, Kamalganj, Rajnagar',
      requiredSkills: '',
      isActive: true,
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (s: Service) => {
    setEditingService(s);
    setMessage('');
    setErrorMessage('');
    setActiveTab('basic');
    setForm({
      name: s.name,
      categorySlug: s.category?.slug || categories[0]?.slug || '',
      basePrice: s.basePrice,
      pricingType: s.priceType === 'STARTING_AT' ? 'STARTING_FROM' : (s.priceType || 'FIXED'),
      estimatedDuration: s.estimatedDuration || '1-2 Hours',
      isEmergencyService: Boolean(s.isEmergencyService),
      shortDescription: s.shortDescription || '',
      fullDescription: s.fullDescription || s.shortDescription || '',
      imageUrl: s.imageUrl || '',
      serviceAreas: s.serviceAreas || 'Moulvibazar, Sreemangal, Kamalganj, Rajnagar',
      requiredSkills: s.requiredSkills || '',
      isActive: Boolean(s.isActive),
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/v1/uploads', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setForm((prev) => ({ ...prev, imageUrl: data.url }));
      } else {
        setErrorMessage(data.error || 'Failed to upload service image');
      }
    } catch {
      setErrorMessage('Network error while uploading image.');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setErrorMessage('');

    if (!form.name.trim()) {
      setErrorMessage('Service title is required.');
      setActiveTab('basic');
      setSaving(false);
      return;
    }
    if (form.basePrice === undefined || form.basePrice === null || (form.basePrice as any) === '' || Number(form.basePrice) < 0) {
      setErrorMessage('Please enter a valid base price.');
      setActiveTab('basic');
      setSaving(false);
      return;
    }

    try {
      const payload = {
        name: form.name.trim(),
        categorySlug: form.categorySlug,
        basePrice: Number(form.basePrice),
        pricingType: form.pricingType,
        estimatedDuration: form.estimatedDuration || '1-2 Hours',
        isEmergencyService: form.isEmergencyService,
        shortDescription: form.shortDescription.trim() || form.name.trim(),
        fullDescription: form.fullDescription.trim() || form.shortDescription.trim() || form.name.trim(),
        imageUrl: form.imageUrl.trim() || null,
        serviceAreas: form.serviceAreas.trim(),
        requiredSkills: form.requiredSkills.trim(),
        isActive: form.isActive,
      };

      if (editingService) {
        const res = await fetch('/api/v1/services', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingService.id,
            ...payload,
          }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setMessage('Service updated successfully!');
          setEditingService(null);
          invalidateFastCache('/api/v1/services');
          loadServices(true);
        } else {
          setErrorMessage(data.error || 'Failed to update service.');
        }
      } else {
        const res = await fetch('/api/v1/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setMessage('Service created successfully!');
          setShowAddModal(false);
          invalidateFastCache('/api/v1/services');
          loadServices(true);
        } else {
          setErrorMessage(data.error || 'Failed to create service.');
        }
      }
    } catch {
      setErrorMessage('Network error while saving service.');
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

      {/* Redesigned Add / Edit Service Modal */}
      {(showAddModal || editingService) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-brand-500/10 text-brand-600 flex items-center justify-center font-bold">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                    {editingService ? `Edit Service: ${editingService.name}` : 'Add New Electrical / Tech Service'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {editingService ? 'Modify service pricing, duration, scope of work, and coverage areas' : 'Configure service tiers, technician requirements, and dispatch settings'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setShowAddModal(false); setEditingService(null); }}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error & Success Banners */}
            {errorMessage && (
              <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}
            {message && (
              <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{message}</span>
              </div>
            )}

            {/* Tabs Bar */}
            <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-200/80 bg-slate-50/30 overflow-x-auto scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveTab('basic')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'basic'
                    ? 'border-brand-600 text-brand-600 bg-white rounded-t-lg shadow-xs'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>Basic Info &amp; Pricing</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('media')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'media'
                    ? 'border-brand-600 text-brand-600 bg-white rounded-t-lg shadow-xs'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Thumbnail / Photo</span>
                {form.imageUrl && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('details')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'details'
                    ? 'border-brand-600 text-brand-600 bg-white rounded-t-lg shadow-xs'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Scope of Work</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('dispatch')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'dispatch'
                    ? 'border-brand-600 text-brand-600 bg-white rounded-t-lg shadow-xs'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Coverage &amp; Emergency</span>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveService} className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* TAB 1: BASIC INFO & PRICING */}
              {activeTab === 'basic' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Service Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Distribution Board Repair & Fuse Replacement"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Category <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={form.categorySlug}
                        onChange={(e) => setForm({ ...form, categorySlug: e.target.value })}
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                      >
                        {categories.map((c) => (
                          <option key={c.slug} value={c.slug}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Base Price (৳ BDT) <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">৳</span>
                        <input
                          type="number"
                          required
                          min={0}
                          value={form.basePrice}
                          onChange={(e) => setForm({ ...form, basePrice: e.target.value === '' ? ('' as any) : Number(e.target.value) })}
                          placeholder="e.g. 500"
                          className="w-full pl-8 pr-3 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Pricing Model
                      </label>
                      <select
                        value={form.pricingType}
                        onChange={(e) => setForm({ ...form, pricingType: e.target.value })}
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                      >
                        <option value="STARTING_FROM">Starting From (Estimated Minimum)</option>
                        <option value="FIXED">Fixed Price (Package)</option>
                        <option value="INSPECTION_BASED">Inspection Based (Quote on Site)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Estimated Service Duration
                      </label>
                      <select
                        value={form.estimatedDuration}
                        onChange={(e) => setForm({ ...form, estimatedDuration: e.target.value })}
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                      >
                        <option value="30-45 Mins">30-45 Minutes</option>
                        <option value="1-2 Hours">1-2 Hours</option>
                        <option value="2-4 Hours">2-4 Hours</option>
                        <option value="Half Day (4-5 Hours)">Half Day (4-5 Hours)</option>
                        <option value="Full Day (1 Day)">Full Day (1 Day)</option>
                        <option value="Multi-Day Project">Multi-Day Project</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: THUMBNAIL & PHOTO */}
              {activeTab === 'media' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="border-2 border-dashed border-slate-300 hover:border-brand-500 rounded-2xl p-6 text-center transition-all bg-slate-50/50">
                    <div className="w-12 h-12 rounded-full bg-brand-500/10 text-brand-600 flex items-center justify-center mx-auto mb-3">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-800">
                      Upload Service Banner / Illustration
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Drag &amp; drop or browse JPEG, PNG, or WebP photo (Max 5MB)
                    </p>

                    <label className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold cursor-pointer transition-colors shadow-sm">
                      <span>{uploadingImage ? 'Uploading Image...' : 'Choose Service Image'}</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Or Image URL
                    </label>
                    <input
                      type="url"
                      value={form.imageUrl}
                      onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
                  </div>

                  {form.imageUrl && (
                    <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={form.imageUrl}
                          alt="Service Preview"
                          className="w-16 h-12 rounded-lg object-cover border border-slate-200 bg-white"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/brand/needelectro-icon.png';
                          }}
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-800">Current Service Banner</p>
                          <p className="text-[10px] text-slate-400 truncate max-w-xs">{form.imageUrl}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, imageUrl: '' })}
                        className="text-xs text-rose-600 hover:text-rose-700 font-semibold px-2 py-1 rounded hover:bg-rose-50 transition"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: SCOPE OF WORK */}
              {activeTab === 'details' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Short Overview Summary <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={form.shortDescription}
                      onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                      placeholder="Quick summary visible on service cards and booking search..."
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Scope of Work &amp; Inspection Protocol
                    </label>
                    <textarea
                      rows={4}
                      value={form.fullDescription}
                      onChange={(e) => setForm({ ...form, fullDescription: e.target.value })}
                      placeholder="Detail step-by-step what the technician performs, what safety equipment is required, and what parts are covered..."
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Required Technician Qualifications / Skills
                    </label>
                    <input
                      type="text"
                      value={form.requiredSkills}
                      onChange={(e) => setForm({ ...form, requiredSkills: e.target.value })}
                      placeholder="e.g. Licensed Electrician, CCTV Certified, High Voltage Safety"
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs"
                    />
                  </div>
                </div>
              )}

              {/* TAB 4: COVERAGE & EMERGENCY */}
              {activeTab === 'dispatch' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Authorized Service Hubs &amp; Coverage Areas
                    </label>
                    <input
                      type="text"
                      value={form.serviceAreas}
                      onChange={(e) => setForm({ ...form, serviceAreas: e.target.value })}
                      placeholder="e.g. Moulvibazar, Sreemangal, Kamalganj, Rajnagar, Sylhet"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Technicians registered within these areas will be notified on new booking dispatches.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.isEmergencyService}
                        onChange={(e) => setForm({ ...form, isEmergencyService: e.target.checked })}
                        className="w-4 h-4 mt-0.5 rounded text-rose-600 focus:ring-rose-500"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-rose-600 fill-rose-600" />
                          <span>24/7 Emergency Response Service</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Flags this service with an urgent red badge and triggers priority technician phone dispatch.
                        </p>
                      </div>
                    </label>

                    <div className="border-t border-slate-200 pt-3">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.isActive}
                          onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                          className="w-4 h-4 mt-0.5 rounded text-brand-600 focus:ring-brand-500"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Active (Bookable Online by Customers)</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            When disabled, the service is archived and hidden from public booking selection.
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Footer Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <div className="text-xs text-slate-400">
                  {activeTab === 'basic' && 'Step 1 of 4 • Pricing & Duration'}
                  {activeTab === 'media' && 'Step 2 of 4 • Thumbnail / Image'}
                  {activeTab === 'details' && 'Step 3 of 4 • Scope of Work'}
                  {activeTab === 'dispatch' && 'Step 4 of 4 • Coverage & Availability'}
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => { setShowAddModal(false); setEditingService(null); }}
                    className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving || uploadingImage}
                    className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-brand-600/20 disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {saving ? (
                      <span>Saving Service...</span>
                    ) : editingService ? (
                      <span>Save Changes</span>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Publish Service</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
