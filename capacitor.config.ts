import type { CapacitorConfig } from '@capacitor/cli'

// The Android app wraps the capacitor-mode web build (`vite build --mode capacitor`), which Capacitor
// bundles into the APK/AAB, so the game works offline from the first launch (AR-1, AR-2)
const config: CapacitorConfig = {
  appId: 'app.dotsandboxes.connected',
  appName: 'Dots and Boxes: Connected',
  webDir: 'dist',
}

export default config
