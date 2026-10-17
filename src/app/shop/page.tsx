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
  Eye,
  ChevronDown,
  X
} from 'lucide-react';
import { useCart } from '@/lib/context/CartContext';
import { fastFetch } from '@/lib/fastFetch';
import ProductCard from '@/components/common/ProductCard';

export default function ShopPage() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = sessionStorage.getItem('_ne_fast_/api/v1/products?limit=60&');
        if (raw) return JSON.parse(raw).data?.products || [];
      } catch {}
    }
    return [];
  });
  const [categories, setCategories] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = sessionStorage.getItem('_ne_fast_/api/v1/products?limit=60&');
        if (raw) return JSON.parse(raw).data?.categories || [];
      } catch {}
    }
    return [];
  });
  const [brands, setBrands] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = sessionStorage.getItem('_ne_fast_/api/v1/products?limit=60&');
        if (raw) return JSON.parse(raw).data?.brands || [];
      } catch {}
    }
    return [];
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedCondition, setSelectedCondition] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [addedNotice, setAddedNotice] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

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
            Enterprise laptops, Dahua surveillance kits, Wi-Fi 6 networking, and Pure Sine Wave IPS backup systems &mdash; backed by official digital warranties.
          </p>
        </div>
      </div>

      {/* Search and Filters Toolbar */}
      <div className="space-y-4">
        <div className="relative bg-white p-2 sm:p-2.5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-2">
          {/* Filter System beside search icon */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                isFilterOpen || selectedCategory !== 'all' || selectedCondition !== 'all'
                  ? 'bg-brand-50 text-brand-700 border-brand-300 shadow-xs ring-2 ring-brand-500/10'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
              aria-label="Filter products"
              aria-expanded={isFilterOpen}
            >
              <Filter className="w-3.5 h-3.5 text-brand-600" />
              <span>Filters</span>
              {(selectedCategory !== 'all' || selectedCondition !== 'all') && (
                <span className="w-2 h-2 rounded-full bg-brand-500 ring-2 ring-white" />
              )}
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Filter Dropdown/Popover matching user's exact screenshot */}
            {isFilterOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsFilterOpen(false)}
                />
                <div className="absolute top-full left-0 mt-2.5 w-80 sm:w-88 max-w-[92vw] bg-white rounded-3xl p-5 shadow-2xl border border-slate-200/90 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
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
                    <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
                      <button
                        onClick={() => {
                          setSelectedCategory('all');
                          setIsFilterOpen(false);
                        }}
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
                          onClick={() => {
                            setSelectedCategory(c.slug);
                            setIsFilterOpen(false);
                          }}
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
                        onClick={() => {
                          setSelectedCondition('all');
                        }}
                        className={`py-1.5 px-2 rounded-xl text-center font-medium border ${
                          selectedCondition === 'all'
                            ? 'border-brand-500 bg-brand-50 text-brand-700 font-bold'
                            : 'border-slate-200 text-slate-600'
                        }`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => {
                          setSelectedCondition('NEW');
                        }}
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
              </>
            )}
          </div>

          <div className="h-6 w-px bg-slate-200" />

          {/* Search Icon & Search input */}
          <div className="flex-1 flex items-center gap-2 pl-1 min-w-0">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search by product name, brand, or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchProducts()}
              className="w-full text-xs sm:text-sm bg-transparent border-none focus:outline-hidden text-slate-800 placeholder:text-slate-400"
            />
            {searchQuery && (
              <button 
                onClick={() => { setSearchQuery(''); }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button onClick={fetchProducts} className="btn-primary text-xs py-2 px-4 shrink-0 shadow-xs">
            Search
          </button>
        </div>

        {/* Quick Category Pills & Active Filter Tags */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
            }`}
          >
            All Products
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.slug)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                selectedCategory === c.slug
                  ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                  : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
              }`}
            >
              {c.name}
            </button>
          ))}
          {(selectedCategory !== 'all' || selectedCondition !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedBrand('all');
                setSelectedCondition('all');
                setSearchQuery('');
              }}
              className="px-3 py-1.5 rounded-full text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 whitespace-nowrap flex items-center gap-1 transition-colors"
            >
              <X className="w-3 h-3" />
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Product Grid - Full Width */}
      <div className="space-y-6">
        {loading && products.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
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
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={(p, e) => handleAddToCart(p, e)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
