'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import { useCart } from '@/lib/context/CartContext';
import BrandLogo from '@/components/common/BrandLogo';
import { 
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
  Store
} from 'lucide-react';

export default function Header() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <>
      {/* Top Hotline Bar */}
      <div className="bg-slate-950/85 backdrop-blur-md text-slate-300 text-xs py-1.5 px-4 hidden md:block border-b border-white/10 relative z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-300">
              <PhoneCall className="w-3.5 h-3.5 text-brand-400" />
              Hotline: <strong className="text-white">01733 983752</strong>
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">Shop #5, MR Plaza, Kusumbag, Moulvibazar</span>
            <span className="text-slate-600">|</span>
            <span className="text-brand-400 font-medium">A Sister Concern of Amdads Group</span>
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

      {/* Main Sticky Glass Header */}
      <header className="sticky top-0 z-40 bg-white/75 backdrop-blur-2xl border-b border-white/60 shadow-[0_4px_30px_rgba(15,23,42,0.04)] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <BrandLogo priority size="md" />

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-6 font-medium text-sm text-slate-700">
              <Link href="/services" className="hover:text-brand-500 transition-colors">
                Services
              </Link>
              <Link href="/shop" className="hover:text-brand-500 transition-colors">
                Shop
              </Link>
              <Link href="/training" className="hover:text-brand-500 transition-colors">
                Training
              </Link>
              <Link href="/branches" className="hover:text-brand-500 transition-colors">
                Branches
              </Link>
              <Link href="/technicians" className="hover:text-brand-500 transition-colors">
                Technicians
              </Link>
              <Link href="/warranty" className="hover:text-brand-500 transition-colors">
                Warranty
              </Link>
              <Link href="/about" className="hover:text-brand-500 transition-colors">
                About
              </Link>
            </nav>

            {/* Header Right Actions */}
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              {/* Search Toggle */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 sm:p-2.5 text-slate-600 hover:text-brand-500 hover:bg-slate-100 rounded-xl transition-all"
                title="Search services and products"
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Cart Button */}
              <Link
                href="/cart"
                className="relative p-2 sm:p-2.5 text-slate-600 hover:text-brand-500 hover:bg-slate-100 rounded-xl transition-all"
                title="View Cart"
              >
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-500 text-white text-[10px] sm:text-[11px] font-bold w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shadow-xs animate-in zoom-in">
                    {itemCount}
                  </span>
                )}
              </Link>

              {/* Account Dropdown */}
              <div className="relative">
                {user ? (
                  <div className="relative">
                    <button
                      onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                      className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-xl border border-white/80 bg-white/60 backdrop-blur-md hover:bg-white/90 hover:border-brand-300 transition-all text-xs font-semibold shadow-xs"
                    >
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-brand-500 text-white flex items-center justify-center font-bold shadow-xs text-xs">
                        {user.name.charAt(0)}
                      </div>
                      <span className="hidden md:inline max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    {accountMenuOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white/85 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/80 py-2 z-50 animate-in fade-in zoom-in-95">
                        <div className="px-4 py-2 border-b border-slate-100/80">
                          <p className="text-xs text-slate-500">Signed in as</p>
                          <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                          <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-brand-500/10 text-brand-600 border border-brand-500/20">
                            {user.role}
                          </span>
                        </div>

                        {user.role === 'CUSTOMER' && (
                          <Link
                            href="/customer/dashboard"
                            onClick={() => setAccountMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-white/80 hover:text-brand-600 transition"
                          >
                            <LayoutDashboard className="w-4 h-4 text-brand-500" />
                            Customer Portal
                          </Link>
                        )}

                        {user.role === 'TECHNICIAN' && (
                          <Link
                            href="/technician/dashboard"
                            onClick={() => setAccountMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-white/80 hover:text-emerald-600 transition"
                          >
                            <LayoutDashboard className="w-4 h-4 text-emerald-500" />
                            Technician Workspace
                          </Link>
                        )}

                        {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
                          <Link
                            href="/admin"
                            onClick={() => setAccountMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-white/80 hover:text-amber-600 transition"
                          >
                            <LayoutDashboard className="w-4 h-4 text-amber-500" />
                            Admin Console
                          </Link>
                        )}

                        <button
                          onClick={() => {
                            logout();
                            setAccountMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50/80 text-left border-t border-slate-100/80 mt-1 transition"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="hidden sm:flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-slate-700 hover:text-brand-600 rounded-xl bg-white/50 hover:bg-white/90 border border-white/60 backdrop-blur-md shadow-2xs transition"
                  >
                    <UserIcon className="w-4 h-4" />
                    Sign In
                  </Link>
                )}
              </div>

              {/* Book Service CTA Button (Tablet & Desktop, mobile uses bottom floating navigation) */}
              <Link
                href="/services"
                className="hidden sm:inline-flex btn-primary text-xs sm:text-sm py-2 px-3.5 sm:px-4"
              >
                <Zap className="w-4 h-4 mr-1.5 fill-white" />
                Book Service
              </Link>

              {/* Mobile menu hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-slate-600 hover:bg-white/80 border border-transparent hover:border-white/80 rounded-xl transition"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Global Search Bar (Expands on click) */}
        {searchOpen && (
          <div className="border-t border-white/60 bg-white/80 backdrop-blur-2xl px-4 py-3 shadow-lg animate-in fade-in">
            <form onSubmit={handleSearchSubmit} className="max-w-3xl mx-auto flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search electrical services, CCTV, laptops, components..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-white/70 border border-white/90 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-brand-500 backdrop-blur-md shadow-inner"
                  autoFocus
                />
              </div>
              <button type="submit" className="btn-primary text-xs px-4">
                Search
              </button>
            </form>
          </div>
        )}

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-white/60 bg-white/90 backdrop-blur-2xl px-4 pt-3 pb-6 space-y-3 shadow-2xl">
            <nav className="space-y-1 text-sm font-medium text-slate-800">
              <Link
                href="/services"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl hover:bg-white/80 hover:text-brand-600 transition"
              >
                Services
              </Link>
              <Link
                href="/shop"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl hover:bg-white/80 hover:text-brand-600 transition"
              >
                Shop Marketplace
              </Link>
              <Link
                href="/technicians"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl hover:bg-slate-50"
              >
                Verified Technicians
              </Link>
              <Link
                href="/warranty"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl hover:bg-slate-50"
              >
                Warranty Check
              </Link>
              <Link
                href="/training"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl hover:bg-slate-50 text-amber-600 font-semibold"
              >
                Skills Academy &amp; Training
              </Link>
              <Link
                href="/branches"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl hover:bg-slate-50"
              >
                Branch Network
              </Link>
              <Link
                href="/become-a-technician"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl hover:bg-slate-50 text-brand-600 font-semibold"
              >
                Become a Technician
              </Link>
              <Link
                href="/become-a-seller"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl hover:bg-slate-50 text-emerald-600 font-semibold"
              >
                Become a Merchant / Seller
              </Link>
              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl hover:bg-slate-50"
              >
                About Us
              </Link>
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl hover:bg-slate-50"
              >
                Contact &amp; Branch
              </Link>
            </nav>

            {!user && (
              <div className="pt-2 border-t border-slate-100 flex gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-sm font-semibold border border-slate-200 rounded-xl"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-sm font-semibold bg-brand-500 text-white rounded-xl"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </header>
    </>
  );
}
