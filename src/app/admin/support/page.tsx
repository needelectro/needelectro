"use client";

import React, { useState, useEffect } from "react";
import {
  LifeBuoy,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageSquare,
  RefreshCw,
  Send,
  X,
  User,
  ShieldAlert,
  Lock
} from "lucide-react";

interface Ticket {
  id: string;
  ticketNumber: string;
  userId: string;
  category: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  adminReply?: string | null;
  conversation?: any[];
  createdAt: string;
  user?: {
    name: string;
    email: string;
    phone?: string | null;
    role: string;
  };
}

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [replyStatus, setReplyStatus] = useState("RESOLVED");
  const [replyPriority, setReplyPriority] = useState("NORMAL");
  const [saving, setSaving] = useState(false);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/support");
      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleOpenTicket = async (t: Ticket) => {
    setSelectedTicket(t);
    setReplyText("");
    setIsInternalNote(false);
    setReplyStatus(t.status === "OPEN" ? "IN_PROGRESS" : t.status);
    setReplyPriority(t.priority || "NORMAL");

    if (t.status === "OPEN") {
      try {
        await fetch("/api/v1/admin/support", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ticketId: t.id, markAsRead: true }),
        });
        setTickets((prev) =>
          prev.map((item) => (item.id === t.id ? { ...item, status: "IN_PROGRESS" } : item))
        );
      } catch (err) {}
    }
  };

  const handleMarkAllTicketsRead = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/v1/admin/support", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllAsRead: true }),
      });
      const data = await res.json();
      if (data.success) {
        setTickets((prev) =>
          prev.map((t) => (t.status === "OPEN" ? { ...t, status: "IN_PROGRESS" } : t))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleTicketRead = async (t: Ticket) => {
    const isCurrentlyOpen = t.status === "OPEN";
    setSaving(true);
    try {
      const res = await fetch("/api/v1/admin/support", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: t.id,
          markAsRead: isCurrentlyOpen,
          markAsUnread: !isCurrentlyOpen,
        }),
      });
      const data = await res.json();
      if (data.success && data.ticket) {
        setTickets((prev) => prev.map((item) => (item.id === t.id ? data.ticket : item)));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateTicket = async (ticketId: string, updates: Partial<Ticket>) => {
    setSaving(true);
    try {
      const res = await fetch("/api/v1/admin/support", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId, ...updates }),
      });
      if (res.ok) {
        const data = await res.json();
        if (selectedTicket && data.ticket) {
          setSelectedTicket(data.ticket);
        }
        fetchTickets();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleSendReply = async () => {
    if (!selectedTicket || !replyText.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/v1/admin/support", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: selectedTicket.id,
          adminReply: replyText,
          status: replyStatus,
          priority: replyPriority,
          isInternalNote,
          authorName: "NEED ELECTRO Support Team",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.ticket) {
          setSelectedTicket(data.ticket);
        }
        setReplyText("");
        fetchTickets();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.user?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.user?.email || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;
    const matchesPriority = priorityFilter === "ALL" || t.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case "URGENT":
        return <span className="px-2 py-0.5 text-xs font-bold rounded bg-rose-100 text-rose-700">Urgent</span>;
      case "HIGH":
        return <span className="px-2 py-0.5 text-xs font-bold rounded bg-amber-100 text-amber-700">High</span>;
      default:
        return <span className="px-2 py-0.5 text-xs font-medium rounded bg-slate-100 text-slate-700">Normal</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <LifeBuoy className="w-7 h-7 text-[#008CFF]" />
            Customer & Technician Support Tickets
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Resolve customer queries, warranty claims, service complaints, and disputes.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {tickets.filter((t) => t.status === "OPEN").length > 0 && (
            <button
              onClick={handleMarkAllTicketsRead}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-emerald-300 rounded-lg text-sm font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 transition shadow-xs"
              title="Mark all open tickets as read"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Mark All as Read ({tickets.filter((t) => t.status === "OPEN").length})
            </button>
          )}
          <button
            onClick={fetchTickets}
            className="inline-flex items-center gap-2 px-3.5 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Total Tickets</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{tickets.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/20 shadow-sm">
          <p className="text-xs font-medium text-rose-700">Open Tickets</p>
          <p className="text-2xl font-bold text-rose-800 mt-1">
            {tickets.filter((t) => t.status === "OPEN").length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-sm">
          <p className="text-xs font-medium text-amber-700">In Progress</p>
          <p className="text-2xl font-bold text-amber-800 mt-1">
            {tickets.filter((t) => t.status === "IN_PROGRESS").length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-sm">
          <p className="text-xs font-medium text-emerald-700">Resolved</p>
          <p className="text-2xl font-bold text-emerald-800 mt-1">
            {tickets.filter((t) => t.status === "RESOLVED").length}
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by ticket #, subject, or customer..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#008CFF]"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-700"
          >
            <option value="ALL">All Priorities</option>
            <option value="NORMAL">Normal</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Ticket # / Date</th>
                <th className="px-4 py-3">User & Category</th>
                <th className="px-4 py-3">Subject & Issue</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#008CFF]" />
                    Loading support tickets...
                  </td>
                </tr>
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    No support tickets match filters.
                  </td>
                </tr>
              ) : (
                filteredTickets.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-mono font-semibold text-xs text-slate-900">{t.ticketNumber}</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {new Date(t.createdAt).toLocaleDateString("en-GB")}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900">{t.user?.name || "User"}</div>
                      <span className="text-[10px] font-semibold text-[#008CFF] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {t.category}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 max-w-sm">
                      <div className="font-medium text-slate-900">{t.subject}</div>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{t.message}</p>
                    </td>
                    <td className="px-4 py-3.5">{getPriorityBadge(t.priority)}</td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                          t.status === "RESOLVED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : t.status === "OPEN"
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleToggleTicketRead(t)}
                        disabled={saving}
                        className={`p-1.5 rounded-lg text-xs font-bold transition inline-flex items-center gap-1 border mr-2 ${
                          t.status === "OPEN"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            : "border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                        }`}
                        title={t.status === "OPEN" ? "Mark ticket as Read" : "Mark ticket as Unread (Open)"}
                      >
                        <CheckCircle2 className={`w-3.5 h-3.5 ${t.status === "OPEN" ? "text-emerald-600" : "text-slate-400"}`} />
                        <span className="hidden sm:inline text-[11px]">{t.status === "OPEN" ? "Mark Read" : "Unread"}</span>
                      </button>

                      <button
                        onClick={() => handleOpenTicket(t)}
                        className="px-3 py-1.5 bg-[#008CFF] text-white hover:bg-blue-600 rounded-lg text-xs font-semibold transition"
                      >
                        Respond & Solve
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Details / Response Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700">
                    #{selectedTicket.ticketNumber}
                  </span>
                  <h2 className="text-base font-bold text-slate-900">
                    {selectedTicket.subject}
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  From: <strong>{selectedTicket.user?.name || "Customer"}</strong> ({selectedTicket.user?.email || "No email"}) {selectedTicket.user?.phone ? `• ${selectedTicket.user.phone}` : ""}
                </p>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Category, Priority & Status Control */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-medium">Category:</span>
                  <span className="font-bold text-slate-800 uppercase">{selectedTicket.category}</span>
                  <span className="text-slate-300">|</span>
                  <span className="text-slate-500 font-medium">Priority:</span>
                  <select
                    value={replyPriority}
                    onChange={(e) => setReplyPriority(e.target.value)}
                    className="font-bold text-slate-800 bg-white border border-slate-200 rounded px-2 py-0.5"
                  >
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-medium">Next Status:</span>
                  <select
                    value={replyStatus}
                    onChange={(e) => setReplyStatus(e.target.value)}
                    className="font-bold text-[#002B5B] bg-white border border-slate-200 rounded px-2 py-0.5"
                  >
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="WAITING_CUSTOMER">Waiting Customer</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>
              </div>

              {/* Initial Customer Request */}
              <div className="p-4 bg-slate-100 rounded-xl border border-slate-200 space-y-1">
                <div className="flex justify-between items-center text-xs text-slate-500 font-semibold uppercase">
                  <span>Initial Customer Inbound Message</span>
                  <span>{new Date(selectedTicket.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                </div>
                <p className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed pt-1">{selectedTicket.message}</p>
              </div>

              {/* Threaded History */}
              {selectedTicket.conversation && selectedTicket.conversation.length > 0 && (
                <div className="space-y-3 pt-1">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Response & Activity History ({selectedTicket.conversation.length})
                  </div>

                  {selectedTicket.conversation.map((msg: any, idx: number) => {
                    const isNote = msg.sender === "INTERNAL_NOTE";
                    return (
                      <div
                        key={msg.id || idx}
                        className={`p-3.5 rounded-xl border space-y-1 ${
                          isNote
                            ? "bg-amber-50/80 border-amber-200 text-amber-950"
                            : "bg-blue-50/60 border-blue-200 text-slate-900"
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            {isNote ? (
                              <span className="inline-flex items-center gap-1 font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded text-[10px]">
                                <Lock className="w-3 h-3" /> INTERNAL STAFF NOTE
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded text-[10px]">
                                <MessageSquare className="w-3 h-3" /> OFFICIAL STAFF REPLY
                              </span>
                            )}
                            <span className="font-semibold">{msg.senderName || "Staff Member"}</span>
                          </div>
                          <span className="text-[11px] opacity-70">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })}
                          </span>
                        </div>
                        <p className="text-xs whitespace-pre-wrap leading-relaxed">
                          {msg.message}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Response Composer */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700 uppercase">
                    Compose Resolution / Message
                  </label>

                  <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setIsInternalNote(false)}
                      className={`px-3 py-1 rounded-md transition ${
                        !isInternalNote
                          ? "bg-[#008CFF] text-white shadow-sm"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Customer Reply
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsInternalNote(true)}
                      className={`px-3 py-1 rounded-md transition flex items-center gap-1 ${
                        isInternalNote
                          ? "bg-amber-600 text-white shadow-sm"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <Lock className="w-3 h-3" />
                      Internal Note
                    </button>
                  </div>
                </div>

                <textarea
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={
                    isInternalNote
                      ? "Write private internal note (visible only to administrators and service staff)..."
                      : "Write official response to customer (triggers instant notification to user)..."
                  }
                  className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 transition ${
                    isInternalNote
                      ? "border-amber-300 focus:ring-amber-500 bg-amber-50/20"
                      : "border-slate-300 focus:ring-[#008CFF] bg-white"
                  }`}
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateTicket(selectedTicket.id, { status: "IN_PROGRESS" })}
                    disabled={saving}
                    className="px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-semibold hover:bg-amber-100 transition"
                  >
                    Mark In-Progress
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateTicket(selectedTicket.id, { status: "CLOSED" })}
                    disabled={saving}
                    className="px-3 py-1.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold hover:bg-slate-200 transition"
                  >
                    Close Ticket
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleSendReply}
                  disabled={saving || !replyText.trim()}
                  className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition disabled:opacity-50 flex items-center gap-1.5 ${
                    isInternalNote ? "bg-amber-600 hover:bg-amber-700" : "bg-[#008CFF] hover:bg-blue-600"
                  }`}
                >
                  <Send className={`w-3.5 h-3.5 ${saving ? "animate-spin" : ""}`} />
                  {saving ? "Saving..." : isInternalNote ? "Add Internal Note" : "Send Official Reply"}
                </button>
              </div>
            </div>

            <div className="flex justify-end px-6 py-3 bg-slate-50 border-t border-slate-100">
              <button
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
