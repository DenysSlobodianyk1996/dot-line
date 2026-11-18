// Build facts shared by vite.config.ts and the app code, so neither keeps its own copy.

// The Android app's build (`vite build --mode capacitor`): Capacitor serves the bundled files from
// the root and they ship inside the app, so there is no service worker and no install manifest
// (AR-1, AR-2). The app compares import.meta.env.MODE with it, which the build folds to a constant,
// so the web build drops the native-only code.
export const CAPACITOR_MODE = 'capacitor'

// Pages that are not the app, so the service worker's offline navigation fallback must not answer
// them with index.html: the privacy policy (AR-15), with or without a trailing slash, index.html or
// a query string. Workbox tests these against the path plus the query string.
export const NOT_THE_APP_PAGES: RegExp[] = [/\/privacy(?:\/(?:index\.html)?)?(?:\?.*)?$/]
