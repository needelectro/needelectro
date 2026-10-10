'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CalendarCheck, Search, Filter, RefreshCw, CheckCircle2,
  AlertTriangle, Clock, DollarSign, X, Receipt, Eye
} from 'lucide-react';

export default function AdminEmiPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Installment Modal
  const [selectedAccount, setSelectedAccount] = useState<any | null>(null);
  const [showInstallmentModal, setShowInstallmentModal] = useState(false);
  const [recordingId, setRecordingId] = useState<string | null>(null);
  const [trxId, setTrxId] = useState('');
  const [payMethod, setPayMethod] = useState('BKASH');

  useEffect(() => {
    loadEmi();
  }, [statusFilter]);

  const loadEmi = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/emi?status=${statusFilter}`);
      if (res.ok) {
        const data = await res.json();
        setAccounts(data.accounts || []);
        setStats(data.stats || null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPayment = async (installment: any) => {
    setRecordingId(installment.id);
    try {
      const res = await fetch('/api/v1/admin/emi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'PAY_INSTALLMENT',
          installmentId: installment.id,
          amount: installment.amount,
          transactionId: trxId || `BKASH-${Math.floor(100000 + Math.random() * 900000)}`,
          paymentMethod: payMethod,
        }),
      });

      if (res.ok) {
        setTrxId('');
        await loadEmi();
        // Update selected account modal view
        setSelectedAccount((prev: any) => {
          if (!prev) return null;
          return {
            ...prev,
            installments: prev.installments.map((i: any) =>
              i.id === installment.id ? { ...i, status: 'PAID', paidDate: new Date(), paidAmount: installment.amount } : i
            ),
          };
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRecordingId(null);
    }
  };

  const filteredAccounts = accounts.filter((a) =>
    a.accountNumber?.toLowerCase().includes(search.toLowerCase()) ||
    a.customer?.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    a.customer?.user?.phone?.includes(search) ||
    a.product?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full">
            Financial Facilities
          </span>
          <h1 className="text-2xl font-black text-slate-950 mt-1 flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-brand-500" />
            Equal Monthly Installment (EMI) Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage customer installment financing agreements, schedules, payments reconciliation, and due reminders.
          </p>
        </div>
        <button
          onClick={loadEmi}
          className="p-2.5 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition w-fit"
          title="Refresh EMI Data"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Active EMI Accounts</span>
          <div className="text-2xl font-black text-slate-950 mt-1">{stats?.activeAccounts || 0}</div>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Total Financed (BDT)</span>
          <div className="text-2xl font-black text-slate-950 mt-1">৳{stats?.totalFinanced?.toLocaleString() || 0}</div>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-emerald-600">Total Collected</span>
          <div className="text-2xl font-black text-emerald-700 mt-1">৳{stats?.totalCollected?.toLocaleString() || 0}</div>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-amber-600">Outstanding Balance</span>
          <div className="text-2xl font-black text-amber-700 mt-1">৳{stats?.outstandingBalance?.toLocaleString() || 0}</div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Account #, Customer, Phone..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          {['ALL', 'ACTIVE', 'COMPLETED', 'DEFAULTED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl font-bold transition ${
                statusFilter === st ? 'bg-slate-950 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading EMI accounts...</div>
        ) : filteredAccounts.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">No EMI accounts found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-black tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Account #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Financed Product</th>
                  <th className="py-3 px-4">Down Payment</th>
                  <th className="py-3 px-4">Financed Amount</th>
                  <th className="py-3 px-4 text-center">Tenure</th>
                  <th className="py-3 px-4">Monthly Due</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Schedule</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredAccounts.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-black text-slate-900">{a.accountNumber}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{a.customer?.user?.name || 'Customer'}</div>
                      <div className="text-[11px] text-slate-400">{a.customer?.user?.phone}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{a.product?.name}</div>
                      {a.serialNumber && <div className="text-[10px] text-slate-400">S/N: {a.serialNumber}</div>}
                    </td>
                    <td className="py-3 px-4 text-slate-600">৳{a.downPayment?.toLocaleString()}</td>
                    <td className="py-3 px-4 font-black text-slate-950">৳{a.financedAmount?.toLocaleString()}</td>
                    <td className="py-3 px-4 text-center font-bold text-brand-700">{a.tenureMonths} Months</td>
                    <td className="py-3 px-4 font-black text-slate-900">৳{a.monthlyPayment?.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${a.status === 'ACTIVE' ? 'bg-brand-50 text-brand-700' : 'bg-emerald-50 text-emerald-700'}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => { setSelectedAccount(a); setShowInstallmentModal(true); }}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 transition"
                      >
                        Installments ({a.installments?.filter((i: any) => i.status === 'PAID').length}/{a.installments?.length})
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Installment Schedule Modal */}
      {showInstallmentModal && selectedAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Installment Schedule</span>
                <h3 className="font-black text-lg text-slate-950">{selectedAccount.accountNumber} &bull; {selectedAccount.product?.name}</h3>
                <p className="text-xs text-slate-500">Customer: {selectedAccount.customer?.user?.name} ({selectedAccount.customer?.user?.phone})</p>
              </div>
              <button onClick={() => setShowInstallmentModal(false)} className="p-1 rounded-xl text-slate-400 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 rounded-2xl overflow-hidden">
                <thead className="bg-slate-50 text-slate-600 font-bold">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Due Date</th>
                    <th className="py-2.5 px-3 text-right">Amount (BDT)</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Paid Date</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedAccount.installments?.map((inst: any) => (
                    <tr key={inst.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-slate-900">{inst.installmentNo}</td>
                      <td className="py-2.5 px-3 text-slate-600">{new Date(inst.dueDate).toLocaleDateString('en-GB')}</td>
                      <td className="py-2.5 px-3 text-right font-black text-slate-900">৳{inst.amount?.toLocaleString()}</td>
                      <td className="py-2.5 px-3">
                        <span className={`inline-block text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${inst.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                          {inst.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                        {inst.paidDate ? new Date(inst.paidDate).toLocaleDateString('en-GB') : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {inst.status !== 'PAID' ? (
                          <button
                            disabled={recordingId === inst.id}
                            onClick={() => handleRecordPayment(inst)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] transition disabled:opacity-50"
                          >
                            {recordingId === inst.id ? 'Recording...' : 'Mark Paid'}
                          </button>
                        ) : (
                          <span className="text-emerald-600 text-[10px] font-bold">Cleared</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
