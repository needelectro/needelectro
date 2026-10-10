'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, Phone } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate reset request
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-brand-950 to-slate-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center space-y-3 flex flex-col items-center">
          <Link href="/" className="inline-block group hover:scale-105 transition-transform" title="Back to Home">
            <div className="px-5 py-3 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl shadow-brand-500/25 flex items-center justify-center">
              <Image
                src="/brand/needelectro-logo-white.png"
                alt="NEED ELECTRO Logo"
                width={180}
                height={90}
                className="h-10 sm:h-12 w-auto object-contain filter drop-shadow"
                priority
              />
            </div>
          </Link>
          <div>
            <h1 className="text-2xl font-black text-white">Reset Password</h1>
            <p className="text-sm text-slate-400">Recover your NEED ELECTRO account</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6">
          {submitted ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-white">Check Your Email</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                If an account exists with <span className="text-brand-400 font-bold">{email}</span>, we have sent instructions to reset your password. Please also check your spam folder.
              </p>
              <div className="pt-2">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-2 text-xs font-bold text-brand-400 hover:text-brand-300 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Return to Login
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                Enter your registered email address and we'll send you a password recovery link or OTP verification instructions.
              </p>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 transition-all"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Send Reset Link</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                </Link>
              </div>
            </form>
          )}

          {/* Hotline assistance */}
          <div className="border-t border-white/10 pt-4 text-center space-y-1">
            <p className="text-xs text-slate-400">Need urgent help with your account?</p>
            <a
              href="tel:01733983752"
              className="inline-flex items-center gap-1 text-xs text-brand-400 font-bold hover:underline"
            >
              <Phone className="w-3 h-3" /> Call Hotline: 01733-983752
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
