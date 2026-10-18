'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserSession } from '@/types';

interface AuthContextType {
  user: UserSession | null;
  isLoading: boolean;
  login: (
    identifier: string,
    password: string,
    expectedRole?: string
  ) => Promise<{ success: boolean; error?: string; redirectUrl?: string }>;
  register: (
    data: Record<string, any>
  ) => Promise<{ success: boolean; error?: string; redirectUrl?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem('_ne_user_session');
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        if (sessionStorage.getItem('_ne_user_session')) return false;
      } catch {}
    }
    return true;
  });

  const syncUser = (nextUser: UserSession | null) => {
    setUser(nextUser);
    if (typeof window !== 'undefined') {
      try {
        if (nextUser) {
          sessionStorage.setItem('_ne_user_session', JSON.stringify(nextUser));
        } else {
          sessionStorage.removeItem('_ne_user_session');
        }
      } catch {}
    }
  };

  const refreshUser = async () => {
    try {
      const res = await fetch('/api/v1/auth/me');
      if (res.ok) {
        const data = await res.json();
        syncUser(data.user);
      } else {
        syncUser(null);
      }
    } catch {
      // Retain existing session on transient network errors, only clear if definitively unauthenticated
      if (!user) syncUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (identifier: string, password: string, expectedRole?: string) => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password, expectedRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to sign in', redirectUrl: data.redirectUrl };
      }
      syncUser(data.user);
      return { success: true, redirectUrl: data.redirectUrl };
    } catch {
      return { success: false, error: 'Network error. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (formData: Record<string, any>) => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Registration failed' };
      }
      syncUser(data.user);
      return { success: true, redirectUrl: data.redirectUrl };
    } catch {
      return { success: false, error: 'Network error during registration.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST' });
    } finally {
      syncUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
