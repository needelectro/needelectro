'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function PromotionsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/cms?tab=promotions');
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-500">
      <Loader2 className="w-8 h-8 animate-spin text-[#008CFF] mb-3" />
      <p className="text-sm font-medium">Navigating to Promotions &amp; Discounts...</p>
    </div>
  );
}
