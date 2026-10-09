'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  ShoppingBag, 
  ShoppingCart, 
  ShieldCheck, 
  Truck, 
  Check, 
  Star, 
  ArrowLeft, 
  ChevronRight,
  Zap,
  PackageCheck,
  Heart
} from 'lucide-react';
import { useCart } from '@/lib/context/CartContext';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const { addToCart } = useCart();

  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);

  useEffect(() => {
    if (slug) {
      fetch(`/api/v1/products/${slug}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.product) {
            setProduct(data.product);
            if (data.product.images?.length) {
              setSelectedImage(data.product.images[0]);
            }
          }
        })
        .finally(() => setLoading(false));
    }
  }, [slug]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 3000);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product, quantity);
    router.push('/checkout');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="h-96 rounded-3xl bg-slate-100 animate-pulse" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold">Product Not Found</h2>
        <Link href="/shop" className="btn-primary mt-4 text-xs">
          Browse Shop
        </Link>
      </div>
    );
  }

  const effectivePrice = product.discountPrice ?? product.price;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-brand-600">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/shop" className="hover:text-brand-600">Shop</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 font-semibold line-clamp-1">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xs">
        {/* Left: Product Images Gallery */}
        <div className="space-y-4">
          <div className="relative h-80 sm:h-96 w-full bg-slate-50 rounded-2xl p-6 flex items-center justify-center border border-slate-100 overflow-hidden">
            <img
              src={selectedImage || product.images?.[0] || 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800'}
              alt={product.name}
              className="max-h-full max-w-full object-contain transition-all duration-300"
            />
            {product.discountPrice && (
              <span className="absolute top-4 left-4 bg-red-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
                Special Offer
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images?.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-16 h-16 rounded-xl border p-1 bg-slate-50 shrink-0 transition-all ${
                    selectedImage === img ? 'border-brand-500 ring-2 ring-brand-500/20' : 'border-slate-200 opacity-70'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Purchase Form */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-brand-50 text-brand-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                {product.brand?.name || 'GENUINE'}
              </span>
              <span className="text-slate-400 text-xs">&bull;</span>
              <span className="text-[11px] text-slate-500 font-mono">SKU: {product.sku}</span>
              <span className="text-slate-400 text-xs">&bull;</span>
              <span className="text-[11px] font-bold text-emerald-600">
                Condition: {product.condition}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 leading-tight">
              {product.name}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed">
              {product.shortDescription}
            </p>
          </div>

          {/* Pricing */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-baseline gap-3">
            <span className="text-3xl font-black text-slate-950">
              ৳{effectivePrice.toLocaleString()}
            </span>
            {product.discountPrice && (
              <span className="text-sm text-slate-400 line-through">
                ৳{product.price.toLocaleString()}
              </span>
            )}
            <span className="ml-auto text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-full">
              In Stock ({product.stock} units)
            </span>
          </div>

          {/* Quantity and Action Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-700">Quantity:</span>
              <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-1 text-sm font-bold text-slate-600 hover:text-slate-900"
                >
                  -
                </button>
                <span className="px-3 py-1 text-xs font-bold text-slate-900">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="px-3 py-1 text-sm font-bold text-slate-600 hover:text-slate-900"
                >
                  +
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                className="btn-secondary py-3 text-xs flex items-center justify-center gap-2 border-brand-500 text-brand-600 hover:bg-brand-50"
              >
                <ShoppingCart className="w-4 h-4" />
                {addedNotice ? 'Added to Cart ✓' : 'Add to Cart'}
              </button>

              <button
                onClick={handleBuyNow}
                className="btn-primary py-3 text-xs flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 fill-white" />
                Buy Now (Quick Checkout)
              </button>
            </div>
          </div>

          {/* Value Props Ribbon */}
          <div className="pt-4 border-t border-slate-100 space-y-2.5 text-xs text-slate-600">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>{product.warrantyPeriodMonths} Months Official Warranty</strong> tracked via account &amp; serial number.
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-brand-600 shrink-0" />
              <span>
                <strong>Fast Delivery:</strong> {product.deliveryInfo || '24-48 hours in Moulvibazar Sadar.'}
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <PackageCheck className="w-4 h-4 text-purple-600 shrink-0" />
              <span>Tested &amp; Quality Inspected at NEED ELECTRO Technology Center.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications & Description */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xs space-y-8">
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-3">Product Overview</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
            {product.description}
          </p>
        </div>

        {product.specifications && Object.keys(product.specifications).length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4">Technical Specifications</h3>
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
    </div>
  );
}
