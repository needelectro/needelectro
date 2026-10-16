import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export interface BrandLogoProps {
  /**
   * 'full': Icon + "NEED ELECTRO" + "Trusted Electrical and Technological Solutions"
   * 'symbol': Icon only
   */
  variant?: 'full' | 'symbol';
  theme?: 'light' | 'dark' | 'auto';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  subtitleClassName?: string;
  href?: string | null;
  className?: string;
  priority?: boolean;
}

const SIZE_CONFIGS = {
  xs: {
    iconSize: 26,
    textSize: 'text-sm font-black',
    subtitleSize: 'text-[8.5px]',
    gap: 'gap-2',
    subtitleMargin: 'mt-0.5',
  },
  sm: {
    iconSize: 32,
    textSize: 'text-base sm:text-lg font-black',
    subtitleSize: 'text-[9.5px]',
    gap: 'gap-2.5',
    subtitleMargin: 'mt-0.5 sm:mt-1',
  },
  md: {
    iconSize: 42,
    textSize: 'text-xl sm:text-2xl font-black',
    subtitleSize: 'text-[11px] sm:text-xs',
    gap: 'gap-3',
    subtitleMargin: 'mt-1',
  },
  lg: {
    iconSize: 52,
    textSize: 'text-2xl sm:text-3xl font-black',
    subtitleSize: 'text-xs sm:text-sm',
    gap: 'gap-3.5',
    subtitleMargin: 'mt-1.5',
  },
  xl: {
    iconSize: 64,
    textSize: 'text-3xl sm:text-4xl font-black',
    subtitleSize: 'text-sm sm:text-base',
    gap: 'gap-4',
    subtitleMargin: 'mt-2',
  },
};

export default function BrandLogo({
  variant = 'full',
  theme = 'light',
  size = 'md',
  showSubtitle = true,
  subtitleClassName = '',
  href = '/',
  className = '',
  priority = false,
}: BrandLogoProps) {
  const isDark = theme === 'dark';
  const cfg = SIZE_CONFIGS[size] || SIZE_CONFIGS.md;

  const content = (() => {
    if (variant === 'symbol') {
      return (
        <div
          className={`relative inline-flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${className}`}
        >
          <Image
            src="/brand/needelectro-icon.png"
            alt="NEED ELECTRO Logo"
            width={cfg.iconSize}
            height={cfg.iconSize}
            style={{ width: `${cfg.iconSize}px`, height: 'auto' }}
            className="object-contain filter drop-shadow-sm"
            priority={priority}
          />
        </div>
      );
    }

    // Default 'full': Exactly matching https://needelectro.vercel.app/
    return (
      <div className={`relative inline-flex items-center ${cfg.gap} shrink-0 group select-none ${className}`}>
        {/* Lightning Bolt Icon */}
        <div className="relative shrink-0 flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
          <Image
            src="/brand/needelectro-icon.png"
            alt="NEED ELECTRO Symbol"
            width={cfg.iconSize}
            height={cfg.iconSize}
            style={{ width: `${cfg.iconSize}px`, height: 'auto' }}
            className="object-contain filter drop-shadow-sm"
            priority={priority}
          />
        </div>

        {/* Text Block: NEED ELECTRO + Subtitle */}
        <div className="flex flex-col justify-center leading-none">
          <div className={`${cfg.textSize} tracking-tight leading-none`}>
            <span className="text-[#008CFF]">NEED</span>{' '}
            <span className={isDark ? 'text-white' : 'text-[#0F172A]'}>ELECTRO</span>
          </div>
          {showSubtitle && (
            <span
              className={`font-medium ${cfg.subtitleSize} tracking-tight ${
                isDark ? 'text-slate-300' : 'text-slate-600'
              } ${cfg.subtitleMargin} leading-none block whitespace-nowrap ${subtitleClassName}`}
            >
              Trusted Electrical and Technological Solutions
            </span>
          )}
        </div>
      </div>
    );
  })();

  if (href) {
    return (
      <Link href={href} className="inline-flex shrink-0 no-underline" title="NEED ELECTRO — Trusted Electrical and Technological Solutions">
        {content}
      </Link>
    );
  }

  return content;
}
