'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TechnicianEarningsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/technician/dashboard?tab=earnings');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
    </div>
  );
}
