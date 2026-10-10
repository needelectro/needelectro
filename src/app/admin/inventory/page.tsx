'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Boxes, Search, Filter, RefreshCw, AlertTriangle,
  Plus, Minus, ArrowUpDown, History, ShieldAlert,
  X, CheckCircle2, TrendingUp, Package
} from 'lucide-react';

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');

  // Adjustment Modal
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [adjustQty, setAdjustQty] = useState<number>(1);
  const [adjustType, setAdjustType] = useState<'ADD' | 'REMOVE'>('ADD');
  const [adjustReason, setAdjustReason] = useState('PURCHASE');
  const [adjustNotes, setAdjustNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadInventory();
  }, [filter]);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/inventory?filter=${filter}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
        setMovements(data.movements || []);
        setStats(data.stats || null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setSaving(true);

    try {
      const changeQty = adjustType === 'ADD' ? Math.abs(adjustQty) : -Math.abs(adjustQty);
      const res = await fetch('/api/v1/admin/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct.id,
          changeQty,
          reason: adjustReason,
          notes: adjustNotes,
        }),
      });

      if (res.ok) {
        setShowAdjustModal(false);
        setAdjustQty(1);
        setAdjustNotes('');
        await loadInventory();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full">
            Warehouse &amp; Stock Operations
          </span>
          <h1 className="text-2xl font-black text-slate-950 mt-1 flex items-center gap-2">
            <Boxes className="w-6 h-6 text-brand-500" />
            Inventory &amp; Stock Movements
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor real-time warehouse stock levels, low-stock thresholds, and record stock adjustment audits.
          </p>
        </div>
        <button
          onClick={loadInventory}
          className="p-2.5 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition w-fit"
          title="Refresh Inventory"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Total Active SKUs</span>
          <div className="text-2xl font-black text-slate-950 mt-1">{stats?.totalSkus || 0}</div>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-amber-600">Low Stock (&le; 5 units)</span>
          <div className="text-2xl font-black text-amber-700 mt-1">{stats?.lowStockCount || 0}</div>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-red-600">Out of Stock (0 units)</span>
          <div className="text-2xl font-black text-red-700 mt-1">{stats?.outOfStockCount || 0}</div>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Total Stock Valuation</span>
          <div className="text-2xl font-black text-slate-950 mt-1">
            ৳{stats?.totalValuation?.toLocaleString() || 0}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Product name, SKU..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {(['all', 'low', 'out'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilter(mode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition uppercase ${
                filter === mode
                  ? 'bg-slate-950 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {mode === 'all' ? 'All Stock' : mode === 'low' ? 'Low Stock' : 'Out of Stock'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Stock Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-black text-sm text-slate-900">Current Stock Levels</h2>
          <span className="text-xs text-slate-400">{filteredProducts.length} items listed</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading stock levels...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-black tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4 text-center">Current Stock</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Stock Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredProducts.map((p) => {
                  const isOut = p.stock <= 0;
                  const isLow = p.stock > 0 && p.stock <= 5;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4 font-mono font-bold text-slate-700">{p.sku}</td>
                      <td className="py-3 px-4 font-bold text-slate-950 max-w-xs truncate">{p.name}</td>
                      <td className="py-3 px-4 text-slate-500">{p.category?.name || 'General'}</td>
                      <td className="py-3 px-4 font-extrabold text-slate-950">৳{p.price?.toLocaleString()}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block font-black text-sm px-2.5 py-0.5 rounded-full ${isOut ? 'bg-red-100 text-red-700' : isLow ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'}`}>
                          {p.stock}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {isOut ? (
                          <span className="text-[10px] font-black uppercase text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Out of Stock</span>
                        ) : isLow ? (
                          <span className="text-[10px] font-black uppercase text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Low Stock</span>
                        ) : (
                          <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Healthy</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => { setSelectedProduct(p); setShowAdjustModal(true); }}
                          className="px-3 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-xs transition shadow-2xs"
                        >
                          Adjust Stock
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stock Movement Audit Log */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-black text-sm text-slate-900 flex items-center gap-2">
            <History className="w-4 h-4 text-slate-500" />
            Recent Stock Movement Audit Trail
          </h2>
          <span className="text-xs text-slate-400">Latest 30 operations</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-black tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Date &amp; Time</th>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4 text-center">Change</th>
                <th className="py-3 px-4 text-center">Previous &rarr; New</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Admin Actor</th>
                <th className="py-3 px-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
              {movements.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-2.5 px-4 text-slate-400 font-mono text-[11px]">
                    {new Date(m.createdAt).toLocaleString('en-GB')}
                  </td>
                  <td className="py-2.5 px-4 font-bold text-slate-900">
                    {m.product?.name} <span className="font-mono text-slate-400 font-normal">({m.product?.sku})</span>
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <span className={`font-black text-xs ${m.changeQty > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {m.changeQty > 0 ? `+${m.changeQty}` : m.changeQty}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-center text-slate-500">
                    {m.previousStock} &rarr; <strong>{m.newStock}</strong>
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {m.reason}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-slate-800 font-semibold">{m.actorName || 'System'}</td>
                  <td className="py-2.5 px-4 text-slate-400 truncate max-w-xs">{m.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjustment Modal */}
      {showAdjustModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Stock Adjustment</span>
                <h3 className="font-black text-base text-slate-950 mt-0.5">{selectedProduct.name}</h3>
              </div>
              <button
                onClick={() => setShowAdjustModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl flex justify-between items-center">
                <span className="text-slate-600">Current Stock:</span>
                <strong className="text-sm font-black text-slate-900">{selectedProduct.stock} units</strong>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Adjustment Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustType('ADD')}
                    className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition ${
                      adjustType === 'ADD' ? 'bg-emerald-500 text-white border-emerald-500' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" /> Stock Addition
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType('REMOVE')}
                    className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition ${
                      adjustType === 'REMOVE' ? 'bg-red-500 text-white border-red-500' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Minus className="w-3.5 h-3.5" /> Stock Deduction
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Quantity</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(parseInt(e.target.value) || 1)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Reason</label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-hidden"
                >
                  <option value="PURCHASE">Supplier Purchase / Goods Received</option>
                  <option value="RETURN">Customer Return Restock</option>
                  <option value="DAMAGE">Damaged / Defective Write-off</option>
                  <option value="ADJUSTMENT">Physical Inventory Audit Adjustment</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Audit Notes</label>
                <textarea
                  rows={2}
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  placeholder="e.g. Supplier PO #4092 or physical shelf count correction"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-slate-950 text-white font-bold hover:bg-slate-800 transition disabled:opacity-50"
                >
                  {saving ? 'Recording...' : 'Commit Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
