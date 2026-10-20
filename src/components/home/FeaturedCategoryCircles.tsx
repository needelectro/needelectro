'use client';

import React from 'react';
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
  ChevronRight
} from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';

export default function FeaturedCategoryCircles() {
  const { language } = useLanguage();

  const categories = [
    {
      name: language === 'bn' ? 'ইলেকট্রিক্যাল সার্ভিস' : 'Electrical Service',
      slug: '/booking?category=electrical-services',
      icon: <Zap className="w-6 h-6 text-amber-500" />,
      bg: 'bg-amber-500/10 border-amber-500/20 group-hover:bg-amber-500 group-hover:text-white',
      count: language === 'bn' ? 'অন-সাইট' : 'On-Site'
    },
    {
      name: language === 'bn' ? 'সিসিটিভি ও সিকিউরিটি' : 'CCTV & Security',
      slug: '/shop?category=cctv-surveillance',
      icon: <Camera className="w-6 h-6 text-sky-500" />,
      bg: 'bg-sky-500/10 border-sky-500/20 group-hover:bg-sky-500 group-hover:text-white',
      count: language === 'bn' ? 'ক্যামেরা ও NVR' : 'Cameras & NVR'
    },
    {
      name: language === 'bn' ? 'ল্যাপটপ ও কম্পিউটার' : 'Laptops & PCs',
      slug: '/shop?category=laptops-computers',
      icon: <Laptop className="w-6 h-6 text-brand-500" />,
      bg: 'bg-brand-500/10 border-brand-500/20 group-hover:bg-brand-500 group-hover:text-white',
      count: language === 'bn' ? 'ওয়ারেন্টি সহ' : 'Official'
    },
    {
      name: language === 'bn' ? 'সুইচগিয়ার ও ব্রেকার' : 'Switchgear & Breaker',
      slug: '/shop?category=switchgear-breakers',
      icon: <Cpu className="w-6 h-6 text-emerald-500" />,
      bg: 'bg-emerald-500/10 border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white',
      count: language === 'bn' ? 'সার্টিফাইড' : 'Certified'
    },
    {
      name: language === 'bn' ? 'নেটওয়ার্কিং ও রাউটার' : 'Networking & WiFi',
      slug: '/shop?category=networking-routers',
      icon: <Wifi className="w-6 h-6 text-indigo-500" />,
      bg: 'bg-indigo-500/10 border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white',
      count: language === 'bn' ? 'হাই-স্পিড' : 'High-Speed'
    },
    {
      name: language === 'bn' ? 'সোলার ও আইপিএস' : 'Solar & IPS Backup',
      slug: '/shop?category=solar-ips-inverters',
      icon: <Sun className="w-6 h-6 text-orange-500" />,
      bg: 'bg-orange-500/10 border-orange-500/20 group-hover:bg-orange-500 group-hover:text-white',
      count: language === 'bn' ? 'পাওয়ার সেভার' : 'Energy'
    },
    {
      name: language === 'bn' ? 'টুলস ও যন্ত্রাংশ' : 'Tools & Hardware',
      slug: '/shop?category=tools-hardware',
      icon: <Wrench className="w-6 h-6 text-rose-500" />,
      bg: 'bg-rose-500/10 border-rose-500/20 group-hover:bg-rose-500 group-hover:text-white',
      count: language === 'bn' ? 'স্পেয়ার পার্টস' : 'Spares'
    },
    {
      name: language === 'bn' ? 'ওয়ারেন্টি ও ভেরিফাই' : 'Warranty Verify',
      slug: '/verify-certificate',
      icon: <ShieldCheck className="w-6 h-6 text-teal-500" />,
      bg: 'bg-teal-500/10 border-teal-500/20 group-hover:bg-teal-500 group-hover:text-white',
      count: language === 'bn' ? 'যাচাই করুন' : 'Instant'
    }
  ];

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            {language === 'bn' ? 'জনপ্রিয় ক্যাটাগরি ও সার্ভিস' : 'Featured Categories & Services'}
          </h2>
          <p className="text-xs text-slate-500">
            {language === 'bn' ? 'এক ক্লিকে পছন্দের পণ্য ও সার্ভিস খুঁজে নিন' : 'Explore hardware, genuine equipment & technical services'}
          </p>
        </div>
        <Link
          href="/shop"
          className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 transition-colors"
        >
          <span>{language === 'bn' ? 'সবগুলো দেখুন' : 'View All'}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Horizontal Scroll on Mobile / Grid on Desktop */}
      <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-none sm:grid sm:grid-cols-4 md:grid-cols-8">
        {categories.map((cat, idx) => (
          <Link
            key={idx}
            href={cat.slug}
            className="group flex flex-col items-center text-center shrink-0 w-24 sm:w-auto p-2 rounded-2xl hover:bg-slate-50/80 transition-all duration-200"
          >
            <div className={`w-16 h-16 rounded-full border flex items-center justify-center transition-all duration-300 shadow-sm group-hover:shadow-md group-hover:scale-105 ${cat.bg}`}>
              <div className="transition-transform duration-300 group-hover:scale-110 group-hover:brightness-200">
                {cat.icon}
              </div>
            </div>
            <span className="text-xs font-bold text-slate-800 group-hover:text-brand-600 mt-2.5 line-clamp-1 transition-colors">
              {cat.name}
            </span>
            <span className="text-[10px] text-slate-400 font-medium mt-0.5">
              {cat.count}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
