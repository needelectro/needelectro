'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Wrench, Shield, ArrowRight, UserCheck, CheckCircle2, Zap } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';

function TechnicianLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/technician/dashboard';

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

    const result = await login(identifier, password, 'TECHNICIAN');
    setLoading(false);

    if (result.success) {
      router.push(result.redirectUrl || redirectTarget);
    } else {
      setError(result.error || 'Technician authentication failed. Please verify your phone/email and password.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/40 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient lighting for technician theme */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[650px] h-[360px] bg-amber-500/15 blur-[150px] pointer-events-none rounded-full" />
      <div className="absolute -bottom-10 left-10 w-[420px] h-[300px] bg-brand-500/10 blur-[130px] pointer-events-none rounded-full" />

      {/* Switcher Banner */}
      <div className="max-w-md w-full mx-auto px-4 mb-4">
        <div className="flex items-center justify-between p-2.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl text-xs text-slate-300 shadow-lg">
          <span className="flex items-center gap-1.5 font-bold text-amber-400">
            <Wrench className="w-4 h-4" />
            Technician Workspace Portal
          </span>
          <Link
            href="/customer/login"
            className="flex items-center gap-1 text-slate-300 hover:text-white font-semibold transition px-2 py-1 rounded-xl hover:bg-white/5"
          >
            <UserCheck className="w-3.5 h-3.5 text-brand-400" />
            Customer Login &rarr;
          </Link>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Header */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-block group hover:scale-105 transition-transform" title="Return to Home">
            <div className="px-5 py-3 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl shadow-amber-500/20 inline-flex items-center justify-center">
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
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-bold mb-2">
              <Wrench className="w-3 h-3 text-amber-400" />
              Verified Technician Workspace
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Technician Sign In</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Access assigned service calls, dispatch queue, and wallet earnings
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
              <label className="text-xs font-bold text-slate-200">Registered Phone or Email</label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. 017XXXXXXXX or tech@email.com"
                className="w-full px-4 py-3 text-sm bg-white/5 border border-white/15 rounded-2xl text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white/10 transition"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200">Password</label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition"
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
                  className="w-full px-4 py-3 pr-11 text-sm bg-white/5 border border-white/15 rounded-2xl text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white/10 transition"
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
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-sm shadow-lg shadow-amber-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Verifying credentials...</span>
              ) : (
                <>
                  <Wrench className="w-4 h-4" />
                  Sign In to Technician Workspace
                </>
              )}
            </button>
          </form>

          {/* Registration link */}
          <div className="text-center pt-2 border-t border-white/10">
            <p className="text-xs text-slate-400">
              Not a registered technician yet?{' '}
              <Link href="/technician/register" className="text-amber-400 font-bold hover:text-amber-300 transition">
                Apply &amp; Register for Jobs &rarr;
              </Link>
            </p>
          </div>
        </div>

        {/* Technician Guarantee Badges */}
        <div className="mt-6 flex items-center justify-center gap-6 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> Guaranteed Job Payouts
          </span>
          <span className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-brand-400" /> Verified Trade Network
          </span>
        </div>
      </div>
    </div>
  );
}

export default function TechnicianLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading Technician Workspace...</div>}>
      <TechnicianLoginForm />
    </Suspense>
  );
}
