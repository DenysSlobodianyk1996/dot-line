/**
 * The oldest Chrome the game must work on: the Android app on a phone whose system WebView was
 * never updated, such as a Samsung S8's (AR-21). Vite builds the JS and CSS for it
 * (vite.config.ts), and src/static/__tests__/css-floor.spec.ts fails on built CSS it lacks.
 */
export const OLDEST_CHROME = 88
