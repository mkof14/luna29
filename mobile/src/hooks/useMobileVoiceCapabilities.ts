import { useCallback, useMemo } from 'react';
import { Platform } from 'react-native';

/** React Native voice capabilities — mirrors web `useMobileVoiceCapabilities`. */
export const useMobileVoiceCapabilities = () => {
  const isIOS = Platform.OS === 'ios';
  const isAndroid = Platform.OS === 'android';
  const isMobile = isIOS || isAndroid;

  const hasMediaDevices = useMemo(() => isMobile, [isMobile]);

  const warmUpMicrophone = useCallback(async () => {
    // Native recording permissions are requested when user taps record in VoiceReflectionScreen.
    return isMobile;
  }, [isMobile]);

  return {
    isMobile,
    isIOS,
    isAndroid,
    isStandalonePwa: false,
    hasSpeechRecognition: false,
    hasMediaDevices,
    prefersReducedMotion: false,
    warmUpMicrophone,
  };
};
