"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  UserPlus,
  Search,
  Lock,
  Mail,
  Phone,
  User,
  Key,
  RefreshCw,
  X,
  CheckCircle2,
  Ban
} from "lucide-react";
import { ROLE_PERMISSIONS, OperationalRole } from "@/lib/permissions";

interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: OperationalRole;
  status: string;
  createdAt: string;
}

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Add form
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "ADMIN" as OperationalRole,
    password: "",
  });

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/staff");
      if (res.ok) {
        const data = await res.json();
        setStaff(data.staff || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/v1/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setIsAddModalOpen(false);
        setFormData({
          name: "",
          email: "",
          phone: "",
          role: "ADMIN",
          password: "",
        });
        fetchStaff();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create staff member");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      const res = await fetch("/api/v1/admin/staff", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, status: newStatus }),
      });
      if (res.ok) {
        fetchStaff();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredStaff = staff.filter((s) => {
    return (
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-[#008CFF]" />
            Staff & RBAC Permissions
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Enterprise role-based access control, operator privileges, and system administrator security.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#008CFF] text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            Add Staff Member
          </button>
          <button
            onClick={fetchStaff}
            className="p-2 border border-slate-300 rounded-lg text-slate-700 bg-white hover:bg-slate-50 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search staff by name, email, or role..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#008CFF]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Staff Name</th>
                <th className="px-4 py-3">Email & Contact</th>
                <th className="px-4 py-3">Assigned Role</th>
                <th className="px-4 py-3">Capabilities / Modules</th>
                <th className="px-4 py-3">Account Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#008CFF]" />
                    Loading staff members...
                  </td>
                </tr>
              ) : filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    No staff members match the criteria.
                  </td>
                </tr>
              ) : (
                filteredStaff.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900">{member.name}</div>
                      <div className="text-xs text-slate-400">User ID: #{member.id.substring(0, 8)}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="text-xs text-slate-700 flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400" /> {member.email}
                      </div>
                      {member.phone && (
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" /> {member.phone}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-[#002B5B] text-white">
                        {member.role.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 max-w-xs">
                      <span className="text-xs text-slate-600">
                        {ROLE_PERMISSIONS[member.role]?.length || 0} permissions granted
                      </span>
                      <div className="text-[11px] text-slate-400 truncate">
                        {ROLE_PERMISSIONS[member.role]?.slice(0, 3).join(", ")}...
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                          member.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        {member.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => handleToggleStatus(member.id, member.status)}
                        className={`px-2.5 py-1.5 rounded-md text-xs font-semibold border ${
                          member.status === "ACTIVE"
                            ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                        }`}
                      >
                        {member.status === "ACTIVE" ? "Suspend" : "Re-activate"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#008CFF]" />
                New Staff Account
              </h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Mahfuzur Rahman"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. staff@needelectro.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. 01733 983752"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Operational Role & Scope *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as OperationalRole })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                >
                  <option value="SUPER_ADMIN">SUPER_ADMIN (Full Access)</option>
                  <option value="ADMIN">ADMIN (System Operations)</option>
                  <option value="SERVICE_MANAGER">SERVICE_MANAGER (Jobs & Technicians)</option>
                  <option value="INVENTORY_MANAGER">INVENTORY_MANAGER (Stock & Warehouses)</option>
                  <option value="ACCOUNTANT">ACCOUNTANT (Finance & EMI)</option>
                  <option value="DISPATCHER">DISPATCHER (Job Scheduling)</option>
                  <option value="SUPPORT_AGENT">SUPPORT_AGENT (Customer Tickets)</option>
                  <option value="BRANCH_OPERATOR">BRANCH_OPERATOR (Storefront Counter)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Temporary Password *</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="At least 6 characters"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#008CFF] text-white rounded-lg text-sm font-semibold hover:bg-blue-600 shadow-sm"
                >
                  {saving ? "Creating..." : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
