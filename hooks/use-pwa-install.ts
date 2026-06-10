'use client';

import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export type PWAPlatform = 'android' | 'ios' | 'desktop' | null;

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [platform, setPlatform] = useState<PWAPlatform>(null);

  useEffect(() => {
    // Detect if already running as installed PWA
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Detect platform
    const ua = navigator.userAgent;
    const isIOS = /iphone|ipad|ipod/i.test(ua);
    const isAndroid = /android/i.test(ua);

    if (isIOS) setPlatform('ios');
    else if (isAndroid) setPlatform('android');
    else setPlatform('desktop');

    // Deteksi terpasang walau sedang di tab browser (Android Chromium).
    // Butuh related_applications berisi entri "webapp" di manifest.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nav = navigator as any;
    if (typeof nav.getInstalledRelatedApps === 'function') {
      nav.getInstalledRelatedApps()
        .then((apps: unknown[]) => { if (apps && apps.length > 0) setIsInstalled(true); })
        .catch(() => {});
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const install = async (): Promise<'accepted' | 'dismissed' | 'ios' | null> => {
    if (platform === 'ios') return 'ios';

    if (!deferredPrompt) return null;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setIsInstalled(true);
    setDeferredPrompt(null);
    return outcome;
  };

  const canInstall = !isInstalled && (platform === 'ios' || !!deferredPrompt);
  // Prompt install native benar-benar siap dipicu (hanya Chromium Android/desktop).
  const promptReady = !!deferredPrompt;

  return { install, canInstall, isInstalled, platform, promptReady };
}
