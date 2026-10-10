"use client";

import React, { useState, useEffect } from "react";
import {
  Layers,
  Search,
  Filter,
  Plus,
  Phone,
  Mail,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  RefreshCw,
  X,
  Laptop,
  CheckSquare,
  Users
} from "lucide-react";

interface ErpLead {
  id: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email?: string | null;
  businessType: string;
  numBranches: number;
  numEmployees: string;
  currentSoftware?: string | null;
  modulesInterested: string[];
  budgetRange?: string | null;
  preferredTimeline?: string | null;
  status: string;
  notes?: string | null;
  demoScheduledAt?: string | null;
  createdAt: string;
}

export default function ErpLeadsPage() {
  const [leads, setLeads] = useState<ErpLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedLead, setSelectedLead] = useState<ErpLead | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // New ERP Lead Form state
  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    phone: "",
    email: "",
    businessType: "Retail Superstore",
    numBranches: 1,
    numEmployees: "10-50",
    currentSoftware: "",
    modulesInterested: ["POS & Billing", "Inventory Management", "Accounts & Finance"],
    budgetRange: "৳100,000 - ৳300,000",
    notes: "",
  });

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/leads?type=erp");
      if (res.ok) {
        const data = await res.json();
        setLeads(data.erpLeads || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/v1/admin/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "erp",
          ...formData,
        }),
      });
      if (res.ok) {
        setIsNewModalOpen(false);
        fetchLeads();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateLead = async (leadId: string, updates: Partial<ErpLead>) => {
    setSaving(true);
    try {
      const res = await fetch("/api/v1/admin/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "erp",
          id: leadId,
          ...updates,
        }),
      });
      if (res.ok) {
        if (selectedLead) {
          setSelectedLead((prev) => prev ? { ...prev, ...updates } : null);
        }
        fetchLeads();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const filteredLeads = leads.filter((l) => {
    const matchesSearch =
      l.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.phone.includes(searchTerm) ||
      l.businessType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || l.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "NEW":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-200">New Inquiry</span>;
      case "DEMO_SCHEDULED":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 border border-purple-200">Demo Scheduled</span>;
      case "NEGOTIATING":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-200">Negotiating</span>;
      case "IMPLEMENTATION":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">Implementing</span>;
      case "CLOSED_LOST":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-100 text-rose-800 border border-rose-200">Closed Lost</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-800 border border-slate-200">{status}</span>;
    }
  };

  const availableModules = [
    "POS & Billing",
    "Inventory & Stock",
    "Accounts & Finance",
    "HR & Payroll",
    "Multi-Branch Sync",
    "Customer CRM",
    "Purchase & Supplier",
    "E-commerce Connector",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-7 h-7 text-[#008CFF]" />
            ERP & Enterprise Software Leads
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Enterprise resource planning consultations, retail multi-branch demos, and custom ERP deployments.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#008CFF] text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Book ERP Demo
          </button>
          <button
            onClick={fetchLeads}
            className="inline-flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Total ERP Leads</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{leads.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-purple-200 bg-purple-50/20 shadow-sm">
          <p className="text-xs font-medium text-purple-700">Demos Scheduled</p>
          <p className="text-2xl font-bold text-purple-800 mt-1">
            {leads.filter((l) => l.status === "DEMO_SCHEDULED").length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-sm">
          <p className="text-xs font-medium text-amber-700">In Negotiation</p>
          <p className="text-2xl font-bold text-amber-800 mt-1">
            {leads.filter((l) => l.status === "NEGOTIATING").length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-sm">
          <p className="text-xs font-medium text-emerald-700">Live Implementations</p>
          <p className="text-2xl font-bold text-emerald-800 mt-1">
            {leads.filter((l) => l.status === "IMPLEMENTATION").length}
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
            placeholder="Search by company, contact person, phone, or business type..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#008CFF]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-700"
        >
          <option value="ALL">All Stages</option>
          <option value="NEW">New</option>
          <option value="DEMO_SCHEDULED">Demo Scheduled</option>
          <option value="NEGOTIATING">Negotiating</option>
          <option value="IMPLEMENTATION">Implementation</option>
          <option value="CLOSED_LOST">Closed Lost</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Company & Contact</th>
                <th className="px-4 py-3">Industry / Scale</th>
                <th className="px-4 py-3">Required Modules</th>
                <th className="px-4 py-3">Demo Schedule</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#008CFF]" />
                    Loading ERP pipeline...
                  </td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    No enterprise ERP leads found.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900">{lead.companyName}</div>
                      <div className="text-xs text-slate-600 mt-0.5">{lead.contactPerson}</div>
                      <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3" /> {lead.phone}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="text-xs font-semibold text-slate-800">{lead.businessType}</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {lead.numBranches} branch(es) • {lead.numEmployees} staff
                      </div>
                    </td>
                    <td className="px-4 py-3.5 max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {lead.modulesInterested?.slice(0, 3).map((mod) => (
                          <span key={mod} className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] border border-slate-200">
                            {mod}
                          </span>
                        ))}
                        {(lead.modulesInterested?.length || 0) > 3 && (
                          <span className="text-[10px] text-slate-400">
                            +{(lead.modulesInterested?.length || 0) - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      {lead.demoScheduledAt ? (
                        <div className="text-xs text-purple-700 font-semibold flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(lead.demoScheduledAt).toLocaleDateString("en-GB")}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Not set</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">{getStatusBadge(lead.status)}</td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedLead(lead)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New ERP Lead Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Record Enterprise ERP Lead</h2>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Enterprise Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Person *</label>
                  <input
                    type="text"
                    required
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Business Type</label>
                  <select
                    value={formData.businessType}
                    onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  >
                    <option value="Retail Superstore">Retail Superstore</option>
                    <option value="Wholesale & Distribution">Wholesale & Dist.</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Healthcare / Pharmacy">Pharmacy / Medical</option>
                    <option value="Restaurant / Food Chain">Restaurant Chain</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Branches</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.numBranches}
                    onChange={(e) => setFormData({ ...formData, numBranches: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Employees</label>
                  <select
                    value={formData.numEmployees}
                    onChange={(e) => setFormData({ ...formData, numEmployees: e.target.value })}
                    className="w-full px-2 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  >
                    <option value="1-10">1-10</option>
                    <option value="10-50">10-50</option>
                    <option value="50-200">50-200</option>
                    <option value="200+">200+</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Modules Interested</label>
                <div className="grid grid-cols-2 gap-2">
                  {availableModules.map((mod) => (
                    <label key={mod} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.modulesInterested.includes(mod)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, modulesInterested: [...formData.modulesInterested, mod] });
                          } else {
                            setFormData({
                              ...formData,
                              modulesInterested: formData.modulesInterested.filter((m) => m !== mod),
                            });
                          }
                        }}
                        className="rounded text-[#008CFF] focus:ring-[#008CFF]"
                      />
                      {mod}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Lead Notes</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  placeholder="Existing software pain points, custom integration requests..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#008CFF] text-white rounded-lg text-sm font-semibold hover:bg-blue-600 shadow-sm"
                >
                  {saving ? "Saving..." : "Create ERP Lead"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage ERP Lead Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{selectedLead.companyName}</h2>
                <p className="text-xs text-slate-500">Contact: {selectedLead.contactPerson} ({selectedLead.phone})</p>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Stage</label>
                <select
                  value={selectedLead.status}
                  onChange={(e) => handleUpdateLead(selectedLead.id, { status: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium bg-white"
                >
                  <option value="NEW">NEW INQUIRY</option>
                  <option value="DEMO_SCHEDULED">DEMO SCHEDULED</option>
                  <option value="NEGOTIATING">NEGOTIATING TERMS</option>
                  <option value="IMPLEMENTATION">LIVE IMPLEMENTATION</option>
                  <option value="CLOSED_LOST">CLOSED / LOST</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Schedule Live / Online Demo Date
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    id="demoDateInput"
                    defaultValue={selectedLead.demoScheduledAt ? selectedLead.demoScheduledAt.substring(0, 10) : ""}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                  <button
                    onClick={() => {
                      const val = (document.getElementById("demoDateInput") as HTMLInputElement).value;
                      handleUpdateLead(selectedLead.id, {
                        demoScheduledAt: val,
                        status: "DEMO_SCHEDULED",
                      });
                    }}
                    className="px-4 py-2 bg-[#008CFF] text-white rounded-lg text-sm font-semibold hover:bg-blue-600"
                  >
                    Set Demo
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Notes & Follow-up</label>
                <textarea
                  rows={3}
                  defaultValue={selectedLead.notes || ""}
                  id="erpNotesInput"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  placeholder="Record client requirements, modules discussed..."
                />
                <button
                  onClick={() => {
                    const notes = (document.getElementById("erpNotesInput") as HTMLInputElement).value;
                    handleUpdateLead(selectedLead.id, { notes });
                  }}
                  className="mt-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold"
                >
                  Save Notes
                </button>
              </div>
            </div>

            <div className="flex justify-end px-6 py-4 bg-slate-50 border-t border-slate-100">
              <button
                onClick={() => setSelectedLead(null)}
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
