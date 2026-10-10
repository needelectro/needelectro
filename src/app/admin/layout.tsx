'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import Image from 'next/image';
import {
  LayoutDashboard,
  Package,
  Wrench,
  ShieldCheck,
  Building2,
  GraduationCap,
  Store,
  LogOut,
  ShieldAlert,
  Loader2
} from 'lucide-react';

const ADMIN_LINKS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/services', label: 'Services', icon: Wrench },
  { href: '/admin/warranties', label: 'Warranties', icon: ShieldCheck },
  { href: '/admin/branches', label: 'Branches', icon: Building2 },
  { href: '/admin/training', label: 'Training', icon: GraduationCap },
  { href: '/admin/sellers', label: 'Sellers', icon: Store },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // If on /admin/login, bypass the admin console shell and guard
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage) return;

    if (!isLoading) {
      if (!user) {
        router.replace('/admin/login?redirect=' + encodeURIComponent(pathname || '/admin/dashboard'));
      } else if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
        router.replace('/admin/login?error=unauthorized');
      }
    }
  }, [user, isLoading, pathname, router, isLoginPage]);

  const handleLogout = async () => {
    await logout();
    router.replace('/admin/login');
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
        <p className="text-xs text-slate-400 font-medium">Verifying administrator session...</p>
      </div>
    );
  }

  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
        <p className="text-xs text-slate-400 font-medium">Redirecting to admin login...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Admin Navigation Header */}
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-xl border-b border-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo & Admin Badge */}
            <div className="flex items-center gap-3">
              <Link href="/admin/dashboard" className="flex items-center gap-2 group">
                <Image
                  src="/brand/needelectro-logo-white.png"
                  alt="NEED ELECTRO"
                  width={140}
                  height={35}
                  className="h-8 w-auto object-contain"
                  priority
                />
              </Link>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" />
                Admin Console
              </span>
            </div>

            {/* Quick Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 text-xs font-semibold">
              {ADMIN_LINKS.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href || pathname?.startsWith(href + '/');
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                      isActive
                        ? 'bg-brand-500/25 text-brand-400 border border-brand-500/40 shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </Link>
                );
              })}
            </nav>

            {/* Admin User Info & Sign Out */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end text-right">
                <span className="text-xs font-bold text-white leading-tight">{user.name}</span>
                <span className="text-[10px] text-brand-400 font-semibold">{user.role}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 text-xs font-bold transition shadow-xs cursor-pointer"
                title="Log out of Admin Portal"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Scroll Bar */}
        <div className="md:hidden flex items-center gap-1 overflow-x-auto px-4 py-2 border-t border-white/5 scrollbar-none text-xs">
          {ADMIN_LINKS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname?.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg shrink-0 text-[11px] font-semibold transition ${
                  isActive
                    ? 'bg-brand-500 text-white'
                    : 'text-slate-400 hover:text-white bg-white/5'
                }`}
              >
                <Icon className="w-3 h-3" />
                {label}
              </Link>
            );
          })}
        </div>
      </header>

      {/* Main Admin Workspace */}
      <main className="flex-1 bg-slate-950 text-slate-100">
        {children}
      </main>
    </div>
  );
}
