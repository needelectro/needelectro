"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Filter,
  Phone,
  Mail,
  MapPin,
  ShoppingBag,
  Wrench,
  CheckCircle2,
  Ban,
  RefreshCw,
  Eye,
  X,
  CreditCard
} from "lucide-react";

interface Customer {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  totalOrders: number;
  totalBookings: number;
  lifetimeSpend: number;
  addresses: any[];
  joinedAt: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/customers");
      if (res.ok) {
        const data = await res.json();
        setCustomers(data.customers || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    setUpdatingId(userId);
    try {
      const res = await fetch("/api/v1/admin/customers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, status: newStatus }),
      });
      if (res.ok) {
        fetchCustomers();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm);

    const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-7 h-7 text-[#008CFF]" />
            Customer Relationship Management (CRM)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Customer directory, lifetime purchase history, service bookings, and account management.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchCustomers}
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
          <p className="text-xs font-medium text-slate-500">Total Customers</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{customers.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-sm">
          <p className="text-xs font-medium text-emerald-700">Active Accounts</p>
          <p className="text-2xl font-bold text-emerald-800 mt-1">
            {customers.filter((c) => c.status === "ACTIVE").length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-blue-200 bg-blue-50/20 shadow-sm">
          <p className="text-xs font-medium text-blue-700">Total Product Orders</p>
          <p className="text-2xl font-bold text-blue-800 mt-1">
            {customers.reduce((acc, c) => acc + c.totalOrders, 0)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-purple-200 bg-purple-50/20 shadow-sm">
          <p className="text-xs font-medium text-purple-700">Total Service Bookings</p>
          <p className="text-2xl font-bold text-purple-800 mt-1">
            {customers.reduce((acc, c) => acc + c.totalBookings, 0)}
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
            placeholder="Search by customer name, phone, or email address..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#008CFF]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-700"
        >
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Activity</th>
                <th className="px-4 py-3">Lifetime Spend</th>
                <th className="px-4 py-3">Joined Date</th>
                <th className="px-4 py-3">Account Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#008CFF]" />
                    Loading customers...
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No customers found matching search query.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900">{cust.name}</div>
                      <div className="text-xs text-slate-400">ID: #{cust.id.substring(0, 8)}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="text-xs text-slate-700 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" /> {cust.phone}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3 text-slate-400" /> {cust.email}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3 text-xs">
                        <span className="flex items-center gap-1 text-slate-700 font-medium">
                          <ShoppingBag className="w-3.5 h-3.5 text-blue-500" /> {cust.totalOrders} Orders
                        </span>
                        <span className="flex items-center gap-1 text-slate-700 font-medium">
                          <Wrench className="w-3.5 h-3.5 text-emerald-500" /> {cust.totalBookings} Services
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-900">
                      ৳{cust.lifetimeSpend.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-500">
                      {new Date(cust.joinedAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                          cust.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        {cust.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap space-x-2">
                      <button
                        onClick={() => setSelectedCustomer(cust)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-semibold"
                      >
                        View Profile
                      </button>
                      <button
                        onClick={() => handleToggleStatus(cust.userId, cust.status)}
                        disabled={updatingId === cust.userId}
                        className={`px-2.5 py-1.5 rounded-md text-xs font-semibold border ${
                          cust.status === "ACTIVE"
                            ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                        }`}
                      >
                        {cust.status === "ACTIVE" ? "Suspend" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Drawer */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{selectedCustomer.name}</h2>
                <p className="text-xs text-slate-500">Customer ID #{selectedCustomer.id}</p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500 font-medium">Lifetime Spend</span>
                  <span className="text-lg font-bold text-[#008CFF]">৳{selectedCustomer.lifetimeSpend.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Orders Purchased:</span>
                  <span className="font-semibold text-slate-800">{selectedCustomer.totalOrders}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Services Booked:</span>
                  <span className="font-semibold text-slate-800">{selectedCustomer.totalBookings}</span>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Contact & Delivery Addresses</h3>
                <div className="space-y-2">
                  <div className="text-xs text-slate-700"><strong>Phone:</strong> {selectedCustomer.phone}</div>
                  <div className="text-xs text-slate-700"><strong>Email:</strong> {selectedCustomer.email}</div>
                  {selectedCustomer.addresses && selectedCustomer.addresses.length > 0 ? (
                    selectedCustomer.addresses.map((addr: any, idx: number) => (
                      <div key={idx} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600">
                        <div className="font-semibold text-slate-800">{addr.label} — {addr.recipientName}</div>
                        <div>{addr.addressLine}, {addr.area}, {addr.district}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-400 italic">No saved delivery address on file.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end px-6 py-4 bg-slate-50 border-t border-slate-100">
              <button
                onClick={() => setSelectedCustomer(null)}
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
