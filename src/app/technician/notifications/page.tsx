'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import {
  Bell, CheckCircle2, AlertCircle, RefreshCw,
  ExternalLink, MailOpen, Clock
} from 'lucide-react';

export default function TechnicianNotificationsPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/technician/login?redirect=/technician/notifications');
      return;
    }
    loadNotifications();
  }, [user]);

  const loadNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/v1/technicians/notifications');
      if (!res.ok) throw new Error('Failed to load notifications');
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {
      setError('Could not fetch notifications.');
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    setMarking(true);
    try {
      const res = await fetch('/api/v1/technicians/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      });
      if (res.ok) {
        await loadNotifications();
      }
    } catch {
      // ignore
    } finally {
      setMarking(false);
    }
  };

  const markOneAsRead = async (id: string) => {
    try {
      await fetch('/api/v1/technicians/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // ignore
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-brand-500" /> Notifications &amp; Alerts
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Dispatch announcements, verification decisions, job completions, and wallet payout confirmations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadNotifications}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              disabled={marking}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 text-brand-700 hover:bg-brand-100 rounded-xl text-xs font-bold transition shadow-xs"
            >
              <MailOpen className="w-3.5 h-3.5" /> Mark All as Read
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500 space-y-2">
          <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto" />
          <p>Loading notification feed...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <Bell className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-black text-slate-800">No Notifications</h3>
          <p className="text-xs text-slate-400">You are all caught up with your dispatches and payments.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden divide-y divide-slate-100">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.isRead && markOneAsRead(n.id)}
              className={`p-5 flex items-start gap-4 transition ${
                n.isRead ? 'bg-white hover:bg-slate-50/50' : 'bg-brand-50/30 hover:bg-brand-50/60'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${
                  n.isRead ? 'bg-slate-100 text-slate-500' : 'bg-brand-500 text-white shadow-xs'
                }`}
              >
                <Bell className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900">{n.title}</h4>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {new Date(n.createdAt).toLocaleDateString('en-BD', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                {n.link && (
                  <Link
                    href={n.link}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-600 hover:underline pt-1"
                  >
                    View Details <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
