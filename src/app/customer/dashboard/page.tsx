'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import CustomerProfileView from '@/components/profile/CustomerProfileView';
import {
  LayoutDashboard, ShoppingBag, Wrench, Shield, LifeBuoy, LogOut,
  User, ChevronRight, Package, Clock, CheckCircle2, AlertCircle,
  Star, Bell, Settings, ArrowRight, Zap, MapPin, Lock, Eye, EyeOff,
  Plus, Trash2, Check, Phone, Mail, Sparkles, Building, Home, Briefcase,
  Edit2, Save, X, ShieldCheck
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

type TabKey = 'overview' | 'bookings' | 'orders' | 'warranty' | 'support' | 'profile';

interface AddressItem {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  division: string;
  district: string;
  upazila: string;
  area: string;
  addressLine: string;
  landmark?: string | null;
  isDefault: boolean;
  createdAt: string;
}

function CustomerDashboardContent() {
  const { user, logout, refreshUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') as TabKey | null;
  const [activeTab, setActiveTab] = useState<TabKey>(tabParam || 'overview');

  useEffect(() => {
    if (tabParam && ['overview', 'bookings', 'orders', 'warranty', 'support', 'profile'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [warranties, setWarranties] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Profile Form States
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [alternativePhone, setAlternativePhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password Form States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Address Modal / Form States
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressMsg, setAddressMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [addressForm, setAddressForm] = useState({
    label: 'Home',
    recipientName: '',
    phone: '',
    division: 'Sylhet',
    district: 'Moulvibazar',
    upazila: 'Moulvibazar Sadar',
    area: '',
    addressLine: '',
    landmark: '',
    isDefault: false,
  });

  useEffect(() => {
    if (!user) {
      router.push('/customer/login?redirect=/customer/dashboard');
      return;
    }
    if (user.role === 'TECHNICIAN') {
      router.replace('/technician/dashboard');
      return;
    }
    loadData();
    // Initialize profile form values
    setName(user.name || '');
    setPhone(user.phone || '');
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bRes, oRes, wRes, tRes, meRes, addrRes] = await Promise.all([
        fetch('/api/v1/bookings'),
        fetch('/api/v1/orders'),
        fetch('/api/v1/warranty'),
        fetch('/api/v1/support'),
        fetch('/api/v1/auth/me'),
        fetch('/api/v1/customer/addresses'),
      ]);

      if (bRes.ok) { const d = await bRes.json(); setBookings(d.bookings || []); }
      if (oRes.ok) { const d = await oRes.json(); setOrders(d.orders || []); }
      if (wRes.ok) { const d = await wRes.json(); setWarranties(d.warranties || []); }
      if (tRes.ok) { const d = await tRes.json(); setTickets(d.tickets || []); }

      if (meRes.ok) {
        const d = await meRes.json();
        if (d.user) {
          setName(d.user.name || '');
          setPhone(d.user.phone || '');
          setAvatarUrl(d.user.avatarUrl || '');
          if (d.user.customerProfile) {
            setAlternativePhone(d.user.customerProfile.alternativePhone || '');
            if (d.user.customerProfile.addresses) {
              setAddresses(d.user.customerProfile.addresses);
            }
          }
        }
      }

      if (addrRes.ok) {
        const d = await addrRes.json();
        if (d.addresses) setAddresses(d.addresses);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  // Handle Profile Update
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg(null);

    try {
      const res = await fetch('/api/v1/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim() || null,
          alternativePhone: alternativePhone.trim() || null,
          avatarUrl: avatarUrl.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setProfileMsg({ type: 'error', text: data.error || 'Failed to update profile.' });
      } else {
        setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
        await refreshUser();
        setTimeout(() => setProfileMsg(null), 4000);
      }
    } catch {
      setProfileMsg({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setProfileSaving(false);
    }
  };

  // Handle Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSaving(true);
    setPasswordMsg(null);

    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 6 characters long.' });
      setPasswordSaving(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
      setPasswordSaving(false);
      return;
    }

    try {
      const res = await fetch('/api/v1/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPasswordMsg({ type: 'error', text: data.error || 'Failed to update password.' });
      } else {
        setPasswordMsg({ type: 'success', text: 'Password changed successfully!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordMsg(null), 4000);
      }
    } catch {
      setPasswordMsg({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setPasswordSaving(false);
    }
  };

  // Handle Add Address
  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressSaving(true);
    setAddressMsg(null);

    try {
      const res = await fetch('/api/v1/customer/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addressForm),
      });

      const data = await res.json();
      if (!res.ok) {
        setAddressMsg({ type: 'error', text: data.error || 'Failed to save address.' });
      } else {
        setAddressMsg({ type: 'success', text: 'Delivery address added successfully!' });
        setShowAddressForm(false);
        setAddressForm({
          label: 'Home',
          recipientName: '',
          phone: '',
          division: 'Sylhet',
          district: 'Moulvibazar',
          upazila: 'Moulvibazar Sadar',
          area: '',
          addressLine: '',
          landmark: '',
          isDefault: false,
        });
        // Reload addresses
        const addrRes = await fetch('/api/v1/customer/addresses');
        if (addrRes.ok) {
          const ad = await addrRes.json();
          setAddresses(ad.addresses || []);
        }
        setTimeout(() => setAddressMsg(null), 4000);
      }
    } catch {
      setAddressMsg({ type: 'error', text: 'Failed to add address. Try again.' });
    } finally {
      setAddressSaving(false);
    }
  };

  // Handle Set Default Address
  const handleSetDefaultAddress = async (id: string) => {
    try {
      const res = await fetch('/api/v1/customer/addresses', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isDefault: true }),
      });
      if (res.ok) {
        setAddresses((prev) =>
          prev.map((a) => ({
            ...a,
            isDefault: a.id === id,
          }))
        );
      }
    } catch {
      /* ignore */
    }
  };

  // Handle Delete Address
  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Are you sure you want to remove this delivery address?')) return;
    try {
      const res = await fetch(`/api/v1/customer/addresses?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setAddresses((prev) => prev.filter((a) => a.id !== id));
      }
    } catch {
      /* ignore */
    }
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
    { key: 'profile', label: 'My Profile', icon: User },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="lg:w-64 space-y-4 shrink-0">
          <Link
            href="/"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 shadow-xs group hover:bg-white transition"
            title="Return to Website"
          >
            <Image
              src="/logo.png"
              alt="NEED ELECTRO"
              width={140}
              height={70}
              className="h-8 w-auto object-contain group-hover:scale-105 transition-transform"
            />
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-md">
              Customer
            </span>
          </Link>

          {/* Profile Card - Interactive Click to Open Profile */}
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full text-left bg-gradient-to-br from-brand-600/95 to-brand-700/95 backdrop-blur-2xl rounded-3xl p-5 text-white space-y-3 border border-white/20 shadow-xl relative overflow-hidden transition-all duration-200 hover:scale-[1.02] ${
              activeTab === 'profile' ? 'ring-2 ring-white/60' : ''
            }`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-400/20 blur-2xl rounded-full pointer-events-none" />
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-xl font-black shadow-inner overflow-hidden">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
              <span className="text-[10px] font-bold text-white/80 flex items-center gap-1 bg-white/10 px-2 py-1 rounded-lg backdrop-blur-sm">
                Edit <ChevronRight className="w-3 h-3" />
              </span>
            </div>
            <div>
              <p className="font-black text-sm">{user.name}</p>
              <p className="text-xs text-brand-200 truncate">{user.email}</p>
              <span className="inline-block mt-1.5 text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-sm rounded-full px-2.5 py-0.5 border border-white/25">
                {user.role}
              </span>
            </div>
          </button>

          {/* Nav - Frosted Glass Container */}
          <nav className="glass-card rounded-3xl shadow-sm overflow-hidden">
            {NAV_TABS.map(({ key, label, icon: Icon, badge }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
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

          {/* Quick Actions */}
          <div className="glass-card rounded-3xl p-4 space-y-2 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Quick Actions</p>
            <Link
              href="/services"
              className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-brand-600 py-1.5 transition"
            >
              <Zap className="w-3.5 h-3.5 text-brand-500" />
              Book a Service
            </Link>
            <Link
              href="/parts"
              className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-brand-600 py-1.5 transition"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-brand-500" />
              Spare Parts & Materials
            </Link>
            <Link
              href="/warranty"
              className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-brand-600 py-1.5 transition"
            >
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

          {/* OVERVIEW TAB */}
          {!loading && activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-black text-slate-950">
                  Welcome back, {user.name.split(' ')[0]}! 👋
                </h1>
                <div className="flex items-center gap-2">
                  <Link
                    href="/booking"
                    className="text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl shadow-xs transition"
                  >
                    <Zap className="w-3.5 h-3.5 fill-white" />
                    Book a Service (3-Click)
                  </Link>
                  <button
                    onClick={() => setActiveTab('profile')}
                    className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1.5 bg-brand-50 px-3 py-1.5 rounded-xl border border-brand-100 transition"
                  >
                    <User className="w-3.5 h-3.5" />
                    Edit Profile
                  </button>
                </div>
              </div>

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

              {/* Quick Profile Overview Banner */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center font-black text-xl shrink-0 overflow-hidden">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
                    ) : (
                      name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-slate-900 text-base">{name}</h3>
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Verified
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {phone || 'No phone set'} · {addresses.length} saved address{addresses.length === 1 ? '' : 'es'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('profile')}
                  className="btn-primary text-xs py-2 px-4 shrink-0 flex items-center gap-1.5"
                >
                  <Settings className="w-3.5 h-3.5" />
                  Manage Profile & Security
                </button>
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

          {/* MY PROFILE TAB (REDESIGNED) */}
          {!loading && activeTab === 'profile' && (
            <CustomerProfileView
              onTabChange={(tab) => setActiveTab(tab as TabKey)}
              isStandalonePage={false}
            />
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

          {/* ORDERS TAB (ORDER DETAILS & WARRANTY VERIFICATION) */}
          {!loading && activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-900">My Orders</h2>
                  <p className="text-xs text-slate-500">Track shipments, items, delivery destination, and warranty records</p>
                </div>
                <Link href="/shop" className="btn-primary text-xs py-2">Shop Products</Link>
              </div>

              {orders.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-100 p-10 text-center text-sm text-slate-500 space-y-3">
                  <Package className="w-10 h-10 text-slate-300 mx-auto" />
                  <p>No orders placed yet.</p>
                  <Link href="/shop" className="btn-primary text-xs py-2">Browse Catalog</Link>
                </div>
              ) : orders.map((o) => (
                <div key={o.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-50 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-mono font-black text-brand-600 text-sm">{o.orderNumber}</p>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${STATUS_COLORS[o.status] || 'bg-slate-100 text-slate-600'}`}>
                          {o.status?.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Placed on {new Date(o.createdAt).toLocaleDateString('en-BD', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedOrder(o);
                          setShowInvoiceModal(true);
                        }}
                        className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 hover:border-brand-400 hover:text-brand-600 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-brand-600" />
                        View Order Details
                      </button>
                    </div>
                  </div>

                  {/* Item List Snippet */}
                  <div className="space-y-1.5">
                    {o.items?.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between text-xs text-slate-700">
                        <span className="line-clamp-1 flex-1 pr-2">
                          • {item.product?.name || 'Technology Hardware'} &times; {item.quantity}
                        </span>
                        <span className="font-bold text-slate-900 shrink-0">
                          ৳{(item.totalPrice || item.unitPrice * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-50 text-xs">
                    <span className="text-slate-500">
                      Destination: {o.deliveryAddress?.district ? `${o.deliveryAddress.area || o.deliveryAddress.upazila}, ${o.deliveryAddress.district}` : 'Bangladesh'}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500">Payment: <strong>{o.paymentMethod?.replace(/_/g, ' ')}</strong></span>
                      <span className="font-black text-slate-900 text-sm">Total: ৳{o.totalAmount?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* OFFICIAL TAX INVOICE MODAL */}
              {showInvoiceModal && selectedOrder && (
                <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
                  <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="flex items-start justify-between border-b border-slate-200 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <Image src="/logo.png" alt="NEED ELECTRO" width={120} height={40} className="h-7 w-auto object-contain" />
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-50 text-brand-700 px-2.5 py-0.5 rounded-full">
                            Order Details
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          NEED ELECTRO &bull; AMDADS GROUP &bull; Nationwide Customer Support: 01733 983752
                        </p>
                      </div>
                      <button
                        onClick={() => setShowInvoiceModal(false)}
                        className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Order Details Body */}
                    <div className="space-y-4 text-xs text-slate-800">
                      <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl">
                        <div>
                          <p className="font-bold text-slate-500 uppercase text-[10px]">Order Information</p>
                          <p className="font-mono font-black text-brand-600 text-sm mt-0.5">{selectedOrder.orderNumber}</p>
                          <p className="text-slate-500">
                            Date: {new Date(selectedOrder.createdAt).toLocaleDateString('en-BD', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                          <p className="text-slate-500">Status: <strong className="text-emerald-600 uppercase">{selectedOrder.status?.replace(/_/g, ' ')}</strong></p>
                        </div>
                        <div>
                          <p className="font-bold text-slate-500 uppercase text-[10px]">Delivery Destination</p>
                          <p className="font-bold text-slate-900 mt-0.5">{selectedOrder.deliveryAddress?.recipientName || user.name}</p>
                          <p className="text-slate-600">{selectedOrder.deliveryAddress?.phone || user.phone}</p>
                          <p className="text-slate-600">{selectedOrder.deliveryAddress?.addressLine}</p>
                          <p className="text-slate-600">
                            {selectedOrder.deliveryAddress?.upazila}, {selectedOrder.deliveryAddress?.district}, {selectedOrder.deliveryAddress?.division}
                          </p>
                        </div>
                      </div>

                      {/* Items Table */}
                      <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                        <thead className="bg-slate-100 text-slate-700 font-bold">
                          <tr>
                            <th className="p-2.5">Item Description</th>
                            <th className="p-2.5 text-center">Qty</th>
                            <th className="p-2.5 text-right">Unit Price</th>
                            <th className="p-2.5 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {selectedOrder.items?.map((item: any, i: number) => (
                            <tr key={i}>
                              <td className="p-2.5 font-semibold text-slate-900">
                                {item.product?.name || 'Hardware Product'}
                                {item.serialNumber && (
                                  <span className="block font-mono text-[10px] text-brand-600">
                                    Serial: {item.serialNumber}
                                  </span>
                                )}
                              </td>
                              <td className="p-2.5 text-center">{item.quantity}</td>
                              <td className="p-2.5 text-right font-mono">৳{item.unitPrice?.toLocaleString()}</td>
                              <td className="p-2.5 text-right font-mono font-bold">৳{(item.totalPrice || item.unitPrice * item.quantity).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-slate-50 font-semibold border-t border-slate-200">
                          <tr>
                            <td colSpan={3} className="p-2.5 text-right text-slate-600">Subtotal</td>
                            <td className="p-2.5 text-right font-mono">৳{selectedOrder.subtotal?.toLocaleString()}</td>
                          </tr>
                          <tr>
                            <td colSpan={3} className="p-2.5 text-right text-slate-600">Delivery Charge ({selectedOrder.deliveryAddress?.district || 'Bangladesh'})</td>
                            <td className="p-2.5 text-right font-mono">
                              {selectedOrder.deliveryCharge === 0 ? 'FREE' : `৳${selectedOrder.deliveryCharge}`}
                            </td>
                          </tr>
                          {selectedOrder.discount > 0 && (
                            <tr>
                              <td colSpan={3} className="p-2.5 text-right text-emerald-600">Discount</td>
                              <td className="p-2.5 text-right font-mono text-emerald-600">-৳{selectedOrder.discount?.toLocaleString()}</td>
                            </tr>
                          )}
                          <tr className="border-t border-slate-300 font-black text-sm">
                            <td colSpan={3} className="p-2.5 text-right text-slate-900">Total Amount</td>
                            <td className="p-2.5 text-right font-mono text-brand-600">৳{selectedOrder.totalAmount?.toLocaleString()}</td>
                          </tr>
                        </tfoot>
                      </table>

                      <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-[11px] text-amber-900 space-y-1">
                        <p className="font-bold flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-amber-700" />
                          Official Digital Warranty Record:
                        </p>
                        <p>
                          Keep your product serial numbers for official warranty service. You can submit warranty claims directly in your account.
                        </p>
                      </div>
                    </div>

                    {/* Actions: Clean close without printing */}
                    <div className="pt-2 border-t border-slate-200">
                      <button
                        onClick={() => setShowInvoiceModal(false)}
                        className="btn-secondary w-full text-xs py-2.5 font-bold text-center justify-center hover:bg-slate-100 transition"
                      >
                        Close Order Details
                      </button>
                    </div>
                  </div>
                </div>
              )}
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

export default function CustomerDashboard() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-400">Loading customer portal...</div>}>
      <CustomerDashboardContent />
    </React.Suspense>
  );
}
