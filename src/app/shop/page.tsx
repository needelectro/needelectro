'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Check, 
  Star, 
  ShoppingCart, 
  ShieldCheck, 
  Truck, 
  ChevronRight,
  Eye
} from 'lucide-react';
import { useCart } from '@/lib/context/CartContext';
import { fastFetch } from '@/lib/fastFetch';

export default function ShopPage() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedCondition, setSelectedCondition] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [addedNotice, setAddedNotice] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, selectedBrand, selectedCondition]);

  const fetchProducts = async () => {
    try {
      if (products.length === 0) setLoading(true);
      let url = '/api/v1/products?limit=60&';
      if (selectedCategory !== 'all') url += `category=${selectedCategory}&`;
      if (selectedBrand !== 'all') url += `brand=${selectedBrand}&`;
      if (selectedCondition !== 'all') url += `condition=${selectedCondition}&`;
      if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;

      const data = await fastFetch(url, { ttlMs: 60000 });
      if (data && data.products) {
        setProducts(data.products);
        if (data.categories) setCategories(data.categories);
        if (data.brands) setBrands(data.brands);
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setAddedNotice(product.name);
    setTimeout(() => setAddedNotice(null), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast Notification */}
      {addedNotice && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs border border-slate-700 animate-in slide-in-from-top-4">
          <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center">
            <Check className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="font-bold">Added to Cart!</p>
            <p className="text-[11px] text-slate-400 line-clamp-1">{addedNotice}</p>
          </div>
          <Link href="/cart" className="ml-2 btn-primary text-[10px] py-1 px-2.5">
            View Cart
          </Link>
        </div>
      )}

      {/* Header Banner - Glass Dark */}
      <div className="glass-card-dark text-white rounded-3xl p-6 sm:p-10 md:p-12 relative overflow-hidden shadow-2xl">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-[radial-gradient(circle,rgba(8,127,229,0.25)_0%,rgba(8,127,229,0)_70%)] pointer-events-none rounded-full" />
        <div className="max-w-2xl relative z-10 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
            NEED ELECTRO Marketplace
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Genuine Technology &amp; Electrical Hardware
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Enterprise laptops, Dahua surveillance kits, Wi-Fi 6 networking, and Pure Sine Wave IPS backup systems — backed by official digital warranties.
          </p>
        </div>
      </div>

      {/* Filter and Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar Filters - Frosted Glass Container */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-5 rounded-3xl shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/60">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Filter className="w-4 h-4 text-brand-500" />
                Filters
              </h3>
              {(selectedCategory !== 'all' || selectedBrand !== 'all' || selectedCondition !== 'all') && (
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedBrand('all');
                    setSelectedCondition('all');
                  }}
                  className="text-[11px] text-brand-600 font-bold hover:underline"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Categories */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Category
              </label>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-brand-50 text-brand-700 font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.slug)}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                      selectedCategory === c.slug
                        ? 'bg-brand-50 text-brand-700 font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Condition */}
            <div className="space-y-2 pt-3 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Condition
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => setSelectedCondition('all')}
                  className={`py-1.5 px-2 rounded-xl text-center font-medium border ${
                    selectedCondition === 'all'
                      ? 'border-brand-500 bg-brand-50 text-brand-700 font-bold'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setSelectedCondition('NEW')}
                  className={`py-1.5 px-2 rounded-xl text-center font-medium border ${
                    selectedCondition === 'NEW'
                      ? 'border-brand-500 bg-brand-50 text-brand-700 font-bold'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  Brand New
                </button>
              </div>
            </div>

            {/* Warranty & Delivery Assurance */}
            <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-500 space-y-2">
              <div className="flex items-center gap-2 text-slate-700 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>12 - 24 Mo Warranty</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 font-semibold">
                <Truck className="w-4 h-4 text-brand-600" />
                <span>24-48h Moulvibazar Delivery</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Product Grid */}
        <div className="lg:col-span-3 space-y-6">
          {/* Search bar inside products view */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
            <Search className="w-4 h-4 text-slate-400 ml-2" />
            <input
              type="text"
              placeholder="Search by product name, brand, or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchProducts()}
              className="flex-1 text-xs bg-transparent border-none focus:outline-hidden"
            />
            <button onClick={fetchProducts} className="btn-primary text-xs py-1.5 px-4">
              Search
            </button>
          </div>

          {/* Product Items */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="card-premium h-80 bg-slate-100 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900">No Products Found</h3>
              <p className="text-xs text-slate-500 mt-1">Try clearing filters or search terms.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => {
                const img = product.images?.[0] || 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800';
                return (
                  <div
                    key={product.id}
                    className="card-premium overflow-hidden group flex flex-col justify-between"
                  >
                    <div>
                      {/* Product Image */}
                      <Link href={`/product/${product.slug}`} className="block relative h-48 w-full bg-white p-4 overflow-hidden">
                        <img
                          src={img}
                          alt={product.name}
                          loading="lazy"
                          decoding="async"
                          className="max-h-full max-w-full object-contain mx-auto group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute top-3 left-3 bg-slate-100 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
                          {product.category?.name || 'Tech'}
                        </span>
                        <span className="absolute top-3 right-3 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
                          {product.warrantyPeriodMonths}M Warranty
                        </span>
                      </Link>

                      {/* Content */}
                      <div className="p-4 border-t border-slate-100 space-y-2">
                        <div className="text-[10px] text-slate-400 font-mono uppercase">
                          SKU: {product.sku}
                        </div>
                        <Link href={`/product/${product.slug}`} className="block">
                          <h4 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-brand-600 transition-colors">
                            {product.name}
                          </h4>
                        </Link>
                        <p className="text-xs text-slate-500 line-clamp-2">
                          {product.shortDescription}
                        </p>

                        <div className="pt-2 flex items-baseline gap-2">
                          <span className="text-base font-extrabold text-slate-950">
                            ৳{(product.discountPrice ?? product.price).toLocaleString()}
                          </span>
                          {product.discountPrice && (
                            <span className="text-xs text-slate-400 line-through">
                              ৳{product.price.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bottom CTA Actions */}
                    <div className="p-4 pt-0 grid grid-cols-2 gap-2">
                      <Link
                        href={`/product/${product.slug}`}
                        className="btn-secondary text-xs py-2 text-center"
                      >
                        Details
                      </Link>
                      <button
                        onClick={(e) => handleAddToCart(product, e)}
                        className="btn-primary text-xs py-2 flex items-center justify-center gap-1.5"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        Add to Cart
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
