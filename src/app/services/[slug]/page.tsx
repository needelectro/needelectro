import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import prisma from '@/lib/db';
import ServiceDetailClient from './ServiceDetailClient';

interface ServicePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = await prisma.service.findUnique({
    where: { slug },
    include: { category: true },
  });

  if (!service) {
    return {
      title: 'Service Not Found | NEED ELECTRO SHOP',
    };
  }

  const title = `${service.name} in Bangladesh`;
  const description = `${service.shortDescription} Professional technical services starting at ৳${service.basePrice.toLocaleString('en-BD')}. Verified technicians, transparent rates, and post-service warranty across Bangladesh.`;
  const canonicalUrl = `https://www.needelectro.store/services/${service.slug}`;
  const image = service.imageUrl || 'https://www.needelectro.store/brand/needelectro-logo.png';

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: 'website',
      images: [
        {
          url: image,
          alt: service.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

export default async function ServiceDetailPage({ params }: ServicePageProps) {
  const { slug } = await params;
  const service = await prisma.service.findUnique({
    where: { slug },
    include: { category: true },
  });

  if (!service) {
    notFound();
  }

  const canonicalUrl = `https://www.needelectro.store/services/${service.slug}`;

  // Structured Data: Service Schema
  const serviceSchema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.shortDescription || service.fullDescription,
    image: service.imageUrl || 'https://www.needelectro.store/brand/needelectro-logo.png',
    provider: {
      '@type': 'Organization',
      name: 'NEED ELECTRO SHOP',
      url: 'https://www.needelectro.store',
      telephone: '+8801733983752',
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'BDT',
      price: service.basePrice,
      url: canonicalUrl,
    },
    areaServed: {
      '@type': 'Country',
      name: 'Bangladesh',
    },
  };

  // Structured Data: BreadcrumbList
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
        name: 'Services',
        item: 'https://www.needelectro.store/services',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: service.name,
        item: canonicalUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ServiceDetailClient service={service} />
    </>
  );
}
