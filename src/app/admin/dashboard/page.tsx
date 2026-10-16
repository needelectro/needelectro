'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, Wrench, Package, ShoppingBag, Shield,
  LifeBuoy, Settings, LogOut, BarChart2, TrendingUp, AlertTriangle,
  CheckCircle2, Clock, DollarSign, Star, RefreshCw, Eye,
  GraduationCap, Building2, Store, MessageSquare, Send, X, Lock, Phone, Mail
} from 'lucide-react';
import { fastFetch, invalidateFastCache } from '@/lib/fastFetch';
import { isStaffOrAdmin } from '@/lib/permissions';

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

const DEFAULT_STATS = {
  totalCustomers: 0,
  totalTechnicians: 0,
  verifiedTechnicians: 0,
  activeTechnicians: 0,
  pendingTechnicians: 0,
  activeJobs: 0,
  completedJobs: 0,
  totalBookings: 0,
  totalOrders: 0,
  lowStockProducts: 0,
  warrantyClaims: 0,
  disputes: 0,
  serviceRevenue: 0,
  productRevenue: 0,
  totalRevenue: 0,
};

export default function AdminDashboard() {
  const { user, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [stats, setStats] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Support Ticket Response System State
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [replyStatus, setReplyStatus] = useState('IN_PROGRESS');
  const [replyPriority, setReplyPriority] = useState('NORMAL');
  const [sendingReply, setSendingReply] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/admin/login');
      return;
    }
    if (!isStaffOrAdmin(user)) {
      router.push('/admin/login?error=unauthorized');
      return;
    }
    loadData();
  }, [user, authLoading]);

  const loadData = async (forceRefresh = false) => {
    setIsRefreshing(true);
    if (!stats) setLoading(true);

    try {
      // 1. High-priority instant paint: Fetch stats + recent activity first
      const sData = await fastFetch('/api/v1/admin/stats', { forceRefresh, ttlMs: 20000, timeoutMs: 6000 });
      if (sData) {
        setStats(sData.stats || sData);
        if (sData.recentBookings && Array.isArray(sData.recentBookings)) {
          setBookings(sData.recentBookings);
        }
        if (sData.recentOrders && Array.isArray(sData.recentOrders)) {
          setOrders(sData.recentOrders);
        }
      } else {
        setStats((prev: any) => prev || DEFAULT_STATS);
      }
      setLoading(false);

      // 2. Secondary lazy paint: fetch tab collections concurrently in background
      Promise.allSettled([
        fastFetch('/api/v1/bookings?limit=25', { forceRefresh, ttlMs: 30000, timeoutMs: 8000 }),
        fastFetch('/api/v1/orders?limit=25', { forceRefresh, ttlMs: 30000, timeoutMs: 8000 }),
        fastFetch('/api/v1/admin/technicians?limit=25', { forceRefresh, ttlMs: 30000, timeoutMs: 8000 }),
        fastFetch('/api/v1/admin/customers?limit=25', { forceRefresh, ttlMs: 30000, timeoutMs: 8000 }),
        fastFetch('/api/v1/admin/support?limit=25', { forceRefresh, ttlMs: 30000, timeoutMs: 8000 }),
      ]).then(([bRes, oRes, tRes, cRes, suRes]) => {
        if (bRes.status === 'fulfilled' && bRes.value?.bookings) {
          setBookings(Array.isArray(bRes.value.bookings) ? bRes.value.bookings : []);
        }
        if (oRes.status === 'fulfilled' && oRes.value?.orders) {
          setOrders(Array.isArray(oRes.value.orders) ? oRes.value.orders : []);
        }
        if (tRes.status === 'fulfilled' && tRes.value?.technicians) {
          setTechnicians(Array.isArray(tRes.value.technicians) ? tRes.value.technicians : []);
        }
        if (cRes.status === 'fulfilled' && cRes.value?.customers) {
          setCustomers(Array.isArray(cRes.value.customers) ? cRes.value.customers : []);
        }
        if (suRes.status === 'fulfilled' && suRes.value?.tickets) {
          setTickets(Array.isArray(suRes.value.tickets) ? suRes.value.tickets : []);
        }
      });
    } catch (err) {
      console.error('Dashboard loadData error:', err);
      setStats((prev: any) => prev || DEFAULT_STATS);
      setLoading(false);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleOpenTicketModal = async (t: any) => {
    setSelectedTicket(t);
    setReplyStatus(t.status === 'OPEN' ? 'IN_PROGRESS' : (t.status || 'IN_PROGRESS'));
    setReplyPriority(t.priority || 'NORMAL');
    setReplyMessage('');
    setIsInternalNote(false);
    setActionSuccess(null);

    // Auto mark as read if it was OPEN
    if (t.status === 'OPEN') {
      try {
        await fetch('/api/v1/admin/support', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ticketId: t.id, markAsRead: true }),
        });
        setTickets((prev) =>
          prev.map((item) => item.id === t.id ? { ...item, status: 'IN_PROGRESS' } : item)
        );
      } catch (err) {}
    }
  };

  const handleMarkAllTicketsRead = async () => {
    setActionLoading('all-tickets-read');
    try {
      const res = await fetch('/api/v1/admin/support', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllAsRead: true }),
      });
      const data = await res.json();
      if (data.success) {
        setTickets((prev) =>
          prev.map((t) => (t.status === 'OPEN' ? { ...t, status: 'IN_PROGRESS' } : t))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleTicketRead = async (t: any) => {
    const isCurrentlyOpen = t.status === 'OPEN';
    setActionLoading(`toggle-${t.id}`);
    try {
      const res = await fetch('/api/v1/admin/support', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: t.id,
          markAsRead: isCurrentlyOpen,
          markAsUnread: !isCurrentlyOpen,
        }),
      });
      const data = await res.json();
      if (data.success && data.ticket) {
        setTickets((prev) => prev.map((item) => item.id === t.id ? data.ticket : item));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendTicketReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) return;
    setSendingReply(true);
    try {
      const res = await fetch('/api/v1/admin/support', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: selectedTicket.id,
          adminReply: replyMessage.trim(),
          status: replyStatus,
          priority: replyPriority,
          isInternalNote,
          authorName: user?.name || 'NEED ELECTRO Support Team',
        }),
      });
      const data = await res.json();
      if (data.success && data.ticket) {
        setTickets((prev) => prev.map((t) => t.id === data.ticket.id ? data.ticket : t));
        setSelectedTicket(data.ticket);
        setReplyMessage('');
        setActionSuccess(isInternalNote ? 'Internal note added to ticket.' : 'Official reply dispatched to customer.');
        setTimeout(() => setActionSuccess(null), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSendingReply(false);
    }
  };

  const handleUpdateTicketStatusQuick = async (ticketId: string, newStatus: string) => {
    setActionLoading(ticketId);
    try {
      const res = await fetch('/api/v1/admin/support', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId,
          status: newStatus,
        }),
      });
      const data = await res.json();
      if (data.success && data.ticket) {
        setTickets((prev) => prev.map((t) => t.id === data.ticket.id ? data.ticket : t));
        if (selectedTicket?.id === ticketId) {
          setSelectedTicket(data.ticket);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const verifyTechnician = async (techId: string) => {
    setActionLoading(techId);
    try {
      const res = await fetch(`/api/v1/technicians/${techId}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'VERIFIED' }),
      });
      if (res.ok) {
        setTechnicians((prev) =>
          prev.map((t) => (t.id === techId ? { ...t, verificationStatus: 'VERIFIED', isVerified: true } : t))
        );
      }
    } catch {
      /* ignore */
    } finally {
      setActionLoading(null);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    setActionLoading(orderId);
    try {
      const res = await fetch(`/api/v1/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status } : o))
        );
      }
    } catch {
      /* ignore */
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (!user) return null;

  const pendingBookings = (Array.isArray(bookings) ? bookings : []).filter(
    (b) => b.status === 'PENDING' || b.status === 'AVAILABLE' || b.status === 'RECEIVED'
  );
  const pendingOrders = (Array.isArray(orders) ? orders : []).filter((o) =>
    ['PLACED', 'PAYMENT_CONFIRMED', 'PROCESSING'].includes(o.status)
  );
  const pendingTechs = (Array.isArray(technicians) ? technicians : []).filter(
    (t) => t.verificationStatus === 'UNDER_REVIEW' || t.verificationStatus === 'PENDING'
  );
  const openTickets = (Array.isArray(tickets) ? tickets : []).filter((t) => t.status === 'OPEN');

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
    <div className="space-y-6">
      {/* Top Tab Bar */}
      <div className="flex border-b border-slate-200 bg-white rounded-xl p-1.5 shadow-sm overflow-x-auto gap-1">
        {NAV.map(({ key, label, icon: Icon, badge }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as AdminTab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              activeTab === key
                ? 'bg-[#008CFF] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{label}</span>
            {badge != null && badge > 0 && (
              <span
                className={`text-[10px] font-black rounded-full px-1.5 py-0.5 ${
                  activeTab === key ? 'bg-white text-[#008CFF]' : 'bg-red-500 text-white'
                }`}
              >
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <main className="space-y-6 min-w-0">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-black text-slate-950">Admin Dashboard</h1>
                <p className="text-xs text-slate-500">Live operational metrics and service performance</p>
              </div>
              <button
                onClick={() => {
                  invalidateFastCache();
                  loadData(true);
                }}
                disabled={isRefreshing}
                className="btn-secondary text-xs py-2 gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-brand-600' : ''}`} />
                {isRefreshing ? 'Syncing...' : 'Refresh'}
              </button>
            </div>

            {loading && !stats ? (
              <div className="space-y-4 animate-pulse">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm h-28 flex flex-col justify-between"
                    >
                      <div className="w-8 h-8 rounded-xl bg-slate-100" />
                      <div className="h-6 w-20 bg-slate-100 rounded" />
                      <div className="h-3 w-28 bg-slate-100 rounded" />
                    </div>
                  ))}
                </div>
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 text-center text-xs text-slate-400">
                  Syncing live console records...
                </div>
              </div>
            ) : (
              <>
                {/* Alert Counts */}
                {pendingBookings.length + pendingOrders.length + pendingTechs.length + openTickets.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-wrap gap-3 items-center text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="font-bold text-amber-800">Requires Attention:</span>
                    {pendingBookings.length > 0 && (
                      <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                        {pendingBookings.length} pending bookings
                      </span>
                    )}
                    {pendingOrders.length > 0 && (
                      <span className="bg-orange-100 text-orange-800 font-bold px-2 py-0.5 rounded-full">
                        {pendingOrders.length} new orders
                      </span>
                    )}
                    {pendingTechs.length > 0 && (
                      <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                        {pendingTechs.length} technician reviews
                      </span>
                    )}
                    {openTickets.length > 0 && (
                      <span className="bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full">
                        {openTickets.length} open tickets
                      </span>
                    )}
                  </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    {
                      label: 'Total Bookings',
                      value: stats?.totalBookings ?? bookings.length,
                      icon: Wrench,
                      color: 'text-brand-600 bg-brand-50',
                    },
                    {
                      label: 'Total Orders',
                      value: stats?.totalOrders ?? orders.length,
                      icon: Package,
                      color: 'text-purple-600 bg-purple-50',
                    },
                    {
                      label: 'Active Technicians',
                      value:
                        stats?.activeTechnicians ??
                        stats?.verifiedTechnicians ??
                        technicians.filter((t) => t.verificationStatus === 'VERIFIED').length,
                      icon: Users,
                      color: 'text-emerald-600 bg-emerald-50',
                    },
                    {
                      label: 'Total Revenue',
                      value: `৳${(stats?.totalRevenue ?? 0).toLocaleString()}`,
                      icon: DollarSign,
                      color: 'text-amber-600 bg-amber-50',
                    },
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
                    <button
                      onClick={() => setActiveTab('bookings')}
                      className="text-[11px] text-brand-600 font-bold hover:underline"
                    >
                      View All
                    </button>
                  </div>
                  {(bookings.length > 0 ? bookings : stats?.recentBookings || []).slice(0, 5).map((b: any) => (
                    <div
                      key={b.id}
                      className="flex items-center justify-between px-5 py-3.5 border-b border-slate-50 last:border-0 gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 line-clamp-1">
                          {b.service?.name || 'Service Booking'}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {b.customer?.user?.name || b.customer?.name || 'Customer'} ·{' '}
                          {b.address?.area || b.location?.area || 'Moulvibazar'} ·{' '}
                          {b.createdAt ? new Date(b.createdAt).toLocaleDateString('en-BD') : 'Recent'}
                        </p>
                      </div>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${
                          STATUS_COLORS[b.status] || 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {b.status?.replace(/_/g, ' ')}
                      </span>
                    </div>
                  ))}
                  {bookings.length === 0 && (!stats?.recentBookings || stats.recentBookings.length === 0) && (
                    <div className="p-8 text-center text-xs text-slate-500">No bookings yet.</div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* BOOKINGS TAB */}
        {activeTab === 'bookings' && (
            <div className="space-y-4">
              <h2 className="text-lg font-black text-slate-900">All Bookings</h2>
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                {bookings.length === 0 ? (
                  <div className="p-10 text-center text-xs text-slate-500">No bookings.</div>
                ) : bookings.map((b) => (
                  <div key={b.id} className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-50 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 line-clamp-1">{b.service?.name || 'Service Booking'}</p>
                      <p className="text-[10px] text-slate-500">
                        {b.customer?.user?.name || b.customer?.name || 'Customer'} · {b.address?.area || b.location?.area || 'Moulvibazar'} · {b.preferredDate}
                      </p>
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
          {activeTab === 'orders' && (
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
                        {o.customer?.user?.name || o.customer?.name || 'Customer'} · ৳{(o.totalAmount || 0).toLocaleString()} · {new Date(o.createdAt).toLocaleDateString('en-BD')}
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
          {activeTab === 'technicians' && (
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
                      {(t.name || t.user?.name)?.[0] || 'T'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-slate-900">{t.name || t.user?.name}</p>
                      <p className="text-[10px] text-slate-500">
                        ⭐ {(t.ratingOverall ?? t.rating ?? 5.0).toFixed(1)} · {t.totalCompletedJobs ?? t.totalJobsCompleted ?? 0} jobs · {t.skills?.slice(0, 2).join(', ')}
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
          {activeTab === 'customers' && (
            <div className="space-y-4">
              <h2 className="text-lg font-black text-slate-900">Customer Management</h2>
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                {customers.length === 0 ? (
                  <div className="p-10 text-center text-xs text-slate-500">No customers yet.</div>
                ) : customers.filter((c) => c.role === 'CUSTOMER' || !c.role).map((c) => (
                  <div key={c.id} className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-50 last:border-0">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-black shrink-0">
                      {c.name?.[0] || 'C'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900">{c.name}</p>
                      <p className="text-[10px] text-slate-500">{c.email} · {c.phone}</p>
                    </div>
                    <p className="text-[10px] text-slate-400 shrink-0">{c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-BD') : 'Recent'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUPPORT TAB */}
          {activeTab === 'support' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <LifeBuoy className="w-5 h-5 text-[#008CFF]" />
                    Support Tickets & Incident Desk
                  </h2>
                  <p className="text-xs text-slate-500">
                    Real-time inquiries, warranty claims, service complaints, and disputes.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                    {openTickets.length} Open
                  </span>
                  {openTickets.length > 0 && (
                    <button
                      onClick={handleMarkAllTicketsRead}
                      disabled={actionLoading === 'all-tickets-read'}
                      className="text-xs font-bold px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition flex items-center gap-1.5 shadow-xs"
                      title="Mark all open tickets as read (move to In-Progress)"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Mark All Read
                    </button>
                  )}
                  <Link
                    href="/admin/support"
                    className="text-xs font-bold text-[#008CFF] hover:underline flex items-center gap-1"
                  >
                    Open Support Portal →
                  </Link>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                {tickets.length === 0 ? (
                  <div className="p-12 text-center text-xs text-slate-500">
                    <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                    No support tickets pending.
                  </div>
                ) : (
                  tickets.map((t) => {
                    const submitterName = t.user?.name || t.submitter?.name || 'Customer';
                    const submitterContact = t.user?.email || t.user?.phone || 'Account User';
                    const conversationCount = t.conversation?.length || (t.adminReply ? 1 : 0);

                    return (
                      <div
                        key={t.id}
                        className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-6 py-4 border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition"
                      >
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-[11px] font-bold text-slate-400">
                              #{t.ticketNumber}
                            </span>
                            <span className="text-xs font-black text-slate-900">
                              {t.subject}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-[#008CFF] border border-blue-100">
                              {t.category || 'GENERAL'}
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 line-clamp-2">
                            {t.message}
                          </p>

                          <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                            <span className="font-semibold text-slate-700">
                              {submitterName}
                            </span>
                            <span>•</span>
                            <span>{submitterContact}</span>
                            <span>•</span>
                            <span>{new Date(t.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            {conversationCount > 0 && (
                              <>
                                <span>•</span>
                                <span className="text-[#008CFF] font-semibold flex items-center gap-1">
                                  <MessageSquare className="w-3 h-3" />
                                  {conversationCount} {conversationCount === 1 ? 'Response' : 'Responses'}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0">
                          {t.priority === 'URGENT' ? (
                            <span className="text-[10px] font-black bg-rose-100 text-rose-700 px-2 py-1 rounded-lg">
                              🔥 URGENT
                            </span>
                          ) : t.priority === 'HIGH' ? (
                            <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded-lg">
                              HIGH
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-lg">
                              Normal
                            </span>
                          )}

                          <span
                            className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${
                              t.status === 'RESOLVED'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : t.status === 'OPEN'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : t.status === 'WAITING_CUSTOMER'
                                ? 'bg-sky-50 text-sky-700 border-sky-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {t.status?.replace(/_/g, ' ')}
                          </span>

                          <button
                            onClick={() => handleToggleTicketRead(t)}
                            disabled={actionLoading === `toggle-${t.id}`}
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 border ${
                              t.status === 'OPEN'
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                : 'border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                            }`}
                            title={t.status === 'OPEN' ? 'Mark ticket as Read' : 'Mark ticket as Unread (Open)'}
                          >
                            <CheckCircle2 className={`w-3.5 h-3.5 ${t.status === 'OPEN' ? 'text-emerald-600' : 'text-slate-400'}`} />
                            <span className="hidden sm:inline text-[11px]">{t.status === 'OPEN' ? 'Mark Read' : 'Unread'}</span>
                          </button>

                          <button
                            onClick={() => handleOpenTicketModal(t)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#008CFF] hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition shadow-sm"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            Respond
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* SUPPORT TICKET RESPONSE MODAL */}
          {selectedTicket && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700">
                        #{selectedTicket.ticketNumber}
                      </span>
                      <h3 className="text-base font-bold text-slate-900">
                        {selectedTicket.subject}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                      <span>Submitted by <strong>{selectedTicket.user?.name || selectedTicket.submitter?.name || 'Customer'}</strong></span>
                      {selectedTicket.user?.email && <span>({selectedTicket.user.email})</span>}
                      {selectedTicket.user?.phone && <span>• {selectedTicket.user.phone}</span>}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedTicket(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Content - Scrollable Thread */}
                <div className="p-6 space-y-5 overflow-y-auto flex-1">
                  {/* Status Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-medium">Category:</span>
                      <span className="font-bold text-slate-800 uppercase">{selectedTicket.category || 'General'}</span>
                      <span className="text-slate-300">|</span>
                      <span className="text-slate-500 font-medium">Priority:</span>
                      <select
                        value={replyPriority}
                        onChange={(e) => setReplyPriority(e.target.value)}
                        className="font-bold text-slate-800 bg-white border border-slate-200 rounded px-2 py-0.5"
                      >
                        <option value="NORMAL">Normal</option>
                        <option value="HIGH">High</option>
                        <option value="URGENT">Urgent</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-medium">Status:</span>
                      <select
                        value={replyStatus}
                        onChange={(e) => setReplyStatus(e.target.value)}
                        className="font-bold text-[#002B5B] bg-white border border-slate-200 rounded px-2 py-0.5"
                      >
                        <option value="OPEN">Open</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="WAITING_CUSTOMER">Waiting Customer</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="CLOSED">Closed</option>
                      </select>
                    </div>
                  </div>

                  {/* Customer's Original Issue */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <span>Initial Customer Submission</span>
                      <span>{new Date(selectedTicket.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="p-4 bg-slate-100 rounded-xl border border-slate-200 text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                      {selectedTicket.message}
                    </div>
                  </div>

                  {/* Threaded History */}
                  {selectedTicket.conversation && selectedTicket.conversation.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Conversation & Resolution Trail ({selectedTicket.conversation.length})
                      </div>

                      {selectedTicket.conversation.map((msg: any, idx: number) => {
                        const isNote = msg.sender === 'INTERNAL_NOTE';
                        return (
                          <div
                            key={msg.id || idx}
                            className={`p-4 rounded-xl border space-y-1.5 ${
                              isNote
                                ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                                : 'bg-blue-50/60 border-blue-200 text-slate-900'
                            }`}
                          >
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                {isNote ? (
                                  <span className="inline-flex items-center gap-1 font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded text-[10px]">
                                    <Lock className="w-3 h-3" /> INTERNAL STAFF NOTE
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded text-[10px]">
                                    <MessageSquare className="w-3 h-3" /> OFFICIAL SUPPORT RESPONSE
                                  </span>
                                )}
                                <span className="font-semibold">{msg.senderName || 'Staff Member'}</span>
                              </div>
                              <span className="text-[11px] opacity-70">
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                              </span>
                            </div>
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">
                              {msg.message}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Notification Feedback */}
                  {actionSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      {actionSuccess}
                    </div>
                  )}

                  {/* Response Composer */}
                  <div className="space-y-2.5 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Compose Response
                      </span>

                      {/* Reply Type Toggle */}
                      <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-bold">
                        <button
                          type="button"
                          onClick={() => setIsInternalNote(false)}
                          className={`px-3 py-1 rounded-md transition ${
                            !isInternalNote
                              ? 'bg-[#008CFF] text-white shadow-sm'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Customer Reply
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsInternalNote(true)}
                          className={`px-3 py-1 rounded-md transition flex items-center gap-1 ${
                            isInternalNote
                              ? 'bg-amber-600 text-white shadow-sm'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <Lock className="w-3 h-3" />
                          Internal Note
                        </button>
                      </div>
                    </div>

                    <textarea
                      rows={4}
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder={
                        isInternalNote
                          ? "Write private internal notes for support technicians and engineers (hidden from customer)..."
                          : "Write official solution or customer response (customer will receive notification)..."
                      }
                      className={`w-full p-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition ${
                        isInternalNote
                          ? 'border-amber-300 focus:ring-amber-500 bg-amber-50/20'
                          : 'border-slate-300 focus:ring-[#008CFF] bg-white'
                      }`}
                    />

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleUpdateTicketStatusQuick(selectedTicket.id, 'IN_PROGRESS')}
                          disabled={actionLoading === selectedTicket.id}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                        >
                          Mark In-Progress
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateTicketStatusQuick(selectedTicket.id, 'RESOLVED')}
                          disabled={actionLoading === selectedTicket.id}
                          className="px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition"
                        >
                          ✓ Quick Resolve
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={handleSendTicketReply}
                        disabled={sendingReply || !replyMessage.trim()}
                        className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition disabled:opacity-50 ${
                          isInternalNote ? 'bg-amber-600 hover:bg-amber-700' : 'bg-[#008CFF] hover:bg-blue-600'
                        }`}
                      >
                        <Send className={`w-3.5 h-3.5 ${sendingReply ? 'animate-spin' : ''}`} />
                        {sendingReply
                          ? 'Sending...'
                          : isInternalNote
                          ? 'Save Internal Note'
                          : 'Send Official Response'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end px-6 py-3 bg-slate-50 border-t border-slate-100">
                  <button
                    onClick={() => setSelectedTicket(null)}
                    className="px-4 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-800"
                  >
                    Close Window
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
    </div>
  );
}
