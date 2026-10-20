'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Calculator, 
  Wrench, 
  ShieldCheck, 
  MessageSquare, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';

export default function QuickUtilityCards() {
  const { language } = useLanguage();

  const utilities = language === 'bn' ? [
    {
      title: 'টেকনিশিয়ান বুকিং',
      subtitle: 'সার্টিফাইড ইলেকট্রিশিয়ান ও সিসিটিভি এক্সপার্ট',
      badge: 'অন-ডিমান্ড',
      href: '/booking',
      icon: <Wrench className="w-5 h-5 text-white" />,
      gradient: 'from-blue-600 to-indigo-600',
      badgeBg: 'bg-blue-500/20 text-blue-200 border-blue-400/30'
    },
    {
      title: 'ইলেকট্রিক্যাল ও সিসিটিভি হিসাব',
      subtitle: 'কাজের বাজেট ও প্রজেক্ট খরচের ধারণা নিন',
      badge: 'ক্যালকুলেটর',
      href: '/booking',
      icon: <Calculator className="w-5 h-5 text-white" />,
      gradient: 'from-emerald-600 to-teal-700',
      badgeBg: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30'
    },
    {
      title: 'ডিজিটাল ওয়ারেন্টি চেক',
      subtitle: 'সিরিয়াল দিয়ে আসল পণ্য ও মেয়াদ যাচাই করুন',
      badge: 'অনলাইন ট্র্যাকার',
      href: '/warranty',
      icon: <ShieldCheck className="w-5 h-5 text-white" />,
      gradient: 'from-amber-600 to-orange-600',
      badgeBg: 'bg-amber-500/20 text-amber-200 border-amber-400/30'
    },
    {
      title: 'অভিযোগ ও সরাসরি হেল্প',
      subtitle: 'দ্রুত সমস্যা সমাধান বা ওয়ারেন্টি সহায়তা',
      badge: '২৪/৭ সাপোর্ট',
      href: '/contact',
      icon: <MessageSquare className="w-5 h-5 text-white" />,
      gradient: 'from-purple-600 to-pink-600',
      badgeBg: 'bg-purple-500/20 text-purple-200 border-purple-400/30'
    }
  ] : [
    {
      title: 'Book a Specialist',
      subtitle: 'Certified electrician & CCTV installation',
      badge: 'On-Demand',
      href: '/booking',
      icon: <Wrench className="w-5 h-5 text-white" />,
      gradient: 'from-blue-600 to-indigo-600',
      badgeBg: 'bg-blue-500/20 text-blue-200 border-blue-400/30'
    },
    {
      title: 'Setup & Cost Estimator',
      subtitle: 'Plan electrical wiring & security budgets',
      badge: 'Calculator',
      href: '/booking',
      icon: <Calculator className="w-5 h-5 text-white" />,
      gradient: 'from-emerald-600 to-teal-700',
      badgeBg: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30'
    },
    {
      title: 'Track Warranty & Serial',
      subtitle: 'Verify authentic equipment & claims',
      badge: 'Instant Lookup',
      href: '/warranty',
      icon: <ShieldCheck className="w-5 h-5 text-white" />,
      gradient: 'from-amber-600 to-orange-600',
      badgeBg: 'bg-amber-500/20 text-amber-200 border-amber-400/30'
    },
    {
      title: 'Raise Ticket / Complain',
      subtitle: 'Quick support & direct customer care',
      badge: 'Assistance',
      href: '/contact',
      icon: <MessageSquare className="w-5 h-5 text-white" />,
      gradient: 'from-purple-600 to-pink-600',
      badgeBg: 'bg-purple-500/20 text-purple-200 border-purple-400/30'
    }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {utilities.map((item, idx) => (
          <Link
            key={idx}
            href={item.href}
            className="group relative overflow-hidden rounded-2xl bg-white p-4 sm:p-5 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 flex flex-col justify-between"
          >
            {/* Top row with Icon and Badge */}
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-md shadow-slate-200/50 group-hover:scale-105 transition-transform duration-300`}>
                {item.icon}
              </div>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${item.badgeBg}`}>
                {item.badge}
              </span>
            </div>

            {/* Content */}
            <div>
              <h3 className="font-bold text-slate-900 group-hover:text-brand-600 text-sm sm:text-base transition-colors flex items-center justify-between">
                <span>{item.title}</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {item.subtitle}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
