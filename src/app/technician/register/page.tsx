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
import { BANGLADESH_DISTRICTS } from '@/lib/data/districts';

const BANGLADESH_DIVISIONS = [
  'Sylhet',
  'Dhaka',
  'Chattogram',
  'Rajshahi',
  'Khulna',
  'Barishal',
  'Rangpur',
  'Mymensingh',
];

const SKILLS_LIST = [
  'Complete House Wiring',
  'Circuit Breaker & DB Board Setup',
  'CCTV Installation & IP Camera Setup',
  'Laptop & PC Hardware Servicing',
  'IPS & Inverter Setup & Maintenance',
  'AC Servicing & Installation',
  'Motor & Water Pump Setup',
  'Solar Panel Installation',
  'Smart Home & IoT Automation',
  'Emergency 24/7 Troubleshooting',
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
    division: 'Sylhet',
    district: 'Moulvibazar',
    serviceArea: 'Moulvibazar Sadar',
    preferredRadiusKm: '15',
    selectedSkills: ['Complete House Wiring'] as string[],
    agreeTerms: true,
  });

  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const availableDistricts = BANGLADESH_DISTRICTS.filter(
    (d) => d.division.toLowerCase() === form.division.toLowerCase()
  );

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
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      password: form.password,
      role: 'TECHNICIAN',
      technicianProfile: {
        skills: form.selectedSkills.join(', '),
        experienceYears: parseInt(form.experience, 10) || 1,
        nidNumber: form.nidNumber.trim(),
        serviceAreas: `${form.serviceArea}, ${form.district}, ${form.division}`,
        preferredRadiusKm: parseInt(form.preferredRadiusKm, 10) || 15,
        verificationStatus: 'PENDING',
      },
    });

    setLoading(false);

    if (result.success) {
      router.push('/technician/dashboard?welcome=true');
    } else {
      setError(result.error || 'Failed to complete registration. Please try again.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-brand-500 text-white flex items-center justify-center mx-auto shadow-md shadow-brand-500/20">
          <Wrench className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Join NEED ELECTRO Technician Network
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
          Register your professional trade skills, receive direct job offers across Bangladesh, and build your digital earnings wallet.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
        {/* Personal Details */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 pb-2 border-b border-slate-100 flex items-center gap-2">
            <User className="w-4 h-4 text-brand-500" />
            1. Personal &amp; Identity Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Full Name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Md. Abul Kalam"
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Mobile Phone (Primary) *</label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                placeholder="01XXXXXXXXX"
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Email Address *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="technician@example.com"
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">National ID (NID) Number *</label>
              <input
                type="text"
                required
                value={form.nidNumber}
                onChange={(e) => setForm((p) => ({ ...p, nidNumber: e.target.value }))}
                placeholder="10 or 17 digit NID number"
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Security & Password */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Lock className="w-4 h-4 text-brand-500" />
            2. Account Password
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Create Password *</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  placeholder="Min 6 characters"
                  className="w-full text-xs p-2.5 pr-9 bg-slate-50 border border-slate-200 rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Confirm Password *</label>
              <input
                type="password"
                required
                value={form.confirmPassword}
                onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                placeholder="Re-enter password"
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Trade Skills & Experience */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Award className="w-4 h-4 text-brand-500" />
            3. Skills &amp; Trade Experience
          </h3>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">Primary Trade Skills (Select all that apply) *</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SKILLS_LIST.map((skill) => {
                const selected = form.selectedSkills.includes(skill);
                return (
                  <button
                    type="button"
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={`p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition ${
                      selected
                        ? 'border-brand-500 bg-brand-50 text-brand-900'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{skill}</span>
                    {selected && <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Years of Experience</label>
              <select
                value={form.experience}
                onChange={(e) => setForm((p) => ({ ...p, experience: e.target.value }))}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="1">1 Year</option>
                <option value="2">2 Years</option>
                <option value="3">3-5 Years</option>
                <option value="6">6-10 Years</option>
                <option value="11">10+ Years (Senior Master)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Travel Radius (KM)</label>
              <select
                value={form.preferredRadiusKm}
                onChange={(e) => setForm((p) => ({ ...p, preferredRadiusKm: e.target.value }))}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="5">Within 5 KM</option>
                <option value="10">Within 10 KM</option>
                <option value="15">Within 15 KM</option>
                <option value="25">Within 25 KM</option>
                <option value="40">Entire District (Up to 40 KM)</option>
              </select>
            </div>
          </div>
        </div>

        {/* National Service Area */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 pb-2 border-b border-slate-100 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-brand-500" />
            4. Service District &amp; Coverage
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Division *</label>
              <select
                value={form.division}
                onChange={(e) => {
                  const div = e.target.value;
                  const firstDist = BANGLADESH_DISTRICTS.find((d) => d.division.toLowerCase() === div.toLowerCase());
                  setForm((p) => ({
                    ...p,
                    division: div,
                    district: firstDist ? firstDist.name : 'Dhaka',
                    serviceArea: `${firstDist ? firstDist.name : 'Dhaka'} Sadar`,
                  }));
                }}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              >
                {BANGLADESH_DIVISIONS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">District *</label>
              <select
                value={form.district}
                onChange={(e) => {
                  const dist = e.target.value;
                  setForm((p) => ({ ...p, district: dist, serviceArea: `${dist} Sadar` }));
                }}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
              >
                {availableDistricts.map((d) => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Thana / Upazila Base *</label>
              <input
                type="text"
                required
                value={form.serviceArea}
                onChange={(e) => setForm((p) => ({ ...p, serviceArea: e.target.value }))}
                placeholder="e.g. Moulvibazar Sadar, Mirpur"
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Terms */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-2">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={form.agreeTerms}
              onChange={(e) => setForm((p) => ({ ...p, agreeTerms: e.target.checked }))}
              className="mt-0.5 accent-brand-500"
            />
            <span>
              I agree to the NEED ELECTRO Technician Code of Conduct, safety protocols, 85% revenue earnings model, and prompt customer service standards.
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-3 text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25"
        >
          {loading ? 'Submitting Application...' : 'Register as Verified Technician'}
          <ArrowRight className="w-4 h-4" />
        </button>

        <p className="text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link href="/technician/login" className="text-brand-600 font-bold hover:underline">
            Sign In to Technician Dashboard
          </Link>
        </p>
      </form>
    </div>
  );
}
