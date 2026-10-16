import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { 
  MapPin, 
  Truck, 
  ShieldCheck, 
  Zap, 
  ShoppingBag, 
  PhoneCall, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  Star, 
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { BANGLADESH_DISTRICTS, getDistrictBySlug } from '@/lib/data/districts';
import ProductCard from '@/components/common/ProductCard';

interface PageProps {
  params: Promise<{
    district: string;
  }>;
}

export async function generateStaticParams() {
  return BANGLADESH_DISTRICTS.map((d) => ({
    district: d.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const district = getDistrictBySlug(resolvedParams.district);

  if (!district) {
    return {
      title: 'District Not Found | NEED ELECTRO SHOP',
    };
  }

  const url = `https://www.needelectro.store/locations/${district.slug}`;

  return {
    title: {
      absolute: district.metaTitle,
    },
    description: district.metaDescription,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: district.metaTitle,
      description: district.metaDescription,
      url,
      type: 'website',
      images: [
        {
          url: '/brand/needelectro-logo.png',
          width: 1132,
          height: 570,
          alt: `NEED ELECTRO SHOP ${district.name}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: district.metaTitle,
      description: district.metaDescription,
    },
  };
}

// Shared in-memory cache to prevent connection pool exhaustion during static build of 64 districts
let sharedDataCache: { products: any[]; services: any[] } | null = null;
let sharedDataPromise: Promise<{ products: any[]; services: any[] }> | null = null;

async function getDistrictPageData() {
  if (sharedDataCache) return sharedDataCache;
  if (!sharedDataPromise) {
    sharedDataPromise = (async () => {
      try {
        const [products, services] = await Promise.all([
          prisma.product.findMany({
            where: { isActive: true },
            take: 6,
            orderBy: { createdAt: 'desc' },
            include: { category: true },
          }),
          prisma.service.findMany({
            where: { isActive: true },
            take: 4,
            orderBy: { sortOrder: 'asc' },
          }),
        ]);
        sharedDataCache = { products, services };
        return sharedDataCache;
      } catch (err) {
        console.error('Error fetching district shared data:', err);
        return { products: [], services: [] };
      }
    })();
  }
  return sharedDataPromise;
}

export default async function DistrictLandingPage({ params }: PageProps) {
  const resolvedParams = await params;
  const district = getDistrictBySlug(resolvedParams.district);

  if (!district) {
    notFound();
  }

  // Fetch real active products using the single shared cache
  const { products, services } = await getDistrictPageData();

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
        name: 'Locations',
        item: 'https://www.needelectro.store/locations',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: district.name,
        item: `https://www.needelectro.store/locations/${district.slug}`,
      },
    ],
  };

  const faqList = district.faqs && district.faqs.length > 0 ? district.faqs : [
    {
      question: `How long does delivery take to ${district.name}?`,
      answer: `Orders to ${district.name} are delivered within ${district.deliveryTimeDays} via reliable courier partners with real-time parcel tracking.`,
    },
    {
      question: `Can I buy laptops, computers, and CCTV systems with official warranty in ${district.name}?`,
      answer: `Yes, all products sold by NEED ELECTRO SHOP come with genuine manufacturer or store warranties, valid for customers across ${district.name} and throughout Bangladesh.`,
    },
    {
      question: `How can I book technical support or service in ${district.name}?`,
      answer: district.onSiteServiceAvailable
        ? `You can book certified technicians directly through our website or helpline for on-site services in ${district.name}.`
        : `We provide remote technical support and scheduled consultations for ${district.name}. You can submit an inquiry online or call our support line at 01733 983752.`,
    },
  ];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqList.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      {/* Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <Link href="/" className="hover:text-brand-600 transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link href="/locations" className="hover:text-brand-600 transition-colors">Locations</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-900 font-semibold">{district.name}</span>
      </nav>

      {/* District Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-brand-950 text-white p-8 sm:p-12 shadow-2xl border border-slate-800">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-brand-500/20 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 border border-brand-400/30 text-brand-300 text-xs font-semibold">
            <MapPin className="w-3.5 h-3.5" />
            <span>{district.division} Division &bull; {district.nameBn}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight text-white">
            NEED ELECTRO SHOP in {district.name}
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {district.introText} We deliver brand-new and verified laptops, desktop computers, CCTV surveillance security cameras, Wi-Fi networking devices, and electrical equipment directly to {district.name} and surrounding upazilas.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-brand-600/30"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Browse Products</span>
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold backdrop-blur-md border border-white/20 transition-all"
            >
              <Zap className="w-4 h-4 text-brand-400" />
              <span>Technical Services</span>
            </Link>
          </div>
        </div>

        {/* District Fast Facts */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-slate-700/60 text-slate-300 text-xs sm:text-sm">
          <div>
            <div className="text-slate-400 text-xs">Estimated Delivery</div>
            <div className="text-base sm:text-lg font-bold text-white mt-0.5">{district.deliveryTimeDays}</div>
          </div>
          <div>
            <div className="text-slate-400 text-xs">Coverage Area</div>
            <div className="text-base sm:text-lg font-bold text-white mt-0.5">
              {district.deliveryCoverage === 'FULL_DISTRICT' ? 'Full District' : 'Sadar & Upazilas'}
            </div>
          </div>
          <div>
            <div className="text-slate-400 text-xs">On-Site Services</div>
            <div className="text-base sm:text-lg font-bold text-white mt-0.5">
              {district.onSiteServiceAvailable ? 'Available' : 'Remote / Scheduled'}
            </div>
          </div>
          <div>
            <div className="text-slate-400 text-xs">Customer Support</div>
            <div className="text-base sm:text-lg font-bold text-white mt-0.5">01733 983752</div>
          </div>
        </div>
      </div>

      {/* Honest Service & Delivery Transparency Notice */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
          <Truck className="w-5 h-5 text-brand-600" />
          <span>Delivery &amp; Service Policy for {district.name}</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          {district.serviceCoverageNote}
        </p>
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-1">
          <div className="font-semibold text-slate-800">Important Customer Information:</div>
          <div>&bull; NEED ELECTRO SHOP operates as a central online marketplace serving customers nationwide. We do not operate an unverified physical retail branch in {district.name}.</div>
          <div>&bull; Physical products (Laptops, Desktops, CCTV, Routers, Electrical Supplies) are dispatched via courier with tracking and warranty registration.</div>
          <div>&bull; For emergency electrical or technical queries, contact our customer helpdesk at 01733 983752.</div>
        </div>
      </div>

      {/* Genuine Products Available for Delivery */}
      {products.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-end justify-between border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Popular Technology Hardware for Delivery to {district.name}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Explore real products in stock, ready for nationwide delivery to {district.name}.
              </p>
            </div>
            <Link
              href="/shop"
              className="text-xs sm:text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}

      {/* Genuine Technical Services Section */}
      {services.length > 0 && (
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Technical &amp; Electrical Services
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {district.onSiteServiceAvailable
                ? `On-site professional technical solutions available in ${district.name}.`
                : `Technical consultations, remote diagnostic support, and scheduled solutions for ${district.name}.`}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {services.map((service) => (
              <div
                key={service.id}
                className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-brand-500 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                    <Zap className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {service.name}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {service.shortDescription}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">
                    ৳{service.basePrice.toLocaleString('en-BD')}
                  </span>
                  <Link
                    href={`/services/${service.slug}`}
                    className="font-semibold text-brand-600 hover:text-brand-700"
                  >
                    Details &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* District FAQs */}
      <div className="space-y-6">
        <div className="border-b border-slate-200 pb-4">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Frequently Asked Questions for {district.name}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Common questions regarding shipping, pricing, and warranty in {district.name}.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {faqList.map((faq, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white border border-slate-200/80 space-y-2"
            >
              <h3 className="font-bold text-slate-900 text-sm flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                <span>{faq.question}</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-6">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Other Districts Links in same division */}
      <div className="pt-8 border-t border-slate-200 space-y-4">
        <h3 className="text-sm font-bold text-slate-900">
          Other Districts in {district.division} Division
        </h3>
        <div className="flex flex-wrap gap-2">
          {BANGLADESH_DISTRICTS.filter(
            (d) => d.division.toLowerCase() === district.division.toLowerCase() && d.id !== district.id
          ).map((neighbor) => (
            <Link
              key={neighbor.id}
              href={`/locations/${neighbor.slug}`}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-brand-50 hover:text-brand-600 text-slate-700 text-xs font-medium transition-colors"
            >
              {neighbor.name} ({neighbor.nameBn})
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
