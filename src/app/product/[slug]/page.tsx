import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import prisma from '@/lib/db';
import ProductDetailClient from './ProductDetailClient';

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true, brand: true },
  });

  if (!product) {
    return {
      title: 'Product Not Found | NEED ELECTRO SHOP',
    };
  }

  const effectivePrice = product.discountPrice ?? product.price;
  const title = product.name;
  const description = `Buy ${product.name} at NEED ELECTRO SHOP. Genuine specifications, current price ৳${effectivePrice.toLocaleString('en-BD')}, ${product.warrantyPeriodMonths} months official warranty, and fast doorstep delivery across Bangladesh.`;
  const canonicalUrl = `https://www.needelectro.store/product/${product.slug}`;
  const images = product.images ? product.images.split(',') : [];
  const primaryImage = images[0] || 'https://www.needelectro.store/brand/needelectro-logo.png';

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
          url: primaryImage,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [primaryImage],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      brand: true,
      reviews: {
        where: { isApproved: true },
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { customer: { include: { user: { select: { name: true } } } } },
      },
    },
  });

  if (!product) {
    notFound();
  }

  const imageList = product.images ? product.images.split(',') : [];
  let parsedSpecs: Record<string, any> = {};
  if (product.specifications) {
    try {
      parsedSpecs = JSON.parse(product.specifications);
    } catch {
      parsedSpecs = {};
    }
  }

  const formattedProduct = {
    ...product,
    images: imageList,
    specifications: parsedSpecs,
  };

  const effectivePrice = product.discountPrice ?? product.price;
  const canonicalUrl = `https://www.needelectro.store/product/${product.slug}`;

  // Structured Data: Product + Offer
  const productSchema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: imageList,
    description: product.shortDescription || product.description,
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: product.brand?.name || 'NEED ELECTRO',
    },
    offers: {
      '@type': 'Offer',
      url: canonicalUrl,
      priceCurrency: 'BDT',
      price: effectivePrice,
      priceValidUntil: '2027-12-31',
      itemCondition:
        product.condition === 'REFURBISHED'
          ? 'https://schema.org/RefurbishedCondition'
          : 'https://schema.org/NewCondition',
      availability:
        product.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'NEED ELECTRO SHOP',
      },
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
        name: 'Shop',
        item: 'https://www.needelectro.store/shop',
      },
      ...(product.category
        ? [
            {
              '@type': 'ListItem',
              position: 3,
              name: product.category.name,
              item: `https://www.needelectro.store/shop?category=${product.category.slug}`,
            },
            {
              '@type': 'ListItem',
              position: 4,
              name: product.name,
              item: canonicalUrl,
            },
          ]
        : [
            {
              '@type': 'ListItem',
              position: 3,
              name: product.name,
              item: canonicalUrl,
            },
          ]),
    ],
  };

  // Fetch related and compatible products from same category
  let relatedProducts: any[] = [];
  try {
    relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        isActive: true,
      },
      take: 4,
      include: {
        category: true,
        brand: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  } catch (err) {
    console.warn('[ProductDetailPage] Related products fetch warning:', err);
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ProductDetailClient product={formattedProduct} relatedProducts={relatedProducts} />
    </>
  );
}
