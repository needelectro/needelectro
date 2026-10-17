'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import BrandLogo from '@/components/common/BrandLogo';
import { Zap, Phone, Mail, MapPin, Globe, ShieldCheck } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();
  const { user } = useAuth();

  // Isolate Admin & Technician: Do not render public customer footer on admin or technician routes or for those roles
  const isAdmin = user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN');
  const isTechnician = user && user.role === 'TECHNICIAN';
  if (pathname?.startsWith('/admin') || isAdmin || pathname?.startsWith('/technician') || isTechnician) {
    return null;
  }
  return (
    <footer className="bg-slate-950/90 backdrop-blur-2xl text-slate-300 pt-16 pb-24 md:pb-12 border-t border-white/10 relative overflow-hidden shadow-2xl">
      {/* Background ambient lighting for frosted dark glass refraction */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[300px] bg-brand-500/10 blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute -bottom-20 left-10 w-[400px] h-[300px] bg-indigo-500/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <BrandLogo theme="dark" size="md" />

            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              A comprehensive electrical and technological service ecosystem connecting residential and commercial clients with verified technicians, genuine technology products, and warranty protection.
            </p>


          </div>

          {/* Core Services */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Services</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/services/complete-house-electrical-wiring" className="hover:text-white transition">
                  House Wiring
                </Link>
              </li>
              <li>
                <Link href="/services/cctv-camera-installation-setup" className="hover:text-white transition">
                  CCTV &amp; Security Setup
                </Link>
              </li>
              <li>
                <Link href="/services/laptop-desktop-hardware-servicing" className="hover:text-white transition">
                  Laptop &amp; PC Servicing
                </Link>
              </li>
              <li>
                <Link href="/services/ips-ups-solar-inverter-installation" className="hover:text-white transition">
                  IPS &amp; Solar Solutions
                </Link>
              </li>
              <li>
                <Link href="/services/emergency-electrical-troubleshooting" className="text-amber-400 hover:text-amber-300 transition font-medium flex items-center gap-1">
                  <Zap className="w-3 h-3 fill-amber-400" />
                  24/7 Emergency Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Products & Warranty */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Platform &amp; Network</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/shop" className="hover:text-white transition">
                  Product Marketplace
                </Link>
              </li>
              <li>
                <Link href="/software" className="text-brand-400 hover:text-brand-300 transition font-medium">
                  Software &amp; ERP Solutions
                </Link>
              </li>
              <li>
                <Link href="/training" className="text-amber-400 hover:text-amber-300 transition font-medium">
                  Skills Academy &amp; Courses
                </Link>
              </li>
              <li>
                <Link href="/verify-certificate" className="text-emerald-400 hover:text-emerald-300 transition text-xs">
                  Verify Graduate Certificate
                </Link>
              </li>
              <li>
                <Link href="/branches" className="hover:text-white transition">
                  Physical Branch Network
                </Link>
              </li>
              <li>
                <Link href="/locations" className="text-sky-400 hover:text-sky-300 transition text-xs font-semibold">
                  Bangladesh District Coverage &rarr;
                </Link>
              </li>
              <li>
                <Link href="/technicians" className="hover:text-white transition">
                  Verified Technicians
                </Link>
              </li>
              <li>
                <Link href="/technician/login" className="text-amber-400 hover:text-amber-300 transition text-xs font-semibold">
                  Technician Portal &rarr;
                </Link>
              </li>
              <li>
                <Link href="/customer/login" className="text-brand-400 hover:text-brand-300 transition text-xs font-semibold">
                  Customer Sign In &rarr;
                </Link>
              </li>
              <li>
                <Link href="/warranty" className="hover:text-white transition">
                  Check Digital Warranty
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Nationwide Support */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Nationwide Support</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-400 shrink-0" />
                <a href="tel:01733983752" className="hover:text-white">01733 983752</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-400 shrink-0" />
                <a href="mailto:needelectro23@gmail.com" className="hover:text-white">needelectro23@gmail.com</a>
              </li>
              <li className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-brand-400 shrink-0" />
                <span>www.needelectro.store</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Policies and Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/policies/terms" className="hover:text-slate-400">Terms &amp; Conditions</Link>
            <Link href="/policies/privacy" className="hover:text-slate-400">Privacy Policy</Link>
            <Link href="/policies/refund" className="hover:text-slate-400">Refund Policy</Link>
            <Link href="/policies/service" className="hover:text-slate-400">Service Policy</Link>
            <Link href="/locations" className="hover:text-slate-400">Districts Directory</Link>
          </div>
          <div>
            &copy; {new Date().getFullYear()} NEED ELECTRO. All rights reserved. | Serving Customers Across Bangladesh | A Sister Concern of AMDADS Group
          </div>
        </div>
      </div>
    </footer>
  );
}
