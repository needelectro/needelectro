'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN')) {
      // If admin is on any non-admin route, redirect to admin dashboard immediately
      if (!pathname?.startsWith('/admin')) {
        router.replace('/admin/dashboard');
      }
    }
  }, [user, isLoading, pathname, router]);

  return <>{children}</>;
}
