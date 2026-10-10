import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export interface BrandLogoProps {
  /**
   * 'combined': Authentic brand icon emblem + styled typography
   * 'full': Official full NeedElectro logo image
   * 'symbol': Just the brand icon symbol
   */
  variant?: 'combined' | 'full' | 'symbol';
  theme?: 'light' | 'dark' | 'auto';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  href?: string | null;
  className?: string;
  priority?: boolean;
}

const SIZE_CONFIG = {
  xs: {
    symbol: 24,
    symbolClass: 'w-6 h-6',
    fullHeight: 24,
    titleClass: 'text-base',
    subClass: 'text-[9px]',
  },
  sm: {
    symbol: 32,
    symbolClass: 'w-8 h-8',
    fullHeight: 32,
    titleClass: 'text-lg',
    subClass: 'text-[9px]',
  },
  md: {
    symbol: 40,
    symbolClass: 'w-10 h-10',
    fullHeight: 40,
    titleClass: 'text-xl sm:text-2xl',
    subClass: 'text-[10px]',
  },
  lg: {
    symbol: 52,
    symbolClass: 'w-13 h-13',
    fullHeight: 52,
    titleClass: 'text-2xl sm:text-3xl',
    subClass: 'text-xs',
  },
  xl: {
    symbol: 64,
    symbolClass: 'w-16 h-16',
    fullHeight: 64,
    titleClass: 'text-3xl sm:text-4xl',
    subClass: 'text-xs',
  },
};

export default function BrandLogo({
  variant = 'combined',
  theme = 'light',
  size = 'md',
  showSubtitle = true,
  href = '/',
  className = '',
  priority = false,
}: BrandLogoProps) {
  const cfg = SIZE_CONFIG[size] || SIZE_CONFIG.md;
  const isDark = theme === 'dark';

  const content = (() => {
    if (variant === 'full') {
      const src = isDark
        ? '/brand/needelectro-logo-white.png'
        : '/brand/needelectro-logo.png';
      return (
        <div className={`relative inline-flex items-center shrink-0 ${className}`}>
          <Image
            src={src}
            alt="NEED ELECTRO"
            width={180}
            height={cfg.fullHeight}
            className="h-auto w-auto max-h-12 object-contain"
            priority={priority}
          />
        </div>
      );
    }

    if (variant === 'symbol') {
      return (
        <div
          className={`relative inline-flex items-center justify-center shrink-0 rounded-2xl overflow-hidden transition-transform group-hover:scale-105 ${cfg.symbolClass} ${className}`}
        >
          <Image
            src="/brand/needelectro-icon.png"
            alt="NEED ELECTRO Logo"
            width={cfg.symbol}
            height={cfg.symbol}
            className="w-full h-full object-contain filter drop-shadow-sm"
            priority={priority}
          />
        </div>
      );
    }

    // Default: 'combined'
    return (
      <div className={`flex items-center gap-2.5 sm:gap-3 group shrink-0 min-w-0 ${className}`}>
        {/* Authentic Icon Emblem container */}
        <div
          className={`relative flex items-center justify-center rounded-xl sm:rounded-2xl shrink-0 p-1 transition-transform duration-300 group-hover:scale-105 shadow-md ${
            isDark
              ? 'bg-white/10 backdrop-blur-md border border-white/20 shadow-brand-500/20'
              : 'bg-gradient-to-br from-white via-brand-50/80 to-brand-100/60 border border-brand-200/60 shadow-brand-500/15'
          } ${cfg.symbolClass}`}
        >
          <Image
            src="/brand/needelectro-icon.png"
            alt="NEED ELECTRO"
            width={cfg.symbol}
            height={cfg.symbol}
            className="w-full h-full object-contain filter drop-shadow"
            priority={priority}
          />
        </div>

        {/* Brand Typography */}
        <div className="flex flex-col min-w-0 leading-tight">
          <div className="flex items-center gap-1">
            <span
              className={`font-black tracking-tight ${cfg.titleClass} ${
                isDark ? 'text-white' : 'text-slate-950'
              }`}
            >
              NEED
            </span>
            <span
              className={`font-black tracking-tight ${cfg.titleClass} ${
                isDark ? 'text-brand-400' : 'text-brand-500'
              }`}
            >
              ELECTRO
            </span>
          </div>

          {showSubtitle && (
            <span
              className={`font-semibold tracking-wider uppercase hidden sm:block ${cfg.subClass} ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              } -mt-0.5`}
            >
              Trusted Electrical &amp; Tech Solutions
            </span>
          )}
        </div>
      </div>
    );
  })();

  if (href) {
    return (
      <Link href={href} className="inline-flex shrink-0 no-underline">
        {content}
      </Link>
    );
  }

  return content;
}
