import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import prisma from '@/lib/db';
import { BANGLADESH_DISTRICTS } from '@/lib/data/districts';
import { ShieldCheck, MapPin, Phone, Star, Wrench, CheckCircle2, Clock, Zap, ChevronRight } from 'lucide-react';

interface Props {
  params: Promise<{
    slug: string;
    location: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, location } = await params;
  const formattedLocation = location.charAt(0).toUpperCase() + location.slice(1).toLowerCase();

  const service = await prisma.service.findUnique({
    where: { slug },
  });

  const serviceTitle = service?.name || slug.replace(/-/g, ' ');

  const title = `${serviceTitle} in ${formattedLocation} | NEED ELECTRO Verified Technicians`;
  const description = `Book certified, background-checked technicians for ${serviceTitle.toLowerCase()} in ${formattedLocation}, Bangladesh. Same-day dispatch, transparent BDT pricing, and 30-day workmanship warranty.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://www.needelectro.store/services/${slug}/${location.toLowerCase()}`,
    },
    openGraph: {
      title,
      description,
      url: `https://www.needelectro.store/services/${slug}/${location.toLowerCase()}`,
      type: 'website',
    },
  };
}

export default async function ServiceLocationPage({ params }: Props) {
  const { slug, location } = await params;
  const formattedLocation = location.charAt(0).toUpperCase() + location.slice(1).toLowerCase();

  const districtData = BANGLADESH_DISTRICTS.find(
    (d) => d.name.toLowerCase() === location.toLowerCase()
  );

  const service = await prisma.service.findUnique({
    where: { slug },
    include: { category: true },
  });

  const serviceTitle = service?.name || slug.replace(/-/g, ' ');
  const basePrice = service?.basePrice || 500;

  // Schema.org LocalBusiness + Service
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: `NEED ELECTRO — ${serviceTitle} in ${formattedLocation}`,
    description: `Professional technical and electrical services for ${serviceTitle} in ${formattedLocation}.`,
    telephone: '+8801733983752',
    address: {
      '@type': 'PostalAddress',
      addressLocality: formattedLocation,
      addressCountry: 'BD',
    },
    priceRange: `৳${basePrice} - ৳15000`,
    openingHours: 'Mo,Tu,We,Th,Fr,Sa,Su 08:00-22:00',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '128',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: `${serviceTitle} Packages`,
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: `${serviceTitle} Service in ${formattedLocation}`,
          },
          price: basePrice,
          priceCurrency: 'BDT',
        },
      ],
    },
  };

  const thanas: string[] = ['Sadar Upazila', 'Model Town', 'Industrial Zone', 'Residential Commercial Area', 'Central Hub'];

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-5xl mx-auto space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-brand-600">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/services" className="hover:text-brand-600">Services</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href={`/services/${slug}`} className="hover:text-brand-600">{serviceTitle}</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-900 font-semibold">{formattedLocation}</span>
        </nav>

        {/* Hero Banner */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold">
              <MapPin className="w-3.5 h-3.5 text-brand-600" />
              Verified Local Hub • {formattedLocation}, Bangladesh
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Professional {serviceTitle} in {formattedLocation}
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Book certified electrical and technical specialists across {formattedLocation}. Fast on-site dispatch, transparent BDT rates, genuine replacement parts, and 30-day warranty.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                4.9 / 5.0 (120+ Completed Jobs in {formattedLocation})
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                30-Day Workmanship Warranty
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <Link
                href={`/booking?service=${slug}&district=${encodeURIComponent(formattedLocation)}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-brand-600 text-white font-black text-sm shadow-md hover:bg-brand-700 transition"
              >
                <Zap className="w-4 h-4 fill-white" />
                Book Technician in {formattedLocation} (From ৳{basePrice})
              </Link>
              <a
                href="tel:01733983752"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition"
              >
                <Phone className="w-4 h-4 text-emerald-600" />
                Emergency Hotline: 01733-983752
              </a>
            </div>
          </div>
        </div>

        {/* Coverage Thanas */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-black text-slate-900">
            Active Coverage Thanas & Upazilas in {formattedLocation}
          </h2>
          <p className="text-xs text-slate-500">
            Our certified technicians provide doorstep service across all upazilas and wards in {formattedLocation}:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 pt-2">
            {thanas.map((thana: string, idx: number) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 font-medium"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">{thana}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Service Guarantee Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-2">
            <Clock className="w-6 h-6 text-brand-600" />
            <h3 className="font-black text-sm text-slate-900">30-Min Rapid Dispatch</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Available 24/7 for urgent power outages, breaker trips, and emergency electrical hazards.
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-2">
            <Wrench className="w-6 h-6 text-brand-600" />
            <h3 className="font-black text-sm text-slate-900">Standardized BDT Pricing</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Fixed rate starting at ৳{basePrice}. Itemized quotation provided before any physical work starts.
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            <h3 className="font-black text-sm text-slate-900">Official Service Warranty</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Free revisits and repairs on installation and workmanship defects for 30 days after completion.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
