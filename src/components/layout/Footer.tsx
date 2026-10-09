import React from 'react';
import Link from 'next/link';
import { Zap, Phone, Mail, MapPin, Globe, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950/90 backdrop-blur-2xl text-slate-300 pt-16 pb-24 md:pb-12 border-t border-white/10 relative overflow-hidden shadow-2xl">
      {/* Background ambient lighting for frosted dark glass refraction */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[300px] bg-brand-500/10 blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute -bottom-20 left-10 w-[400px] h-[300px] bg-indigo-500/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-lg shadow-brand-500/30 border border-white/20">
                <Zap className="w-6 h-6 fill-white" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="font-black text-2xl tracking-tight text-white">NEED</span>
                  <span className="font-black text-2xl tracking-tight text-brand-400">ELECTRO</span>
                </div>
                <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
                  Trusted Electrical &amp; Technological Solutions
                </span>
              </div>
            </Link>

            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              A comprehensive electrical and technological service ecosystem connecting residential and commercial clients with verified technicians, genuine technology products, and warranty protection.
            </p>

            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/5 backdrop-blur-md text-brand-300 border border-brand-500/30 shadow-inner">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
                A Sister Concern of Amdads Group
              </span>
            </div>
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
                <Link href="/technicians" className="hover:text-white transition">
                  Verified Technicians
                </Link>
              </li>
              <li>
                <Link href="/become-a-seller" className="text-sky-400 hover:text-sky-300 transition text-xs font-medium">
                  Become a Merchant / Seller
                </Link>
              </li>
              <li>
                <Link href="/warranty" className="hover:text-white transition">
                  Check Digital Warranty
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Moulvibazar Branch */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Main Branch</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                <span>Shop #5, MR Plaza, Kusumbag, Moulvibazar, Bangladesh</span>
              </li>
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
                <span>www.needelectro.com</span>
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
          </div>
          <div>
            &copy; {new Date().getFullYear()} NEED ELECTRO. All rights reserved. A sister concern of Amdads Group.
          </div>
        </div>
      </div>
    </footer>
  );
}
