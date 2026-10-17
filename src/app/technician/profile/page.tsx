'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import {
  User, ShieldCheck, Star, Wrench, MapPin, Award,
  Phone, Mail, Lock, CheckCircle2, AlertCircle, Save,
  ExternalLink, Eye, RefreshCw
} from 'lucide-react';

export default function TechnicianProfilePage() {
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Editable Form fields
  const [bio, setBio] = useState('');
  const [profilePhotoUrl, setProfilePhotoUrl] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [preferredRadiusKm, setPreferredRadiusKm] = useState(15);
  const [workingHours, setWorkingHours] = useState('');
  const [availableStatus, setAvailableStatus] = useState('AVAILABLE');
  const [emergencyAvailable, setEmergencyAvailable] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/technician/login?redirect=/technician/profile');
      return;
    }
    if (user.role !== 'TECHNICIAN' && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      router.push('/customer/dashboard');
      return;
    }
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/v1/technicians/me');
      if (!res.ok) throw new Error('Failed to load profile data');
      const data = await res.json();
      const p = data.technician;
      setProfile(p);
      setBio(p.bio || '');
      setProfilePhotoUrl(p.profilePhotoUrl || '');
      setEmergencyPhone(p.emergencyPhone || '');
      setPreferredRadiusKm(p.preferredRadiusKm || 15);
      setWorkingHours(p.workingHours || '8:00 AM - 8:00 PM');
      setAvailableStatus(p.availableStatus || 'AVAILABLE');
      setEmergencyAvailable(Boolean(p.emergencyAvailable));
    } catch (err: any) {
      setError(err.message || 'Error loading profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/v1/technicians/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bio,
          profilePhotoUrl,
          emergencyPhone,
          preferredRadiusKm,
          workingHours,
          availableStatus,
          emergencyAvailable,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      setSuccessMsg('Professional profile successfully updated.');
      await loadProfile();
    } catch (err: any) {
      setError(err.message || 'Error saving changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto" />
        <p className="text-xs font-semibold text-slate-500">Loading technician profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <User className="w-6 h-6 text-brand-500" /> Professional Profile
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your public presentation, trade experience, travel range, and emergency contact details.
          </p>
        </div>

        <button
          onClick={loadProfile}
          disabled={saving}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${saving ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Verification & Trust Badge Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white font-black text-xl flex items-center justify-center shadow-md">
            {profile?.user?.name?.charAt(0) || 'T'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-900">{profile?.user?.name}</h2>
              {profile?.verificationStatus === 'VERIFIED' && (
                <span title="Verified by NEED ELECTRO">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">{profile?.user?.phone} · {profile?.user?.email}</p>
            <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-600">
              <span className="font-bold flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                {(profile?.ratingOverall || 5.0).toFixed(1)} Rating
              </span>
              <span>·</span>
              <span className="font-bold">{profile?.totalCompletedJobs || 0} Jobs Completed</span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <span
            className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
              profile?.verificationStatus === 'VERIFIED'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            {profile?.verificationStatus || 'Pending'}
          </span>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Editable Presentation */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-2 border-b border-slate-100 flex items-center gap-2">
            <User className="w-4 h-4 text-brand-500" /> 1. Professional Introduction &amp; Bio
          </h3>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Short Bio / Introduction</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="e.g. Master certified electrician with 8+ years specializing in residential house wiring, distribution boards, and industrial IPS inverter installation..."
              className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Avatar / Profile Photo URL</label>
              <input
                type="url"
                value={profilePhotoUrl}
                onChange={(e) => setProfilePhotoUrl(e.target.value)}
                placeholder="https://..."
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Emergency Alternate Phone</label>
              <input
                type="tel"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
              />
            </div>
          </div>
        </div>

        {/* Coverage & Operating Hours */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-2 border-b border-slate-100 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-brand-500" /> 2. Dispatch Range &amp; Availability Schedule
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Travel Radius (KM)</label>
              <select
                value={preferredRadiusKm}
                onChange={(e) => setPreferredRadiusKm(parseInt(e.target.value, 10) || 15)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value={5}>Within 5 KM</option>
                <option value={10}>Within 10 KM</option>
                <option value={15}>Within 15 KM</option>
                <option value={25}>Within 25 KM</option>
                <option value={40}>District-wide (Up to 40 KM)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Standard Working Hours</label>
              <input
                type="text"
                value={workingHours}
                onChange={(e) => setWorkingHours(e.target.value)}
                placeholder="e.g. 9:00 AM - 7:00 PM"
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={availableStatus === 'AVAILABLE'}
                onChange={(e) => setAvailableStatus(e.target.checked ? 'AVAILABLE' : 'OFFLINE')}
                className="accent-brand-500 w-4 h-4 rounded"
              />
              <span>Currently Online &amp; Open for Live Job Dispatches</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={emergencyAvailable}
                onChange={(e) => setEmergencyAvailable(e.target.checked)}
                className="accent-brand-500 w-4 h-4 rounded"
              />
              <span>24/7 Emergency Service On-Call (Higher Payouts)</span>
            </label>
          </div>
        </div>

        {/* Locked / Admin Verified Credentials */}
        <div className="bg-slate-50 rounded-3xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-500" /> 3. Verified Credentials (Admin Controlled)
            </h3>
            <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-bold">
              TAMPER PROTECTED
            </span>
          </div>

          <p className="text-xs text-slate-500">
            National identity, trade qualifications, and base service district require administrative review before changes take effect.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-white rounded-2xl border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase font-bold">NID Number</span>
              <p className="font-mono font-bold text-slate-800 mt-0.5">{profile?.nidNumber || 'Submitted for Review'}</p>
            </div>
            <div className="p-3 bg-white rounded-2xl border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Trade Experience</span>
              <p className="font-bold text-slate-800 mt-0.5">{profile?.experienceYears || 1} Years</p>
            </div>
            <div className="p-3 bg-white rounded-2xl border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Base Service Area</span>
              <p className="font-bold text-slate-800 mt-0.5">{profile?.serviceAreas || 'Moulvibazar'}</p>
            </div>
          </div>

          {profile?.skills && (
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1.5">Approved Trade Skills</span>
              <div className="flex flex-wrap gap-1.5">
                {(Array.isArray(profile.skills) ? profile.skills : profile.skills.split(',')).map((s: string) => (
                  <span key={s} className="px-2.5 py-1 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold">
                    {s.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={saving}
          className="btn-primary w-full py-3 text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving Changes...' : 'Save Profile Updates'}
        </button>
      </form>
    </div>
  );
}
