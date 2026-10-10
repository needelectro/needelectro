'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function AuthLoginRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect');
  const role = searchParams.get('role');

  useEffect(() => {
    if (role === 'technician') {
      router.replace(`/technician/login${redirectTarget ? `?redirect=${encodeURIComponent(redirectTarget)}` : ''}`);
    } else {
      router.replace(`/customer/login${redirectTarget ? `?redirect=${encodeURIComponent(redirectTarget)}` : ''}`);
    }
  }, [router, redirectTarget, role]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-sm">
      <div className="animate-pulse">Directing to Sign In...</div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
      <AuthLoginRedirect />
    </Suspense>
  );
}
