'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  Wrench, ShieldCheck, CheckCircle2, User, Phone, Mail, 
  Lock, MapPin, Eye, EyeOff, Award, ArrowRight, UserCheck, 
  FileText, Briefcase
} from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';

const SKILLS_LIST = [
  'Complete House Wiring',
  'CCTV Installation & Security',
  'Laptop & PC Hardware Servicing',
  'IPS & Inverter Setup & Maintenance',
  'AC Servicing & Installation',
  'Circuit Breaker & DB Board Setup',
  'Motor & Water Pump Setup',
  'Solar Panel Installation',
  'Smart Home & IoT Wiring',
  'Emergency 24/7 Troubleshooting',
];

const MOULVIBAZAR_AREAS = [
  'Moulvibazar Sadar',
  'Kusumbag',
  'Sreemangal',
  'Kamalganj',
  'Rajnagar',
  'Kulaura',
  'Barlekha',
  'Juri',
];

export default function TechnicianRegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    experience: '3',
    nidNumber: '',
    area: 'Moulvibazar Sadar',
    selectedSkills: ['Complete House Wiring'] as string[],
    agreeTerms: true,
  });

  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleSkill = (skill: string) => {
    setForm((prev) => {
      const exists = prev.selectedSkills.includes(skill);
      if (exists) {
        if (prev.selectedSkills.length === 1) return prev; // Keep at least one
        return { ...prev, selectedSkills: prev.selectedSkills.filter((s) => s !== skill) };
      }
      return { ...prev, selectedSkills: [...prev.selectedSkills, skill] };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    if (form.selectedSkills.length === 0) {
      setError('Please select at least one primary electrical or technological trade skill.');
      return;
    }

    if (!form.agreeTerms) {
      setError('You must agree to the Technician Code of Conduct and Safety Standards.');
      return;
    }

    setLoading(true);

    const result = await register({
      name: form.name,
      phone: form.phone,
      email: form.email,
      password: form.password,
      role: 'TECHNICIAN',
      experience: form.experience,
      nidNumber: form.nidNumber,
      serviceAreas: form.area,
      skills: form.selectedSkills,
    });

    setLoading(false);

    if (result.success) {
      router.push(result.redirectUrl || '/technician/dashboard');
    } else {
      setError(result.error || 'Technician registration failed. Please check your inputs and try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/40 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-amber-500/15 blur-[150px] pointer-events-none rounded-full" />
      <div className="absolute -bottom-10 right-10 w-[450px] h-[350px] bg-brand-500/10 blur-[130px] pointer-events-none rounded-full" />

      {/* Switcher Banner */}
      <div className="max-w-2xl w-full mx-auto px-4 mb-4">
        <div className="flex items-center justify-between p-2.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl text-xs text-slate-300 shadow-lg">
          <span className="flex items-center gap-1.5 font-bold text-amber-400">
            <Wrench className="w-4 h-4" />
            Technician Career Application
          </span>
          <Link
            href="/technician/login"
            className="flex items-center gap-1 text-slate-300 hover:text-white font-semibold transition px-2 py-1 rounded-xl hover:bg-white/5"
          >
            Already registered? Technician Sign In &rarr;
          </Link>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-2xl px-4">
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
              <Award className="w-3.5 h-3.5 text-amber-400" />
              Direct Technician Onboarding
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Join NEED ELECTRO as a Technician
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Receive steady job dispatches, transparent payouts, and professional Amdads Group trade accreditation
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="mt-6 bg-white/10 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {error && (
            <div className="bg-red-500/15 border border-red-500/30 rounded-2xl px-4 py-3 text-xs text-red-300 font-medium animate-in fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 1. Personal Information */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> 1. Personal &amp; Contact Details
              </h3>
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200">Full Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Master Electrician Kabir Hossain"
                  className="w-full px-4 py-3 text-sm bg-white/5 border border-white/15 rounded-2xl text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white/10 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-200">Mobile Phone (For Job Calls) *</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="01XXXXXXXXX"
                      className="w-full pl-10 pr-4 py-3 text-sm bg-white/5 border border-white/15 rounded-2xl text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white/10 transition"
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
                      placeholder="tech@example.com"
                      className="w-full pl-10 pr-4 py-3 text-sm bg-white/5 border border-white/15 rounded-2xl text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white/10 transition"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Trade & Experience */}
            <div className="space-y-3 pt-2 border-t border-white/10">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5" /> 2. Trade Skills &amp; Experience
              </h3>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-200">Select Your Trade Skills * (Tap to choose)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SKILLS_LIST.map((skill) => {
                    const isSelected = form.selectedSkills.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className={`p-2.5 rounded-xl border text-left text-xs font-medium flex items-center justify-between transition ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-500/50 text-white'
                            : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        <span>{skill}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-200">Years Experience</label>
                  <select
                    value={form.experience}
                    onChange={(e) => setForm({ ...form, experience: e.target.value })}
                    className="w-full px-3 py-3 text-sm bg-slate-900 border border-white/15 rounded-2xl text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 transition"
                  >
                    <option value="1">1 Year</option>
                    <option value="2">2 Years</option>
                    <option value="3">3 Years</option>
                    <option value="5">5+ Years (Senior)</option>
                    <option value="8">8+ Years (Master)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-200">Working Area</label>
                  <select
                    value={form.area}
                    onChange={(e) => setForm({ ...form, area: e.target.value })}
                    className="w-full px-3 py-3 text-sm bg-slate-900 border border-white/15 rounded-2xl text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 transition"
                  >
                    {MOULVIBAZAR_AREAS.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-200">NID Card Number</label>
                  <input
                    type="text"
                    value={form.nidNumber}
                    onChange={(e) => setForm({ ...form, nidNumber: e.target.value })}
                    placeholder="National ID"
                    className="w-full px-3 py-3 text-sm bg-white/5 border border-white/15 rounded-2xl text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500 transition"
                  />
                </div>
              </div>
            </div>

            {/* 3. Account Password */}
            <div className="space-y-3 pt-2 border-t border-white/10">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> 3. Set Portal Password
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-200">Password (min. 6 chars) *</label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      required
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="Create password"
                      className="w-full px-4 py-3 pr-10 text-sm bg-white/5 border border-white/15 rounded-2xl text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-200">Confirm Password *</label>
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    placeholder="Repeat password"
                    className="w-full px-4 py-3 text-sm bg-white/5 border border-white/15 rounded-2xl text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500 transition"
                  />
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-2.5 pt-1">
              <input
                type="checkbox"
                id="techTerms"
                checked={form.agreeTerms}
                onChange={(e) => setForm({ ...form, agreeTerms: e.target.checked })}
                className="mt-1 rounded-sm border-white/20 bg-white/5 text-amber-500 focus:ring-amber-500"
              />
              <label htmlFor="techTerms" className="text-xs text-slate-400 leading-relaxed">
                I agree to the{' '}
                <Link href="/policies/technician" target="_blank" className="text-amber-400 underline hover:text-amber-300">
                  Technician Policy &amp; Code of Conduct
                </Link>
                , and commit to professional electrical safety standards.
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white font-bold text-sm shadow-xl shadow-amber-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Registering &amp; Opening Workspace...</span>
              ) : (
                <>
                  <Wrench className="w-4 h-4" />
                  Register &amp; Apply as Technician
                </>
              )}
            </button>
          </form>

          {/* Already registered */}
          <div className="text-center pt-2 border-t border-white/10">
            <p className="text-xs text-slate-400">
              Already registered as a technician?{' '}
              <Link href="/technician/login" className="text-amber-400 font-bold hover:text-amber-300 transition">
                Sign In to Workspace &rarr;
              </Link>
            </p>
          </div>
        </div>

        {/* Perks */}
        <div className="mt-6 grid grid-cols-3 gap-3 text-center text-[10px] text-slate-400">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <ShieldCheck className="w-4 h-4 text-amber-400 mx-auto mb-1" />
            Verified Digital ID Badge
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
            Fast Daily Job Dispatches
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <Award className="w-4 h-4 text-brand-400 mx-auto mb-1" />
            Academy Certifications
          </div>
        </div>
      </div>
    </div>
  );
}
