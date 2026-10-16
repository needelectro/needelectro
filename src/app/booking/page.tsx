'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, Calendar, MapPin, Clock, Upload, AlertCircle,
  CheckCircle2, Wrench, Camera, FileText, Phone, X, ShieldCheck
} from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
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
  { id: 'ELECTRICAL', icon: '⚡', label: 'Electrical Work', desc: 'Wiring, circuits, panels, breakers' },
  { id: 'INSTALLATION', icon: '🔧', label: 'Installation', desc: 'ACs, fans, lights, switches' },
  { id: 'CCTV', icon: '📷', label: 'CCTV & Security', desc: 'HD/IP camera setup & maintenance' },
  { id: 'COMPUTER', icon: '💻', label: 'Computer Service', desc: 'Hardware repair, diagnostics, OS' },
  { id: 'NETWORKING', icon: '🌐', label: 'Networking & WiFi', desc: 'Router, switch, LAN setup' },
  { id: 'IPS_INVERTER', icon: '🔋', label: 'IPS / Inverter', desc: 'Setup, battery bank, service' },
  { id: 'SMART_HOME', icon: '🏠', label: 'Smart Home', desc: 'IoT switches, smart automation' },
  { id: 'EMERGENCY', icon: '🚨', label: 'Emergency 24/7', desc: 'Short circuit, sparking, blackout' },
];

const TIME_SLOTS = [
  '9:00 AM – 11:00 AM',
  '11:00 AM – 1:00 PM',
  '2:00 PM – 4:00 PM',
  '4:00 PM – 6:00 PM',
  '6:00 PM – 8:00 PM',
];

export default function BookingPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<'service' | 'details' | 'schedule' | 'confirm' | 'done'>('service');
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [bookingResult, setBookingResult] = useState<any>(null);
  const [attachedImages, setAttachedImages] = useState<string[]>([]);

  const [form, setForm] = useState({
    categoryId: 'ELECTRICAL',
    serviceId: '',
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
    urgency: 'NORMAL',
  });

  const availableDistricts = BANGLADESH_DISTRICTS.filter(
    (d) => d.division.toLowerCase() === form.division.toLowerCase()
  );

  const currentDistrictInfo: DistrictData | undefined = BANGLADESH_DISTRICTS.find(
    (d) => d.name.toLowerCase() === form.district.toLowerCase()
  );

  useEffect(() => {
    fetch('/api/v1/services')
      .then((r) => r.json())
      .then((d) => setServices(d.services || []))
      .catch(() => {});
  }, []);

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

  const filteredServices = form.categoryId
    ? services.filter((s) => s.category?.slug?.includes(form.categoryId.toLowerCase()) || s.category?.name?.toUpperCase()?.includes(form.categoryId))
    : services;

  const selectedService = services.find((s) => s.id === form.serviceId);

  const handleSubmit = async () => {
    if (!user) {
      router.push('/customer/login?redirect=/booking');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/v1/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: form.serviceId || (services[0]?.id || ''),
          problemDescription: form.description,
          customerPhone: form.customerPhone,
          location: {
            division: form.division,
            district: form.district,
            upazila: form.upazila,
            area: form.area,
            addressLine: form.addressLine,
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
        setStep('done');
      } else {
        alert(data.error || 'Could not create booking. Please try again.');
      }
    } catch {
      alert('Network error while booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-brand-600">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/services" className="hover:text-brand-600">Services</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 font-semibold">Book a Technician</span>
      </nav>

      {/* Progress Steps Header */}
      {step !== 'done' && (
        <div className="flex items-center justify-between text-xs font-bold border-b border-slate-200 pb-4">
          {[
            { id: 'service', label: '1. Service' },
            { id: 'details', label: '2. Problem & Photos' },
            { id: 'schedule', label: '3. Location & Time' },
            { id: 'confirm', label: '4. Confirmation' },
          ].map((s) => (
            <span
              key={s.id}
              className={`${step === s.id ? 'text-brand-600 font-black' : 'text-slate-400'}`}
            >
              {s.label}
            </span>
          ))}
        </div>
      )}

      {/* SUCCESS CONFIRMATION SCREEN */}
      {step === 'done' && bookingResult && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-6 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
              Booking Confirmed
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-2">Technician Request Registered!</h2>
            <p className="text-xs text-slate-500">
              Your service booking has been created and dispatched to verified technicians in your area.
            </p>
            <p className="text-lg font-mono font-black text-brand-600 mt-2">{bookingResult.bookingNumber}</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl text-xs text-left space-y-2 text-slate-700">
            <p><strong>Service Area:</strong> {form.upazila}, {form.district}, {form.division}</p>
            <p><strong>Scheduled Slot:</strong> {form.preferredDate} ({form.preferredTimeSlot})</p>
            <p><strong>Urgency Level:</strong> {form.urgency}</p>
            <p className="text-slate-500 pt-1">
              A certified technician will confirm dispatch within 30 minutes during working hours. For emergency assistance, call <strong>01733 983752</strong>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link href="/customer/dashboard" className="btn-primary flex-1 text-xs py-3 justify-center">
              Track in Customer Dashboard
            </Link>
            <Link href="/services" className="btn-secondary flex-1 text-xs py-3 justify-center">
              Explore More Services
            </Link>
          </div>
        </div>
      )}

      {/* STEP 1: SELECT CATEGORY & SERVICE */}
      {step === 'service' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-black text-slate-900 mb-1">Select Service Category</h2>
            <p className="text-xs text-slate-500 mb-4">Choose the technical trade required for your premises</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {SERVICE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setForm((p) => ({ ...p, categoryId: cat.id }))}
                  className={`p-4 rounded-2xl border-2 text-left transition-all space-y-1.5 ${
                    form.categoryId === cat.id
                      ? 'border-brand-500 bg-brand-50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <p className="text-xs font-black text-slate-900">{cat.label}</p>
                  <p className="text-[10px] text-slate-500 line-clamp-1">{cat.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {services.length > 0 && (
            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Specific Service Packages</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {services.map((svc) => (
                  <label
                    key={svc.id}
                    className={`flex items-start justify-between p-3.5 rounded-2xl border cursor-pointer transition ${
                      form.serviceId === svc.id ? 'border-brand-500 bg-brand-50/60 ring-1 ring-brand-500' : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <input
                        type="radio"
                        name="serviceId"
                        value={svc.id}
                        checked={form.serviceId === svc.id}
                        onChange={() => setForm((p) => ({ ...p, serviceId: svc.id }))}
                        className="mt-1 accent-brand-500"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-900">{svc.name}</p>
                        <p className="text-[11px] text-slate-500 line-clamp-1">{svc.shortDescription}</p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-brand-600 shrink-0 ml-2">
                      {svc.basePrice > 0 ? `৳${svc.basePrice}+` : 'Free Quote'}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t border-slate-200">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Phone className="w-3.5 h-3.5 text-brand-500" />
              Hotline: <strong className="text-slate-800">01733 983752</strong>
            </div>
            <button
              onClick={() => setStep('details')}
              className="btn-primary text-xs py-2.5 px-6"
            >
              Continue to Details
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: PROBLEM DETAILS & IMAGE UPLOAD */}
      {step === 'details' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-brand-500 text-white flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Describe the Problem &amp; Attach Photos</h2>
              <p className="text-[11px] text-slate-500">Provide details to help our technicians bring the right tools and parts</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Problem Description *</label>
              <textarea
                required
                rows={4}
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="What is happening? (e.g. circuit tripping, CCTV channel 3 offline, sparking in main switch...)"
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl resize-none"
              />
            </div>

            {/* Photo Attachment (Req D) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Upload Photos / Relevant Images (Optional, up to 4)</span>
                <span className="text-[10px] text-slate-400 font-normal">JPG, PNG</span>
              </label>

              <div className="flex flex-wrap gap-3">
                {attachedImages.map((img, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-xl border border-slate-200 overflow-hidden group">
                    <img src={img} alt="Attached upload" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-90 hover:opacity-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {attachedImages.length < 4 && (
                  <label className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 hover:border-brand-500 bg-slate-50 hover:bg-brand-50/50 flex flex-col items-center justify-center cursor-pointer transition">
                    <Camera className="w-5 h-5 text-slate-400" />
                    <span className="text-[9px] font-bold text-slate-500 mt-1">Add Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Contact Person Name *</label>
                <input
                  type="text"
                  required
                  value={form.customerName}
                  onChange={(e) => setForm((p) => ({ ...p, customerName: e.target.value }))}
                  placeholder="Full Name"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Contact Mobile Number *</label>
                <input
                  type="tel"
                  required
                  value={form.customerPhone}
                  onChange={(e) => setForm((p) => ({ ...p, customerPhone: e.target.value }))}
                  placeholder="01XXXXXXXXX"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Urgency Level</label>
              <div className="flex gap-2">
                {[
                  { value: 'NORMAL', label: 'Normal (Standard Schedule)', color: 'text-emerald-700 border-emerald-300 bg-emerald-50' },
                  { value: 'URGENT', label: 'Urgent (Same Day)', color: 'text-amber-700 border-amber-300 bg-amber-50' },
                  { value: 'EMERGENCY', label: '🚨 24/7 Emergency', color: 'text-red-700 border-red-300 bg-red-50' },
                ].map((u) => (
                  <button
                    key={u.value}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, urgency: u.value }))}
                    className={`flex-1 text-center text-xs font-bold py-2.5 px-2 rounded-xl border transition ${
                      form.urgency === u.value ? u.color : 'border-slate-200 bg-white text-slate-500'
                    }`}
                  >
                    {u.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={() => setStep('service')} className="btn-secondary text-xs py-2.5 flex-1">Back</button>
            <button
              onClick={() => setStep('schedule')}
              disabled={!form.description || !form.customerName || !form.customerPhone}
              className="btn-primary text-xs py-2.5 flex-1"
            >
              Continue to Location &amp; Schedule
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: NATIONWIDE LOCATION & TIME */}
      {step === 'schedule' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-brand-500 text-white flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Service Address &amp; Appointment Slot</h2>
              <p className="text-[11px] text-slate-500">Available across divisions and verified service zones</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Division *</label>
              <select
                value={form.division}
                onChange={(e) => {
                  const div = e.target.value;
                  const firstDist = BANGLADESH_DISTRICTS.find((d) => d.division.toLowerCase() === div.toLowerCase());
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

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">District *</label>
              <select
                value={form.district}
                onChange={(e) => {
                  const dist = e.target.value;
                  setForm((p) => ({ ...p, district: dist, upazila: `${dist} Sadar` }));
                }}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
              >
                {availableDistricts.map((d) => (
                  <option key={d.id} value={d.name}>{d.name} ({d.nameBn})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Thana / Upazila *</label>
              <input
                type="text"
                required
                value={form.upazila}
                onChange={(e) => setForm((p) => ({ ...p, upazila: e.target.value }))}
                placeholder="e.g. Moulvibazar Sadar, Sreemangal..."
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Area / Point</label>
              <input
                type="text"
                value={form.area}
                onChange={(e) => setForm((p) => ({ ...p, area: e.target.value }))}
                placeholder="e.g. Kusumbag Point"
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Building / Road Address *</label>
              <input
                type="text"
                required
                value={form.addressLine}
                onChange={(e) => setForm((p) => ({ ...p, addressLine: e.target.value }))}
                placeholder="Building Name, Floor, House #, Road #..."
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Preferred Date *</label>
              <input
                type="date"
                required
                value={form.preferredDate}
                onChange={(e) => setForm((p) => ({ ...p, preferredDate: e.target.value }))}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Preferred Time Slot *</label>
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

          <div className="flex gap-3 pt-2">
            <button onClick={() => setStep('details')} className="btn-secondary text-xs py-2.5 flex-1">Back</button>
            <button
              onClick={() => setStep('confirm')}
              disabled={!form.addressLine || !form.upazila}
              className="btn-primary text-xs py-2.5 flex-1"
            >
              Review Booking
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: REVIEW & SUBMIT */}
      {step === 'confirm' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-brand-500 text-white flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h2 className="text-base font-extrabold text-slate-900">Review &amp; Confirm Booking</h2>
          </div>

          <div className="space-y-3 bg-slate-50 p-4 rounded-2xl text-xs text-slate-700">
            <div>
              <span className="font-bold text-slate-500 uppercase text-[10px]">Service &amp; Problem:</span>
              <p className="font-bold text-slate-900 mt-0.5">{selectedService?.name || form.categoryId}</p>
              <p className="text-slate-600 line-clamp-2">{form.description}</p>
              {attachedImages.length > 0 && (
                <p className="text-[11px] text-brand-600 font-semibold mt-1">
                  📷 {attachedImages.length} photo(s) attached for technician review
                </p>
              )}
            </div>

            <div className="border-t border-slate-200 pt-2">
              <span className="font-bold text-slate-500 uppercase text-[10px]">Location &amp; Appointment:</span>
              <p className="font-bold text-slate-900 mt-0.5">{form.addressLine}, {form.upazila}, {form.district}, {form.division}</p>
              <p className="text-slate-600">Date: {form.preferredDate} ({form.preferredTimeSlot}) &bull; Urgency: {form.urgency}</p>
              <p className="text-slate-600">Contact: {form.customerName} ({form.customerPhone})</p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={() => setStep('schedule')} className="btn-secondary text-xs py-2.5 flex-1">Back</button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary text-xs py-2.5 flex-1 shadow-lg shadow-brand-500/25"
            >
              {loading ? 'Submitting Booking...' : 'Confirm & Dispatch Technician'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
