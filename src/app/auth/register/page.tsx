'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Zap, UserPlus, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'CUSTOMER',
    agreeTerms: false,
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (!form.agreeTerms) {
      setError('Please accept the Terms of Service to continue.');
      return;
    }
    setLoading(true);
    const result = await register({
      name: form.name,
      email: form.email,
      phone: form.phone,
      password: form.password,
      role: form.role,
    });
    setLoading(false);
    if (result.success) {
      if (form.role === 'TECHNICIAN') {
        router.push('/technician/register');
      } else {
        router.push('/customer/dashboard');
      }
    } else {
      setError(result.error || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-brand-950 to-slate-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-500 shadow-lg shadow-brand-500/30 mb-2">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white">Create an Account</h1>
          <p className="text-sm text-slate-400">Join the NEED ELECTRO ecosystem</p>
        </div>

        {/* Role Selector */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: 'CUSTOMER', label: 'I need services / products', icon: '🛍️' },
            { value: 'TECHNICIAN', label: 'I want to work as a technician', icon: '🔧' },
          ].map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setForm((p) => ({ ...p, role: r.value }))}
              className={`p-3 rounded-2xl border text-left transition-all ${
                form.role === r.value
                  ? 'border-brand-500 bg-brand-500/10 text-white'
                  : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              <span className="text-xl block mb-1">{r.icon}</span>
              <span className="text-xs font-bold block">{r.value === 'CUSTOMER' ? 'Customer' : 'Technician'}</span>
              <span className="text-[10px] text-slate-500">{r.label}</span>
            </button>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-xs text-red-400 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Full Name</label>
              <input
                type="text" required value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Your full name"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Email Address</label>
              <input
                type="email" required value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="you@example.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Mobile Number</label>
              <input
                type="tel" required value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                placeholder="01XXXXXXXXX"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'} required
                    value={form.password} minLength={6}
                    onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                    placeholder="Min 6 chars"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                    {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Confirm Password</label>
                <input
                  type="password" required value={form.confirmPassword}
                  onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                  placeholder="Repeat password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.agreeTerms}
                onChange={(e) => setForm((p) => ({ ...p, agreeTerms: e.target.checked }))}
                className="mt-0.5 w-4 h-4 accent-brand-500"
              />
              <span className="text-xs text-slate-400">
                I agree to the{' '}
                <Link href="/policies/terms" className="text-brand-400 hover:underline">Terms of Service</Link>
                {' '}and{' '}
                <Link href="/policies/privacy" className="text-brand-400 hover:underline">Privacy Policy</Link>
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-sm gap-2 rounded-xl"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Account...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Create Account
                </span>
              )}
            </button>
          </form>

          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 pt-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Your data is secured and never shared</span>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-brand-400 font-bold hover:text-brand-300">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
