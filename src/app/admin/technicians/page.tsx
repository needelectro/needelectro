"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Star,
  ShieldCheck,
  ShieldAlert,
  Wallet,
  Phone,
  MapPin,
  RefreshCw,
  X,
  CreditCard,
  Check,
  Ban
} from "lucide-react";

interface PayoutRequest {
  id: string;
  amount: number;
  paymentMethod: string;
  accountNumber: string;
  status: string;
  transactionRef?: string | null;
  requestedAt: string;
  processedAt?: string | null;
}

interface Technician {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  district: string;
  nidNumber?: string | null;
  experienceYears?: number | null;
  skills: string[];
  isVerified: boolean;
  isAvailable: boolean;
  rating: number;
  totalJobsCompleted: number;
  walletBalance: number;
  createdAt: string;
  user?: {
    email: string;
    status: string;
  };
  payoutRequests?: PayoutRequest[];
}

export default function TechniciansPage() {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"technicians" | "payouts">("technicians");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDistrict, setFilterDistrict] = useState("ALL");
  const [filterVerified, setFilterVerified] = useState("ALL");
  const [selectedTech, setSelectedTech] = useState<Technician | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchTechnicians = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/technicians");
      if (res.ok) {
        const data = await res.json();
        setTechnicians(data.technicians || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const handleToggleVerification = async (techId: string, currentStatus: boolean) => {
    setUpdatingId(techId);
    try {
      const res = await fetch("/api/v1/admin/technicians", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          technicianId: techId,
          isVerified: !currentStatus,
        }),
      });
      if (res.ok) {
        fetchTechnicians();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleAvailability = async (techId: string, currentStatus: boolean) => {
    setUpdatingId(techId);
    try {
      const res = await fetch("/api/v1/admin/technicians", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          technicianId: techId,
          isAvailable: !currentStatus,
        }),
      });
      if (res.ok) {
        fetchTechnicians();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleProcessPayout = async (payoutId: string, status: "APPROVED" | "REJECTED") => {
    let txnRef = "";
    let adminNotes = "";

    if (status === "APPROVED") {
      txnRef = prompt("Enter bKash/Nagad/Bank Transaction Reference ID:") || "";
      if (!txnRef) return;
    } else {
      adminNotes = prompt("Enter rejection reason (balance will be refunded to technician):") || "Verification failed";
      if (!adminNotes) return;
    }

    try {
      const res = await fetch("/api/v1/admin/payouts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payoutId,
          status,
          transactionRef: txnRef,
          trxId: txnRef,
          adminNotes,
        }),
      });
      if (res.ok) {
        fetchTechnicians();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTechs = technicians.filter((t) => {
    const matchesSearch =
      t.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.phone.includes(searchTerm) ||
      (t.nidNumber || "").includes(searchTerm) ||
      t.district.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDistrict = filterDistrict === "ALL" || t.district === filterDistrict;
    const matchesVerified =
      filterVerified === "ALL" ||
      (filterVerified === "VERIFIED" && t.isVerified) ||
      (filterVerified === "UNVERIFIED" && !t.isVerified);

    return matchesSearch && matchesDistrict && matchesVerified;
  });

  const allPayouts = technicians.flatMap((t) =>
    (t.payoutRequests || []).map((p) => ({
      ...p,
      technicianName: t.fullName,
      technicianPhone: t.phone,
      technicianDistrict: t.district,
    }))
  ).sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());

  const districts = Array.from(new Set(technicians.map((t) => t.district).filter(Boolean)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-7 h-7 text-[#008CFF]" />
            Electricians & Technician Workforce
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage certified electricians, NID verification, ratings, job performance, and wallet payouts.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchTechnicians}
            className="inline-flex items-center gap-2 px-3.5 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab("technicians")}
          className={`px-5 py-2.5 font-semibold text-sm border-b-2 transition-colors ${
            activeTab === "technicians"
              ? "border-[#008CFF] text-[#008CFF]"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Technicians Roster ({technicians.length})
        </button>
        <button
          onClick={() => setActiveTab("payouts")}
          className={`px-5 py-2.5 font-semibold text-sm border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "payouts"
              ? "border-[#008CFF] text-[#008CFF]"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <span>Withdrawal Payout Requests</span>
          {allPayouts.filter((p) => p.status === "PENDING").length > 0 && (
            <span className="px-2 py-0.5 text-xs bg-amber-500 text-white rounded-full">
              {allPayouts.filter((p) => p.status === "PENDING").length}
            </span>
          )}
        </button>
      </div>

      {activeTab === "technicians" ? (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-xs font-medium text-slate-500">Total Registered</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{technicians.length}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-sm">
              <p className="text-xs font-medium text-emerald-700">Verified Electricians</p>
              <p className="text-2xl font-bold text-emerald-800 mt-1">
                {technicians.filter((t) => t.isVerified).length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-blue-200 bg-blue-50/20 shadow-sm">
              <p className="text-xs font-medium text-blue-700">Currently Available</p>
              <p className="text-2xl font-bold text-blue-800 mt-1">
                {technicians.filter((t) => t.isAvailable).length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-xs font-medium text-slate-500">Unverified Queue</p>
              <p className="text-2xl font-bold text-amber-700 mt-1">
                {technicians.filter((t) => !t.isVerified).length}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, phone, NID, district..."
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#008CFF]"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterVerified}
                onChange={(e) => setFilterVerified(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-700"
              >
                <option value="ALL">All Verification</option>
                <option value="VERIFIED">Verified Only</option>
                <option value="UNVERIFIED">Pending Verification</option>
              </select>
              <select
                value={filterDistrict}
                onChange={(e) => setFilterDistrict(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-700"
              >
                <option value="ALL">All Districts</option>
                {districts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Technicians Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Technician</th>
                    <th className="px-4 py-3">Location & NID</th>
                    <th className="px-4 py-3">Skills & Experience</th>
                    <th className="px-4 py-3">Rating / Jobs</th>
                    <th className="px-4 py-3">Wallet Balance</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Verification & Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-400">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#008CFF]" />
                        Loading technician workforce...
                      </td>
                    </tr>
                  ) : filteredTechs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-400">
                        No technicians found.
                      </td>
                    </tr>
                  ) : (
                    filteredTechs.map((tech) => (
                      <tr key={tech.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                            {tech.fullName}
                            {tech.isVerified ? (
                              <span title="Verified Professional"><ShieldCheck className="w-4 h-4 text-emerald-600" /></span>
                            ) : (
                              <span title="Unverified"><ShieldAlert className="w-4 h-4 text-amber-500" /></span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {tech.phone}
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="text-slate-900 font-medium flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {tech.district}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            NID: {tech.nidNumber || "Not submitted"}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 max-w-xs">
                          <div className="text-xs text-slate-500 mb-1">
                            Exp: {tech.experienceYears || 0} years
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {tech.skills?.slice(0, 3).map((s) => (
                              <span key={s} className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px]">
                                {s}
                              </span>
                            ))}
                            {(tech.skills?.length || 0) > 3 && (
                              <span className="text-[10px] text-slate-400">
                                +{(tech.skills?.length || 0) - 3} more
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1 text-slate-900 font-bold text-xs">
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            {tech.rating.toFixed(1)} / 5.0
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {tech.totalJobsCompleted} jobs done
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-slate-900">
                            ৳{tech.walletBalance.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <button
                            onClick={() => handleToggleAvailability(tech.id, tech.isAvailable)}
                            disabled={updatingId === tech.id}
                            className={`px-2.5 py-1 text-xs font-semibold rounded-full border transition ${
                              tech.isAvailable
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                            }`}
                          >
                            {tech.isAvailable ? "Available" : "Unavailable"}
                          </button>
                        </td>
                        <td className="px-4 py-3.5 text-right whitespace-nowrap space-x-1.5">
                          <button
                            onClick={() => handleToggleVerification(tech.id, tech.isVerified)}
                            disabled={updatingId === tech.id}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                              tech.isVerified
                                ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            }`}
                          >
                            {tech.isVerified ? "Revoke Verification" : "Approve & Verify"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Payouts Tab */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Wallet className="w-5 h-5 text-[#008CFF]" />
                Technician Wallet Withdrawal Requests
              </h2>
              <p className="text-xs text-slate-500">
                Disburse technician earnings to bKash, Nagad, Rocket, or direct bank accounts.
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Requested Date</th>
                  <th className="px-4 py-3">Electrician</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Payout Method / Account</th>
                  <th className="px-4 py-3">Status / Reference</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {allPayouts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400">
                      No withdrawal requests logged.
                    </td>
                  </tr>
                ) : (
                  allPayouts.map((payout) => (
                    <tr key={payout.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5 text-xs text-slate-600">
                        {new Date(payout.requestedAt).toLocaleString("en-GB")}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-900">{payout.technicianName}</div>
                        <div className="text-xs text-slate-500">{payout.technicianPhone} • {payout.technicianDistrict}</div>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-slate-900">
                        ৳{payout.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 text-xs font-semibold bg-slate-100 rounded text-slate-800 border border-slate-200 uppercase">
                          {payout.paymentMethod}
                        </span>
                        <div className="text-xs font-mono text-slate-600 mt-1">{payout.accountNumber}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                            payout.status === "APPROVED"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : payout.status === "REJECTED"
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {payout.status}
                        </span>
                        {payout.transactionRef && (
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                            Ref: {payout.transactionRef}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap space-x-1.5">
                        {payout.status === "PENDING" && (
                          <>
                            <button
                              onClick={() => handleProcessPayout(payout.id, "APPROVED")}
                              className="px-2.5 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-xs font-semibold transition"
                            >
                              Approve Payout
                            </button>
                            <button
                              onClick={() => handleProcessPayout(payout.id, "REJECTED")}
                              className="px-2.5 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-semibold border border-rose-200 transition"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
