'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { UserPlus, Wrench, ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

export default function RegisterPortalPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-brand-950 flex flex-col justify-center py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[380px] bg-brand-500/15 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute -bottom-10 right-10 w-[450px] h-[300px] bg-amber-500/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-xl w-full mx-auto space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-block group hover:scale-105 transition-transform" title="Return to Home">
            <div className="px-5 py-3 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl shadow-brand-500/20 inline-flex items-center justify-center">
              <Image
                src="/brand/needelectro-logo-white.png"
                alt="NEED ELECTRO"
                width={200}
                height={100}
                className="h-10 sm:h-12 w-auto object-contain filter drop-shadow"
                priority
              />
            </div>
          </Link>
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Create an Account</h1>
            <p className="text-sm text-slate-400 mt-1">
              Select your role to join the NEED ELECTRO ecosystem
            </p>
          </div>
        </div>

        {/* Portals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Customer */}
          <Link
            href="/customer/register"
            className="group p-6 rounded-3xl bg-white/10 hover:bg-white/15 border border-white/15 hover:border-brand-500/60 backdrop-blur-2xl transition-all duration-300 shadow-xl flex flex-col justify-between space-y-5"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-500/20 border border-brand-500/30 text-brand-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white group-hover:text-brand-300 transition-colors">
                  I Need Services / Products
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Book verified electricians, purchase CCTV/laptops, and track warranties.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-bold text-brand-400 group-hover:text-brand-300">
              <span>Customer Registration</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Technician */}
          <Link
            href="/technician/register"
            className="group p-6 rounded-3xl bg-white/10 hover:bg-white/15 border border-white/15 hover:border-amber-500/60 backdrop-blur-2xl transition-all duration-300 shadow-xl flex flex-col justify-between space-y-5"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Wrench className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white group-hover:text-amber-300 transition-colors">
                  I Want to Work as a Technician
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Apply for verified field jobs, steady dispatches, and fair payouts across Sylhet.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-bold text-amber-400 group-hover:text-amber-300">
              <span>Technician Onboarding</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        {/* Existing account */}
        <div className="text-center p-4 bg-white/5 border border-white/10 rounded-2xl text-xs text-slate-400 space-y-1">
          <p>
            Already have an account?{' '}
            <Link href="/customer/login" className="text-brand-400 font-bold hover:underline">
              Customer Sign In
            </Link>{' '}
            or{' '}
            <Link href="/technician/login" className="text-amber-400 font-bold hover:underline">
              Technician Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
