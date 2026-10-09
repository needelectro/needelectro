'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, 
  Trash2, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  Tag, 
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { useCart } from '@/lib/context/CartContext';

export default function CartPage() {
  const {
    items,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    discount,
    deliveryCharge,
    total,
    couponCode,
    applyCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ text: string; error?: boolean } | null>(null);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput) return;
    const ok = applyCoupon(couponInput);
    if (ok) {
      setCouponMessage({ text: 'Coupon applied successfully!' });
    } else {
      setCouponMessage({ text: 'Invalid coupon code. Try NEEDELECTRO10', error: true });
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Your Cart is Empty</h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
          Explore our range of tested laptops, CCTV kits, routers, and electrical components.
        </p>
        <div className="pt-2">
          <Link href="/shop" className="btn-primary text-xs py-3 px-6">
            Shop Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-brand-600">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/shop" className="hover:text-brand-600">Shop</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 font-semibold">Shopping Cart</span>
      </nav>

      <h1 className="text-2xl sm:text-3xl font-black text-slate-950">
        Shopping Cart ({items.length} {items.length === 1 ? 'item' : 'items'})
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 divide-y divide-slate-100 shadow-xs overflow-hidden">
            {items.map((item) => {
              const price = item.product.discountPrice ?? item.product.price;
              const img = item.product.images?.[0] || 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800';
              return (
                <div key={item.product.id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <img
                      src={img}
                      alt={item.product.name}
                      className="w-20 h-20 object-contain rounded-xl bg-slate-50 p-2 shrink-0 border border-slate-100"
                    />
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono uppercase">
                        {item.product.sku}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm line-clamp-2">
                        {item.product.name}
                      </h4>
                      <p className="text-xs text-brand-600 font-extrabold mt-1">
                        ৳{price.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                    {/* Quantity Selector */}
                    <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="px-2.5 py-1 text-xs font-bold text-slate-600 hover:text-slate-900"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 text-xs font-bold text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="px-2.5 py-1 text-xs font-bold text-slate-600 hover:text-slate-900"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-extrabold text-slate-950 block">
                        ৳{(price * item.quantity).toLocaleString()}
                      </span>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-slate-400 hover:text-red-600 p-1 rounded-lg transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center px-2">
            <Link href="/shop" className="text-xs text-brand-600 font-semibold hover:underline">
              &larr; Continue Shopping
            </Link>
            <button
              onClick={clearCart}
              className="text-xs text-slate-400 hover:text-red-600 transition"
            >
              Clear Cart
            </button>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-6">
            <h3 className="font-extrabold text-slate-900 text-lg pb-3 border-b border-slate-100">
              Order Summary
            </h3>

            {/* Promo Code Form */}
            <form onSubmit={handleApply} className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Promo Code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. NEEDELECTRO10"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="flex-1 text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl uppercase"
                />
                <button type="submit" className="btn-secondary text-xs px-3 py-2">
                  Apply
                </button>
              </div>
              {couponMessage && (
                <p className={`text-[11px] font-semibold ${couponMessage.error ? 'text-red-500' : 'text-emerald-600'}`}>
                  {couponMessage.text}
                </p>
              )}
            </form>

            {/* Calculations */}
            <div className="space-y-3 text-xs border-t border-slate-100 pt-4">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900">৳{subtotal.toLocaleString()}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon Discount ({couponCode})</span>
                  <span>-৳{discount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Delivery Charge (Moulvibazar)</span>
                <span className="font-bold text-slate-900">
                  {deliveryCharge === 0 ? 'FREE' : `৳${deliveryCharge}`}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline text-slate-900">
                <span className="font-bold text-sm">Estimated Total</span>
                <span className="text-xl font-black text-brand-600">৳{total.toLocaleString()}</span>
              </div>
            </div>

            {/* Checkout CTA */}
            <Link
              href="/checkout"
              className="btn-primary w-full py-3 text-xs flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="pt-2 text-[11px] text-slate-400 space-y-2 text-center">
              <p className="flex items-center justify-center gap-1.5 text-slate-600">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Digital Warranty Registered on Purchase
              </p>
              <p>Supports bKash, Nagad, Card &amp; Cash on Delivery</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
