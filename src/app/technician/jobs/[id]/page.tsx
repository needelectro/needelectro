'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import {
  Wrench, MapPin, Clock, Phone, ArrowLeft, CheckCircle2,
  AlertCircle, ShieldCheck, DollarSign, Plus, Package, Navigation,
  FileText, Calendar, Camera, ExternalLink, RefreshCw, Send,
  AlertTriangle, Pause, Play, Check, X, MessageSquare, UploadCloud,
  ChevronRight, LifeBuoy, Zap
} from 'lucide-react';

import { fastFetch, invalidateFastCache } from '@/lib/fastFetch';

const STATUS_PROGRESSION_ORDER = [
  'ASSIGNED',
  'ACCEPTED',
  'ON_THE_WAY',
  'ARRIVED',
  'INSPECTION_STARTED',
  'IN_PROGRESS',
  'COMPLETED',
];

const STATUS_BADGES: Record<string, { text: string; bg: string }> = {
  PENDING: { text: 'Pending Confirmation', bg: 'bg-amber-100 text-amber-800' },
  CONFIRMED: { text: 'Confirmed', bg: 'bg-blue-100 text-blue-800' },
  ASSIGNED: { text: 'Assigned to You', bg: 'bg-purple-100 text-purple-800' },
  ACCEPTED: { text: 'Accepted', bg: 'bg-blue-100 text-blue-800' },
  ON_THE_WAY: { text: 'En Route', bg: 'bg-indigo-100 text-indigo-800' },
  ARRIVED: { text: 'Arrived at Site', bg: 'bg-sky-100 text-sky-800' },
  INSPECTION_STARTED: { text: 'Inspection Started', bg: 'bg-cyan-100 text-cyan-800' },
  AWAITING_APPROVAL: { text: 'Awaiting Approval', bg: 'bg-amber-100 text-amber-900 border border-amber-300' },
  IN_PROGRESS: { text: 'Work in Progress', bg: 'bg-orange-100 text-orange-800' },
  WORK_STARTED: { text: 'Work in Progress', bg: 'bg-orange-100 text-orange-800' },
  ON_HOLD: { text: 'Work on Hold', bg: 'bg-rose-100 text-rose-800' },
  COMPLETED: { text: 'Completed', bg: 'bg-emerald-100 text-emerald-800' },
  WORK_COMPLETED: { text: 'Completed', bg: 'bg-emerald-100 text-emerald-800' },
  CANCELLED: { text: 'Cancelled', bg: 'bg-slate-100 text-slate-700' },
  REJECTED: { text: 'Assignment Rejected', bg: 'bg-slate-100 text-slate-700' },
  DISPUTED: { text: 'Dispute Flagged', bg: 'bg-red-100 text-red-800' },
};

export default function TechnicianJobControlCenter() {
  const router = useRouter();
  const params = useParams();
  const jobId = params?.id as string;
  const { user } = useAuth();

  // Warm cache initialization for zero-latency screen entry
  const [booking, setBooking] = useState<any>(() => {
    if (typeof window !== 'undefined' && jobId) {
      try {
        const raw = sessionStorage.getItem(`_ne_fast_/api/v1/bookings/${jobId}`);
        if (raw) return JSON.parse(raw).data?.booking || null;
      } catch {}
    }
    return null;
  });
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Active View Tab: 'details' | 'messages' | 'timeline'
  const [activeTab, setActiveTab] = useState<'details' | 'messages' | 'timeline'>('details');

  // Status Action Modal State
  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    targetStatus: string;
    title: string;
    requireReason: boolean;
    reasonPlaceholder?: string;
  }>({
    isOpen: false,
    targetStatus: '',
    title: '',
    requireReason: false,
  });
  const [modalReason, setModalReason] = useState('');

  // Approval Request Modal State
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [approvalAmount, setApprovalAmount] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');

  // Structured Completion Report Modal State
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [workPerformed, setWorkPerformed] = useState('');
  const [finalResolution, setFinalResolution] = useState('');
  const [handoverNotes, setHandoverNotes] = useState('');
  const [completionNotes, setCompletionNotes] = useState('');
  const [beforePhotosList, setBeforePhotosList] = useState<string[]>([]);
  const [afterPhotosList, setAfterPhotosList] = useState<string[]>([]);
  const [confirmCheck, setConfirmCheck] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Parts Modal
  const [isPartsModalOpen, setIsPartsModalOpen] = useState(false);
  const [catalogParts, setCatalogParts] = useState<any[]>([]);
  const [selectedPartId, setSelectedPartId] = useState('');
  const [customPartName, setCustomPartName] = useState('');
  const [partQty, setPartQty] = useState(1);
  const [partPrice, setPartPrice] = useState(0);
  const [partNotes, setPartNotes] = useState('');
  const [submittingPart, setSubmittingPart] = useState(false);

  // In-Job Messaging State
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/technician/login');
      return;
    }
    if (user.role !== 'TECHNICIAN' && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      router.push('/customer/dashboard');
      return;
    }
    loadJobDetails(false);
    loadCatalogParts();
  }, [jobId, user]);

  const loadJobDetails = async (showSpinner = false) => {
    if (showSpinner) setLoading(true);
    setError('');
    try {
      const data = await fastFetch(`/api/v1/bookings/${jobId}`, { ttlMs: 15000 });
      if (data?.booking) {
        setBooking(data.booking);

        // Pre-fill photos if already attached
        if (data.booking.beforePhotos) {
          setBeforePhotosList(data.booking.beforePhotos.split(',').map((s: string) => s.trim()).filter(Boolean));
        }
        if (data.booking.afterPhotos) {
          setAfterPhotosList(data.booking.afterPhotos.split(',').map((s: string) => s.trim()).filter(Boolean));
        }
      }

      // Load messages
      loadMessages();
    } catch (err: any) {
      if (!booking) setError(err.message || 'Error loading job');
    } finally {
      setLoading(false);
    }
  };

  const loadCatalogParts = async () => {
    try {
      const data = await fastFetch('/api/v1/parts', { ttlMs: 60000 });
      if (data?.parts) {
        setCatalogParts(data.parts);
      }
    } catch {
      // ignore
    }
  };

  const loadMessages = async () => {
    try {
      const d = await fastFetch(`/api/v1/bookings/${jobId}/messages`, { ttlMs: 10000 });
      if (d?.messages) {
        setMessages(d.messages);
      }
    } catch {
      // ignore
    }
  };

  const handleUpdateStatus = async (nextStatus: string, noteText?: string) => {
    const prevBooking = booking;
    // Zero-latency optimistic UI status progression
    setBooking((prev: any) => (prev ? { ...prev, status: nextStatus } : prev));
    setUpdating(true);
    setError('');
    setSuccessMsg('');

    try {
      invalidateFastCache('/api/v1/bookings');
      const isComplete = nextStatus === 'COMPLETED' || nextStatus === 'WORK_COMPLETED';
      const payload: any = {
        status: nextStatus,
        quickUpdate: true,
        quickComplete: isComplete,
        note: noteText || `Status updated to ${nextStatus.replace('_', ' ')} by technician.`,
        workPerformed: workPerformed.trim() || 'On-site technical service completed and verified.',
        finalResolution: finalResolution.trim() || 'Electrical and technical service successfully tested.',
        technicianNotes: completionNotes.trim() || 'Work executed and verified.',
        beforePhotos: beforePhotosList.join(','),
        afterPhotos: afterPhotosList.join(','),
      };

      const res = await fetch(`/api/v1/bookings/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        // Rollback
        setBooking(prevBooking);
        throw new Error(data.error || 'Failed to update job status');
      }

      setSuccessMsg(`Status updated to ${nextStatus.replace('_', ' ')}!`);
      setStatusModal({ isOpen: false, targetStatus: '', title: '', requireReason: false });
      setModalReason('');
      setIsCompletionModalOpen(false);

      // Background authoritative reconciliation
      fastFetch(`/api/v1/bookings/${jobId}`, { forceRefresh: true }).then((d) => {
        if (d?.booking) setBooking(d.booking);
      });
    } catch (err: any) {
      setBooking(prevBooking);
      setError(err.message || 'Failed to progress job');
    } finally {
      setUpdating(false);
    }
  };

  const handleSubmitApprovalRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!approvalAmount || isNaN(Number(approvalAmount)) || Number(approvalAmount) <= 0) {
      setError('Please provide a valid additional cost estimate.');
      return;
    }
    if (!approvalNotes || approvalNotes.trim().length < 5) {
      setError('Please provide clear notes explaining the required work or parts.');
      return;
    }

    setUpdating(true);
    setError('');
    try {
      const res = await fetch(`/api/v1/bookings/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'AWAITING_APPROVAL',
          note: `Technician requested customer approval for extra work/parts: ৳${Number(approvalAmount).toLocaleString()}. Details: ${approvalNotes.trim()}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit approval request');

      setSuccessMsg('Approval request submitted. Customer notified to review additional cost.');
      setIsApprovalModalOpen(false);
      setApprovalAmount('');
      setApprovalNotes('');
      await loadJobDetails();
    } catch (err: any) {
      setError(err.message || 'Error submitting approval request');
    } finally {
      setUpdating(false);
    }
  };

  const handleSubmitCompletionReport = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleUpdateStatus('COMPLETED', completionNotes.trim() || 'Work completed successfully.');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetType: 'before' | 'after') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bookingId', jobId);

      const res = await fetch('/api/v1/uploads', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload photo');

      if (targetType === 'before') {
        setBeforePhotosList((prev) => [...prev, data.url]);
      } else {
        setAfterPhotosList((prev) => [...prev, data.url]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload evidence');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSendingMessage(true);
    try {
      const res = await fetch(`/api/v1/bookings/${jobId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage.trim(), messageType: 'MESSAGE' }),
      });

      if (res.ok) {
        setNewMessage('');
        await loadMessages();
      }
    } catch {
      // ignore
    } finally {
      setSendingMessage(false);
    }
  };

  const handleAddPart = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingPart(true);
    setError('');
    try {
      const payload: any = {
        quantity: partQty,
        notes: partNotes,
      };

      if (selectedPartId) {
        payload.partId = selectedPartId;
      } else if (customPartName) {
        payload.partName = customPartName;
        payload.unitPrice = partPrice;
      } else {
        throw new Error('Please select an existing part or enter a custom part name.');
      }

      const res = await fetch(`/api/v1/bookings/${jobId}/parts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add part');

      setSuccessMsg('Spare part successfully added to invoice!');
      setIsPartsModalOpen(false);
      setSelectedPartId('');
      setCustomPartName('');
      setPartPrice(0);
      setPartNotes('');
      await loadJobDetails();
    } catch (err: any) {
      setError(err.message || 'Error adding spare part');
    } finally {
      setSubmittingPart(false);
    }
  };

  if (loading && !booking) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-black text-slate-900">Job Not Found or Access Restricted</h2>
        <p className="text-xs text-slate-500">{error || 'You are not assigned to this job.'}</p>
        <Link href="/technician/jobs" className="btn-primary text-xs py-2 px-4 inline-block">
          Return to Job Marketplace
        </Link>
      </div>
    );
  }

  const currentStatus = booking.status;
  const isCompleted = ['COMPLETED', 'WORK_COMPLETED'].includes(currentStatus);
  const isCancelled = currentStatus === 'CANCELLED';
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    booking.address
      ? `${booking.address.addressLine || ''}, ${booking.address.area || ''}, ${booking.address.upazila || ''}, ${booking.address.district || 'Moulvibazar'}`
      : 'Moulvibazar'
  )}`;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            href="/technician/jobs"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Job #{booking.bookingNumber}
              </h1>
              <span
                className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                  STATUS_BADGES[currentStatus]?.bg || 'bg-slate-100 text-slate-700'
                }`}
              >
                {STATUS_BADGES[currentStatus]?.text || currentStatus}
              </span>
              {booking.urgency === 'EMERGENCY' && (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-500 text-white animate-pulse">
                  EMERGENCY CALL
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Service: <span className="font-bold text-slate-800">{booking.service?.name}</span> · Created: {new Date(booking.createdAt).toLocaleDateString('en-GB')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => loadJobDetails(true)}
            disabled={updating}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition shadow-xs"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${updating ? 'animate-spin' : ''}`} />
          </button>
          <a
            href="tel:01733983752"
            className="px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 flex items-center gap-1.5 shadow-xs"
          >
            <LifeBuoy className="w-3.5 h-3.5" /> Dispatch Hotline
          </a>
        </div>
      </div>

      {/* Notifications / Alerts */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')}><X className="w-4 h-4" /></button>
        </div>
      )}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* ═══ EASY 1-TAP WORK STATUS CONTROL CENTER ═══ */}
      {!isCompleted && !isCancelled && (
        <div className="bg-white rounded-3xl border-2 border-brand-300 p-5 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-brand-50 text-brand-700 px-2.5 py-0.5 rounded-md border border-brand-200">
                  ⚡ Easy Status Control
                </span>
                <span className="text-xs text-slate-500 font-medium">1-Tap Instant Update</span>
              </div>
              <h3 className="text-base font-black text-slate-900 mt-1">
                Current Status: <span className="text-brand-600">{STATUS_BADGES[currentStatus]?.text || currentStatus}</span>
              </h3>
            </div>

            {/* Quick 1-Tap Status Buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => handleUpdateStatus('ACCEPTED', 'Technician accepted assignment.')}
                disabled={updating || currentStatus === 'ACCEPTED'}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs active:scale-95 ${
                  currentStatus === 'ACCEPTED'
                    ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                    : 'bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-700'
                }`}
                title="Accept job assignment"
              >
                <Check className="w-3.5 h-3.5" /> Accept
              </button>

              <button
                type="button"
                onClick={() => handleUpdateStatus('ON_THE_WAY', 'Technician en route to location.')}
                disabled={updating || currentStatus === 'ON_THE_WAY'}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs active:scale-95 ${
                  currentStatus === 'ON_THE_WAY'
                    ? 'bg-indigo-600 text-white ring-2 ring-indigo-300'
                    : 'bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700'
                }`}
                title="Mark en route"
              >
                <Navigation className="w-3.5 h-3.5" /> En Route
              </button>

              <button
                type="button"
                onClick={() => handleUpdateStatus('ARRIVED', 'Technician arrived at site.')}
                disabled={updating || currentStatus === 'ARRIVED'}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs active:scale-95 ${
                  currentStatus === 'ARRIVED'
                    ? 'bg-sky-600 text-white ring-2 ring-sky-300'
                    : 'bg-slate-100 text-slate-700 hover:bg-sky-50 hover:text-sky-700'
                }`}
                title="Mark arrived at location"
              >
                <MapPin className="w-3.5 h-3.5" /> Arrived
              </button>

              <button
                type="button"
                onClick={() => handleUpdateStatus('IN_PROGRESS', 'Work actively in progress.')}
                disabled={updating || currentStatus === 'IN_PROGRESS' || currentStatus === 'WORK_STARTED'}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs active:scale-95 ${
                  currentStatus === 'IN_PROGRESS' || currentStatus === 'WORK_STARTED'
                    ? 'bg-orange-600 text-white ring-2 ring-orange-300'
                    : 'bg-slate-100 text-slate-700 hover:bg-orange-50 hover:text-orange-700'
                }`}
                title="Start work"
              >
                <Wrench className="w-3.5 h-3.5" /> In Progress
              </button>

              <button
                type="button"
                onClick={() => handleUpdateStatus('COMPLETED', 'Work successfully completed.')}
                disabled={updating}
                className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95 transition"
                title="Mark job complete in 1 tap"
              >
                <CheckCircle2 className="w-4 h-4" /> ✅ Complete Job
              </button>

              <button
                type="button"
                onClick={() => handleUpdateStatus('ON_HOLD', 'Work temporarily on hold.')}
                disabled={updating || currentStatus === 'ON_HOLD'}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                  currentStatus === 'ON_HOLD'
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                title="Pause work"
              >
                <Pause className="w-3.5 h-3.5" /> On Hold
              </button>
            </div>
          </div>

          {/* Quick Helper / Optional Details Links */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 flex-wrap gap-2">
            <span className="flex items-center gap-1 text-slate-600 font-semibold">
              <Zap className="w-3.5 h-3.5 text-amber-500" /> Tap any status above to update immediately. No hard forms required.
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsPartsModalOpen(true)}
                className="text-brand-600 hover:underline font-bold flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Parts
              </button>
              <button
                type="button"
                onClick={() => setIsApprovalModalOpen(true)}
                className="text-amber-700 hover:underline font-bold flex items-center gap-1"
              >
                <DollarSign className="w-3 h-3" /> Extra Cost
              </button>
              <button
                type="button"
                onClick={() => setIsCompletionModalOpen(true)}
                className="text-slate-600 hover:underline font-semibold flex items-center gap-1"
              >
                <Camera className="w-3 h-3" /> Optional Photos &amp; Notes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-200 text-xs font-bold space-x-6">
        <button
          onClick={() => setActiveTab('details')}
          className={`pb-3 transition flex items-center gap-2 border-b-2 ${
            activeTab === 'details'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" /> Job Details &amp; Parts
        </button>
        <button
          onClick={() => setActiveTab('messages')}
          className={`pb-3 transition flex items-center gap-2 border-b-2 ${
            activeTab === 'messages'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <MessageSquare className="w-4 h-4" /> Customer Chat &amp; Updates ({messages.length})
        </button>
        <button
          onClick={() => setActiveTab('timeline')}
          className={`pb-3 transition flex items-center gap-2 border-b-2 ${
            activeTab === 'timeline'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4" /> Audit Timeline ({booking.timeline?.length || 0})
        </button>
      </div>

      {/* TAB 1: JOB DETAILS & PARTS */}
      {activeTab === 'details' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main 2-column info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Details Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-500" /> Customer &amp; Service Location
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Customer Name</span>
                  <p className="font-bold text-slate-800 text-sm mt-0.5">
                    {booking.customer?.user?.name || 'Verified Customer'}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Direct Contact Phone</span>
                  <p className="font-bold text-slate-800 text-sm mt-0.5">
                    {booking.customer?.user?.phone ? (
                      <a
                        href={`tel:${booking.customer.user.phone}`}
                        className="text-brand-600 hover:underline flex items-center gap-1 font-mono"
                      >
                        <Phone className="w-3.5 h-3.5" /> {booking.customer.user.phone}
                      </a>
                    ) : (
                      'Revealed upon acceptance'
                    )}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Premises Address</span>
                  <p className="font-semibold text-slate-700 mt-0.5">
                    {booking.address?.addressLine || 'Address details provided upon acceptance'}
                  </p>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Area: {booking.address?.area || 'Moulvibazar'}, {booking.address?.upazila || 'Moulvibazar Sadar'}, {booking.address?.district || 'Moulvibazar'}
                  </p>
                  {booking.address && (
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-brand-600 font-bold hover:underline mt-2"
                    >
                      <Navigation className="w-3.5 h-3.5" /> Navigate via Google Maps
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Problem Description & Media */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-brand-500" /> Customer Reported Issue
              </h3>
              <p className="text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-100 whitespace-pre-line leading-relaxed">
                {booking.problemDescription || 'General technical inspection requested.'}
              </p>

              {booking.customerNotes && (
                <div className="text-xs text-slate-600 bg-amber-50/50 p-3 rounded-2xl border border-amber-100">
                  <span className="font-bold text-amber-900">Customer Instructions: </span>
                  {booking.customerNotes}
                </div>
              )}

              {/* Customer Provided Photos */}
              {booking.mediaUrls && (
                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-bold uppercase text-slate-400">Customer Attached Photos</span>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {booking.mediaUrls.split(',').map((url: string, idx: number) => (
                      <a
                        key={idx}
                        href={url.trim()}
                        target="_blank"
                        rel="noreferrer"
                        className="w-20 h-20 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-100 block"
                      >
                        <img src={url.trim()} alt="Problem Evidence" className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Used Parts & Materials Section */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                  <Package className="w-4 h-4 text-brand-500" /> Parts &amp; Materials Used ({booking.bookingParts?.length || 0})
                </h3>
                {!isCompleted && !isCancelled && (
                  <button
                    onClick={() => setIsPartsModalOpen(true)}
                    className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Part
                  </button>
                )}
              </div>

              {(!booking.bookingParts || booking.bookingParts.length === 0) ? (
                <p className="text-xs text-slate-400 text-center py-4">
                  No spare parts or materials attached to this job yet.
                </p>
              ) : (
                <div className="divide-y divide-slate-100 text-xs">
                  {booking.bookingParts.map((item: any) => (
                    <div key={item.id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-800">{item.part?.name || 'Spare Part'}</p>
                        <p className="text-[11px] text-slate-400">
                          Qty: {item.quantity} · Rate: ৳{item.unitPrice}
                        </p>
                      </div>
                      <span className="font-black text-slate-900">৳{item.totalPrice}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Economics & Scheduling */}
          <div className="space-y-6">
            {/* Service Financial Breakdown */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" /> Service Economics
              </h3>

              <div className="space-y-2 text-xs divide-y divide-slate-100">
                <div className="flex justify-between pt-1">
                  <span className="text-slate-500">Total Billed Amount:</span>
                  <span className="font-black text-slate-900">৳{(booking.totalAmount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-slate-500">Platform Commission (15%):</span>
                  <span className="text-slate-600">৳{Math.round((booking.totalAmount || 0) * 0.15).toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2 text-sm font-black text-emerald-600">
                  <span>Your Net Share (85%):</span>
                  <span>৳{Math.round((booking.totalAmount || 0) * 0.85).toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-slate-500">Payment Status:</span>
                  <span
                    className={`font-black uppercase text-[10px] px-2 py-0.5 rounded-md ${
                      booking.paymentStatus === 'PAID'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {booking.paymentStatus || 'UNPAID'}
                  </span>
                </div>
              </div>
            </div>

            {/* Appointment Schedule */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
              <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-brand-500" /> Scheduled Appointment
              </h3>
              <div className="p-3 bg-slate-50 rounded-2xl text-xs space-y-1">
                <p className="font-bold text-slate-800">{booking.preferredDate}</p>
                <p className="text-slate-500">Slot: {booking.preferredTimeSlot}</p>
              </div>
              <p className="text-[11px] text-slate-400">
                Please maintain a 30-minute arrival window and notify customer if delayed.
              </p>
            </div>

            {/* 30-Day Workmanship Warranty Badge */}
            <div className="bg-brand-50/60 rounded-3xl border border-brand-200 p-5 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-brand-800 font-black text-xs">
                <ShieldCheck className="w-5 h-5 text-brand-600" /> 30-Day Service Warranty
              </div>
              <p className="text-[11px] text-brand-900/80 leading-relaxed">
                All work performed on this ticket includes NEED ELECTRO's 30-day workmanship warranty protection.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: IN-JOB CUSTOMER MESSAGES */}
      {activeTab === 'messages' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden flex flex-col h-[520px]">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="font-black text-xs text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-brand-500" /> Communication with Customer
              </h3>
              <p className="text-[11px] text-slate-400">Messages and arrival updates are logged in the job audit record.</p>
            </div>
            <button
              onClick={loadMessages}
              className="text-xs text-brand-600 font-bold hover:underline"
            >
              Refresh
            </button>
          </div>

          {/* Quick Presets */}
          <div className="p-3 bg-slate-100/60 border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-[11px]">
            <span className="font-bold text-slate-500 shrink-0">Quick Presets:</span>
            {[
              'I am on the way, ETA 20 mins.',
              'I have arrived outside your premises.',
              'Inspection completed. Please check your dashboard for approval details.',
              'Job successfully finished. Thank you!',
            ].map((preset) => (
              <button
                key={preset}
                onClick={() => setNewMessage(preset)}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-brand-400 text-slate-700 shrink-0 transition"
              >
                {preset}
              </button>
            ))}
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-12">
                No messages yet. Use the presets or message box below to update the customer.
              </p>
            ) : (
              messages.map((m: any) => (
                <div
                  key={m.id}
                  className={`p-3.5 rounded-2xl max-w-[85%] text-xs space-y-1 ${
                    m.actorRole === 'TECHNICIAN'
                      ? 'ml-auto bg-brand-500 text-white'
                      : 'mr-auto bg-slate-100 text-slate-800'
                  }`}
                >
                  <p className="font-medium whitespace-pre-wrap">{m.note}</p>
                  <span
                    className={`text-[9px] block text-right font-mono ${
                      m.actorRole === 'TECHNICIAN' ? 'text-brand-100' : 'text-slate-400'
                    }`}
                  >
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Message Input Box */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 flex items-center gap-2 bg-white">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type an update or question for customer..."
              className="flex-1 text-xs border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-brand-500"
            />
            <button
              type="submit"
              disabled={sendingMessage || !newMessage.trim()}
              className="btn-primary text-xs py-2.5 px-4 flex items-center gap-1 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" /> Send
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: TIMELINE & AUDIT TRAIL */}
      {activeTab === 'timeline' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="font-black text-sm text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <Clock className="w-4 h-4 text-brand-500" /> Complete Job Activity Timeline
          </h3>

          <div className="relative border-l-2 border-slate-200 ml-4 space-y-6 py-2">
            {booking.timeline?.map((event: any) => (
              <div key={event.id} className="relative pl-6">
                <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-2 border-brand-500" />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {event.status}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {new Date(event.timestamp).toLocaleString('en-GB')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-800 font-semibold mt-1">
                    {event.note}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Logged by {event.actorRole || 'SYSTEM'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: STATUS REASON MODAL (Reject, Cancel, Hold) */}
      {statusModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm text-slate-900">{statusModal.title}</h3>
              <button
                onClick={() => setStatusModal({ isOpen: false, targetStatus: '', title: '', requireReason: false })}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">
                Reason / Explanation <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={modalReason}
                onChange={(e) => setModalReason(e.target.value)}
                placeholder={statusModal.reasonPlaceholder || 'Provide details...'}
                className="w-full text-xs border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStatusModal({ isOpen: false, targetStatus: '', title: '', requireReason: false })}
                className="px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={statusModal.requireReason && modalReason.trim().length < 3}
                onClick={() => handleUpdateStatus(statusModal.targetStatus, modalReason.trim())}
                className="btn-primary text-xs py-2 px-4 disabled:opacity-50"
              >
                Confirm Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: REQUEST APPROVAL FOR EXTRA WORK / COSTS */}
      {isApprovalModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmitApprovalRequest}
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm text-slate-900">Request Extra Work / Cost Approval</h3>
              <button
                type="button"
                onClick={() => setIsApprovalModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              When unforeseen issues require extra materials or labor, submit this request. The customer will be prompted to approve on their portal before work commences.
            </p>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                Additional Estimated Cost (৳) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="50"
                value={approvalAmount}
                onChange={(e) => setApprovalAmount(e.target.value)}
                placeholder="e.g. 800"
                className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-brand-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                Diagnosis &amp; Reason for Extra Cost <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder="Describe why extra work or parts are needed..."
                className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-brand-500"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsApprovalModalOpen(false)}
                className="px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updating}
                className="btn-primary text-xs py-2 px-4 bg-amber-500 hover:bg-amber-600"
              >
                Submit for Approval
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 3: STRUCTURED JOB COMPLETION REPORT */}
      {isCompletionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleSubmitCompletionReport}
            className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 border border-slate-100 my-8 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Service Completion Report
              </h3>
              <button
                type="button"
                onClick={() => setIsCompletionModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                Work Performed &amp; Technical Execution <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={workPerformed}
                onChange={(e) => setWorkPerformed(e.target.value)}
                placeholder="e.g. Diagnosed short circuit, replaced burnt breaker, rewired main socket."
                className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-brand-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                Final Diagnosis &amp; Resolution <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={finalResolution}
                onChange={(e) => setFinalResolution(e.target.value)}
                placeholder="e.g. Electrical grounding restored to 220V standard."
                className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-brand-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Customer Handover Notes</label>
              <textarea
                rows={2}
                value={handoverNotes}
                onChange={(e) => setHandoverNotes(e.target.value)}
                placeholder="e.g. Advised customer not to overload 15A socket with multiple appliances."
                className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-brand-500"
              />
            </div>

            {/* Photo Evidence Uploaders */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-800 block">Photo Evidence (Before &amp; After)</span>

              {/* Before Photos */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
                  <span>Before-Work / Inspection Photos</span>
                  <label className="text-brand-600 hover:underline cursor-pointer flex items-center gap-1">
                    <UploadCloud className="w-3.5 h-3.5" /> Upload Photo
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'before')}
                    />
                  </label>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {beforePhotosList.map((url, i) => (
                    <div key={i} className="relative w-16 h-16 rounded-xl border border-slate-200 overflow-hidden shrink-0">
                      <img src={url} alt="Before" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setBeforePhotosList((p) => p.filter((_, idx) => idx !== i))}
                        className="absolute top-0 right-0 bg-rose-500 text-white p-0.5 rounded-bl"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* After Photos */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
                  <span>After-Work / Final Resolution Photos</span>
                  <label className="text-brand-600 hover:underline cursor-pointer flex items-center gap-1">
                    <UploadCloud className="w-3.5 h-3.5" /> Upload Photo
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'after')}
                    />
                  </label>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {afterPhotosList.map((url, i) => (
                    <div key={i} className="relative w-16 h-16 rounded-xl border border-slate-200 overflow-hidden shrink-0">
                      <img src={url} alt="After" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setAfterPhotosList((p) => p.filter((_, idx) => idx !== i))}
                        className="absolute top-0 right-0 bg-rose-500 text-white p-0.5 rounded-bl"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Confirmation Checkbox */}
            <label className="flex items-start gap-2.5 pt-2 text-xs text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmCheck}
                onChange={(e) => setConfirmCheck(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <span>
                I confirm that electrical safety protocols, equipment testing, and customer briefing have been completed accurately.
              </span>
            </label>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsCompletionModalOpen(false)}
                className="px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updating || !confirmCheck || !workPerformed.trim()}
                className="btn-primary text-xs py-2 px-5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
              >
                Submit &amp; Finalize Job
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 4: ADD PARTS */}
      {isPartsModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleAddPart}
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm text-slate-900">Add Spare Part / Material</h3>
              <button
                type="button"
                onClick={() => setIsPartsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Select Catalog Part</label>
              <select
                value={selectedPartId}
                onChange={(e) => {
                  setSelectedPartId(e.target.value);
                  if (e.target.value) setCustomPartName('');
                }}
                className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-brand-500"
              >
                <option value="">-- Choose from Catalog --</option>
                {catalogParts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (৳{p.price})
                  </option>
                ))}
              </select>
            </div>

            {!selectedPartId && (
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Or Specify Custom Part</span>
                <input
                  type="text"
                  value={customPartName}
                  onChange={(e) => setCustomPartName(e.target.value)}
                  placeholder="Part name (e.g., 16A Circuit Breaker)"
                  className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-brand-500"
                />
                <input
                  type="number"
                  min="0"
                  value={partPrice || ''}
                  onChange={(e) => setPartPrice(Number(e.target.value))}
                  placeholder="Unit Price (৳)"
                  className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-brand-500"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Quantity</label>
              <input
                type="number"
                min="1"
                value={partQty}
                onChange={(e) => setPartQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-brand-500"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsPartsModalOpen(false)}
                className="px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingPart}
                className="btn-primary text-xs py-2 px-4"
              >
                {submittingPart ? 'Adding...' : 'Attach Part'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
