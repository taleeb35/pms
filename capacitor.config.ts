import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.zonoir.app',
  appName: 'Zonoir',
  webDir: 'dist',
  // For DEVELOPMENT hot-reload from Lovable sandbox, uncomment the block below.
  // For PRODUCTION (Play Store / App Store), keep it commented so the app loads bundled dist/.
  // server: {
  //   url: 'https://3c386893-9ed0-471a-baec-b67fe3c59e96.lovableproject.com?forceHideBadge=true',
  //   cleartext: true,
  // },
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
