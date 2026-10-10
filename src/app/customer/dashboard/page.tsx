'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard, ShoppingBag, Wrench, Shield, LifeBuoy, LogOut,
  User, ChevronRight, Package, Clock, CheckCircle2, AlertCircle,
  Star, Bell, Settings, ArrowRight, Zap
} from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  CONFIRMED: 'bg-brand-100 text-brand-700',
  IN_PROGRESS: 'bg-purple-100 text-purple-700',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
  CLOSED: 'bg-slate-100 text-slate-600',
  CANCELLED: 'bg-red-100 text-red-600',
  DELIVERED: 'bg-emerald-100 text-emerald-700',
  PROCESSING: 'bg-brand-100 text-brand-700',
};

type TabKey = 'overview' | 'bookings' | 'orders' | 'warranty' | 'support';

export default function CustomerDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [bookings, setBookings] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [warranties, setWarranties] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push('/auth/login?redirect=/customer/dashboard'); return; }
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bRes, oRes, wRes, tRes] = await Promise.all([
        fetch('/api/v1/bookings'),
        fetch('/api/v1/orders'),
        fetch('/api/v1/warranty'),
        fetch('/api/v1/support'),
      ]);
      if (bRes.ok) { const d = await bRes.json(); setBookings(d.bookings || []); }
      if (oRes.ok) { const d = await oRes.json(); setOrders(d.orders || []); }
      if (wRes.ok) { const d = await wRes.json(); setWarranties(d.warranties || []); }
      if (tRes.ok) { const d = await tRes.json(); setTickets(d.tickets || []); }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (!user) return null;

  const activeBookings = bookings.filter((b) => !['CLOSED', 'CANCELLED'].includes(b.status));
  const pendingOrders = orders.filter((o) => !['DELIVERED', 'CANCELLED'].includes(o.status));
  const openTickets = tickets.filter((t) => t.status === 'OPEN');

  interface NavTabItem {
    key: TabKey;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }

  const NAV_TABS: NavTabItem[] = [
    { key: 'overview', label: 'Overview', icon: LayoutDashboard },
    { key: 'bookings', label: 'Bookings', icon: Wrench, badge: activeBookings.length },
    { key: 'orders', label: 'Orders', icon: Package, badge: pendingOrders.length },
    { key: 'warranty', label: 'Warranty', icon: Shield },
    { key: 'support', label: 'Support', icon: LifeBuoy, badge: openTickets.length },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="lg:w-64 space-y-4 shrink-0">
          <Link href="/" className="flex items-center gap-2.5 px-3 py-2 rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 shadow-xs group hover:bg-white transition" title="Return to Website">
            <Image
              src="/brand/needelectro-icon.png"
              alt="NEED ELECTRO"
              width={32}
              height={32}
              className="w-8 h-8 object-contain group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col">
              <span className="font-extrabold text-sm tracking-tight text-slate-900 leading-none">NEED <span className="text-brand-500">ELECTRO</span></span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Customer Portal</span>
            </div>
          </Link>

          {/* Profile Card - Frosted Glass Gradient */}
          <div className="bg-gradient-to-br from-brand-600/95 to-brand-700/95 backdrop-blur-2xl rounded-3xl p-5 text-white space-y-3 border border-white/20 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-400/20 blur-2xl rounded-full pointer-events-none" />
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-xl font-black shadow-inner">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-black text-sm">{user.name}</p>
              <p className="text-xs text-brand-200">{user.email}</p>
              <span className="inline-block mt-1.5 text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-sm rounded-full px-2.5 py-0.5 border border-white/25">
                {user.role}
              </span>
            </div>
          </div>

          {/* Nav - Frosted Glass Container */}
          <nav className="glass-card rounded-3xl shadow-sm overflow-hidden">
            {NAV_TABS.map(({ key, label, icon: Icon, badge }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as TabKey)}
                className={`w-full flex items-center justify-between px-4 py-3 text-xs font-bold transition border-b border-white/60 last:border-0 ${
                  activeTab === key ? 'text-brand-600 bg-white/80' : 'text-slate-700 hover:bg-white/60'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  {label}
                </span>
                {badge != null && badge > 0 && (
                  <span className="bg-brand-500 text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center shadow-xs">
                    {badge}
                  </span>
                )}
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-4 py-3 text-xs font-bold text-red-600 hover:bg-red-50/80 transition"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </nav>

          {/* Quick Actions - Frosted Glass Container */}
          <div className="glass-card rounded-3xl p-4 space-y-2 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Quick Actions</p>
            <Link href="/services" className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-brand-600 py-1.5 transition">
              <Zap className="w-3.5 h-3.5 text-brand-500" />
              Book a Service
            </Link>
            <Link href="/shop" className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-brand-600 py-1.5 transition">
              <ShoppingBag className="w-3.5 h-3.5 text-brand-500" />
              Shop Products
            </Link>
            <Link href="/warranty" className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-brand-600 py-1.5 transition">
              <Shield className="w-3.5 h-3.5 text-brand-500" />
              Check Warranty
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 space-y-6 min-w-0">
          {loading && (
            <div className="flex items-center justify-center h-40">
              <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
            </div>
          )}

          {!loading && activeTab === 'overview' && (
            <div className="space-y-6">
              <h1 className="text-xl font-black text-slate-950">
                Welcome back, {user.name.split(' ')[0]}! 👋
              </h1>

              {/* Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Bookings', value: bookings.length, icon: Wrench, color: 'text-brand-600 bg-brand-50' },
                  { label: 'Total Orders', value: orders.length, icon: Package, color: 'text-purple-600 bg-purple-50' },
                  { label: 'Active Warranties', value: warranties.filter((w) => w.status === 'ACTIVE').length, icon: Shield, color: 'text-emerald-600 bg-emerald-50' },
                  { label: 'Open Tickets', value: openTickets.length, icon: LifeBuoy, color: 'text-amber-600 bg-amber-50' },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <p className="text-2xl font-black text-slate-900">{value}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{label}</p>
                  </div>
                ))}
              </div>

              {/* Recent Bookings */}
              {bookings.length > 0 && (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
                    <h3 className="font-black text-slate-900 text-sm">Recent Bookings</h3>
                    <button onClick={() => setActiveTab('bookings')} className="text-[11px] text-brand-600 font-bold hover:underline">
                      View All
                    </button>
                  </div>
                  {bookings.slice(0, 3).map((b) => (
                    <div key={b.id} className="flex items-center justify-between px-5 py-3.5 border-b border-slate-50 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                          <Wrench className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{b.service?.name || 'Service Booking'}</p>
                          <p className="text-[10px] text-slate-400">{new Date(b.createdAt).toLocaleDateString('en-BD')}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${STATUS_COLORS[b.status] || 'bg-slate-100 text-slate-600'}`}>
                        {b.status?.replace(/_/g, ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty state */}
              {bookings.length === 0 && orders.length === 0 && (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-10 text-center space-y-3">
                  <div className="w-14 h-14 bg-brand-50 rounded-full flex items-center justify-center mx-auto">
                    <Zap className="w-7 h-7 text-brand-500" />
                  </div>
                  <p className="font-black text-slate-900">Get started with NEED ELECTRO</p>
                  <p className="text-xs text-slate-500">Book your first service or shop for products</p>
                  <div className="flex flex-wrap justify-center gap-3 pt-2">
                    <Link href="/booking" className="btn-primary text-xs py-2">Book a Service</Link>
                    <Link href="/shop" className="btn-secondary text-xs py-2">Browse Shop</Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* BOOKINGS TAB */}
          {!loading && activeTab === 'bookings' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-slate-900">My Bookings</h2>
                <Link href="/booking" className="btn-primary text-xs py-2">+ New Booking</Link>
              </div>
              {bookings.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-100 p-10 text-center text-sm text-slate-500 space-y-3">
                  <Wrench className="w-10 h-10 text-slate-300 mx-auto" />
                  <p>No bookings yet.</p>
                  <Link href="/booking" className="btn-primary text-xs py-2">Book a Technician</Link>
                </div>
              ) : bookings.map((b) => (
                <div key={b.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black text-slate-900 text-sm">{b.service?.name || 'Service Booking'}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{b.location?.area || 'Moulvibazar'} · {new Date(b.createdAt).toLocaleDateString('en-BD', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase shrink-0 ${STATUS_COLORS[b.status] || 'bg-slate-100 text-slate-600'}`}>
                      {b.status?.replace(/_/g, ' ')}
                    </span>
                  </div>
                  {b.description && <p className="text-xs text-slate-600 line-clamp-2">{b.description}</p>}
                  {b.technician && (
                    <div className="flex items-center gap-2 text-xs bg-slate-50 rounded-xl p-2.5">
                      <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-black text-xs">
                        {b.technician.user?.name?.[0] || 'T'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{b.technician.user?.name}</p>
                        <p className="text-[10px] text-slate-500">Assigned Technician</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ORDERS TAB */}
          {!loading && activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-slate-900">My Orders</h2>
                <Link href="/shop" className="btn-primary text-xs py-2">Shop Products</Link>
              </div>
              {orders.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-100 p-10 text-center text-sm text-slate-500 space-y-3">
                  <Package className="w-10 h-10 text-slate-300 mx-auto" />
                  <p>No orders yet.</p>
                  <Link href="/shop" className="btn-primary text-xs py-2">Shop Now</Link>
                </div>
              ) : orders.map((o) => (
                <div key={o.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono font-black text-brand-600 text-xs">{o.orderNumber}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{new Date(o.createdAt).toLocaleDateString('en-BD', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase shrink-0 ${STATUS_COLORS[o.status] || 'bg-slate-100 text-slate-600'}`}>
                      {o.status?.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">{o.items?.length || 0} item(s)</span>
                    <span className="font-black text-slate-900">৳{o.totalAmount?.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* WARRANTY TAB */}
          {!loading && activeTab === 'warranty' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-slate-900">My Warranties</h2>
                <Link href="/warranty" className="btn-secondary text-xs py-2">Check Warranty</Link>
              </div>
              {warranties.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-100 p-10 text-center text-sm text-slate-500 space-y-2">
                  <Shield className="w-10 h-10 text-slate-300 mx-auto" />
                  <p>No warranty records yet. Purchase a product or register your device.</p>
                  <Link href="/warranty" className="btn-primary text-xs py-2">Register a Device</Link>
                </div>
              ) : warranties.map((w) => (
                <div key={w.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-2">
                  <div className="flex items-start justify-between">
                    <p className="font-black text-slate-900 text-sm">{w.product?.name || 'Registered Device'}</p>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${w.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                      {w.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">Serial: {w.serialNumber}</p>
                  <div className="flex gap-4 text-[10px] text-slate-400">
                    <span>Start: {new Date(w.warrantyStart).toLocaleDateString('en-BD')}</span>
                    <span>End: {new Date(w.warrantyEnd).toLocaleDateString('en-BD')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SUPPORT TAB */}
          {!loading && activeTab === 'support' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-slate-900">Support Tickets</h2>
                <Link href="/support" className="btn-primary text-xs py-2">+ New Ticket</Link>
              </div>
              {tickets.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-100 p-10 text-center text-sm text-slate-500 space-y-2">
                  <LifeBuoy className="w-10 h-10 text-slate-300 mx-auto" />
                  <p>No support tickets yet.</p>
                  <Link href="/support" className="btn-primary text-xs py-2">Open a Ticket</Link>
                </div>
              ) : tickets.map((t) => (
                <div key={t.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-2">
                  <div className="flex items-start justify-between">
                    <p className="font-black text-slate-900 text-sm">{t.subject}</p>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${t.status === 'OPEN' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {t.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">{t.message}</p>
                  <p className="text-[10px] text-slate-400">{new Date(t.createdAt).toLocaleDateString('en-BD', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
