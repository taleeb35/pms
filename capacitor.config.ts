import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.zonoir.app',
  appName: 'Zonoir',
  webDir: 'dist',
  server: {
    // Hot-reload from Lovable sandbox while developing.
    // Comment this `url` out (or remove it) before doing a production
    // Play Store / App Store build so the app loads the bundled `dist/` instead.
    url: 'https://3c386893-9ed0-471a-baec-b67fe3c59e96.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#ffffff',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
