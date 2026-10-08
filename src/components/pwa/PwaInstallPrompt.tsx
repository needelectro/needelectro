'use client';

import React, { useState, useEffect } from 'react';
import { Download, X, WifiOff, Zap } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Register Service Worker
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.error('Service worker registration failed:', err);
      });
    }

    // Check online/offline state
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Capture beforeinstallprompt event
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show install prompt if user hasn't dismissed it previously
      const dismissed = localStorage.getItem('need_electro_pwa_dismissed');
      if (!dismissed) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

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

  const handleDismiss = () => {
    setShowInstallBanner(false);
    localStorage.setItem('need_electro_pwa_dismissed', 'true');
  };

  return (
    <>
      {/* Offline Status Warning Pill */}
      {isOffline && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-amber-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-xs font-semibold animate-bounce">
          <WifiOff className="w-4 h-4" />
          <span>You are currently offline. Cached services and details remain viewable.</span>
        </div>
      )}

      {/* PWA App Install Banner */}
      {showInstallBanner && (
        <div className="fixed bottom-16 md:bottom-6 left-4 right-4 md:left-6 md:right-auto md:max-w-md z-50 bg-slate-950 text-white p-4 rounded-2xl shadow-2xl border border-slate-800 animate-in slide-in-from-bottom duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-brand-500 flex items-center justify-center shrink-0 shadow-md">
                <Zap className="w-6 h-6 fill-white" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Install NEED ELECTRO App</h4>
                <p className="text-xs text-slate-400 mt-0.5 leading-snug">
                  Fast access to service bookings, job notifications, and product orders on your device.
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
