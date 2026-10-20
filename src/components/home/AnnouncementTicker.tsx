'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Megaphone, ShieldCheck, Zap, Clock, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';
import { BUSINESS_CONFIG } from '@/lib/config/business';

export default function AnnouncementTicker() {
  const { language } = useLanguage();
  const [formattedDate, setFormattedDate] = useState('');

  useEffect(() => {
    const now = new Date();
    const dateStr = now.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    setFormattedDate(dateStr);
  }, [language]);

  const announcements = language === 'bn' ? [
    { text: 'সরাসরি মৌলভীবাজার হাব ও ৬৪ জেলায় ক্যাশ অন ডেলিভারি সুবিধা!', link: '/shop' },
    { text: 'অন-ডিমান্ড সার্টিফাইড ইলেকট্রিশিয়ান ও সিসিটিভি ইনস্টলেশন বুকিং চালু আছে', link: '/booking' },
    { text: 'ডিজিটাল ওয়ারেন্টি ট্র্যাকিং ও অথেনটিক প্রোডাক্ট গ্যারান্টি', link: '/warranty' },
    { text: 'জরুরি হেল্পলাইন: ' + BUSINESS_CONFIG.contact.phone + ' (সকাল ৯:০০ - রাত ৮:০০)', link: 'tel:' + BUSINESS_CONFIG.contact.phoneRaw }
  ] : [
    { text: 'Official Showroom & Hub at Moulvibazar • Nationwide Delivery Across All 64 Districts', link: '/shop' },
    { text: 'On-Demand Certified Electricians & CCTV Installation Service is Live', link: '/booking' },
    { text: 'Track Digital Warranties & Authentic Equipment with 100% Genuine Seal', link: '/warranty' },
    { text: 'Emergency Support Hotline: ' + BUSINESS_CONFIG.contact.phone + ' (9 AM - 8 PM)', link: 'tel:' + BUSINESS_CONFIG.contact.phoneRaw }
  ];

  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % announcements.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [announcements.length]);

  return (
    <div className="w-full bg-gradient-to-r from-brand-900 via-slate-900 to-brand-950 text-white border-y border-brand-800/40 py-2 sm:py-2.5 px-3 sm:px-6 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
        {/* Date badge */}
        <div className="hidden md:flex items-center gap-2 shrink-0 pr-3 border-r border-slate-700/60 text-slate-300 font-medium">
          <Clock className="w-3.5 h-3.5 text-brand-400" />
          <span>{formattedDate || 'Today'}</span>
        </div>

        {/* Live Announcement Marquee/Rotator */}
        <div className="flex-1 min-w-0 flex items-center gap-2.5 overflow-hidden">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-400/30 font-bold uppercase tracking-wider text-[10px] shrink-0">
            <Megaphone className="w-3 h-3 text-brand-400 animate-pulse" />
            <span>Notice</span>
          </span>

          <div className="flex-1 min-w-0">
            <Link
              href={announcements[activeIdx].link}
              className="group flex items-center gap-1.5 text-slate-200 hover:text-brand-300 transition-colors truncate font-medium text-xs sm:text-[13px]"
            >
              <span className="truncate">{announcements[activeIdx].text}</span>
              <ArrowRight className="w-3.5 h-3.5 text-brand-400 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
            </Link>
          </div>
        </div>

        {/* Quick Help Link */}
        <div className="hidden sm:flex items-center gap-2 shrink-0 pl-3 border-l border-slate-700/60">
          <Link
            href={BUSINESS_CONFIG.contact.whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold transition-colors text-xs"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>WhatsApp Care</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
