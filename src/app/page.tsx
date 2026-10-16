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
  Star, 
  ArrowRight, 
  Cpu, 
  Award,
  Layers,
  Sparkles
} from 'lucide-react';
import ProductCard from '@/components/common/ProductCard';

export const revalidate = 60; // Incremental Static Regeneration every 60 seconds

export default async function HomePage() {
  // Fetch real featured products directly from database on server (0ms client delay, 0 CLS)
  let featuredProducts: any[] = [];
  try {
    featuredProducts = await prisma.product.findMany({
      where: { isActive: true },
      take: 8,
      include: {
        brand: true,
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  } catch (err) {
    console.warn('[HomePage] Server product fetch warning:', err);
  }

  return (
    <div className="flex flex-col space-y-14 sm:space-y-20">
      {/* 1. HERO SECTION - High Performance Server Rendered */}
      <section className="relative overflow-hidden pt-8 pb-14 md:pt-14 md:pb-20">
        {/* Hardware-accelerated radial light sources */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[radial-gradient(ellipse_at_center,rgba(0,140,255,0.15)_0%,rgba(0,140,255,0)_70%)] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-5">
            {/* Premium Ecosystem Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 text-slate-800 text-xs font-semibold tracking-wide border border-slate-200/80 shadow-xs">
              <Image
                src="/brand/needelectro-icon.png"
                alt="NEED ELECTRO"
                width={18}
                height={18}
                className="w-4.5 h-4.5 object-contain"
                priority
              />
              <span className="text-slate-700 font-medium">National Electrical &amp; Technology Platform &bull; Bangladesh</span>
            </div>

            {/* Main Title */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-950 tracking-tight leading-[1.2] sm:leading-[1.15] break-words">
              NEED ELECTRO &mdash; <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-brand-500 to-sky-500">
                Laptops, CCTV, Electrical &amp; Tech Solutions in Bangladesh
              </span>
            </h1>

            {/* Tagline & Supporting Value */}
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed px-1">
              Book certified electrical technicians, order verified computing hardware with digital warranties, and manage technical services across all 64 districts.
            </p>

            {/* Quick Action CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2 w-full max-w-xs sm:max-w-none mx-auto">
              <Link
                href="/services"
                className="btn-primary w-full sm:w-auto text-sm sm:text-base py-3 px-6 shadow-md shadow-brand-500/25 justify-center"
              >
                <Zap className="w-5 h-5 mr-2 fill-white shrink-0" />
                Book a Service
              </Link>
              <Link
                href="/shop"
                className="btn-secondary w-full sm:w-auto text-sm sm:text-base py-3 px-6 justify-center"
              >
                <ShoppingBag className="w-5 h-5 mr-2 text-slate-700 shrink-0" />
                Shop Products
              </Link>
              <Link
                href="/software"
                className="btn-outline w-full sm:w-auto text-sm sm:text-base py-3 px-5 justify-center"
              >
                <Layers className="w-4 h-4 mr-2 shrink-0" />
                Software &amp; ERP
              </Link>
            </div>

            {/* Trust Highlights */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5 pt-6 sm:pt-8 max-w-4xl mx-auto text-left">
              <div className="glass-card-hover p-3.5 rounded-2xl flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Verified Technicians</h4>
                  <p className="text-[10px] text-slate-500">NID &amp; Trade-Tested</p>
                </div>
              </div>

              <div className="glass-card-hover p-3.5 rounded-2xl flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-brand-500/15 text-brand-600 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">National Delivery</h4>
                  <p className="text-[10px] text-slate-500">All 64 Districts</p>
                </div>
              </div>

              <div className="glass-card-hover p-3.5 rounded-2xl flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Digital Warranty</h4>
                  <p className="text-[10px] text-slate-500">Track &amp; Claim Online</p>
                </div>
              </div>

              <div className="glass-card-hover p-3.5 rounded-2xl flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-600 flex items-center justify-center shrink-0">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Support Hotline</h4>
                  <p className="text-[10px] text-slate-500">01733 983752</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURED TECHNOLOGY PRODUCTS - Server-Rendered Instant View */}
      <section className="relative py-8 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-3">
            <div>
              <span className="text-xs font-bold tracking-wider uppercase text-brand-600">Genuine Inventory</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Featured Technology Products</h2>
            </div>
            <Link href="/shop" className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 group">
              Explore Catalog
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
            <div className="glass-card p-8 rounded-3xl text-center space-y-4">
              <p className="text-sm text-slate-600">Explore laptops, CCTV surveillance kits, and electrical products in our national catalog.</p>
              <Link href="/shop" className="btn-primary text-xs py-2 px-5">
                Visit Shop
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* 3. NATIONAL SERVICE MARKETPLACE & DISPATCH */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 content-deferred">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="text-xs font-bold tracking-wider uppercase text-brand-600">On-Site Technical Excellence</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Professional Electrical, CCTV &amp; Tech Services
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              From full building conduit wiring and circuit breaker installations to commercial IP surveillance, PC servicing, and Pure Sine Wave IPS setups. Book transparently with clear pricing and verified technicians.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="glass-card p-3.5 rounded-xl space-y-1">
                <span className="text-xl">⚡</span>
                <p className="text-xs font-bold text-slate-900">Electrical Wiring</p>
                <p className="text-[10px] text-slate-500">Conduit, DB, and panels</p>
              </div>
              <div className="glass-card p-3.5 rounded-xl space-y-1">
                <span className="text-xl">📷</span>
                <p className="text-xs font-bold text-slate-900">CCTV &amp; Security</p>
                <p className="text-[10px] text-slate-500">HD / IP Camera setups</p>
              </div>
              <div className="glass-card p-3.5 rounded-xl space-y-1">
                <span className="text-xl">💻</span>
                <p className="text-xs font-bold text-slate-900">Computer Diagnostics</p>
                <p className="text-[10px] text-slate-500">Laptop &amp; PC repair</p>
              </div>
              <div className="glass-card p-3.5 rounded-xl space-y-1">
                <span className="text-xl">🔋</span>
                <p className="text-xs font-bold text-slate-900">IPS &amp; Solar</p>
                <p className="text-[10px] text-slate-500">Inverter &amp; battery setup</p>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-3">
              <Link href="/booking" className="btn-primary text-xs py-2.5 px-5">
                Book a Technician Now
              </Link>
              <Link href="/services" className="btn-secondary text-xs py-2.5 px-5">
                View All Services
              </Link>
            </div>
          </div>

          {/* How It Works Dark Panel */}
          <div className="glass-card-dark text-white p-7 sm:p-9 rounded-3xl relative overflow-hidden space-y-5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-brand-400 fill-brand-400" />
              Four-Step Transparent Booking
            </h3>
            
            <div className="space-y-4 text-xs text-slate-300">
              <div className="flex gap-3.5 items-start">
                <div className="w-7 h-7 rounded-full bg-brand-500/25 text-brand-400 border border-brand-400/50 font-bold flex items-center justify-center shrink-0 text-xs">
                  1
                </div>
                <div>
                  <h5 className="font-bold text-white">Choose Service &amp; District</h5>
                  <p className="text-slate-400 mt-0.5">Select category, location, and preferred time slot with optional problem photos.</p>
                </div>
              </div>

              <div className="flex gap-3.5 items-start">
                <div className="w-7 h-7 rounded-full bg-brand-500/25 text-brand-400 border border-brand-400/50 font-bold flex items-center justify-center shrink-0 text-xs">
                  2
                </div>
                <div>
                  <h5 className="font-bold text-white">Verified Specialist Dispatched</h5>
                  <p className="text-slate-400 mt-0.5">Matched with certified, background-checked electricians in your district.</p>
                </div>
              </div>

              <div className="flex gap-3.5 items-start">
                <div className="w-7 h-7 rounded-full bg-brand-500/25 text-brand-400 border border-brand-400/50 font-bold flex items-center justify-center shrink-0 text-xs">
                  3
                </div>
                <div>
                  <h5 className="font-bold text-white">Live Job Tracking</h5>
                  <p className="text-slate-400 mt-0.5">Follow technician status in real-time from dispatch to work completion.</p>
                </div>
              </div>

              <div className="flex gap-3.5 items-start">
                <div className="w-7 h-7 rounded-full bg-emerald-500/25 text-emerald-400 border border-emerald-400/50 font-bold flex items-center justify-center shrink-0 text-xs">
                  4
                </div>
                <div>
                  <h5 className="font-bold text-white">Secure Payment &amp; Warranty</h5>
                  <p className="text-slate-400 mt-0.5">Pay via bKash, Nagad, Card or COD with 30-day workmanship assurance.</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link href="/booking" className="btn-primary w-full text-xs py-2.5">
                Start Booking Request
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SOFTWARE & ERP SOLUTIONS SPOTLIGHT (Req F) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 content-deferred">
        <div className="glass-card-dark text-white rounded-3xl p-6 sm:p-10 border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/15 blur-3xl rounded-full pointer-events-none" />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            <div className="lg:col-span-2 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
                Digital Transformation By AMDADS GROUP
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Custom Web, Mobile &amp; NEED ELECTRO ERP
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                Elevate your enterprise with custom business websites, mobile apps, point-of-sale systems, accounting software, and multi-branch retail ERP engineered for Bangladesh&apos;s commercial landscape.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="text-[11px] bg-white/10 px-2.5 py-1 rounded-md text-brand-300">Custom Web Apps</span>
                <span className="text-[11px] bg-white/10 px-2.5 py-1 rounded-md text-brand-300">iOS &amp; Android Apps</span>
                <span className="text-[11px] bg-white/10 px-2.5 py-1 rounded-md text-brand-300">NEED ELECTRO ERP</span>
                <span className="text-[11px] bg-white/10 px-2.5 py-1 rounded-md text-brand-300">POS &amp; Accounting</span>
              </div>
            </div>
            <div className="space-y-3">
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
                Schedule Technical Consultation
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. NATIONWIDE COVERAGE: 64 DISTRICTS */}
      <section className="glass-card text-slate-900 py-10 content-deferred">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1.5 text-center md:text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600">Bangladesh Coverage</span>
              <h2 className="text-2xl font-black text-slate-900">Serving All 64 Districts Nationwide</h2>
              <p className="text-xs text-slate-600 max-w-xl">
                Insured courier shipping across Dhaka, Sylhet, Chattogram, Rajshahi, Khulna, Barishal, Rangpur, and Mymensingh. Verified regional on-site technical centers.
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

      {/* 6. 24/7 SUPPORT HOTLINE BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 content-deferred">
        <div className="bg-gradient-to-r from-brand-600 to-brand-800 text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1.5 text-center md:text-left">
            <span className="text-[10px] uppercase font-bold tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
              Customer &amp; Technical Assistance
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white">Need Technical Guidance or Rapid Support?</h3>
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
