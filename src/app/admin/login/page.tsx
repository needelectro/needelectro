'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { ShieldCheck, ShieldAlert, Lock, Eye, EyeOff, LogIn, ArrowRight, PhoneCall } from 'lucide-react';

function AdminLoginForm() {
  const { user, login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/admin/dashboard';

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in as admin, redirect directly to dashboard
  useEffect(() => {
    if (user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN')) {
      router.replace(redirectTarget);
    }
  }, [user, redirectTarget, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(identifier.trim(), password, 'ADMIN');
      if (result.success) {
        router.replace(result.redirectUrl || redirectTarget);
      } else {
        setError(result.error || 'Authentication failed. Please verify credentials.');
      }
    } catch {
      setError('A network error occurred. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-brand-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Ambient background lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[650px] h-[380px] bg-red-500/10 blur-[150px] pointer-events-none rounded-full" />
      <div className="absolute -bottom-10 right-10 w-[450px] h-[350px] bg-brand-500/15 blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.05] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 relative z-10">
        {/* Logo and Console Tag */}
        <div className="text-center space-y-3">
          <div className="inline-block">
            <div className="px-6 py-3.5 rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl shadow-brand-500/20 inline-flex items-center justify-center">
              <Image
                src="/brand/needelectro-logo-white.png"
                alt="NEED ELECTRO"
                width={190}
                height={95}
                className="h-10 sm:h-12 w-auto object-contain filter drop-shadow"
                priority
              />
            </div>
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldAlert className="w-3.5 h-3.5" />
              Administrator Access Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Admin Sign In</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Authorized Management &amp; System Operations Console
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="mt-6 bg-white/10 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {error && (
            <div className="bg-red-500/15 border border-red-500/30 rounded-2xl px-4 py-3 text-xs text-red-300 font-medium flex items-center gap-2 animate-in fade-in">
              <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-200">Admin Email or Phone</label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="admin@needelectro.com or 01733983752"
                className="w-full px-4 py-3 text-sm bg-white/5 border border-white/15 rounded-2xl text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white/10 transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-200">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter administrator password"
                  className="w-full px-4 py-3 text-sm bg-white/5 border border-white/15 rounded-2xl text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white/10 transition pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-red-600 via-brand-600 to-brand-700 hover:from-red-500 hover:to-brand-600 text-white font-bold text-sm shadow-lg shadow-brand-500/30 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Authenticate &amp; Enter Console
                </>
              )}
            </button>
          </form>


        </div>

        {/* Security Notice */}
        <div className="mt-6 flex flex-col items-center justify-center gap-2 text-[11px] text-slate-400 text-center">
          <span className="flex items-center gap-1.5 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 256-bit Encrypted Session &bull; Authorized Personnel Only
          </span>
          <span className="flex items-center gap-1 text-slate-500">
            <PhoneCall className="w-3 h-3" /> Technical Support: 01733 983752
          </span>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-xs text-slate-400">Loading Admin Portal...</div>
      </div>
    }>
      <AdminLoginForm />
    </Suspense>
  );
}
