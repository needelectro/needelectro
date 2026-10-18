'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Search, 
  Package, 
  Wrench, 
  ArrowRight, 
  Zap, 
  RefreshCw, 
  X, 
  Clock, 
  Sparkles,
  TrendingUp,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import ProductCard from '@/components/common/ProductCard';
import { fastFetch } from '@/lib/fastFetch';

const POPULAR_SUGGESTIONS = [
  'Laptops',
  'CCTV Camera',
  'Wi-Fi 6 Router',
  'Pure Sine Wave IPS',
  'House Wiring',
  'Circuit Breaker',
  'HP ProBook',
  'Dahua NVR',
  'PC Servicing',
  'Solar Inverter',
];

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<'all' | 'products' | 'services'>('all');
  const [products, setProducts] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const currentSearchRef = useRef<string>('');

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ne_recent_searches');
      if (saved) {
        setRecentSearches(JSON.parse(saved).slice(0, 5));
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const saveRecentSearch = (term: string) => {
    if (!term.trim()) return;
    try {
      const updated = [term.trim(), ...recentSearches.filter(s => s.toLowerCase() !== term.trim().toLowerCase())].slice(0, 6);
      setRecentSearches(updated);
      localStorage.setItem('ne_recent_searches', JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem('ne_recent_searches');
    } catch {}
  };

  // Trigger search on query change
  useEffect(() => {
    if (!query.trim()) {
      currentSearchRef.current = '';
      setProducts([]);
      setServices([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      fetchResults(query.trim());
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const fetchResults = async (searchTerm: string) => {
    const searchId = searchTerm.trim();
    currentSearchRef.current = searchId;
    setLoading(true);

    try {
      const [prodData, servData] = await Promise.all([
        fastFetch(`/api/v1/products?limit=40&search=${encodeURIComponent(searchId)}`, { ttlMs: 30000 }),
        fastFetch(`/api/v1/services?search=${encodeURIComponent(searchId)}`, { ttlMs: 30000 }),
      ]);

      // Guard against race conditions / outdated requests overwriting newer results
      if (currentSearchRef.current !== searchId) return;

      if (prodData?.products) {
        setProducts(prodData.products);
      }
      if (servData?.services) {
        setServices(servData.services);
      }
      saveRecentSearch(searchId);
    } catch (e) {
      if (currentSearchRef.current === searchId) {
        console.error('Search fetch error:', e);
      }
    } finally {
      if (currentSearchRef.current === searchId) {
        setLoading(false);
      }
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      fetchResults(query.trim());
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    router.push(`/search?q=${encodeURIComponent(suggestion)}`);
    fetchResults(suggestion);
  };

  const totalResults = products.length + services.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
      {/* Search Header Bar with Prominent Input */}
      <div className="bg-white p-5 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600">
            Marketplace Discovery
          </span>
          <h1 className="text-xl sm:text-3xl font-black text-slate-900 mt-0.5">
            Search Hardware &amp; Services
          </h1>
        </div>

        {/* Search Input Form */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <div className="relative flex items-center">
            <Search className="w-5 h-5 absolute left-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search laptops, CCTV cameras, pure sine wave IPS, electricians..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full text-xs sm:text-sm pl-11 pr-12 py-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500 shadow-inner"
              autoFocus
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-4 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>

        {/* Recent Searches */}
        {recentSearches.length > 0 && !query && (
          <div className="pt-2 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Recent Searches
              </span>
              <button
                onClick={clearRecentSearches}
                className="text-[11px] text-slate-400 hover:text-red-600 transition"
              >
                Clear all
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((item) => (
                <button
                  key={item}
                  onClick={() => handleSuggestionClick(item)}
                  className="text-xs font-medium bg-slate-100 hover:bg-brand-50 text-slate-700 hover:text-brand-600 px-3 py-1.5 rounded-xl border border-slate-200/60 transition"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Popular Trending Suggestions */}
        <div className="pt-2 space-y-2">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-brand-500" />
            Trending Searches
          </span>
          <div className="flex flex-wrap gap-2">
            {POPULAR_SUGGESTIONS.map((item) => (
              <button
                key={item}
                onClick={() => handleSuggestionClick(item)}
                className="text-xs font-medium bg-white hover:bg-brand-50 text-slate-700 hover:text-brand-600 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-brand-300 transition shadow-2xs"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Controls & Tabs */}
      {query && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
            <div>
              <p className="text-xs sm:text-sm text-slate-500">
                Found <strong className="text-slate-900">{totalResults}</strong> results for{' '}
                <span className="font-bold text-brand-600">&ldquo;{query}&rdquo;</span>
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl w-fit">
              <button
                onClick={() => setActiveTab('all')}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl transition ${
                  activeTab === 'all'
                    ? 'bg-white text-brand-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({totalResults})
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl transition ${
                  activeTab === 'products'
                    ? 'bg-white text-brand-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Products ({products.length})
              </button>
              <button
                onClick={() => setActiveTab('services')}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl transition ${
                  activeTab === 'services'
                    ? 'bg-white text-brand-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Services ({services.length})
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-brand-500" />
              <p className="text-xs sm:text-sm">Searching inventory and technical services...</p>
            </div>
          ) : totalResults === 0 ? (
            <div className="card-premium p-12 text-center rounded-3xl space-y-4">
              <Package className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">
                No matching results found for &ldquo;{query}&rdquo;
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Check for typos or try searching by brand (HP, Dahua, TP-Link), category (Laptops, CCTV, IPS), or service name.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <Link href="/shop" className="btn-primary text-xs py-2 px-5">
                  Browse Shop
                </Link>
                <Link href="/services" className="btn-secondary text-xs py-2 px-5">
                  Explore Services
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-10">
              {/* Services Results */}
              {(activeTab === 'all' || activeTab === 'services') && services.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-brand-600" />
                    Electrical &amp; Tech Services ({services.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {services.map((s) => (
                      <div
                        key={s.id}
                        className="card-premium p-4 sm:p-5 rounded-2xl flex flex-col justify-between hover:shadow-md transition"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full">
                              {s.category?.name || 'Service'}
                            </span>
                            {s.isEmergencyService && (
                              <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Zap className="w-2.5 h-2.5 fill-red-600" /> 24/7 Rapid
                              </span>
                            )}
                          </div>
                          <h3 className="font-bold text-slate-900 text-sm leading-snug">{s.name}</h3>
                          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{s.shortDescription}</p>
                        </div>
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-3">
                          <span className="text-xs sm:text-sm font-black text-slate-900">
                            ৳{s.basePrice?.toLocaleString('en-BD')}
                          </span>
                          <Link
                            href={`/services/${s.slug}`}
                            className="text-xs font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
                          >
                            Book Service <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Products Results */}
              {(activeTab === 'all' || activeTab === 'products') && products.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                    <Package className="w-4 h-4 text-brand-600" />
                    Hardware &amp; Equipment ({products.length})
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                    {products.map((p) => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Loading search...</div>}>
      <SearchContent />
    </Suspense>
  );
}
