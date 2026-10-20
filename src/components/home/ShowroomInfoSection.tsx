'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Clock, 
  ShieldCheck, 
  Navigation, 
  MessageCircle, 
  CheckCircle2,
  Sparkles,
  Zap,
  ArrowRight
} from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';
import { BUSINESS_CONFIG } from '@/lib/config/business';

export default function ShowroomInfoSection() {
  const { language } = useLanguage();

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-brand-950 text-white border border-slate-800 shadow-xl p-6 sm:p-8 md:p-10">
        {/* Ambient Glows */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-brand-500/20 blur-[90px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-sky-500/15 blur-[80px] rounded-full pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Info & Details */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-400/30 text-xs font-semibold">
              <Building2 className="w-3.5 h-3.5 text-brand-400" />
              <span>{language === 'bn' ? 'সরাসরি হাব ও সার্ভিস সেন্টার' : 'Official Hub & Service Center'}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
              {language === 'bn' ? (
                <>মৌলভীবাজার সেন্ট্রাল হাব ও <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-sky-300">টেকনিক্যাল ডায়াগনস্টিক ল্যাব</span></>
              ) : (
                <>Moulvibazar Central Hub &amp; <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-sky-300">Technical Diagnostic Center</span></>
              )}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
              {language === 'bn' 
                ? 'আসল ইলেকট্রিক্যাল যন্ত্রাংশ, ল্যাপটপ-কম্পিউটার হার্ডওয়্যার এবং সিসিটিভি ক্যামেরা সরাসরি দেখে কেনার সুবিধা। আমাদের এক্সপার্ট টেকনিশিয়ান দ্বারা অন-স্পট ডায়াগনস্টিক ও ওয়ারেন্টি সার্ভিস গ্রহণ করুন।'
                : 'Experience genuine electrical components, laptops, and CCTV surveillance equipment in person. Receive on-spot diagnostic verification, official warranty support, and technician consultation.'}
            </p>

            {/* Quick Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <MapPin className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-white">
                    {language === 'bn' ? 'ঠিকানা ও লোকেশন' : 'Address & Hub'}
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Moulvibazar Hub &bull; Sylhet Division, Bangladesh
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-white">
                    {language === 'bn' ? 'খোলা থাকার সময়' : 'Working Hours'}
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Sat &ndash; Thu: 9:00 AM &ndash; 8:00 PM (Fri: 2:00 PM &ndash; 8:00 PM)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <Phone className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-white">
                    {language === 'bn' ? 'সরাসরি হেল্পলাইন' : 'Direct Hotline'}
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5 font-mono">
                    {BUSINESS_CONFIG.contact.phone}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <ShieldCheck className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-white">
                    {language === 'bn' ? 'সার্ভিস কভারেজ' : 'Service Coverage'}
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {language === 'bn' ? 'মৌলভীবাজার ও ৬৪ জেলায় ডেলিভারি' : 'Moulvibazar & Nationwide 64 Districts'}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href={`tel:${BUSINESS_CONFIG.contact.phoneRaw}`}
                className="btn-primary py-2.5 px-5 text-xs sm:text-sm shadow-lg shadow-brand-500/30 inline-flex items-center gap-2"
              >
                <Phone className="w-4 h-4 fill-white" />
                <span>{language === 'bn' ? 'সরাসরি কল করুন' : 'Call Center'}</span>
              </a>

              <a
                href={BUSINESS_CONFIG.contact.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-emerald-600/30"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{language === 'bn' ? 'হোয়াটসঅ্যাপ চ্যাট' : 'WhatsApp Chat'}</span>
              </a>

              <Link
                href="/branches"
                className="inline-flex items-center gap-1.5 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white text-xs sm:text-sm font-semibold transition-all border border-white/10"
              >
                <Navigation className="w-4 h-4 text-brand-400" />
                <span>{language === 'bn' ? 'সকল ব্রাঞ্চ ও ম্যাপ' : 'View All Hubs & Map'}</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Visual Trust Card / Guarantee Badge */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-800/80 to-slate-900/90 border border-slate-700/70 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  {language === 'bn' ? 'বিশ্বাস ও গুণগত মান' : 'Trust & Authenticity'}
                </span>
                <span className="text-[11px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  100% Genuine
                </span>
              </div>

              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{language === 'bn' ? 'অরিজিনাল ইনভয়েস ও অফিসিয়াল ওয়ারেন্টি কার্ড' : 'Official Invoice & Verified Digital Warranty Card'}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{language === 'bn' ? 'দক্ষ ও ভেরিফাইড টেকনিশিয়ানদের দ্বারা ইনস্টলেশন' : 'Installation by Government Licensed & NID-Checked Technicians'}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{language === 'bn' ? 'সার্ভিস পরবর্তী দ্রুত কাস্টমার কেয়ার ও রিপ্লেসমেন্ট' : 'Fast Post-Service Support & Quick Replacement Assistance'}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{language === 'bn' ? 'হোম ডেলিভারি ও সরাসরি হাব থেকে সংগ্রহের সুযোগ' : 'Doorstep Courier Delivery + On-Site Pickup Available'}</span>
                </li>
              </ul>

              <div className="pt-2">
                <Link
                  href="/about"
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 text-brand-300 border border-brand-500/30 text-xs font-bold transition-all"
                >
                  <span>{language === 'bn' ? 'আমাদের সম্পর্কে আরও জানুন' : 'Learn More About NEED ELECTRO'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
