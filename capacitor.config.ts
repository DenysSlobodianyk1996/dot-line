import type { CapacitorConfig } from '@capacitor/cli'

// The Android app wraps the capacitor-mode web build (`vite build --mode capacitor`), which Capacitor
// bundles into the APK/AAB, so the game works offline from the first launch (AR-1, AR-2)
const config: CapacitorConfig = {
  appId: 'app.dotsandboxes',
  appName: 'Dots and Boxes',
  webDir: 'dist',
  plugins: {
    // Android 11 and older: the plugin shows this drawable full screen (FIT_XY). launch_splash is
    // cream with the logo unscaled in the middle, so it never stretches into ovals (AR-5)
    SplashScreen: { androidSplashResourceName: 'launch_splash' },
  },
}

export default config
