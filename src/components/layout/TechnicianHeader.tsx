'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import {
  Wrench,
  LayoutDashboard,
  CalendarCheck,
  DollarSign,
  Clock,
  User as UserIcon,
  LifeBuoy,
  Bell,
  LogOut,
  ChevronDown,
  Menu,
  X,
  PhoneCall,
  ShieldCheck,
  Star,
  Zap,
} from 'lucide-react';

import { fastFetch, invalidateFastCache } from '@/lib/fastFetch';
import { useLanguage } from '@/lib/context/LanguageContext';
import LanguageSwitcher from '@/components/common/LanguageSwitcher';

export default function TechnicianHeader() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();

  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [availableStatus, setAvailableStatus] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = sessionStorage.getItem('_ne_fast_/api/v1/technicians/me');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.data?.technician?.availableStatus) {
            return parsed.data.technician.availableStatus;
          }
        }
      } catch {}
    }
    return 'AVAILABLE';
  });
  const [loadingStatus, setLoadingStatus] = useState(false);

  // Close menus on route change
  useEffect(() => {
    setAccountMenuOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  // Lock body scroll on mobile menu
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Load technician status & notification badge with stale-while-revalidate cache (no repeat fetches on route transitions)
  useEffect(() => {
    if (!user || user.role !== 'TECHNICIAN') return;

    let isMounted = true;
    async function fetchTechStatus() {
      try {
        const [meData, notifData] = await Promise.all([
          fastFetch('/api/v1/technicians/me', { ttlMs: 30000 }),
          fastFetch('/api/v1/technicians/notifications', { ttlMs: 30000 }),
        ]);

        if (meData?.technician?.availableStatus && isMounted) {
          setAvailableStatus(meData.technician.availableStatus);
        }
        if (typeof notifData?.unreadCount === 'number' && isMounted) {
          setUnreadNotifications(notifData.unreadCount);
        }
      } catch {
        // Silent catch for background poll
      }
    }

    fetchTechStatus();
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const handleToggleAvailability = async () => {
    if (loadingStatus) return;
    const prevStatus = availableStatus;
    const nextStatus = prevStatus === 'AVAILABLE' ? 'OFFLINE' : 'AVAILABLE';

    // Zero-wait optimistic UI transition
    setAvailableStatus(nextStatus);
    setLoadingStatus(true);

    try {
      invalidateFastCache('/api/v1/technicians/me');
      const res = await fetch('/api/v1/technicians/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availableStatus: nextStatus }),
      });
      if (!res.ok) {
        // Rollback on rejection
        setAvailableStatus(prevStatus);
      }
    } catch {
      setAvailableStatus(prevStatus);
    } finally {
      setLoadingStatus(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    router.push('/technician/login');
  };

  const navLinks = [
    { href: '/technician/dashboard', label: t('customer.dashboard', 'Workspace'), icon: LayoutDashboard },
    { href: '/technician/jobs', label: t('technician.marketplace', 'Jobs & Orders'), icon: Wrench },
    { href: '/technician/schedule', label: t('technician.schedule', 'Calendar'), icon: CalendarCheck },
    { href: '/technician/earnings', label: t('technician.earnings', 'Earnings & Wallet'), icon: DollarSign },
    { href: '/technician/availability', label: t('technician.onlineStatus', 'Availability'), icon: Clock },
    { href: '/technician/support', label: t('navigation.support', 'Support Desk'), icon: LifeBuoy },
  ];

  return (
    <>
      {/* ═══ TOP DISPATCH HOTLINE BAR (Desktop Only) ═══ */}
      <div className="bg-slate-950/90 backdrop-blur-md text-slate-300 text-xs py-1.5 px-4 hidden md:block border-b border-white/10 relative z-50">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 flex items-center justify-between text-[11px] xl:text-xs">
          <div className="flex items-center gap-4">
            <a href="tel:01733983752" className="flex items-center gap-1.5 text-slate-300 hover:text-white transition">
              <PhoneCall className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Technician Dispatch Desk: <strong className="text-white">01733 983752</strong></span>
            </a>
            <span className="text-slate-600">|</span>
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified Field Workforce
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/technician/reviews" className="text-slate-300 hover:text-white transition flex items-center gap-1">
              <Star className="w-3 h-3 text-amber-400 shrink-0" />
              <span>Ratings &amp; Reviews</span>
            </Link>
            <span className="text-slate-600">|</span>
            <Link href="/technician/profile" className="text-slate-300 hover:text-white transition flex items-center gap-1">
              <UserIcon className="w-3 h-3 text-sky-400 shrink-0" />
              <span>Profile Settings</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ═══ MOBILE HEADER (App-Style) ═══ */}
      <header className="lg:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200/90 shadow-xs select-none">
        <div className="px-3 h-14 flex items-center justify-between">
          <Link href="/technician/dashboard" className="flex items-center gap-2">
            <Image src="/brand/needelectro-icon.png" alt="NEED ELECTRO" width={28} height={28} className="rounded-lg shadow-xs" />
            <div>
              <p className="font-black text-xs text-slate-900 leading-tight">NEED ELECTRO</p>
              <span className="text-[9px] uppercase font-black px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200">
                Technician
              </span>
            </div>
          </Link>

            {/* Language Switcher Mobile */}
            <LanguageSwitcher variant="header-mobile" />

            <button
              onClick={handleToggleAvailability}
              disabled={loadingStatus}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black border transition ${
                availableStatus === 'AVAILABLE'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-slate-100 text-slate-600 border-slate-300'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${availableStatus === 'AVAILABLE' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
              <span>{availableStatus === 'AVAILABLE' ? t('technician.available', 'Online') : t('technician.offline', 'Offline')}</span>
            </button>

            <Link
              href="/technician/notifications"
              className="relative p-2 text-slate-600 hover:text-brand-600 rounded-xl"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-brand-600 rounded-xl focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>

      {/* ═══ MOBILE NAVIGATION DRAWER ═══ */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative ml-auto w-[85vw] max-w-sm bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-right overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2">
                <Image src="/brand/needelectro-icon.png" alt="NEED ELECTRO" width={28} height={28} className="rounded-lg" />
                <div>
                  <p className="font-black text-sm text-slate-900 leading-tight">NEED ELECTRO</p>
                  <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">Technician Portal</p>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-slate-500 hover:text-slate-900 rounded-xl"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Drawer Language Selector */}
            <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/70">
              <LanguageSwitcher variant="drawer" />
            </div>

            {/* User Profile Summary */}
            <div className="px-4 py-3 bg-amber-50/50 border-b border-amber-100/60 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-black text-base shadow-sm shrink-0">
                  {user?.name?.charAt(0).toUpperCase() || 'T'}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm text-slate-900 truncate">{user?.name}</p>
                  <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                    Technician Account
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-3 py-3 space-y-1">
              {[
                { href: '/technician/dashboard', label: 'Workspace Dashboard', icon: LayoutDashboard },
                { href: '/technician/jobs', label: 'Job Marketplace & Orders', icon: Wrench },
                { href: '/technician/schedule', label: 'Dispatch Calendar', icon: CalendarCheck },
                { href: '/technician/earnings', label: 'Earnings & Payouts', icon: DollarSign },
                { href: '/technician/availability', label: 'Working Schedule', icon: Clock },
                { href: '/technician/profile', label: 'Professional Profile', icon: UserIcon },
                { href: '/technician/reviews', label: 'Ratings & Performance', icon: Star },
                { href: '/technician/support', label: 'Support & Disputes', icon: LifeBuoy },
              ].map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href || pathname?.startsWith(href + '/');
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                      isActive
                        ? 'bg-amber-50 text-amber-900 border border-amber-200/80 shadow-xs'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-amber-600' : 'text-slate-400'}`} />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Logout button at bottom */}
            <div className="p-4 border-t border-slate-100 shrink-0">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl border border-red-200 transition"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ DESKTOP HEADER ═══ */}
      <header className="hidden lg:block sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-[0_2px_15px_rgba(15,23,42,0.04)]">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
          <div className="flex items-center justify-between h-18 gap-4">
            {/* Logo */}
            <Link href="/technician/dashboard" className="flex items-center gap-3 shrink-0 group">
              <Image
                src="/brand/needelectro-icon.png"
                alt="NEED ELECTRO"
                width={36}
                height={36}
                className="rounded-xl shadow-xs group-hover:scale-105 transition-transform"
                priority
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-base text-slate-900 tracking-tight">NEED ELECTRO</span>
                  <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                    Technician
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium">Workforce Operations Portal</p>
              </div>
            </Link>

            {/* Navigation Links */}
            <nav className="flex items-center gap-1 shrink-0">
              {navLinks.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href || pathname?.startsWith(href + '/');
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/25'
                        : 'text-slate-700 hover:text-amber-800 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right Controls */}
            <div className="flex items-center gap-2 xl:gap-3 shrink-0">
              {/* Online/Offline Toggle */}
              <button
                onClick={handleToggleAvailability}
                disabled={loadingStatus}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black border transition shadow-xs ${
                  availableStatus === 'AVAILABLE'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                    : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                }`}
                title="Toggle Job Dispatch Availability"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    availableStatus === 'AVAILABLE' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                  }`}
                />
                <span>{availableStatus === 'AVAILABLE' ? t('technician.available', 'Online') : t('technician.offline', 'Offline')}</span>
              </button>

              {/* Notifications */}
              <Link
                href="/technician/notifications"
                className="relative p-2 text-slate-600 hover:text-amber-600 hover:bg-slate-100 rounded-xl transition"
                title="Notifications"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </span>
                )}
              </Link>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition text-xs font-semibold shadow-xs"
                  aria-expanded={accountMenuOpen}
                >
                  <div className="w-6 h-6 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {user?.name?.charAt(0).toUpperCase() || 'T'}
                  </div>
                  <span className="max-w-[100px] truncate">{user?.name?.split(' ')[0] || 'Technician'}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${accountMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {accountMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setAccountMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs text-slate-500">Signed in as</p>
                        <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-50 text-amber-800 border border-amber-200">
                          Verified Technician
                        </span>
                      </div>
                      <Link
                        href="/technician/dashboard"
                        onClick={() => setAccountMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-amber-800 transition"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-amber-600" /> Workspace
                      </Link>
                      <Link
                        href="/technician/jobs"
                        onClick={() => setAccountMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-amber-800 transition"
                      >
                        <Wrench className="w-3.5 h-3.5 text-amber-600" /> My Jobs &amp; Offers
                      </Link>
                      <Link
                        href="/technician/earnings"
                        onClick={() => setAccountMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-amber-800 transition"
                      >
                        <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Earnings &amp; Wallet
                      </Link>
                      <Link
                        href="/technician/profile"
                        onClick={() => setAccountMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-amber-800 transition"
                      >
                        <UserIcon className="w-3.5 h-3.5 text-purple-600" /> Profile Settings
                      </Link>
                      <Link
                        href="/technician/support"
                        onClick={() => setAccountMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-amber-800 transition"
                      >
                        <LifeBuoy className="w-3.5 h-3.5 text-sky-600" /> Support &amp; Disputes
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 text-left border-t border-slate-100 mt-1 transition"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
