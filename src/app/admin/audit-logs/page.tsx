"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  Search,
  Filter,
  Clock,
  User,
  Activity,
  RefreshCw,
  FileText
} from "lucide-react";

interface AuditLog {
  id: string;
  userId?: string | null;
  userRole?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  previousData?: string | null;
  newData?: string | null;
  ipAddress?: string | null;
  createdAt: string;
  user?: {
    name: string;
    email: string;
    role: string;
  };
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/audit-logs");
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.user?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.user?.email || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction = actionFilter === "ALL" || log.action === actionFilter;

    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-7 h-7 text-[#008CFF]" />
            System Audit & Compliance Logs
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Immutable tracking of administrator actions, stock adjustments, order modifications, and dispatch operations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchLogs}
            className="inline-flex items-center gap-2 px-3.5 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by action, entity name, or operator..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#008CFF]"
          />
        </div>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-700"
        >
          <option value="ALL">All Actions</option>
          <option value="CREATE">CREATE</option>
          <option value="UPDATE">UPDATE</option>
          <option value="DELETE">DELETE</option>
          <option value="DISPATCH">DISPATCH</option>
          <option value="STATUS_CHANGE">STATUS_CHANGE</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Operator</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Entity Affected</th>
                <th className="px-4 py-3">Details / Diff</th>
                <th className="px-4 py-3 text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#008CFF]" />
                    Loading audit trail...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    No audit records logged yet.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString("en-GB")}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900">{log.user?.name || "System Automated"}</div>
                      <div className="text-xs text-slate-400">{log.userRole || log.user?.role || "SYSTEM"}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 text-xs font-mono font-bold bg-slate-100 rounded text-slate-800 border border-slate-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-900">
                      {log.entity} {log.entityId && <span className="font-mono text-xs text-slate-400">#{log.entityId.substring(0, 8)}</span>}
                    </td>
                    <td className="px-4 py-3.5 max-w-xs text-xs text-slate-600 font-mono truncate">
                      {log.newData || log.previousData || "Recorded"}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-xs text-slate-400">
                      {log.ipAddress || "127.0.0.1"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
