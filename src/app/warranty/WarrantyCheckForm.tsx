'use client';

import React, { useState } from 'react';
import { Search, Shield, CheckCircle2, AlertCircle, Clock, Loader2 } from 'lucide-react';

export default function WarrantyCheckForm() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);
    setNotFound(false);
    try {
      const res = await fetch(`/api/v1/warranty?serial=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      if (res.ok && data.warranty) {
        setResult(data.warranty);
      } else {
        setNotFound(true);
      }
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const daysRemaining = result
    ? Math.ceil((new Date(result.warrantyEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="space-y-5">
      <form onSubmit={handleSearch} className="glass-card rounded-3xl p-6 sm:p-7 space-y-3.5 shadow-xl border border-white/90">
        <label className="text-xs font-black text-slate-800 block">
          Serial Number or Invoice Number
        </label>
        <div className="flex gap-2.5">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. HPE840G8-BD-99214 or INV-NE-2025-0089"
            className="flex-1 text-xs p-3 glass-input shadow-inner font-mono"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="btn-primary text-xs px-5 py-3 shrink-0"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-[10px] text-slate-500">
          Find your serial number on the product label, box, or your NEED ELECTRO invoice.
        </p>
      </form>

      {/* Result Card - Frosted Glass Container */}
      {result && (
        <div className={`rounded-3xl border p-6 space-y-4 backdrop-blur-2xl shadow-xl ${
          result.status === 'ACTIVE' && daysRemaining > 0
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950'
            : 'bg-amber-500/10 border-amber-500/30 text-amber-950'
        }`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              {result.status === 'ACTIVE' && daysRemaining > 0 ? (
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-6 h-6 text-amber-600" />
                </div>
              )}
              <div>
                <p className="font-black text-slate-900 text-sm">
                  {result.status === 'ACTIVE' && daysRemaining > 0 ? '✅ Warranty Active' : '⚠️ Warranty Expired'}
                </p>
                <p className="text-xs text-slate-600 mt-0.5">{result.product?.name || 'Registered Device'}</p>
              </div>
            </div>
            <span className={`text-[10px] font-black px-3 py-1 rounded-full shrink-0 backdrop-blur-md border ${
              result.status === 'ACTIVE' 
                ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-700' 
                : 'bg-amber-500/20 border-amber-500/30 text-amber-700'
            }`}>
              {result.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-3.5 border border-white/80 shadow-2xs space-y-0.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Serial Number</p>
              <p className="font-black text-slate-800 font-mono">{result.serialNumber}</p>
            </div>
            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-3.5 border border-white/80 shadow-2xs space-y-0.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Days Remaining</p>
              <p className={`font-black text-lg ${daysRemaining > 30 ? 'text-emerald-700' : daysRemaining > 0 ? 'text-amber-700' : 'text-red-600'}`}>
                {daysRemaining > 0 ? `${daysRemaining}` : 'Expired'}
              </p>
            </div>
            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-3.5 border border-white/80 shadow-2xs space-y-0.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Warranty Start</p>
              <p className="font-bold text-slate-800">{new Date(result.warrantyStart).toLocaleDateString('en-BD', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-3.5 border border-white/80 shadow-2xs space-y-0.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Warranty End</p>
              <p className="font-bold text-slate-800">{new Date(result.warrantyEnd).toLocaleDateString('en-BD', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>

          {result.claims?.length > 0 && (
            <div className="pt-2">
              <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Claim History</p>
              {result.claims.map((claim: any) => (
                <div key={claim.id} className="flex items-center gap-2 text-xs text-slate-600 py-1.5 border-b border-white/40 last:border-0">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{claim.description}</span>
                  <span className="ml-auto font-bold text-slate-500">{new Date(claim.createdAt).toLocaleDateString('en-BD')}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {notFound && (
        <div className="bg-red-500/10 border border-red-500/30 backdrop-blur-xl rounded-3xl p-6 text-center space-y-2 shadow-sm">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
          <p className="font-black text-slate-900 text-sm">No Warranty Record Found</p>
          <p className="text-xs text-slate-600">
            No warranty record was found for <strong className="font-mono">{query}</strong>. 
            Please check the serial number or call <strong>01733-983752</strong> for assistance.
          </p>
        </div>
      )}
    </div>
  );
}
