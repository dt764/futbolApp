import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tactixi.app',
  appName: 'TactiXI',
  webDir: 'www',
  plugins: {
    SplashScreen: {
      backgroundColor: '#006030',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      launchAutoHide: true,
    },
  },
};

export default config;
