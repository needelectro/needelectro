'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, LogIn, ArrowRight, ShieldCheck, UserCheck, Wrench, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';

function CustomerLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/customer/dashboard';

  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(identifier, password, 'CUSTOMER');
    setLoading(false);

    if (result.success) {
      router.push(result.redirectUrl || redirectTarget);
    } else {
      setError(result.error || 'Login failed. Please check your details and try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-brand-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-brand-500/15 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute -bottom-10 right-10 w-[400px] h-[300px] bg-sky-500/10 blur-[120px] pointer-events-none rounded-full" />

      {/* Portal Switcher Banner */}
      <div className="max-w-md w-full mx-auto px-4 mb-4">
        <div className="flex items-center justify-between p-2.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl text-xs text-slate-300 shadow-lg">
          <span className="flex items-center gap-1.5 font-medium text-slate-300">
            <UserCheck className="w-4 h-4 text-brand-400" />
            Customer Portal
          </span>
          <Link
            href="/technician/login"
            className="flex items-center gap-1 text-brand-400 hover:text-brand-300 font-bold transition px-2 py-1 rounded-xl hover:bg-white/5"
          >
            <Wrench className="w-3.5 h-3.5" />
            Are you a Technician? Sign In &rarr;
          </Link>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Logo and Greeting */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-block group hover:scale-105 transition-transform" title="Return to Home">
            <div className="px-5 py-3 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl shadow-brand-500/20 inline-flex items-center justify-center">
              <Image
                src="/brand/needelectro-logo-white.png"
                alt="NEED ELECTRO"
                width={190}
                height={95}
                className="h-10 sm:h-12 w-auto object-contain filter drop-shadow"
                priority
              />
            </div>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Customer Sign In</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Access your service bookings, store orders, and warranty tracking
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="mt-6 bg-white/10 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {error && (
            <div className="bg-red-500/15 border border-red-500/30 rounded-2xl px-4 py-3 text-xs text-red-300 font-medium animate-in fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-200">Mobile Phone or Email</label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. 01733-983752 or user@email.com"
                className="w-full px-4 py-3 text-sm bg-white/5 border border-white/15 rounded-2xl text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white/10 transition"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200">Password</label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs font-semibold text-brand-400 hover:text-brand-300 transition"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 pr-11 text-sm bg-white/5 border border-white/15 rounded-2xl text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white/10 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition p-1"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-bold text-sm shadow-lg shadow-brand-500/30 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In as Customer
                </>
              )}
            </button>
          </form>

          {/* Registration link */}
          <div className="text-center pt-2 border-t border-white/10">
            <p className="text-xs text-slate-400">
              New to NEED ELECTRO?{' '}
              <Link href="/customer/register" className="text-brand-400 font-bold hover:text-brand-300 transition">
                Create Customer Account &rarr;
              </Link>
            </p>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-6 flex items-center justify-center gap-6 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Verified Specialists
          </span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> 100% Genuine Parts
          </span>
        </div>
      </div>
    </div>
  );
}

export default function CustomerLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading Customer Sign In...</div>}>
      <CustomerLoginForm />
    </Suspense>
  );
}
