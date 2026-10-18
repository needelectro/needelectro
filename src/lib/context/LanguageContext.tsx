'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import enMessages from '@/messages/en.json';
import bnMessages from '@/messages/bn.json';

export type SupportedLanguage = 'en' | 'bn';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  toggleLanguage: () => void;
  isBengali: boolean;
  t: (key: string, fallback?: string, params?: Record<string, string | number>) => string;
  formatNumber: (val: number | string) => string;
  formatPrice: (amount: number) => string;
  formatStatus: (status: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const BENGALI_DIGITS: Record<string, string> = {
  '0': '০',
  '1': '১',
  '2': '২',
  '3': '৩',
  '4': '৪',
  '5': '৫',
  '6': '৬',
  '7': '৭',
  '8': '৮',
  '9': '৯',
};

const COOKIE_NAME = 'ne_lang';

function getInitialLanguage(): SupportedLanguage {
  if (typeof window === 'undefined') return 'en';
  try {
    // 1. Check Cookie
    const match = document.cookie.match(new RegExp('(^|;\\s*)' + COOKIE_NAME + '=([^;]+)'));
    if (match && (match[2] === 'en' || match[2] === 'bn')) {
      return match[2] as SupportedLanguage;
    }
    // 2. Check localStorage
    const saved = localStorage.getItem(COOKIE_NAME);
    if (saved === 'en' || saved === 'bn') {
      return saved as SupportedLanguage;
    }
  } catch {
    // Fallback to default
  }
  return 'en';
}

function resolveNestedKey(obj: any, path: string): string | undefined {
  if (!obj || !path) return undefined;
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }
  return typeof current === 'string' ? current : undefined;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>('en');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const initial = getInitialLanguage();
    setLanguageState(initial);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = initial === 'bn' ? 'bn-BD' : 'en-BD';
    }
  }, []);

  const setLanguage = useCallback((newLang: SupportedLanguage) => {
    setLanguageState(newLang);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(COOKIE_NAME, newLang);
        document.cookie = `${COOKIE_NAME}=${newLang}; path=/; max-age=31536000; SameSite=Lax`;
        document.documentElement.lang = newLang === 'bn' ? 'bn-BD' : 'en-BD';
      } catch {
        // Ignore quota/storage exceptions
      }
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'en' ? 'bn' : 'en');
  }, [language, setLanguage]);

  const t = useCallback(
    (key: string, fallback?: string, params?: Record<string, string | number>): string => {
      const activeDict = language === 'bn' ? bnMessages : enMessages;
      let text = resolveNestedKey(activeDict, key);

      // Safe fallback to English dictionary if key is missing in Bengali
      if (!text && language === 'bn') {
        text = resolveNestedKey(enMessages, key);
      }

      // Safe fallback to explicit fallback parameter or key itself
      if (!text) {
        text = fallback !== undefined ? fallback : key;
      }

      // Replace variable interpolation: e.g. {count} or {name}
      if (params && typeof text === 'string') {
        for (const [pKey, pVal] of Object.entries(params)) {
          const valStr = language === 'bn' && typeof pVal === 'number'
            ? String(pVal).replace(/\d/g, (d) => BENGALI_DIGITS[d] || d)
            : String(pVal);
          text = text.replace(new RegExp(`\\{${pKey}\\}`, 'g'), valStr);
        }
      }

      return text;
    },
    [language]
  );

  const formatNumber = useCallback(
    (val: number | string): string => {
      const str = String(val);
      if (language === 'bn') {
        return str.replace(/\d/g, (d) => BENGALI_DIGITS[d] || d);
      }
      return str;
    },
    [language]
  );

  const formatPrice = useCallback(
    (amount: number): string => {
      const formattedNum = new Intl.NumberFormat('en-IN').format(amount);
      if (language === 'bn') {
        const bnNum = formattedNum.replace(/\d/g, (d) => BENGALI_DIGITS[d] || d);
        return `৳ ${bnNum}`;
      }
      return `৳ ${formattedNum}`;
    },
    [language]
  );

  const formatStatus = useCallback(
    (status: string): string => {
      if (!status) return '';
      return t(`status.${status}`, status);
    },
    [t]
  );

  const contextValue = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      isBengali: language === 'bn',
      t,
      formatNumber,
      formatPrice,
      formatStatus,
    }),
    [language, setLanguage, toggleLanguage, t, formatNumber, formatPrice, formatStatus]
  );

  return <LanguageContext.Provider value={contextValue}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    // Provide safe non-throwing fallback if called outside provider (e.g. in standalone tests)
    return {
      language: 'en' as SupportedLanguage,
      setLanguage: () => {},
      toggleLanguage: () => {},
      isBengali: false,
      t: (key: string, fallback?: string) => fallback || key,
      formatNumber: (val: number | string) => String(val),
      formatPrice: (amt: number) => `৳ ${amt}`,
      formatStatus: (s: string) => s,
    };
  }
  return context;
}

export function useTranslation() {
  const { t, language, isBengali, formatNumber, formatPrice } = useLanguage();
  return { t, language, isBengali, formatNumber, formatPrice };
}
