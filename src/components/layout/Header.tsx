'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { useCart } from '@/lib/context/CartContext';
import BrandLogo from '@/components/common/BrandLogo';
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
  LifeBuoy,
} from 'lucide-react';
import { isShopEnabled } from '@/lib/featureFlags';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function Header() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
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

  return (
    <>
      {/* ═══ TOP HOTLINE BAR (Desktop Only) ═══ */}
      <div className="bg-slate-950/85 backdrop-blur-md text-slate-300 text-xs py-1.5 px-4 hidden md:block border-b border-white/10 relative z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="tel:01733983752" className="flex items-center gap-1.5 text-slate-300 hover:text-white transition">
              <PhoneCall className="w-3.5 h-3.5 text-brand-400" />
              Hotline: <strong className="text-white">01733 983752</strong>
            </a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/training" className="text-slate-300 hover:text-white transition flex items-center gap-1">
              <GraduationCap className="w-3 h-3 text-amber-400" />
              Academy
            </Link>
            <span className="text-slate-600">|</span>
            <Link href="/branches" className="text-slate-300 hover:text-white transition flex items-center gap-1">
              <Building2 className="w-3 h-3 text-sky-400" />
              Branches
            </Link>
            <span className="text-slate-600">|</span>
            <Link href="/become-a-technician" className="text-slate-300 hover:text-white transition flex items-center gap-1">
              <Wrench className="w-3 h-3 text-brand-400" />
              Become a Technician
            </Link>
            <span className="text-slate-600">|</span>
            <Link href="/warranty" className="text-slate-300 hover:text-white transition flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              Warranty Check
            </Link>
          </div>
        </div>
      </div>

      {/* ═══ MOBILE HEADER (App-Style, lg:hidden) ═══ */}
      <header className="lg:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200/90 shadow-[0_1px_8px_rgba(15,23,42,0.06)] select-none pt-safe">
        <div className="px-3 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 app-tap" aria-label="NEED ELECTRO Home">
            <div className="w-8 h-8 rounded-xl bg-white p-0.5 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.08)] flex items-center justify-center shrink-0">
              <Image
                src="/brand/needelectro-icon.png"
                alt="NEED ELECTRO"
                width={26}
                height={26}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="font-black text-sm text-slate-950 tracking-tight leading-none">NEED ELECTRO</span>
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
              </div>
              <span className="text-[9px] font-bold text-slate-500 leading-none mt-0.5">Tech &amp; Electrical Services</span>
            </div>
          </Link>

          {/* Right Actions */}
          <div className="flex items-center gap-1.5">
            {/* PWA App Install Button */}
            {!isInstalled && (
              <button
                type="button"
                onClick={handleInstallClick}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-brand-600 via-brand-500 to-sky-500 text-white text-[11px] font-black shadow-sm active:scale-95 border border-white/40 app-tap shrink-0"
                title="Install as Mobile App"
                aria-label="Install NEED ELECTRO as Mobile App"
              >
                <Smartphone className="w-3.5 h-3.5 animate-pulse" />
                <span>App</span>
              </button>
            )}

            {/* Hotline Call */}
            <a
              href="tel:01733983752"
              className="p-1.5 text-slate-600 hover:text-brand-600 rounded-xl app-tap"
              title="Call 24/7 Hotline"
              aria-label="Call NEED ELECTRO Hotline"
            >
              <PhoneCall className="w-4 h-4 text-brand-600" />
            </a>

            {/* Search */}
            <button
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-slate-600 hover:text-brand-600 rounded-xl app-tap"
              title="Search"
              aria-label="Search services and products"
            >
              <Search className="w-[18px] h-[18px]" />
            </button>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2 text-slate-600 hover:text-brand-600 rounded-xl app-tap"
              title="View Cart"
              aria-label="View Cart"
            >
              <ShoppingCart className="w-[18px] h-[18px]" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-brand-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs animate-in zoom-in">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>

            {/* Hamburger Menu */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-brand-600 rounded-xl app-tap focus:outline-none"
              aria-label="Open mobile navigation drawer"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
                  placeholder="Search laptops, CCTV, services..."
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
                    <Link href="/customer/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-brand-700 bg-white rounded-xl border border-brand-200 app-tap">
                      <LayoutDashboard className="w-3.5 h-3.5" /> My Account
                    </Link>
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

            {/* Navigation Links */}
            <nav className="flex-1 px-3 py-3 space-y-0.5">
              {[
                { href: '/', label: 'Home', icon: Home, color: 'text-brand-500 bg-brand-50' },
                { href: '/services', label: 'Services', icon: Zap, color: 'text-amber-500 bg-amber-50' },
                { href: '/booking', label: 'Book a Service', icon: CalendarCheck, color: 'text-brand-600 bg-brand-50' },
                { href: '/shop', label: 'Shop', icon: ShoppingBag, color: 'text-indigo-500 bg-indigo-50' },
                { href: '/technician/dashboard', label: 'Technician Portal', icon: Wrench, color: 'text-amber-600 bg-amber-50' },
                { href: '/admin', label: 'Admin Control Center', icon: LayoutDashboard, color: 'text-slate-700 bg-slate-100' },
                { href: '/support', label: 'Support & Hotline', icon: LifeBuoy, color: 'text-sky-500 bg-sky-50' },
                { href: '/parts', label: 'Parts & Materials', icon: ShoppingBag, color: 'text-purple-500 bg-purple-50' },
                { href: '/warranty', label: 'Service Warranty', icon: ShieldCheck, color: 'text-emerald-500 bg-emerald-50' },
                { href: '/technicians', label: 'Verified Technicians', icon: Users, color: 'text-teal-500 bg-teal-50' },
                { href: '/locations', label: '64 Districts Coverage', icon: MapPin, color: 'text-rose-500 bg-rose-50' },
                { href: '/training', label: 'Skills Academy', icon: GraduationCap, color: 'text-blue-500 bg-blue-50' },
              ].map(({ href, label, icon: Icon, color }) => {
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
              <Link href="/services" onClick={() => setMobileMenuOpen(false)} className="btn-primary w-full justify-center py-3 app-tap">
                <Zap className="w-4 h-4 mr-2 fill-white" /> Book a Service Now
              </Link>
              <a href="tel:01733983752" className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold text-slate-600 bg-slate-50 rounded-xl border border-slate-200 app-tap">
                <PhoneCall className="w-4 h-4 text-brand-500" /> 01733 983752
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ═══ DESKTOP HEADER (hidden on mobile) ═══ */}
      <header className="hidden lg:block sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-white/80 shadow-[0_2px_15px_rgba(15,23,42,0.04)] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <BrandLogo priority size="md" />

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1.5 font-medium">
              {[
                { href: '/', label: 'Home', icon: Home, active: pathname === '/' },
                { href: '/services', label: 'Services', icon: Zap, active: pathname?.startsWith('/services') },
                { href: '/shop', label: 'Shop', icon: ShoppingBag, active: pathname?.startsWith('/shop') },
                { href: '/support', label: 'Support', icon: LifeBuoy, active: pathname?.startsWith('/support') },
              ].map(({ href, label, icon: Icon, active }) => (
                <Link
                  key={href}
                  href={href}
                  className={`group flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 border ${
                    active
                      ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white border-white/25 shadow-md shadow-brand-500/25 scale-[1.02]'
                      : 'bg-white/65 hover:bg-white/95 text-slate-700 hover:text-brand-600 border-white/85 hover:border-brand-200/80 backdrop-blur-md shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-md hover:-translate-y-0.5 active:scale-95'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 transition-transform duration-200 group-hover:scale-110 ${active ? 'text-white' : ''}`} />
                  <span>{label}</span>
                </Link>
              ))}

              {/* More Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                  className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 border ${
                    moreMenuOpen
                      ? 'bg-white text-brand-600 border-brand-300 shadow-sm'
                      : 'bg-white/50 hover:bg-white/90 text-slate-600 hover:text-slate-900 border-white/80 backdrop-blur-md shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-sm'
                  }`}
                  aria-expanded={moreMenuOpen}
                >
                  <span>More</span>
                  <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${moreMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {moreMenuOpen && (
                  <div className="absolute top-full mt-2 right-0 w-56 bg-white/96 backdrop-blur-xl border border-white/90 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    {[
                      { href: '/booking', label: 'Book a Service', icon: CalendarCheck, color: 'text-brand-600' },
                      { href: '/technician/dashboard', label: 'Technician Portal', icon: Wrench, color: 'text-amber-600' },
                      { href: '/customer/dashboard?tab=bookings', label: 'My Bookings', icon: ClipboardList, color: 'text-indigo-600' },
                      { href: '/parts', label: 'Parts & Materials', icon: ShoppingBag, color: 'text-purple-600' },
                      { href: '/warranty', label: 'Service Warranty Check', icon: ShieldCheck, color: 'text-emerald-500' },
                      { href: '/technicians', label: 'Verified Technicians', icon: Users, color: 'text-sky-500' },
                      { href: '/locations', label: '64 Districts Coverage', icon: MapPin, color: 'text-teal-500' },
                      { href: '/training', label: 'Training Academy', icon: GraduationCap, color: 'text-amber-500' },
                      { href: '/software', label: 'Software & ERP', icon: Layers, color: 'text-brand-500' },
                      { href: '/branches', label: 'Branch Network', icon: Building2, color: 'text-sky-600' },
                      { href: '/about', label: 'About Us', icon: Store, color: 'text-slate-500' },
                    ].map(({ href, label, icon: Icon, color }) => (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setMoreMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-brand-50 hover:text-brand-600 transition"
                      >
                        <Icon className={`w-4 h-4 ${color} shrink-0`} />
                        <span>{label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </nav>

            {/* Desktop Right Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {/* PWA Install (xl+) */}
              {!isInstalled && (
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-brand-200 bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold transition shadow-xs app-tap"
                  title="Install as Mobile App"
                >
                  <Smartphone className="w-3.5 h-3.5 text-brand-600 animate-pulse" />
                  <span>Install App</span>
                </button>
              )}

              {/* Search */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2.5 text-slate-600 hover:text-brand-500 hover:bg-slate-100 rounded-xl transition-all"
                title="Search services and products"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Cart */}
              <Link
                href="/cart"
                className="relative p-2.5 text-slate-600 hover:text-brand-500 hover:bg-slate-100 rounded-xl transition-all"
                title="View Cart"
                aria-label="View Cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-xs animate-in zoom-in">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </Link>

              {/* Account */}
              <div className="relative">
                {user ? (
                  <>
                    <button
                      onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/80 bg-white/60 backdrop-blur-md hover:bg-white/90 hover:border-brand-300 transition-all text-xs font-semibold shadow-xs"
                      aria-expanded={accountMenuOpen}
                    >
                      <div className="w-7 h-7 rounded-lg bg-brand-500 text-white flex items-center justify-center font-bold shadow-xs text-xs shrink-0">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="hidden md:inline max-w-[90px] truncate">{user.name.split(' ')[0]}</span>
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${accountMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {accountMenuOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white/90 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/80 py-2 z-50 animate-in fade-in zoom-in-95">
                        <div className="px-4 py-2 border-b border-slate-100/80">
                          <p className="text-xs text-slate-500">Signed in as</p>
                          <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                          <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-brand-500/10 text-brand-600 border border-brand-500/20">
                            {user.role}
                          </span>
                        </div>
                        {user.role === 'CUSTOMER' && (
                          <Link href="/customer/dashboard" onClick={() => setAccountMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-white/80 hover:text-brand-600 transition">
                            <LayoutDashboard className="w-4 h-4 text-brand-500" /> Customer Portal
                          </Link>
                        )}
                        {user.role === 'TECHNICIAN' && (
                          <Link href="/technician/dashboard" onClick={() => setAccountMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-white/80 hover:text-emerald-600 transition">
                            <LayoutDashboard className="w-4 h-4 text-emerald-500" /> Technician Workspace
                          </Link>
                        )}
                        {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
                          <Link href="/admin" onClick={() => setAccountMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-white/80 hover:text-amber-600 transition">
                            <LayoutDashboard className="w-4 h-4 text-amber-500" /> Admin Console
                          </Link>
                        )}
                        <button
                          onClick={() => { logout(); setAccountMenuOpen(false); }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50/80 text-left border-t border-slate-100/80 mt-1 transition"
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="hidden sm:flex items-center gap-2">
                    <Link href="/customer/login" className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-brand-600 rounded-xl bg-white/60 hover:bg-white/90 border border-white/80 backdrop-blur-md shadow-xs transition">
                      <UserIcon className="w-3.5 h-3.5 text-brand-500" />
                      Sign In
                    </Link>
                    <Link href="/technician/login" className="hidden md:flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-amber-800 hover:text-amber-900 rounded-xl bg-amber-50/90 hover:bg-amber-100 border border-amber-200/60 backdrop-blur-md transition" title="Technician Workspace Portal">
                      <Wrench className="w-3.5 h-3.5 text-amber-600" />
                      Technician
                    </Link>
                  </div>
                )}
              </div>

              {/* Book Service CTA */}
              <Link href="/services" className="hidden sm:inline-flex btn-primary text-xs sm:text-sm py-2 px-4">
                <Zap className="w-4 h-4 mr-1.5 fill-white" />
                Book Service
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
