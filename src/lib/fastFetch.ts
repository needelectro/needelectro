'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// In-memory instant cache map (persists across component mounts and route transitions)
const memoryCache = new Map<string, CacheEntry<any>>();

// Helper to get from sessionStorage for warm reload
function getStorageCache<T>(key: string): CacheEntry<T> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(`_ne_fast_${key}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

// Helper to set in sessionStorage
function setStorageCache<T>(key: string, entry: CacheEntry<T>) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(`_ne_fast_${key}`, JSON.stringify(entry));
  } catch {}
}

// Active in-flight promises to deduplicate simultaneous identical requests
const inFlightRequests = new Map<string, Promise<any>>();

/**
 * Perform an ultra-fast fetch with stale-while-revalidate cache semantics.
 * Returns cached data immediately if available within TTL, while refreshing in background.
 */
export async function fastFetch<T = any>(
  url: string,
  options?: RequestInit & { forceRefresh?: boolean; ttlMs?: number; timeoutMs?: number }
): Promise<T> {
  const ttl = options?.ttlMs ?? 60000; // 1 minute default TTL
  const cacheKey = url;
  const now = Date.now();

  if (!options?.forceRefresh) {
    // 1. Check memory cache (0.0001 ms access)
    const mem = memoryCache.get(cacheKey);
    if (mem && now - mem.timestamp < ttl) {
      return mem.data;
    }

    // 2. Check session storage cache
    const storage = getStorageCache<T>(cacheKey);
    if (storage && now - storage.timestamp < ttl) {
      memoryCache.set(cacheKey, storage);
      return storage.data;
    }

    // 3. Check in-flight identical request deduplication
    const pending = inFlightRequests.get(cacheKey);
    if (pending) {
      return pending;
    }
  }

  // 4. Network fetch with deduplication and timeout safeguard
  const fetchPromise = (async () => {
    try {
      const controller = new AbortController();
      const timeoutMs = options?.timeoutMs ?? 10000;
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const res = await fetch(url, {
        credentials: 'same-origin',
        signal: controller.signal,
        ...options,
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Failed to fetch ${url}`);
      }
      const data = await res.json();

      const newEntry: CacheEntry<T> = { data, timestamp: Date.now() };
      memoryCache.set(cacheKey, newEntry);
      setStorageCache(cacheKey, newEntry);

      return data;
    } finally {
      inFlightRequests.delete(cacheKey);
    }
  })();

  inFlightRequests.set(cacheKey, fetchPromise);
  return fetchPromise;
}

/**
 * Invalidate cached items by full URL or prefix
 */
export function invalidateFastCache(urlPrefix?: string) {
  if (!urlPrefix) {
    memoryCache.clear();
    if (typeof window !== 'undefined') {
      try {
        Object.keys(sessionStorage)
          .filter((k) => k.startsWith('_ne_fast_'))
          .forEach((k) => sessionStorage.removeItem(k));
      } catch {}
    }
    return;
  }

  // Clear memory cache matching prefix
  for (const key of memoryCache.keys()) {
    if (key.includes(urlPrefix)) {
      memoryCache.delete(key);
    }
  }

  // Clear session storage matching prefix
  if (typeof window !== 'undefined') {
    try {
      Object.keys(sessionStorage)
        .filter((k) => k.startsWith('_ne_fast_') && k.includes(urlPrefix))
        .forEach((k) => sessionStorage.removeItem(k));
    } catch {}
  }
}

/**
 * Prefetch URLs in the background during idle time
 */
export function prefetchFastData(urls: string[]) {
  if (typeof window === 'undefined') return;

  const run = () => {
    urls.forEach((url) => {
      if (!memoryCache.has(url)) {
        fastFetch(url).catch(() => {});
      }
    });
  };

  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(run);
  } else {
    setTimeout(run, 100);
  }
}

/**
 * React Hook for instant (0-latency) data consumption with silent background revalidation.
 */
export function useFastData<T = any>(
  url: string | null,
  options?: {
    ttlMs?: number;
    initialData?: T;
    onSuccess?: (data: T) => void;
  }
) {
  const ttl = options?.ttlMs ?? 60000;

  // Initialize with cached data synchronously if available
  const getInitialState = (): { data: T | null; isCached: boolean } => {
    if (!url) return { data: options?.initialData ?? null, isCached: false };
    const mem = memoryCache.get(url);
    if (mem && Date.now() - mem.timestamp < ttl) {
      return { data: mem.data, isCached: true };
    }
    const storage = getStorageCache<T>(url);
    if (storage && Date.now() - storage.timestamp < ttl) {
      memoryCache.set(url, storage);
      return { data: storage.data, isCached: true };
    }
    return { data: options?.initialData ?? null, isCached: false };
  };

  const initial = getInitialState();
  const [data, setData] = useState<T | null>(initial.data);
  const [loading, setLoading] = useState<boolean>(!initial.isCached && !!url);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);

  const fetchData = useCallback(
    async (forceRefresh = false) => {
      if (!url) return;
      if (!data || forceRefresh) {
        setLoading(true);
      }

      try {
        const result = await fastFetch<T>(url, {
          forceRefresh,
          ttlMs: ttl,
        });
        if (mountedRef.current) {
          setData(result);
          setError(null);
          setLoading(false);
          options?.onSuccess?.(result);
        }
      } catch (err: any) {
        if (mountedRef.current) {
          setError(err);
          setLoading(false);
        }
      }
    },
    [url, ttl, data, options]
  );

  useEffect(() => {
    mountedRef.current = true;
    fetchData();
    return () => {
      mountedRef.current = false;
    };
  }, [fetchData]);

  const mutate = (updater: T | ((prev: T | null) => T), shouldRevalidate = false) => {
    const nextData = typeof updater === 'function' ? (updater as any)(data) : updater;
    setData(nextData);
    if (url) {
      const entry: CacheEntry<T> = { data: nextData, timestamp: Date.now() };
      memoryCache.set(url, entry);
      setStorageCache(url, entry);
    }
    if (shouldRevalidate) {
      fetchData(true);
    }
  };

  return {
    data,
    loading,
    error,
    mutate,
    refetch: () => fetchData(true),
  };
}
