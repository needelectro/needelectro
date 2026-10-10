"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  DollarSign,
  ShoppingBag,
  Wrench,
  Users,
  RefreshCw,
  FileSpreadsheet
} from "lucide-react";

interface ReportData {
  summary: {
    totalRevenue: number;
    productRevenue: number;
    serviceRevenue: number;
    totalOrders: number;
    totalBookings: number;
    totalProducts: number;
    totalTechnicians: number;
  };
  orders: any[];
  bookings: any[];
  technicians: any[];
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/reports");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const exportCsv = () => {
    if (!data) return;

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Type,Reference Number,Amount,Payment Status,Date\n";

    data.orders.forEach((o) => {
      csvContent += `Order,${o.orderNumber},${o.totalAmount},${o.paymentStatus},${o.createdAt}\n`;
    });

    data.bookings.forEach((b) => {
      csvContent += `Service,${b.bookingNumber},${b.totalAmount},${b.paymentStatus},${b.createdAt}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `need_electro_financial_report_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-[#008CFF]" />
            Business Reports & Analytics
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Financial revenue metrics, transaction summaries, workforce productivity, and CSV data export.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportCsv}
            disabled={!data}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition shadow-sm disabled:opacity-50"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export CSV Report
          </button>
          <button
            onClick={fetchReports}
            className="p-2 border border-slate-300 rounded-lg text-slate-700 bg-white hover:bg-slate-50 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase">Total Gross Sales</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            ৳{(data?.summary.totalRevenue || 0).toLocaleString()}
          </div>
          <span className="text-xs text-emerald-600 font-medium">All settled revenue</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-blue-200 bg-blue-50/10 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase">Product E-Commerce</span>
            <ShoppingBag className="w-4 h-4 text-[#008CFF]" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            ৳{(data?.summary.productRevenue || 0).toLocaleString()}
          </div>
          <span className="text-xs text-slate-500">{data?.summary.totalOrders || 0} orders processed</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-purple-200 bg-purple-50/10 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase">Electrical Services</span>
            <Wrench className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            ৳{(data?.summary.serviceRevenue || 0).toLocaleString()}
          </div>
          <span className="text-xs text-slate-500">{data?.summary.totalBookings || 0} bookings handled</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase">Active Workforce</span>
            <Users className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {data?.summary.totalTechnicians || 0}
          </div>
          <span className="text-xs text-slate-500">Certified technicians</span>
        </div>
      </div>

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Technicians by Jobs Completed */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="font-bold text-slate-900 text-base mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#008CFF]" />
            Top Performing Electricians
          </h2>
          <div className="space-y-3">
            {data?.technicians.slice(0, 5).map((tech, idx) => (
              <div key={tech.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-[#008CFF] font-bold text-xs flex items-center justify-center">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 text-sm">{tech.fullName}</div>
                    <div className="text-xs text-slate-400">Rating: ★ {tech.rating?.toFixed(1) || "5.0"}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-slate-900">{tech.totalJobsCompleted || 0} Jobs</div>
                  <div className="text-xs text-emerald-600 font-semibold">৳{tech.walletBalance?.toLocaleString()} earned</div>
                </div>
              </div>
            ))}
            {(!data || data.technicians.length === 0) && (
              <div className="text-center py-6 text-slate-400 text-sm">No technician logs available.</div>
            )}
          </div>
        </div>

        {/* Operational Overview */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="font-bold text-slate-900 text-base mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              Operational Highlights
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-slate-100 text-sm">
                <span className="text-slate-600">Active Product Catalog SKUs</span>
                <span className="font-bold text-slate-900">{data?.summary.totalProducts || 0} Items</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100 text-sm">
                <span className="text-slate-600">Total Orders Placed</span>
                <span className="font-bold text-slate-900">{data?.summary.totalOrders || 0} Orders</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100 text-sm">
                <span className="text-slate-600">Service Dispatch Invocations</span>
                <span className="font-bold text-slate-900">{data?.summary.totalBookings || 0} Bookings</span>
              </div>
              <div className="flex justify-between items-center py-2 text-sm">
                <span className="text-slate-600">Average Service Ticket Value</span>
                <span className="font-bold text-slate-900">
                  ৳{data && data.summary.totalBookings > 0
                    ? Math.round(data.summary.serviceRevenue / data.summary.totalBookings).toLocaleString()
                    : 0}
                </span>
              </div>
            </div>
          </div>
          <div className="pt-4 mt-4 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              * Official audit reports generated for NEED ELECTRO and Amdads Group leadership.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
