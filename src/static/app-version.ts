/**
 * The app's version, e.g. 1.0.2 (FT-5): the same number on the web and in the Android app, from the
 * release tags. vite.config.ts puts it in VITE_APP_VERSION for every build, the dev server and
 * Vitest (scripts/app-version.ts), so nothing is bumped by hand.
 */
export const APP_VERSION: string = import.meta.env.VITE_APP_VERSION ?? '1.0.0'
