'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Zap, 
  Search, 
  Filter, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronRight,
  ShieldAlert,
  Wrench,
  X
} from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';

export default function ServicesPage() {
  const { user } = useAuth();
  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  // Booking Modal State
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [problemDescription, setProblemDescription] = useState('');
  const [preferredDate, setPreferredDate] = useState('2026-10-10');
  const [preferredTimeSlot, setPreferredTimeSlot] = useState('10:00 AM - 01:00 PM');
  const [urgency, setUrgency] = useState('NORMAL');
  const [addressArea, setAddressArea] = useState('Kusumbag');
  const [addressLine, setAddressLine] = useState('');
  const [phone, setPhone] = useState('01733983752');
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<any | null>(null);

  useEffect(() => {
    fetchServices();
  }, [selectedCategory, emergencyOnly]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      let url = '/api/v1/services?';
      if (selectedCategory !== 'all') url += `category=${selectedCategory}&`;
      if (emergencyOnly) url += `emergency=true&`;
      if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.services) {
        setServices(data.services);
        if (data.categories) setCategories(data.categories);
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  const handleOpenBooking = (service: any) => {
    setSelectedService(service);
    setBookingSuccess(null);
    setProblemDescription('');
    setUrgency(service.isEmergencyService ? 'EMERGENCY' : 'NORMAL');
    setBookingModalOpen(true);
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !problemDescription) return;

    setBookingSubmitting(true);
    try {
      const res = await fetch('/api/v1/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: selectedService.id,
          problemDescription,
          preferredDate,
          preferredTimeSlot,
          urgency,
          address: {
            recipientName: user?.name || 'Customer',
            phone,
            division: 'Sylhet',
            district: 'Moulvibazar',
            upazila: 'Moulvibazar Sadar',
            area: addressArea,
            addressLine: addressLine || 'Kusumbag Point Area',
          },
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setBookingSuccess(data.booking);
      } else {
        alert(data.error || 'Failed to submit booking');
      }
    } catch {
      alert('Error connecting to server.');
    } finally {
      setBookingSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner - Glass Dark */}
      <div className="glass-card-dark text-white rounded-3xl p-6 sm:p-10 md:p-12 relative overflow-hidden shadow-2xl">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-brand-500/25 blur-[100px] pointer-events-none rounded-full" />
        <div className="max-w-2xl relative z-10 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
            Professional Electrical &amp; Technological Services
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Certified Electricians &amp; Engineers On Demand
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            From house wiring and short-circuit troubleshooting to CCTV security installation, networking, and computer lab repairs in Moulvibazar.
          </p>
        </div>
      </div>

      {/* Safety Notice Banner - Frosted Amber Glass */}
      <div className="bg-amber-500/10 backdrop-blur-xl border border-amber-500/30 text-amber-900 rounded-2xl p-4 flex items-start gap-3 text-xs leading-relaxed shadow-2xs">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold text-amber-950">Safety Precaution:</strong> Electrical wiring, circuit breaker issues, and heavy IPS batteries carry severe risk of shock and fire. NEED ELECTRO prioritizes certified master electricians with professional gear. Never attempt dangerous electrical live-wire work unequipped.
        </div>
      </div>

      {/* Filter and Search Bar - Frosted Glass Card */}
      <div className="glass-card flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between p-4 rounded-2xl shadow-sm">
        {/* Categories Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
              selectedCategory === 'all'
                ? 'bg-brand-500 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Services
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                selectedCategory === cat.slug
                  ? 'bg-brand-500 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Emergency Toggle & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full md:w-auto justify-end">
          <button
            onClick={() => setEmergencyOnly(!emergencyOnly)}
            className={`px-3 py-2 sm:py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all border ${
              emergencyOnly
                ? 'bg-red-600 text-white border-red-600'
                : 'bg-white text-red-600 border-red-200 hover:bg-red-50'
            }`}
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            24/7 Emergency Only
          </button>

          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchServices()}
              className="w-full pl-9 pr-3 py-2 sm:py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <div key={i} className="card-premium h-64 animate-pulse bg-slate-100 rounded-2xl" />
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <Wrench className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No Services Found</h3>
          <p className="text-xs text-slate-500 mt-1">Try switching category or clearing the search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {services.map((service) => (
            <div
              key={service.id}
              className={`card-premium overflow-hidden flex flex-col justify-between group transition-all duration-300 hover:-translate-y-1 ${
                service.isEmergencyService ? 'border-amber-300 bg-amber-50/10' : ''
              }`}
            >
              <div>
                <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
                  <img
                    src={service.imageUrl || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800'}
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-md text-slate-800 text-[9px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                    {service.category?.name || 'Service'}
                  </span>
                  {service.isEmergencyService && (
                    <span className="absolute top-2 right-2 bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                      <Zap className="w-2.5 h-2.5 fill-white" />
                      Rapid 24/7
                    </span>
                  )}
                </div>

                <div className="p-3 space-y-1.5">
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm leading-tight line-clamp-1 group-hover:text-brand-600 transition-colors">
                    {service.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                    {service.shortDescription}
                  </p>

                  <div className="pt-1.5 flex items-center justify-between text-[11px] border-t border-slate-100">
                    <div className="flex items-center gap-1 text-slate-500">
                      <Clock className="w-3 h-3" />
                      <span className="text-[10px]">{service.estimatedDuration}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500">
                        {service.priceType === 'INSPECTION_BASED'
                          ? 'Insp: '
                          : service.priceType === 'STARTING_FROM'
                          ? 'From: '
                          : 'Fixed: '}
                      </span>
                      <strong className="text-xs sm:text-sm font-extrabold text-slate-900">
                        ৳{service.basePrice.toLocaleString()}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 pt-0 grid grid-cols-2 gap-1.5">
                <Link
                  href={`/services/${service.slug}`}
                  className="btn-secondary text-[10px] py-1.5 px-1 text-center rounded-lg"
                >
                  Details
                </Link>
                <button
                  onClick={() => handleOpenBooking(service)}
                  className={`text-[10px] py-1.5 px-1 rounded-lg ${
                    service.isEmergencyService ? 'btn-danger' : 'btn-primary'
                  }`}
                >
                  Book
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* BOOKING MODAL - Frosted Glass Sheen */}
      {bookingModalOpen && selectedService && (
        <div className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white/85 backdrop-blur-2xl rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-white/90 relative animate-in zoom-in-95 my-8">
            <button
              onClick={() => setBookingModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-white/60 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {bookingSuccess ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-600 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-slate-950">Booking Confirmed!</h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  Your booking reference is <strong className="text-brand-600 text-sm font-mono">{bookingSuccess.bookingNumber}</strong>. We are broadcasting to verified technicians in your area.
                </p>
                <div className="glass-card p-4 rounded-2xl text-xs text-left space-y-1.5">
                  <p><strong>Service:</strong> {selectedService.name}</p>
                  <p><strong>Scheduled:</strong> {bookingSuccess.preferredDate} ({bookingSuccess.preferredTimeSlot})</p>
                  <p><strong>Estimated Amount:</strong> ৳{bookingSuccess.totalAmount}</p>
                </div>
                <div className="pt-2 flex gap-3">
                  <Link
                    href="/customer/dashboard"
                    className="btn-primary flex-1 text-xs py-2.5"
                  >
                    Track in Dashboard
                  </Link>
                  <button
                    onClick={() => setBookingModalOpen(false)}
                    className="btn-secondary flex-1 text-xs py-2.5"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateBooking} className="space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center font-bold">
                    <Zap className="w-5 h-5 fill-white" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">{selectedService.name}</h3>
                    <p className="text-xs text-brand-600 font-semibold">
                      Estimated: ৳{selectedService.basePrice} ({selectedService.priceType})
                    </p>
                  </div>
                </div>

                {/* Problem Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Describe the Issue or Job Requirements *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="e.g. 2nd floor wiring trip, need short circuit check and earthing voltage inspection..."
                    value={problemDescription}
                    onChange={(e) => setProblemDescription(e.target.value)}
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                {/* Date and Time Slot */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Date *</label>
                    <input
                      type="date"
                      required
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Time *</label>
                    <select
                      value={preferredTimeSlot}
                      onChange={(e) => setPreferredTimeSlot(e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    >
                      <option>09:00 AM - 12:00 PM</option>
                      <option>12:00 PM - 03:00 PM</option>
                      <option>03:00 PM - 06:00 PM</option>
                      <option>06:00 PM - 09:00 PM</option>
                      <option>Immediate (Emergency)</option>
                    </select>
                  </div>
                </div>

                {/* Area & Address */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Service Area (Moulvibazar) *</label>
                    <select
                      value={addressArea}
                      onChange={(e) => setAddressArea(e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    >
                      <option>Kusumbag Point</option>
                      <option>Moulvibazar Sadar</option>
                      <option>Court Road</option>
                      <option>Sreemangal Road</option>
                      <option>Shamshernagar Road</option>
                      <option>Rajnagar</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone *</label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Street Address / Landmark</label>
                  <input
                    type="text"
                    placeholder="House/Holding #, Road #, Near Mosque or Market"
                    value={addressLine}
                    onChange={(e) => setAddressLine(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={bookingSubmitting}
                    className="btn-primary w-full py-3 text-xs"
                  >
                    {bookingSubmitting ? 'Confirming Booking...' : 'Confirm & Request Technician'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
