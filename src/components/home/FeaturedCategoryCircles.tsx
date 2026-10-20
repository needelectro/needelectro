'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Zap, 
  Camera, 
  Laptop, 
  Cpu, 
  Wifi, 
  Sun, 
  Wrench, 
  ShieldCheck,
  ChevronRight,
  Pause,
  Play
} from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';

export default function FeaturedCategoryCircles() {
  const { language } = useLanguage();
  const [isPaused, setIsPaused] = useState(false);

  const categories = [
    {
      name: language === 'bn' ? 'ইলেকট্রিক্যাল সার্ভিস' : 'Electrical Service',
      slug: '/booking?category=electrical-services',
      icon: <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />,
      bg: 'bg-amber-500/10 border-amber-500/20 group-hover:bg-amber-500 group-hover:text-white',
      count: language === 'bn' ? 'অন-সাইট' : 'On-Site'
    },
    {
      name: language === 'bn' ? 'সিসিটিভি ও সিকিউরিটি' : 'CCTV & Security',
      slug: '/shop?category=cctv-surveillance',
      icon: <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-sky-500" />,
      bg: 'bg-sky-500/10 border-sky-500/20 group-hover:bg-sky-500 group-hover:text-white',
      count: language === 'bn' ? 'ক্যামেরা ও NVR' : 'Cameras & NVR'
    },
    {
      name: language === 'bn' ? 'ল্যাপটপ ও কম্পিউটার' : 'Laptops & PCs',
      slug: '/shop?category=laptops-computers',
      icon: <Laptop className="w-5 h-5 sm:w-6 sm:h-6 text-brand-500" />,
      bg: 'bg-brand-500/10 border-brand-500/20 group-hover:bg-brand-500 group-hover:text-white',
      count: language === 'bn' ? 'ওয়ারেন্টি সহ' : 'Official'
    },
    {
      name: language === 'bn' ? 'সুইচগিয়ার ও ব্রেকার' : 'Switchgear & Breaker',
      slug: '/shop?category=switchgear-breakers',
      icon: <Cpu className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" />,
      bg: 'bg-emerald-500/10 border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white',
      count: language === 'bn' ? 'সার্টিফাইড' : 'Certified'
    },
    {
      name: language === 'bn' ? 'নেটওয়ার্কিং ও রাউটার' : 'Networking & WiFi',
      slug: '/shop?category=networking-routers',
      icon: <Wifi className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-500" />,
      bg: 'bg-indigo-500/10 border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white',
      count: language === 'bn' ? 'হাই-স্পিড' : 'High-Speed'
    },
    {
      name: language === 'bn' ? 'সোলার ও আইপিএস' : 'Solar & IPS Backup',
      slug: '/shop?category=solar-ips-inverters',
      icon: <Sun className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />,
      bg: 'bg-orange-500/10 border-orange-500/20 group-hover:bg-orange-500 group-hover:text-white',
      count: language === 'bn' ? 'পাওয়ার সেভার' : 'Energy'
    },
    {
      name: language === 'bn' ? 'টুলস ও যন্ত্রাংশ' : 'Tools & Hardware',
      slug: '/shop?category=tools-hardware',
      icon: <Wrench className="w-5 h-5 sm:w-6 sm:h-6 text-rose-500" />,
      bg: 'bg-rose-500/10 border-rose-500/20 group-hover:bg-rose-500 group-hover:text-white',
      count: language === 'bn' ? 'স্পেয়ার পার্টস' : 'Spares'
    },
    {
      name: language === 'bn' ? 'ওয়ারেন্টি ও ভেরিফাই' : 'Warranty Verify',
      slug: '/verify-certificate',
      icon: <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-teal-500" />,
      bg: 'bg-teal-500/10 border-teal-500/20 group-hover:bg-teal-500 group-hover:text-white',
      count: language === 'bn' ? 'যাচাই করুন' : 'Instant'
    }
  ];

  // Quadruple items to allow continuous, flawless 360-degree loop
  const displayCategories = [...categories, ...categories, ...categories, ...categories];

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>{language === 'bn' ? 'জনপ্রিয় ক্যাটাগরি ও সার্ভিস' : 'Featured Categories & Services'}</span>
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-500">
            {language === 'bn' ? 'এক ক্লিকে পছন্দের পণ্য ও সার্ভিস খুঁজে নিন' : 'Explore hardware, genuine equipment & technical services'}
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="text-[11px] font-medium text-slate-500 hover:text-brand-600 flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg border border-slate-200/80 bg-white shadow-2xs hover:border-brand-200 transition-colors"
            title={isPaused ? "Resume auto-scroll" : "Pause auto-scroll"}
            type="button"
          >
            {isPaused ? <Play className="w-3 h-3 text-emerald-600 fill-emerald-600" /> : <Pause className="w-3 h-3 text-brand-600 fill-brand-600" />}
            <span className="hidden xs:inline text-[10px] sm:text-[11px]">
              {isPaused ? (language === 'bn' ? 'চালু' : 'Resume') : (language === 'bn' ? 'থামান' : 'Pause')}
            </span>
          </button>

          <Link
            href="/shop"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 transition-colors"
          >
            <span>{language === 'bn' ? 'সবগুলো' : 'View All'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Auto-scrolling horizontal container with fade edges and hover pause */}
      <div 
        className="relative w-full overflow-hidden mask-edge-fade py-1"
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setTimeout(() => setIsPaused(false), 2500)}
      >
        <div className={`flex items-center gap-3 sm:gap-4 w-max animate-auto-scroll-category pause-hover ${isPaused ? 'animation-paused' : ''}`}>
          {displayCategories.map((cat, idx) => (
            <Link
              key={idx}
              href={cat.slug}
              className="group flex flex-col items-center text-center shrink-0 w-24 sm:w-28 p-2 rounded-2xl hover:bg-white/80 hover:shadow-xs transition-all duration-200"
            >
              <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full border flex items-center justify-center transition-all duration-300 shadow-xs group-hover:shadow-md group-hover:scale-105 ${cat.bg}`}>
                <div className="transition-transform duration-300 group-hover:scale-110">
                  {cat.icon}
                </div>
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-slate-800 group-hover:text-brand-600 mt-2 line-clamp-1 transition-colors">
                {cat.name}
              </span>
              <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium mt-0.5">
                {cat.count}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
