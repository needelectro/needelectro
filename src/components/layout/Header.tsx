'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { useCart } from '@/lib/context/CartContext';
import BrandLogo from '@/components/common/BrandLogo';
import TechnicianHeader from '@/components/layout/TechnicianHeader';
import {
  Home,
  Search,
  ShoppingCart,
  User as UserIcon,
  Zap,
  Menu,
  X,
  PhoneCall,
  ShieldCheck,
  Wrench,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  DollarSign,
  GraduationCap,
  Building2,
  Store,
  MapPin,
  ShoppingBag,
  Users,
  Layers,
  Smartphone,
  Camera,
  Wifi,
  ArrowRight,
  CalendarCheck,
  ClipboardList,
  Clock,
  LifeBuoy,
} from 'lucide-react';
import { isShopEnabled } from '@/lib/featureFlags';
import { useLanguage } from '@/lib/context/LanguageContext';
import LanguageSwitcher from '@/components/common/LanguageSwitcher';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function Header() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const { t } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  // Close all menus on navigation
  useEffect(() => {
    setMoreMenuOpen(false);
    setAccountMenuOpen(false);
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  // PWA Install Prompt capture
  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone) {
      setIsInstalled(true);
    }
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => { setIsInstalled(true); setDeferredPrompt(null); });
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Lock body scroll only when mobile menu is explicitly open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [mobileMenuOpen]);

  const handleInstallClick = useCallback(async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  // Isolate Admin: Do not render the public header for admin users or on /admin routes
  const isAdmin = user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN');
  if (pathname?.startsWith('/admin') || isAdmin) {
    return null;
  }

  // Isolate Technician: Do not render the public customer header for technician users or on /technician routes
  const isTechnician = user && user.role === 'TECHNICIAN';
  if (pathname?.startsWith('/technician') || isTechnician) {
    if (pathname === '/technician/login' || pathname === '/technician/register') {
      return null;
    }
    return <TechnicianHeader />;
  }

  return (
    <>
      {/* ═══ TOP HOTLINE BAR (Desktop Only) ═══ */}
      <div className="bg-slate-950/85 backdrop-blur-md text-slate-300 text-xs py-1.5 px-3 sm:px-4 lg:px-6 xl:px-8 hidden md:block border-b border-white/10 relative z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-[11px] xl:text-xs">
          <div className="flex items-center gap-3 xl:gap-4 shrink-0">
            <a href="tel:01733983752" className="flex items-center gap-1.5 text-slate-300 hover:text-white transition">
              <PhoneCall className="w-3.5 h-3.5 text-brand-400 shrink-0" />
              <span>{t('common.hotlineLabel', 'Hotline')}: <strong className="text-white">01733 983752</strong></span>
            </a>
          </div>
          <div className="flex items-center gap-2 lg:gap-3 xl:gap-4 shrink-0">
            <Link href="/training" className="text-slate-300 hover:text-white transition flex items-center gap-1">
              <GraduationCap className="w-3 h-3 text-amber-400 shrink-0" />
              <span>{t('navigation.academy', 'Academy')}</span>
            </Link>
            <span className="text-slate-600">|</span>
            <Link href="/branches" className="text-slate-300 hover:text-white transition flex items-center gap-1">
              <Building2 className="w-3 h-3 text-sky-400 shrink-0" />
              <span>{t('navigation.branches', 'Branches')}</span>
            </Link>
            <span className="text-slate-600">|</span>
            <Link href="/become-a-technician" className="text-slate-300 hover:text-white transition flex items-center gap-1">
              <Wrench className="w-3 h-3 text-brand-400 shrink-0" />
              <span>{t('navigation.becomeTechnician', 'Become a Technician')}</span>
            </Link>
            <span className="text-slate-600">|</span>
            <Link href="/warranty" className="text-slate-300 hover:text-white transition flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>{t('navigation.warrantyCheck', 'Warranty Check')}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ═══ MOBILE HEADER (App-Style, lg:hidden) ═══ */}
      <header className="lg:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200/90 shadow-[0_1px_8px_rgba(15,23,42,0.06)] select-none pt-safe">
        <div className="px-2.5 sm:px-3 h-14 flex items-center justify-between gap-1 w-full max-w-full">
          {/* Logo (compact for mobile screens to give full room to action buttons) */}
          <div className="min-w-0 shrink flex items-center">
            <BrandLogo size="xs" priority showSubtitle={false} />
          </div>

          {/* Right Actions - Guaranteed fit and visibility on small screens */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">

            {/* Hotline Call */}
            <a
              href="tel:01733983752"
              className="w-8 h-8 sm:w-8.5 sm:h-8.5 flex items-center justify-center text-brand-600 bg-brand-50/90 hover:bg-brand-100 hover:text-brand-700 rounded-lg sm:rounded-xl border border-brand-200/50 app-tap transition shrink-0"
              title="Call 24/7 Hotline: 01733 983752"
              aria-label="Call NEED ELECTRO Hotline"
            >
              <PhoneCall className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-600" />
            </a>

            {/* Search */}
            <button
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              className="w-8 h-8 sm:w-8.5 sm:h-8.5 flex items-center justify-center text-slate-600 hover:text-brand-600 hover:bg-slate-100 rounded-lg sm:rounded-xl app-tap transition shrink-0"
              title={t('common.search', 'Search')}
              aria-label="Search services and products"
            >
              <Search className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
            </button>

            {/* Cart (Hidden for Technician) */}
            {user?.role !== 'TECHNICIAN' && (
              <Link
                href="/cart"
                className="relative w-8 h-8 sm:w-8.5 sm:h-8.5 flex items-center justify-center text-slate-600 hover:text-brand-600 hover:bg-slate-100 rounded-lg sm:rounded-xl app-tap transition shrink-0"
                title={t('navigation.viewCart', 'View Cart')}
                aria-label="View Cart"
              >
                <ShoppingCart className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs animate-in zoom-in">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </Link>
            )}

            {/* Hamburger Menu */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-8 h-8 sm:w-8.5 sm:h-8.5 flex items-center justify-center text-slate-700 hover:text-brand-600 hover:bg-slate-100 rounded-lg sm:rounded-xl app-tap focus:outline-none transition shrink-0"
              aria-label="Open mobile navigation drawer"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-4.5 h-4.5 sm:w-5 sm:h-5" /> : <Menu className="w-4.5 h-4.5 sm:w-5 sm:h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Overlay */}
        {searchOpen && (
          <div className="border-t border-slate-100 bg-white px-3 py-2.5 animate-in slide-in-from-top-1">
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="search"
                  placeholder={t('common.searchPlaceholder', 'Search laptops, CCTV, services...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400"
                  autoFocus
                />
              </div>
              <button type="submit" className="btn-primary text-xs px-3 py-2 rounded-xl shrink-0">
                Go
              </button>
            </form>
          </div>
        )}
      </header>

      {/* ═══ MOBILE NAVIGATION DRAWER OVERLAY ═══ */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 flex"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative ml-auto w-[85vw] max-w-sm bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-right overflow-y-auto">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2">
                <Image src="/brand/needelectro-icon.png" alt="NEED ELECTRO" width={28} height={28} className="rounded-lg" />
                <div>
                  <p className="font-black text-sm text-slate-900 leading-tight">NEED ELECTRO</p>
                  <p className="text-[10px] text-slate-500">Bangladesh</p>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl app-tap"
                aria-label="Close navigation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Profile Section */}
            {user ? (
              <div className="px-4 py-3 bg-brand-50/60 border-b border-brand-100/60 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-brand-500 text-white flex items-center justify-center font-black text-base shadow-sm shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-slate-900 truncate">{user.name}</p>
                    <span className="text-[10px] font-bold uppercase bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">{user.role}</span>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {user.role === 'CUSTOMER' && (
                    <>
                      <Link href="/customer/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-brand-700 bg-white rounded-xl border border-brand-200 app-tap">
                        <LayoutDashboard className="w-3.5 h-3.5" /> Portal
                      </Link>
                      <Link href="/customer/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-slate-700 bg-white rounded-xl border border-slate-200 app-tap">
                        <UserIcon className="w-3.5 h-3.5 text-brand-600" /> My Profile
                      </Link>
                    </>
                  )}
                  {user.role === 'TECHNICIAN' && (
                    <Link href="/technician/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-emerald-700 bg-white rounded-xl border border-emerald-200 app-tap">
                      <LayoutDashboard className="w-3.5 h-3.5" /> Workspace
                    </Link>
                  )}
                  <button
                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                    className="flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-red-600 bg-white rounded-xl border border-red-200 app-tap"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 shrink-0">
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/customer/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-brand-700 bg-white rounded-xl border border-brand-200 shadow-xs app-tap">
                    <UserIcon className="w-3.5 h-3.5" /> Customer Sign In
                  </Link>
                  <Link href="/technician/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-amber-800 bg-amber-50 rounded-xl border border-amber-200 shadow-xs app-tap">
                    <Wrench className="w-3.5 h-3.5" /> Technician Portal
                  </Link>
                </div>
              </div>
            )}

            {/* Mobile Drawer Language Selector */}
            <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/70">
              <LanguageSwitcher variant="drawer" />
            </div>

            {/* Navigation Links - Role Segregated */}
            <nav className="flex-1 px-3 py-3 space-y-0.5">
              {(user?.role === 'TECHNICIAN'
                ? [
                    { href: '/technician/dashboard', label: 'Technician Portal', icon: LayoutDashboard, color: 'text-brand-600 bg-brand-50' },
                    { href: '/technician/jobs', label: 'Job Marketplace & Orders', icon: Wrench, color: 'text-amber-600 bg-amber-50' },
                    { href: '/technician/schedule', label: 'Dispatch Calendar', icon: CalendarCheck, color: 'text-indigo-600 bg-indigo-50' },
                    { href: '/technician/earnings', label: 'Earnings & Payouts', icon: ShoppingBag, color: 'text-emerald-600 bg-emerald-50' },
                    { href: '/technician/availability', label: 'Working Schedule', icon: Clock, color: 'text-blue-600 bg-blue-50' },
                    { href: '/technician/profile', label: 'Professional Profile', icon: UserIcon, color: 'text-purple-600 bg-purple-50' },
                    { href: '/technician/reviews', label: 'Ratings & Performance', icon: ShieldCheck, color: 'text-teal-600 bg-teal-50' },
                    { href: '/technician/support', label: 'Support & Disputes', icon: LifeBuoy, color: 'text-sky-600 bg-sky-50' },
                  ]
                : [
                    { href: '/', label: 'Home', icon: Home, color: 'text-brand-500 bg-brand-50' },
                    { href: '/services', label: 'Services', icon: Zap, color: 'text-amber-500 bg-amber-50' },
                    { href: '/booking', label: 'Book a Service', icon: CalendarCheck, color: 'text-brand-600 bg-brand-50' },
                    { href: '/shop', label: 'Shop', icon: ShoppingBag, color: 'text-indigo-500 bg-indigo-50' },
                    ...(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'
                      ? [{ href: '/admin', label: 'Admin Control Center', icon: LayoutDashboard, color: 'text-slate-700 bg-slate-100' }]
                      : []),
                    { href: '/support', label: 'Support & Hotline', icon: LifeBuoy, color: 'text-sky-500 bg-sky-50' },
                    { href: '/parts', label: 'Parts & Materials', icon: ShoppingBag, color: 'text-purple-500 bg-purple-50' },
                    { href: '/warranty', label: 'Service Warranty', icon: ShieldCheck, color: 'text-emerald-500 bg-emerald-50' },
                    { href: '/locations', label: '64 Districts Coverage', icon: MapPin, color: 'text-rose-500 bg-rose-50' },
                    { href: '/training', label: 'Skills Academy', icon: GraduationCap, color: 'text-blue-500 bg-blue-50' },
                  ]
              ).map(({ href, label, icon: Icon, color }) => {
                const isActive = pathname === href || (href !== '/' && pathname?.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all app-tap ${
                      isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isActive ? 'bg-brand-100 text-brand-600' : color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span>{label}</span>
                    {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-500" />}
                  </Link>
                );
              })}
            </nav>

            {/* CTA Footer */}
            <div className="px-4 pb-6 pt-3 border-t border-slate-100 space-y-2 shrink-0">
              {user?.role === 'TECHNICIAN' ? (
                <Link href="/technician/jobs" onClick={() => setMobileMenuOpen(false)} className="btn-primary w-full justify-center py-3 app-tap">
                  <Wrench className="w-4 h-4 mr-2" /> View Assigned Jobs
                </Link>
              ) : (
                <Link href="/services" onClick={() => setMobileMenuOpen(false)} className="btn-primary w-full justify-center py-3 app-tap">
                  <Zap className="w-4 h-4 mr-2 fill-white" /> Book a Service Now
                </Link>
              )}
              <a href="tel:01733983752" className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold text-slate-600 bg-slate-50 rounded-xl border border-slate-200 app-tap">
                <PhoneCall className="w-4 h-4 text-brand-500" /> 01733 983752
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ═══ DESKTOP HEADER (hidden on mobile) ═══ */}
      <header className="hidden lg:block sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-white/80 shadow-[0_2px_15px_rgba(15,23,42,0.04)] transition-all">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="flex items-center justify-between h-20 gap-2 xl:gap-4">
            {/* Logo */}
            <BrandLogo priority size="md" subtitleClassName="hidden xl:block" />

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 font-medium shrink-0">
              {[
                { href: '/', label: t('navigation.home', 'Home'), icon: Home, active: pathname === '/' },
                { href: '/services', label: t('navigation.services', 'Services'), icon: Zap, active: pathname?.startsWith('/services') },
                { href: '/shop', label: t('navigation.shop', 'Shop'), icon: ShoppingBag, active: pathname?.startsWith('/shop') },
                { href: '/support', label: t('navigation.support', 'Support'), icon: LifeBuoy, active: pathname?.startsWith('/support') },
              ].map(({ href, label, icon: Icon, active }) => (
                <Link
                  key={href}
                  href={href}
                  className={`group flex items-center gap-1 xl:gap-1.5 px-2.5 xl:px-3 py-1.5 xl:py-2 rounded-xl text-xs font-bold transition-all duration-200 border whitespace-nowrap ${
                    active
                      ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white border-white/25 shadow-md shadow-brand-500/25 scale-[1.02]'
                      : 'bg-white/65 hover:bg-white/95 text-slate-700 hover:text-brand-600 border-white/85 hover:border-brand-200/80 backdrop-blur-md shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-md hover:-translate-y-0.5 active:scale-95'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 transition-transform duration-200 group-hover:scale-110 shrink-0 ${active ? 'text-white' : ''}`} />
                  <span>{label}</span>
                </Link>
              ))}

              {/* More Dropdown */}
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                  className={`flex items-center gap-1 px-2.5 xl:px-3 py-1.5 xl:py-2 rounded-xl text-xs font-bold transition-all duration-200 border whitespace-nowrap ${
                    moreMenuOpen
                      ? 'bg-white text-brand-600 border-brand-300 shadow-sm'
                      : 'bg-white/50 hover:bg-white/90 text-slate-600 hover:text-slate-900 border-white/80 backdrop-blur-md shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-sm'
                  }`}
                  aria-expanded={moreMenuOpen}
                >
                  <span>{t('navigation.more', 'More')}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${moreMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {moreMenuOpen && (
                  <>
                    {/* Click-outside backdrop */}
                    <div
                      className="fixed inset-0 z-40 bg-transparent"
                      onClick={() => setMoreMenuOpen(false)}
                      aria-hidden="true"
                    />

                    {/* Dropdown Menu Container */}
                    <div className="absolute top-full mt-3 right-0 w-[500px] max-w-[calc(100vw-2rem)] bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-slate-900/15 p-4 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="grid grid-cols-2 gap-3">
                        {/* Section 1 */}
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 pb-2">
                            Services &amp; Portal
                          </p>
                          <div className="space-y-1">
                            {[
                              { href: '/booking', label: 'Book a Service', desc: 'Request on-site technician', icon: CalendarCheck, color: 'text-brand-600', bg: 'bg-brand-50' },
                              { href: '/technician/dashboard', label: 'Technician Portal', desc: 'Workspace & live job queue', icon: Wrench, color: 'text-amber-600', bg: 'bg-amber-50' },
                              { href: '/customer/dashboard?tab=bookings', label: 'My Bookings', desc: 'Track orders & service visits', icon: ClipboardList, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                              { href: '/warranty', label: 'Service Warranty Check', desc: '30-day workmanship claim', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                              { href: '/technicians', label: 'Verified Technicians', desc: 'Certified expert directory', icon: Users, color: 'text-sky-600', bg: 'bg-sky-50' },
                            ].map(({ href, label, desc, icon: Icon, color, bg }) => (
                              <Link
                                key={href}
                                href={href}
                                onClick={() => setMoreMenuOpen(false)}
                                className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition group"
                              >
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${bg}`}>
                                  <Icon className={`w-4 h-4 ${color}`} />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-slate-800 group-hover:text-brand-600 transition truncate">{label}</p>
                                  <p className="text-[10px] text-slate-400 truncate">{desc}</p>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>

                        {/* Section 2 */}
                        <div className="border-l border-slate-100 pl-3">
                          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 pb-2">
                            Ecosystem &amp; Network
                          </p>
                          <div className="space-y-1">
                            {[
                              { href: '/parts', label: 'Parts & Materials', desc: 'Genuine electrical components', icon: ShoppingBag, color: 'text-purple-600', bg: 'bg-purple-50' },
                              { href: '/locations', label: '64 Districts Coverage', desc: 'Nationwide coverage hubs', icon: MapPin, color: 'text-rose-600', bg: 'bg-rose-50' },
                              { href: '/training', label: 'Training Academy', desc: 'Professional certification', icon: GraduationCap, color: 'text-amber-600', bg: 'bg-amber-50' },
                              { href: '/software', label: 'Software & ERP', desc: 'Enterprise management', icon: Layers, color: 'text-brand-600', bg: 'bg-brand-50' },
                              { href: '/branches', label: 'Branch Network', desc: 'Physical outlets & support', icon: Building2, color: 'text-cyan-600', bg: 'bg-cyan-50' },
                              { href: '/about', label: 'About Us', desc: 'Mission, team & vision', icon: Store, color: 'text-slate-600', bg: 'bg-slate-100' },
                            ].map(({ href, label, desc, icon: Icon, color, bg }) => (
                              <Link
                                key={href}
                                href={href}
                                onClick={() => setMoreMenuOpen(false)}
                                className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition group"
                              >
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${bg}`}>
                                  <Icon className={`w-4 h-4 ${color}`} />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-slate-800 group-hover:text-brand-600 transition truncate">{label}</p>
                                  <p className="text-[10px] text-slate-400 truncate">{desc}</p>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </nav>

            {/* Desktop Right Actions */}
            <div className="flex items-center gap-1.5 xl:gap-2 shrink-0">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 xl:p-2.5 text-slate-600 hover:text-brand-500 hover:bg-slate-100 rounded-xl transition-all"
                title={t('common.search', 'Search')}
                aria-label="Search"
              >
                <Search className="w-4 h-4 xl:w-5 xl:h-5" />
              </button>

              {/* Cart (Hidden for Technician) */}
              {user?.role !== 'TECHNICIAN' && (
                <Link
                  href="/cart"
                  className="relative p-2 xl:p-2.5 text-slate-600 hover:text-brand-500 hover:bg-slate-100 rounded-xl transition-all"
                  title="View Cart"
                  aria-label="View Cart"
                >
                  <ShoppingCart className="w-4 h-4 xl:w-5 xl:h-5" />
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-brand-500 text-white text-[10px] font-black w-4 h-4 xl:w-5 xl:h-5 rounded-full flex items-center justify-center shadow-xs animate-in zoom-in">
                      {itemCount > 9 ? '9+' : itemCount}
                    </span>
                  )}
                </Link>
              )}

              {/* Account */}
              <div className="relative">
                {user ? (
                  <>
                    <button
                      onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                      className="flex items-center gap-1.5 xl:gap-2 px-2.5 xl:px-3 py-1.5 rounded-xl border border-white/80 bg-white/60 backdrop-blur-md hover:bg-white/90 hover:border-brand-300 transition-all text-xs font-semibold shadow-xs"
                      aria-expanded={accountMenuOpen}
                    >
                      <div className="w-6 h-6 xl:w-7 xl:h-7 rounded-lg bg-brand-500 text-white flex items-center justify-center font-bold shadow-xs text-xs shrink-0">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="hidden sm:inline max-w-[75px] xl:max-w-[95px] truncate">{user.name.split(' ')[0]}</span>
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${accountMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {accountMenuOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-40 bg-transparent"
                          onClick={() => setAccountMenuOpen(false)}
                          aria-hidden="true"
                        />
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl shadow-slate-900/15 border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                          <div className="px-4 py-2 border-b border-slate-100">
                            <p className="text-xs text-slate-500">Signed in as</p>
                            <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                            <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-brand-50 text-brand-600 border border-brand-200">
                              {user.role}
                            </span>
                          </div>
                          {user.role === 'CUSTOMER' && (
                            <>
                              <Link href="/customer/dashboard" onClick={() => setAccountMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition">
                                <LayoutDashboard className="w-4 h-4 text-brand-500" /> Customer Portal
                              </Link>
                              <Link href="/customer/profile" onClick={() => setAccountMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition">
                                <UserIcon className="w-4 h-4 text-brand-500" /> My Profile
                              </Link>
                              <Link href="/customer/dashboard?tab=bookings" onClick={() => setAccountMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition">
                                <CalendarCheck className="w-4 h-4 text-brand-500" /> My Service Bookings
                              </Link>
                              <Link href="/customer/dashboard?tab=orders" onClick={() => setAccountMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition">
                                <ShoppingBag className="w-4 h-4 text-brand-500" /> My Orders
                              </Link>
                            </>
                          )}
                          {user.role === 'TECHNICIAN' && (
                            <>
                              <Link href="/technician/dashboard" onClick={() => setAccountMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition">
                                <LayoutDashboard className="w-4 h-4 text-brand-500" /> Technician Dashboard
                              </Link>
                              <Link href="/technician/jobs" onClick={() => setAccountMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition">
                                <Wrench className="w-4 h-4 text-brand-500" /> My Jobs &amp; Offers
                              </Link>
                              <Link href="/technician/schedule" onClick={() => setAccountMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition">
                                <CalendarCheck className="w-4 h-4 text-indigo-500" /> Dispatch Calendar
                              </Link>
                              <Link href="/technician/earnings" onClick={() => setAccountMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-emerald-600 transition">
                                <DollarSign className="w-4 h-4 text-emerald-500" /> Earnings &amp; Wallet
                              </Link>
                              <Link href="/technician/profile" onClick={() => setAccountMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition">
                                <UserIcon className="w-4 h-4 text-purple-500" /> Profile Settings
                              </Link>
                            </>
                          )}
                          {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
                            <Link href="/admin" onClick={() => setAccountMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-amber-600 transition">
                              <LayoutDashboard className="w-4 h-4 text-amber-500" /> Admin Console
                            </Link>
                          )}
                          <button
                            onClick={() => { logout(); setAccountMenuOpen(false); }}
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left border-t border-slate-100 mt-1 transition"
                          >
                            <LogOut className="w-4 h-4" /> Sign Out
                          </button>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="flex items-center gap-1.5 xl:gap-2">
                    <Link href="/customer/login" className="flex items-center gap-1 xl:gap-1.5 px-2.5 xl:px-3.5 py-1.5 xl:py-2 text-xs font-bold text-slate-700 hover:text-brand-600 rounded-xl bg-white/60 hover:bg-white/90 border border-white/80 backdrop-blur-md shadow-xs transition whitespace-nowrap">
                      <UserIcon className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                      <span>{t('navigation.signIn', 'Sign In')}</span>
                    </Link>
                    <Link href="/technician/login" className="hidden xl:flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 xl:py-2 text-xs font-bold text-amber-800 hover:text-amber-900 rounded-xl bg-amber-50/90 hover:bg-amber-100 border border-amber-200/60 backdrop-blur-md transition whitespace-nowrap" title="Technician Workspace Portal">
                      <Wrench className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>{t('common.technician', 'Technician')}</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* Book Service CTA */}
              <Link href="/booking" className="inline-flex btn-primary text-xs xl:text-sm py-2 px-3 xl:px-4 shadow-md shadow-brand-500/20 shrink-0 whitespace-nowrap">
                <Zap className="w-3.5 h-3.5 xl:w-4 xl:h-4 mr-1 xl:mr-1.5 fill-white shrink-0" />
                <span>{t('navigation.bookService', 'Book Service')}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Desktop Search Bar (Expands on click) */}
        {searchOpen && (
          <div className="border-t border-white/60 bg-white/80 backdrop-blur-2xl px-4 py-3 shadow-lg animate-in fade-in">
            <form onSubmit={handleSearchSubmit} className="max-w-3xl mx-auto flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  placeholder="Search electrical services, CCTV, laptops, components..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-white/70 border border-white/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 backdrop-blur-md shadow-inner"
                  autoFocus
                />
              </div>
              <button type="submit" className="btn-primary text-xs px-4">
                Search
              </button>
            </form>
          </div>
        )}
      </header>
    </>
  );
}
