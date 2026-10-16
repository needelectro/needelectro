'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Wrench, MapPin, Clock, CheckCircle2, XCircle, DollarSign,
  Star, Wallet, BarChart2, LogOut, Bell, ChevronRight, Zap,
  AlertCircle, Package, User, TrendingUp
} from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: 'bg-amber-100 text-amber-700',
  ACCEPTED: 'bg-brand-100 text-brand-700',
  ON_THE_WAY: 'bg-purple-100 text-purple-700',
  ARRIVED: 'bg-indigo-100 text-indigo-700',
  WORK_STARTED: 'bg-orange-100 text-orange-700',
  WORK_COMPLETED: 'bg-emerald-100 text-emerald-700',
  CLOSED: 'bg-slate-100 text-slate-600',
  CANCELLED: 'bg-red-100 text-red-600',
  PENDING: 'bg-amber-100 text-amber-700',
  VERIFIED: 'bg-emerald-100 text-emerald-700',
  UNDER_REVIEW: 'bg-blue-100 text-blue-700',
  SUSPENDED: 'bg-red-100 text-red-600',
};

type TabKey = 'overview' | 'jobs' | 'earnings' | 'profile';

export default function TechnicianDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') as TabKey | null;
  const [activeTab, setActiveTab] = useState<TabKey>(tabParam || 'overview');

  useEffect(() => {
    if (tabParam && ['overview', 'jobs', 'earnings', 'profile'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);
  const [profile, setProfile] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [availableJobs, setAvailableJobs] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { router.push('/technician/login?redirect=/technician/dashboard'); return; }
    if (user.role !== 'TECHNICIAN' && user.role !== 'ADMIN') {
      router.push('/customer/dashboard');
      return;
    }
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pRes, jRes, aRes] = await Promise.all([
        fetch('/api/v1/technicians/me'),
        fetch('/api/v1/bookings?role=technician'),
        fetch('/api/v1/bookings?status=AVAILABLE'),
      ]);
      if (pRes.ok) { const d = await pRes.json(); setProfile(d.technician); }
      if (jRes.ok) { const d = await jRes.json(); setJobs(d.bookings || []); }
      if (aRes.ok) { const d = await aRes.json(); setAvailableJobs(d.bookings || []); }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  const acceptJob = async (bookingId: string) => {
    setActionLoading(bookingId);
    try {
      const res = await fetch(`/api/v1/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ACCEPTED' }),
      });
      if (res.ok) {
        await loadData();
      }
    } catch { /* ignore */ }
    finally { setActionLoading(null); }
  };

  const updateJobStatus = async (bookingId: string, status: string) => {
    setActionLoading(bookingId);
    try {
      const res = await fetch(`/api/v1/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) await loadData();
    } catch { /* ignore */ }
    finally { setActionLoading(null); }
  };

  const handleLogout = async () => { await logout(); router.push('/'); };

  if (!user) return null;

  const myActiveJobs = jobs.filter((j) => !['CLOSED', 'CANCELLED', 'WORK_COMPLETED'].includes(j.status));
  const completedJobs = jobs.filter((j) => ['WORK_COMPLETED', 'CLOSED'].includes(j.status));
  const totalEarned = completedJobs.reduce((acc, j) => acc + (j.technicianEarning || 0), 0);

  const JOB_STATUS_NEXT: Record<string, { label: string; next: string }> = {
    ACCEPTED: { label: 'Mark: On The Way', next: 'ON_THE_WAY' },
    ON_THE_WAY: { label: 'Mark: Arrived', next: 'ARRIVED' },
    ARRIVED: { label: 'Start Work', next: 'WORK_STARTED' },
    WORK_STARTED: { label: 'Mark: Work Complete', next: 'WORK_COMPLETED' },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="lg:w-64 space-y-4 shrink-0">
          <Link href="/" className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 shadow-xs group hover:bg-white transition" title="Return to Website">
            <Image
              src="/logo.png"
              alt="NEED ELECTRO"
              width={140}
              height={70}
              className="h-8 w-auto object-contain group-hover:scale-105 transition-transform"
            />
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-md">Tech</span>
          </Link>

          <div className="glass-card-dark rounded-3xl p-5 text-white space-y-3 relative overflow-hidden shadow-xl border border-white/10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/15 blur-2xl rounded-full pointer-events-none" />
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-xl font-black shadow-inner">
              {user.name.charAt(0)}
            </div>
            <div>
              <p className="font-black text-sm">{user.name}</p>
              <p className="text-xs text-slate-400">{user.email}</p>
              {profile && (
                <span className={`inline-block mt-2 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase backdrop-blur-sm border border-white/10 ${STATUS_COLORS[profile.verificationStatus] || 'bg-slate-700 text-slate-300'}`}>
                  {profile.verificationStatus?.replace(/_/g, ' ') || 'Pending Review'}
                </span>
              )}
            </div>
            {profile && (
              <div className="text-xs text-slate-300 space-y-0.5 pt-1.5 border-t border-white/10">
                <p>⭐ {(profile.rating || 0).toFixed(1)} ({profile.ratingCount || 0} reviews)</p>
                <p>✅ {profile.totalJobsCompleted || 0} jobs completed</p>
              </div>
            )}
          </div>

          <nav className="glass-card rounded-3xl shadow-sm overflow-hidden">
            {([
              { key: 'overview', label: 'Overview', icon: BarChart2, badge: undefined },
              { key: 'jobs', label: 'My Jobs', icon: Wrench, badge: myActiveJobs.length },
              { key: 'earnings', label: 'Earnings', icon: Wallet, badge: undefined },
              { key: 'profile', label: 'My Profile', icon: User, badge: undefined },
            ] as Array<{ key: TabKey; label: string; icon: any; badge?: number }>).map(({ key, label, icon: Icon, badge }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`w-full flex items-center justify-between px-4 py-3 text-xs font-bold transition border-b border-white/60 last:border-0 ${
                  activeTab === key ? 'text-brand-600 bg-white/80' : 'text-slate-700 hover:bg-white/60'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  {label}
                </span>
                {badge != null && badge > 0 && (
                  <span className="bg-amber-500 text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center shadow-xs">
                    {badge}
                  </span>
                )}
              </button>
            ))}
            <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-4 py-3 text-xs font-bold text-red-600 hover:bg-red-50/80 transition">
              <LogOut className="w-4 h-4" />Sign Out
            </button>
          </nav>

          {profile?.verificationStatus !== 'VERIFIED' && (
            <div className="bg-amber-500/10 border border-amber-500/30 backdrop-blur-xl rounded-2xl p-4 text-xs text-amber-900 space-y-1 shadow-xs">
              <p className="font-bold">⚠️ Pending Verification</p>
              <p>Your profile is under review. You cannot accept jobs until verified. Expected: 2–3 business days.</p>
              <p className="font-semibold">Call: 01733-983752</p>
            </div>
          )}
        </aside>

        {/* Main */}
        <main className="flex-1 space-y-6 min-w-0">
          {loading && (
            <div className="flex items-center justify-center h-40">
              <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
            </div>
          )}

          {!loading && activeTab === 'overview' && (
            <div className="space-y-6">
              <h1 className="text-xl font-black text-slate-950">
                Technician Dashboard 🔧
              </h1>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Available Jobs', value: availableJobs.length, icon: Zap, color: 'text-amber-600 bg-amber-50' },
                  { label: 'Active Jobs', value: myActiveJobs.length, icon: Wrench, color: 'text-brand-600 bg-brand-50' },
                  { label: 'Completed', value: completedJobs.length, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
                  { label: 'Total Earned', value: `৳${totalEarned.toLocaleString()}`, icon: DollarSign, color: 'text-purple-600 bg-purple-50' },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <p className="text-xl font-black text-slate-900">{value}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{label}</p>
                  </div>
                ))}
              </div>

              {/* Available jobs preview */}
              {availableJobs.length > 0 && profile?.verificationStatus === 'VERIFIED' && (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
                    <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      Available Jobs Near You
                    </h3>
                    <button onClick={() => setActiveTab('jobs')} className="text-[11px] text-brand-600 font-bold hover:underline">
                      View All
                    </button>
                  </div>
                  {availableJobs.slice(0, 3).map((job) => (
                    <div key={job.id} className="flex items-center justify-between px-5 py-3.5 border-b border-slate-50 last:border-0 gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-slate-900 line-clamp-1">{job.service?.name || 'Service Booking'}</p>
                        <p className="text-[10px] text-slate-500 flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5" />{job.location?.area || 'Moulvibazar'}
                          <span className="mx-1">·</span>
                          <Clock className="w-2.5 h-2.5" />{job.preferredDate}
                        </p>
                      </div>
                      <button
                        onClick={() => acceptJob(job.id)}
                        disabled={actionLoading === job.id}
                        className="shrink-0 text-[10px] font-black bg-brand-500 hover:bg-brand-600 text-white px-3 py-1.5 rounded-xl transition"
                      >
                        {actionLoading === job.id ? '...' : 'Accept'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {!loading && activeTab === 'jobs' && (
            <div className="space-y-4">
              <h2 className="text-lg font-black text-slate-900">My Jobs</h2>

              {/* Active jobs */}
              {myActiveJobs.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider">Active Jobs</h3>
                  {myActiveJobs.map((job) => {
                    const nextAction = JOB_STATUS_NEXT[job.status];
                    return (
                      <div key={job.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-black text-slate-900 text-sm">{job.service?.name || 'Service Booking'}</p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              <MapPin className="inline w-3 h-3 mr-0.5" />{job.location?.addressLine}, {job.location?.area}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Customer: {job.customer?.name} · {job.customer?.phone}</p>
                          </div>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${STATUS_COLORS[job.status] || 'bg-slate-100 text-slate-600'}`}>
                            {job.status?.replace(/_/g, ' ')}
                          </span>
                        </div>
                        {nextAction && (
                          <button
                            onClick={() => updateJobStatus(job.id, nextAction.next)}
                            disabled={actionLoading === job.id}
                            className="btn-primary text-xs py-2 w-full"
                          >
                            {actionLoading === job.id ? 'Updating...' : nextAction.label}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Available jobs */}
              {availableJobs.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider">Available Jobs — Accept to Claim</h3>
                  {availableJobs.map((job) => (
                    <div key={job.id} className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-black text-slate-900 text-sm">{job.service?.name || 'Service Booking'}</p>
                          <p className="text-xs text-slate-600 mt-0.5">
                            <MapPin className="inline w-3 h-3 mr-0.5" />{job.location?.area}
                            <span className="mx-2">·</span>
                            <Clock className="inline w-3 h-3 mr-0.5" />{job.preferredDate} {job.preferredTimeSlot}
                          </p>
                          {job.urgency === 'EMERGENCY' && (
                            <span className="text-[10px] font-black text-red-600 bg-red-100 px-2 py-0.5 rounded-full mt-1 inline-block">🚨 Emergency</span>
                          )}
                        </div>
                        <button
                          onClick={() => acceptJob(job.id)}
                          disabled={actionLoading === job.id || profile?.verificationStatus !== 'VERIFIED'}
                          className="shrink-0 btn-primary text-xs py-2 px-4"
                        >
                          {actionLoading === job.id ? '...' : 'Accept Job'}
                        </button>
                      </div>
                      {job.description && <p className="text-xs text-slate-600 line-clamp-2">{job.description}</p>}
                    </div>
                  ))}
                </div>
              )}

              {myActiveJobs.length === 0 && availableJobs.length === 0 && (
                <div className="bg-white rounded-3xl border border-slate-100 p-10 text-center text-sm text-slate-500 space-y-2">
                  <Wrench className="w-10 h-10 text-slate-300 mx-auto" />
                  <p>No jobs at the moment. Check back soon!</p>
                </div>
              )}

              {/* Completed */}
              {completedJobs.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider">Completed Jobs</h3>
                  {completedJobs.slice(0, 5).map((job) => (
                    <div key={job.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-black text-slate-900">{job.service?.name || 'Service'}</p>
                        <p className="text-[10px] text-slate-500">{new Date(job.updatedAt).toLocaleDateString('en-BD')}</p>
                      </div>
                      <div className="text-right">
                        {job.technicianEarning > 0 && (
                          <p className="text-sm font-black text-emerald-600">৳{job.technicianEarning?.toLocaleString()}</p>
                        )}
                        <span className="text-[10px] font-bold text-emerald-600">Completed</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {!loading && activeTab === 'earnings' && (
            <div className="space-y-6">
              <h2 className="text-lg font-black text-slate-900">Earnings</h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Total Earned', value: `৳${totalEarned.toLocaleString()}`, color: 'text-emerald-600 bg-emerald-50', icon: DollarSign },
                  { label: 'Jobs Done', value: completedJobs.length, color: 'text-brand-600 bg-brand-50', icon: CheckCircle2 },
                  { label: 'Avg per Job', value: completedJobs.length > 0 ? `৳${Math.round(totalEarned / completedJobs.length).toLocaleString()}` : '—', color: 'text-purple-600 bg-purple-50', icon: TrendingUp },
                ].map(({ label, value, color, icon: Icon }) => (
                  <div key={label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-2">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <p className="text-2xl font-black text-slate-900">{value}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{label}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-50">
                  <h3 className="font-black text-slate-900 text-sm">Earning History</h3>
                </div>
                {completedJobs.length === 0 ? (
                  <div className="p-10 text-center text-xs text-slate-500">No completed jobs yet.</div>
                ) : completedJobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between px-5 py-3.5 border-b border-slate-50 last:border-0">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{job.service?.name || 'Service'}</p>
                      <p className="text-[10px] text-slate-400">{new Date(job.updatedAt).toLocaleDateString('en-BD', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <span className="text-sm font-black text-emerald-600">
                      {job.technicianEarning > 0 ? `৳${job.technicianEarning.toLocaleString()}` : 'Quote-based'}
                    </span>
                  </div>
                ))}
              </div>

              <div className="bg-brand-50 border border-brand-200 rounded-2xl p-4 text-xs text-brand-800 space-y-1">
                <p className="font-bold">💡 Payment Policy</p>
                <p>Earnings are credited to your wallet after a job is marked Completed and the customer confirms. Withdrawals processed every week via bKash or Nagad. Contact admin for queries.</p>
              </div>
            </div>
          )}

          {!loading && activeTab === 'profile' && (
            <div className="space-y-4">
              <h2 className="text-lg font-black text-slate-900">My Profile</h2>
              {!profile ? (
                <div className="bg-white rounded-3xl border border-slate-100 p-8 text-center space-y-3">
                  <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
                  <p className="font-black text-slate-900">Profile not set up yet</p>
                  <Link href="/technician/register" className="btn-primary text-xs py-2">Complete Technician Profile</Link>
                </div>
              ) : (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-black text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${STATUS_COLORS[profile.verificationStatus] || 'bg-slate-100 text-slate-600'}`}>
                      {profile.verificationStatus?.replace(/_/g, ' ')}
                    </span>
                  </div>
                  {profile.bio && <p className="text-xs text-slate-600">{profile.bio}</p>}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Rating</p>
                      <p className="font-black text-slate-900">⭐ {(profile.rating || 0).toFixed(1)} ({profile.ratingCount || 0})</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Experience</p>
                      <p className="font-black text-slate-900">{profile.yearsOfExperience || 0} years</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Jobs Completed</p>
                      <p className="font-black text-slate-900">{profile.totalJobsCompleted || 0}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Hourly Rate</p>
                      <p className="font-black text-slate-900">{profile.hourlyRate ? `৳${profile.hourlyRate}` : 'Quote-based'}</p>
                    </div>
                  </div>
                  {profile.skills?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Skills</p>
                      <div className="flex flex-wrap gap-1.5">
                        {profile.skills.map((s: string) => (
                          <span key={s} className="text-[10px] font-bold bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
