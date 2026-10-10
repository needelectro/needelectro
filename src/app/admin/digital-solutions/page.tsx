"use client";

import React, { useState, useEffect } from "react";
import {
  Code2,
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
  FileText,
  DollarSign,
  ChevronRight,
  UserCheck
} from "lucide-react";

interface DigitalLead {
  id: string;
  clientName: string;
  organization?: string | null;
  phone: string;
  email?: string | null;
  serviceType: string;
  projectScope?: string | null;
  budget?: number | null;
  targetDeadline?: string | null;
  status: string;
  assignedTo?: string | null;
  quotationAmount?: number | null;
  notes?: string | null;
  createdAt: string;
}

export default function DigitalSolutionsPage() {
  const [leads, setLeads] = useState<DigitalLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [serviceFilter, setServiceFilter] = useState("ALL");
  const [selectedLead, setSelectedLead] = useState<DigitalLead | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // New Lead Form state
  const [formData, setFormData] = useState({
    clientName: "",
    organization: "",
    phone: "",
    email: "",
    serviceType: "WEB_DEVELOPMENT",
    projectScope: "",
    budget: "",
    notes: "",
  });

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/leads?type=digital");
      if (res.ok) {
        const data = await res.json();
        setLeads(data.digitalLeads || []);
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
          type: "digital",
          ...formData,
        }),
      });
      if (res.ok) {
        setIsNewModalOpen(false);
        setFormData({
          clientName: "",
          organization: "",
          phone: "",
          email: "",
          serviceType: "WEB_DEVELOPMENT",
          projectScope: "",
          budget: "",
          notes: "",
        });
        fetchLeads();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateLead = async (leadId: string, updates: Partial<DigitalLead>) => {
    setSaving(true);
    try {
      const res = await fetch("/api/v1/admin/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "digital",
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
      l.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.organization || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.phone.includes(searchTerm) ||
      (l.email || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || l.status === statusFilter;
    const matchesService = serviceFilter === "ALL" || l.serviceType === serviceFilter;

    return matchesSearch && matchesStatus && matchesService;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "NEW":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-200">New Lead</span>;
      case "CONTACTED":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-200">Contacted</span>;
      case "PROPOSAL_SENT":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">Proposal Sent</span>;
      case "WON":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">Deal Closed</span>;
      case "LOST":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-100 text-rose-800 border border-rose-200">Lost</span>;
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
            <Code2 className="w-7 h-7 text-[#008CFF]" />
            Digital Solutions Leads & Projects
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Websites, custom mobile apps, accounting systems, and IT software projects pipeline.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#008CFF] text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Inquiry
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
          <p className="text-xs font-medium text-slate-500">Total Leads</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{leads.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-blue-200 bg-blue-50/20 shadow-sm">
          <p className="text-xs font-medium text-blue-700">New Inquiries</p>
          <p className="text-2xl font-bold text-blue-800 mt-1">
            {leads.filter((l) => l.status === "NEW").length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-indigo-200 bg-indigo-50/20 shadow-sm">
          <p className="text-xs font-medium text-indigo-700">Proposals Sent</p>
          <p className="text-2xl font-bold text-indigo-800 mt-1">
            {leads.filter((l) => l.status === "PROPOSAL_SENT").length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-sm">
          <p className="text-xs font-medium text-emerald-700">Closed / Won</p>
          <p className="text-2xl font-bold text-emerald-800 mt-1">
            {leads.filter((l) => l.status === "WON").length}
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by client name, organization, phone, or email..."
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
            <option value="NEW">New</option>
            <option value="CONTACTED">Contacted</option>
            <option value="PROPOSAL_SENT">Proposal Sent</option>
            <option value="WON">Won / Signed</option>
            <option value="LOST">Lost</option>
          </select>
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-700"
          >
            <option value="ALL">All Services</option>
            <option value="WEB_DEVELOPMENT">Web Development</option>
            <option value="APP_DEVELOPMENT">Mobile Apps</option>
            <option value="ACCOUNTING_SOFTWARE">Accounting Software</option>
            <option value="CUSTOM_SOFTWARE">Custom Software</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Client / Company</th>
                <th className="px-4 py-3">Requested Solution</th>
                <th className="px-4 py-3">Budget & Quotation</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#008CFF]" />
                    Loading digital solutions inquiries...
                  </td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    No leads found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900">{lead.clientName}</div>
                      {lead.organization && (
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          {lead.organization}
                        </div>
                      )}
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {lead.phone}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 text-xs font-semibold bg-blue-50 text-blue-700 rounded border border-blue-200">
                        {lead.serviceType.replace("_", " ")}
                      </span>
                      {lead.projectScope && (
                        <p className="text-xs text-slate-500 line-clamp-1 mt-1 max-w-xs">
                          {lead.projectScope}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="text-xs text-slate-500">
                        Budget: {lead.budget ? `৳${lead.budget.toLocaleString()}` : "Not stated"}
                      </div>
                      {lead.quotationAmount ? (
                        <div className="text-xs font-semibold text-emerald-600 mt-0.5">
                          Quoted: ৳{lead.quotationAmount.toLocaleString()}
                        </div>
                      ) : (
                        <div className="text-xs text-slate-400 mt-0.5">No quote sent yet</div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-500">
                      {new Date(lead.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3.5">{getStatusBadge(lead.status)}</td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedLead(lead)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition"
                      >
                        Manage Pipeline
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Inquiry Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Record New Digital Lead</h2>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateLead} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Client Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Organization</label>
                  <input
                    type="text"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Service Type</label>
                  <select
                    value={formData.serviceType}
                    onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  >
                    <option value="WEB_DEVELOPMENT">Website Development</option>
                    <option value="APP_DEVELOPMENT">Mobile App Development</option>
                    <option value="ACCOUNTING_SOFTWARE">Accounting Software</option>
                    <option value="CUSTOM_SOFTWARE">Custom Software Solution</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Approx. Budget (BDT)</label>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    placeholder="e.g. 50000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Project Scope & Requirements</label>
                <textarea
                  rows={3}
                  value={formData.projectScope}
                  onChange={(e) => setFormData({ ...formData, projectScope: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  placeholder="Detail client specifications, timeline, and features..."
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
                  {saving ? "Saving..." : "Create Lead"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Lead Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{selectedLead.clientName}</h2>
                <p className="text-xs text-slate-500">{selectedLead.organization || "Individual Client"}</p>
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
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Pipeline Stage</label>
                <select
                  value={selectedLead.status}
                  onChange={(e) => handleUpdateLead(selectedLead.id, { status: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium bg-white"
                >
                  <option value="NEW">NEW LEAD</option>
                  <option value="CONTACTED">CONTACTED & DISCOVERY</option>
                  <option value="PROPOSAL_SENT">PROPOSAL & QUOTATION SENT</option>
                  <option value="WON">WON / DEAL CLOSED</option>
                  <option value="LOST">LOST / CANCELLED</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Official Quotation Amount (৳ BDT)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    defaultValue={selectedLead.quotationAmount || ""}
                    id="quotationInput"
                    placeholder="e.g. 75000"
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                  <button
                    onClick={() => {
                      const val = (document.getElementById("quotationInput") as HTMLInputElement).value;
                      handleUpdateLead(selectedLead.id, { quotationAmount: Number(val) || 0 });
                    }}
                    className="px-4 py-2 bg-[#008CFF] text-white rounded-lg text-sm font-semibold hover:bg-blue-600"
                  >
                    Save Quote
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Follow-up Notes</label>
                <textarea
                  rows={3}
                  defaultValue={selectedLead.notes || ""}
                  id="leadNotesInput"
                  placeholder="Record meeting outcomes, next follow-up dates..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
                <button
                  onClick={() => {
                    const notes = (document.getElementById("leadNotesInput") as HTMLInputElement).value;
                    handleUpdateLead(selectedLead.id, { notes });
                  }}
                  className="mt-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold"
                >
                  Update Notes
                </button>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1">
                <div><strong>Phone:</strong> {selectedLead.phone}</div>
                <div><strong>Email:</strong> {selectedLead.email || "N/A"}</div>
                <div><strong>Scope:</strong> {selectedLead.projectScope || "N/A"}</div>
              </div>
            </div>

            <div className="flex justify-end px-6 py-4 bg-slate-50 border-t border-slate-100">
              <button
                onClick={() => setSelectedLead(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
