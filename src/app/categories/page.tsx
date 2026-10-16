import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import prisma from '@/lib/db';
import { 
  Laptop, 
  ShieldCheck, 
  Wifi, 
  Zap, 
  Cpu, 
  HardDrive, 
  Camera, 
  Wrench, 
  ArrowRight, 
  Layers, 
  ShoppingBag,
  ChevronRight
} from 'lucide-react';

export const revalidate = 120;

export const metadata: Metadata = {
  title: 'Marketplace Categories | NEED ELECTRO',
  description: 'Explore laptops, computers, CCTV surveillance, electrical supplies, networking equipment, and certified professional services across Bangladesh.',
  alternates: {
    canonical: 'https://www.needelectro.store/categories',
  },
};

export default async function CategoriesPage() {
  let productCategories: any[] = [];
  let serviceCategories: any[] = [];

  try {
    [productCategories, serviceCategories] = await Promise.all([
      prisma.productCategory.findMany({
        where: { isActive: true },
        include: {
          _count: { select: { products: { where: { isActive: true } } } },
        },
        orderBy: { sortOrder: 'asc' },
      }),
      prisma.serviceCategory.findMany({
        where: { isActive: true },
        include: {
          _count: { select: { services: { where: { isActive: true } } } },
        },
        orderBy: { sortOrder: 'asc' },
      }),
    ]);
  } catch (err) {
    console.warn('[CategoriesPage] Error fetching categories:', err);
  }

  // Curated category iconography and sub-tags
  const categoryHighlights = [
    {
      title: 'Laptops & Computers',
      slug: 'laptops-computers',
      href: '/shop?category=laptops-computers',
      icon: Laptop,
      color: 'from-blue-600 to-sky-500',
      badge: 'Genuine Stock',
      subcategories: ['Business Laptops', 'Custom Desktop PCs', 'Monitors & Displays', 'RAM & NVMe SSD', 'Keyboards & Mice'],
      description: 'Brand-new & verified refurbished laptops from HP, Dell, Lenovo with digital warranty.'
    },
    {
      title: 'CCTV & Surveillance',
      slug: 'cctv-surveillance',
      href: '/shop?category=cctv-surveillance',
      icon: Camera,
      color: 'from-indigo-600 to-purple-600',
      badge: 'Security Gear',
      subcategories: ['HD Analog Cameras', 'ColorVu IP Cameras', '4/8/16 Ch NVR & DVR', 'Surveillance Hard Drives', 'Power Supplies'],
      description: 'High-definition Dahua and Hikvision surveillance systems for home and enterprise.'
    },
    {
      title: 'Networking & Connectivity',
      slug: 'networking-accessories',
      href: '/shop?category=networking-accessories',
      icon: Wifi,
      color: 'from-cyan-600 to-teal-500',
      badge: 'High Speed',
      subcategories: ['Wi-Fi 6 Routers', 'Gigabit Network Switches', 'Cat6 & Cat7 Patch Cords', 'Optical Fiber Accessories', 'Range Extenders'],
      description: 'Reliable wireless routers, switches, and structured cabling for seamless bandwidth.'
    },
    {
      title: 'Electrical & Smart Devices',
      slug: 'electrical-smart-devices',
      href: '/shop?category=electrical-smart-devices',
      icon: Zap,
      color: 'from-amber-500 to-orange-600',
      badge: 'Safety Certified',
      subcategories: ['Pure Sine Wave IPS', 'Solar Inverters & Batteries', 'Circuit Breakers & DB', 'Smart Wi-Fi Switches', 'Conduit Wiring Accessories'],
      description: 'Energy-efficient power backups, switchboards, and electrical distribution hardware.'
    },
  ];

  const serviceHighlights = [
    {
      title: 'Complete House & Building Wiring',
      slug: 'complete-house-electrical-wiring',
      href: '/services/complete-house-electrical-wiring',
      icon: Zap,
      color: 'text-amber-500 bg-amber-500/10',
      description: 'Conduit laying, DB dressing, load balance & earthing testing by licensed technicians.'
    },
    {
      title: 'CCTV Camera Setup & Networking',
      slug: 'cctv-camera-installation-setup',
      href: '/services/cctv-camera-installation-setup',
      icon: ShieldCheck,
      color: 'text-brand-600 bg-brand-500/10',
      description: 'IP/HD camera positioning, cabling, NVR storage & remote mobile monitoring.'
    },
    {
      title: 'Laptop & Desktop Hardware Servicing',
      slug: 'laptop-desktop-hardware-servicing',
      href: '/services/laptop-desktop-hardware-servicing',
      icon: HardDrive,
      color: 'text-purple-600 bg-purple-500/10',
      description: 'Thermal repasting, motherboard diagnostics, display replacement & OS setup.'
    },
    {
      title: 'IPS, UPS & Solar Inverter Setup',
      slug: 'ips-ups-solar-inverter-installation',
      href: '/services/ips-ups-solar-inverter-installation',
      icon: Cpu,
      color: 'text-emerald-600 bg-emerald-500/10',
      description: 'Battery bank maintenance, automatic changeover switch & solar hybrid wiring.'
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 sm:space-y-12">
      {/* Top Banner / Mobile Header */}
      <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 md:p-10 relative overflow-hidden shadow-xl border border-white/10">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/20 blur-3xl rounded-full pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-bold text-brand-300 border border-white/15">
            <Layers className="w-3.5 h-3.5" />
            Marketplace Directory
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Explore All Categories
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Browse genuine electrical products, computing hardware, CCTV security kits, and certified technician services across Bangladesh.
          </p>
          <div className="pt-2 flex items-center gap-3">
            <Link
              href="/shop"
              className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              All Products
            </Link>
            <Link
              href="/services"
              className="text-xs font-bold px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition inline-flex items-center gap-1.5"
            >
              <Wrench className="w-3.5 h-3.5" />
              All Services
            </Link>
          </div>
        </div>
      </div>

      {/* 1. PRODUCT CATEGORIES SECTION */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600">Hardware &amp; Equipment</span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">Product Marketplace Categories</h2>
          </div>
          <Link
            href="/shop"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 group"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {categoryHighlights.map((cat) => {
            const Icon = cat.icon;
            const dbMatch = productCategories.find(c => c.slug === cat.slug);
            const count = dbMatch?._count?.products;

            return (
              <div
                key={cat.slug}
                className="card-premium p-5 sm:p-6 rounded-3xl flex flex-col justify-between hover:shadow-lg transition-all duration-300 group"
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${cat.color} text-white flex items-center justify-center shadow-md shadow-brand-500/20 shrink-0 group-hover:scale-105 transition-transform`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-brand-600 transition-colors">
                          {cat.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                            {cat.badge}
                          </span>
                          {typeof count === 'number' && count > 0 && (
                            <span className="text-[11px] text-slate-500 font-medium">
                              {count} {count === 1 ? 'Product' : 'Products'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                    {cat.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {cat.subcategories.map((sub) => (
                      <Link
                        key={sub}
                        href={`/search?q=${encodeURIComponent(sub)}`}
                        className="text-[11px] font-semibold text-slate-600 hover:text-brand-600 bg-slate-50 hover:bg-brand-50/80 px-2.5 py-1 rounded-lg border border-slate-200/80 transition"
                      >
                        {sub}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    href={cat.href}
                    className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1.5"
                  >
                    <span>Browse Category</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href={`/search?q=${encodeURIComponent(cat.title)}`}
                    className="text-[11px] text-slate-400 hover:text-slate-600 font-medium"
                  >
                    Quick Search
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. SERVICES SECTION */}
      <section className="space-y-4 pt-4 border-t border-slate-200/60">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">On-Site Technical Services</span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">Professional Electrical &amp; Tech Services</h2>
          </div>
          <Link
            href="/services"
            className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 group"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {serviceHighlights.map((srv) => {
            const Icon = srv.icon;
            return (
              <Link
                key={srv.slug}
                href={srv.href}
                className="card-premium p-4 sm:p-5 rounded-2xl flex flex-col justify-between hover:shadow-md transition-all duration-200 group"
              >
                <div className="space-y-2.5">
                  <div className={`w-10 h-10 rounded-xl ${srv.color} flex items-center justify-center`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-brand-600 transition-colors leading-snug">
                    {srv.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                    {srv.description}
                  </p>
                </div>
                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-brand-600">
                  <span>Book Service</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
