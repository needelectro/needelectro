'use client';

import React from 'react';
import Link from 'next/link';
import { WifiOff, RefreshCw, Home, PhoneCall } from 'lucide-react';

export default function OfflinePage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl shadow-slate-200/50 text-center space-y-6">
        <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-3xl mx-auto flex items-center justify-center border border-amber-200/60 shadow-inner">
          <WifiOff className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            You are currently offline
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Please check your internet connection. NEED ELECTRO saves cached views so you can browse saved content, but active booking or real-time orders require an internet connection.
          </p>
        </div>

        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60 text-xs text-slate-600 text-left space-y-2">
          <p className="font-semibold text-slate-800 flex items-center gap-1.5">
            <PhoneCall className="w-4 h-4 text-brand-500" />
            Emergency Electrical Line:
          </p>
          <p className="text-slate-700">
            For urgent electrical hazards or breakdowns in Moulvibazar, call our hotline directly:
          </p>
          <a
            href="tel:01733983752"
            className="block text-sm font-bold text-brand-600 hover:text-brand-700 underline"
          >
            01733 983752
          </a>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => window.location.reload()}
            className="flex-1 py-3 px-4 rounded-xl bg-brand-500 text-white font-semibold text-sm hover:bg-brand-600 transition flex items-center justify-center gap-2 shadow-md shadow-brand-500/20"
          >
            <RefreshCw className="w-4 h-4" />
            Retry Connection
          </button>
          <Link
            href="/"
            className="py-3 px-4 rounded-xl bg-slate-100 text-slate-700 font-semibold text-sm hover:bg-slate-200 transition flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
