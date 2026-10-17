'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import {
  Star, Award, CheckCircle2, ShieldCheck, RefreshCw,
  ThumbsUp, MessageSquare, AlertCircle
} from 'lucide-react';

export default function TechnicianReviewsPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/technician/login?redirect=/technician/reviews');
      return;
    }
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/v1/technicians/me');
      if (!res.ok) throw new Error('Failed to load technician ratings');
      const data = await res.json();
      setProfile(data.technician);
    } catch {
      setError('Failed to fetch reviews data.');
    } finally {
      setLoading(false);
    }
  };

  const overallRating = profile?.ratingOverall || 5.0;
  const completedJobs = profile?.totalCompletedJobs || 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Star className="w-6 h-6 text-amber-500 fill-amber-500" /> Customer Ratings &amp; Performance
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Genuine verified feedback, technical workmanship evaluations, and platform performance scores.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-2 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Overall Rating Score
          </span>
          <p className="text-4xl font-black text-slate-900 flex items-center justify-center gap-1.5">
            <Star className="w-8 h-8 text-amber-500 fill-amber-500" />
            {overallRating.toFixed(1)}
          </p>
          <p className="text-xs text-slate-500 font-semibold">Based on verified completed service calls</p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-2 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Jobs Completed &amp; Signed
          </span>
          <p className="text-4xl font-black text-slate-900">
            {completedJobs}
          </p>
          <p className="text-xs text-slate-500 font-semibold">100% genuine customer fulfillment</p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-2 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Verification Standing
          </span>
          <p className="text-2xl font-black text-emerald-600 mt-2 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-7 h-7" />
            {profile?.verificationStatus === 'VERIFIED' ? 'Verified Pro' : profile?.verificationStatus || 'Pending'}
          </p>
          <p className="text-xs text-slate-500 font-semibold">NEED ELECTRO Certified Workforce</p>
        </div>
      </div>

      {/* Rating Standard Policy */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3 text-xs text-slate-600">
        <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
          <Award className="w-4 h-4 text-brand-500" /> NEED ELECTRO Quality Standards
        </h3>
        <p className="leading-relaxed">
          Customer ratings directly influence your priority dispatch queue across Bangladesh.
          Technicians who maintain a 4.5+ star rating receive preferential matching for high-value residential wiring,
          industrial solar, and commercial CCTV installation projects.
        </p>
      </div>
    </div>
  );
}
