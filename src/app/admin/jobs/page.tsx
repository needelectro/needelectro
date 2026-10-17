"use client";

import React, { useState, useEffect } from "react";
import {
  Wrench,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UserCheck,
  Calendar,
  MapPin,
  Phone,
  Eye,
  RefreshCw,
  X,
  User,
  Shield,
  Send
} from "lucide-react";

interface Job {
  id: string;
  serviceId: string;
  customerId: string;
  technicianId?: string | null;
  status: string;
  preferredDate: string;
  preferredTime: string;
  address: string;
  problemDescription: string;
  estimatedCost?: number | null;
  actualCost?: number | null;
  createdAt: string;
  service?: {
    id: string;
    title: string;
    basePrice: number;
    category: string;
  };
  customer?: {
    fullName: string;
    phone: string;
    district: string;
    user?: {
      email: string;
    };
  };
  technician?: {
    id: string;
    fullName: string;
    phone: string;
    district: string;
    rating: number;
    skills: string[];
    isAvailable: boolean;
  };
}

interface Technician {
  id: string;
  fullName: string;
  phone: string;
  district: string;
  rating: number;
  skills: string[];
  isAvailable: boolean;
  isVerified: boolean;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [districtFilter, setDistrictFilter] = useState("ALL");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedTechId, setSelectedTechId] = useState("");
  const [saving, setSaving] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/jobs");
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
        setTechnicians(data.technicians || []);
      }
    } catch (err) {
      console.error("Failed to load jobs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleAssign = async () => {
    if (!selectedJob || !selectedTechId) return;
    setSaving(true);
    try {
      const res = await fetch("/api/v1/admin/jobs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: selectedJob.id,
          technicianId: selectedTechId,
          status: "ASSIGNED",
        }),
      });
      if (res.ok) {
        setAssignModalOpen(false);
        fetchJobs();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (jobId: string, status: string, notes?: string) => {
    setSaving(true);
    try {
      const res = await fetch("/api/v1/admin/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_STATUS",
          bookingId: jobId,
          status,
          notes: notes || `Administrative status correction to ${status}`,
        }),
      });
      if (res.ok) {
        if (selectedJob) {
          setSelectedJob((prev) => prev ? { ...prev, status } : null);
        }
        fetchJobs();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleAutoAssign = async (jobId: string) => {
    setSaving(true);
    try {
      const res = await fetch("/api/v1/admin/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "AUTO_ASSIGN",
          bookingId: jobId,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert(data.message || "Auto-dispatch succeeded!");
        fetchJobs();
        if (selectedJob && selectedJob.id === jobId) {
          setSelectedJob((prev) => prev ? { ...prev, status: "ASSIGNED", technician: data.booking?.technician } : null);
        }
      } else {
        alert(data.message || data.error || "Auto-dispatch could not find an eligible technician.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to auto-dispatch job.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelBooking = async (jobId: string) => {
    const reason = window.prompt("Please enter administrative cancellation reason:");
    if (!reason || reason.trim().length < 3) return;
    setSaving(true);
    try {
      const res = await fetch("/api/v1/admin/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CANCEL_BOOKING",
          bookingId: jobId,
          reason: reason.trim(),
        }),
      });
      if (res.ok) {
        fetchJobs();
        if (selectedJob && selectedJob.id === jobId) {
          setSelectedJob((prev) => prev ? { ...prev, status: "CANCELLED" } : null);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleApproveCompletion = async (jobId: string) => {
    if (!confirm("Confirm approval of completion report and settle technician 85% revenue share?")) return;
    setSaving(true);
    try {
      const res = await fetch("/api/v1/admin/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "APPROVE_COMPLETION",
          bookingId: jobId,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || "Workmanship approved and earnings settled!");
        fetchJobs();
        if (selectedJob && selectedJob.id === jobId) {
          setSelectedJob((prev) => prev ? { ...prev, status: "COMPLETED" } : null);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const filteredJobs = jobs.filter((j) => {
    const matchesSearch =
      j.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ((j as any).bookingNumber || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (j.service?.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (j.customer?.fullName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (j.customer?.phone || "").includes(searchTerm) ||
      (j.address || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || j.status === statusFilter;
    const matchesDistrict = districtFilter === "ALL" || j.customer?.district === districtFilter;

    return matchesSearch && matchesStatus && matchesDistrict;
  });

  const districts = Array.from(new Set(jobs.map((j) => j.customer?.district).filter(Boolean)));

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
      case "REQUESTED":
      case "MATCHING":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-200">Pending Dispatch</span>;
      case "ASSIGNED":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 border border-purple-200">Assigned</span>;
      case "ACCEPTED":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-200">Accepted</span>;
      case "ON_THE_WAY":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">En Route</span>;
      case "ARRIVED":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-sky-100 text-sky-800 border border-sky-200">Arrived at Site</span>;
      case "INSPECTION_STARTED":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-cyan-100 text-cyan-800 border border-cyan-200">Inspection</span>;
      case "AWAITING_APPROVAL":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">Awaiting Approval</span>;
      case "IN_PROGRESS":
      case "WORK_STARTED":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800 border border-orange-200">In Progress</span>;
      case "ON_HOLD":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-100 text-rose-800 border border-rose-200">On Hold</span>;
      case "COMPLETED":
      case "WORK_COMPLETED":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">Completed</span>;
      case "CANCELLED":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 border border-slate-200">Cancelled</span>;
      case "DISPUTED":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 border border-red-300 font-bold">Disputed</span>;
      case "REJECTED":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 border border-slate-200">Rejected</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-800 border border-slate-200">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Wrench className="w-7 h-7 text-[#008CFF]" />
            Job Management & Dispatch
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Dispatch, allocate, and monitor electrical and technician service requests across Moulvibazar & Bangladesh.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchJobs}
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
          <p className="text-xs font-medium text-slate-500">Total Bookings</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{jobs.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-sm">
          <p className="text-xs font-medium text-amber-700">Pending Dispatch</p>
          <p className="text-2xl font-bold text-amber-800 mt-1">
            {jobs.filter((j) => j.status === "PENDING").length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-blue-200 bg-blue-50/20 shadow-sm">
          <p className="text-xs font-medium text-blue-700">Active / In Progress</p>
          <p className="text-2xl font-bold text-blue-800 mt-1">
            {jobs.filter((j) => ["ASSIGNED", "IN_PROGRESS"].includes(j.status)).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-sm">
          <p className="text-xs font-medium text-emerald-700">Completed Jobs</p>
          <p className="text-2xl font-bold text-emerald-800 mt-1">
            {jobs.filter((j) => j.status === "COMPLETED").length}
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
            placeholder="Search by Job ID, customer, phone, address, or service..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#008CFF] focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#008CFF]"
          >
            <option value="ALL">All Statuses</option>
            <option value="REQUESTED">Requested / Pending</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="ON_THE_WAY">En Route (On The Way)</option>
            <option value="ARRIVED">Arrived at Site</option>
            <option value="INSPECTION_STARTED">Inspection Started</option>
            <option value="AWAITING_APPROVAL">Awaiting Approval</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="DISPUTED">Disputed</option>
          </select>
          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#008CFF]"
          >
            <option value="ALL">All Locations</option>
            {districts.map((d) => (
              <option key={d as string} value={d as string}>
                {d as string}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Job ID / Date</th>
                <th className="px-4 py-3">Service & Issue</th>
                <th className="px-4 py-3">Customer & Location</th>
                <th className="px-4 py-3">Assigned Electrician</th>
                <th className="px-4 py-3">Schedule</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#008CFF]" />
                    Loading jobs & service requests...
                  </td>
                </tr>
              ) : filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No service bookings match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900 font-mono text-xs">
                        #{job.id.substring(0, 8)}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {new Date(job.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 max-w-xs">
                      <div className="font-medium text-slate-900">
                        {job.service?.title || "Custom Service"}
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                        {job.problemDescription || "No notes provided"}
                      </p>
                      <div className="text-xs font-semibold text-[#008CFF] mt-0.5">
                        ৳{(job.actualCost || job.estimatedCost || job.service?.basePrice || 0).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-medium text-slate-900">
                        {job.customer?.fullName || "Guest Customer"}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {job.customer?.phone}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {job.address}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      {job.technician ? (
                        <div>
                          <div className="font-medium text-slate-900 flex items-center gap-1">
                            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                            {job.technician.fullName}
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {job.technician.phone}
                          </div>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          <AlertTriangle className="w-3 h-3" /> Unassigned
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="text-xs font-medium text-slate-900 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(job.preferredDate).toLocaleDateString("en-GB")}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {job.preferredTime}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">{getStatusBadge(job.status)}</td>
                    <td className="px-4 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                      {!job.technician && (
                        <button
                          onClick={() => handleAutoAssign(job.id)}
                          disabled={saving}
                          className="px-2.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-md text-xs font-semibold transition"
                          title="Instant Smart Match & Dispatch"
                        >
                          ⚡ Auto-Dispatch
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedJob(job);
                          setSelectedTechId(job.technicianId || "");
                          setAssignModalOpen(true);
                        }}
                        className="px-2.5 py-1.5 bg-blue-50 text-[#008CFF] hover:bg-blue-100 rounded-md text-xs font-semibold transition"
                      >
                        {job.technician ? "Reassign" : "Assign Tech"}
                      </button>
                      <button
                        onClick={() => setSelectedJob(job)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Electrician Modal */}
      {assignModalOpen && selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#008CFF]" />
                Dispatch Electrician to Job
              </h2>
              <button
                onClick={() => setAssignModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                <div className="font-semibold text-slate-800">
                  {selectedJob.service?.title || "Custom Service Request"} (#{selectedJob.id.substring(0, 8)})
                </div>
                <div className="text-slate-600">Customer: {selectedJob.customer?.fullName} ({selectedJob.customer?.phone})</div>
                <div className="text-slate-600">Location: {selectedJob.address}</div>
                <div className="text-slate-600">Schedule: {new Date(selectedJob.preferredDate).toLocaleDateString("en-GB")} ({selectedJob.preferredTime})</div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">
                  Select Certified Electrician / Technician
                </label>
                <select
                  value={selectedTechId}
                  onChange={(e) => setSelectedTechId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#008CFF]"
                >
                  <option value="">-- Choose a technician --</option>
                  {technicians.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.fullName} ({t.phone}) — {t.district} — ★ {t.rating.toFixed(1)} {t.isAvailable ? "• Available" : "• Busy"}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1.5">
                  The assigned electrician will receive an SMS and dashboard notification with customer details.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAssignModalOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAssign}
                disabled={saving || !selectedTechId}
                className="px-5 py-2 bg-[#008CFF] text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {saving ? "Dispatching..." : "Confirm & Dispatch"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Job Details Drawer / Modal */}
      {selectedJob && !assignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Job #{selectedJob.id.substring(0, 8)} Details
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Booked on {new Date(selectedJob.createdAt).toLocaleString("en-GB")}
                </p>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Status and Action bar */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">Status:</span>
                  {getStatusBadge(selectedJob.status)}
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedJob.status}
                    onChange={(e) => handleUpdateStatus(selectedJob.id, e.target.value)}
                    disabled={saving}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#008CFF]"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="ASSIGNED">ASSIGNED</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
              </div>

              {/* Service Details */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Service Information</h3>
                <div className="p-4 rounded-xl border border-slate-200 space-y-2 bg-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-slate-900 text-base">{selectedJob.service?.title || "Custom Electrical Service"}</div>
                      <div className="text-xs text-slate-500 mt-0.5">Category: {selectedJob.service?.category || "Electrical"}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-500">Estimated Cost</div>
                      <div className="text-base font-bold text-[#008CFF]">৳{(selectedJob.estimatedCost || selectedJob.service?.basePrice || 0).toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-xs font-semibold text-slate-700">Problem Reported by Client:</p>
                    <p className="text-sm text-slate-600 mt-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      {selectedJob.problemDescription || "No issue description provided."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Customer & Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Customer Profile</h3>
                  <div className="font-semibold text-slate-900">{selectedJob.customer?.fullName}</div>
                  <div className="text-xs text-slate-600 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> {selectedJob.customer?.phone}
                  </div>
                  {selectedJob.customer?.user?.email && (
                    <div className="text-xs text-slate-500">
                      Email: {selectedJob.customer.user.email}
                    </div>
                  )}
                  <div className="text-xs text-slate-600 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {selectedJob.address}
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Assigned Technician</h3>
                  {selectedJob.technician ? (
                    <>
                      <div className="font-semibold text-slate-900 flex items-center gap-1">
                        <UserCheck className="w-4 h-4 text-emerald-600" />
                        {selectedJob.technician.fullName}
                      </div>
                      <div className="text-xs text-slate-600 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" /> {selectedJob.technician.phone}
                      </div>
                      <div className="text-xs text-slate-600">
                        District: {selectedJob.technician.district} | Rating: ★ {selectedJob.technician.rating.toFixed(1)}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedJob.technician.skills?.map((s) => (
                          <span key={s} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px]">
                            {s}
                          </span>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="py-4 text-center">
                      <p className="text-xs text-amber-700 mb-2">No technician assigned yet.</p>
                      <button
                        onClick={() => {
                          setSelectedTechId("");
                          setAssignModalOpen(true);
                        }}
                        className="px-3 py-1.5 bg-[#008CFF] text-white rounded-lg text-xs font-medium hover:bg-blue-600 transition"
                      >
                        Assign Technician Now
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
              <div className="flex flex-wrap items-center gap-2">
                {!selectedJob.technician ? (
                  <button
                    type="button"
                    onClick={() => handleAutoAssign(selectedJob.id)}
                    disabled={saving}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                  >
                    ⚡ Auto-Assign (Smart Match)
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTechId(selectedJob.technicianId || "");
                      setAssignModalOpen(true);
                    }}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
                  >
                    Reassign Technician
                  </button>
                )}

                {['IN_PROGRESS', 'ARRIVED', 'WORK_COMPLETED'].includes(selectedJob.status) && (
                  <button
                    type="button"
                    onClick={() => handleApproveCompletion(selectedJob.id)}
                    disabled={saving}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
                  >
                    ✓ Settle Completion (85%)
                  </button>
                )}

                {selectedJob.status !== 'CANCELLED' && (
                  <button
                    type="button"
                    onClick={() => handleCancelBooking(selectedJob.id)}
                    disabled={saving}
                    className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition"
                  >
                    Cancel Booking
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedJob(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700"
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
