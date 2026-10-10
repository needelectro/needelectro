import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export interface BrandLogoProps {
  /**
   * 'full': Uses public/logo.png directly as the official logo image
   * 'symbol': Uses the square brand icon symbol
   * 'combined': Logo with supplementary subtitle
   */
  variant?: 'full' | 'symbol' | 'combined';
  theme?: 'light' | 'dark' | 'auto';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  href?: string | null;
  className?: string;
  priority?: boolean;
}

const HEIGHT_CLASSES = {
  xs: 'h-6 sm:h-7',
  sm: 'h-8 sm:h-9',
  md: 'h-10 sm:h-12',
  lg: 'h-12 sm:h-14',
  xl: 'h-14 sm:h-16',
};

const SYMBOL_SIZES = {
  xs: 24,
  sm: 32,
  md: 42,
  lg: 52,
  xl: 64,
};

export default function BrandLogo({
  variant = 'full',
  theme = 'light',
  size = 'md',
  showSubtitle = false,
  href = '/',
  className = '',
  priority = false,
}: BrandLogoProps) {
  const isDark = theme === 'dark';
  const heightClass = HEIGHT_CLASSES[size] || HEIGHT_CLASSES.md;
  const symbolSize = SYMBOL_SIZES[size] || SYMBOL_SIZES.md;

  const content = (() => {
    if (variant === 'symbol') {
      return (
        <div
          className={`relative inline-flex items-center justify-center shrink-0 rounded-2xl overflow-hidden transition-transform duration-200 group-hover:scale-105 ${className}`}
        >
          <Image
            src="/brand/needelectro-icon.png"
            alt="NEED ELECTRO Logo"
            width={symbolSize}
            height={symbolSize}
            className="w-full h-full object-contain filter drop-shadow-sm"
            priority={priority}
          />
        </div>
      );
    }

    // Default: 'full' (uses /logo.png directly as requested by user)
    const logoSrc = isDark ? '/brand/needelectro-logo-white.png' : '/logo.png';

    return (
      <div className={`relative inline-flex flex-col items-start shrink-0 group ${className}`}>
        <Image
          src={logoSrc}
          alt="NEED ELECTRO"
          width={220}
          height={110}
          className={`${heightClass} w-auto object-contain transition-transform duration-200 group-hover:scale-105 filter drop-shadow-xs`}
          priority={priority}
        />
        {showSubtitle && (
          <span
            className={`text-[9px] font-semibold tracking-wider uppercase hidden sm:block ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            } mt-0.5 ml-1`}
          >
            Trusted Electrical &amp; Tech Solutions
          </span>
        )}
      </div>
    );
  })();

  if (href) {
    return (
      <Link href={href} className="inline-flex shrink-0 no-underline" title="NEED ELECTRO">
        {content}
      </Link>
    );
  }

  return content;
}
