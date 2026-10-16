'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShoppingCart, 
  ShieldCheck, 
  Check, 
  Heart 
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
      className={`relative rounded-3xl border border-[#cde4fd] bg-[#f0f6fe] overflow-hidden flex flex-col justify-between group transition-all duration-300 hover:shadow-lg hover:border-brand-400 ${
        product.isFeatured ? 'ring-2 ring-brand-400/50' : ''
      } ${className}`}
    >
      <div>
        {/* Top White Square Image Container */}
        <Link 
          href={`/product/${product.slug}`} 
          className="block relative aspect-square w-full bg-white overflow-hidden p-4 rounded-t-3xl flex items-center justify-center"
        >
          <img
            src={img || '/brand/needelectro-icon.png'}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-contain mx-auto group-hover:scale-105 transition-transform duration-300"
          />

          {/* Top-Left Category Badge */}
          <span className="absolute top-3 left-3 bg-white text-slate-800 text-[11px] font-semibold px-3 py-1 rounded-full border border-slate-200/80 shadow-xs">
            {product.category?.name || product.brand?.name || 'Laptops & Computers'}
          </span>

          {/* Top-Right Wishlist Heart Button */}
          <button
            onClick={toggleWishlist}
            type="button"
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white border border-slate-200/80 flex items-center justify-center text-slate-400 hover:text-red-500 shadow-xs transition"
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
          </button>

          {/* Genuine Discount Badge */}
          {hasDiscount && discountPercent > 0 && (
            <span className="absolute bottom-2 left-3 bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-xs">
              -{discountPercent}% OFF
            </span>
          )}

          {/* Stock Availability Pill */}
          {isOutOfStock && (
            <span className="absolute bottom-2 right-3 bg-slate-900/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
              Out of Stock
            </span>
          )}
        </Link>

        {/* Bottom Pastel Light Blue Content Area */}
        <div className="p-3.5 sm:p-4 bg-[#f0f6fe] space-y-2">
          {/* Row 1: Brand & Warranty */}
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#087fe5] uppercase tracking-wide">
              {product.brand?.name || 'GENUINE'}
            </span>
            <span className="text-emerald-700 font-semibold flex items-center gap-1 text-[11px] sm:text-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              {product.warrantyPeriodMonths ? `${product.warrantyPeriodMonths}M Warranty` : '12M Warranty'}
            </span>
          </div>

          {/* Row 2: Product Title */}
          <Link href={`/product/${product.slug}`} className="block">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug line-clamp-1 group-hover:text-brand-600 transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Row 3: Pricing */}
          <div className="pt-0.5 flex items-baseline gap-2">
            <strong className="text-base sm:text-xl font-black text-slate-950">
              ৳{effectivePrice.toLocaleString('en-BD')}
            </strong>
            {hasDiscount && (
              <span className="text-xs text-slate-400 line-through">
                ৳{product.price.toLocaleString('en-BD')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Row 4: Two Side-By-Side Action Buttons: Details + Add */}
      <div className="p-3.5 sm:p-4 pt-0 bg-[#f0f6fe] grid grid-cols-2 gap-2">
        <Link
          href={`/product/${product.slug}`}
          className="w-full py-2 px-3 rounded-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/80 font-bold text-xs sm:text-sm text-center shadow-xs transition-colors flex items-center justify-center"
        >
          Details
        </Link>
        <button
          onClick={handleAdd}
          disabled={isOutOfStock}
          className={`w-full py-2 px-3 rounded-full font-bold text-xs sm:text-sm text-center shadow-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed ${
            justAdded
              ? 'bg-emerald-600 text-white'
              : isOutOfStock
              ? 'bg-slate-300 text-slate-600'
              : 'bg-[#087fe5] hover:bg-[#066ac0] text-white active:scale-95'
          }`}
        >
          {justAdded ? (
            <>
              <Check className="w-4 h-4" />
              <span>Added!</span>
            </>
          ) : isOutOfStock ? (
            <span>Sold Out</span>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4 shrink-0" />
              <span>Add</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
