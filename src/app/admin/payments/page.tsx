"use client";

import React, { useState, useEffect } from "react";
import {
  CreditCard,
  Search,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download
} from "lucide-react";

interface Transaction {
  id: string;
  type: string;
  referenceNumber: string;
  customerName: string;
  customerPhone: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: string;
  transactionRef?: string | null;
  date: string;
}

export default function PaymentsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [methodFilter, setMethodFilter] = useState("ALL");

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/payments");
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.customerPhone.includes(searchTerm) ||
      (t.transactionRef || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || t.paymentStatus === statusFilter;
    const matchesMethod = methodFilter === "ALL" || t.paymentMethod === methodFilter;

    return matchesSearch && matchesStatus && matchesMethod;
  });

  const totalCollected = transactions
    .filter((t) => t.paymentStatus === "PAID")
    .reduce((acc, t) => acc + t.amount, 0);

  const totalPending = transactions
    .filter((t) => t.paymentStatus === "PENDING")
    .reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CreditCard className="w-7 h-7 text-[#008CFF]" />
            Payments & Financial Ledger
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Complete transaction history across Cash on Delivery, bKash, Nagad, Card, and Bank settlements.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchPayments}
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
          <p className="text-xs font-medium text-slate-500">Total Transactions</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{transactions.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-sm">
          <p className="text-xs font-medium text-emerald-700">Collected Revenue</p>
          <p className="text-2xl font-bold text-emerald-800 mt-1">৳{totalCollected.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-sm">
          <p className="text-xs font-medium text-amber-700">Pending / COD Due</p>
          <p className="text-2xl font-bold text-amber-800 mt-1">৳{totalPending.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-blue-200 bg-blue-50/20 shadow-sm">
          <p className="text-xs font-medium text-blue-700">Completed Payments</p>
          <p className="text-2xl font-bold text-blue-800 mt-1">
            {transactions.filter((t) => t.paymentStatus === "PAID").length}
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
            placeholder="Search by Invoice #, Trx ID, Customer name or phone..."
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
            <option value="PAID">PAID</option>
            <option value="PENDING">PENDING</option>
            <option value="REFUNDED">REFUNDED</option>
          </select>
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-700"
          >
            <option value="ALL">All Methods</option>
            <option value="CASH_ON_DELIVERY">Cash on Delivery</option>
            <option value="BKASH">bKash</option>
            <option value="NAGAD">Nagad</option>
            <option value="CARD">Debit / Credit Card</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Date & Time</th>
                <th className="px-4 py-3">Reference / Origin</th>
                <th className="px-4 py-3">Payer & Contact</th>
                <th className="px-4 py-3">Method & Trx ID</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3 text-right">Settlement Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#008CFF]" />
                    Loading financial ledger...
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    No transactions match criteria.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5 text-xs text-slate-500">
                      {new Date(tx.date).toLocaleString("en-GB")}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-mono text-xs font-semibold text-slate-900">
                        {tx.referenceNumber}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {tx.type === "PRODUCT_ORDER" ? "E-Commerce Product Order" : "Electrical Service Dispatch"}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900">{tx.customerName}</div>
                      <div className="text-xs text-slate-500">{tx.customerPhone}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 text-xs font-semibold bg-slate-100 rounded text-slate-800 border border-slate-200">
                        {tx.paymentMethod.replace(/_/g, " ")}
                      </span>
                      {tx.transactionRef && (
                        <div className="text-[11px] font-mono text-slate-500 mt-1">
                          Trx: {tx.transactionRef}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-900">
                      ৳{tx.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span
                        className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                          tx.paymentStatus === "PAID"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : tx.paymentStatus === "REFUNDED"
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {tx.paymentStatus}
                      </span>
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
