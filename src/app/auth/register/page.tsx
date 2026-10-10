'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function AuthRegisterRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role');

  useEffect(() => {
    if (role === 'TECHNICIAN' || role === 'technician') {
      router.replace('/technician/register');
    } else {
      router.replace('/customer/register');
    }
  }, [router, role]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-sm">
      <div className="animate-pulse">Directing to Registration...</div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
      <AuthRegisterRedirect />
    </Suspense>
  );
}
