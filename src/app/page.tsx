'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  ChevronRight,
  Cpu,
  Monitor,
  Shield,
  Search,
  Sparkles,
  Award,
  Users,
  HardDrive
} from 'lucide-react';
import { fastFetch } from '@/lib/fastFetch';
import { useLanguage } from '@/lib/context/LanguageContext';
import ProductCard from '@/components/common/ProductCard';

const DEFAULT_FEATURED_SERVICES = [
  {
    id: 'srv-house-wiring',
    name: 'Electrical Service',
    slug: 'complete-house-electrical-wiring',
    shortDescription: 'Electrical Service',
    imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800',
    basePrice: 500,
    priceType: 'FIXED',
    estimatedDuration: '1-2 Hours',
    isEmergencyService: false,
    category: { slug: 'electrical-services', name: 'Electrical Services' },
  },
  {
    id: 'srv-house-wiring-complete',
    name: 'Complete House Electrical Wiring',
    slug: 'complete-house-electrical-wiring',
    shortDescription: 'Safe, standard-gauge copper conduit wiring, distribution box...',
    imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800',
    basePrice: 1500,
    priceType: 'INSPECTION_BASED',
    estimatedDuration: '1-3 Days',
    isEmergencyService: false,
    category: { slug: 'electrical-services', name: 'Electrical Services' },
  },
  {
    id: 'srv-cctv',
    name: 'CCTV Camera Installation & Setup',
    slug: 'cctv-camera-installation-setup',
    shortDescription: 'Full HD/IP camera mounting, DVR/NVR network configuration, and live mobile surveillance.',
    imageUrl: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800',
    basePrice: 1200,
    priceType: 'STARTING_FROM',
    estimatedDuration: '2-4 Hours',
    isEmergencyService: false,
    category: { slug: 'cctv-security', name: 'CCTV & Security' },
  },
  {
    id: 'srv-laptop',
    name: 'Laptop & Computer Hardware Repair',
    slug: 'laptop-computer-hardware-repair',
    shortDescription: 'Chip-level diagnostics, thermal paste servicing, motherboard repair, and genuine screen replacement.',
    imageUrl: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800',
    basePrice: 600,
    priceType: 'INSPECTION_BASED',
    estimatedDuration: '1-2 Days',
    isEmergencyService: false,
    category: { slug: 'computer-laptop-services', name: 'Computer Services' },
  },
];

export default function HomePage() {
  const { t, formatPrice } = useLanguage();
  const [activeTab, setActiveTab] = useState<'all' | 'electrical' | 'cctv' | 'computer'>('all');
  const [services, setServices] = useState<any[]>(DEFAULT_FEATURED_SERVICES);
  const [loadingServices, setLoadingServices] = useState(true);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    // Fetch Featured Products
    fastFetch('/api/v1/products?featured=true&limit=4', { ttlMs: 120000 })
      .then((data) => {
        if (isMounted && data && Array.isArray(data.products)) {
          setFeaturedProducts(data.products.slice(0, 4));
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoadingProducts(false);
      });

    // Fetch Services
    fastFetch('/api/v1/services', { ttlMs: 120000 })
      .then((data) => {
        if (isMounted && data && Array.isArray(data.services) && data.services.length > 0) {
          setServices(data.services);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoadingServices(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredServices = services.filter((s) => {
    if (activeTab === 'all') return true;
    const catSlug = s.category?.slug?.toLowerCase() || '';
    const sName = s.name.toLowerCase();
    if (activeTab === 'electrical') {
      return catSlug.includes('electrical') || sName.includes('wiring') || sName.includes('troubleshooting');
    }
    if (activeTab === 'cctv') {
      return catSlug.includes('cctv') || catSlug.includes('security') || sName.includes('cctv') || sName.includes('camera');
    }
    if (activeTab === 'computer') {
      return catSlug.includes('computer') || catSlug.includes('laptop') || sName.includes('laptop') || sName.includes('hardware') || sName.includes('pc');
    }
    return true;
  }).slice(0, 4);

  return (
    <div className="flex flex-col space-y-10 sm:space-y-14">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-6 pb-6 md:pt-10 md:pb-8">
        {/* Hardware-accelerated radial light sources */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[radial-gradient(ellipse_at_center,rgba(8,127,229,0.18)_0%,rgba(8,127,229,0)_70%)] pointer-events-none" />
        <div className="absolute -top-10 right-10 w-[400px] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.14)_0%,rgba(56,189,248,0)_70%)] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Premium Ecosystem Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 backdrop-blur-xl text-slate-800 text-xs font-semibold tracking-wide border border-white/90 shadow-[0_4px_20px_rgba(8,127,229,0.08)] animate-in fade-in duration-500">
              <Image
                src="/brand/needelectro-icon.png"
                alt="NEED ELECTRO"
                width={18}
                height={18}
                className="w-4.5 h-4.5 object-contain"
                priority
              />
              <span className="text-slate-600 font-medium">{t('home.heroBadge', 'Verified Electrical & Technology Platform • All 64 Districts')}</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-950 tracking-tight leading-[1.2] sm:leading-[1.15] break-words">
              NEED ELECTRO &mdash; <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-brand-500 to-sky-400">
                {t('home.heroTitle', 'Laptops, Computers, CCTV & Electrical Services in Bangladesh')}
              </span>
            </h1>

            {/* Supporting Text */}
            <p className="text-sm sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed px-1">
              {t('home.heroSubtitle', 'Book professional electrical and technical services, explore genuine technology products, and manage your warranties through one unified, trusted platform.')}
            </p>

            {/* CTA Buttons with Glass Sheen */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2 w-full max-w-xs sm:max-w-none mx-auto">
              <Link
                href="/booking"
                className="btn-primary w-full sm:w-auto text-sm sm:text-base py-3 px-6 shadow-lg shadow-brand-500/25 justify-center"
              >
                <Zap className="w-5 h-5 mr-2 fill-white shrink-0" />
                {t('home.ctaBookService', 'Book a Service')}
              </Link>
              <Link
                href="/shop"
                className="btn-secondary w-full sm:w-auto text-sm sm:text-base py-3 px-6 justify-center"
              >
                <ShoppingBag className="w-5 h-5 mr-2 text-slate-700 shrink-0" />
                {t('home.ctaShopHardware', 'Shop Products')}
              </Link>
              <Link
                href="/become-a-technician"
                className="btn-outline w-full sm:w-auto text-sm sm:text-base py-3 px-5 justify-center"
              >
                <Wrench className="w-4 h-4 mr-2 shrink-0" />
                {t('navigation.becomeTechnician', 'Become a Technician')}
              </Link>
            </div>

            {/* Trust highlights under Hero with Frosted Glass Tiles */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5 pt-6 sm:pt-8 max-w-4xl mx-auto">
              <div className="glass-card-hover p-3 sm:p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 text-left">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 flex items-center justify-center shrink-0 backdrop-blur-md">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate sm:whitespace-normal">{t('home.trustVerifiedTitle', 'Verified Specialists')}</h4>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 truncate sm:whitespace-normal">{t('home.trustVerifiedSub', 'NID & Skill Checked')}</p>
                </div>
              </div>

              <div className="glass-card-hover p-3 sm:p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 text-left">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-brand-500/15 border border-brand-500/30 text-brand-600 flex items-center justify-center shrink-0 backdrop-blur-md">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate sm:whitespace-normal">{t('home.trustRapidTitle', 'Rapid Response')}</h4>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 truncate sm:whitespace-normal">{t('home.trustRapidSub', 'Moulvibazar & Region')}</p>
                </div>
              </div>

              <div className="glass-card-hover p-3 sm:p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 text-left">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-600 flex items-center justify-center shrink-0 backdrop-blur-md">
                  <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate sm:whitespace-normal">{t('home.trustWarrantyTitle', 'Digital Warranty')}</h4>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 truncate sm:whitespace-normal">{t('home.trustWarrantySub', 'Track & Claim Easily')}</p>
                </div>
              </div>

              <div className="glass-card-hover p-3 sm:p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 text-left">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-600 flex items-center justify-center shrink-0 backdrop-blur-md">
                  <PhoneCall className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate sm:whitespace-normal">{t('home.trustBranchTitle', 'Direct Branch')}</h4>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 truncate sm:whitespace-normal">{t('home.trustBranchSub', 'Moulvibazar Hub')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. VERIFIED SERVICES SHOWCASE (PLACED DIRECTLY ABOVE FEATURED PRODUCTS) */}
      <section className="relative pt-0 pb-0 overflow-hidden">
        {/* Hardware-accelerated radial glow */}
        <div className="absolute top-1/3 right-10 w-[500px] h-[350px] bg-[radial-gradient(ellipse_at_center,rgba(0,140,255,0.12)_0%,rgba(0,140,255,0)_70%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200/80 text-brand-700 text-xs font-bold mb-2">
                <Zap className="w-3.5 h-3.5 fill-brand-600 text-brand-600" />
                <span>{t('home.onDemandBadge', 'On-Demand Certified Specialists')}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {t('home.servicesTitle', 'Professional Electrical & Technology Services')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
                {t('home.servicesSubtitle', 'Book verified master electricians and IT technicians in Moulvibazar and across Bangladesh. Transparent pricing, genuine parts, and post-service digital warranty.')}
              </p>
            </div>

            <Link
              href="/services"
              className="text-xs sm:text-sm font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1.5 group shrink-0"
            >
              <span>{t('home.exploreAllServices', 'Explore All Services')}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {[
              { id: 'all', label: t('home.tabAll', 'All Services') },
              { id: 'electrical', label: t('home.tabElectrical', 'Electrical Wiring') },
              { id: 'cctv', label: t('home.tabCctv', 'CCTV & Security') },
              { id: 'computer', label: t('home.tabComputer', 'Computer & Hardware') },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Services Grid (Compact 2-Column on Mobile, 4-Column on Desktop) */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {filteredServices.map((service) => (
              <div
                key={service.id || service.slug}
                className={`card-premium overflow-hidden flex flex-col justify-between group transition-all duration-300 hover:-translate-y-1 ${
                  service.isEmergencyService ? 'border-amber-300 bg-amber-50/10' : ''
                }`}
              >
                <div>
                  {/* Image Container with Top-Left Category Badge */}
                  <div className="relative aspect-square sm:aspect-[4/3] w-full bg-slate-100 overflow-hidden">
                    <img
                      src={service.imageUrl || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800'}
                      alt={service.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-white/90 backdrop-blur-md text-slate-800 text-[9px] sm:text-[11px] font-bold px-2 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-xs">
                      {service.category?.name || 'Electrical Services'}
                    </span>
                    {service.isEmergencyService && (
                      <span className="absolute top-2 right-2 bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                        <Zap className="w-2.5 h-2.5 fill-white" />
                        {t('home.rapidEmergency', 'Rapid 24/7')}
                      </span>
                    )}
                  </div>

                  {/* Content Area */}
                  <div className="p-3 sm:p-4 space-y-1.5">
                    <h3 className="font-bold text-slate-900 text-xs sm:text-base leading-tight line-clamp-1 group-hover:text-brand-600 transition-colors">
                      <Link href={`/services/${service.slug}`}>
                        {service.name}
                      </Link>
                    </h3>

                    <p className="text-[11px] sm:text-xs text-slate-500 leading-snug line-clamp-2">
                      {service.shortDescription}
                    </p>

                    <div className="pt-1.5 sm:pt-2.5 flex items-center justify-between text-[11px] sm:text-xs border-t border-slate-100">
                      <div className="flex items-center gap-1 sm:gap-1.5 text-slate-500">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500 shrink-0" />
                        <span className="text-[10px] sm:text-xs">{service.estimatedDuration || '1-2 Hours'}</span>
                      </div>

                      <div>
                        <span className="text-[10px] sm:text-xs text-slate-500">
                          {service.priceType === 'INSPECTION_BASED'
                            ? t('home.inspectionBased', 'Insp: ')
                            : service.priceType === 'STARTING_FROM'
                            ? t('home.startingFrom', 'From: ')
                            : t('home.fixedPrice', 'Fixed: ')}
                        </span>
                        <strong className="text-xs sm:text-base font-extrabold text-slate-900">
                          {formatPrice(service.basePrice)}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="p-3 sm:p-4 pt-0 grid grid-cols-2 gap-1.5 sm:gap-2">
                  <Link
                    href={`/services/${service.slug}`}
                    className="btn-secondary text-[10px] sm:text-xs py-1.5 sm:py-2 px-1 text-center rounded-lg sm:rounded-xl truncate"
                  >
                    {t('common.details', 'Details')}
                  </Link>
                  <Link
                    href={`/booking?service=${service.id || service.slug}`}
                    className={`text-[10px] sm:text-xs py-1.5 sm:py-2 px-1 rounded-lg sm:rounded-xl text-center truncate flex items-center justify-center ${
                      service.isEmergencyService ? 'btn-danger' : 'btn-primary'
                    }`}
                  >
                    {t('common.bookNow', 'Book')}
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Warranty Assurance Pill */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-50 via-sky-50 to-indigo-50/60 border border-brand-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-brand-950">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                <strong>{t('home.warrantyBanner', 'Post-Service Workmanship Warranty: Every verified electrical and tech service includes 30 days coverage registered in your customer dashboard.')}</strong>
              </span>
            </div>
            <Link
              href="/booking"
              className="btn-primary text-xs py-2 px-4 shrink-0 shadow-sm"
            >
              {t('home.bookCustomService', 'Book Custom Service')}
            </Link>
          </div>
        </div>
      </section>

      {/* 3. FEATURED TECHNOLOGY PRODUCTS */}
      <section className="relative !mt-6 sm:!mt-8 pt-0 pb-8 overflow-hidden">
        {/* Hardware-accelerated radial glow */}
        <div className="absolute top-1/2 left-10 w-[500px] h-[350px] bg-[radial-gradient(ellipse_at_center,rgba(8,127,229,0.12)_0%,rgba(8,127,229,0)_70%)] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold tracking-wider uppercase text-brand-600">{t('home.featuredProductsTag', 'Curated & Tested Hardware')}</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">{t('home.featuredProductsTitle', 'Featured Technology Products')}</h2>
            </div>
            <Link href="/shop" className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 group">
              {t('home.exploreAllProducts', 'Explore All Products')}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loadingProducts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="glass-card h-80 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {featuredProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="glass-card p-8 sm:p-10 rounded-3xl border border-white/80 shadow-glass relative overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                <div className="lg:col-span-2 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50/80 border border-brand-200/60 text-brand-700 text-xs font-bold">
                    <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
                    {t('home.procurementBadge', 'Verified Equipment & Institutional Procurement')}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {t('home.inventoryTitle', 'Official Hardware Inventory & Custom Lab Sourcing')}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
                    {t('home.inventoryDesc', 'NEED ELECTRO provides corporate and retail sourcing for enterprise laptops, high-definition CCTV security packages, high-speed Wi-Fi 6 networking, and Pure Sine Wave IPS backup systems. All hardware undergoes rigorous diagnostics at our Moulvibazar lab before delivery.')}
                  </p>
                  <div className="flex flex-wrap gap-4 pt-2">
                    <Link href="/contact" className="btn-primary text-xs py-2.5 px-5 flex items-center gap-2 shadow-glass-glow">
                      <PhoneCall className="w-3.5 h-3.5" />
                      {t('home.inquireProcurement', 'Inquire Hardware Procurement')}
                    </Link>
                    <Link href="/services" className="btn-secondary text-xs py-2.5 px-5 flex items-center gap-2">
                      {t('home.exploreTechServices', 'Explore Technical Services')}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="glass-card p-4 rounded-2xl border border-white/90 shadow-2xs text-center space-y-1">
                    <div className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-600 flex items-center justify-center mx-auto mb-1">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-bold text-slate-900">{t('home.labCertified', 'Lab-Certified')}</p>
                    <p className="text-[10px] text-slate-500">{t('home.labCertifiedSub', 'Every unit tested')}</p>
                  </div>
                  <div className="glass-card p-4 rounded-2xl border border-white/90 shadow-2xs text-center space-y-1">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto mb-1">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-bold text-slate-900">{t('home.digitalWarranty', 'Digital Warranty')}</p>
                    <p className="text-[10px] text-slate-500">{t('home.digitalWarrantySub', '12 - 24 Months QR')}</p>
                  </div>
                  <div className="glass-card p-4 rounded-2xl border border-white/90 shadow-2xs text-center space-y-1">
                    <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center mx-auto mb-1">
                      <Wrench className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-bold text-slate-900">{t('home.onsiteSetup', 'On-Site Setup')}</p>
                    <p className="text-[10px] text-slate-500">{t('home.onsiteSetupSub', 'Certified technicians')}</p>
                  </div>
                  <div className="glass-card p-4 rounded-2xl border border-white/90 shadow-2xs text-center space-y-1">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto mb-1">
                      <Award className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-bold text-slate-900">{t('home.trustedHeritage', 'Amdads Group')}</p>
                    <p className="text-[10px] text-slate-500">{t('home.trustedHeritageSub', 'Trusted heritage')}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4. WHY CHOOSE NEED ELECTRO & HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs font-bold tracking-wider uppercase text-brand-600">{t('home.digitalAdvantage', 'The Digital Advantage')}</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-1 mb-6">
              {t('home.whyTrustTitle', 'Why Homeowners & Businesses Rely on NEED ELECTRO')}
            </h2>
            <div className="space-y-4">
              <div className="glass-card-hover flex gap-4 p-5 rounded-2xl">
                <div className="w-11 h-11 rounded-xl bg-brand-500/15 border border-brand-500/30 text-brand-600 flex items-center justify-center shrink-0 backdrop-blur-md">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{t('home.whyReason1Title', 'Verified Technician Accountability')}</h4>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    {t('home.whyReason1Desc', 'Every electrician and technician passes NID validation, background skill assessment, and peer review before dispatch.')}
                  </p>
                </div>
              </div>

              <div className="glass-card-hover flex gap-4 p-5 rounded-2xl">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 flex items-center justify-center shrink-0 backdrop-blur-md">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{t('home.whyReason2Title', 'Integrated Digital Warranty')}</h4>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    {t('home.whyReason2Desc', 'No lost paper receipts. Every serial-numbered product and service inspection is tracked directly in your customer account.')}
                  </p>
                </div>
              </div>

              <div className="glass-card-hover flex gap-4 p-5 rounded-2xl">
                <div className="w-11 h-11 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-600 flex items-center justify-center shrink-0 backdrop-blur-md">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{t('home.whyReason3Title', 'End-to-End Technology Ecosystem')}</h4>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    {t('home.whyReason3Desc', 'From whole-building copper wiring to smart Wi-Fi CCTV cameras, workstations, and inverters — solve every tech need under one roof.')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* How It Works Step Progression - Glass Dark Panel */}
          <div className="glass-card-dark text-white p-8 sm:p-10 rounded-3xl relative overflow-hidden space-y-6">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle,rgba(8,127,229,0.22)_0%,rgba(8,127,229,0)_70%)] pointer-events-none" />

            <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2 relative z-10">
              <Zap className="w-5 h-5 text-brand-400 fill-brand-400" />
              {t('home.howWorksTitle', 'How NEED ELECTRO Works')}
            </h3>
            
            <div className="space-y-6 text-xs text-slate-300 relative z-10">
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-brand-500/25 text-brand-400 border border-brand-400/50 font-bold flex items-center justify-center shrink-0 shadow-xs">
                  1
                </div>
                <div>
                  <h5 className="font-bold text-sm text-white">{t('home.howStep1Title', 'Select Service or Hardware')}</h5>
                  <p className="text-slate-300 mt-0.5">{t('home.howStep1Desc', 'Describe your requirement, upload photos if needed, and pick your preferred time slot.')}</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-brand-500/25 text-brand-400 border border-brand-400/50 font-bold flex items-center justify-center shrink-0 shadow-xs">
                  2
                </div>
                <div>
                  <h5 className="font-bold text-sm text-white">{t('home.howStep2Title', 'Verified Technician Assigned')}</h5>
                  <p className="text-slate-300 mt-0.5">{t('home.howStep2Desc', 'Our smart matching system notifies the closest qualified specialist in your area.')}</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-brand-500/25 text-brand-400 border border-brand-400/50 font-bold flex items-center justify-center shrink-0 shadow-xs">
                  3
                </div>
                <div>
                  <h5 className="font-bold text-sm text-white">{t('home.howStep3Title', 'Realtime Progress Tracking')}</h5>
                  <p className="text-slate-300 mt-0.5">{t('home.howStep3Desc', 'Track technician arrival (On the Way, Arrived, In Progress, Work Completed).')}</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-emerald-500/25 text-emerald-400 border border-emerald-400/50 font-bold flex items-center justify-center shrink-0 shadow-xs">
                  4
                </div>
                <div>
                  <h5 className="font-bold text-sm text-white">{t('home.howStep4Title', 'Payment & Warranty Recorded')}</h5>
                  <p className="text-slate-300 mt-0.5">{t('home.howStep4Desc', 'Pay via bKash, Nagad, Card or Cash. Rate your experience and enjoy peace of mind.')}</p>
                </div>
              </div>
            </div>

            <div className="pt-2 relative z-10">
              <Link href="/services" className="btn-primary w-full text-xs py-3">
                {t('home.experienceNow', 'Experience It Now')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. VERIFIED TECHNICIANS NETWORK SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 content-deferred">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold tracking-wider uppercase text-brand-600">{t('home.techniciansTag', 'The Human Backbone')}</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            {t('home.techniciansTitle', 'Meet Our Verified Technicians')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            {t('home.techniciansSubtitle', 'Certified specialists ready to assist your residential, commercial, or enterprise infrastructure.')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Tech 1 */}
          <div className="card-premium p-6 flex flex-col justify-between space-y-4">
            <div className="flex items-start gap-4">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
                alt="Md. Abul Kalam"
                loading="lazy"
                decoding="async"
                className="w-14 h-14 rounded-2xl object-cover border-2 border-brand-200"
              />
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-slate-900 text-sm">Md. Abul Kalam</h4>
                  <span className="inline-flex items-center text-[10px] bg-brand-50 text-brand-600 font-bold px-1.5 py-0.5 rounded">
                    {t('common.verified', 'Verified')}
                  </span>
                </div>
                <p className="text-xs text-brand-600 font-medium">Master Electrician &bull; 8 Yrs Exp</p>
                <div className="flex items-center gap-1 text-amber-500 text-xs mt-1">
                  <Star className="w-3.5 h-3.5 fill-amber-500" />
                  <span className="font-bold text-slate-800">4.9</span>
                  <span className="text-slate-400 text-[11px]">(48 {t('home.completedJobs', 'Completed Jobs')})</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Specialized in commercial house wiring, distribution boards, and industrial electrical troubleshooting.
            </p>

            <div className="flex flex-wrap gap-1.5">
              <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">House Wiring</span>
              <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">Distribution Board</span>
              <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">IPS Setup</span>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">{t('home.serviceArea', 'Service Area')}: <strong className="text-slate-800">Moulvibazar Sadar</strong></span>
              <Link href="/services/complete-house-electrical-wiring" className="text-brand-600 font-semibold hover:underline">
                {t('home.bookTech', 'Book Tech')}
              </Link>
            </div>
          </div>

          {/* Tech 2 */}
          <div className="card-premium p-6 flex flex-col justify-between space-y-4">
            <div className="flex items-start gap-4">
              <img
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
                alt="Tariqul Islam"
                loading="lazy"
                decoding="async"
                className="w-14 h-14 rounded-2xl object-cover border-2 border-purple-200"
              />
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-slate-900 text-sm">Tariqul Islam</h4>
                  <span className="inline-flex items-center text-[10px] bg-brand-50 text-brand-600 font-bold px-1.5 py-0.5 rounded">
                    {t('common.verified', 'Verified')}
                  </span>
                </div>
                <p className="text-xs text-purple-600 font-medium">CCTV &amp; Network Specialist &bull; 5 Yrs Exp</p>
                <div className="flex items-center gap-1 text-amber-500 text-xs mt-1">
                  <Star className="w-3.5 h-3.5 fill-amber-500" />
                  <span className="font-bold text-slate-800">4.85</span>
                  <span className="text-slate-400 text-[11px]">(31 {t('home.completedJobs', 'Completed Jobs')})</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Certified Dahua &amp; Hikvision technician. Expert in DVR/NVR configuration and Wi-Fi router coverage.
            </p>

            <div className="flex flex-wrap gap-1.5">
              <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">CCTV Security</span>
              <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">Wi-Fi Setup</span>
              <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">Laptop Repair</span>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">{t('home.serviceArea', 'Service Area')}: <strong className="text-slate-800">Kusumbag &amp; Sreemangal</strong></span>
              <Link href="/services/cctv-camera-installation-setup" className="text-brand-600 font-semibold hover:underline">
                {t('home.bookTech', 'Book Tech')}
              </Link>
            </div>
          </div>

          {/* Become a Technician Frosted Card */}
          <div className="rounded-3xl border-2 border-dashed border-brand-400/50 bg-white/60 backdrop-blur-xl p-6 flex flex-col justify-between space-y-4 text-center shadow-lg shadow-brand-500/5 hover:border-brand-500 transition-all duration-300">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white flex items-center justify-center mx-auto shadow-md shadow-brand-500/30 border border-white/20">
                <Wrench className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-slate-900 text-base">{t('home.joinNetworkTitle', 'Are You a Skilled Technician?')}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t('home.joinNetworkDesc', 'Join NEED ELECTRO network. Receive confirmed local service requests, build your profile, and receive fast payouts to your digital wallet.')}
              </p>
            </div>
            <div>
              <Link href="/become-a-technician" className="btn-primary w-full text-xs py-2.5">
                {t('home.joinNetworkBtn', 'Join Verified Network')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. NATIONWIDE COVERAGE SECTION - Glass Dark Panel */}
      <section className="glass-card-dark text-white py-14 relative overflow-hidden content-deferred">
        <div className="absolute -top-24 left-1/4 w-96 h-96 bg-[radial-gradient(circle,rgba(8,127,229,0.18)_0%,rgba(8,127,229,0)_70%)] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-400">{t('home.nationwideTag', 'Bangladesh-Wide Coverage')}</span>
              <h2 className="text-2xl font-extrabold text-white">{t('home.nationwideTitle', 'Serving All 64 Districts Nationwide')}</h2>
              <p className="text-xs text-slate-300 max-w-xl">
                {t('home.nationwideDesc', 'Fast courier delivery of genuine laptops, computers, CCTV surveillance kits, and networking equipment to all 64 districts. On-site technical support available in verified regional hubs.')}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Link
                href="/locations"
                className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition shadow-lg shadow-brand-600/30 flex items-center gap-2"
              >
                <MapPin className="w-4 h-4" />
                <span>{t('home.nationwideBtn', 'Explore 64 Districts Coverage')}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. NEED HELP / HOTLINE CALLOUT - Frosted Gradient Sheen Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 content-deferred">
        <div className="bg-gradient-to-r from-brand-600/90 via-brand-700/90 to-slate-900/90 backdrop-blur-md text-white rounded-3xl p-6 sm:p-10 md:p-12 shadow-2xl border border-white/20 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[radial-gradient(circle,rgba(56,189,248,0.22)_0%,rgba(56,189,248,0)_70%)] pointer-events-none" />
          
          <div className="space-y-3 text-center md:text-left relative z-10 w-full">
            <span className="inline-block px-3.5 py-1 rounded-full text-[11px] font-bold bg-white/20 backdrop-blur-md border border-white/30 text-white">
              {t('home.hotlineTag', 'NEED HELP? WE ARE HERE 7 DAYS A WEEK')}
            </span>
            <h2 className="text-xl sm:text-3xl font-black text-white">
              {t('home.hotlineTitle', 'Speak Directly With Our Electrical & Tech Engineers')}
            </h2>
            <p className="text-xs sm:text-sm text-brand-100 max-w-lg mx-auto md:mx-0">
              {t('home.hotlineDesc', 'Have questions about wiring safety, computer repairs, or warranty claims? Call our direct hotline or connect with our support desk online.')}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 relative z-10 w-full sm:w-auto">
            <a
              href="tel:01733983752"
              className="btn-secondary w-full sm:w-auto justify-center text-sm py-3 px-6 text-brand-700 font-bold bg-white/95 hover:bg-white shadow-lg"
            >
              <PhoneCall className="w-4 h-4 mr-2 text-brand-600 shrink-0" />
              01733 983752
            </a>
            <Link
              href="/contact"
              className="w-full sm:w-auto text-center px-5 py-3 rounded-xl border border-white/40 bg-white/10 backdrop-blur-md text-white hover:bg-white/20 text-sm font-semibold transition shadow-xs"
            >
              {t('home.contactSupportBtn', 'Contact Support Desk')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
