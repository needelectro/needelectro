'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import { 
  Package, 
  Search, 
  Truck, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ChevronRight, 
  ArrowRight, 
  ShoppingBag, 
  User, 
  ShieldCheck,
  RefreshCw,
  FileText
} from 'lucide-react';

const ORDER_STEPS = [
  { key: 'PLACED', label: 'Order Placed' },
  { key: 'PAYMENT_CONFIRMED', label: 'Confirmed' },
  { key: 'PROCESSING', label: 'Processing' },
  { key: 'SHIPPED', label: 'Shipped' },
  { key: 'DELIVERED', label: 'Delivered' },
];

function getStepIndex(status: string): number {
  switch (status) {
    case 'PLACED': return 0;
    case 'PAYMENT_CONFIRMED': return 1;
    case 'PROCESSING':
    case 'PACKED': return 2;
    case 'SHIPPED':
    case 'OUT_FOR_DELIVERY': return 3;
    case 'DELIVERED': return 4;
    default: return 0;
  }
}

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Guest Tracking States
  const [trackOrderNumber, setTrackOrderNumber] = useState('');
  const [trackPhone, setTrackPhone] = useState('');
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackedOrder, setTrackedOrder] = useState<any | null>(null);
  const [trackError, setTrackError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserOrders();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchUserOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Error fetching user orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackOrderNumber.trim()) return;

    setTrackingLoading(true);
    setTrackError(null);
    setTrackedOrder(null);

    try {
      let url = `/api/v1/orders/track?orderNumber=${encodeURIComponent(trackOrderNumber.trim())}`;
      if (trackPhone.trim()) {
        url += `&phone=${encodeURIComponent(trackPhone.trim())}`;
      }
      const res = await fetch(url);
      const data = await res.json();

      if (res.ok && data.success) {
        setTrackedOrder(data.order);
      } else {
        setTrackError(data.error || 'No matching order found. Please verify your order number and phone.');
      }
    } catch {
      setTrackError('Network error while looking up order. Please try again.');
    } finally {
      setTrackingLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 md:p-10 relative overflow-hidden shadow-xl border border-white/10">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/20 blur-3xl rounded-full pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-bold text-brand-300 border border-white/15">
            <Package className="w-3.5 h-3.5" />
            Order Management &amp; Tracking
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Track Orders &amp; Delivery Status
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Monitor real-time courier dispatch across all 64 districts in Bangladesh with verified digital warranty tracking.
          </p>
        </div>
      </div>

      {/* Guest Tracking Form */}
      <div className="card-premium p-5 sm:p-7 rounded-3xl space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-600 flex items-center justify-center font-bold">
            <Search className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900">Instant Order Lookup</h2>
            <p className="text-[11px] text-slate-500">Track any order with your order number and mobile number</p>
          </div>
        </div>

        <form onSubmit={handleTrackSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              Order Number *
            </label>
            <input
              type="text"
              placeholder="e.g. ORD20261016..."
              value={trackOrderNumber}
              onChange={(e) => setTrackOrderNumber(e.target.value)}
              required
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-brand-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              Recipient Phone (Optional)
            </label>
            <input
              type="tel"
              placeholder="e.g. 01733983752"
              value={trackPhone}
              onChange={(e) => setTrackPhone(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-brand-500"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={trackingLoading || !trackOrderNumber.trim()}
              className="btn-primary w-full text-xs py-2.5 justify-center disabled:opacity-50"
            >
              {trackingLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  Tracking...
                </>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5 mr-1.5" />
                  Track Order
                </>
              )}
            </button>
          </div>
        </form>

        {trackError && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{trackError}</span>
          </div>
        )}

        {/* Tracked Order Result Card */}
        {trackedOrder && (
          <div className="mt-4 p-5 rounded-2xl bg-brand-50/40 border border-brand-200/80 space-y-4 animate-in fade-in">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-brand-600 uppercase">Found Order</span>
                <h3 className="text-sm font-black text-slate-900">{trackedOrder.orderNumber}</h3>
                <p className="text-[11px] text-slate-500">
                  Placed on {new Date(trackedOrder.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <div className="text-right">
                <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-brand-500 text-white shadow-xs">
                  {trackedOrder.status.replace(/_/g, ' ')}
                </span>
                <p className="text-xs font-black text-slate-900 mt-1">৳{trackedOrder.totalAmount?.toLocaleString('en-BD')}</p>
              </div>
            </div>

            {/* Step progress */}
            <div className="grid grid-cols-5 gap-1 text-center py-2">
              {ORDER_STEPS.map((step, idx) => {
                const currentIdx = getStepIndex(trackedOrder.status);
                const isPassed = idx <= currentIdx;
                const isCurrent = idx === currentIdx;

                return (
                  <div key={step.key} className="space-y-1">
                    <div
                      className={`h-1.5 rounded-full ${
                        isPassed ? 'bg-brand-500' : 'bg-slate-200'
                      }`}
                    />
                    <p className={`text-[10px] font-bold ${isCurrent ? 'text-brand-600' : isPassed ? 'text-slate-800' : 'text-slate-400'}`}>
                      {step.label}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Items Summary */}
            <div className="space-y-2 pt-2 border-t border-brand-100">
              <h4 className="text-xs font-bold text-slate-800">Items in this shipment:</h4>
              <div className="divide-y divide-brand-100/60">
                {trackedOrder.items.map((item: any) => (
                  <div key={item.id} className="py-2 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{item.product?.name || 'Technology Item'}</p>
                      <p className="text-[11px] text-slate-500">Qty: {item.quantity} &times; ৳{item.unitPrice?.toLocaleString('en-BD')}</p>
                    </div>
                    <span className="font-bold text-slate-900">৳{item.totalPrice?.toLocaleString('en-BD')}</span>
                  </div>
                ))}
              </div>
            </div>

            {trackedOrder.deliveryAddress && (
              <div className="text-xs text-slate-600 bg-white/80 p-3 rounded-xl border border-brand-100">
                <strong className="text-slate-800">Destination:</strong> {trackedOrder.deliveryAddress.area}, {trackedOrder.deliveryAddress.district}, {trackedOrder.deliveryAddress.division}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Customer Orders (Logged In) */}
      {user ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-brand-600" />
              Your Order History ({orders.length})
            </h2>
            <Link
              href="/customer/dashboard"
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              Customer Portal
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-brand-500" />
              <p className="text-xs">Loading your orders...</p>
            </div>
          ) : orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((ord) => {
                const currentIdx = getStepIndex(ord.status);

                return (
                  <div
                    key={ord.id}
                    className="card-premium p-5 sm:p-6 rounded-3xl space-y-4 hover:shadow-md transition"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-brand-600">
                          {ord.orderNumber}
                        </span>
                        <p className="text-[11px] text-slate-400">
                          {new Date(ord.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-brand-50 text-brand-700 border border-brand-200/60">
                          {ord.status.replace(/_/g, ' ')}
                        </span>
                        <strong className="text-sm font-black text-slate-900">
                          ৳{ord.totalAmount.toLocaleString('en-BD')}
                        </strong>
                      </div>
                    </div>

                    {/* Stepper */}
                    <div className="grid grid-cols-5 gap-1.5 text-center">
                      {ORDER_STEPS.map((step, idx) => {
                        const isPassed = idx <= currentIdx;
                        const isCurrent = idx === currentIdx;

                        return (
                          <div key={step.key} className="space-y-1">
                            <div
                              className={`h-1.5 rounded-full ${
                                isPassed ? 'bg-brand-500' : 'bg-slate-200'
                              }`}
                            />
                            <p className={`text-[10px] font-bold line-clamp-1 ${isCurrent ? 'text-brand-600' : isPassed ? 'text-slate-800' : 'text-slate-400'}`}>
                              {step.label}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    {/* Order items list */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      {ord.items?.map((item: any) => (
                        <div key={item.id} className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-800 line-clamp-1 max-w-xs sm:max-w-md">
                            {item.product?.name || 'Product'} &times; {item.quantity}
                          </span>
                          <span className="font-bold text-slate-900 shrink-0">
                            ৳{item.totalPrice.toLocaleString('en-BD')}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-brand-600" />
                        <span>Delivery: {ord.deliveryAddress?.district || 'Bangladesh'}</span>
                      </div>
                      <Link
                        href="/customer/dashboard"
                        className="font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                      >
                        Full Order Details
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="card-premium p-10 rounded-3xl text-center space-y-3">
              <Package className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-700">No Orders Placed Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Explore laptops, surveillance cameras, and electrical equipment to place your first order.
              </p>
              <Link href="/shop" className="btn-primary text-xs py-2 px-5 inline-flex">
                Browse Marketplace
              </Link>
            </div>
          )}
        </section>
      ) : (
        /* Guest prompt to login for saved history */
        <div className="card-premium p-6 sm:p-8 rounded-3xl text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
            <User className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-slate-900">Have a Customer Account?</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Sign in to automatically view all your previous orders, real-time tracking, digital warranty status, and download invoices.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              href="/customer/login?redirect=/orders"
              className="btn-primary text-xs py-2.5 px-5"
            >
              Sign In to Your Account
            </Link>
            <Link
              href="/customer/register"
              className="btn-secondary text-xs py-2.5 px-5"
            >
              Create Account
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
