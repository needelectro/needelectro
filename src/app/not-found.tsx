'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Zap, 
  Search, 
  Home, 
  ShoppingBag, 
  Wrench, 
  PhoneCall, 
  ArrowLeft, 
  MessageSquare, 
  ShieldCheck, 
  Laptop, 
  Camera, 
  Cpu, 
  HelpCircle,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';
import { BUSINESS_CONFIG } from '@/lib/config/business';

export default function NotFound() {
  const router = useRouter();
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const popularShortcuts = [
    {
      title: language === 'bn' ? 'ল্যাপটপ ও কম্পিউটার' : 'Laptops & Computers',
      href: '/shop?category=laptops-computers',
      icon: <Laptop className="w-4 h-4 text-brand-500" />
    },
    {
      title: language === 'bn' ? 'সিসিটিভি ও সিকিউরিটি' : 'CCTV & Surveillance',
      href: '/shop?category=cctv-surveillance',
      icon: <Camera className="w-4 h-4 text-sky-500" />
    },
    {
      title: language === 'bn' ? 'ইলেকট্রিশিয়ান সার্ভিস' : 'Electrical Services',
      href: '/booking',
      icon: <Wrench className="w-4 h-4 text-amber-500" />
    },
    {
      title: language === 'bn' ? 'সুইচগিয়ার ও সার্কিট' : 'Switchgear & Breakers',
      href: '/shop?category=switchgear-breakers',
      icon: <Cpu className="w-4 h-4 text-emerald-500" />
    },
    {
      title: language === 'bn' ? 'ওয়ারেন্টি যাচাই' : 'Warranty Check',
      href: '/warranty',
      icon: <ShieldCheck className="w-4 h-4 text-indigo-500" />
    }
  ];

  return (
    <div className="min-h-[82vh] bg-gradient-to-b from-slate-900 via-slate-950 to-brand-950 text-white relative overflow-hidden flex flex-col justify-center py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-500/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-sky-500/10 blur-[100px] rounded-full pointer-events-none" />
      
      {/* Subtle Circuit Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
          backgroundSize: '28px 28px'
        }}
      />

      <div className="max-w-4xl mx-auto w-full relative z-10 text-center space-y-8">
        
        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-400/20 text-brand-300 text-xs font-semibold backdrop-blur-md shadow-xs animate-soft-pulse">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span>{language === 'bn' ? 'সার্কিট অফলাইন • ত্রুটি ৪০৪' : 'Circuit Disconnected • Error 404'}</span>
        </div>

        {/* Big Stylized 404 Header Banner */}
        <div className="relative">
          <div className="text-7xl sm:text-9xl font-black tracking-tight bg-gradient-to-r from-brand-400 via-sky-300 to-blue-500 bg-clip-text text-transparent select-none drop-shadow-sm flex items-center justify-center gap-2">
            <span>4</span>
            <div className="relative inline-flex items-center justify-center">
              <span className="opacity-90">0</span>
              <Zap className="w-10 h-10 sm:w-16 sm:h-16 text-amber-400 absolute fill-amber-400/30 animate-pulse drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]" />
            </div>
            <span>4</span>
          </div>

          <h1 className="text-xl sm:text-3xl font-extrabold text-white mt-3 tracking-tight">
            {language === 'bn' 
              ? 'দুঃখিত! এই পণ্য বা পৃষ্ঠাটি খুঁজে পাওয়া যায়নি' 
              : 'Oops! Page or Product Not Found'}
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto mt-2 leading-relaxed">
            {language === 'bn'
              ? 'আপনি যে লিংকটিতে ক্লিক করেছেন তা হয়তো সরানো হয়েছে বা পণ্যটির নাম/মডেল পরিবর্তন করা হয়েছে।'
              : 'The link you followed may be broken, the product might be updated, or the address was mistyped.'}
          </p>
        </div>

        {/* Helpful In-Page Search Bar */}
        <div className="max-w-xl mx-auto w-full">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <div className="absolute left-4 pointer-events-none text-slate-400">
              <Search className="w-5 h-5 text-brand-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'bn' ? 'ল্যাপটপ, সিসিটিভি বা সার্ভিস খুঁজুন...' : 'Search laptops (e.g. HP 840 G5), CCTV, or services...'}
              className="w-full pl-12 pr-28 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/20 focus:border-brand-400 focus:ring-4 focus:ring-brand-500/20 text-white placeholder-slate-400 text-sm backdrop-blur-md transition-all outline-none"
            />
            <button
              type="submit"
              className="absolute right-2 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-semibold text-xs shadow-md shadow-brand-500/30 transition-all active:scale-95 flex items-center gap-1.5"
            >
              <span>{language === 'bn' ? 'খুঁজুন' : 'Search'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Quick Nav Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => router.back()}
            className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-slate-200 hover:text-white font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all active:scale-95 backdrop-blur-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{language === 'bn' ? 'পূর্ববর্তী পেজে ফিরুন' : 'Go Back'}</span>
          </button>

          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-brand-500/25 transition-all active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>{language === 'bn' ? 'হোমপেজে যান' : 'Back to Home'}</span>
          </Link>

          <Link
            href="/shop"
            className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-slate-200 hover:text-white font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all active:scale-95 backdrop-blur-sm"
          >
            <ShoppingBag className="w-4 h-4 text-brand-400" />
            <span>{language === 'bn' ? 'সব পণ্য দেখুন' : 'Explore Shop'}</span>
          </Link>

          <Link
            href="/booking"
            className="px-5 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/30 text-amber-300 font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all active:scale-95 backdrop-blur-sm"
          >
            <Wrench className="w-4 h-4 text-amber-400" />
            <span>{language === 'bn' ? 'সার্ভিস বুক করুন' : 'Book Specialist'}</span>
          </Link>
        </div>

        {/* Popular Categories Shortcut Tray */}
        <div className="pt-4 border-t border-white/10 max-w-2xl mx-auto w-full">
          <p className="text-xs text-slate-400 mb-3 font-medium">
            {language === 'bn' ? 'জনপ্রিয় বিভাগসমূহ:' : 'Or explore popular destinations:'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {popularShortcuts.map((item, idx) => (
              <Link
                key={idx}
                href={item.href}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-brand-400/40 text-slate-300 hover:text-white text-xs font-medium transition-all"
              >
                {item.icon}
                <span>{item.title}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Live Help & Hotline Support Card */}
        <div className="max-w-xl mx-auto w-full bg-gradient-to-r from-brand-900/40 via-slate-900/60 to-brand-950/40 border border-brand-500/20 rounded-2xl p-4 sm:p-5 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 border border-brand-400/30 flex items-center justify-center shrink-0">
              <PhoneCall className="w-5 h-5 text-brand-400" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white">
                {language === 'bn' ? 'নির্দিষ্ট কোনো পণ্য খুঁজছেন?' : 'Looking for a specific model or part?'}
              </h4>
              <p className="text-[11px] text-slate-300 mt-0.5">
                {language === 'bn' 
                  ? 'মৌলভীবাজার হেডকোয়ার্টারে স্টক জানতে সরাসরি কল বা মেসেজ দিন'
                  : 'Check live stock at our Moulvibazar Hub via hotline or WhatsApp.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <a
              href={`tel:${BUSINESS_CONFIG.contact.phoneRaw}`}
              className="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>{BUSINESS_CONFIG.contact.phone}</span>
            </a>
            <a
              href={BUSINESS_CONFIG.contact.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
