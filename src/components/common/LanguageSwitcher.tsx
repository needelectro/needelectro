'use client';

import React from 'react';
import { useLanguage } from '@/lib/context/LanguageContext';
import { Globe } from 'lucide-react';

interface LanguageSwitcherProps {
  /**
   * 'header-desktop': Compact pill with globe icon for desktop header
   * 'header-mobile': Ultra-compact toggle for mobile header
   * 'drawer': Full-width segmented pill for mobile navigation drawer
   * 'footer': Dark frosted glass pill for footer
   * 'compact': Minimalist inline selector
   */
  variant?: 'header-desktop' | 'header-mobile' | 'drawer' | 'footer' | 'compact';
  className?: string;
  showIcon?: boolean;
}

export default function LanguageSwitcher({
  variant = 'header-desktop',
  className = '',
  showIcon = true,
}: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage();

  if (variant === 'header-mobile') {
    return (
      <div
        className={`inline-flex items-center rounded-lg bg-slate-100 p-0.5 border border-slate-200/80 shadow-xs ${className}`}
        role="group"
        aria-label="Language selection"
      >
        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={`px-2 py-1 text-[11px] font-bold rounded-md transition-all select-none ${
            language === 'en'
              ? 'bg-[#008CFF] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 active:scale-95'
          }`}
          aria-pressed={language === 'en'}
          title="Switch to English"
        >
          EN
        </button>
        <button
          type="button"
          onClick={() => setLanguage('bn')}
          className={`px-2 py-1 text-[11px] font-bold rounded-md transition-all select-none ${
            language === 'bn'
              ? 'bg-[#008CFF] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 active:scale-95'
          }`}
          aria-pressed={language === 'bn'}
          title="বাংলা ভাষায় পরিবর্তন করুন"
        >
          বাংলা
        </button>
      </div>
    );
  }

  if (variant === 'drawer') {
    return (
      <div
        className={`w-full bg-slate-50 border border-slate-200 rounded-xl p-1 flex items-center gap-1 ${className}`}
        role="group"
        aria-label="Language selection"
      >
        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
            language === 'en'
              ? 'bg-[#008CFF] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white'
          }`}
          aria-pressed={language === 'en'}
        >
          <span>English</span>
          {language === 'en' && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
        </button>
        <button
          type="button"
          onClick={() => setLanguage('bn')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all font-medium ${
            language === 'bn'
              ? 'bg-[#008CFF] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white'
          }`}
          aria-pressed={language === 'bn'}
        >
          <span>বাংলা (Bengali)</span>
          {language === 'bn' && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
        </button>
      </div>
    );
  }

  if (variant === 'footer') {
    return (
      <div
        className={`inline-flex items-center rounded-xl bg-slate-900/80 backdrop-blur-md p-1 border border-white/10 ${className}`}
        role="group"
        aria-label="Language selection"
      >
        {showIcon && <Globe className="w-3.5 h-3.5 text-slate-400 ml-2 mr-1.5" aria-hidden="true" />}
        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
            language === 'en'
              ? 'bg-[#008CFF] text-white shadow-xs'
              : 'text-slate-400 hover:text-white'
          }`}
          aria-pressed={language === 'en'}
        >
          EN
        </button>
        <span className="text-slate-600 px-0.5 text-xs">|</span>
        <button
          type="button"
          onClick={() => setLanguage('bn')}
          className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
            language === 'bn'
              ? 'bg-[#008CFF] text-white shadow-xs'
              : 'text-slate-400 hover:text-white'
          }`}
          aria-pressed={language === 'bn'}
        >
          বাংলা
        </button>
      </div>
    );
  }

  // Default 'header-desktop': Clean glassmorphic pill
  return (
    <div
      className={`inline-flex items-center rounded-xl bg-white/70 hover:bg-white/95 backdrop-blur-md p-0.5 border border-white/80 shadow-xs transition-all ${className}`}
      role="group"
      aria-label="Language selector"
    >
      {showIcon && <Globe className="w-3.5 h-3.5 text-slate-500 ml-2 mr-1" aria-hidden="true" />}
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-2 py-1 text-[11px] xl:text-xs font-extrabold rounded-lg transition-all duration-150 select-none ${
          language === 'en'
            ? 'bg-[#008CFF] text-white shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
        }`}
        aria-pressed={language === 'en'}
        title="English"
      >
        EN
      </button>
      <span className="text-slate-300 px-0.5 text-xs select-none">|</span>
      <button
        type="button"
        onClick={() => setLanguage('bn')}
        className={`px-2 py-1 text-[11px] xl:text-xs font-extrabold rounded-lg transition-all duration-150 select-none ${
          language === 'bn'
            ? 'bg-[#008CFF] text-white shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
        }`}
        aria-pressed={language === 'bn'}
        title="বাংলা"
      >
        বাংলা
      </button>
    </div>
  );
}
