'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, ShieldCheck, Truck, Check, CheckCircle2 } from 'lucide-react';
import { useCart } from '@/lib/context/CartContext';

export interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    discountPrice?: number | null;
    salePrice?: number | null;
    images?: string[] | string | null;
    warrantyPeriodMonths?: number | null;
    shortDescription?: string | null;
    sku?: string | null;
    isFeatured?: boolean | null;
    brand?: { name: string } | null;
    category?: { name: string } | null;
    stock?: number | null;
  };
  onAddToCart?: (product: any, e: React.MouseEvent) => void;
  className?: string;
}

export default function ProductCard({ product, onAddToCart, className = '' }: ProductCardProps) {
  const { addToCart } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  // Parse image URL safely
  let img = '/brand/needelectro-icon.png';
  if (Array.isArray(product.images) && product.images.length > 0) {
    img = product.images[0];
  } else if (typeof product.images === 'string' && product.images.trim()) {
    img = product.images.split(',')[0].trim();
  }

  const effectivePrice = product.discountPrice ?? product.salePrice ?? product.price;
  const hasDiscount = (product.discountPrice && product.discountPrice < product.price) ||
                      (product.salePrice && product.salePrice < product.price);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (onAddToCart) {
      onAddToCart(product, e);
    } else {
      addToCart(product as any, 1);
    }

    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  return (
    <div
      className={`card-premium overflow-hidden flex flex-col justify-between group transition-all duration-300 hover:-translate-y-1 ${
        product.isFeatured ? 'border-brand-300 bg-brand-50/10' : ''
      } ${className}`}
    >
      <div>
        {/* Square Image container with zoom effect and frosted pills (matches ServiceCard) */}
        <Link href={`/product/${product.slug}`} className="block relative aspect-square w-full bg-slate-50/90 overflow-hidden p-3.5 border-b border-slate-100/80">
          <img
            src={img || '/brand/needelectro-icon.png'}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-contain mx-auto group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Top-Left Category / Brand Pill */}
          <span className="absolute top-2 left-2 bg-white/95 backdrop-blur-md text-slate-800 text-[9px] font-bold px-2 py-0.5 rounded-full shadow-xs border border-slate-200/50">
            {product.category?.name || product.brand?.name || 'Hardware'}
          </span>

          {/* Top-Right Warranty / Guarantee Pill */}
          {product.warrantyPeriodMonths ? (
            <span className="absolute top-2 right-2 bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
              <ShieldCheck className="w-2.5 h-2.5 fill-white" />
              {product.warrantyPeriodMonths}M Warranty
            </span>
          ) : (
            <span className="absolute top-2 right-2 bg-brand-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
              <CheckCircle2 className="w-2.5 h-2.5 fill-white" />
              Genuine
            </span>
          )}
        </Link>

        {/* Content Body */}
        <div className="p-3 space-y-1.5">
          <Link href={`/product/${product.slug}`} className="block">
            <h3 className="font-bold text-slate-900 text-xs sm:text-sm leading-tight line-clamp-1 group-hover:text-brand-600 transition-colors">
              {product.name}
            </h3>
          </Link>
          <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
            {product.shortDescription || (product.brand?.name ? `${product.brand.name} • Official Hardware Stock` : 'Genuine technology equipment with digital warranty.')}
          </p>

          {/* Meta Row (Border-t) */}
          <div className="pt-1.5 flex items-center justify-between text-[11px] border-t border-slate-100">
            <div className="flex items-center gap-1 text-slate-500">
              <Truck className="w-3 h-3 text-brand-600" />
              <span className="text-[10px]">64 Districts</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-[10px] text-slate-500">Price:</span>
              <strong className="text-xs sm:text-sm font-extrabold text-slate-900">
                ৳{effectivePrice.toLocaleString('en-BD')}
              </strong>
              {hasDiscount && (
                <span className="text-[10px] text-slate-400 line-through ml-0.5">
                  ৳{product.price.toLocaleString('en-BD')}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons: 2-column grid matching ServiceCard exactly */}
      <div className="p-3 pt-0 grid grid-cols-2 gap-1.5">
        <Link
          href={`/product/${product.slug}`}
          className="btn-secondary text-[10px] py-1.5 px-1 text-center rounded-lg hover:border-brand-400 hover:text-brand-600 transition-colors flex items-center justify-center"
        >
          Details
        </Link>
        <button
          onClick={handleAdd}
          className={`text-[10px] py-1.5 px-1 rounded-lg flex items-center justify-center gap-1 transition-all shadow-xs ${
            justAdded
              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
              : 'btn-primary'
          }`}
        >
          {justAdded ? (
            <>
              <Check className="w-3 h-3" />
              Added!
            </>
          ) : (
            <>
              <ShoppingCart className="w-3 h-3" />
              Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
}
