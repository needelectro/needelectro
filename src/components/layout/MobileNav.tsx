'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { 
  Home, 
  LayoutGrid, 
  Search, 
  Package, 
  User, 
  Briefcase, 
  Wallet,
  Zap,
  CalendarCheck,
  ClipboardList
} from 'lucide-react';

export default function MobileNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  // Hide on admin views and for admin users
  const isAdmin = user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN');
  if (pathname?.startsWith('/admin') || isAdmin) {
    return null;
  }

  const isTechnician = user?.role === 'TECHNICIAN';

  // Navigation items for Service Marketplace Customer / Guest
  const customerNavItems = [
    {
      label: 'Home',
      href: '/',
      icon: Home,
      isActive: pathname === '/',
    },
    {
      label: 'Services',
      href: '/services',
      icon: Zap,
      isActive: pathname?.startsWith('/services'),
    },
    {
      label: 'Book Now',
      href: '/booking',
      icon: CalendarCheck,
      isActive: pathname?.startsWith('/booking'),
    },
    {
      label: 'My Bookings',
      href: user ? '/customer/dashboard?tab=bookings' : '/customer/login?redirect=/customer/dashboard?tab=bookings',
      icon: ClipboardList,
      isActive: pathname?.includes('tab=bookings'),
    },
    {
      label: user ? 'Account' : 'Sign In',
      href: user ? '/customer/dashboard' : '/customer/login',
      icon: User,
      isActive: pathname?.startsWith('/customer') || pathname === '/login',
    },
  ];

  // Navigation items for Verified Technician
  const technicianNavItems = [
    {
      label: 'Home',
      href: '/technician/dashboard',
      icon: Home,
      isActive: pathname === '/technician/dashboard',
    },
    {
      label: 'Jobs',
      href: '/technician/jobs',
      icon: Briefcase,
      isActive: pathname === '/technician/jobs',
    },
    {
      label: 'Earnings',
      href: '/technician/earnings',
      icon: Wallet,
      isActive: pathname === '/technician/earnings',
    },
    {
      label: 'Profile',
      href: '/technician/profile',
      icon: User,
      isActive: pathname === '/technician/profile',
    },
  ];

  const items = isTechnician ? technicianNavItems : customerNavItems;

  return (
    <nav 
      aria-label="Mobile Navigation Bar"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 px-1 pt-1.5 shadow-[0_-4px_25px_rgba(15,23,42,0.08)]"
      style={{ paddingBottom: 'calc(0.45rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-2xl transition-all duration-150 min-h-[48px] ${
                active 
                  ? 'text-brand-600 font-bold scale-[1.02]' 
                  : 'text-slate-500 hover:text-slate-900 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 mb-0.5 transition-transform duration-150 ${active ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
                {active && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-brand-500 rounded-full" />
                )}
              </div>
              <span className={`text-[10px] tracking-tight leading-tight mt-0.5 ${active ? 'text-brand-600' : 'text-slate-600'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
