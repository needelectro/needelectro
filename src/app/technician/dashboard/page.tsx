'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  Wrench, MapPin, Clock, CheckCircle2, DollarSign,
  Star, Wallet, BarChart2, LogOut, Bell, ChevronRight, Zap,
  AlertCircle, Package, User, TrendingUp, Radio, LifeBuoy,
  ShieldCheck, ArrowUpRight, Calendar
} from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: 'bg-amber-100 text-amber-800',
  ACCEPTED: 'bg-brand-100 text-brand-800',
  ON_THE_WAY: 'bg-purple-100 text-purple-800',
  ARRIVED: 'bg-indigo-100 text-indigo-800',
  WORK_STARTED: 'bg-orange-100 text-orange-800',
  COMPLETED: 'bg-emerald-100 text-emerald-800',
  WORK_COMPLETED: 'bg-emerald-100 text-emerald-800',
  CLOSED: 'bg-slate-100 text-slate-700',
  CANCELLED: 'bg-red-100 text-red-700',
  PENDING: 'bg-amber-100 text-amber-800',
  VERIFIED: 'bg-emerald-100 text-emerald-800',
  UNDER_REVIEW: 'bg-blue-100 text-blue-800',
  SUSPENDED: 'bg-red-100 text-red-800',
};

export default function TechnicianDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [availableJobs, setAvailableJobs] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [loading, setLoading] = useState(true);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/technician/login?redirect=/technician/dashboard');
      return;
    }
    if (user.role !== 'TECHNICIAN' && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      router.push('/customer/dashboard');
      return;
    }
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pRes, jRes, aRes, nRes] = await Promise.all([
        fetch('/api/v1/technicians/me'),
        fetch('/api/v1/bookings?role=technician'),
        fetch('/api/v1/bookings?status=AVAILABLE'),
        fetch('/api/v1/technicians/notifications'),
      ]);

      if (pRes.ok) {
        const d = await pRes.json();
        setProfile(d.technician);
      }
      if (jRes.ok) {
        const d = await jRes.json();
        setJobs(d.bookings || []);
      }
      if (aRes.ok) {
        const d = await aRes.json();
        setAvailableJobs(d.bookings || []);
      }
      if (nRes.ok) {
        const d = await nRes.json();
        setNotifications(d.notifications?.slice(0, 3) || []);
        setUnreadNotifications(d.unreadCount || 0);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async () => {
    if (!profile) return;
    setTogglingStatus(true);
    const nextStatus = profile.availableStatus === 'AVAILABLE' ? 'OFFLINE' : 'AVAILABLE';
    try {
      const res = await fetch('/api/v1/technicians/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availableStatus: nextStatus }),
      });
      if (res.ok) {
        setProfile((prev: any) => ({ ...prev, availableStatus: nextStatus }));
      }
    } catch {
      // ignore
    } finally {
      setTogglingStatus(false);
    }
  };

  const acceptJob = async (bookingId: string) => {
    setActionLoading(bookingId);
    try {
      const res = await fetch(`/api/v1/bookings/${bookingId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        router.push(`/technician/jobs/${bookingId}`);
      } else {
        await loadData();
      }
    } catch {
      // ignore
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (!user) return null;

  const myActiveJobs = jobs.filter(
    (j) => !['CLOSED', 'CANCELLED', 'WORK_COMPLETED', 'COMPLETED'].includes(j.status)
  );
  const completedJobs = jobs.filter((j) =>
    ['WORK_COMPLETED', 'COMPLETED', 'CLOSED'].includes(j.status)
  );

  // Calculate Profile Completion %
  let profileCompletion = 40;
  if (profile?.nidNumber) profileCompletion += 20;
  if (profile?.bio) profileCompletion += 15;
  if (profile?.emergencyPhone) profileCompletion += 10;
  if (profile?.verificationStatus === 'VERIFIED') profileCompletion += 15;
  profileCompletion = Math.min(100, profileCompletion);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Bar Navigation Hub */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 p-1.5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-brand-300 transition"
          >
            <Image
              src="/logo.png"
              alt="NEED ELECTRO"
              width={140}
              height={70}
              className="h-7 w-auto object-contain"
            />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Technician Portal
              </h1>
              <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                PRO
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Welcome back, <span className="font-bold text-slate-800">{user.name}</span> · {profile?.serviceAreas || 'Bangladesh Network'}
            </p>
          </div>
        </div>

        {/* Live Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleToggleAvailability}
            disabled={togglingStatus}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-black border transition shadow-xs ${
              profile?.availableStatus === 'AVAILABLE'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
            }`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                profile?.availableStatus === 'AVAILABLE'
                  ? 'bg-emerald-500 animate-pulse'
                  : 'bg-slate-400'
              }`}
            />
            {profile?.availableStatus === 'AVAILABLE' ? 'Online: Accepting Jobs' : 'Offline: Resting'}
          </button>

          <Link
            href="/technician/notifications"
            className="p-2.5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition relative shadow-xs"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">
                {unreadNotifications}
              </span>
            )}
          </Link>

          <button
            onClick={handleLogout}
            className="p-2.5 rounded-2xl bg-white border border-slate-200 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition shadow-xs"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Verification Alert Banner */}
      {profile && profile.verificationStatus !== 'VERIFIED' && (
        <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <h3 className="font-black text-sm">Account Verification In Progress ({profile.verificationStatus})</h3>
              <p className="text-xs text-amber-900/80">
                Your NID and electrical credentials are under review by NEED ELECTRO technical management.
                Full job dispatch unlocks immediately upon approval.
              </p>
            </div>
          </div>
          <Link
            href="/technician/profile"
            className="btn-primary text-xs py-2 px-4 shrink-0 shadow-xs"
          >
            Review Profile Documents
          </Link>
        </div>
      )}

      {/* Layout Grid */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Sidebar Navigation */}
        <aside className="lg:w-64 space-y-4 shrink-0">
          <div className="glass-card-dark rounded-3xl p-5 text-white space-y-3 relative overflow-hidden shadow-xl border border-white/10">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-xl font-black shadow-inner">
              {user.name.charAt(0)}
            </div>
            <div>
              <p className="font-black text-sm">{user.name}</p>
              <p className="text-xs text-slate-400">{user.email}</p>
              {profile && (
                <span
                  className={`inline-block mt-2 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase backdrop-blur-sm border border-white/10 ${
                    STATUS_COLORS[profile.verificationStatus] || 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {profile.verificationStatus?.replace(/_/g, ' ') || 'Pending Review'}
                </span>
              )}
            </div>

            {/* Profile Completion Bar */}
            <div className="pt-2 border-t border-white/10 space-y-1 text-xs">
              <div className="flex justify-between text-[11px] text-slate-300">
                <span>Profile Completion</span>
                <span className="font-bold">{profileCompletion}%</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-400 h-full rounded-full transition-all"
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>
            </div>

            {profile && (
              <div className="text-xs text-slate-300 space-y-0.5 pt-1">
                <p>⭐ {(profile.ratingOverall || 5.0).toFixed(1)} Rating</p>
                <p>✅ {profile.totalCompletedJobs || 0} jobs completed</p>
              </div>
            )}
          </div>

          {/* Quick Route Menu */}
          <nav className="glass-card rounded-3xl shadow-xs overflow-hidden divide-y divide-slate-100">
            {[
              { href: '/technician/dashboard', label: 'Dashboard Overview', icon: BarChart2, active: true },
              { href: '/technician/jobs', label: 'Job Marketplace', icon: Wrench, badge: myActiveJobs.length },
              { href: '/technician/earnings', label: 'Earnings & Payouts', icon: Wallet },
              { href: '/technician/availability', label: 'Working Schedule', icon: Clock },
              { href: '/technician/profile', label: 'Profile Settings', icon: User },
              { href: '/technician/reviews', label: 'Customer Reviews', icon: Star },
              { href: '/technician/support', label: 'Support & Disputes', icon: LifeBuoy },
            ].map(({ href, label, icon: Icon, badge, active }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center justify-between px-4 py-3 text-xs font-bold transition ${
                  active ? 'text-brand-600 bg-brand-50/50' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-brand-500" />
                  {label}
                </span>
                {badge != null && badge > 0 && (
                  <span className="bg-brand-500 text-white text-[10px] font-black rounded-full px-2 py-0.5">
                    {badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Emergency Hotline Box */}
          <div className="p-4 bg-slate-900 text-white rounded-3xl space-y-2 text-xs shadow-md">
            <p className="font-bold flex items-center gap-1.5 text-brand-400">
              <Zap className="w-3.5 h-3.5" /> Dispatch Helpdesk
            </p>
            <p className="text-[11px] text-slate-300">
              Direct hotline for on-site assistance or customer location emergencies.
            </p>
            <a
              href="tel:01733983752"
              className="font-mono font-bold text-white block hover:text-brand-300"
            >
              📞 01733-983752
            </a>
          </div>
        </aside>

        {/* Main Workspace Column */}
        <main className="flex-1 space-y-6 min-w-0">
          {loading && (
            <div className="flex items-center justify-center h-48">
              <div className="w-8 h-8 border-4 border-slate-200 border-t-brand-600 rounded-full animate-spin" />
            </div>
          )}

          {!loading && (
            <>
              {/* Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  {
                    label: 'Available Offers',
                    value: availableJobs.length,
                    icon: Zap,
                    color: 'text-amber-600 bg-amber-50',
                    link: '/technician/jobs',
                  },
                  {
                    label: 'Active Dispatches',
                    value: myActiveJobs.length,
                    icon: Wrench,
                    color: 'text-brand-600 bg-brand-50',
                    link: '/technician/jobs',
                  },
                  {
                    label: 'Completed Jobs',
                    value: profile?.totalCompletedJobs || completedJobs.length,
                    icon: CheckCircle2,
                    color: 'text-emerald-600 bg-emerald-50',
                    link: '/technician/jobs',
                  },
                  {
                    label: 'Wallet Balance',
                    value: `৳${(profile?.walletBalance || 0).toLocaleString()}`,
                    icon: Wallet,
                    color: 'text-purple-600 bg-purple-50',
                    link: '/technician/earnings',
                  },
                ].map(({ label, value, icon: Icon, color, link }) => (
                  <Link
                    key={label}
                    href={link}
                    className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-2 hover:border-brand-300 transition group"
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <p className="text-2xl font-black text-slate-900 group-hover:text-brand-600 transition">
                      {value}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      {label}
                    </p>
                  </Link>
                ))}
              </div>

              {/* Active Jobs in Progress */}
              {myActiveJobs.length > 0 && (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden space-y-3 p-6">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-brand-500" /> Current Active Jobs
                    </h3>
                    <Link
                      href="/technician/jobs"
                      className="text-xs text-brand-600 font-bold hover:underline"
                    >
                      View All ({myActiveJobs.length})
                    </Link>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {myActiveJobs.map((job) => (
                      <div
                        key={job.id}
                        className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">
                              {job.service?.name || job.service?.title || 'Service Booking'}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                STATUS_COLORS[job.status] || 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {job.status?.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {job.address?.addressLine || job.location?.area || 'Moulvibazar'}
                          </p>
                        </div>

                        <Link
                          href={`/technician/jobs/${job.id}`}
                          className="btn-primary text-xs py-2 px-4 self-start sm:self-auto flex items-center gap-1.5 shadow-xs"
                        >
                          Open Job Workspace <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Available Job Offers Preview */}
              {availableJobs.length > 0 && (
                <div className="bg-amber-50/50 border border-amber-200 rounded-3xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-amber-200">
                    <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-500" /> Live Job Offers Near You
                    </h3>
                    <Link
                      href="/technician/jobs"
                      className="text-xs text-brand-600 font-bold hover:underline"
                    >
                      View All Offers
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {availableJobs.slice(0, 4).map((job) => (
                      <div
                        key={job.id}
                        className="bg-white p-4 rounded-2xl border border-amber-100 shadow-xs space-y-3"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-xs text-slate-900 line-clamp-1">
                              {job.service?.name || job.service?.title || 'Electrical Repair'}
                            </h4>
                            <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {job.address?.upazila || job.location?.area || 'Moulvibazar'}
                            </p>
                          </div>
                          <span className="font-black text-xs text-emerald-600">
                            ৳{Math.round((job.totalAmount || 0) * 0.85).toLocaleString()}
                          </span>
                        </div>

                        <button
                          onClick={() => acceptJob(job.id)}
                          disabled={actionLoading === job.id || profile?.verificationStatus !== 'VERIFIED'}
                          className="btn-primary w-full text-xs py-1.5 flex items-center justify-center gap-1.5 disabled:opacity-50"
                        >
                          {actionLoading === job.id ? 'Accepting...' : 'Accept Job'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions Shortcuts */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
                <h3 className="font-black text-slate-900 text-sm">Technician Shortcuts</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Browse Jobs', href: '/technician/jobs', icon: Wrench },
                    { label: 'Wallet & Payouts', href: '/technician/earnings', icon: Wallet },
                    { label: 'My Availability', href: '/technician/availability', icon: Clock },
                    { label: 'Support Desk', href: '/technician/support', icon: LifeBuoy },
                  ].map(({ label, href, icon: Icon }) => (
                    <Link
                      key={label}
                      href={href}
                      className="p-3.5 rounded-2xl bg-slate-50 hover:bg-brand-50 hover:text-brand-700 text-slate-700 font-bold text-xs flex flex-col items-center gap-2 text-center transition border border-slate-100"
                    >
                      <Icon className="w-5 h-5 text-brand-500" />
                      <span>{label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
