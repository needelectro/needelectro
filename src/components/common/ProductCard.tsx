'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShoppingCart, 
  ShieldCheck, 
  Truck, 
  Check, 
  CheckCircle2, 
  Heart,
  Star,
  Eye
} from 'lucide-react';
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
    rating?: number | null;
    reviewsCount?: number | null;
  };
  onAddToCart?: (product: any, e: React.MouseEvent) => void;
  className?: string;
}

export default function ProductCard({ product, onAddToCart, className = '' }: ProductCardProps) {
  const { addToCart } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Check wishlist state in localStorage
  useEffect(() => {
    try {
      const savedWishlist = localStorage.getItem('ne_wishlist');
      if (savedWishlist) {
        const ids: string[] = JSON.parse(savedWishlist);
        setIsWishlisted(ids.includes(product.id));
      }
    } catch {
      // Ignore
    }
  }, [product.id]);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const savedWishlist = localStorage.getItem('ne_wishlist');
      let ids: string[] = savedWishlist ? JSON.parse(savedWishlist) : [];
      if (ids.includes(product.id)) {
        ids = ids.filter(id => id !== product.id);
        setIsWishlisted(false);
      } else {
        ids.push(product.id);
        setIsWishlisted(true);
      }
      localStorage.setItem('ne_wishlist', JSON.stringify(ids));
    } catch {
      setIsWishlisted(!isWishlisted);
    }
  };

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
  const discountPercent = hasDiscount && product.price > 0 
    ? Math.round(((product.price - effectivePrice) / product.price) * 100) 
    : 0;

  const isOutOfStock = typeof product.stock === 'number' && product.stock <= 0;
  const isLowStock = typeof product.stock === 'number' && product.stock > 0 && product.stock <= 3;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) return;

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
      className={`card-premium overflow-hidden flex flex-col justify-between group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
        product.isFeatured ? 'border-brand-300 bg-brand-50/10' : ''
      } ${className}`}
    >
      <div>
        {/* Square Image container with zoom effect, badges and wishlist button */}
        <Link 
          href={`/product/${product.slug}`} 
          className="block relative aspect-square w-full bg-slate-50/90 overflow-hidden p-3 border-b border-slate-100/80"
        >
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

          {/* Top-Right Wishlist Heart Button */}
          <button
            onClick={toggleWishlist}
            type="button"
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-white shadow-xs transition"
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
          </button>

          {/* Genuine Discount Badge */}
          {hasDiscount && discountPercent > 0 && (
            <span className="absolute bottom-2 left-2 bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-xs">
              -{discountPercent}% OFF
            </span>
          )}

          {/* Stock Availability Pill */}
          {isOutOfStock ? (
            <span className="absolute bottom-2 right-2 bg-slate-800/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
              Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="absolute bottom-2 right-2 bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
              Only {product.stock} left
            </span>
          ) : null}
        </Link>

        {/* Content Body */}
        <div className="p-3 sm:p-3.5 space-y-1.5">
          {/* Brand & Stock Status Line */}
          <div className="flex items-center justify-between text-[10px]">
            <span className="font-bold text-brand-600 uppercase tracking-tight">
              {product.brand?.name || 'Genuine Stock'}
            </span>
            {product.warrantyPeriodMonths ? (
              <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                <ShieldCheck className="w-2.5 h-2.5" />
                {product.warrantyPeriodMonths}M Warranty
              </span>
            ) : (
              <span className="text-slate-400">Verified</span>
            )}
          </div>

          {/* Product Title */}
          <Link href={`/product/${product.slug}`} className="block">
            <h3 className="font-bold text-slate-900 text-xs sm:text-sm leading-tight line-clamp-2 group-hover:text-brand-600 transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Pricing Row */}
          <div className="pt-1 flex items-baseline gap-1.5 flex-wrap">
            <strong className="text-sm sm:text-base font-black text-slate-950">
              ৳{effectivePrice.toLocaleString('en-BD')}
            </strong>
            {hasDiscount && (
              <span className="text-[10px] sm:text-[11px] text-slate-400 line-through">
                ৳{product.price.toLocaleString('en-BD')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons: Touch-Friendly 2-column or Details + Quick Add */}
      <div className="p-3 pt-0 grid grid-cols-2 gap-1.5">
        <Link
          href={`/product/${product.slug}`}
          className="btn-secondary text-[11px] py-1.5 px-2 text-center rounded-xl hover:border-brand-400 hover:text-brand-600 transition flex items-center justify-center font-bold"
        >
          Details
        </Link>
        <button
          onClick={handleAdd}
          disabled={isOutOfStock}
          className={`text-[11px] py-1.5 px-2 rounded-xl flex items-center justify-center gap-1 transition-all shadow-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed ${
            justAdded
              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
              : isOutOfStock
              ? 'bg-slate-200 text-slate-500'
              : 'btn-primary'
          }`}
        >
          {justAdded ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Added!</span>
            </>
          ) : isOutOfStock ? (
            <span>Sold Out</span>
          ) : (
            <>
              <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
              <span>Add</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
