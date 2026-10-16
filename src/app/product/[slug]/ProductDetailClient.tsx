'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShoppingCart, 
  ShieldCheck, 
  Truck, 
  Zap, 
  PackageCheck,
  ChevronRight,
  ChevronLeft,
  Check,
  AlertCircle,
  Clock,
  Heart,
  Share2,
  RefreshCw,
  Star,
  Info
} from 'lucide-react';
import { useCart } from '@/lib/context/CartContext';
import ProductCard from '@/components/common/ProductCard';

interface ProductDetailClientProps {
  product: any;
  relatedProducts?: any[];
}

export default function ProductDetailClient({ product, relatedProducts = [] }: ProductDetailClientProps) {
  const router = useRouter();
  const { addToCart } = useCart();

  const images: string[] = product.images && product.images.length > 0 
    ? product.images 
    : ['/brand/needelectro-icon.png'];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Touch Swipe for mobile image gallery
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50 && activeImageIndex < images.length - 1) {
      // Swiped Left -> Next image
      setActiveImageIndex((prev) => prev + 1);
    } else if (diff < -50 && activeImageIndex > 0) {
      // Swiped Right -> Prev image
      setActiveImageIndex((prev) => prev - 1);
    }
  };

  const effectivePrice = product.discountPrice ?? product.price;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const discountPercent = hasDiscount && product.price > 0 
    ? Math.round(((product.price - effectivePrice) / product.price) * 100) 
    : 0;

  const isOutOfStock = typeof product.stock === 'number' && product.stock <= 0;
  const isLowStock = typeof product.stock === 'number' && product.stock > 0 && product.stock <= 3;

  const handleAddToCart = () => {
    if (!product || isOutOfStock) return;
    addToCart(product, quantity);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 3000);
  };

  const handleBuyNow = () => {
    if (!product || isOutOfStock) return;
    addToCart(product, quantity);
    router.push('/checkout');
  };

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 sm:space-y-12 pb-28 md:pb-10">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 overflow-x-auto whitespace-nowrap">
        <Link href="/" className="hover:text-brand-600 transition">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-400" />
        <Link href="/shop" className="hover:text-brand-600 transition">Shop</Link>
        {product.category && (
          <>
            <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <Link href={`/shop?category=${product.category.slug}`} className="hover:text-brand-600 transition">
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-400" />
        <span className="text-slate-900 font-semibold line-clamp-1">{product.name}</span>
      </nav>

      {/* Main Grid: Gallery & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 bg-white p-5 sm:p-8 md:p-10 rounded-3xl border border-slate-200/80 shadow-xs">
        {/* Left: Product Images Gallery with Mobile Touch-Swipe */}
        <div className="space-y-4">
          <div 
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="relative aspect-square sm:h-96 w-full bg-slate-50 rounded-3xl p-6 flex items-center justify-center border border-slate-100 overflow-hidden select-none"
          >
            <img
              src={images[activeImageIndex]}
              alt={product.name}
              decoding="async"
              className="max-h-full max-w-full object-contain transition-all duration-300"
            />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5 items-start">
              {hasDiscount && discountPercent > 0 && (
                <span className="bg-red-600 text-white text-[10px] sm:text-xs font-black px-2.5 py-1 rounded-full shadow-xs">
                  -{discountPercent}% OFF
                </span>
              )}
              <span className="bg-white/90 backdrop-blur-md text-slate-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-slate-200/60 shadow-xs">
                {product.condition || 'NEW'}
              </span>
            </div>

            {/* Share action */}
            <button
              onClick={handleShare}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-slate-500 hover:text-brand-600 hover:bg-white shadow-xs transition"
              title="Share product link"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            </button>

            {/* Left/Right controls (if multiple images) */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImageIndex((prev) => Math.max(0, prev - 1))}
                  disabled={activeImageIndex === 0}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-slate-700 hover:bg-white shadow-xs disabled:opacity-30 transition"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setActiveImageIndex((prev) => Math.min(images.length - 1, prev + 1))}
                  disabled={activeImageIndex === images.length - 1}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-slate-700 hover:bg-white shadow-xs disabled:opacity-30 transition"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Mobile dots indicator */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 sm:hidden bg-slate-900/40 backdrop-blur-md px-2.5 py-1 rounded-full">
                  {images.map((_, idx) => (
                    <span
                      key={idx}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        activeImageIndex === idx ? 'w-4 bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Desktop/Tablet Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
              {images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-16 h-16 rounded-2xl border p-1.5 bg-slate-50 shrink-0 transition-all ${
                    activeImageIndex === idx ? 'border-brand-500 ring-2 ring-brand-500/20' : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                  aria-label={`View image ${idx + 1}`}
                >
                  <img src={img} alt="" loading="lazy" decoding="async" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Purchase Form */}
        <div className="space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2 text-xs">
              <span className="bg-brand-50 text-brand-700 font-bold px-2 py-0.5 rounded uppercase">
                {product.brand?.name || 'GENUINE'}
              </span>
              <span className="text-slate-400">&bull;</span>
              <span className="text-slate-500 font-mono text-[11px]">SKU: {product.sku}</span>
              <span className="text-slate-400">&bull;</span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                {product.warrantyPeriodMonths ? `${product.warrantyPeriodMonths}M Warranty` : 'Official Guarantee'}
              </span>
            </div>

            <h1 className="text-xl sm:text-3xl font-black text-slate-950 leading-tight">
              {product.name}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 mt-2.5 leading-relaxed">
              {product.shortDescription || 'Genuine hardware stock supplied with digital warranty tracking.'}
            </p>
          </div>

          {/* Pricing Box */}
          <div className="p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-wrap items-baseline justify-between gap-3">
            <div className="flex items-baseline gap-2.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-950">
                ৳{effectivePrice.toLocaleString('en-BD')}
              </span>
              {hasDiscount && (
                <span className="text-xs sm:text-sm text-slate-400 line-through">
                  ৳{product.price.toLocaleString('en-BD')}
                </span>
              )}
            </div>

            {/* Stock status indicator */}
            {isOutOfStock ? (
              <span className="text-xs font-bold text-red-700 bg-red-100/80 px-3 py-1 rounded-full">
                Out of Stock
              </span>
            ) : isLowStock ? (
              <span className="text-xs font-bold text-amber-700 bg-amber-100/80 px-3 py-1 rounded-full">
                Low Stock (Only {product.stock} available)
              </span>
            ) : (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-3 py-1 rounded-full">
                In Stock ({product.stock} units)
              </span>
            )}
          </div>

          {/* Quantity and Actions (Desktop) */}
          <div className="space-y-4 pt-1">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-700">Quantity:</span>
              <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={isOutOfStock}
                  className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 disabled:opacity-40"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="px-3 py-1.5 text-xs font-bold text-slate-900">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock || 99, q + 1))}
                  disabled={isOutOfStock || (typeof product.stock === 'number' && quantity >= product.stock)}
                  className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 disabled:opacity-40"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            {/* Desktop Action Buttons */}
            <div className="hidden sm:grid sm:grid-cols-2 gap-3 pt-1">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="btn-secondary py-3 text-xs flex items-center justify-center gap-2 border-brand-500 text-brand-600 hover:bg-brand-50 disabled:opacity-40 font-bold"
              >
                <ShoppingCart className="w-4 h-4" />
                {addedNotice ? 'Added to Cart ✓' : 'Add to Cart'}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="btn-primary py-3 text-xs flex items-center justify-center gap-2 disabled:opacity-40 font-bold"
              >
                <Zap className="w-4 h-4 fill-white" />
                Buy Now (Express Checkout)
              </button>
            </div>
          </div>

          {/* Value Props & Delivery Estimates */}
          <div className="pt-4 border-t border-slate-100 space-y-3 text-xs text-slate-600">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800">{product.warrantyPeriodMonths} Months Official Warranty</strong>
                <p className="text-[11px] text-slate-500">Tracked with digital serial verification &amp; 7-day replacement assurance.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Truck className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800">Nationwide Insured Delivery (All 64 Districts)</strong>
                <p className="text-[11px] text-slate-500">Moulvibazar: 24-48 hrs (৳60) &bull; Other Districts: 3-5 days (৳120). Free delivery on eligible orders.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <PackageCheck className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800">Quality Verified &amp; Tested</strong>
                <p className="text-[11px] text-slate-500">Inspected at NEED ELECTRO Technology Center before dispatch.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications & Description */}
      <div className="bg-white p-5 sm:p-8 md:p-10 rounded-3xl border border-slate-200/80 shadow-xs space-y-8">
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 mb-3">Product Overview</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
            {product.description || product.shortDescription}
          </p>
        </div>

        {product.specifications && Object.keys(product.specifications).length > 0 && (
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 mb-4">Technical Specifications</h2>
            <div className="overflow-hidden border border-slate-200 rounded-2xl">
              <table className="w-full text-xs text-left">
                <tbody>
                  {Object.entries(product.specifications).map(([key, val], idx) => (
                    <tr
                      key={key}
                      className={idx % 2 === 0 ? 'bg-slate-50/70' : 'bg-white'}
                    >
                      <td className="px-4 py-3 font-bold text-slate-700 w-1/3 border-b border-slate-100">
                        {key}
                      </td>
                      <td className="px-4 py-3 text-slate-900 border-b border-slate-100">
                        {String(val)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Related Products Grid */}
      {relatedProducts.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600">Recommendations</span>
              <h2 className="text-lg sm:text-2xl font-black text-slate-900 mt-0.5">Related &amp; Compatible Products</h2>
            </div>
            <Link
              href="/shop"
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              Browse Shop
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}

      {/* Mobile Persistent Bottom Purchase Bar */}
      <div 
        aria-label="Mobile Purchase Bar"
        className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 p-3 pb-[calc(0.6rem+env(safe-area-inset-bottom,0px))] shadow-[0_-8px_30px_rgba(15,23,42,0.12)]"
      >
        <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
          {/* Price & Stock */}
          <div className="shrink-0">
            <span className="text-[10px] text-slate-500 font-bold block leading-none">Total Price</span>
            <strong className="text-base font-black text-slate-950">
              ৳{(effectivePrice * quantity).toLocaleString('en-BD')}
            </strong>
          </div>

          {/* CTAs */}
          <div className="flex items-center gap-2 flex-1 justify-end">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="px-3 py-2.5 rounded-xl border border-brand-500 text-brand-600 bg-brand-50/80 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 disabled:opacity-40"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>{addedNotice ? 'Added!' : 'Add'}</span>
            </button>

            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className="btn-primary py-2.5 px-4 text-xs font-bold flex items-center justify-center gap-1 shadow-md shadow-brand-500/25 active:scale-95 disabled:opacity-40 flex-1 max-w-[150px]"
            >
              <Zap className="w-3.5 h-3.5 fill-white shrink-0" />
              <span>{isOutOfStock ? 'Sold Out' : 'Buy Now'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
