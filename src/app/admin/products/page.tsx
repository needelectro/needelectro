'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import {
  Package, Plus, Search, Filter, RefreshCw,
  Edit2, Trash2, CheckCircle2, AlertTriangle, Eye, DollarSign, Layers,
  Archive, RotateCcw, CheckSquare, Square, Download, X, Star, Image as ImageIcon,
  UploadCloud, Check, FileText, Settings, Sparkles, Tag, Shield, ArrowUpRight
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

  // Modals & UI State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'basic' | 'images' | 'details' | 'visibility'>('basic');
  const [imageInput, setImageInput] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: '',
    categorySlug: '',
    brandName: '',
    price: '' as unknown as number,
    salePrice: '',
    sku: '',
    stockQuantity: 10,
    warrantyMonths: 12,
    shortDescription: '',
    description: '',
    specifications: '',
    deliveryInfo: 'Delivery within 24-48 hours in Moulvibazar. 3-5 days across Bangladesh.',
    condition: 'NEW',
    images: [] as string[],
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
    setMessage('');
    setErrorMessage('');
    setActiveTab('basic');
    setImageInput('');
    setForm({
      name: '',
      categorySlug: categories[0]?.slug || 'general',
      brandName: '',
      price: '' as any,
      salePrice: '',
      sku: `NE-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      stockQuantity: 10,
      warrantyMonths: 12,
      shortDescription: '',
      description: '',
      specifications: '',
      deliveryInfo: 'Delivery within 24-48 hours in Moulvibazar. 3-5 days across Bangladesh.',
      condition: 'NEW',
      images: ['/brand/needelectro-icon.png'],
      isFeatured: false,
      isActive: true,
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setMessage('');
    setErrorMessage('');
    setActiveTab('basic');
    setImageInput('');

    let productImages: string[] = [];
    if (Array.isArray(p.images)) {
      productImages = p.images;
    } else if (typeof p.images === 'string' && p.images.trim()) {
      productImages = p.images.split(',').map((s) => s.trim()).filter(Boolean);
    }
    if (productImages.length === 0) {
      productImages = ['/brand/needelectro-icon.png'];
    }

    setForm({
      name: p.name,
      categorySlug: p.category?.slug || categories[0]?.slug || '',
      brandName: p.brand?.name || '',
      price: p.price,
      salePrice: p.discountPrice ? String(p.discountPrice) : '',
      sku: p.sku,
      stockQuantity: p.stock,
      warrantyMonths: p.warrantyPeriodMonths !== undefined ? p.warrantyPeriodMonths : 12,
      shortDescription: p.shortDescription || '',
      description: p.description || p.shortDescription || '',
      specifications: '',
      deliveryInfo: 'Delivery within 24-48 hours in Moulvibazar. 3-5 days across Bangladesh.',
      condition: p.condition || 'NEW',
      images: productImages,
      isFeatured: Boolean(p.isFeatured),
      isActive: Boolean(p.isActive),
    });
  };

  const handleGenerateSku = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setForm((prev) => ({ ...prev, sku: `NE-${code}` }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    setErrorMessage('');

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/v1/uploads', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (res.ok && data.url) {
          setForm((prev) => ({
            ...prev,
            images: [
              ...prev.images.filter((img) => img !== '/brand/needelectro-icon.png' && img !== '/logo.png'),
              data.url,
            ],
          }));
        } else {
          setErrorMessage(data.error || 'Failed to upload image');
        }
      }
    } catch {
      setErrorMessage('Network error while uploading image.');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleAddImageUrl = () => {
    if (!imageInput.trim()) return;
    setForm((prev) => ({
      ...prev,
      images: [
        ...prev.images.filter((img) => img !== '/brand/needelectro-icon.png' && img !== '/logo.png'),
        imageInput.trim(),
      ],
    }));
    setImageInput('');
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleSetPrimaryImage = (indexToPrimary: number) => {
    setForm((prev) => {
      const selected = prev.images[indexToPrimary];
      const others = prev.images.filter((_, idx) => idx !== indexToPrimary);
      return {
        ...prev,
        images: [selected, ...others],
      };
    });
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setErrorMessage('');

    if (!form.name.trim()) {
      setErrorMessage('Product title is required.');
      setActiveTab('basic');
      setSaving(false);
      return;
    }
    if (form.price === undefined || form.price === null || (form.price as any) === '' || Number(form.price) <= 0) {
      setErrorMessage('Please enter a valid regular price.');
      setActiveTab('basic');
      setSaving(false);
      return;
    }

    try {
      const payload = {
        name: form.name.trim(),
        categorySlug: form.categorySlug,
        brandName: form.brandName.trim(),
        price: Number(form.price),
        salePrice: form.salePrice ? Number(form.salePrice) : null,
        stockQuantity: Number(form.stockQuantity || 0),
        sku: form.sku.trim().toUpperCase(),
        condition: form.condition,
        warrantyMonths: Number(form.warrantyMonths || 0),
        shortDescription: form.shortDescription,
        description: form.description || form.shortDescription,
        specifications: form.specifications,
        deliveryInfo: form.deliveryInfo,
        images: form.images.length > 0 ? form.images : ['/brand/needelectro-icon.png'],
        isFeatured: form.isFeatured,
        isActive: form.isActive,
      };

      if (editingProduct) {
        // PATCH
        const res = await fetch('/api/v1/products', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingProduct.id,
            ...payload,
          }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setMessage('Product updated successfully!');
          setEditingProduct(null);
          invalidateFastCache('/api/v1/products');
          loadProducts(true);
        } else {
          setErrorMessage(data.error || 'Failed to update product.');
        }
      } else {
        // CREATE
        const res = await fetch('/api/v1/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setMessage('Product created successfully!');
          setShowAddModal(false);
          invalidateFastCache('/api/v1/products');
          loadProducts(true);
        } else {
          setErrorMessage(data.error || 'Failed to create product.');
        }
      }
    } catch {
      setErrorMessage('Network error while saving product.');
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

      {/* Redesigned Add / Edit Product Modal */}
      {(showAddModal || editingProduct) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-brand-500/10 text-brand-600 flex items-center justify-center font-bold">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                    {editingProduct ? `Edit Product: ${editingProduct.name}` : 'Add New Product to Store'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {editingProduct ? 'Modify pricing, images, specifications, and visibility' : 'Fill in the details below to publish a product instantly'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setShowAddModal(false); setEditingProduct(null); }}
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
                onClick={() => setActiveTab('images')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'images'
                    ? 'border-brand-600 text-brand-600 bg-white rounded-t-lg shadow-xs'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Images &amp; Gallery</span>
                {form.images.length > 0 && (
                  <span className="px-1.5 py-0.2 bg-brand-100 text-brand-700 rounded-full text-[10px]">
                    {form.images.length}
                  </span>
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
                <span>Description &amp; Specs</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('visibility')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'visibility'
                    ? 'border-brand-600 text-brand-600 bg-white rounded-t-lg shadow-xs'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Inventory &amp; Status</span>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveProduct} className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* TAB 1: BASIC INFO & PRICING */}
              {activeTab === 'basic' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Product Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Dahua 2MP Full Color Bullet IP Camera (DH-IPC-HFW1239S1-A-LED)"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium"
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
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
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
                        Brand Name <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={form.brandName}
                          onChange={(e) => setForm({ ...form, brandName: e.target.value })}
                          placeholder="e.g. Dahua, Hikvision, Dell, HP, Schneider"
                          list="brand-suggestions"
                          className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                        />
                        <datalist id="brand-suggestions">
                          {brands.map((b) => (
                            <option key={b.id || b.slug} value={b.name} />
                          ))}
                        </datalist>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Regular Price (৳ BDT) <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">৳</span>
                        <input
                          type="number"
                          required
                          min={0}
                          value={form.price}
                          onChange={(e) => setForm({ ...form, price: e.target.value === '' ? ('' as any) : Number(e.target.value) })}
                          placeholder="e.g. 2500"
                          className="w-full pl-8 pr-3 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Sale / Offer Price (৳ BDT)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">৳</span>
                        <input
                          type="number"
                          min={0}
                          value={form.salePrice}
                          onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
                          placeholder="Optional discount"
                          className="w-full pl-8 pr-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                        />
                      </div>
                      <span className="text-[10px] text-slate-400">Leave blank if no discount</span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Initial Stock Quantity <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min={0}
                        value={form.stockQuantity}
                        onChange={(e) => setForm({ ...form, stockQuantity: Number(e.target.value) })}
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-700">
                          SKU / Model Number <span className="text-rose-500">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={handleGenerateSku}
                          className="text-[11px] text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Generate SKU</span>
                        </button>
                      </div>
                      <input
                        type="text"
                        required
                        value={form.sku}
                        onChange={(e) => setForm({ ...form, sku: e.target.value })}
                        placeholder="e.g. NE-CAM-2MP-01"
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Condition &amp; Warranty
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={form.condition}
                          onChange={(e) => setForm({ ...form, condition: e.target.value })}
                          className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-xs bg-white"
                        >
                          <option value="NEW">Brand New (Sealed)</option>
                          <option value="REFURBISHED">Certified Refurbished</option>
                        </select>
                        <select
                          value={form.warrantyMonths}
                          onChange={(e) => setForm({ ...form, warrantyMonths: Number(e.target.value) })}
                          className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-xs bg-white"
                        >
                          <option value={0}>No Warranty</option>
                          <option value={3}>3 Months Warranty</option>
                          <option value={6}>6 Months Warranty</option>
                          <option value={12}>1 Year Warranty</option>
                          <option value={24}>2 Years Warranty</option>
                          <option value={36}>3 Years Warranty</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: IMAGES & GALLERY */}
              {activeTab === 'images' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  {/* Upload Box */}
                  <div className="border-2 border-dashed border-slate-300 hover:border-brand-500 rounded-2xl p-6 text-center transition-all bg-slate-50/50">
                    <div className="w-12 h-12 rounded-full bg-brand-500/10 text-brand-600 flex items-center justify-center mx-auto mb-3">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-800">
                      Upload Product Photos Directly
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Drag &amp; drop or browse JPEG, PNG, or WebP files (Max 5MB each)
                    </p>

                    <label className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold cursor-pointer transition-colors shadow-sm">
                      <span>{uploadingImage ? 'Uploading Image...' : 'Choose Files to Upload'}</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        onChange={handleFileUpload}
                        disabled={uploadingImage}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Or add via image URL */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="url"
                      value={imageInput}
                      onChange={(e) => setImageInput(e.target.value)}
                      placeholder="Or paste external image URL (e.g. https://...)"
                      className="flex-1 px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                    >
                      Add URL
                    </button>
                  </div>

                  {/* Gallery Previews */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-700">
                        Product Gallery ({form.images.length} images)
                      </span>
                      <span className="text-[11px] text-slate-400">
                        First image serves as the primary thumbnail
                      </span>
                    </div>

                    {form.images.length === 0 ? (
                      <div className="text-center py-8 border border-slate-200 rounded-xl bg-slate-50 text-slate-400 text-xs">
                        No images added yet. Upload an image above or paste an image URL.
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {form.images.map((imgUrl, idx) => (
                          <div
                            key={idx}
                            className={`group relative rounded-xl border overflow-hidden bg-slate-100 p-1 flex flex-col justify-between ${
                              idx === 0 ? 'border-brand-500 ring-2 ring-brand-500/20' : 'border-slate-200'
                            }`}
                          >
                            <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-white flex items-center justify-center">
                              <img
                                src={imgUrl}
                                alt={`Preview ${idx}`}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/brand/needelectro-icon.png';
                                }}
                              />
                              {idx === 0 && (
                                <span className="absolute top-1.5 left-1.5 bg-brand-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                                  Primary
                                </span>
                              )}
                            </div>

                            <div className="flex items-center justify-between gap-1 pt-2 px-1">
                              {idx !== 0 ? (
                                <button
                                  type="button"
                                  onClick={() => handleSetPrimaryImage(idx)}
                                  className="text-[10px] text-brand-600 hover:underline font-semibold"
                                >
                                  Make Primary
                                </button>
                              ) : (
                                <span className="text-[10px] text-slate-400">Cover</span>
                              )}

                              <button
                                type="button"
                                onClick={() => handleRemoveImage(idx)}
                                className="text-slate-400 hover:text-rose-600 p-1 rounded transition"
                                title="Delete Image"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: DESCRIPTION & SPECIFICATIONS */}
              {activeTab === 'details' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Short Description / Highlights
                    </label>
                    <textarea
                      rows={2}
                      value={form.shortDescription}
                      onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                      placeholder="Brief summary visible on catalog cards and search listings..."
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Product Description
                    </label>
                    <textarea
                      rows={4}
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Comprehensive overview, included box accessories, safety features..."
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Technical Specifications (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={form.specifications}
                      onChange={(e) => setForm({ ...form, specifications: e.target.value })}
                      placeholder="e.g. Resolution: 1080p, Lens: 3.6mm, Night Vision: 20m Full Color, Power: 12V DC"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Delivery Information Note
                    </label>
                    <input
                      type="text"
                      value={form.deliveryInfo}
                      onChange={(e) => setForm({ ...form, deliveryInfo: e.target.value })}
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs"
                    />
                  </div>
                </div>
              )}

              {/* TAB 4: VISIBILITY & BADGES */}
              {activeTab === 'visibility' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.isFeatured}
                        onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                        className="w-4 h-4 mt-0.5 rounded text-brand-600 focus:ring-brand-500"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          <span>Feature on Homepage Showcase</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Display this product prominently on the home page top deals &amp; recommended hardware slider.
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
                            <span>Active in Store (Visible to Customers)</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            When disabled, the product is saved as draft and hidden from public search and store catalogs.
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
                  {activeTab === 'basic' && 'Step 1 of 4 • Pricing & Information'}
                  {activeTab === 'images' && 'Step 2 of 4 • Product Photos'}
                  {activeTab === 'details' && 'Step 3 of 4 • Descriptions & Specs'}
                  {activeTab === 'visibility' && 'Step 4 of 4 • Store Status'}
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => { setShowAddModal(false); setEditingProduct(null); }}
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
                      <span>Saving Product...</span>
                    ) : editingProduct ? (
                      <span>Save Changes</span>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Publish Product</span>
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
