'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Download, X, WifiOff, RefreshCw, Bell, CheckCircle2 } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PwaInstallPrompt() {
  const pathname = usePathname();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  useEffect(() => {
    // 1. Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone) {
      setIsInstalled(true);
    }

    // 2. Register Service Worker & handle updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          // If a worker is already waiting, trigger update notice
          if (registration.waiting) {
            setWaitingWorker(registration.waiting);
            setUpdateAvailable(true);
          }

          // Detect new worker installed and waiting
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setWaitingWorker(newWorker);
                  setUpdateAvailable(true);
                }
              });
            }
          });
        })
        .catch((err) => {
          console.warn('[PWA] Service worker registration notice:', err);
        });

      // Reload page when new worker takes over
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }

    // 3. Online/offline connectivity tracking
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setIsOffline(true);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 4. Capture beforeinstallprompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      const dismissed = localStorage.getItem('need_electro_pwa_dismissed');
      if (!dismissed) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // 5. Track successful install
    window.addEventListener('appinstalled', () => {
      setShowInstallBanner(false);
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setShowInstallBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleApplyUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
    setUpdateAvailable(false);
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    localStorage.setItem('need_electro_pwa_dismissed', 'true');
  };

  return (
    <>
      {/* Offline Status Warning Pill */}
      {isOffline && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-amber-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-xs font-semibold animate-pulse border border-amber-400">
          <WifiOff className="w-4 h-4 shrink-0" />
          <span>You are currently offline. Cached views remain available.</span>
        </div>
      )}

      {/* PWA Update Notice Bar */}
      {updateAvailable && (
        <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 bg-brand-900 text-white p-4 rounded-2xl shadow-2xl border border-brand-500/50 flex items-center justify-between gap-3 animate-in slide-in-from-bottom">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-5 h-5 text-brand-400 animate-spin" />
            <div>
              <p className="text-xs font-bold text-white">App Update Ready</p>
              <p className="text-[11px] text-brand-200">A new version of NEED ELECTRO is available.</p>
            </div>
          </div>
          <button
            onClick={handleApplyUpdate}
            className="px-3 py-1.5 bg-brand-500 hover:bg-brand-400 text-white font-bold text-xs rounded-xl shadow-md transition"
          >
            Update Now
          </button>
        </div>
      )}

      {/* PWA Install Banner */}
      {showInstallBanner && !isInstalled && (
        <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-6 md:right-auto md:max-w-md z-50 bg-slate-950 text-white p-4 rounded-2xl shadow-2xl border border-slate-800 animate-in slide-in-from-bottom duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-1.5 flex items-center justify-center shrink-0 shadow-md">
                <Image
                  src="/icons/icon-192.png"
                  alt="NEED ELECTRO App"
                  width={40}
                  height={40}
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                  Install NEED ELECTRO App
                  <span className="text-[9px] bg-brand-500 text-white px-1.5 py-0.5 rounded-full font-bold">Fast</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5 leading-snug">
                  Install our lightweight app for fast bookings, order tracking, and offline catalog access.
                </p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3.5 flex items-center gap-2">
            <button
              onClick={handleInstallClick}
              className="btn-primary text-xs py-2 px-4 flex-1 flex items-center justify-center gap-2"
            >
              <Download className="w-3.5 h-3.5" />
              Install Application
            </button>
            <button
              onClick={handleDismiss}
              className="btn-secondary text-xs py-2 px-3 bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800"
            >
              Later
            </button>
          </div>
        </div>
      )}
    </>
  );
}
