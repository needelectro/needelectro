'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-4 py-4 text-left"
        type="button"
      >
        <span className="text-sm font-bold text-slate-900 leading-snug">{q}</span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 shrink-0 mt-0.5 transition-transform duration-200 ${
            open ? 'rotate-180 text-brand-600' : ''
          }`}
        />
      </button>
      {open && (
        <p className="pb-4 text-xs text-slate-600 leading-relaxed pr-8">{a}</p>
      )}
    </div>
  );
}
