'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import {
  Clock, MapPin, CheckCircle2, AlertCircle, Save,
  RefreshCw, Radio, Zap, ShieldCheck
} from 'lucide-react';

export default function TechnicianAvailabilityPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('AVAILABLE');
  const [emergencyAvailable, setEmergencyAvailable] = useState(false);
  const [preferredRadiusKm, setPreferredRadiusKm] = useState(15);
  const [workingHours, setWorkingHours] = useState('8:00 AM - 8:00 PM');
  const [serviceAreas, setServiceAreas] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/technician/login?redirect=/technician/availability');
      return;
    }
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/v1/technicians/me');
      if (!res.ok) throw new Error('Failed to load profile');
      const data = await res.json();
      const tech = data.technician;
      setStatus(tech.availableStatus || 'AVAILABLE');
      setEmergencyAvailable(Boolean(tech.emergencyAvailable));
      setPreferredRadiusKm(tech.preferredRadiusKm || 15);
      setWorkingHours(tech.workingHours || '8:00 AM - 8:00 PM');
      setServiceAreas(tech.serviceAreas || 'Moulvibazar Sadar');
    } catch {
      setError('Failed to load availability settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/v1/technicians/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          availableStatus: status,
          emergencyAvailable,
          preferredRadiusKm,
          workingHours,
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to update schedule');
      }

      setSuccessMsg('Availability and dispatch parameters successfully saved.');
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Error updating settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Clock className="w-6 h-6 text-brand-500" /> Availability &amp; Working Schedule
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Control your live dispatch availability status, emergency on-call mode, and travel limits.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={saving}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${saving ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

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

      <form onSubmit={handleSave} className="space-y-6">
        {/* Status Toggle Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-2 border-b border-slate-100">
            1. Current Dispatch Status
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: 'AVAILABLE',
                title: 'Available & Online',
                desc: 'Receiving live matching customer job offers near you.',
                color: 'border-emerald-500 bg-emerald-50 text-emerald-900',
              },
              {
                id: 'BUSY',
                title: 'Busy on Job',
                desc: 'Currently performing on-site work or transit.',
                color: 'border-amber-500 bg-amber-50 text-amber-900',
              },
              {
                id: 'OFFLINE',
                title: 'Off-Duty / Rest',
                desc: 'Do not dispatch offers until toggled back online.',
                color: 'border-slate-400 bg-slate-50 text-slate-800',
              },
            ].map((option) => (
              <button
                type="button"
                key={option.id}
                onClick={() => setStatus(option.id)}
                className={`p-4 rounded-2xl border text-left transition ${
                  status === option.id ? option.color : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs">{option.title}</span>
                  {status === option.id && <CheckCircle2 className="w-4 h-4" />}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">{option.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Operating Hours & Radius */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-500" /> 2. Working Hours &amp; Travel Radius
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Daily Operating Hours</label>
              <input
                type="text"
                value={workingHours}
                onChange={(e) => setWorkingHours(e.target.value)}
                placeholder="e.g. 8:00 AM - 8:00 PM"
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Preferred Travel Radius (KM)</label>
              <select
                value={preferredRadiusKm}
                onChange={(e) => setPreferredRadiusKm(parseInt(e.target.value, 10) || 15)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value={5}>Within 5 KM</option>
                <option value={10}>Within 10 KM</option>
                <option value={15}>Within 15 KM</option>
                <option value={25}>Within 25 KM</option>
                <option value={40}>District Coverage (Up to 40 KM)</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={emergencyAvailable}
                onChange={(e) => setEmergencyAvailable(e.target.checked)}
                className="accent-brand-500 w-4 h-4 rounded mt-0.5"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  Opt-in for 24/7 Emergency Outage Calls
                </span>
                <p className="text-slate-500 mt-0.5">
                  Receive emergency short-circuit, IPS failure, and main breaker breakdown jobs during night or holiday hours with emergency bonus rates.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Assigned Base Area */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-2">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-2 border-b border-slate-100 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-brand-500" /> 3. Registered Service Territory
          </h3>
          <p className="text-xs text-slate-600">
            Your home dispatch territory is currently configured as <span className="font-bold text-slate-900">{serviceAreas}</span>.
            To change your primary district or upazila headquarters, please submit a request through the Support desk for operational safety verification.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="btn-primary w-full py-3 text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving Schedule...' : 'Save Availability Settings'}
        </button>
      </form>
    </div>
  );
}
