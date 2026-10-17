'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';

export default function AccountRedirectPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace('/customer/login?redirect=/customer/dashboard');
      return;
    }

    if (user.role === 'TECHNICIAN') {
      router.replace('/technician/dashboard');
    } else if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
      router.replace('/admin/dashboard');
    } else {
      router.replace('/customer/dashboard');
    }
  }, [user, isLoading, router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
    </div>
  );
}
