import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.markwaldeis.towerdefense2d',
  appName: 'Tower Defense 2D',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'https'
  },
  ios: {
    // Full-bleed canvas; safe-area handled in CSS via env(safe-area-inset-*)
    contentInset: 'never',
    preferredContentMode: 'mobile',
    backgroundColor: '#2e1a0d',
    // Landscape-only gameplay (also enforced via CSS portrait overlay + Info.plist)
    scrollEnabled: false
  },
  android: {
    backgroundColor: '#2e1a0d',
    allowMixedContent: false
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#2e1a0d',
      showSpinner: false
    }
  }
};

export default config;
