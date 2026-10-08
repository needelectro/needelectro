'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { 
  Home, 
  Wrench, 
  ShoppingBag, 
  Package, 
  User, 
  Briefcase, 
  Wallet, 
  Calendar,
  Zap
} from 'lucide-react';

export default function MobileNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  // Hide on certain admin views if needed, otherwise show for mobile
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const isCustomer = user?.role === 'CUSTOMER';
  const isTechnician = user?.role === 'TECHNICIAN';

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1 shadow-lg">
      <div className="flex items-center justify-around">
        {/* Customer or Guest Navigation */}
        {!isTechnician && (
          <>
            <Link
              href="/"
              className={`flex flex-col items-center py-1.5 px-2 rounded-xl text-[10px] font-semibold transition-colors ${
                pathname === '/' ? 'text-brand-600' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Home className="w-5 h-5 mb-0.5" />
              <span>Home</span>
            </Link>

            <Link
              href="/services"
              className={`flex flex-col items-center py-1.5 px-2 rounded-xl text-[10px] font-semibold transition-colors ${
                pathname?.startsWith('/services') ? 'text-brand-600' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Wrench className="w-5 h-5 mb-0.5" />
              <span>Services</span>
            </Link>

            {/* Quick Emergency / Book Center Action */}
            <Link
              href="/services"
              className="flex flex-col items-center -mt-5"
            >
              <div className="w-12 h-12 rounded-full bg-brand-500 text-white flex items-center justify-center shadow-lg shadow-brand-500/30 border-4 border-white active:scale-95 transition-transform">
                <Zap className="w-6 h-6 fill-white" />
              </div>
              <span className="text-[10px] font-bold text-brand-600 mt-0.5">Book</span>
            </Link>

            <Link
              href="/shop"
              className={`flex flex-col items-center py-1.5 px-2 rounded-xl text-[10px] font-semibold transition-colors ${
                pathname?.startsWith('/shop') ? 'text-brand-600' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShoppingBag className="w-5 h-5 mb-0.5" />
              <span>Shop</span>
            </Link>

            <Link
              href={user ? '/customer/dashboard' : '/login'}
              className={`flex flex-col items-center py-1.5 px-2 rounded-xl text-[10px] font-semibold transition-colors ${
                pathname?.startsWith('/customer') || pathname === '/login'
                  ? 'text-brand-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-5 h-5 mb-0.5" />
              <span>{user ? 'Account' : 'Sign In'}</span>
            </Link>
          </>
        )}

        {/* Technician Specific Bottom Bar */}
        {isTechnician && (
          <>
            <Link
              href="/technician/dashboard"
              className={`flex flex-col items-center py-1.5 px-3 rounded-xl text-[10px] font-semibold transition-colors ${
                pathname === '/technician/dashboard' ? 'text-brand-600' : 'text-slate-600'
              }`}
            >
              <Home className="w-5 h-5 mb-0.5" />
              <span>Home</span>
            </Link>

            <Link
              href="/technician/jobs"
              className={`flex flex-col items-center py-1.5 px-3 rounded-xl text-[10px] font-semibold transition-colors ${
                pathname === '/technician/jobs' ? 'text-brand-600' : 'text-slate-600'
              }`}
            >
              <Briefcase className="w-5 h-5 mb-0.5" />
              <span>Jobs</span>
            </Link>

            <Link
              href="/technician/earnings"
              className={`flex flex-col items-center py-1.5 px-3 rounded-xl text-[10px] font-semibold transition-colors ${
                pathname === '/technician/earnings' ? 'text-brand-600' : 'text-slate-600'
              }`}
            >
              <Wallet className="w-5 h-5 mb-0.5" />
              <span>Earnings</span>
            </Link>

            <Link
              href="/technician/profile"
              className={`flex flex-col items-center py-1.5 px-3 rounded-xl text-[10px] font-semibold transition-colors ${
                pathname === '/technician/profile' ? 'text-brand-600' : 'text-slate-600'
              }`}
            >
              <User className="w-5 h-5 mb-0.5" />
              <span>Profile</span>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
