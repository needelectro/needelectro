import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { 
  MapPin, 
  Truck, 
  ShieldCheck, 
  Zap, 
  Laptop, 
  Search, 
  ChevronRight, 
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';
import { BANGLADESH_DISTRICTS, BANGLADESH_DIVISIONS } from '@/lib/data/districts';

export const metadata: Metadata = {
  title: 'Bangladesh Nationwide Service & Delivery Coverage | All 64 Districts',
  description:
    'Explore NEED ELECTRO SHOP delivery and technical service coverage across all 64 districts in Bangladesh. Verified laptops, computers, CCTV systems, and electrical solutions delivered to your doorstep.',
  alternates: {
    canonical: 'https://www.needelectro.store/locations',
  },
  openGraph: {
    title: 'NEED ELECTRO SHOP | 64 Districts Nationwide Coverage in Bangladesh',
    description:
      'Fast doorstep delivery of laptops, CCTV cameras, routers, and electronics across Dhaka, Sylhet, Chattogram, and all 64 districts of Bangladesh.',
    url: 'https://www.needelectro.store/locations',
  },
};

export default function LocationsIndexPage() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.needelectro.store',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Locations & Coverage',
        item: 'https://www.needelectro.store/locations',
      },
    ],
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      {/* Breadcrumb Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <Link href="/" className="hover:text-brand-600 transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-900 font-semibold">Districts &amp; Coverage</span>
      </nav>

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-brand-950 text-white p-8 sm:p-12 shadow-2xl border border-slate-800">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-brand-500/20 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 border border-brand-400/30 text-brand-300 text-xs font-semibold">
            <Truck className="w-3.5 h-3.5" />
            <span>Serving All 64 Districts of Bangladesh</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight text-white">
            Nationwide Coverage &amp; Delivery Information
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            NEED ELECTRO SHOP is an online technology marketplace operating across Bangladesh. We deliver genuine laptops, computer components, CCTV surveillance gear, routers, and electrical hardware directly to your doorstep in all 64 districts, backed by official warranty and technical support.
          </p>
        </div>

        {/* Highlight Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-slate-700/60 text-slate-300 text-xs sm:text-sm">
          <div>
            <div className="text-xl sm:text-2xl font-black text-white">64</div>
            <div className="text-slate-400">Districts Covered</div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-white">8</div>
            <div className="text-slate-400">Administrative Divisions</div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-white">24-72h</div>
            <div className="text-slate-400">Standard Delivery</div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-white">100%</div>
            <div className="text-slate-400">Genuine Products</div>
          </div>
        </div>
      </div>

      {/* Policy and Coverage Transparency Note */}
      <div className="bg-blue-50/60 border border-blue-200/80 rounded-2xl p-5 sm:p-6 text-xs sm:text-sm text-slate-700 space-y-2">
        <div className="flex items-center gap-2 font-bold text-brand-900">
          <ShieldCheck className="w-4 h-4 text-brand-600" />
          <span>Accurate Service &amp; Delivery Transparency</span>
        </div>
        <p className="leading-relaxed">
          NEED ELECTRO SHOP operates as an online marketplace with central fulfillment and verified logistics partners. We deliver physical technology hardware to all 64 districts via courier. On-site technical services (electrical wiring, CCTV installation, physical repairs) are provided directly in verified service hubs (Sylhet, Moulvibazar, Dhaka), while other districts receive remote diagnostics and scheduled on-site support.
        </p>
      </div>

      {/* Divisions & Districts Grid */}
      <div className="space-y-12">
        <div className="border-b border-slate-200 pb-4">
          <h2 className="text-2xl font-black text-slate-900">
            Browse Coverage by Administrative Division
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Select your district to view localized delivery estimates, available product categories, and technical services.
          </p>
        </div>

        <div className="space-y-10">
          {BANGLADESH_DIVISIONS.map((division) => {
            const districtsInDivision = BANGLADESH_DISTRICTS.filter(
              (d) => d.division.toLowerCase() === division.toLowerCase()
            );

            return (
              <div key={division} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-1.5 bg-brand-600 rounded-full" />
                  <h3 className="text-xl font-bold text-slate-900">
                    {division} Division{' '}
                    <span className="text-sm font-normal text-slate-500">
                      ({districtsInDivision.length} Districts)
                    </span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {districtsInDivision.map((district) => (
                    <Link
                      key={district.id}
                      href={`/locations/${district.slug}`}
                      className="group relative p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-brand-500 hover:shadow-lg hover:shadow-brand-500/10 transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors text-sm sm:text-base">
                              {district.name}
                            </h4>
                            <p className="text-xs text-slate-400 font-bangla">
                              {district.nameBn}
                            </p>
                          </div>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                            {district.deliveryTimeDays}
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {district.serviceCoverageNote}
                        </p>
                      </div>

                      <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-brand-600 font-semibold">
                        <span>View District Page</span>
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
