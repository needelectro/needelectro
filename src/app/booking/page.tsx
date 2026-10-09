'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, Calendar, MapPin, Clock, Upload, AlertCircle,
  CheckCircle2, Wrench, Camera, FileText, Phone
} from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { useRouter } from 'next/navigation';

const SERVICE_CATEGORIES = [
  { id: 'ELECTRICAL', icon: '⚡', label: 'Electrical Work', desc: 'Wiring, circuits, panels' },
  { id: 'INSTALLATION', icon: '🔧', label: 'Installation', desc: 'ACs, fans, fixtures, switches' },
  { id: 'CCTV', icon: '📷', label: 'CCTV & Security', desc: 'Installation, repair, setup' },
  { id: 'COMPUTER', icon: '💻', label: 'Computer Service', desc: 'Repair, setup, networking' },
  { id: 'NETWORKING', icon: '🌐', label: 'Networking & WiFi', desc: 'Router, LAN, internet setup' },
  { id: 'IPS_INVERTER', icon: '🔋', label: 'IPS / Inverter', desc: 'Setup, battery, maintenance' },
  { id: 'SMART_HOME', icon: '🏠', label: 'Smart Home', desc: 'Automation, smart devices' },
  { id: 'EMERGENCY', icon: '🚨', label: 'Emergency', desc: 'Urgent electrical issues' },
];

const AREA_OPTIONS = [
  'Kusumbag Point', 'Moulvibazar Sadar', 'Court Road Area', 'Chandbpur Bazaar',
  'Sreemangal', 'Kamalganj', 'Rajnagar', 'Kulaura', 'Barlekha', 'Juri',
];

const TIME_SLOTS = [
  '9:00 AM – 11:00 AM', '11:00 AM – 1:00 PM',
  '2:00 PM – 4:00 PM', '4:00 PM – 6:00 PM', '6:00 PM – 8:00 PM',
];

export default function BookingPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<'service' | 'details' | 'schedule' | 'confirm' | 'done'>('service');
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [bookingResult, setBookingResult] = useState<any>(null);

  const [form, setForm] = useState({
    categoryId: '',
    serviceId: '',
    description: '',
    customerName: user?.name || '',
    customerPhone: '',
    area: 'Kusumbag Point',
    addressLine: '',
    landmark: '',
    preferredDate: '',
    preferredTimeSlot: TIME_SLOTS[0],
    urgency: 'NORMAL',
  });

  useEffect(() => {
    fetch('/api/v1/services')
      .then((r) => r.json())
      .then((d) => setServices(d.services || []))
      .catch(() => {});
  }, []);

  const filteredServices = form.categoryId
    ? services.filter((s) => s.category === form.categoryId)
    : services;

  const selectedService = services.find((s) => s.id === form.serviceId);

  const handleSubmit = async () => {
    if (!user) {
      router.push('/auth/login?redirect=/booking');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/v1/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: form.serviceId,
          description: form.description,
          customerPhone: form.customerPhone,
          location: {
            area: form.area,
            addressLine: form.addressLine,
            landmark: form.landmark,
          },
          preferredDate: form.preferredDate,
          preferredTimeSlot: form.preferredTimeSlot,
          urgency: form.urgency,
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
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-brand-600">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/services" className="hover:text-brand-600">Services</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 font-semibold">Book a Technician</span>
      </nav>

      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-950">Book a Technician</h1>
        <p className="text-sm text-slate-500">Verified professionals dispatched to your location, same or next day.</p>
      </div>

      {/* Progress Steps */}
      {step !== 'done' && (
        <div className="flex items-center gap-2 text-[11px] font-bold overflow-x-auto pb-1">
          {[
            { key: 'service', label: 'Select Service' },
            { key: 'details', label: 'Problem Details' },
            { key: 'schedule', label: 'Schedule' },
            { key: 'confirm', label: 'Confirm' },
          ].map((s, i) => {
            const steps = ['service', 'details', 'schedule', 'confirm'];
            const isActive = step === s.key;
            const isDone = steps.indexOf(step as string) > i;
            return (
              <React.Fragment key={s.key}>
                <div className={`flex items-center gap-1.5 whitespace-nowrap ${isActive ? 'text-brand-600' : isDone ? 'text-emerald-600' : 'text-slate-400'}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] shrink-0 ${isActive ? 'bg-brand-500 text-white' : isDone ? 'bg-emerald-500 text-white' : 'bg-slate-200'}`}>
                    {isDone ? '✓' : i + 1}
                  </div>
                  <span>{s.label}</span>
                </div>
                {i < 3 && <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />}
              </React.Fragment>
            );
          })}
        </div>
      )}

      {/* DONE STATE */}
      {step === 'done' && bookingResult && (
        <div className="max-w-lg mx-auto text-center py-8 space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-950">Booking Confirmed!</h2>
            <p className="text-sm text-slate-500 mt-1">Booking reference:</p>
            <p className="text-xl font-mono font-black text-brand-600 mt-1">{bookingResult.bookingNumber || bookingResult.id}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 text-xs text-left space-y-2">
            <p><strong>Service:</strong> {selectedService?.name}</p>
            <p><strong>Date:</strong> {form.preferredDate}</p>
            <p><strong>Time:</strong> {form.preferredTimeSlot}</p>
            <p><strong>Location:</strong> {form.addressLine}, {form.area}</p>
            <p className="text-slate-500 pt-1">
              A verified technician will be assigned within 30 minutes during business hours. 
              You will receive confirmation by phone. For urgent queries call <strong>01733-983752</strong>.
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/customer/dashboard" className="btn-primary flex-1 text-xs py-3">Track Booking</Link>
            <Link href="/services" className="btn-secondary flex-1 text-xs py-3">Book Another</Link>
          </div>
        </div>
      )}

      {/* STEP 1: Select Service Category */}
      {step === 'service' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-base font-black text-slate-900 mb-4">What type of service do you need?</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {SERVICE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setForm((p) => ({ ...p, categoryId: cat.id, serviceId: '' }))}
                  className={`p-4 rounded-2xl border-2 text-left transition-all space-y-1.5 ${
                    form.categoryId === cat.id
                      ? 'border-brand-500 bg-brand-50'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <p className="text-xs font-black text-slate-900">{cat.label}</p>
                  <p className="text-[10px] text-slate-500">{cat.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {form.categoryId && (
            <div>
              <h3 className="text-sm font-black text-slate-900 mb-3">
                {filteredServices.length > 0 ? 'Choose specific service (optional):' : 'Specific Services:'}
              </h3>
              {filteredServices.length > 0 ? (
                <div className="space-y-2">
                  {filteredServices.slice(0, 6).map((svc) => (
                    <label
                      key={svc.id}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                        form.serviceId === svc.id ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio" name="serviceId" value={svc.id}
                          checked={form.serviceId === svc.id}
                          onChange={() => setForm((p) => ({ ...p, serviceId: svc.id }))}
                          className="accent-brand-500"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-900">{svc.name}</p>
                          <p className="text-[10px] text-slate-500">{svc.shortDescription}</p>
                        </div>
                      </div>
                      <span className="text-xs font-black text-brand-600">
                        {svc.basePrice > 0 ? `৳${svc.basePrice}+` : 'Free Quote'}
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl">
                  Describe your problem in the next step and our team will match you with the right technician.
                </p>
              )}
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
              Emergency? Call <strong className="text-slate-700">01733-983752</strong>
            </div>
            <button
              onClick={() => setStep('details')}
              disabled={!form.categoryId}
              className="btn-primary text-xs py-2.5 px-5"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Problem Details */}
      {step === 'details' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-brand-500 text-white flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <h2 className="text-base font-extrabold text-slate-900">Describe the Problem</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Problem Description *</label>
              <textarea
                required value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                rows={4}
                placeholder="Describe the issue in detail — what is happening, when it started, which devices or circuits are affected..."
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Your Name *</label>
              <input
                type="text" required value={form.customerName}
                onChange={(e) => setForm((p) => ({ ...p, customerName: e.target.value }))}
                placeholder="Full name"
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Contact Phone *</label>
              <input
                type="tel" required value={form.customerPhone}
                onChange={(e) => setForm((p) => ({ ...p, customerPhone: e.target.value }))}
                placeholder="01XXXXXXXXX"
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Urgency</label>
              <div className="flex gap-2">
                {[
                  { value: 'NORMAL', label: 'Normal (1-2 days)', color: 'text-emerald-600 border-emerald-300 bg-emerald-50' },
                  { value: 'URGENT', label: 'Urgent (Same day)', color: 'text-amber-600 border-amber-300 bg-amber-50' },
                  { value: 'EMERGENCY', label: '🚨 Emergency', color: 'text-red-600 border-red-300 bg-red-50' },
                ].map((u) => (
                  <label key={u.value} className={`flex-1 text-center text-[10px] font-bold py-2 px-2 rounded-xl border cursor-pointer transition ${form.urgency === u.value ? u.color : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'}`}>
                    <input type="radio" name="urgency" value={u.value} checked={form.urgency === u.value}
                      onChange={() => setForm((p) => ({ ...p, urgency: u.value }))} className="sr-only" />
                    {u.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-slate-400 bg-blue-50 rounded-xl p-3">
              <Camera className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              Photo upload available after booking is confirmed via WhatsApp or in-app.
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={() => setStep('service')} className="btn-secondary text-xs py-2.5 flex-1">Back</button>
            <button
              onClick={() => setStep('schedule')}
              disabled={!form.description || !form.customerName || !form.customerPhone}
              className="btn-primary text-xs py-2.5 flex-1"
            >
              Schedule Visit
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Schedule */}
      {step === 'schedule' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-brand-500 text-white flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <h2 className="text-base font-extrabold text-slate-900">Location &amp; Schedule</h2>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Area / Locality *</label>
                <select value={form.area} onChange={(e) => setForm((p) => ({ ...p, area: e.target.value }))}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none">
                  {AREA_OPTIONS.map((a) => <option key={a}>{a}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Landmark (Optional)</label>
                <input type="text" value={form.landmark}
                  onChange={(e) => setForm((p) => ({ ...p, landmark: e.target.value }))}
                  placeholder="e.g. Next to Jame Masjid"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Full Address *</label>
              <input type="text" required value={form.addressLine}
                onChange={(e) => setForm((p) => ({ ...p, addressLine: e.target.value }))}
                placeholder="House / Road / Building name..."
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Preferred Date *</label>
              <input type="date" required value={form.preferredDate} min={minDate}
                onChange={(e) => setForm((p) => ({ ...p, preferredDate: e.target.value }))}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Preferred Time Slot *</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {TIME_SLOTS.map((slot) => (
                  <label key={slot} className={`text-center text-[11px] font-bold py-2.5 px-2 rounded-xl border cursor-pointer transition ${form.preferredTimeSlot === slot ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>
                    <input type="radio" name="timeSlot" value={slot} checked={form.preferredTimeSlot === slot}
                      onChange={() => setForm((p) => ({ ...p, preferredTimeSlot: slot }))} className="sr-only" />
                    <Clock className="w-3.5 h-3.5 inline mr-1 opacity-60" />{slot}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={() => setStep('details')} className="btn-secondary text-xs py-2.5 flex-1">Back</button>
            <button
              onClick={() => setStep('confirm')}
              disabled={!form.preferredDate || !form.addressLine}
              className="btn-primary text-xs py-2.5 flex-1"
            >
              Review Booking
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Confirm */}
      {step === 'confirm' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-brand-500 text-white flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h2 className="text-base font-extrabold text-slate-900">Review &amp; Confirm Booking</h2>
          </div>

          {!user && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-800 space-y-2">
              <p className="font-bold">⚠️ Sign In to Track Your Booking</p>
              <p>You can proceed as a guest, but creating an account lets you track your booking, technician, and service history.</p>
              <Link href="/auth/login?redirect=/booking" className="text-brand-600 font-bold hover:underline">
                Sign In or Register →
              </Link>
            </div>
          )}

          <div className="space-y-3 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl space-y-2">
              <p className="font-bold text-sm text-slate-900">Service Details</p>
              <p><strong>Category:</strong> {SERVICE_CATEGORIES.find((c) => c.id === form.categoryId)?.label}</p>
              {selectedService && <p><strong>Service:</strong> {selectedService.name}</p>}
              <p><strong>Urgency:</strong> {form.urgency}</p>
              <p><strong>Problem:</strong> {form.description}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl space-y-2">
              <p className="font-bold text-sm text-slate-900">Location &amp; Schedule</p>
              <p><strong>{form.customerName}</strong> — {form.customerPhone}</p>
              <p><MapPin className="inline w-3 h-3 mr-1" />{form.addressLine}, {form.area}, Moulvibazar</p>
              <p><Calendar className="inline w-3 h-3 mr-1" />{form.preferredDate} at {form.preferredTimeSlot}</p>
            </div>
            <div className="p-3 bg-brand-50 rounded-xl text-[11px] text-brand-700 font-medium">
              <strong>Pricing:</strong> The technician will provide a detailed quote on-site after inspection. 
              Service call charges may apply for Emergency bookings.
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={() => setStep('schedule')} className="btn-secondary text-xs py-2.5 flex-1">Back</button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary text-xs py-2.5 flex-1"
            >
              {loading ? 'Submitting...' : 'Confirm Booking'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
