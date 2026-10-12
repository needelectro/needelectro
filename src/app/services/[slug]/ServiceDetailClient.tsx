'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  CheckCircle2, 
  PhoneCall, 
  ChevronRight,
  HelpCircle,
  Clock,
  Zap,
  MapPin,
  Lock
} from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';

interface ServiceDetailClientProps {
  service: any;
}

export default function ServiceDetailClient({ service }: ServiceDetailClientProps) {
  const router = useRouter();
  const { user } = useAuth();

  const [bookingSuccess, setBookingSuccess] = useState<any | null>(null);
  const [problemDescription, setProblemDescription] = useState('');
  const [preferredDate, setPreferredDate] = useState('2026-10-15');
  const [preferredTimeSlot, setPreferredTimeSlot] = useState('10:00 AM - 01:00 PM');
  const [phone, setPhone] = useState(user?.phone || '');
  const [addressArea, setAddressArea] = useState('Moulvibazar Sadar');
  const [addressLine, setAddressLine] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleBookNow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push(`/customer/login?redirect=/services/${service.slug}`);
      return;
    }
    if (!service || !problemDescription) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: service.id,
          problemDescription,
          preferredDate,
          preferredTimeSlot,
          address: {
            recipientName: 'Customer',
            phone,
            division: 'Sylhet',
            district: 'Moulvibazar',
            upazila: 'Moulvibazar Sadar',
            area: addressArea,
            addressLine: addressLine || addressArea,
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
      alert('Error submitting booking.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-brand-600">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/services" className="hover:text-brand-600">Services</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 font-semibold">{service.name}</span>
      </nav>

      {/* Main Service Banner & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Media & Full Info */}
        <div className="lg:col-span-2 space-y-8">
          <div className="relative h-80 sm:h-96 w-full rounded-3xl overflow-hidden bg-slate-100 shadow-md">
            <img
              src={service.imageUrl || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800'}
              alt={service.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-6 sm:p-8">
              <div className="text-white space-y-2">
                <span className="inline-block bg-brand-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {service.category?.name || 'NEED ELECTRO Technical Service'}
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-white">{service.name}</h1>
              </div>
            </div>
          </div>

          {/* Service Specs Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <span className="text-[11px] text-slate-500 block">Pricing Model</span>
              <strong className="text-sm font-bold text-slate-900 capitalize">
                {service.priceType.toLowerCase().replace(/_/g, ' ')}
              </strong>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <span className="text-[11px] text-slate-500 block">Estimated Time</span>
              <strong className="text-sm font-bold text-slate-900">{service.estimatedDuration}</strong>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <span className="text-[11px] text-slate-500 block">Standard Rate</span>
              <strong className="text-sm font-bold text-brand-600">৳{service.basePrice.toLocaleString('en-BD')}</strong>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <span className="text-[11px] text-slate-500 block">Verification</span>
              <strong className="text-sm font-bold text-emerald-600 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" /> Certified Engineers
              </strong>
            </div>
          </div>

          {/* Description & Engineering Scope */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Service Scope &amp; Specifications</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {service.fullDescription}
            </p>

            {service.requiredSkills && (
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Specialized Skills Employed
                </h3>
                <div className="flex flex-wrap gap-2">
                  {service.requiredSkills.split(',').map((skill: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-semibold"
                    >
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Frequently Asked Questions */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-brand-600" />
              Frequently Asked Questions
            </h2>
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <h3 className="font-bold text-slate-900">How is the final service charge calculated?</h3>
                <p className="text-slate-600 leading-relaxed">
                  The initial callout or inspection fee covers diagnostics. If hardware components, new conduits, or replacement breakers are required, the technician provides an itemized quote before work starts.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <h3 className="font-bold text-slate-900">Are NEED ELECTRO technicians insured and verified?</h3>
                <p className="text-slate-600 leading-relaxed">
                  Yes. All technicians undergo NID identity cross-checks, trade certification validation, and peer training by NEED ELECTRO senior engineers.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <h3 className="font-bold text-slate-900">What warranty applies to electrical work?</h3>
                <p className="text-slate-600 leading-relaxed">
                  We provide a standard 7-day post-service guarantee on workmanship, and all technology hardware purchased includes official manufacturer warranties recorded digitally in your account.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Direct Booking Form Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-lg space-y-5">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600">Quick Appointment</span>
              <h2 className="text-xl font-extrabold text-slate-950 mt-0.5">Book This Service</h2>
              <p className="text-xs text-slate-500 mt-1">Confirmed booking with nearest verified technician.</p>
            </div>

            {bookingSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h3 className="font-bold text-slate-900 text-sm">Booking Received!</h3>
                <p className="text-xs text-slate-600 font-mono font-bold text-brand-600">
                  {bookingSuccess.bookingNumber}
                </p>
                <Link href="/customer/dashboard" className="btn-primary w-full text-xs py-2 block">
                  View in Customer Portal
                </Link>
              </div>
            ) : !user ? (
              <div className="p-5 bg-gradient-to-br from-amber-50 to-orange-50/60 border border-amber-200/80 rounded-2xl text-center space-y-3.5 shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-xs">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Customer Sign In Required</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1">
                    To book verified technicians, receive real-time job confirmation, and track warranty, please sign in or create your customer account.
                  </p>
                </div>
                <div className="space-y-2 pt-1">
                  <Link
                    href={`/customer/login?redirect=/services/${service.slug}`}
                    className="btn-primary w-full py-2.5 text-xs font-bold block text-center shadow-md shadow-brand-500/20"
                  >
                    Sign In as Customer
                  </Link>
                  <Link
                    href={`/customer/register?redirect=/services/${service.slug}`}
                    className="btn-secondary w-full py-2 text-xs font-bold block text-center bg-white border-slate-200"
                  >
                    Create Customer Account
                  </Link>
                </div>
                <div className="pt-2 text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-brand-600" />
                  <span>Takes less than 30 seconds</span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleBookNow} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Job Description / Symptoms *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe specific symptoms or requests..."
                    value={problemDescription}
                    onChange={(e) => setProblemDescription(e.target.value)}
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
                  />
                </div>

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
                  <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Time Window *</label>
                  <select
                    value={preferredTimeSlot}
                    onChange={(e) => setPreferredTimeSlot(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option>10:00 AM - 01:00 PM</option>
                    <option>02:00 PM - 05:00 PM</option>
                    <option>05:00 PM - 08:00 PM</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Service Area / District *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Moulvibazar Sadar / Sylhet / Dhaka"
                    value={addressArea}
                    onChange={(e) => setAddressArea(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Address / Landmark</label>
                  <input
                    type="text"
                    placeholder="Road, House, Village or Landmark"
                    value={addressLine}
                    onChange={(e) => setAddressLine(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Contact Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="01XXXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary w-full py-3 text-xs font-bold"
                  >
                    {submitting ? 'Confirming...' : 'Book Technician Now'}
                  </button>
                </div>

                <div className="text-center pt-1">
                  <a
                    href="tel:01733983752"
                    className="text-xs text-slate-500 hover:text-brand-600 flex items-center justify-center gap-1.5"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    Or call Hotline: 01733 983752
                  </a>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
