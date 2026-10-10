'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import {
  Package, Plus, Search, Filter, RefreshCw,
  Edit2, Trash2, CheckCircle2, AlertTriangle, Eye, DollarSign, Layers,
  Archive, RotateCcw, CheckSquare, Square, Download, X, Star, Image as ImageIcon
} from 'lucide-react';
import { fastFetch, invalidateFastCache } from '@/lib/fastFetch';

interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  discountPrice?: number | null;
  stock: number;
  condition: string;
  warrantyPeriodMonths: number;
  shortDescription?: string | null;
  description?: string | null;
  images: string[] | string;
  isFeatured: boolean;
  isActive: boolean;
  category?: { id: string; name: string; slug: string };
  brand?: { id: string; name: string; slug: string };
  createdAt: string;
}

export default function AdminProductsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // Selection for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Form state
  const [form, setForm] = useState({
    name: '',
    categorySlug: '',
    brandName: '',
    price: 3500,
    salePrice: '',
    sku: '',
    stockQuantity: 10,
    warrantyMonths: 12,
    shortDescription: '',
    condition: 'NEW',
    images: '/logo.png',
    isFeatured: false,
    isActive: true,
  });

  const loadProducts = async (forceRefresh = false) => {
    if (products.length === 0) setLoading(true);
    try {
      const data = await fastFetch('/api/v1/products', { forceRefresh });
      if (data) {
        setProducts(data.products || []);
        setCategories(data.categories || []);
        setBrands(data.brands || []);
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
    loadProducts();
  }, []);

  const handleOpenAdd = () => {
    setForm({
      name: '',
      categorySlug: categories[0]?.slug || '',
      brandName: brands[0]?.name || 'NEED ELECTRO',
      price: 1500,
      salePrice: '',
      sku: `NE-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      stockQuantity: 10,
      warrantyMonths: 12,
      shortDescription: '',
      condition: 'NEW',
      images: '/logo.png',
      isFeatured: false,
      isActive: true,
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setForm({
      name: p.name,
      categorySlug: p.category?.slug || '',
      brandName: p.brand?.name || '',
      price: p.price,
      salePrice: p.discountPrice ? String(p.discountPrice) : '',
      sku: p.sku,
      stockQuantity: p.stock,
      warrantyMonths: p.warrantyPeriodMonths || 12,
      shortDescription: p.shortDescription || '',
      condition: p.condition || 'NEW',
      images: Array.isArray(p.images) ? p.images[0] : (p.images || '/logo.png'),
      isFeatured: p.isFeatured,
      isActive: p.isActive,
    });
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      if (editingProduct) {
        // PATCH
        const res = await fetch('/api/v1/products', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingProduct.id,
            name: form.name,
            price: Number(form.price),
            discountPrice: form.salePrice ? Number(form.salePrice) : null,
            stock: Number(form.stockQuantity),
            sku: form.sku,
            condition: form.condition,
            warrantyPeriodMonths: Number(form.warrantyMonths),
            shortDescription: form.shortDescription,
            images: form.images,
            isFeatured: form.isFeatured,
            isActive: form.isActive,
          }),
        });
        if (res.ok) {
          setMessage('Product updated successfully!');
          setEditingProduct(null);
          invalidateFastCache('/api/v1/products');
          loadProducts(true);
        } else {
          setMessage('Failed to update product.');
        }
      } else {
        // CREATE
        const res = await fetch('/api/v1/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          setMessage('Product added successfully!');
          setShowAddModal(false);
          invalidateFastCache('/api/v1/products');
          loadProducts(true);
        } else {
          setMessage('Failed to create product.');
        }
      }
    } catch {
      setMessage('Network error while saving product.');
    } finally {
      setSaving(false);
    }
  };

  const handleArchiveOrDelete = async (id: string, permanent = false) => {
    const actionText = permanent ? 'permanently delete' : 'archive';
    if (!confirm(`Are you sure you want to ${actionText} this product?`)) return;

    try {
      const res = await fetch(`/api/v1/products?id=${id}${permanent ? '&permanent=true' : ''}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'Operation successful.');
        invalidateFastCache('/api/v1/products');
        loadProducts(true);
      } else {
        alert(data.error || 'Failed to remove product.');
      }
    } catch {
      alert('Network error.');
    }
  };

  const handleBulkAction = async (action: 'ACTIVATE' | 'DEACTIVATE' | 'ARCHIVE') => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Apply ${action} to ${selectedIds.length} selected product(s)?`)) return;

    setSaving(true);
    try {
      await Promise.all(
        selectedIds.map((id) =>
          fetch('/api/v1/products', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id,
              isActive: action === 'ACTIVATE',
            }),
          })
        )
      );
      setSelectedIds([]);
      invalidateFastCache('/api/v1/products');
      loadProducts(true);
    } catch {
      alert('Bulk operation failed');
    } finally {
      setSaving(false);
    }
  };

  const exportSelectedCsv = () => {
    const listToExport = selectedIds.length > 0
      ? products.filter((p) => selectedIds.includes(p.id))
      : filteredProducts;

    let csv = 'data:text/csv;charset=utf-8,ID,SKU,Name,Category,Brand,Price,SalePrice,Stock,Status\n';
    listToExport.forEach((p) => {
      csv += `"${p.id}","${p.sku}","${p.name}","${p.category?.name || ''}","${p.brand?.name || ''}",${p.price},${p.discountPrice || ''},${p.stock},"${p.isActive ? 'Active' : 'Archived'}"\n`;
    });

    const encoded = encodeURI(csv);
    const link = document.createElement('a');
    link.href = encoded;
    link.download = `products_export_${new Date().toISOString().substring(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase());
    const matchesCat = !selectedCategory || p.category?.slug === selectedCategory;
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && p.isActive) ||
      (statusFilter === 'ARCHIVED' && !p.isActive);

    return matchesSearch && matchesCat && matchesStatus;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map((p) => p.id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Package className="w-7 h-7 text-[#008CFF]" />
            Complete Product Catalog Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Create, edit prices, update specifications, feature on homepage, manage stock, and archive products.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportSelectedCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition shadow-sm"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            Export CSV
          </button>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#008CFF] text-white rounded-lg text-xs font-bold hover:bg-blue-600 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add New Product
          </button>
          <button
            onClick={() => loadProducts(true)}
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
          <p className="text-xs font-medium text-slate-500">Total SKUs</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{products.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-sm">
          <p className="text-xs font-medium text-emerald-700">Active Online</p>
          <p className="text-2xl font-bold text-emerald-800 mt-1">
            {products.filter((p) => p.isActive).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-sm">
          <p className="text-xs font-medium text-amber-700">Featured on Home</p>
          <p className="text-2xl font-bold text-amber-800 mt-1">
            {products.filter((p) => p.isFeatured).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Archived Products</p>
          <p className="text-2xl font-bold text-slate-600 mt-1">
            {products.filter((p) => !p.isActive).length}
          </p>
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
            placeholder="Search products by title, model, or SKU..."
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
            <option value="ACTIVE">Active Only</option>
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

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl flex items-center justify-between text-xs animate-in fade-in">
          <span className="font-bold text-blue-900">
            {selectedIds.length} product(s) selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkAction('ACTIVATE')}
              className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700"
            >
              Set Active
            </button>
            <button
              onClick={() => handleBulkAction('DEACTIVATE')}
              className="px-3 py-1.5 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-700"
            >
              Set Inactive
            </button>
            <button
              onClick={() => handleBulkAction('ARCHIVE')}
              className="px-3 py-1.5 bg-slate-700 text-white rounded-lg font-bold hover:bg-slate-800"
            >
              Archive
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="px-2 py-1.5 text-slate-500 hover:text-slate-800 font-semibold"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 w-8">
                  <button onClick={toggleSelectAll}>
                    {selectedIds.length > 0 && selectedIds.length === filteredProducts.length ? (
                      <CheckSquare className="w-4 h-4 text-[#008CFF]" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3">Product Name & SKU</th>
                <th className="px-4 py-3">Category / Brand</th>
                <th className="px-4 py-3">Pricing (BDT)</th>
                <th className="px-4 py-3">Inventory</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#008CFF]" />
                    Loading catalog...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No products found matching filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isSelected = selectedIds.includes(p.id);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedIds([...selectedIds, p.id]);
                            else setSelectedIds(selectedIds.filter((id) => id !== p.id));
                          }}
                          className="rounded text-[#008CFF]"
                        />
                      </td>
                      <td className="px-4 py-3.5 max-w-xs">
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          {p.name}
                          {p.isFeatured && (
                            <span title="Featured"><Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /></span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 font-mono mt-0.5">SKU: {p.sku}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="text-xs font-semibold text-slate-800">{p.category?.name || 'General'}</div>
                        <div className="text-xs text-slate-400">{p.brand?.name || 'Brand'}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900">৳{p.price.toLocaleString()}</div>
                        {p.discountPrice && (
                          <div className="text-xs text-emerald-600 line-through">
                            ৳{p.discountPrice.toLocaleString()}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`font-semibold text-xs px-2 py-0.5 rounded ${
                            p.stock <= 0
                              ? 'bg-rose-50 text-rose-700'
                              : p.stock <= 5
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {p.stock} units
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${
                            p.isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}
                        >
                          {p.isActive ? 'Active' : 'Archived'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap space-x-1">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleArchiveOrDelete(p.id, false)}
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                          title="Archive / Hide"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleArchiveOrDelete(p.id, true)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {(showAddModal || editingProduct) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">
                {editingProduct ? `Edit Product: ${editingProduct.name}` : 'Add New Product to Store'}
              </h2>
              <button
                onClick={() => { setShowAddModal(false); setEditingProduct(null); }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Dahua 2MP Full Color Bullet Camera"
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Brand Name *</label>
                  <input
                    type="text"
                    required
                    value={form.brandName}
                    onChange={(e) => setForm({ ...form, brandName: e.target.value })}
                    placeholder="e.g. Dahua, Hikvision, Dell"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Price (৳ BDT) *</label>
                  <input
                    type="number"
                    required
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Sale Discount (৳)</label>
                  <input
                    type="number"
                    value={form.salePrice}
                    onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
                    placeholder="Optional"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    value={form.stockQuantity}
                    onChange={(e) => setForm({ ...form, stockQuantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">SKU / Model *</label>
                  <input
                    type="text"
                    required
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Condition</label>
                  <select
                    value={form.condition}
                    onChange={(e) => setForm({ ...form, condition: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  >
                    <option value="NEW">Brand New</option>
                    <option value="REFURBISHED">Refurbished</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Warranty (Months)</label>
                  <input
                    type="number"
                    value={form.warrantyMonths}
                    onChange={(e) => setForm({ ...form, warrantyMonths: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Image URL</label>
                <input
                  type="text"
                  value={form.images}
                  onChange={(e) => setForm({ ...form, images: e.target.value })}
                  placeholder="/logo.png or https://..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Short Description</label>
                <textarea
                  rows={2}
                  value={form.shortDescription}
                  onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                  placeholder="Key highlights and product overview..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                    className="rounded text-[#008CFF]"
                  />
                  Feature on Homepage
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="rounded text-[#008CFF]"
                  />
                  Active (Visible to Buyers)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setEditingProduct(null); }}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#008CFF] text-white rounded-lg text-sm font-bold hover:bg-blue-600 shadow-sm"
                >
                  {saving ? 'Saving...' : editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
