"use client";

import React, { useState, useEffect } from "react";
import {
  Bell,
  Search,
  Filter,
  CheckCheck,
  CheckCircle2,
  Trash2,
  Send,
  Plus,
  RefreshCw,
  ShoppingBag,
  Wrench,
  Wallet,
  LifeBuoy,
  ShieldAlert,
  ExternalLink,
  X,
  Mail
} from "lucide-react";
import Link from "next/link";

interface AdminNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  link?: string | null;
  createdAt: string;
  user?: {
    name: string;
    email: string;
    role: string;
  };
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Broadcast form state
  const [broadcastForm, setBroadcastForm] = useState({
    title: "",
    message: "",
    type: "SYSTEM",
    targetRole: "ALL",
    link: "/admin",
  });

  const fetchNotifications = async (type = activeTab) => {
    setLoading(true);
    try {
      const url = type === "ALL" ? "/api/v1/admin/notifications" : `/api/v1/admin/notifications?type=${type}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [activeTab]);

  const handleToggleRead = async (id: string, currentRead: boolean) => {
    const nextRead = !currentRead;
    try {
      const res = await fetch("/api/v1/admin/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, read: nextRead }),
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: nextRead } : n))
        );
        setUnreadCount((c) => (nextRead ? Math.max(0, c - 1) : c + 1));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    handleToggleRead(id, false);
  };

  const handleMarkAllAsRead = async () => {
    try {
      const res = await fetch("/api/v1/admin/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllAsRead: true }),
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/admin/notifications?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/v1/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(broadcastForm),
      });
      if (res.ok) {
        setIsBroadcastModalOpen(false);
        setBroadcastForm({
          title: "",
          message: "",
          type: "SYSTEM",
          targetRole: "ALL",
          link: "/admin",
        });
        fetchNotifications();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const filtered = notifications.filter((n) => {
    return (
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (n.user?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "BOOKING":
        return <Wrench className="w-4 h-4 text-[#008CFF]" />;
      case "ORDER":
        return <ShoppingBag className="w-4 h-4 text-purple-600" />;
      case "WALLET":
        return <Wallet className="w-4 h-4 text-emerald-600" />;
      case "SUPPORT":
        return <LifeBuoy className="w-4 h-4 text-amber-600" />;
      default:
        return <Bell className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Bell className="w-7 h-7 text-[#008CFF]" />
            Notifications & Dispatch Alerts
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time activity feed across orders, electrician job dispatches, wallet payouts, and support tickets.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
            >
              <CheckCheck className="w-4 h-4 text-blue-600" />
              Mark all as read
            </button>
          )}
          <button
            onClick={() => setIsBroadcastModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#008CFF] text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition shadow-sm"
          >
            <Send className="w-4 h-4" />
            Broadcast Alert
          </button>
          <button
            onClick={() => fetchNotifications(activeTab)}
            className="p-2 border border-slate-300 rounded-lg text-slate-700 bg-white hover:bg-slate-50 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Type Filter Pills */}
      <div className="flex border-b border-slate-200 bg-white rounded-xl p-1.5 shadow-sm overflow-x-auto gap-1">
        {[
          { key: "ALL", label: "All Alerts" },
          { key: "BOOKING", label: "Service Bookings" },
          { key: "ORDER", label: "Store Orders" },
          { key: "WALLET", label: "Payouts & Wallet" },
          { key: "SUPPORT", label: "Customer Support" },
          { key: "SYSTEM", label: "System Alerts" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              activeTab === tab.key
                ? "bg-[#008CFF] text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter notifications by keywords..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#008CFF]"
            />
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="text-center py-12 text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#008CFF]" />
              Loading notifications...
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              No notifications found in this view.
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className={`p-4 flex items-start justify-between gap-4 transition hover:bg-slate-50/80 ${
                  !item.read ? "bg-blue-50/40" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs mt-0.5">
                    {getTypeIcon(item.type)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-sm">{item.title}</h3>
                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-[#008CFF]" />
                      )}
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider px-2 py-0.5 rounded bg-slate-100">
                        {item.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                      {item.message}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                      <span>{new Date(item.createdAt).toLocaleString("en-GB")}</span>
                      {item.user && (
                        <>
                          <span>•</span>
                          <span>Recipient: {item.user.name} ({item.user.role})</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {item.link && (
                    <Link
                      href={item.link}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#008CFF] hover:underline px-2.5 py-1.5 rounded-md hover:bg-blue-50"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      View
                    </Link>
                  )}
                  <button
                    onClick={() => handleToggleRead(item.id, item.read)}
                    className={`p-1.5 rounded-lg transition ${
                      item.read
                        ? "text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                        : "text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                    }`}
                    title={item.read ? "Mark as unread" : "Mark as read"}
                  >
                    {item.read ? <Mail className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                    title="Delete notification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Broadcast Modal */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Send className="w-5 h-5 text-[#008CFF]" />
                Send Broadcast Notification
              </h2>
              <button onClick={() => setIsBroadcastModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendBroadcast} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Audience</label>
                <select
                  value={broadcastForm.targetRole}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, targetRole: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                >
                  <option value="ALL">All Active Users & Technicians</option>
                  <option value="TECHNICIAN">Electricians & Technicians Only</option>
                  <option value="CUSTOMER">Customers Only</option>
                  <option value="ADMIN">Administrators & Staff</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Alert Category</label>
                <select
                  value={broadcastForm.type}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, type: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                >
                  <option value="SYSTEM">System Announcement</option>
                  <option value="BOOKING">Service Dispatch Update</option>
                  <option value="ORDER">Promotional / Store Notice</option>
                  <option value="WALLET">Financial / Payout Alert</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notification Title *</label>
                <input
                  type="text"
                  required
                  value={broadcastForm.title}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                  placeholder="e.g. Moulvibazar Service Area Update"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Message Content *</label>
                <textarea
                  rows={3}
                  required
                  value={broadcastForm.message}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                  placeholder="Write message to deliver to user dashboards..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Action Link (Optional)</label>
                <input
                  type="text"
                  value={broadcastForm.link}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, link: e.target.value })}
                  placeholder="e.g. /admin/jobs or /services"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBroadcastModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#008CFF] text-white rounded-lg text-sm font-semibold hover:bg-blue-600 shadow-sm"
                >
                  {saving ? "Sending..." : "Send Alert"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
