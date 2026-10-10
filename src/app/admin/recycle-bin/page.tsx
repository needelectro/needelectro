'use client';

import React, { useState, useEffect } from 'react';
import { 
  Trash2, RotateCcw, AlertTriangle, ShieldCheck, RefreshCw, Search, 
  Package, Wrench, Image as ImageIcon, Tag, CheckCircle2, Lock, AlertCircle, X
} from 'lucide-react';

interface ArchivedItem {
  id: string;
  entityType: 'Product' | 'Service' | 'Banner' | 'Promotion';
  title: string;
  identifier: string;
  details: string;
  hasDependencies: boolean;
  dependencyNote: string | null;
  archivedAt: string;
}

export default function AdminRecycleBinPage() {
  const [items, setItems] = useState<ArchivedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal State for Permanent Delete
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    item: ArchivedItem | null;
  }>({ isOpen: false, item: null });

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/recycle-bin');
      const data = await res.json();
      if (data.success && data.items) {
        setItems(data.items);
      }
    } catch (err) {
      console.error('Failed to load recycle bin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleRestore = async (item: ArchivedItem) => {
    setActionLoading(item.id);
    try {
      const res = await fetch('/api/v1/admin/recycle-bin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'RESTORE',
          entityType: item.entityType,
          id: item.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNotification({ type: 'success', message: `${item.title} has been restored to the live store.` });
        setItems((prev) => prev.filter((i) => i.id !== item.id));
      } else {
        setNotification({ type: 'error', message: data.error || 'Failed to restore item.' });
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Network error restoring item.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handlePermanentDelete = async () => {
    if (!confirmModal.item) return;
    const item = confirmModal.item;
    setActionLoading(item.id);
    setConfirmModal({ isOpen: false, item: null });

    try {
      const res = await fetch('/api/v1/admin/recycle-bin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'PERMANENT_DELETE',
          entityType: item.entityType,
          id: item.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNotification({ type: 'success', message: `${item.title} was permanently deleted.` });
        setItems((prev) => prev.filter((i) => i.id !== item.id));
      } else {
        setNotification({ type: 'error', message: data.error || 'Failed to permanently delete item.' });
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Network error executing permanent delete.' });
    } finally {
      setActionLoading(null);
    }
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesType = selectedType === 'ALL' || item.entityType.toUpperCase() === selectedType;
    const matchesSearch = 
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.identifier.toLowerCase().includes(search.toLowerCase()) ||
      item.details.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  const productCount = items.filter((i) => i.entityType === 'Product').length;
  const serviceCount = items.filter((i) => i.entityType === 'Service').length;
  const bannerCount = items.filter((i) => i.entityType === 'Banner').length;
  const promoCount = items.filter((i) => i.entityType === 'Promotion').length;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Product':
        return <Package className="w-4 h-4 text-blue-600" />;
      case 'Service':
        return <Wrench className="w-4 h-4 text-emerald-600" />;
      case 'Banner':
        return <ImageIcon className="w-4 h-4 text-purple-600" />;
      case 'Promotion':
        return <Tag className="w-4 h-4 text-amber-600" />;
      default:
        return <Trash2 className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'Product':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Service':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Banner':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Promotion':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-red-50 text-red-600 rounded-lg">
              <Trash2 className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-bold text-[#002B5B]">Recycle Bin & Safe Recovery</h1>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            Enterprise 3-Level Deletion: Review archived records, restore them to active catalog, or permanently wipe non-dependent data.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchItems}
            className="flex items-center gap-2 px-3.5 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between gap-3 text-sm font-medium ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Archived Products</p>
            <h3 className="text-2xl font-bold text-[#002B5B] mt-1">{productCount}</h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Inactive Services</p>
            <h3 className="text-2xl font-bold text-[#002B5B] mt-1">{serviceCount}</h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Wrench className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Archived Banners</p>
            <h3 className="text-2xl font-bold text-[#002B5B] mt-1">{bannerCount}</h3>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <ImageIcon className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Expired / Disabled Coupons</p>
            <h3 className="text-2xl font-bold text-[#002B5B] mt-1">{promoCount}</h3>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Tag className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Safety Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-amber-700 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-amber-900 leading-relaxed">
          <strong className="font-semibold text-amber-950">Financial & Audit Integrity Rule:</strong> Records with historical customer transactions, order invoices, or service bookings are strictly locked against permanent deletion to maintain auditing compliance. They can only be archived or safely restored.
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Type Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'ALL', label: 'All Items', count: items.length },
            { id: 'PRODUCT', label: 'Products', count: productCount },
            { id: 'SERVICE', label: 'Services', count: serviceCount },
            { id: 'BANNER', label: 'Banners', count: bannerCount },
            { id: 'PROMOTION', label: 'Coupons', count: promoCount },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedType(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                selectedType === tab.id
                  ? 'bg-[#002B5B] text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                selectedType === tab.id ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search archived records..."
            className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#008CFF] focus:border-transparent"
          />
        </div>
      </div>

      {/* Main Records Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#008CFF] mb-3" />
            <p className="text-sm font-medium">Loading archived records from database...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500 mb-3" />
            <h3 className="text-base font-semibold text-gray-800">Recycle Bin is Clean</h3>
            <p className="text-sm text-gray-500 mt-1">
              No archived or soft-deleted records matching your criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Entity Type</th>
                  <th className="py-3 px-4">Record Title & Identifier</th>
                  <th className="py-3 px-4">Details / Pricing</th>
                  <th className="py-3 px-4">Archived At</th>
                  <th className="py-3 px-4">Audit Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredItems.map((item) => (
                  <tr key={`${item.entityType}-${item.id}`} className="hover:bg-gray-50/60 transition">
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getTypeBadgeClass(item.entityType)}`}>
                        {getTypeIcon(item.entityType)}
                        {item.entityType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-gray-900">{item.title}</div>
                      <div className="text-xs text-gray-500 font-mono mt-0.5">{item.identifier}</div>
                    </td>
                    <td className="py-3.5 px-4 text-gray-700">
                      {item.details}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gray-500">
                      {new Date(item.archivedAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4">
                      {item.hasDependencies ? (
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200" title={item.dependencyNote || ''}>
                          <Lock className="w-3.5 h-3.5 text-amber-600" />
                          <span>Protected (Orders Logged)</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">
                          <span>Wipe Eligible</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Restore Button */}
                        <button
                          onClick={() => handleRestore(item)}
                          disabled={actionLoading === item.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#008CFF] hover:bg-blue-600 text-white rounded-lg text-xs font-semibold shadow-sm transition disabled:opacity-50"
                        >
                          <RotateCcw className={`w-3.5 h-3.5 ${actionLoading === item.id ? 'animate-spin' : ''}`} />
                          Restore
                        </button>

                        {/* Permanent Delete Button */}
                        {item.hasDependencies ? (
                          <button
                            disabled
                            className="p-1.5 text-gray-300 rounded-lg cursor-not-allowed"
                            title="Cannot delete permanently due to existing audit or transaction records."
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => setConfirmModal({ isOpen: true, item })}
                            disabled={actionLoading === item.id}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Permanently Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Permanent Delete */}
      {confirmModal.isOpen && confirmModal.item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <div className="p-3 bg-red-100 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Permanent Wipe Confirmation</h3>
                <p className="text-xs text-red-600 font-semibold uppercase tracking-wider">Level 3 Action: Irreversible</p>
              </div>
            </div>

            <div className="space-y-3 text-sm text-gray-600 bg-gray-50 p-3.5 rounded-xl border border-gray-200">
              <div>
                <span className="font-semibold text-gray-900">Entity:</span> {confirmModal.item.entityType}
              </div>
              <div>
                <span className="font-semibold text-gray-900">Title:</span> {confirmModal.item.title}
              </div>
              <div>
                <span className="font-semibold text-gray-900">Details:</span> {confirmModal.item.details}
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-4 leading-relaxed">
              This will completely remove the record from the database. Because this item has no connected orders or financial entries, it is safe to purge. This cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setConfirmModal({ isOpen: false, item: null })}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePermanentDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold shadow-sm transition"
              >
                Confirm Permanent Wipe
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
