import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/lib/db';
import { 
  Zap, 
  ShieldCheck, 
  Wrench, 
  ShoppingBag, 
  PhoneCall, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  ArrowRight, 
  Layers, 
  Search,
  Laptop,
  Camera,
  Wifi,
  Cpu,
  GraduationCap,
  Building2,
  HardDrive
} from 'lucide-react';
import ProductCard from '@/components/common/ProductCard';

export const revalidate = 60; // Incremental Static Regeneration every 60 seconds

export default async function HomePage() {
  let featuredProducts: any[] = [];
  let dbBanners: any[] = [];
  let serviceCategories: any[] = [];

  try {
    [featuredProducts, dbBanners, serviceCategories] = await Promise.all([
      prisma.product.findMany({
        where: { isActive: true },
        take: 12,
        include: {
          brand: true,
          category: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.banner.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        take: 3,
      }),
      prisma.serviceCategory.findMany({
        where: { isActive: true },
        take: 4,
        orderBy: { sortOrder: 'asc' },
      }),
    ]);
  } catch (err) {
    console.warn('[HomePage] Server fetch warning:', err);
  }

  // App-style category shortcuts
  const categoryShortcuts = [
    { label: 'Laptops', href: '/shop?category=laptops-computers', icon: Laptop, color: 'from-blue-600 to-sky-500' },
    { label: 'CCTV Kits', href: '/shop?category=cctv-surveillance', icon: Camera, color: 'from-indigo-600 to-purple-600' },
    { label: 'Electrical', href: '/shop?category=electrical-smart-devices', icon: Zap, color: 'from-amber-500 to-orange-500' },
    { label: 'Networking', href: '/shop?category=networking-accessories', icon: Wifi, color: 'from-cyan-600 to-teal-500' },
    { label: 'Services', href: '/services', icon: Wrench, color: 'from-brand-600 to-blue-700' },
    { label: 'Warranty', href: '/warranty', icon: ShieldCheck, color: 'from-emerald-600 to-teal-600' },
    { label: 'Branches', href: '/branches', icon: Building2, color: 'from-slate-700 to-slate-900' },
    { label: 'Academy', href: '/training', icon: GraduationCap, color: 'from-amber-600 to-amber-700' },
  ];

  return (
    <div className="flex flex-col space-y-8 sm:space-y-16 pb-12 sm:pb-20">
      {/* 1. MOBILE-APP SEARCH & DASHBOARD HEADER (Visible on Mobile) */}
      <div className="md:hidden px-4 pt-3 space-y-3">
        {/* Compact Mobile Search Trigger */}
        <Link
          href="/search"
          className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-white border border-slate-200/90 shadow-xs text-slate-400 hover:text-slate-600 transition"
        >
          <Search className="w-4 h-4 text-brand-500 shrink-0" />
          <span className="text-xs font-medium text-slate-500 truncate">
            Search laptops, CCTV cameras, pure sine wave IPS...
          </span>
        </Link>

        {/* Horizontal Scrollable Category Shortcuts (Native Mobile App Feel) */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1 pt-1 -mx-4 px-4 scrollbar-none">
          {categoryShortcuts.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.label}
                href={cat.href}
                className="flex flex-col items-center gap-1.5 shrink-0 group active:scale-95 transition-transform"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${cat.color} text-white flex items-center justify-center shadow-xs group-hover:shadow-md transition-shadow`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-slate-700 whitespace-nowrap">
                  {cat.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 2. HERO / CAMPAIGN BANNER SECTION */}
      <section className="relative overflow-hidden pt-2 sm:pt-6 md:pt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Main Campaign Glass Card */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-950 via-brand-950 to-slate-900 text-white p-6 sm:p-10 md:p-14 border border-white/10 shadow-2xl">
            {/* Ambient Backlight */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/25 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-10 w-72 h-72 bg-sky-400/15 blur-2xl rounded-full pointer-events-none" />

            <div className="relative z-10 max-w-3xl space-y-4 sm:space-y-6">
              {/* Official Platform Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-bold text-brand-300 border border-white/15 shadow-xs">
                <Image
                  src="/brand/needelectro-icon.png"
                  alt="NEED ELECTRO"
                  width={16}
                  height={16}
                  className="w-4 h-4 object-contain"
                  priority
                />
                <span>Trusted Electrical &amp; Technological Solutions &bull; Bangladesh</span>
              </div>

              {/* Headline */}
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-[1.2] sm:leading-[1.15]">
                Certified Technicians, Genuine Laptops &amp; CCTV Security
              </h1>

              {/* Supporting Value Proposition */}
              <p className="text-xs sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                Order verified hardware with digital warranties, book trade-tested electrical technicians, and manage corporate IT and CCTV setups across all 64 districts in Bangladesh.
              </p>

              {/* Primary CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <Link
                  href="/services"
                  className="btn-primary text-xs sm:text-sm py-3 px-6 shadow-lg shadow-brand-500/25 justify-center"
                >
                  <Zap className="w-4 h-4 mr-2 fill-white shrink-0" />
                  Book Certified Electrician
                </Link>
                <Link
                  href="/shop"
                  className="btn-secondary text-xs sm:text-sm py-3 px-6 justify-center bg-white/10 hover:bg-white/20 text-white border-white/20"
                >
                  <ShoppingBag className="w-4 h-4 mr-2 text-white shrink-0" />
                  Shop Hardware Catalog
                </Link>
                <Link
                  href="/categories"
                  className="text-xs sm:text-sm font-bold px-5 py-3 rounded-xl border border-white/25 hover:bg-white/10 text-slate-200 transition text-center"
                >
                  Browse Categories
                </Link>
              </div>

              {/* Quick Trust Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 border-t border-white/10 text-[11px] text-slate-300">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>NID-Verified Pros</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                  <span>64 Districts Delivery</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Digital Warranty</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <PhoneCall className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>01733 983752 Hotline</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. DESKTOP CATEGORY SHORTCUTS (Hidden on mobile as mobile has top slider) */}
      <section className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-4 lg:grid-cols-8 gap-3">
          {categoryShortcuts.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.label}
                href={cat.href}
                className="card-premium p-3.5 rounded-2xl flex flex-col items-center text-center gap-2 hover:-translate-y-1 hover:shadow-md transition group"
              >
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${cat.color} text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-800 group-hover:text-brand-600 transition-colors">
                  {cat.label}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4. FEATURED PRODUCTS (Server-Rendered Instant View) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <span className="text-[11px] font-bold tracking-wider uppercase text-brand-600">
              Genuine Inventory
            </span>
            <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">
              Featured Technology &amp; Hardware
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-xs sm:text-sm font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 group"
          >
            <span>Explore All</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {featuredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {featuredProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="card-premium p-8 rounded-3xl text-center space-y-3">
            <p className="text-xs text-slate-600">Explore laptops, CCTV surveillance kits, and electrical products in our national catalog.</p>
            <Link href="/shop" className="btn-primary text-xs py-2 px-5 inline-flex">
              Visit Shop
            </Link>
          </div>
        )}
      </section>

      {/* 5. PROFESSIONAL ELECTRICAL & TECH SERVICES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div>
              <span className="text-[11px] font-bold tracking-wider uppercase text-brand-600">
                On-Site Technical Excellence
              </span>
              <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">
                Certified Electrical, CCTV &amp; Tech Services
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              From complete residential conduit wiring and circuit breaker installations to commercial IP surveillance, PC servicing, and Pure Sine Wave IPS setups. Transparent pricing with workmanship warranty.
            </p>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <Link href="/services/complete-house-electrical-wiring" className="card-premium p-3 rounded-2xl space-y-1 hover:border-brand-300 transition">
                <span className="text-lg">⚡</span>
                <p className="text-xs font-bold text-slate-900">House Wiring</p>
                <p className="text-[10px] text-slate-500">Conduit, DB, and panels</p>
              </Link>
              <Link href="/services/cctv-camera-installation-setup" className="card-premium p-3 rounded-2xl space-y-1 hover:border-brand-300 transition">
                <span className="text-lg">📷</span>
                <p className="text-xs font-bold text-slate-900">CCTV &amp; Security</p>
                <p className="text-[10px] text-slate-500">HD / IP Camera setups</p>
              </Link>
              <Link href="/services/laptop-desktop-hardware-servicing" className="card-premium p-3 rounded-2xl space-y-1 hover:border-brand-300 transition">
                <span className="text-lg">💻</span>
                <p className="text-xs font-bold text-slate-900">PC Diagnostics</p>
                <p className="text-[10px] text-slate-500">Laptop &amp; PC repair</p>
              </Link>
              <Link href="/services/ips-ups-solar-inverter-installation" className="card-premium p-3 rounded-2xl space-y-1 hover:border-brand-300 transition">
                <span className="text-lg">🔋</span>
                <p className="text-xs font-bold text-slate-900">IPS &amp; Solar</p>
                <p className="text-[10px] text-slate-500">Inverter &amp; battery setup</p>
              </Link>
            </div>

            <div className="pt-2 flex flex-wrap gap-2.5">
              <Link href="/booking" className="btn-primary text-xs py-2.5 px-5">
                Book a Technician Now
              </Link>
              <Link href="/services" className="btn-secondary text-xs py-2.5 px-5">
                View All Services
              </Link>
            </div>
          </div>

          {/* 4-Step How It Works Card */}
          <div className="glass-card-dark text-white p-6 sm:p-8 rounded-3xl relative overflow-hidden space-y-4">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-brand-400 fill-brand-400" />
              Four-Step Transparent Booking
            </h3>
            
            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-brand-500/25 text-brand-400 border border-brand-400/50 font-bold flex items-center justify-center shrink-0 text-xs">
                  1
                </div>
                <div>
                  <h5 className="font-bold text-white text-xs">Choose Service &amp; District</h5>
                  <p className="text-[11px] text-slate-400 mt-0.5">Select service, district location, and schedule your preferred slot.</p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-brand-500/25 text-brand-400 border border-brand-400/50 font-bold flex items-center justify-center shrink-0 text-xs">
                  2
                </div>
                <div>
                  <h5 className="font-bold text-white text-xs">Verified Specialist Dispatched</h5>
                  <p className="text-[11px] text-slate-400 mt-0.5">Matched with certified, background-checked electricians in your district.</p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-brand-500/25 text-brand-400 border border-brand-400/50 font-bold flex items-center justify-center shrink-0 text-xs">
                  3
                </div>
                <div>
                  <h5 className="font-bold text-white text-xs">Live Job Tracking</h5>
                  <p className="text-[11px] text-slate-400 mt-0.5">Track technician arrival and job progress in real time.</p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-emerald-500/25 text-emerald-400 border border-emerald-400/50 font-bold flex items-center justify-center shrink-0 text-xs">
                  4
                </div>
                <div>
                  <h5 className="font-bold text-white text-xs">Secure Payment &amp; Warranty</h5>
                  <p className="text-[11px] text-slate-400 mt-0.5">Pay via bKash, Nagad, Card or COD with 30-day workmanship assurance.</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link href="/booking" className="btn-primary w-full text-xs py-2.5 justify-center">
                Start Booking Request
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SOFTWARE & DIGITAL TRANSFORMATION SPOTLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card-dark text-white rounded-3xl p-6 sm:p-10 border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/15 blur-3xl rounded-full pointer-events-none" />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            <div className="lg:col-span-2 space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-400">
                Digital Transformation By AMDADS GROUP
              </span>
              <h2 className="text-xl sm:text-3xl font-black text-white">
                Custom Web, Mobile &amp; NEED ELECTRO ERP
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                Point-of-sale systems, accounting software, and multi-branch retail ERP engineered for Bangladesh&apos;s commercial landscape.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="text-[10px] bg-white/10 px-2.5 py-1 rounded-md text-brand-300">Custom Web Apps</span>
                <span className="text-[10px] bg-white/10 px-2.5 py-1 rounded-md text-brand-300">Mobile Apps</span>
                <span className="text-[10px] bg-white/10 px-2.5 py-1 rounded-md text-brand-300">NEED ELECTRO ERP</span>
                <span className="text-[10px] bg-white/10 px-2.5 py-1 rounded-md text-brand-300">POS &amp; Accounting</span>
              </div>
            </div>
            <div className="space-y-2.5">
              <Link
                href="/software"
                className="btn-primary w-full text-xs py-3 justify-center shadow-lg shadow-brand-500/25"
              >
                Inquire for Custom Software
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
              <Link
                href="/contact"
                className="btn-secondary w-full text-xs py-3 justify-center bg-slate-900 text-white border-slate-700 hover:bg-slate-800"
              >
                Schedule Consultation
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. NATIONWIDE COVERAGE: 64 DISTRICTS */}
      <section className="glass-card text-slate-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600">Bangladesh Coverage</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">Serving All 64 Districts Nationwide</h2>
              <p className="text-xs text-slate-600 max-w-xl">
                Insured courier shipping across Dhaka, Sylhet, Chattogram, Rajshahi, Khulna, Barishal, Rangpur, and Mymensingh.
              </p>
            </div>
            <Link
              href="/locations"
              className="btn-primary text-xs py-2.5 px-5 flex items-center gap-2 shrink-0"
            >
              <MapPin className="w-4 h-4" />
              Explore All 64 Districts
            </Link>
          </div>
        </div>
      </section>

      {/* 8. 24/7 SUPPORT HOTLINE BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-brand-600 to-brand-800 text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1.5 text-center md:text-left">
            <span className="text-[10px] uppercase font-bold tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
              Customer &amp; Technical Assistance
            </span>
            <h3 className="text-lg sm:text-2xl font-black text-white">Need Technical Guidance or Rapid Support?</h3>
            <p className="text-xs text-brand-100">
              Speak directly with our engineers regarding electrical safety, hardware compatibility, or order delivery.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="tel:01733983752"
              className="btn-secondary text-xs sm:text-sm py-2.5 px-5 text-brand-700 font-bold bg-white hover:bg-slate-50 flex items-center gap-2"
            >
              <PhoneCall className="w-4 h-4 text-brand-600" />
              01733 983752
            </a>
            <Link
              href="/contact"
              className="text-xs font-bold px-4 py-2.5 rounded-xl border border-white/40 hover:bg-white/10 text-white transition"
            >
              Support Desk
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
