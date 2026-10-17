'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ChevronRight, Calendar, MapPin, Clock,
  CheckCircle2, Wrench, Camera, FileText, Phone, X, ShieldCheck,
  Zap, MessageCircle, AlertTriangle, ArrowRight, Sparkles, UserCheck,
  Building, Home, Info, Lock, ChevronDown, ChevronUp, Check
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
  { label: '⚡ Short Circuit / Sparking', category: 'ELECTRICAL', desc: 'Main circuit breaker tripping or sparking at outlet / শর্ট সার্কিট বা স্পার্কিং সমস্যা' },
  { label: '❄️ AC Cooling Issue', category: 'INSTALLATION', desc: 'AC not cooling properly or water dripping / এসি ঠান্ডা হচ্ছে না বা পানি পড়ছে' },
  { label: '📹 CCTV Camera Offline', category: 'CCTV', desc: 'Camera video loss or DVR storage issues / সিসিটিভি ক্যামেরা ডিসপ্লে বা রেকর্ডিং সমস্যা' },
  { label: '💡 Fan & Light Installation', category: 'ELECTRICAL', desc: 'Ceiling fan, chandelier, or LED panel fitting / ফ্যান বা লাইট ইনস্টলেশন' },
  { label: '💻 Computer Diagnostics', category: 'COMPUTER', desc: 'Slow system, no display, or hardware repair / কম্পিউটার বা ল্যাপটপ অন হচ্ছে না' },
  { label: '🔋 IPS Battery Backup', category: 'IPS_INVERTER', desc: 'Inverter not charging or low backup time / আইপিএস চার্জ হচ্ছে না বা ব্যাকআপ কম' },
  { label: '🚨 Sudden Power Outage', category: 'EMERGENCY', desc: 'Sudden total power outage or dangerous electrical fault / পুরো বাসায় বিদ্যুৎ চলে গেছে' },
];

const TIME_SLOTS = [
  '9:00 AM – 11:00 AM',
  '11:00 AM – 1:00 PM',
  '2:00 PM – 4:00 PM',
  '4:00 PM – 6:00 PM',
  '6:00 PM – 8:00 PM',
];

function BookingFormInner() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [bookingResult, setBookingResult] = useState<any>(null);
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [showAdditionalDetails, setShowAdditionalDetails] = useState(false);

  // Saved addresses from customer profile
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  // Location mode: 'SAVED' vs 'CUSTOM' (Flexible location)
  const [locationMode, setLocationMode] = useState<'SAVED' | 'CUSTOM'>('CUSTOM');
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [saveToProfile, setSaveToProfile] = useState(false);

  const initialCat = searchParams.get('category')?.toUpperCase() || 'ELECTRICAL';
  const initialUrgency = searchParams.get('urgency')?.toUpperCase() === 'EMERGENCY' ? 'EMERGENCY' : 'NORMAL';

  const [form, setForm] = useState({
    categoryId: initialCat,
    serviceId: searchParams.get('service') || '',
    description: '',
    contactPersonName: '',
    contactPhone: '',
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

  // Current redirect URL for auth
  const currentQuery = searchParams.toString();
  const redirectTarget = `/booking${currentQuery ? `?${currentQuery}` : ''}`;

  // Fetch services catalog
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

  // Auto-populate user data and saved addresses when authenticated
  useEffect(() => {
    if (user) {
      setForm((p) => ({
        ...p,
        contactPersonName: p.contactPersonName || user.name || '',
        contactPhone: p.contactPhone || user.phone || '',
      }));

      // Fetch saved addresses from customer profile
      setLoadingAddresses(true);
      fetch('/api/v1/customer/addresses')
        .then((r) => r.json())
        .then((data) => {
          if (data.success && Array.isArray(data.addresses) && data.addresses.length > 0) {
            setSavedAddresses(data.addresses);
            const defaultAddr = data.addresses.find((a: any) => a.isDefault) || data.addresses[0];
            setSelectedAddressId(defaultAddr.id);
            setLocationMode('SAVED');
            if (defaultAddr.district) {
              setForm((p) => ({
                ...p,
                district: defaultAddr.district,
                division: defaultAddr.division || p.division,
                upazila: defaultAddr.upazila || p.upazila,
              }));
            }
          } else {
            setLocationMode('CUSTOM');
          }
        })
        .catch(() => {
          setLocationMode('CUSTOM');
        })
        .finally(() => {
          setLoadingAddresses(false);
        });
    }
  }, [user]);

  // Selected district info (for coverage validation)
  const currentDistrictName = locationMode === 'SAVED'
    ? savedAddresses.find((a) => a.id === selectedAddressId)?.district || form.district
    : form.district;

  const currentDistrictInfo: DistrictData | undefined = BANGLADESH_DISTRICTS.find(
    (d) => d.name.toLowerCase() === currentDistrictName.toLowerCase()
  );

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
  const activeSavedAddress = savedAddresses.find((a) => a.id === selectedAddressId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check mandatory authentication
    if (!user) {
      router.push(`/customer/login?redirect=${encodeURIComponent(redirectTarget)}`);
      return;
    }

    if (!form.description.trim()) {
      alert('Please describe your problem so our technician can prepare appropriate tools.');
      return;
    }

    if (locationMode === 'CUSTOM') {
      if (!form.addressLine.trim() || !form.upazila.trim()) {
        alert('Please provide the road/building address and area for technician dispatch.');
        return;
      }
      if (!form.contactPhone.trim()) {
        alert('Please provide a contact phone number at the service location.');
        return;
      }
    }

    setLoading(true);
    try {
      const payload: any = {
        serviceId: form.serviceId || (filteredServices[0]?.id || services[0]?.id || 'svc_general'),
        problemDescription: form.description,
        customerName: form.contactPersonName || user.name,
        customerPhone: form.contactPhone || user.phone,
        preferredDate: form.preferredDate,
        preferredTimeSlot: form.preferredTimeSlot,
        urgency: form.urgency,
        mediaUrls: attachedImages.length > 0 ? attachedImages.join('|||') : null,
      };

      if (locationMode === 'SAVED' && selectedAddressId) {
        payload.address = selectedAddressId;
      } else {
        payload.address = {
          recipientName: form.contactPersonName || user.name,
          phone: form.contactPhone || user.phone,
          division: form.division,
          district: form.district,
          upazila: form.upazila,
          area: form.area || form.upazila,
          addressLine: form.addressLine,
          landmark: form.landmark || null,
        };
        payload.saveToProfile = saveToProfile;
      }

      const res = await fetch('/api/v1/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setBookingResult(data.booking);
        setBookingComplete(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        if (data.requiresAuth) {
          router.push(`/customer/login?redirect=${encodeURIComponent(redirectTarget)}`);
          return;
        }
        alert(data.error || 'Could not register booking. Please contact hotline at 01733 983752.');
      }
    } catch {
      alert('Network error while booking. Please try again or call 01733 983752.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-brand-600">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/services" className="hover:text-brand-600">Services</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 font-bold">Three-Click Service Booking</span>
      </nav>

      {/* ═══ SUCCESS CONFIRMATION SCREEN ═══ */}
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
              Your service request is in our pending assignment queue. Our operations coordinator will contact you to confirm technician arrival.
            </p>
            <div className="pt-2">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Your Booking Reference Number</span>
              <p className="text-xl sm:text-2xl font-mono font-black text-brand-600 bg-brand-50 inline-block px-4 py-1.5 rounded-xl border border-brand-200 mt-1">
                {bookingResult.bookingNumber}
              </p>
            </div>
            <div className="pt-1">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                <Clock className="w-3.5 h-3.5" /> Status: Awaiting Technician Assignment
              </span>
            </div>
          </div>

          {/* Booking Summary Box */}
          <div className="bg-slate-50 p-5 rounded-2xl text-xs text-left space-y-2.5 text-slate-700 border border-slate-200/80">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
              <span className="text-slate-500 font-semibold">Service:</span>
              <span className="font-bold text-slate-900">{selectedService?.name || form.categoryId}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
              <span className="text-slate-500 font-semibold">Service Location:</span>
              <span className="font-bold text-slate-900">
                {locationMode === 'SAVED' && activeSavedAddress 
                  ? `${activeSavedAddress.addressLine}, ${activeSavedAddress.upazila}, ${activeSavedAddress.district}` 
                  : `${form.addressLine || 'Address on file'}, ${form.upazila}, ${form.district}`}
              </span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
              <span className="text-slate-500 font-semibold">Scheduled Window:</span>
              <span className="font-bold text-slate-900">{form.preferredDate} ({form.preferredTimeSlot})</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-semibold">On-Site Contact:</span>
              <span className="font-bold text-brand-600 font-mono">
                {form.contactPersonName || user?.name} ({form.contactPhone || user?.phone})
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <a
              href={`https://wa.me/8801733983752?text=${encodeURIComponent(`Hello NEED ELECTRO! I booked service #${bookingResult.bookingNumber} for ${selectedService?.name || form.categoryId}. Please confirm dispatch.`)}`}
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
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-brand-600 via-brand-500 to-sky-600 text-white rounded-3xl p-6 sm:p-7 shadow-xl relative overflow-hidden">
            <div className="max-w-2xl space-y-2 relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-black uppercase tracking-wider text-white border border-white/30">
                <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300" /> Three-Click Service Booking
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Book a Certified Technician
              </h1>
              <p className="text-xs sm:text-sm text-brand-100 leading-relaxed">
                Fast, 3-click service booking. Verified electricians, CCTV specialists, and computer technicians dispatched to your doorstep.
              </p>
            </div>

            {/* Quick Hotline Strip */}
            <div className="mt-4 pt-3 border-t border-white/20 flex flex-wrap items-center gap-3 text-xs">
              <span className="text-brand-100 font-semibold">Emergency?</span>
              <a
                href="tel:01733983752"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white text-brand-700 font-black hover:bg-brand-50 transition shadow-xs text-xs"
              >
                <Phone className="w-3.5 h-3.5 text-brand-600" /> 01733 983752
              </a>
              <a
                href="https://wa.me/8801733983752?text=Hello%20NEED%20ELECTRO!%20I%20need%20urgent%20service."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition shadow-xs text-xs"
              >
                <MessageCircle className="w-3.5 h-3.5" /> WhatsApp Support
              </a>
            </div>
          </div>

          {/* ═══ MANDATORY AUTHENTICATION BANNER (If not signed in) ═══ */}
          {!user && !authLoading && (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4 animate-in fade-in">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-amber-500/30">
                  <Lock className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm sm:text-base font-black text-amber-950">
                    Customer Account Required to Book Services
                  </h3>
                  <p className="text-xs text-amber-900 leading-relaxed">
                    Under NEED ELECTRO security and warranty policies, bookings are linked to verified customer accounts. Please sign in or register to schedule a technician. Your selected trade and problem description will be preserved.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <Link
                  href={`/customer/login?redirect=${encodeURIComponent(redirectTarget)}`}
                  className="btn-primary text-xs py-2.5 px-6 justify-center shadow-md shadow-brand-500/20"
                >
                  <UserCheck className="w-4 h-4 mr-1.5" />
                  Sign In as Customer
                </Link>
                <Link
                  href={`/customer/register?redirect=${encodeURIComponent(redirectTarget)}`}
                  className="btn-secondary text-xs py-2.5 px-6 justify-center bg-white border-amber-300 hover:bg-amber-100 text-amber-950"
                >
                  Create Customer Account &rarr;
                </Link>
              </div>
            </div>
          )}

          {/* ═══ SMART PROFILE AUTO-FILL BANNER (If signed in) ═══ */}
          {user && (
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-emerald-900">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-slate-900">
                    Authenticated Customer: <span className="text-emerald-700">{user.name}</span>
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Phone: {user.phone || 'Not set'} • Email: {user.email}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-white px-2.5 py-1 rounded-full border border-emerald-200">
                ✓ Smart Profile Auto-Fill Active
              </span>
            </div>
          )}

          {/* ═══ THREE-STEP INTERACTIVE BOOKING FORM ═══ */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ── STEP 1: SERVICE SELECTION ── */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center">1</span>
                  <h3 className="text-sm font-black text-slate-900">Click 1: Service Trade Selection</h3>
                </div>
                {form.serviceId && (
                  <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Selected
                  </span>
                )}
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

              {/* Specific Packages Dropdown if available */}
              {filteredServices.length > 0 && (
                <div className="pt-2 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Specific Service Package:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {filteredServices.slice(0, 6).map((svc) => (
                      <label
                        key={svc.id}
                        className={`flex items-start justify-between p-2.5 rounded-xl border cursor-pointer transition text-xs ${
                          form.serviceId === svc.id
                            ? 'border-brand-500 bg-brand-50/70 font-bold text-brand-800 ring-1 ring-brand-500'
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

            {/* ── STEP 2: PROBLEM DESCRIPTION & SAVED ADDRESS AUTOFILL ── */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center">2</span>
                  <h3 className="text-sm font-black text-slate-900">Click 2: Describe Your Problem</h3>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">Supports Bengali &amp; English</span>
              </div>

              {/* ═══ SAVED ADDRESS SELECTION (1-Click Switcher) ═══ */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-brand-600" />
                    Service Address:
                  </span>
                  {user && savedAddresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setLocationMode(locationMode === 'SAVED' ? 'CUSTOM' : 'SAVED')}
                      className="text-[11px] font-bold text-brand-600 hover:underline"
                    >
                      {locationMode === 'SAVED' ? '+ Use Another Location' : '← Back to Saved Addresses'}
                    </button>
                  )}
                </label>

                {/* MODE A: SAVED ADDRESS PILLS */}
                {locationMode === 'SAVED' && savedAddresses.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {savedAddresses.map((addr) => (
                      <label
                        key={addr.id}
                        className={`flex items-start gap-2.5 p-3 rounded-2xl border cursor-pointer transition ${
                          selectedAddressId === addr.id
                            ? 'border-brand-500 bg-brand-50/70 ring-1 ring-brand-500'
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="savedAddress"
                          checked={selectedAddressId === addr.id}
                          onChange={() => setSelectedAddressId(addr.id)}
                          className="mt-0.5 accent-brand-500"
                        />
                        <div className="min-w-0 text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-slate-900">{addr.label || 'Home'}</span>
                            {addr.isDefault && (
                              <span className="text-[9px] font-bold bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-slate-700 mt-0.5 font-medium truncate">{addr.addressLine}, {addr.upazila}</p>
                          <p className="text-slate-500 text-[11px]">{addr.district} • {addr.phone}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}

                {/* MODE B: CUSTOM LOCATION ENTRY */}
                {locationMode === 'CUSTOM' && (
                  <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="text-[11px] text-slate-600 flex items-center gap-1.5 font-medium">
                      <Info className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                      Flexible Location: Entering a new address will not alter your permanent saved address.
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Contact Person at Site *</label>
                        <input
                          type="text"
                          required
                          value={form.contactPersonName}
                          onChange={(e) => setForm((p) => ({ ...p, contactPersonName: e.target.value }))}
                          placeholder="Name of person on premises"
                          className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone at Site *</label>
                        <input
                          type="tel"
                          required
                          value={form.contactPhone}
                          onChange={(e) => setForm((p) => ({ ...p, contactPhone: e.target.value }))}
                          placeholder="01XXXXXXXXX"
                          className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
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
                              district: firstDist ? firstDist.name : 'Moulvibazar',
                              upazila: `${firstDist ? firstDist.name : 'Moulvibazar'} Sadar`,
                            }));
                          }}
                          className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl"
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
                          className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl font-semibold"
                        >
                          {availableDistricts.map((d) => (
                            <option key={d.id} value={d.name}>{d.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Upazila / Area *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Moulvibazar Sadar, Kusumbag, Mirpur"
                          value={form.upazila}
                          onChange={(e) => setForm((p) => ({ ...p, upazila: e.target.value }))}
                          className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Road / Building / Holding *</label>
                        <input
                          type="text"
                          required
                          placeholder="Holding #, Road #, Building Name"
                          value={form.addressLine}
                          onChange={(e) => setForm((p) => ({ ...p, addressLine: e.target.value }))}
                          className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl"
                        />
                      </div>
                    </div>

                    {user && (
                      <label className="flex items-center gap-2 pt-1 text-xs text-slate-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={saveToProfile}
                          onChange={(e) => setSaveToProfile(e.target.checked)}
                          className="rounded accent-brand-500"
                        />
                        <span>Save this address to my profile for future 1-click bookings</span>
                      </label>
                    )}
                  </div>
                )}
              </div>

              {/* ═══ PROMINENT REQUIRED FIELD: DESCRIBE YOUR PROBLEM ═══ */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-brand-600" />
                    Describe Your Problem *
                  </label>
                  <span className="text-[11px] text-brand-600 font-bold">1-Click Quick Fill Below</span>
                </div>

                {/* 1-Click Quick Issue Chips */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {QUICK_ISSUES.map((issue, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleQuickIssueSelect(issue)}
                      className={`text-[11px] px-2.5 py-1.5 rounded-xl border font-bold shrink-0 transition-all ${
                        form.description === issue.desc
                          ? 'border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-500/20'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      {issue.label}
                    </button>
                  ))}
                </div>

                <textarea
                  required
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Describe the electrical or technical problem you need us to solve... / আপনার বৈদ্যুতিক বা প্রযুক্তিগত সমস্যাটি সংক্ষেপে লিখুন..."
                  className="w-full text-xs sm:text-sm p-3.5 bg-slate-50 border border-slate-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-brand-500 leading-relaxed font-sans"
                />
              </div>

              {/* ═══ COLLAPSIBLE ACCORDION: ADDITIONAL DETAILS (OPTIONAL) ═══ */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowAdditionalDetails(!showAdditionalDetails)}
                  className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition"
                >
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    + Additional Details (Optional: Schedule, Photos, Urgency)
                  </span>
                  {showAdditionalDetails ? (
                    <ChevronUp className="w-4 h-4 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  )}
                </button>

                {showAdditionalDetails && (
                  <div className="p-4 bg-white border-t border-slate-200 space-y-4 animate-in fade-in">
                    {/* Preferred Date & Time */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Visit Date</label>
                        <input
                          type="date"
                          value={form.preferredDate}
                          onChange={(e) => setForm((p) => ({ ...p, preferredDate: e.target.value }))}
                          className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Time Window</label>
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

                    {/* Urgency Level */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Urgency Level</label>
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

                    {/* Photo Upload */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                        <span>Attach Problem Photos / Board Photos</span>
                        <span className="text-[10px] text-slate-400">Up to 4 images</span>
                      </label>
                      <div className="flex flex-wrap gap-2.5">
                        {attachedImages.map((img, i) => (
                          <div key={i} className="relative w-16 h-16 rounded-xl border border-slate-200 overflow-hidden">
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
                )}
              </div>
            </div>

            {/* ── STEP 3: CONFIRM & SUBMIT ── */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center">3</span>
                <h3 className="text-sm font-black text-slate-900">Click 3: Confirm &amp; Submit Booking</h3>
              </div>

              {/* Workmanship Warranty & Pricing Strip */}
              <div className="p-3 bg-brand-50/70 border border-brand-100 rounded-2xl flex items-center gap-3 text-xs text-brand-950">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold">30-Day Workmanship Warranty Included</p>
                  <p className="text-[11px] text-slate-500">Transparent pricing. Standard inspection fee from ৳500. Genuine parts billing on-site.</p>
                </div>
              </div>

              {/* Submit Button */}
              {user ? (
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-4 text-base font-black justify-center shadow-xl shadow-brand-500/25 active:scale-[0.99] transition"
                >
                  {loading ? (
                    'Registering Technician Booking...'
                  ) : (
                    <>
                      <Zap className="w-5 h-5 mr-2 fill-white" />
                      Confirm &amp; Submit Booking
                    </>
                  )}
                </button>
              ) : (
                <Link
                  href={`/customer/login?redirect=${encodeURIComponent(redirectTarget)}`}
                  className="btn-primary w-full py-4 text-base font-black justify-center shadow-xl shadow-brand-500/25 active:scale-[0.99] transition"
                >
                  <Lock className="w-5 h-5 mr-2" />
                  Sign In to Confirm &amp; Submit Booking
                </Link>
              )}
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
