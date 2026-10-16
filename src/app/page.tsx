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
  Camera,
  CalendarCheck,
  Star,
  Users,
  ShieldAlert,
  HelpCircle,
  Sparkles,
  Award,
  ChevronRight,
  SlidersHorizontal,
  Flame
} from 'lucide-react';
import { isShopEnabled } from '@/lib/featureFlags';
import ProductCard from '@/components/common/ProductCard';

export const revalidate = 60; // Incremental Static Regeneration every 60 seconds

export default async function HomePage() {
  let services: any[] = [];
  let serviceCategories: any[] = [];
  let featuredParts: any[] = [];
  let recentReviews: any[] = [];

  try {
    [services, serviceCategories, featuredParts, recentReviews] = await Promise.all([
      prisma.service.findMany({
        where: { isActive: true },
        take: 8,
        include: { category: true },
        orderBy: { sortOrder: 'asc' },
      }),
      prisma.serviceCategory.findMany({
        where: { isActive: true },
        take: 8,
        orderBy: { sortOrder: 'asc' },
      }),
      prisma.product.findMany({
        where: { isActive: true },
        take: 4,
        include: { brand: true, category: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.review.findMany({
        where: { isApproved: true },
        take: 4,
        include: { customer: { include: { user: true } }, technician: { include: { user: true } } },
        orderBy: { createdAt: 'desc' },
      }),
    ]);
  } catch (err) {
    console.warn('[HomePage] Server fetch notice:', err);
  }

  const serviceShortcuts = [
    { label: 'Electrical', href: '/services?category=electrical', icon: Zap, color: 'from-amber-500 to-amber-600' },
    { label: 'AC Repair', href: '/services?category=ac', icon: Flame, color: 'from-sky-500 to-blue-600' },
    { label: 'CCTV Setup', href: '/services?category=cctv', icon: Camera, color: 'from-indigo-500 to-purple-600' },
    { label: 'IPS & Solar', href: '/services?category=ips', icon: Zap, color: 'from-yellow-500 to-orange-500' },
    { label: 'Appliances', href: '/services?category=appliances', icon: Wrench, color: 'from-emerald-500 to-teal-600' },
    { label: '24/7 Emergency', href: '/booking?urgency=EMERGENCY', icon: ShieldAlert, color: 'from-red-500 to-rose-600' },
    { label: 'Book Now', href: '/booking', icon: CalendarCheck, color: 'from-brand-600 to-sky-600' },
    { label: 'Warranties', href: '/warranty', icon: ShieldCheck, color: 'from-teal-600 to-cyan-700' },
  ];

  return (
    <div className="flex flex-col space-y-10 sm:space-y-16 pb-16 sm:pb-24">
      {/* 1. MOBILE APP SERVICE SHORTCUTS STRIP */}
      <div className="md:hidden px-4 pt-3 space-y-3">
        {/* Instant Service Search Trigger */}
        <Link
          href="/services"
          className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-white border border-slate-200/90 shadow-xs text-slate-400 hover:text-slate-600 transition app-tap"
        >
          <Search className="w-4 h-4 text-brand-500 shrink-0" />
          <span className="text-xs font-medium text-slate-600 truncate">
            Search electrical repair, AC servicing, CCTV installation...
          </span>
        </Link>

        {/* Horizontal Category Shortcuts Strip */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1 pt-1 -mx-4 px-4 scrollbar-none">
          {serviceShortcuts.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.label}
                href={cat.href}
                className="flex flex-col items-center gap-1.5 shrink-0 group active:scale-95 transition-transform app-tap"
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

      {/* 2. HERO SECTION — SERVICE-FIRST DISPATCH & BOOKING */}
      <section className="relative overflow-hidden pt-2 sm:pt-6 md:pt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-brand-950 to-slate-900 text-white p-6 sm:p-10 md:p-14 border border-white/10 shadow-2xl">
            {/* Ambient Lighting */}
            <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-brand-500/20 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-10 w-80 h-80 bg-sky-400/15 blur-2xl rounded-full pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Mission & Core Value Proposition */}
              <div className="lg:col-span-7 space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-bold text-brand-300 border border-white/15 shadow-xs">
                  <Image
                    src="/brand/needelectro-icon.png"
                    alt="NEED ELECTRO"
                    width={16}
                    height={16}
                    className="w-4 h-4 object-contain"
                    priority
                  />
                  <span>Bangladesh&apos;s Certified Electrical &amp; Tech Services Platform</span>
                </div>

                <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-[1.2] sm:leading-[1.15]">
                  Book trusted electricians, AC technicians, CCTV installers, and appliance repair experts — nationwide in Bangladesh.
                </h1>

                <p className="text-xs sm:text-base text-slate-300 leading-relaxed max-w-xl">
                  Trade-tested, background-verified technicians for residential, commercial &amp; industrial work. Enjoy transparent BDT pricing, 30-day workmanship warranty, and fast on-site arrival.
                </p>

                {/* Primary Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-2">
                  <Link
                    href="/booking"
                    className="btn-primary py-3 px-6 text-xs sm:text-sm shadow-lg shadow-brand-500/25 flex items-center gap-2 app-tap font-bold"
                  >
                    <CalendarCheck className="w-4 h-4" />
                    <span>Book a Service</span>
                  </Link>
                  <Link
                    href="/booking?urgency=EMERGENCY"
                    className="btn-danger py-3 px-5 text-xs sm:text-sm flex items-center gap-2 app-tap font-bold shadow-lg shadow-red-600/20"
                  >
                    <ShieldAlert className="w-4 h-4 animate-pulse" />
                    <span>24/7 Emergency Dispatch</span>
                  </Link>
                  <Link
                    href="/services"
                    className="btn-secondary py-3 px-5 text-xs sm:text-sm bg-slate-900/80 text-white border-white/20 hover:bg-slate-800 app-tap"
                  >
                    <span>View All Services</span>
                  </Link>
                </div>

                {/* Trust Metrics Pill Strip */}
                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/10 max-w-lg">
                  <div>
                    <strong className="text-base sm:text-xl font-black text-white block">100%</strong>
                    <span className="text-[10px] text-slate-400">NID Verified Techs</span>
                  </div>
                  <div>
                    <strong className="text-base sm:text-xl font-black text-white block">30-Day</strong>
                    <span className="text-[10px] text-slate-400">Service Warranty</span>
                  </div>
                  <div>
                    <strong className="text-base sm:text-xl font-black text-white block">64</strong>
                    <span className="text-[10px] text-slate-400">Districts Covered</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Instant Booking Card */}
              <div className="lg:col-span-5">
                <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-5 sm:p-7 text-slate-900 shadow-2xl border border-white/60 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="font-extrabold text-sm sm:text-base text-slate-950">
                        Quick Service Dispatch
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Get estimated cost &amp; arrival time in 60 seconds
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black border border-emerald-200">
                      Live Dispatch
                    </span>
                  </div>

                  {/* Quick Form */}
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Select Service Needed</label>
                      <select 
                        defaultValue="ELECTRICAL"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                      >
                        <option value="ELECTRICAL">⚡ Electrical Wiring &amp; Circuit Repair</option>
                        <option value="AC">❄️ AC Servicing, Installation &amp; Gas</option>
                        <option value="CCTV">📷 CCTV &amp; Security Camera Setup</option>
                        <option value="IPS">🔋 IPS, Inverter &amp; Solar Systems</option>
                        <option value="APPLIANCE">🔧 Home &amp; Industrial Appliance Repair</option>
                        <option value="GENERATOR">⚡ Generator &amp; Auto Transfer Switch</option>
                        <option value="COMPUTER">💻 PC, Laptop &amp; WiFi Network Setup</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Your Division</label>
                        <select 
                          defaultValue="Sylhet"
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                        >
                          <option value="Sylhet">Sylhet</option>
                          <option value="Dhaka">Dhaka</option>
                          <option value="Chattogram">Chattogram</option>
                          <option value="Rajshahi">Rajshahi</option>
                          <option value="Khulna">Khulna</option>
                          <option value="Barishal">Barishal</option>
                          <option value="Rangpur">Rangpur</option>
                          <option value="Mymensingh">Mymensingh</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Your District</label>
                        <input
                          type="text"
                          defaultValue="Moulvibazar"
                          placeholder="e.g. Moulvibazar, Dhaka"
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Urgency Level</label>
                      <div className="grid grid-cols-2 gap-2">
                        <label className="flex items-center gap-2 p-2 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 bg-white">
                          <input type="radio" name="hero_urgency" defaultChecked className="text-brand-600" />
                          <span className="font-semibold text-[11px] text-slate-800">Normal (Scheduled)</span>
                        </label>
                        <label className="flex items-center gap-2 p-2 border border-red-200 rounded-xl cursor-pointer hover:bg-red-50 bg-red-50/30">
                          <input type="radio" name="hero_urgency" className="text-red-600" />
                          <span className="font-bold text-[11px] text-red-700">🚨 Emergency 24/7</span>
                        </label>
                      </div>
                    </div>

                    <Link
                      href="/booking"
                      className="btn-primary w-full py-3 text-xs font-bold justify-center flex items-center gap-2 mt-2 shadow-md shadow-brand-500/25"
                    >
                      <span>Continue Booking Request</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>

                    <p className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      Free inspection estimate &bull; Zero upfront cancellation penalty
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 24/7 EMERGENCY ELECTRICAL HAZARD ALERT BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 border border-red-400/30">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-12 h-12 rounded-2xl bg-white/20 text-white flex items-center justify-center shrink-0 shadow-inner">
              <ShieldAlert className="w-7 h-7 text-white animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full inline-block mb-1">
                24/7 Rapid Emergency Response
              </span>
              <h3 className="font-black text-base sm:text-lg text-white">
                Electrical Sparking, Burning Smell, or Power Breakdown?
              </h3>
              <p className="text-xs text-red-100 max-w-xl">
                Call our direct emergency dispatch center. A certified technician will be mobilized to your premises immediately.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
            <a
              href="tel:01733983752"
              className="btn-secondary w-full md:w-auto py-2.5 px-5 text-xs font-bold text-red-700 bg-white hover:bg-red-50 justify-center shadow-md app-tap"
            >
              <PhoneCall className="w-4 h-4 text-red-600 mr-1.5" />
              <span>Call 01733 983752</span>
            </a>
            <Link
              href="/booking?urgency=EMERGENCY"
              className="btn-outline w-full md:w-auto py-2.5 px-4 text-xs font-bold text-white border-white/60 hover:bg-white/10 justify-center app-tap"
            >
              <span>Instant Dispatch</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. CORE SERVICE CATALOG GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
              Verified Technical Services
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              Popular Service Packages
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Fixed BDT starting rates, genuine materials, and 30-day workmanship guarantee.
            </p>
          </div>
          <Link
            href="/services"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 group"
          >
            <span>Explore All 20+ Services</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.map((service) => (
            <div
              key={service.id}
              className="card-premium p-5 flex flex-col justify-between group hover:-translate-y-1 transition-all duration-200 border-slate-200/90"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-black">
                    <Zap className="w-5 h-5 text-brand-500" />
                  </div>
                  {service.isEmergencyService && (
                    <span className="text-[9px] font-black uppercase bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                      24/7 Emergency
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider">
                    {service.category?.name || 'Electrical Work'}
                  </span>
                  <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1 mt-0.5">
                    {service.name}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                    {service.shortDescription}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Starting from:</span>
                  <strong className="text-sm font-black text-slate-900">
                    ৳{service.basePrice.toLocaleString()}
                  </strong>
                </div>
              </div>

              <div className="pt-4 grid grid-cols-2 gap-2">
                <Link
                  href={`/services/${service.slug}`}
                  className="btn-secondary text-[11px] py-2 px-2 text-center rounded-xl justify-center font-bold"
                >
                  Details
                </Link>
                <Link
                  href={`/booking?service=${service.slug}`}
                  className="btn-primary text-[11px] py-2 px-2 text-center rounded-xl justify-center font-bold"
                >
                  Book Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. HOW IT WORKS (4-STEP WORKFLOW) */}
      <section className="bg-slate-900 text-white py-14 rounded-3xl mx-4 sm:mx-6 lg:mx-8 px-6 sm:px-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-10 relative z-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-400">
              Simple &bull; Transparent &bull; Guaranteed
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              How NEED ELECTRO Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              From online booking to verified completion — Bangladesh&apos;s most reliable technical service workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-left">
            {/* Step 1 */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-2 relative">
              <div className="w-8 h-8 rounded-full bg-brand-500 text-white font-black text-xs flex items-center justify-center">
                1
              </div>
              <h4 className="font-bold text-sm text-white">Select Service &amp; Schedule</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Choose your required repair or installation, describe the issue, and pick your preferred time slot.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-2 relative">
              <div className="w-8 h-8 rounded-full bg-sky-500 text-white font-black text-xs flex items-center justify-center">
                2
              </div>
              <h4 className="font-bold text-sm text-white">Instant Estimate &amp; Match</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Receive an upfront BDT estimate. Our dispatch board matches the nearest trade-tested technician.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-2 relative">
              <div className="w-8 h-8 rounded-full bg-amber-500 text-white font-black text-xs flex items-center justify-center">
                3
              </div>
              <h4 className="font-bold text-sm text-white">Verified On-Site Work</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Technician arrives on schedule with calibrated tools and PPE. Before/after work is documented.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-2 relative">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white font-black text-xs flex items-center justify-center">
                4
              </div>
              <h4 className="font-bold text-sm text-white">Digital Warranty &amp; Payment</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Inspect completed job, receive official 30-day workmanship warranty, and pay via bKash, Nagad or COD.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. TRUST BADGES & STANDARDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="glass-card-hover p-4 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">NID Verified</h4>
              <p className="text-[10px] text-slate-500">Background Checked</p>
            </div>
          </div>

          <div className="glass-card-hover p-4 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/15 text-brand-600 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">30-Day Warranty</h4>
              <p className="text-[10px] text-slate-500">Service Guarantee</p>
            </div>
          </div>

          <div className="glass-card-hover p-4 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Transparent BDT</h4>
              <p className="text-[10px] text-slate-500">Zero Hidden Costs</p>
            </div>
          </div>

          <div className="glass-card-hover p-4 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-600 flex items-center justify-center shrink-0">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Direct Hotline</h4>
              <p className="text-[10px] text-slate-500">01733 983752</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. NATIONWIDE COVERAGE: 64 DISTRICTS */}
      <section className="glass-card text-slate-900 py-8 rounded-3xl mx-4 sm:mx-6 lg:mx-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center md:text-left">
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600">
              Nationwide Service Dispatch
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Serving All 64 Districts Across Bangladesh
            </h2>
            <p className="text-xs text-slate-600 max-w-xl">
              From Dhaka metropolitan to Sylhet, Moulvibazar, Chattogram, Rajshahi, Khulna, Barishal, Rangpur, and Mymensingh. Verified regional technical centers.
            </p>
          </div>
          <Link href="/locations" className="btn-primary text-xs py-2.5 px-5 shrink-0">
            View All Coverage Hubs
          </Link>
        </div>
      </section>

      {/* 8. TECHNICIAN RECRUITMENT CTA (Phase 5 requirement) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card-dark text-white rounded-3xl p-6 sm:p-10 border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/15 blur-3xl rounded-full pointer-events-none" />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            <div className="lg:col-span-2 space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-400">
                Partner with NEED ELECTRO
              </span>
              <h2 className="text-xl sm:text-3xl font-black text-white">
                Are You a Skilled Electrician or Technician?
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                Join Bangladesh&apos;s leading on-demand electrical and technology service network. Receive job requests directly on your mobile device and earn an industry-leading 85% revenue share on every completed job.
              </p>
              <div className="flex flex-wrap gap-2 pt-1 text-[10px] text-brand-300">
                <span className="bg-white/10 px-2.5 py-1 rounded-md">85% Revenue Share</span>
                <span className="bg-white/10 px-2.5 py-1 rounded-md">Flexible Job Schedule</span>
                <span className="bg-white/10 px-2.5 py-1 rounded-md">Digital Wallet Payouts</span>
                <span className="bg-white/10 px-2.5 py-1 rounded-md">Trade Training &amp; PPE</span>
              </div>
            </div>
            <div className="space-y-2.5">
              <Link
                href="/become-a-technician"
                className="btn-primary w-full text-xs py-3 justify-center shadow-lg shadow-brand-500/25 font-bold"
              >
                Apply as a Technician
              </Link>
              <Link
                href="/technician/login"
                className="btn-secondary w-full text-xs py-3 justify-center bg-slate-900 text-white border-slate-700 hover:bg-slate-800"
              >
                Technician Portal Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 9. SECONDARY SPARE PARTS & MATERIALS SECTION (Phase 2 & 9 requirement) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex items-center justify-between border-t border-slate-200/80 pt-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Spare Parts &amp; Replacement Materials
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">
              Genuine Materials for Your Job
            </h3>
          </div>
          <Link href="/parts" className="text-xs font-bold text-brand-600 hover:underline">
            View Parts Catalog &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {featuredParts.map((part) => (
            <ProductCard key={part.id} product={part} />
          ))}
        </div>
      </section>
    </div>
  );
}
