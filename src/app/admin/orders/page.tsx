'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShoppingBag, Search, Filter, RefreshCw, Printer,
  Eye, CheckCircle2, Clock, AlertTriangle, Truck,
  FileText, X, ArrowUpDown, ChevronDown
} from 'lucide-react';
import { fastFetch, invalidateFastCache } from '@/lib/fastFetch';

const STATUS_OPTIONS = [
  'PLACED',
  'PAYMENT_CONFIRMED',
  'PROCESSING',
  'PACKED',
  'SHIPPED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
];

const STATUS_COLORS: Record<string, string> = {
  PLACED: 'bg-amber-100 text-amber-800 border-amber-200',
  PAYMENT_CONFIRMED: 'bg-brand-100 text-brand-800 border-brand-200',
  PROCESSING: 'bg-blue-100 text-blue-800 border-blue-200',
  PACKED: 'bg-purple-100 text-purple-800 border-purple-200',
  SHIPPED: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  OUT_FOR_DELIVERY: 'bg-sky-100 text-sky-800 border-sky-200',
  DELIVERED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200',
  REFUNDED: 'bg-slate-100 text-slate-800 border-slate-200',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async (forceRefresh = false) => {
    if (orders.length === 0) setLoading(true);
    try {
      const data = await fastFetch('/api/v1/orders', { forceRefresh });
      if (data) {
        setOrders(data.orders || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setActionLoading(orderId);
    try {
      const res = await fetch(`/api/v1/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        invalidateFastCache('/api/v1/orders');
        await loadOrders(true);
        if (selectedOrder?.id === orderId) {
          setSelectedOrder((prev: any) => ({ ...prev, status: newStatus }));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
      o.customer?.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      o.customer?.user?.phone?.includes(search) ||
      o.deliveryAddress?.phone?.includes(search);

    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== 'CANCELLED' ? o.totalAmount : 0), 0);
  const pendingCount = orders.filter((o) => ['PLACED', 'PAYMENT_CONFIRMED', 'PROCESSING'].includes(o.status)).length;
  const deliveredCount = orders.filter((o) => o.status === 'DELIVERED').length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* 1. Header & Summary Cards */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full">
            Commerce Operations
          </span>
          <h1 className="text-2xl font-black text-slate-950 mt-1 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-brand-500" />
            Order Management &amp; Invoicing
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track customer orders, verify online transactions, assign courier dispatch, and generate invoices.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => loadOrders(true)}
            className="p-2.5 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
            title="Refresh Orders"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Total Orders</span>
          <div className="text-2xl font-black text-slate-950 mt-1">{orders.length}</div>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-amber-600">Pending Dispatch</span>
          <div className="text-2xl font-black text-amber-700 mt-1">{pendingCount}</div>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-emerald-600">Delivered</span>
          <div className="text-2xl font-black text-emerald-700 mt-1">{deliveredCount}</div>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Total BDT Volume</span>
          <div className="text-2xl font-black text-slate-950 mt-1">৳{totalRevenue.toLocaleString()}</div>
        </div>
      </div>

      {/* 2. Filters & Search */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3 justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Order #, Customer, Phone..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none text-xs">
            {['ALL', 'PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
                  statusFilter === st
                    ? 'bg-slate-950 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">No orders matching your criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-black tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Total (BDT)</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-black text-slate-900">{o.orderNumber}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{o.customer?.user?.name || o.deliveryAddress?.recipientName || 'Customer'}</div>
                      <div className="text-[11px] text-slate-400">{o.deliveryAddress?.phone || o.customer?.user?.phone || 'No phone'}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {o.items?.length || 0} items
                    </td>
                    <td className="py-3 px-4 font-extrabold text-slate-950">৳{o.totalAmount?.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-700">{o.paymentMethod}</div>
                      <span className={`inline-block text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${o.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                        {o.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={o.status}
                        disabled={actionLoading === o.id}
                        onChange={(e) => handleStatusChange(o.id, e.target.value)}
                        className={`text-[11px] font-bold rounded-xl px-2.5 py-1 border transition cursor-pointer ${STATUS_COLORS[o.status] || 'bg-slate-100 text-slate-800'}`}
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {new Date(o.createdAt).toLocaleDateString('en-GB')}
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5">
                      <button
                        onClick={() => { setSelectedOrder(o); setShowInvoiceModal(true); }}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition"
                        title="Print Invoice"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. OFFICIAL INVOICE MODAL */}
      {showInvoiceModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Tax Invoice &bull; NEED ELECTRO</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" /> Print
                </button>
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Invoice Body */}
            <div id="printable-invoice" className="space-y-6 text-slate-900">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-black text-slate-950">NEED ELECTRO</h2>
                  <p className="text-xs text-slate-500">A Sister Concern of Amdads Group</p>
                  <p className="text-xs text-slate-500">Shop #5, MR Plaza, Kusumbag, Moulvibazar</p>
                  <p className="text-xs text-slate-500">Hotline: 01733 983752 &bull; needelectro23@gmail.com</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-brand-600">{selectedOrder.orderNumber}</span>
                  <p className="text-xs text-slate-500">Date: {new Date(selectedOrder.createdAt).toLocaleDateString('en-GB')}</p>
                  <span className={`inline-block text-[10px] font-black uppercase px-2 py-0.5 rounded-full mt-1 ${STATUS_COLORS[selectedOrder.status]}`}>
                    {selectedOrder.status}
                  </span>
                </div>
              </div>

              {/* Bill To */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <strong className="block text-slate-400 uppercase text-[10px] font-black mb-1">Customer Details</strong>
                  <p className="font-bold text-slate-900">{selectedOrder.customer?.user?.name || selectedOrder.deliveryAddress?.recipientName}</p>
                  <p className="text-slate-600">{selectedOrder.deliveryAddress?.phone || selectedOrder.customer?.user?.phone}</p>
                  <p className="text-slate-600">{selectedOrder.customer?.user?.email}</p>
                </div>
                <div>
                  <strong className="block text-slate-400 uppercase text-[10px] font-black mb-1">Delivery Address</strong>
                  <p className="text-slate-700">{selectedOrder.deliveryAddress?.addressLine || 'Shop Pickup'}</p>
                  <p className="text-slate-700">{selectedOrder.deliveryAddress?.area}, {selectedOrder.deliveryAddress?.district}</p>
                  <p className="text-slate-500 mt-1">Payment Method: <strong>{selectedOrder.paymentMethod}</strong> ({selectedOrder.paymentStatus})</p>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left text-xs border border-slate-200 rounded-2xl overflow-hidden">
                <thead className="bg-slate-100 text-slate-600 font-bold">
                  <tr>
                    <th className="py-2.5 px-3">Item Description</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Unit Price</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedOrder.items?.map((item: any, i: number) => (
                    <tr key={i}>
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-slate-900">{item.product?.name || 'Product'}</span>
                        {item.serialNumber && <div className="text-[10px] text-slate-400">S/N: {item.serialNumber}</div>}
                      </td>
                      <td className="py-2.5 px-3 text-center font-semibold">{item.quantity}</td>
                      <td className="py-2.5 px-3 text-right">৳{item.unitPrice?.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right font-bold">৳{item.totalPrice?.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="flex justify-end text-xs">
                <div className="w-64 space-y-1.5">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span>৳{selectedOrder.subtotal?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Delivery Charge</span>
                    <span>৳{selectedOrder.deliveryCharge || 0}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount</span>
                      <span>-৳{selectedOrder.discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-black text-slate-950 pt-2 border-t border-slate-200 text-sm">
                    <span>Total Amount</span>
                    <span>৳{selectedOrder.totalAmount?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Footer Note */}
              <div className="pt-4 border-t border-slate-100 text-center text-[10px] text-slate-400">
                Thank you for choosing NEED ELECTRO. For warranty claim, please preserve this invoice and matching product serial number.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
