import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tactixi.app',
  appName: 'TactiXI',
  webDir: 'www',
  /*
Source - https://stackoverflow.com/a/79769343
Posted by Najam Us Saqib, modified by community. See post 'Timeline' for change history
Retrieved 2026-05-26, License - CC BY-SA 4.0
*/

android : {
   adjustMarginsForEdgeToEdge?: 'auto' | 'force' | 'disable';
},

  plugins: {
    SplashScreen: {
      backgroundColor: '#094f2a',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      launchAutoHide: true,
    },
    StatusBar: {
      overlaysWebView: false,
      backgroundColor: '#00000000',
      style: 'DEFAULT',
    },
  },
};

export default config;
