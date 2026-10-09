'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, Wrench, Package, ShoppingBag, Shield,
  LifeBuoy, Settings, LogOut, BarChart2, TrendingUp, AlertTriangle,
  CheckCircle2, Clock, DollarSign, Star, RefreshCw, Eye,
  GraduationCap, Building2, Store
} from 'lucide-react';

type AdminTab = 'overview' | 'bookings' | 'orders' | 'technicians' | 'customers' | 'support';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  CONFIRMED: 'bg-brand-100 text-brand-700',
  ACCEPTED: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-purple-100 text-purple-700',
  WORK_COMPLETED: 'bg-emerald-100 text-emerald-700',
  CLOSED: 'bg-slate-100 text-slate-600',
  CANCELLED: 'bg-red-100 text-red-600',
  DELIVERED: 'bg-emerald-100 text-emerald-700',
  PROCESSING: 'bg-brand-100 text-brand-700',
  VERIFIED: 'bg-emerald-100 text-emerald-700',
  UNDER_REVIEW: 'bg-blue-100 text-blue-700',
  OPEN: 'bg-amber-100 text-amber-700',
  RESOLVED: 'bg-emerald-100 text-emerald-700',
};

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [stats, setStats] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      router.push('/customer/dashboard');
      return;
    }
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sRes, bRes, oRes, tRes, cRes, suRes] = await Promise.all([
        fetch('/api/v1/admin/stats'),
        fetch('/api/v1/bookings?limit=50'),
        fetch('/api/v1/orders?limit=50'),
        fetch('/api/v1/technicians?limit=50'),
        fetch('/api/v1/auth/users?limit=50'),
        fetch('/api/v1/support?limit=50'),
      ]);
      if (sRes.ok) { const d = await sRes.json(); setStats(d.stats || d); }
      if (bRes.ok) { const d = await bRes.json(); setBookings(d.bookings || []); }
      if (oRes.ok) { const d = await oRes.json(); setOrders(d.orders || []); }
      if (tRes.ok) { const d = await tRes.json(); setTechnicians(d.technicians || []); }
      if (cRes.ok) { const d = await cRes.json(); setCustomers(d.users || []); }
      if (suRes.ok) { const d = await suRes.json(); setTickets(d.tickets || []); }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  const verifyTechnician = async (techId: string) => {
    setActionLoading(techId);
    try {
      const res = await fetch(`/api/v1/technicians/${techId}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'VERIFIED' }),
      });
      if (res.ok) await loadData();
    } catch { /* ignore */ }
    finally { setActionLoading(null); }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    setActionLoading(orderId);
    try {
      const res = await fetch(`/api/v1/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) await loadData();
    } catch { /* ignore */ }
    finally { setActionLoading(null); }
  };

  const handleLogout = async () => { await logout(); router.push('/'); };

  if (!user) return null;

  const pendingBookings = bookings.filter((b) => b.status === 'PENDING' || b.status === 'AVAILABLE');
  const pendingOrders = orders.filter((o) => ['PLACED', 'PAYMENT_CONFIRMED', 'PROCESSING'].includes(o.status));
  const pendingTechs = technicians.filter((t) => t.verificationStatus === 'UNDER_REVIEW' || t.verificationStatus === 'PENDING');
  const openTickets = tickets.filter((t) => t.status === 'OPEN');

  interface NavItem {
    key: AdminTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }

  const NAV: NavItem[] = [
    { key: 'overview', label: 'Overview', icon: LayoutDashboard },
    { key: 'bookings', label: 'Bookings', icon: Wrench, badge: pendingBookings.length },
    { key: 'orders', label: 'Orders', icon: Package, badge: pendingOrders.length },
    { key: 'technicians', label: 'Technicians', icon: Users, badge: pendingTechs.length },
    { key: 'customers', label: 'Customers', icon: Users },
    { key: 'support', label: 'Support', icon: LifeBuoy, badge: openTickets.length },
  ];

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="lg:w-60 space-y-4 shrink-0">
          <div className="glass-card-dark rounded-3xl p-5 text-white space-y-2.5 relative overflow-hidden shadow-xl border border-white/10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/15 blur-2xl rounded-full pointer-events-none" />
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center font-black text-lg text-white shadow-md shadow-brand-500/30 border border-white/20">
              {user.name.charAt(0)}
            </div>
            <p className="font-black text-sm">{user.name}</p>
            <span className="inline-block text-[10px] font-black bg-brand-500/20 text-brand-300 border border-brand-500/30 px-2.5 py-0.5 rounded-full uppercase backdrop-blur-sm">
              {user.role}
            </span>
          </div>

          <nav className="glass-card rounded-3xl shadow-sm overflow-hidden">
            {NAV.map(({ key, label, icon: Icon, badge }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as AdminTab)}
                className={`w-full flex items-center justify-between px-4 py-3 text-xs font-bold transition border-b border-white/60 last:border-0 ${
                  activeTab === key ? 'text-brand-600 bg-white/80' : 'text-slate-700 hover:bg-white/60'
                }`}
              >
                <span className="flex items-center gap-2.5"><Icon className="w-4 h-4" />{label}</span>
                {badge != null && badge > 0 && (
                  <span className="bg-red-500 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center shadow-xs">{badge}</span>
                )}
              </button>
            ))}
            <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-4 py-3 text-xs font-bold text-red-600 hover:bg-red-50/80 transition">
              <LogOut className="w-4 h-4" />Sign Out
            </button>
          </nav>

          <div className="space-y-2">
            <Link href="/admin/products" className="glass-card-hover flex items-center gap-2 text-xs font-bold text-slate-800 rounded-2xl px-4 py-3 transition shadow-xs">
              <ShoppingBag className="w-4 h-4 text-brand-500" />Manage Products
            </Link>
            <Link href="/admin/services" className="glass-card-hover flex items-center gap-2 text-xs font-bold text-slate-800 rounded-2xl px-4 py-3 transition shadow-xs">
              <Wrench className="w-4 h-4 text-brand-500" />Manage Services
            </Link>
            <Link href="/training" className="glass-card-hover flex items-center gap-2 text-xs font-bold text-slate-800 rounded-2xl px-4 py-3 transition shadow-xs">
              <GraduationCap className="w-4 h-4 text-amber-500" />Academy &amp; Training
            </Link>
            <Link href="/branches" className="glass-card-hover flex items-center gap-2 text-xs font-bold text-slate-800 rounded-2xl px-4 py-3 transition shadow-xs">
              <Building2 className="w-4 h-4 text-sky-500" />Branch Network
            </Link>
            <Link href="/become-a-seller" className="glass-card-hover flex items-center gap-2 text-xs font-bold text-slate-800 rounded-2xl px-4 py-3 transition shadow-xs">
              <Store className="w-4 h-4 text-emerald-500" />Merchant Partners
            </Link>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 space-y-6 min-w-0">
          {loading && (
            <div className="flex items-center justify-center h-40">
              <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
            </div>
          )}

          {!loading && activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-black text-slate-950">Admin Dashboard</h1>
                <button onClick={loadData} className="btn-secondary text-xs py-2 gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5" />Refresh
                </button>
              </div>

              {/* Alert Counts */}
              {(pendingBookings.length + pendingOrders.length + pendingTechs.length + openTickets.length) > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-wrap gap-3 items-center text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="font-bold text-amber-800">Requires Attention:</span>
                  {pendingBookings.length > 0 && <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">{pendingBookings.length} pending bookings</span>}
                  {pendingOrders.length > 0 && <span className="bg-orange-100 text-orange-800 font-bold px-2 py-0.5 rounded-full">{pendingOrders.length} new orders</span>}
                  {pendingTechs.length > 0 && <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">{pendingTechs.length} technician reviews</span>}
                  {openTickets.length > 0 && <span className="bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full">{openTickets.length} open tickets</span>}
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Bookings', value: stats?.totalBookings ?? bookings.length, icon: Wrench, color: 'text-brand-600 bg-brand-50' },
                  { label: 'Total Orders', value: stats?.totalOrders ?? orders.length, icon: Package, color: 'text-purple-600 bg-purple-50' },
                  { label: 'Active Technicians', value: stats?.activeTechnicians ?? technicians.filter((t) => t.verificationStatus === 'VERIFIED').length, icon: Users, color: 'text-emerald-600 bg-emerald-50' },
                  { label: 'Total Revenue', value: `৳${(stats?.totalRevenue ?? 0).toLocaleString()}`, icon: DollarSign, color: 'text-amber-600 bg-amber-50' },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <p className="text-xl font-black text-slate-900">{value}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{label}</p>
                  </div>
                ))}
              </div>

              {/* Recent Bookings */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
                  <h3 className="font-black text-slate-900 text-sm">Recent Bookings</h3>
                  <button onClick={() => setActiveTab('bookings')} className="text-[11px] text-brand-600 font-bold hover:underline">View All</button>
                </div>
                {bookings.slice(0, 5).map((b) => (
                  <div key={b.id} className="flex items-center justify-between px-5 py-3.5 border-b border-slate-50 last:border-0 gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 line-clamp-1">{b.service?.name || 'Service Booking'}</p>
                      <p className="text-[10px] text-slate-400">{b.customer?.name} · {b.location?.area} · {new Date(b.createdAt).toLocaleDateString('en-BD')}</p>
                    </div>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${STATUS_COLORS[b.status] || 'bg-slate-100 text-slate-600'}`}>
                      {b.status?.replace(/_/g, ' ')}
                    </span>
                  </div>
                ))}
                {bookings.length === 0 && <div className="p-8 text-center text-xs text-slate-500">No bookings yet.</div>}
              </div>
            </div>
          )}

          {/* BOOKINGS TAB */}
          {!loading && activeTab === 'bookings' && (
            <div className="space-y-4">
              <h2 className="text-lg font-black text-slate-900">All Bookings</h2>
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                {bookings.length === 0 ? (
                  <div className="p-10 text-center text-xs text-slate-500">No bookings.</div>
                ) : bookings.map((b) => (
                  <div key={b.id} className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-50 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 line-clamp-1">{b.service?.name || 'Service Booking'}</p>
                      <p className="text-[10px] text-slate-500">{b.customer?.name} · {b.location?.area} · {b.preferredDate}</p>
                    </div>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${STATUS_COLORS[b.status] || 'bg-slate-100 text-slate-600'}`}>
                      {b.status?.replace(/_/g, ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ORDERS TAB */}
          {!loading && activeTab === 'orders' && (
            <div className="space-y-4">
              <h2 className="text-lg font-black text-slate-900">All Orders</h2>
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                {orders.length === 0 ? (
                  <div className="p-10 text-center text-xs text-slate-500">No orders yet.</div>
                ) : orders.map((o) => (
                  <div key={o.id} className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-50 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-mono font-black text-brand-600">{o.orderNumber}</p>
                      <p className="text-[10px] text-slate-500">
                        {o.customer?.name} · ৳{o.totalAmount?.toLocaleString()} · {new Date(o.createdAt).toLocaleDateString('en-BD')}
                      </p>
                    </div>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${STATUS_COLORS[o.status] || 'bg-slate-100 text-slate-600'}`}>
                      {o.status?.replace(/_/g, ' ')}
                    </span>
                    {['PLACED', 'PAYMENT_CONFIRMED'].includes(o.status) && (
                      <button
                        onClick={() => updateOrderStatus(o.id, 'PROCESSING')}
                        disabled={actionLoading === o.id}
                        className="text-[10px] font-black text-brand-600 border border-brand-300 rounded-lg px-2 py-1 hover:bg-brand-50 transition shrink-0"
                      >
                        {actionLoading === o.id ? '...' : 'Process'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TECHNICIANS TAB */}
          {!loading && activeTab === 'technicians' && (
            <div className="space-y-4">
              <h2 className="text-lg font-black text-slate-900">Technician Management</h2>
              {pendingTechs.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-800 font-medium">
                  ⚠️ {pendingTechs.length} technician(s) awaiting verification
                </div>
              )}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                {technicians.length === 0 ? (
                  <div className="p-10 text-center text-xs text-slate-500">No technicians registered.</div>
                ) : technicians.map((t) => (
                  <div key={t.id} className="flex items-center gap-3 px-5 py-4 border-b border-slate-50 last:border-0">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-sm font-black shrink-0">
                      {t.user?.name?.[0] || 'T'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-slate-900">{t.user?.name}</p>
                      <p className="text-[10px] text-slate-500">
                        ⭐ {(t.rating || 0).toFixed(1)} · {t.totalJobsCompleted || 0} jobs · {t.skills?.slice(0, 2).join(', ')}
                      </p>
                    </div>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${STATUS_COLORS[t.verificationStatus] || 'bg-slate-100 text-slate-600'}`}>
                      {t.verificationStatus?.replace(/_/g, ' ')}
                    </span>
                    {(t.verificationStatus === 'UNDER_REVIEW' || t.verificationStatus === 'PENDING') && (
                      <button
                        onClick={() => verifyTechnician(t.id)}
                        disabled={actionLoading === t.id}
                        className="shrink-0 text-[10px] font-black text-emerald-700 border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 rounded-lg px-2.5 py-1 transition"
                      >
                        {actionLoading === t.id ? '...' : '✓ Verify'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CUSTOMERS TAB */}
          {!loading && activeTab === 'customers' && (
            <div className="space-y-4">
              <h2 className="text-lg font-black text-slate-900">Customer Management</h2>
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                {customers.length === 0 ? (
                  <div className="p-10 text-center text-xs text-slate-500">No customers yet.</div>
                ) : customers.filter((c) => c.role === 'CUSTOMER').map((c) => (
                  <div key={c.id} className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-50 last:border-0">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-black shrink-0">
                      {c.name?.[0] || 'C'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900">{c.name}</p>
                      <p className="text-[10px] text-slate-500">{c.email} · {c.phone}</p>
                    </div>
                    <p className="text-[10px] text-slate-400 shrink-0">{new Date(c.createdAt).toLocaleDateString('en-BD')}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUPPORT TAB */}
          {!loading && activeTab === 'support' && (
            <div className="space-y-4">
              <h2 className="text-lg font-black text-slate-900">Support Tickets</h2>
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                {tickets.length === 0 ? (
                  <div className="p-10 text-center text-xs text-slate-500">No tickets yet.</div>
                ) : tickets.map((t) => (
                  <div key={t.id} className="flex items-start gap-3 px-5 py-4 border-b border-slate-50 last:border-0">
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <p className="text-xs font-black text-slate-900">{t.subject}</p>
                      <p className="text-[10px] text-slate-500 line-clamp-1">{t.message}</p>
                      <p className="text-[10px] text-slate-400">{t.submitter?.name || 'Anonymous'} · {new Date(t.createdAt).toLocaleDateString('en-BD')}</p>
                    </div>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${STATUS_COLORS[t.status] || 'bg-slate-100'}`}>
                      {t.status}
                    </span>
                    {t.priority === 'URGENT' && (
                      <span className="text-[10px] font-black bg-red-100 text-red-700 px-2 py-0.5 rounded-full shrink-0">🔥 URGENT</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
