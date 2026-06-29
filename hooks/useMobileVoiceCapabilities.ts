import { useCallback, useEffect, useMemo, useState } from 'react';

export type MobileVoiceCapabilities = {
  isMobile: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isStandalonePwa: boolean;
  hasSpeechRecognition: boolean;
  hasMediaDevices: boolean;
  prefersReducedMotion: boolean;
  /** Request mic permission early on mobile for lower latency on first tap */
  warmUpMicrophone: () => Promise<boolean>;
};

const detectMobile = () => {
  if (typeof window === 'undefined') {
    return { isMobile: false, isIOS: false, isAndroid: false, isStandalonePwa: false };
  }
  const ua = navigator.userAgent || '';
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/i.test(ua);
  const isMobile = isIOS || isAndroid || window.matchMedia('(max-width: 768px)').matches;
  const isStandalonePwa =
    window.matchMedia('(display-mode: standalone)').matches ||
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
  return { isMobile, isIOS, isAndroid, isStandalonePwa };
};

export const useMobileVoiceCapabilities = (): MobileVoiceCapabilities => {
  const [env] = useState(() => detectMobile());
  const [micReady, setMicReady] = useState(false);

  const hasSpeechRecognition = useMemo(
    () => typeof window !== 'undefined' && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition),
    [],
  );

  const hasMediaDevices = useMemo(
    () => typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia),
    [],
  );

  const prefersReducedMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  );

  const warmUpMicrophone = useCallback(async () => {
    if (!hasMediaDevices || micReady) return micReady;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setMicReady(true);
      return true;
    } catch {
      return false;
    }
  }, [hasMediaDevices, micReady]);

  useEffect(() => {
    if (!env.isMobile || !hasMediaDevices) return;
    const onFirstTouch = () => {
      warmUpMicrophone().catch(() => undefined);
    };
    window.addEventListener('touchstart', onFirstTouch, { once: true, passive: true });
    return () => window.removeEventListener('touchstart', onFirstTouch);
  }, [env.isMobile, hasMediaDevices, warmUpMicrophone]);

  return {
    ...env,
    hasSpeechRecognition,
    hasMediaDevices,
    prefersReducedMotion,
    warmUpMicrophone};
};
