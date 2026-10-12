'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  UserPlus, Eye, EyeOff, ShieldCheck, MapPin, Phone, 
  Mail, Lock, User, ArrowRight, Wrench, CheckCircle2 
} from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';

const MOULVIBAZAR_AREAS = [
  'Moulvibazar Sadar',
  'Kusumbag',
  'Sreemangal',
  'Kamalganj',
  'Rajnagar',
  'Kulaura',
  'Barlekha',
  'Juri',
  'Outside Sylhet',
];

function CustomerRegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect');
  const { register } = useAuth();

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    area: 'Moulvibazar Sadar',
    address: '',
    password: '',
    confirmPassword: '',
    agreeTerms: true,
  });

  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    if (!form.agreeTerms) {
      setError('Please agree to the Terms of Service to continue.');
      return;
    }

    setLoading(true);

    const result = await register({
      name: form.name,
      phone: form.phone,
      email: form.email,
      area: form.area,
      address: form.address,
      password: form.password,
      role: 'CUSTOMER',
    });

    setLoading(false);

    if (result.success) {
      router.push(redirectTarget || result.redirectUrl || '/customer/dashboard');
    } else {
      setError(result.error || 'Registration failed. Please check your inputs and try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-brand-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[650px] h-[380px] bg-brand-500/15 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute -bottom-10 left-10 w-[450px] h-[320px] bg-emerald-500/10 blur-[130px] pointer-events-none rounded-full" />

      {/* Switcher Banner */}
      <div className="max-w-xl w-full mx-auto px-4 mb-4">
        <div className="flex items-center justify-between p-2.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl text-xs text-slate-300 shadow-lg">
          <span className="flex items-center gap-1.5 font-medium text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Customer Registration
          </span>
          <Link
            href="/technician/register"
            className="flex items-center gap-1 text-brand-400 hover:text-brand-300 font-bold transition px-2 py-1 rounded-xl hover:bg-white/5"
          >
            <Wrench className="w-3.5 h-3.5" />
            Want to work as a Technician? Apply here &rarr;
          </Link>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl px-4">
        {/* Header */}
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
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Create Customer Account</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Join NEED ELECTRO to book verified electricians, order gadgets, and protect warranties
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
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-200">Full Name *</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Tanvir Ahmed"
                  className="w-full pl-10 pr-4 py-3 text-sm bg-white/5 border border-white/15 rounded-2xl text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white/10 transition"
                />
              </div>
            </div>

            {/* Phone & Email Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200">Mobile Phone *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="01XXXXXXXXX"
                    className="w-full pl-10 pr-4 py-3 text-sm bg-white/5 border border-white/15 rounded-2xl text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white/10 transition"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200">Email Address (Optional)</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="user@example.com"
                    className="w-full pl-10 pr-4 py-3 text-sm bg-white/5 border border-white/15 rounded-2xl text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white/10 transition"
                  />
                </div>
              </div>
            </div>

            {/* City / Area */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200">Service Area / Upazila</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    value={form.area}
                    onChange={(e) => setForm({ ...form, area: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 text-sm bg-slate-900 border border-white/15 rounded-2xl text-white focus:outline-hidden focus:ring-2 focus:ring-brand-500 transition"
                  >
                    {MOULVIBAZAR_AREAS.map((a) => (
                      <option key={a} value={a} className="bg-slate-900 text-white">
                        {a}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200">Street / House Address (Optional)</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="e.g. House #12, Road #4"
                  className="w-full px-4 py-3 text-sm bg-white/5 border border-white/15 rounded-2xl text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white/10 transition"
                />
              </div>
            </div>

            {/* Password & Confirm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200">Password (min. 6 chars) *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Create a password"
                    className="w-full pl-10 pr-10 py-3 text-sm bg-white/5 border border-white/15 rounded-2xl text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white/10 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                  >
                    {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200">Confirm Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    placeholder="Repeat password"
                    className="w-full pl-10 pr-4 py-3 text-sm bg-white/5 border border-white/15 rounded-2xl text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white/10 transition"
                  />
                </div>
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="flex items-start gap-2.5 pt-1">
              <input
                type="checkbox"
                id="terms"
                checked={form.agreeTerms}
                onChange={(e) => setForm({ ...form, agreeTerms: e.target.checked })}
                className="mt-1 rounded-sm border-white/20 bg-white/5 text-brand-500 focus:ring-brand-500"
              />
              <label htmlFor="terms" className="text-xs text-slate-400 leading-relaxed">
                I agree to the{' '}
                <Link href="/policies/terms" target="_blank" className="text-brand-400 underline hover:text-brand-300">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/policies/privacy" target="_blank" className="text-brand-400 underline hover:text-brand-300">
                  Privacy Policy
                </Link>
                .
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-bold text-sm shadow-lg shadow-brand-500/30 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Creating Account...</span>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create Customer Account
                </>
              )}
            </button>
          </form>

          {/* Already have account */}
          <div className="text-center pt-2 border-t border-white/10">
            <p className="text-xs text-slate-400">
              Already have an account?{' '}
              <Link
                href={redirectTarget ? `/customer/login?redirect=${encodeURIComponent(redirectTarget)}` : '/customer/login'}
                className="text-brand-400 font-bold hover:text-brand-300 transition"
              >
                Sign In as Customer &rarr;
              </Link>
            </p>
          </div>
        </div>

        {/* Benefits Guarantee */}
        <div className="mt-6 grid grid-cols-3 gap-3 text-center text-[10px] text-slate-400">
          <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
            Verified Technicians
          </div>
          <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10">
            <CheckCircle2 className="w-4 h-4 text-brand-400 mx-auto mb-1" />
            Transparent Pricing
          </div>
          <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10">
            <CheckCircle2 className="w-4 h-4 text-sky-400 mx-auto mb-1" />
            Warranty Backed
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CustomerRegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading Customer Sign Up...</div>}>
      <CustomerRegisterForm />
    </Suspense>
  );
}
