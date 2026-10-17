'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
        // If admin is on any non-admin route, redirect to admin dashboard immediately
        if (!pathname?.startsWith('/admin')) {
          router.replace('/admin/dashboard');
        }
      } else if (user.role === 'TECHNICIAN') {
        // If technician is on any non-technician route, redirect to technician dashboard immediately
        if (!pathname?.startsWith('/technician')) {
          router.replace('/technician/dashboard');
        }
      }
    }
  }, [user, isLoading, pathname, router]);

  return <>{children}</>;
}
