'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import {
  Wrench, MapPin, Clock, Phone, ArrowLeft, CheckCircle2,
  AlertCircle, ShieldCheck, DollarSign, Plus, Package, Navigation,
  FileText, Calendar, Camera, ExternalLink, RefreshCw
} from 'lucide-react';

const STATUS_PROGRESSION: Record<string, { label: string; next: string; description: string }> = {
  ACCEPTED: {
    label: 'Mark: On The Way',
    next: 'ON_THE_WAY',
    description: 'Notify customer you are travelling to their premises.',
  },
  ON_THE_WAY: {
    label: 'Mark: Arrived at Site',
    next: 'ARRIVED',
    description: 'Confirm arrival at customer address.',
  },
  ARRIVED: {
    label: 'Start Diagnostics & Work',
    next: 'WORK_STARTED',
    description: 'Begin electrical diagnosis and service execution.',
  },
  WORK_STARTED: {
    label: 'Complete Service & Submit Work',
    next: 'COMPLETED',
    description: 'Finalize service, attach used parts, and submit evidence.',
  },
};

const STATUS_BADGES: Record<string, { text: string; bg: string }> = {
  PENDING: { text: 'Pending Confirmation', bg: 'bg-amber-100 text-amber-800' },
  CONFIRMED: { text: 'Confirmed', bg: 'bg-blue-100 text-blue-800' },
  ASSIGNED: { text: 'Assigned to You', bg: 'bg-purple-100 text-purple-800' },
  ACCEPTED: { text: 'Accepted', bg: 'bg-brand-100 text-brand-800' },
  ON_THE_WAY: { text: 'En Route', bg: 'bg-indigo-100 text-indigo-800' },
  ARRIVED: { text: 'Arrived at Site', bg: 'bg-sky-100 text-sky-800' },
  WORK_STARTED: { text: 'Work in Progress', bg: 'bg-orange-100 text-orange-800' },
  COMPLETED: { text: 'Completed', bg: 'bg-emerald-100 text-emerald-800' },
  WORK_COMPLETED: { text: 'Completed', bg: 'bg-emerald-100 text-emerald-800' },
  CANCELLED: { text: 'Cancelled', bg: 'bg-rose-100 text-rose-800' },
};

export default function TechnicianJobDetailWorkspace() {
  const router = useRouter();
  const params = useParams();
  const jobId = params?.id as string;
  const { user } = useAuth();

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Parts Modal
  const [isPartsModalOpen, setIsPartsModalOpen] = useState(false);
  const [catalogParts, setCatalogParts] = useState<any[]>([]);
  const [selectedPartId, setSelectedPartId] = useState('');
  const [customPartName, setCustomPartName] = useState('');
  const [partQty, setPartQty] = useState(1);
  const [partPrice, setPartPrice] = useState(0);
  const [partNotes, setPartNotes] = useState('');
  const [submittingPart, setSubmittingPart] = useState(false);

  // Completion Form
  const [technicianNotes, setTechnicianNotes] = useState('');
  const [beforePhotos, setBeforePhotos] = useState('');
  const [afterPhotos, setAfterPhotos] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/technician/login');
      return;
    }
    if (user.role !== 'TECHNICIAN' && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      router.push('/customer/dashboard');
      return;
    }
    loadJobDetails();
    loadCatalogParts();
  }, [jobId, user]);

  const loadJobDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/v1/bookings/${jobId}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to load job details');
      }
      const data = await res.json();
      setBooking(data.booking);
      if (data.booking.technicianNotes) {
        setTechnicianNotes(data.booking.technicianNotes);
      }
    } catch (err: any) {
      setError(err.message || 'Error loading job');
    } finally {
      setLoading(false);
    }
  };

  const loadCatalogParts = async () => {
    try {
      const res = await fetch('/api/v1/parts');
      if (res.ok) {
        const data = await res.json();
        setCatalogParts(data.parts || []);
      }
    } catch {
      // ignore
    }
  };

  const handleUpdateStatus = async (nextStatus: string) => {
    setUpdating(true);
    setError('');
    setSuccessMsg('');
    try {
      const payload: any = { status: nextStatus };
      if (nextStatus === 'COMPLETED') {
        payload.technicianNotes = technicianNotes;
        if (beforePhotos) payload.beforePhotos = beforePhotos;
        if (afterPhotos) payload.afterPhotos = afterPhotos;
      }

      const res = await fetch(`/api/v1/bookings/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update job status');
      }

      setSuccessMsg(`Job status successfully progressed to ${nextStatus}!`);
      await loadJobDetails();
    } catch (err: any) {
      setError(err.message || 'Failed to progress job');
    } finally {
      setUpdating(false);
    }
  };

  const handleAddPart = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingPart(true);
    setError('');
    try {
      const payload: any = {
        quantity: partQty,
        unitPrice: partPrice,
        notes: partNotes,
      };

      if (selectedPartId) {
        payload.partId = selectedPartId;
      } else {
        if (!customPartName.trim()) {
          throw new Error('Please select an item from catalog or enter a custom part name.');
        }
        payload.partName = customPartName.trim();
      }

      const res = await fetch(`/api/v1/bookings/${jobId}/parts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to add part');
      }

      setIsPartsModalOpen(false);
      setSelectedPartId('');
      setCustomPartName('');
      setPartQty(1);
      setPartPrice(0);
      setPartNotes('');
      await loadJobDetails();
      setSuccessMsg('Replacement part recorded and added to service bill.');
    } catch (err: any) {
      setError(err.message || 'Error adding part');
    } finally {
      setSubmittingPart(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto" />
        <p className="text-xs font-semibold text-slate-500">Loading job workspace &amp; customer directions...</p>
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
          {error}
        </div>
        <Link href="/technician/jobs" className="btn-primary text-xs py-2.5 px-5 inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Return to Job Queue
        </Link>
      </div>
    );
  }

  const nextStep = STATUS_PROGRESSION[booking.status];
  const isCompleted = booking.status === 'COMPLETED' || booking.status === 'WORK_COMPLETED';
  const customerUser = booking.customer?.user;
  const address = booking.address;
  const fullAddressString = [
    address?.addressLine,
    address?.area,
    address?.upazila,
    address?.district,
    address?.division,
  ].filter(Boolean).join(', ');

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    fullAddressString || 'Moulvibazar Bangladesh'
  )}`;

  const totalPartsCost = booking.bookingParts?.reduce(
    (acc: number, p: any) => acc + (p.totalPrice || 0),
    0
  ) || 0;
  const technicianCut = Math.round(booking.totalAmount * 0.85);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top Bar Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            href="/technician/jobs"
            className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition shadow-xs"
            title="Back to Jobs"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Job #{booking.bookingNumber || booking.id.slice(-6)}
              </h1>
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  STATUS_BADGES[booking.status]?.bg || 'bg-slate-100 text-slate-700'
                }`}
              >
                {STATUS_BADGES[booking.status]?.text || booking.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {booking.service?.title || 'NEED ELECTRO Technical Service'} · Scheduled for {booking.scheduledDate ? new Date(booking.scheduledDate).toLocaleDateString('en-BD', { dateStyle: 'long' }) : 'Prompt Dispatch'}
            </p>
          </div>
        </div>

        <button
          onClick={loadJobDetails}
          disabled={updating}
          className="self-start sm:self-auto inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${updating ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Notifications */}
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

      {/* Primary Action Hero Bar */}
      {!isCompleted && nextStep && (
        <div className="bg-gradient-to-r from-brand-500 to-brand-700 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-black tracking-widest text-brand-100 bg-white/10 px-2.5 py-0.5 rounded-full">
              Current Mission Step
            </span>
            <h2 className="text-xl font-black">{nextStep.label}</h2>
            <p className="text-xs text-brand-100">{nextStep.description}</p>
          </div>

          <button
            onClick={() => handleUpdateStatus(nextStep.next)}
            disabled={updating}
            className="px-6 py-3 bg-white text-brand-700 hover:bg-brand-50 font-black text-sm rounded-2xl shadow-lg transition transform active:scale-95 disabled:opacity-50"
          >
            {updating ? 'Updating Status...' : nextStep.label}
          </button>
        </div>
      )}

      {isCompleted && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 text-emerald-900 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-black text-base">Service Successfully Completed</h3>
            <p className="text-xs text-emerald-700 mt-0.5">
              Work has been signed off. ৳{technicianCut.toLocaleString()} (85%) has been credited to your technician wallet ledger.
            </p>
          </div>
        </div>
      )}

      {/* Main Grid: Customer info & Job details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Customer and Location */}
        <div className="space-y-6 lg:col-span-1">
          {/* Customer Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Phone className="w-4 h-4 text-brand-500" /> Customer Information
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Customer Name</p>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{customerUser?.name || 'Verified Customer'}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Direct Mobile Phone</p>
                {customerUser?.phone ? (
                  <a
                    href={`tel:${customerUser.phone}`}
                    className="inline-flex items-center gap-2 mt-1 px-3 py-1.5 bg-brand-50 text-brand-700 font-bold rounded-xl hover:bg-brand-100 transition"
                  >
                    <Phone className="w-3.5 h-3.5" /> {customerUser.phone}
                  </a>
                ) : (
                  <p className="text-slate-500 font-mono">Not provided</p>
                )}
              </div>
            </div>
          </div>

          {/* Service Address & Navigation */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-2 border-b border-slate-100 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-500" /> Service Location
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Address Line</p>
                <p className="font-semibold text-slate-800 mt-0.5">{address?.addressLine || 'Detailed address provided upon dispatch'}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Area/Thana:</span>
                  <p className="font-semibold text-slate-800">{address?.upazila || address?.area || 'Moulvibazar'}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">District:</span>
                  <p className="font-semibold text-slate-800">{address?.district || 'Moulvibazar'}</p>
                </div>
              </div>

              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full py-2.5 text-xs flex items-center justify-center gap-2 mt-2 shadow-xs"
              >
                <Navigation className="w-4 h-4" /> Open in Google Maps
              </a>
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-2 border-b border-slate-100 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-brand-500" /> Service Pricing &amp; Payout
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Total Service Bill:</span>
                <span className="font-bold text-slate-900">৳{booking.totalAmount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>Platform Fee (15%):</span>
                <span>-৳{(booking.totalAmount * 0.15).toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-between font-black text-sm text-emerald-600">
                <span>Technician Payout (85%):</span>
                <span>৳{technicianCut.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px] pt-1">
                <span>Payment Method:</span>
                <span className="font-semibold uppercase">{booking.paymentMethod?.replace(/_/g, ' ') || 'Cash on Delivery'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Work Scope, Parts, Evidence & Completion */}
        <div className="space-y-6 lg:col-span-2">
          {/* Work Description */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-brand-500" /> Customer Problem Description
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {booking.customerNotes || booking.description || 'Standard technical inspection and electrical repair as requested by the client.'}
            </p>
          </div>

          {/* Parts Used Section */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Package className="w-4 h-4 text-brand-500" /> Hardware &amp; Replacement Parts
              </h3>
              {!isCompleted && (
                <button
                  onClick={() => setIsPartsModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-50 text-brand-700 rounded-xl text-xs font-bold hover:bg-brand-100 transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Part
                </button>
              )}
            </div>

            {booking.bookingParts?.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">
                No parts recorded. If electrical materials (e.g. circuit breakers, wiring, sockets) were supplied, record them above.
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {booking.bookingParts?.map((bp: any) => (
                  <div key={bp.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-800">{bp.part?.name || bp.partName || 'Hardware Item'}</p>
                      <p className="text-[10px] text-slate-400">
                        Qty: {bp.quantity} × ৳{bp.unitPrice}
                      </p>
                    </div>
                    <span className="font-bold text-slate-900">৳{bp.totalPrice}</span>
                  </div>
                ))}
                <div className="pt-2 flex justify-between font-black text-xs text-slate-900">
                  <span>Total Parts Billed:</span>
                  <span>৳{totalPartsCost.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>

          {/* Completion Form (If Work Started or Completed) */}
          {(booking.status === 'WORK_STARTED' || isCompleted) && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-2 border-b border-slate-100 flex items-center gap-2">
                <Camera className="w-4 h-4 text-brand-500" /> Work Summary &amp; Verification Evidence
              </h3>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Work Performed Notes</label>
                  <textarea
                    rows={3}
                    disabled={isCompleted}
                    value={technicianNotes}
                    onChange={(e) => setTechnicianNotes(e.target.value)}
                    placeholder="Describe the diagnosis, repairs made, circuit safety testing, and advice given to the customer..."
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 disabled:opacity-80"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Before Photo URL (Optional)</label>
                    <input
                      type="url"
                      disabled={isCompleted}
                      value={beforePhotos}
                      onChange={(e) => setBeforePhotos(e.target.value)}
                      placeholder="https://..."
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl disabled:opacity-80"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">After / Finished Photo URL (Optional)</label>
                    <input
                      type="url"
                      disabled={isCompleted}
                      value={afterPhotos}
                      onChange={(e) => setAfterPhotos(e.target.value)}
                      placeholder="https://..."
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl disabled:opacity-80"
                    />
                  </div>
                </div>

                {booking.status === 'WORK_STARTED' && (
                  <button
                    onClick={() => handleUpdateStatus('COMPLETED')}
                    disabled={updating}
                    className="btn-primary w-full py-3 text-xs flex items-center justify-center gap-2 shadow-md shadow-brand-500/20"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {updating ? 'Finalizing Job...' : 'Submit & Complete Job (Crediting 85% Earnings)'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Timeline Audit History */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-500" /> Activity &amp; Dispatch Timeline
            </h3>

            <div className="space-y-3">
              {booking.timeline?.map((item: any) => (
                <div key={item.id} className="flex items-start gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <p className="font-bold text-slate-800">{item.note || item.status}</p>
                    <p className="text-[10px] text-slate-400">
                      {new Date(item.timestamp).toLocaleString('en-BD')} · {item.actorRole}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Parts Modal */}
      {isPartsModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-brand-500" /> Add Replacement Hardware
            </h3>
            <p className="text-xs text-slate-500">
              Select verified electrical materials from NEED ELECTRO catalog or enter custom parts provided.
            </p>

            <form onSubmit={handleAddPart} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Catalog Item</label>
                <select
                  value={selectedPartId}
                  onChange={(e) => {
                    const pid = e.target.value;
                    setSelectedPartId(pid);
                    const found = catalogParts.find((p) => p.id === pid);
                    if (found) {
                      setPartPrice(found.price);
                    }
                  }}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="">-- Custom / Direct Material --</option>
                  {catalogParts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (৳{p.price})
                    </option>
                  ))}
                </select>
              </div>

              {!selectedPartId && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Custom Part Name</label>
                  <input
                    type="text"
                    required
                    value={customPartName}
                    onChange={(e) => setCustomPartName(e.target.value)}
                    placeholder="e.g. 16A Circuit Breaker, 1.5 RM Wire (Coil)"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Quantity</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={partQty}
                    onChange={(e) => setPartQty(parseInt(e.target.value, 10) || 1)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Unit Price (৳)</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={partPrice}
                    onChange={(e) => setPartPrice(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Notes / Brand</label>
                <input
                  type="text"
                  value={partNotes}
                  onChange={(e) => setPartNotes(e.target.value)}
                  placeholder="e.g. BRB Cable, Schneider Electric"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex justify-between font-bold">
                <span>Subtotal Addition:</span>
                <span className="text-brand-600">৳{(partQty * partPrice).toLocaleString()}</span>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsPartsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPart}
                  className="btn-primary px-4 py-2 text-xs font-bold"
                >
                  {submittingPart ? 'Recording...' : 'Add to Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
