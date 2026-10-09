'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, Package, Wrench, ArrowRight, Zap, RefreshCw } from 'lucide-react';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }
    const fetchResults = async () => {
      setLoading(true);
      try {
        const [prodRes, servRes] = await Promise.all([
          fetch(`/api/v1/products?search=${encodeURIComponent(query)}`),
          fetch(`/api/v1/services?search=${encodeURIComponent(query)}`),
        ]);
        if (prodRes.ok) {
          const d = await prodRes.json();
          setProducts(d.products || []);
        }
        if (servRes.ok) {
          const d = await servRes.json();
          setServices(d.services || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [query]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-2">
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Search className="w-6 h-6 text-brand-500" /> Search Results
        </h1>
        <p className="text-sm text-slate-500">
          Showing results for <span className="font-bold text-brand-600">"{query}"</span>
        </p>
      </div>

      {loading ? (
        <div className="p-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-brand-500" />
          <p className="text-sm">Searching across products and services...</p>
        </div>
      ) : products.length === 0 && services.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-slate-200 space-y-4">
          <p className="text-base font-bold text-slate-700">No matching products or services found.</p>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try checking spelling or exploring our broad categories for electrical appliances, wiring, and repairs.
          </p>
          <div className="flex justify-center gap-4 pt-2">
            <Link href="/services" className="px-5 py-2.5 rounded-xl bg-brand-500 text-white font-bold text-xs">
              Explore Services
            </Link>
            <Link href="/shop" className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs">
              Browse Shop
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Services Section */}
          {services.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-brand-500" /> Electrical Services ({services.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map((s) => (
                  <div key={s.id} className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between hover:shadow-md transition">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
                          {s.category?.name || 'Service'}
                        </span>
                        {s.isEmergencyService && (
                          <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Zap className="w-3 h-3" /> 24/7 Rapid
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm">{s.name}</h3>
                      <p className="text-xs text-slate-500 line-clamp-2">{s.shortDescription}</p>
                    </div>
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-4">
                      <span className="text-sm font-black text-slate-900">৳{s.basePrice?.toLocaleString()}</span>
                      <Link
                        href={`/services/${s.slug}`}
                        className="text-xs font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
                      >
                        Book Now <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Products Section */}
          {products.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-brand-500" /> Products & Hardware ({products.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {products.map((p) => (
                  <div key={p.id} className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col justify-between hover:shadow-md transition">
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        {p.category?.name || 'Hardware'}
                      </span>
                      <h3 className="font-bold text-slate-900 text-xs line-clamp-2">{p.name}</h3>
                      <p className="text-[11px] text-slate-500 line-clamp-2">{p.shortDescription}</p>
                    </div>
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-3">
                      <div>
                        <div className="text-xs font-black text-slate-900">৳{p.price?.toLocaleString()}</div>
                        {p.salePrice && <div className="text-[10px] text-emerald-600">৳{p.salePrice}</div>}
                      </div>
                      <Link
                        href={`/product/${p.slug}`}
                        className="px-3 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-[11px]"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
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
