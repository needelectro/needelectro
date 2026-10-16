'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  ChevronRight, Calendar, MapPin, Clock,
  CheckCircle2, Wrench, Camera, FileText, Phone, X, ShieldCheck,
  Zap, MessageCircle, AlertTriangle, ArrowRight, Sparkles, HelpCircle
} from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { BANGLADESH_DISTRICTS, DistrictData } from '@/lib/data/districts';

const BANGLADESH_DIVISIONS = [
  'Sylhet',
  'Dhaka',
  'Chattogram',
  'Rajshahi',
  'Khulna',
  'Barishal',
  'Rangpur',
  'Mymensingh',
];

const SERVICE_CATEGORIES = [
  { id: 'ELECTRICAL', icon: '⚡', label: 'Electrical Work', desc: 'Wiring, circuits, switches, breakers' },
  { id: 'INSTALLATION', icon: '❄️', label: 'AC & Cooling', desc: 'AC install, gas refill, servicing' },
  { id: 'CCTV', icon: '📹', label: 'CCTV & Security', desc: 'HD/IP camera setup & maintenance' },
  { id: 'COMPUTER', icon: '💻', label: 'Computer Service', desc: 'Hardware repair, diagnostics, OS' },
  { id: 'NETWORKING', icon: '🌐', label: 'Networking & WiFi', desc: 'Router, switch, LAN cabling' },
  { id: 'IPS_INVERTER', icon: '🔋', label: 'IPS / Inverter', desc: 'Battery bank, inverter setup' },
  { id: 'SMART_HOME', icon: '🏠', label: 'Smart Home', desc: 'Smart automation & IoT switches' },
  { id: 'EMERGENCY', icon: '🚨', label: 'Emergency 24/7', desc: 'Short circuit, sparking, blackout' },
];

const QUICK_ISSUES = [
  { label: '⚡ Short Circuit / Sparking', category: 'ELECTRICAL', desc: 'Main circuit breaker tripping or sparking at outlet' },
  { label: '❄️ AC Servicing & Cooling Issue', category: 'INSTALLATION', desc: 'AC not cooling properly or water dripping' },
  { label: '📹 CCTV Camera Offline / Blur', category: 'CCTV', desc: 'Camera video loss or DVR storage issues' },
  { label: '💡 Fan & Light Installation', category: 'ELECTRICAL', desc: 'Ceiling fan, chandelier, or LED panel fitting' },
  { label: '💻 Computer / Laptop Diagnostic', category: 'COMPUTER', desc: 'Slow system, no display, or hardware repair' },
  { label: '🔋 IPS Battery / Power Backup', category: 'IPS_INVERTER', desc: 'Inverter not charging or low backup time' },
  { label: '🚨 Power Blackout / Urgent Help', category: 'EMERGENCY', desc: 'Sudden total power outage or dangerous fault' },
];

const TIME_SLOTS = [
  '9:00 AM – 11:00 AM',
  '11:00 AM – 1:00 PM',
  '2:00 PM – 4:00 PM',
  '4:00 PM – 6:00 PM',
  '6:00 PM – 8:00 PM',
];

function BookingFormInner() {
  const { user } = useAuth();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [bookingResult, setBookingResult] = useState<any>(null);
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const [bookingComplete, setBookingComplete] = useState(false);

  const initialCat = searchParams.get('category')?.toUpperCase() || 'ELECTRICAL';
  const initialUrgency = searchParams.get('urgency')?.toUpperCase() === 'EMERGENCY' ? 'EMERGENCY' : 'NORMAL';

  const [form, setForm] = useState({
    categoryId: initialCat,
    serviceId: searchParams.get('service') || '',
    description: '',
    customerName: user?.name || '',
    customerPhone: user?.phone || '',
    division: 'Sylhet',
    district: 'Moulvibazar',
    upazila: 'Moulvibazar Sadar',
    area: 'Kusumbag Point',
    addressLine: '',
    landmark: '',
    preferredDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    preferredTimeSlot: TIME_SLOTS[0],
    urgency: initialUrgency,
  });

  // Sync user info if signed in
  useEffect(() => {
    if (user) {
      setForm((p) => ({
        ...p,
        customerName: p.customerName || user.name || '',
        customerPhone: p.customerPhone || user.phone || '',
      }));
    }
  }, [user]);

  useEffect(() => {
    fetch('/api/v1/services')
      .then((r) => r.json())
      .then((d) => {
        const svcs = d.services || [];
        setServices(svcs);
        const preselected = searchParams.get('service');
        if (preselected && svcs.some((s: any) => s.id === preselected)) {
          setForm((p) => ({ ...p, serviceId: preselected }));
        }
      })
      .catch(() => {});
  }, [searchParams]);

  const availableDistricts = BANGLADESH_DISTRICTS.filter(
    (d) => d.division.toLowerCase() === form.division.toLowerCase()
  );

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).slice(0, 3).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAttachedImages((prev) => [...prev, event.target!.result as string].slice(0, 4));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setAttachedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleQuickIssueSelect = (issue: typeof QUICK_ISSUES[0]) => {
    setForm((p) => ({
      ...p,
      categoryId: issue.category,
      description: issue.desc,
      urgency: issue.category === 'EMERGENCY' ? 'EMERGENCY' : p.urgency,
    }));
  };

  const filteredServices = form.categoryId
    ? services.filter(
        (s) =>
          s.category?.slug?.includes(form.categoryId.toLowerCase()) ||
          s.category?.name?.toUpperCase()?.includes(form.categoryId)
      )
    : services;

  const selectedService = services.find((s) => s.id === form.serviceId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.customerPhone.trim()) {
      alert('Please enter your mobile phone number so our coordinator can contact you.');
      return;
    }

    if (!form.description.trim()) {
      alert('Please briefly describe what problem needs fixing.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/v1/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: form.serviceId || (filteredServices[0]?.id || services[0]?.id || 'svc_general'),
          problemDescription: form.description,
          customerName: form.customerName || 'Valued Customer',
          customerPhone: form.customerPhone,
          location: {
            division: form.division,
            district: form.district,
            upazila: form.upazila,
            area: form.area,
            addressLine: form.addressLine || `${form.area}, ${form.upazila}`,
            landmark: form.landmark,
          },
          preferredDate: form.preferredDate,
          preferredTimeSlot: form.preferredTimeSlot,
          urgency: form.urgency,
          mediaUrls: attachedImages.length > 0 ? attachedImages.join('|||') : null,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setBookingResult(data.booking);
        setBookingComplete(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        alert(data.error || 'Could not register booking. Please try calling 01733 983752.');
      }
    } catch {
      alert('Network error while booking. You can also call us directly at 01733 983752.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-brand-600">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/services" className="hover:text-brand-600">Services</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 font-bold">Book a Service</span>
      </nav>

      {/* SUCCESS CONFIRMATION SCREEN */}
      {bookingComplete && bookingResult ? (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 text-center space-y-6 shadow-xl max-w-2xl mx-auto animate-in fade-in zoom-in-95">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <Sparkles className="w-3.5 h-3.5" /> Booking Confirmed &amp; Dispatched
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              Technician Request Registered!
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
              Your service request has been queued for a certified technician in your area. Our coordinator will call you to confirm arrival.
            </p>
            <div className="pt-2">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Your Booking Tracking ID</span>
              <p className="text-xl sm:text-2xl font-mono font-black text-brand-600 bg-brand-50 inline-block px-4 py-1.5 rounded-xl border border-brand-200 mt-1">
                {bookingResult.bookingNumber}
              </p>
            </div>
          </div>

          {/* Booking Summary Box */}
          <div className="bg-slate-50 p-5 rounded-2xl text-xs text-left space-y-2.5 text-slate-700 border border-slate-200/80">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
              <span className="text-slate-500 font-semibold">Service:</span>
              <span className="font-bold text-slate-900">{selectedService?.name || form.categoryId}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
              <span className="text-slate-500 font-semibold">Location:</span>
              <span className="font-bold text-slate-900">{form.upazila}, {form.district}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
              <span className="text-slate-500 font-semibold">Preferred Schedule:</span>
              <span className="font-bold text-slate-900">{form.preferredDate} ({form.preferredTimeSlot})</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-semibold">Contact Phone:</span>
              <span className="font-bold text-brand-600 font-mono">{form.customerPhone}</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <a
              href={`https://wa.me/8801733983752?text=${encodeURIComponent(`Hello NEED ELECTRO! I booked service ${bookingResult.bookingNumber} for ${selectedService?.name || form.categoryId} in ${form.district}. Please confirm dispatch.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-md shadow-emerald-600/20 app-tap"
            >
              <MessageCircle className="w-4 h-4" /> Message on WhatsApp
            </a>
            <Link
              href="/customer/dashboard?tab=bookings"
              className="flex-1 btn-primary text-xs py-3 justify-center"
            >
              Track in Customer Portal
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Top Banner: Easy Booking Assurance */}
          <div className="bg-gradient-to-r from-brand-600 via-brand-500 to-sky-600 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
            <div className="max-w-2xl space-y-2 relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-black uppercase tracking-wider text-white border border-white/30">
                <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300" /> Fast 1-Minute Booking
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Book a Verified Technician in 60 Seconds
              </h1>
              <p className="text-xs sm:text-sm text-brand-100 leading-relaxed">
                No complex account setup required. Select your trade, tell us where to visit, and our certified electrical and technology team takes care of the rest.
              </p>
            </div>

            {/* Direct Phone / WhatsApp Pill on Header */}
            <div className="mt-4 sm:mt-6 pt-4 border-t border-white/20 flex flex-wrap items-center gap-3 text-xs">
              <span className="text-brand-100 font-semibold">Prefer to book by phone or WhatsApp?</span>
              <a
                href="tel:01733983752"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-brand-700 font-black hover:bg-brand-50 transition shadow-xs"
              >
                <Phone className="w-3.5 h-3.5 text-brand-600" /> Hotline: 01733 983752
              </a>
              <a
                href="https://wa.me/8801733983752?text=Hello%20NEED%20ELECTRO!%20I%20need%20a%20technician%20visit."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition shadow-xs"
              >
                <MessageCircle className="w-3.5 h-3.5" /> WhatsApp Us
              </a>
            </div>
          </div>

          {/* Quick Problem Selector (1-Click Fill) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-500" />
                Quick Select Common Issues (1-Click Fill)
              </h2>
              <span className="text-[11px] text-slate-400">Click to autofill</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {QUICK_ISSUES.map((issue, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickIssueSelect(issue)}
                  className={`text-xs px-3.5 py-2 rounded-xl border font-bold shrink-0 transition-all text-left ${
                    form.description === issue.desc
                      ? 'border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-500/20 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {issue.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main Booking Form Grid */}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
            {/* Left 7 Columns: Trade & Problem Details */}
            <div className="lg:col-span-7 space-y-6">
              {/* Category Selector */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-900">1. Select Service Category</h3>
                  <span className="text-[11px] font-bold text-brand-600">Step 1 of 2</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {SERVICE_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, categoryId: cat.id }))}
                      className={`p-3 rounded-2xl border-2 text-left transition-all ${
                        form.categoryId === cat.id
                          ? 'border-brand-500 bg-brand-50 shadow-xs scale-[1.01]'
                          : 'border-slate-200/90 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <span className="text-2xl block mb-1">{cat.icon}</span>
                      <p className="text-xs font-black text-slate-900 leading-snug">{cat.label}</p>
                      <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{cat.desc}</p>
                    </button>
                  ))}
                </div>

                {/* Specific Packages Dropdown / Radio if available */}
                {filteredServices.length > 0 && (
                  <div className="pt-3 border-t border-slate-100">
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                      Specific Service Package (Optional):
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {filteredServices.slice(0, 6).map((svc) => (
                        <label
                          key={svc.id}
                          className={`flex items-start justify-between p-2.5 rounded-xl border cursor-pointer transition text-xs ${
                            form.serviceId === svc.id
                              ? 'border-brand-500 bg-brand-50/70 font-bold text-brand-800'
                              : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="serviceId"
                              checked={form.serviceId === svc.id}
                              onChange={() => setForm((p) => ({ ...p, serviceId: svc.id }))}
                              className="accent-brand-500"
                            />
                            <span className="truncate">{svc.name}</span>
                          </div>
                          <span className="text-[11px] font-black text-brand-600 shrink-0 ml-1">
                            {svc.basePrice > 0 ? `৳${svc.basePrice}` : 'Free Quote'}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Problem Description & Photo Upload */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-black text-slate-900">2. Describe The Issue</h3>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex justify-between">
                    <span>What needs to be fixed or installed? *</span>
                    <span className="text-[11px] text-slate-400">Be as brief or detailed as you like</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    placeholder="e.g. Master bedroom AC is leaking water; need 2 ceiling fans installed; CCTV camera in front gate is showing black screen..."
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                {/* Urgency Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Urgency Level</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'NORMAL', label: 'Standard Schedule', sub: 'Standard dispatch' },
                      { value: 'URGENT', label: 'Urgent (Same Day)', sub: 'Within 2-4 hours' },
                      { value: 'EMERGENCY', label: '🚨 Emergency', sub: 'Immediate 30 min' },
                    ].map((u) => (
                      <button
                        key={u.value}
                        type="button"
                        onClick={() => setForm((p) => ({ ...p, urgency: u.value }))}
                        className={`text-left p-2.5 rounded-xl border text-xs font-bold transition ${
                          form.urgency === u.value
                            ? u.value === 'EMERGENCY'
                              ? 'border-red-500 bg-red-50 text-red-700 ring-2 ring-red-500/20'
                              : 'border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-500/20'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <p>{u.label}</p>
                        <p className="text-[10px] text-slate-400 font-normal">{u.sub}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Photo Upload (Optional) */}
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>Attach Photos of the equipment / board (Optional)</span>
                    <span className="text-[10px] text-slate-400">Up to 4 images</span>
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {attachedImages.map((img, i) => (
                      <div key={i} className="relative w-16 h-16 rounded-xl border border-slate-200 overflow-hidden group">
                        <img src={img} alt="Attached" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute top-1 right-1 bg-red-600 text-white p-0.5 rounded-full"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {attachedImages.length < 4 && (
                      <label className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 hover:border-brand-500 bg-slate-50 hover:bg-brand-50/50 flex flex-col items-center justify-center cursor-pointer transition">
                        <Camera className="w-4 h-4 text-slate-400" />
                        <span className="text-[9px] font-bold text-slate-500 mt-0.5">Add</span>
                        <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right 5 Columns: Contact, Location, Schedule & Instant Submit */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-900">3. Where &amp; Who to Visit</h3>
                  <span className="text-[11px] font-bold text-brand-600">Step 2 of 2</span>
                </div>

                {/* Name & Phone */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahim Chowdhury"
                      value={form.customerName}
                      onChange={(e) => setForm((p) => ({ ...p, customerName: e.target.value }))}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Contact Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="01XXXXXXXXX"
                      value={form.customerPhone}
                      onChange={(e) => setForm((p) => ({ ...p, customerPhone: e.target.value }))}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Our coordinator will call this number to confirm technician dispatch.
                    </p>
                  </div>
                </div>

                {/* Division & District */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Division *</label>
                    <select
                      value={form.division}
                      onChange={(e) => {
                        const div = e.target.value;
                        const firstDist = BANGLADESH_DISTRICTS.find(
                          (d) => d.division.toLowerCase() === div.toLowerCase()
                        );
                        setForm((p) => ({
                          ...p,
                          division: div,
                          district: firstDist ? firstDist.name : 'Dhaka',
                          upazila: `${firstDist ? firstDist.name : 'Dhaka'} Sadar`,
                        }));
                      }}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    >
                      {BANGLADESH_DIVISIONS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">District *</label>
                    <select
                      value={form.district}
                      onChange={(e) => {
                        const dist = e.target.value;
                        setForm((p) => ({ ...p, district: dist, upazila: `${dist} Sadar` }));
                      }}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                    >
                      {availableDistricts.map((d) => (
                        <option key={d.id} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Upazila & Address Line */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Area / Upazila *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kusumbag Point, Moulvibazar Sadar, Sreemangal..."
                      value={form.upazila}
                      onChange={(e) => setForm((p) => ({ ...p, upazila: e.target.value }))}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      House / Road / Building Address *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. House #14, Road #2, Kusumbag (Near Central Mosque)"
                      value={form.addressLine}
                      onChange={(e) => setForm((p) => ({ ...p, addressLine: e.target.value }))}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                {/* Date & Time Slot */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Date *</label>
                    <input
                      type="date"
                      required
                      value={form.preferredDate}
                      onChange={(e) => setForm((p) => ({ ...p, preferredDate: e.target.value }))}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Time Slot *</label>
                    <select
                      value={form.preferredTimeSlot}
                      onChange={(e) => setForm((p) => ({ ...p, preferredTimeSlot: e.target.value }))}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    >
                      {TIME_SLOTS.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Pricing & Warranty Guarantee Note */}
                <div className="p-3 bg-brand-50/70 border border-brand-100 rounded-2xl space-y-1.5 text-[11px] text-slate-700">
                  <div className="flex items-center gap-1.5 text-brand-800 font-bold">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>30-Day Workmanship Warranty Included</span>
                  </div>
                  <p className="text-slate-500">
                    Transparent pricing. Standard inspection fee from ৳500. No advance payment required before technician diagnosis.
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3.5 text-sm font-black justify-center shadow-lg shadow-brand-500/25 active:scale-[0.99] transition"
                >
                  {loading ? (
                    'Registering Technician Booking...'
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2 fill-white" />
                      Confirm &amp; Request Technician
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </>
      )}
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto p-12 text-center text-slate-500 text-sm">
        Loading service booking engine...
      </div>
    }>
      <BookingFormInner />
    </Suspense>
  );
}
