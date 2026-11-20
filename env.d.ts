/// <reference types="vite/client" />

// true only in the Android app's build (`vite build --mode capacitor`), set by vite.config.ts (AR-1)
declare const __CAPACITOR_BUILD__: boolean

interface ImportMetaEnv {
  // the privacy policy's Updated date, YYYY-MM-DD, set by vite.config.ts for every build (AR-15)
  readonly VITE_PRIVACY_UPDATED?: string
  // the app's version, e.g. 1.0.2, set by vite.config.ts for every build (PV-5)
  readonly VITE_APP_VERSION?: string
}
