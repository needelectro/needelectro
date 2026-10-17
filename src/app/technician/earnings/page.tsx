'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import {
  Wallet, DollarSign, ArrowUpRight, Clock, CheckCircle2,
  AlertCircle, ShieldCheck, RefreshCw, X, HelpCircle, FileText
} from 'lucide-react';

const PAYOUT_STATUS_BADGES: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Under Review', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  APPROVED: { label: 'Approved', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  PAID: { label: 'Disbursed / Settled', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  REJECTED: { label: 'Declined (Refunded)', color: 'bg-rose-50 text-rose-700 border-rose-200' },
};

export default function TechnicianEarningsPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [totalWithdrawn, setTotalWithdrawn] = useState(0);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [earningsLedger, setEarningsLedger] = useState<any[]>([]);
  const [walletTransactions, setWalletTransactions] = useState<any[]>([]);

  // Payout Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'BKASH' | 'NAGAD' | 'BANK_TRANSFER'>('BKASH');
  const [accountDetails, setAccountDetails] = useState('');
  const [submittingPayout, setSubmittingPayout] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/technician/login?redirect=/technician/earnings');
      return;
    }
    if (user.role !== 'TECHNICIAN' && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      router.push('/customer/dashboard');
      return;
    }
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [techRes, payoutRes] = await Promise.all([
        fetch('/api/v1/technicians/me'),
        fetch('/api/v1/technicians/payouts'),
      ]);

      if (techRes.ok) {
        const tData = await techRes.json();
        setProfile(tData.technician);
        setWalletBalance(tData.technician?.walletBalance || 0);
        setTotalWithdrawn(tData.technician?.totalWithdrawn || 0);
        setEarningsLedger(tData.recentEarnings || []);
        setWalletTransactions(tData.walletTransactions || []);
      }

      if (payoutRes.ok) {
        const pData = await payoutRes.json();
        setPayouts(pData.payouts || []);
      }
    } catch {
      setError('Failed to load financial records.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingPayout(true);
    setError('');
    setSuccessMsg('');

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 500) {
      setError('Minimum withdrawal amount is ৳500.');
      setSubmittingPayout(false);
      return;
    }

    if (numAmount > walletBalance) {
      setError(`Insufficient available balance. You have ৳${walletBalance.toLocaleString()}.`);
      setSubmittingPayout(false);
      return;
    }

    if (!accountDetails || accountDetails.trim().length < 5) {
      setError('Please provide a valid account number or bank transfer details.');
      setSubmittingPayout(false);
      return;
    }

    try {
      const res = await fetch('/api/v1/technicians/payouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: numAmount,
          paymentMethod,
          accountDetails: accountDetails.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit payout request.');
      }

      setSuccessMsg(data.message || 'Payout request submitted successfully and is under review.');
      setIsModalOpen(false);
      setAmount('');
      setAccountDetails('');
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Error processing payout request.');
    } finally {
      setSubmittingPayout(false);
    }
  };

  const isVerified = profile?.verificationStatus === 'VERIFIED';
  const hasPendingPayout = payouts.some((p) => p.status === 'PENDING');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Wallet className="w-6 h-6 text-brand-500" /> Technician Earnings &amp; Wallet
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time ledger of your 85% service earnings, platform commission breakdown, and bKash/Nagad/Bank payouts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            disabled={!isVerified || walletBalance < 500 || hasPendingPayout}
            className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5 shadow-md shadow-brand-500/20 disabled:opacity-50"
            title={
              !isVerified
                ? 'Account must be verified to withdraw'
                : hasPendingPayout
                ? 'You already have a payout pending review'
                : walletBalance < 500
                ? 'Minimum ৳500 required'
                : 'Withdraw funds'
            }
          >
            <ArrowUpRight className="w-4 h-4" /> Request Payout
          </button>
        </div>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Available Wallet Balance
          </span>
          <p className="text-3xl font-black text-slate-900">৳{walletBalance.toLocaleString()}</p>
          <p className="text-[11px] text-slate-500">
            {walletBalance >= 500 ? '✅ Ready for withdrawal' : 'Minimum ৳500 to withdraw'}
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Total Withdrawn to Date
          </span>
          <p className="text-3xl font-black text-slate-900">৳{totalWithdrawn.toLocaleString()}</p>
          <p className="text-[11px] text-slate-500">Settled via bKash, Nagad &amp; Bank</p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Transparent Commission Split
          </span>
          <p className="text-3xl font-black text-purple-700">85% / 15%</p>
          <p className="text-[11px] text-slate-500">You keep 85% of gross job value</p>
        </div>
      </div>

      {/* Commission & Policy Info */}
      <div className="bg-brand-50/70 border border-brand-200 rounded-3xl p-5 text-xs text-brand-900 flex items-start gap-3">
        <HelpCircle className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-black text-brand-900">NEED ELECTRO Certified Earnings Policy</p>
          <p className="text-brand-800 leading-relaxed">
            Earnings are credited automatically to your wallet the moment a job status reaches Completed.
            NEED ELECTRO retains a 15% platform fee for customer dispatch, warranty coverage, and customer support.
            Payouts are processed weekly directly to your registered bKash, Nagad, or Bangladeshi Bank Account.
          </p>
        </div>
      </div>

      {/* Payout History Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
            <ArrowUpRight className="w-4 h-4 text-brand-500" /> Withdrawal Payout History
          </h3>
          <span className="text-xs text-slate-400 font-semibold">{payouts.length} requests</span>
        </div>

        {payouts.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No withdrawal requests logged yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {payouts.map((p) => {
              const badge = PAYOUT_STATUS_BADGES[p.status] || {
                label: p.status,
                color: 'bg-slate-100 text-slate-700',
              };

              return (
                <div
                  key={p.id}
                  className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-900 text-sm">
                        ৳{p.amount?.toLocaleString()}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Method: <span className="font-bold">{p.paymentMethod}</span> ({p.accountDetails})
                    </p>
                    {p.trxId && (
                      <p className="text-[11px] font-mono text-emerald-700">
                        Transaction Ref: {p.trxId}
                      </p>
                    )}
                    {p.adminNotes && (
                      <p className="text-[11px] text-slate-500 italic">
                        Note: {p.adminNotes}
                      </p>
                    )}
                  </div>

                  <div className="text-right text-[11px] text-slate-400 self-end sm:self-auto">
                    {new Date(p.createdAt).toLocaleDateString('en-BD', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Job-by-Job Earnings Ledger */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
            <FileText className="w-4 h-4 text-brand-500" /> Completed Jobs Earnings Ledger
          </h3>
          <span className="text-xs text-slate-400 font-semibold">{earningsLedger.length} jobs</span>
        </div>

        {earningsLedger.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No completed jobs with credited earnings yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {earningsLedger.map((item) => (
              <div
                key={item.id}
                className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">
                      Job #{item.booking?.bookingNumber || item.bookingId?.slice(-6)}
                    </span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                      Credited
                    </span>
                  </div>
                  <p className="text-slate-500">
                    Gross Service Fee: ৳{item.serviceAmount?.toLocaleString()} · Platform Commission (15%): -৳{item.platformFee?.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {new Date(item.createdAt).toLocaleDateString('en-BD', {
                      dateStyle: 'medium',
                    })}
                  </p>
                </div>

                <div className="text-right self-end sm:self-auto">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Net Payout</span>
                  <p className="text-base font-black text-emerald-600">
                    +৳{item.technicianAmount?.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payout Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-brand-500" /> Request Withdrawal
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-xl hover:bg-slate-100 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Funds will be disbursed to your personal mobile financial service or bank account after technical audit.
            </p>

            <form onSubmit={handleRequestPayout} className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-bold text-slate-700">Withdrawal Amount (৳) *</label>
                  <span className="text-slate-500">Available: ৳{walletBalance.toLocaleString()}</span>
                </div>
                <input
                  type="number"
                  min={500}
                  max={walletBalance}
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Min ৳500"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Payment Channel *</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['BKASH', 'NAGAD', 'BANK_TRANSFER'] as const).map((method) => (
                    <button
                      type="button"
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`p-2.5 rounded-xl border text-xs font-black transition ${
                        paymentMethod === method
                          ? 'border-brand-500 bg-brand-50 text-brand-900'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {method === 'BANK_TRANSFER' ? 'Bank' : method}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  {paymentMethod === 'BANK_TRANSFER'
                    ? 'Bank Name, Branch, Account Number & Holder'
                    : 'Personal Mobile Number (11 digits)'} *
                </label>
                <input
                  type="text"
                  required
                  value={accountDetails}
                  onChange={(e) => setAccountDetails(e.target.value)}
                  placeholder={
                    paymentMethod === 'BANK_TRANSFER'
                      ? 'Islami Bank, Mirpur Branch, Acc: 2050...'
                      : '01XXXXXXXXX'
                  }
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPayout}
                  className="btn-primary px-5 py-2 text-xs font-bold"
                >
                  {submittingPayout ? 'Submitting...' : 'Confirm Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
