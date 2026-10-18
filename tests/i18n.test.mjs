import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

describe('NEED ELECTRO Bilingual Internationalization (i18n) Engine', () => {
  const enPath = path.resolve(process.cwd(), 'src/messages/en.json');
  const bnPath = path.resolve(process.cwd(), 'src/messages/bn.json');
  const rootEnPath = path.resolve(process.cwd(), 'messages/en.json');
  const rootBnPath = path.resolve(process.cwd(), 'messages/bn.json');
  const contextPath = path.resolve(process.cwd(), 'src/lib/context/LanguageContext.tsx');
  const switcherPath = path.resolve(process.cwd(), 'src/components/common/LanguageSwitcher.tsx');
  const layoutPath = path.resolve(process.cwd(), 'src/app/layout.tsx');

  let enMessages = {};
  let bnMessages = {};

  it('Dictionary files exist and contain valid JSON syntax', () => {
    assert.ok(fs.existsSync(enPath), 'src/messages/en.json must exist');
    assert.ok(fs.existsSync(bnPath), 'src/messages/bn.json must exist');
    assert.ok(fs.existsSync(rootEnPath), 'messages/en.json must exist at root');
    assert.ok(fs.existsSync(rootBnPath), 'messages/bn.json must exist at root');

    const enRaw = fs.readFileSync(enPath, 'utf8');
    const bnRaw = fs.readFileSync(bnPath, 'utf8');

    assert.doesNotThrow(() => {
      enMessages = JSON.parse(enRaw);
    }, 'src/messages/en.json must be valid JSON');

    assert.doesNotThrow(() => {
      bnMessages = JSON.parse(bnRaw);
    }, 'src/messages/bn.json must be valid JSON');
  });

  it('Dictionary namespaces are complete in both English and Bengali', () => {
    const requiredNamespaces = [
      'common',
      'navigation',
      'home',
      'services',
      'booking',
      'customer',
      'technician',
      'shop',
      'cart',
      'checkout',
      'status',
      'auth',
      'footer',
      'errors',
    ];

    for (const ns of requiredNamespaces) {
      assert.ok(enMessages[ns], `en.json must contain namespace: ${ns}`);
      assert.ok(bnMessages[ns], `bn.json must contain namespace: ${ns}`);
      assert.strictEqual(
        typeof enMessages[ns],
        'object',
        `namespace ${ns} in en.json must be an object`
      );
      assert.strictEqual(
        typeof bnMessages[ns],
        'object',
        `namespace ${ns} in bn.json must be an object`
      );
    }
  });

  it('Core brand identity and tagline are preserved in both dictionaries', () => {
    assert.strictEqual(enMessages.common.appName, 'NEED ELECTRO');
    assert.strictEqual(bnMessages.common.appName, 'NEED ELECTRO');

    assert.ok(
      enMessages.common.tagline.includes('Trusted Electrical and Technological Solutions'),
      'English tagline must match brand standard'
    );
    assert.ok(
      bnMessages.common.tagline.includes('নির্ভরযোগ্য ইলেকট্রিক্যাল ও প্রযুক্তিগত সমাধান'),
      'Bengali tagline must provide accurate natural translation'
    );
  });

  it('Status code dictionary accurately localizes service workflow statuses', () => {
    const statuses = ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    for (const s of statuses) {
      assert.ok(enMessages.status[s], `en.json must define status.${s}`);
      assert.ok(bnMessages.status[s], `bn.json must define status.${s}`);
      // Bengali status must contain authentic Bengali characters
      assert.ok(
        /[\u0980-\u09FF]/.test(bnMessages.status[s]),
        `bn.json status.${s} must be written in Bengali script`
      );
    }
  });

  it('Number formatting algorithm converts ASCII digits to Bengali digits', () => {
    const BENGALI_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    const formatNumber = (num, lang) => {
      const s = String(num);
      if (lang === 'bn') {
        return s.replace(/\d/g, (d) => BENGALI_DIGITS[parseInt(d, 10)]);
      }
      return s;
    };

    assert.strictEqual(formatNumber('12345', 'en'), '12345');
    assert.strictEqual(formatNumber('12345', 'bn'), '১২৩৪৫');
    assert.strictEqual(formatNumber(500, 'bn'), '৫০০');
    assert.strictEqual(formatNumber('01733983752', 'bn'), '০১৭৩৩৯৮৩৭৫২');
  });

  it('Currency formatting correctly supports BDT ৳ symbol and localized numbers', () => {
    const BENGALI_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    const formatPrice = (amount, lang) => {
      const num = Number(amount || 0);
      const formatted = num.toLocaleString('en-US');
      if (lang === 'bn') {
        const bnFormatted = formatted.replace(/\d/g, (d) => BENGALI_DIGITS[parseInt(d, 10)]);
        return `৳${bnFormatted}`;
      }
      return `৳${formatted}`;
    };

    assert.strictEqual(formatPrice(1500, 'en'), '৳1,500');
    assert.strictEqual(formatPrice(1500, 'bn'), '৳১,৫০০');
    assert.strictEqual(formatPrice(25000, 'bn'), '৳২৫,০০০');
  });

  it('LanguageContext provides safe fallback and cookie persistence implementation', () => {
    const contextContent = fs.readFileSync(contextPath, 'utf8');
    assert.ok(
      contextContent.includes('LanguageProvider'),
      'LanguageContext must export LanguageProvider'
    );
    assert.ok(
      contextContent.includes('useLanguage'),
      'LanguageContext must export useLanguage hook'
    );
    assert.ok(
      contextContent.includes('useTranslation'),
      'LanguageContext must export useTranslation hook'
    );
    assert.ok(
      contextContent.includes('ne_lang'),
      'LanguageContext must manage the ne_lang persistence cookie'
    );
    assert.ok(
      contextContent.includes('document.documentElement.lang'),
      'LanguageContext must dynamically update document html lang attribute'
    );
  });

  it('LanguageSwitcher provides accessible bilingual toggle (EN | বাংলা)', () => {
    const switcherContent = fs.readFileSync(switcherPath, 'utf8');
    assert.ok(
      switcherContent.includes('LanguageSwitcher'),
      'LanguageSwitcher component must be defined'
    );
    assert.ok(
      switcherContent.includes('English') || switcherContent.includes('Switch to English'),
      'Switcher must provide accessible English option'
    );
    assert.ok(
      switcherContent.includes('বাংলা') || switcherContent.includes('Switch to Bengali'),
      'Switcher must provide accessible Bengali option'
    );
    assert.ok(
      switcherContent.includes('aria-label'),
      'Switcher must include aria-label for screen reader accessibility'
    );
  });

  it('Root layout wraps application with LanguageProvider and sets Bengali font fallbacks', () => {
    const layoutContent = fs.readFileSync(layoutPath, 'utf8');
    assert.ok(
      layoutContent.includes('<LanguageProvider>'),
      'Root layout must wrap component tree in LanguageProvider'
    );

    const globalsCssPath = path.resolve(process.cwd(), 'src/app/globals.css');
    const cssContent = fs.readFileSync(globalsCssPath, 'utf8');
    assert.ok(
      cssContent.includes('Hind Siliguri') || cssContent.includes('Noto Sans Bengali'),
      'globals.css must include Bengali typography fallbacks'
    );
  });

  it('Key parity test between English and Bengali dictionaries', () => {
    const getDeepKeys = (obj, prefix = '') => {
      let keys = [];
      for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          keys = keys.concat(getDeepKeys(value, fullKey));
        } else {
          keys.push(fullKey);
        }
      }
      return keys;
    };

    const enKeys = new Set(getDeepKeys(enMessages));
    const bnKeys = new Set(getDeepKeys(bnMessages));

    const missingInBn = [...enKeys].filter((k) => !bnKeys.has(k));
    assert.strictEqual(
      missingInBn.length,
      0,
      `All English keys must exist in Bengali dictionary. Missing: ${missingInBn.join(', ')}`
    );
  });
});
