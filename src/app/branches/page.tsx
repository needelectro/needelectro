'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  ShieldCheck, 
  ArrowRight, 
  Wrench, 
  Radio, 
  CheckCircle2, 
  Search,
  Navigation,
  Globe2
} from 'lucide-react';

export default function BranchesPage() {
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchDistrict, setSearchDistrict] = useState('');

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/branches');
      const data = await res.json();
      if (data.branches) {
        setBranches(data.branches);
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  const filteredBranches = branches.filter((b) => 
    b.name.toLowerCase().includes(searchDistrict.toLowerCase()) ||
    b.district.toLowerCase().includes(searchDistrict.toLowerCase()) ||
    b.coverageAreas.toLowerCase().includes(searchDistrict.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* 1. HERO BANNER - GLASS DARK */}
      <div className="glass-card-dark text-white rounded-3xl p-6 sm:p-10 md:p-14 relative overflow-hidden shadow-2xl border border-white/10">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-brand-500/25 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-sky-400/20 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-3xl relative z-10 space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-brand-300 text-xs font-semibold">
            <Globe2 className="w-4 h-4 text-brand-400" />
            NEED ELECTRO Nationwide Service Network &bull; Amdads Group
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Our Physical Branches, Diagnostic Labs &amp; Regional Hubs
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            From our central operations in Moulvibazar to regional dispatch hubs across Sylhet Division and nationwide courier coverage. Every authorized hub coordinates diagnostic equipment, genuine components, and certified technical response units.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 w-full sm:w-auto">
            <Link href="/booking" className="btn-primary text-xs py-2.5 px-5 flex items-center justify-center gap-2 shadow-glass-glow w-full sm:w-auto">
              <Wrench className="w-3.5 h-3.5" />
              Book Certified Service Technician
            </Link>
            <Link href="/contact" className="btn-secondary text-xs py-2.5 px-5 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border-white/20 w-full sm:w-auto">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              Contact 24/7 Central Hotline
            </Link>
          </div>
        </div>
      </div>

      {/* 2. COVERAGE HIGHLIGHTS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-3xl border border-white/80 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-500/10 text-brand-600 flex items-center justify-center">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">30-60 Min Rapid Response</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Local branch dispatch units guarantee rapid on-site arrival for emergency electrical outages and surveillance failures across Kusumbag and core town areas.
          </p>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-white/80 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Official Diagnostic Lab</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every branch houses calibrated multimeters, thermal cameras, DC power analyzers, and micro-soldering stations for component-level verification.
          </p>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-white/80 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-600 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Unified ERP Network</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            All regional branches sync directly with NEED ELECTRO central ERP for synchronized warranty serial lookup, service histories, and genuine inventory.
          </p>
        </div>
      </div>

      {/* 3. BRANCH DIRECTORY */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600">Physical Centers</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Branch Locations &amp; Service Zones</h2>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search branch or coverage area..."
              value={searchDistrict}
              onChange={(e) => setSearchDistrict(e.target.value)}
              className="w-full text-xs pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200/80 bg-white/80 focus:outline-brand-500 shadow-2xs"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card h-80 animate-pulse rounded-3xl" />
            ))}
          </div>
        ) : filteredBranches.length === 0 ? (
          <div className="text-center py-16 glass-card rounded-3xl">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">No Branch Found</h3>
            <p className="text-xs text-slate-500 mt-1">Try another search term or call our central hotline at 01733 983752.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBranches.map((branch) => (
              <div
                key={branch.id}
                className={`card-premium p-6 rounded-3xl flex flex-col justify-between group space-y-6 relative overflow-hidden ${
                  branch.isHeadquarters ? 'border-brand-500/40 ring-1 ring-brand-500/20' : ''
                }`}
              >
                {branch.isHeadquarters && (
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-brand-600 to-brand-500 text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-bl-xl shadow-xs">
                    Main Headquarters
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200/60">
                      {branch.district} &bull; {branch.upazila}
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 group-hover:text-brand-600 transition-colors">
                      {branch.name}
                    </h3>
                  </div>

                  {/* Address */}
                  <div className="flex items-start gap-2.5 text-xs text-slate-600">
                    <MapPin className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                    <span>{branch.address}</span>
                  </div>

                  {/* Contacts */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="font-semibold">{branch.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                      <Mail className="w-3.5 h-3.5 text-sky-600" />
                      <span>{branch.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>{branch.workingHours}</span>
                    </div>
                  </div>

                  {/* Coverage Areas */}
                  <div className="p-3 rounded-2xl bg-slate-50/70 border border-slate-100 text-xs space-y-1">
                    <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                      <Navigation className="w-3 h-3 text-brand-600" />
                      Coverage Region:
                    </span>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {branch.coverageAreas}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 flex items-center gap-2">
                  <Link
                    href={`/booking?branch=${branch.slug}`}
                    className="btn-primary w-full text-xs py-2.5 text-center flex items-center justify-center gap-2 shadow-glass-glow"
                  >
                    Request Branch Technician
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
