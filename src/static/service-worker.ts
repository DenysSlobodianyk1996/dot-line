// Pages that are not the app, so the service worker's offline navigation fallback must not answer
// them with index.html (vite.config.ts): the privacy policy (AR-15), with or without a trailing
// slash, index.html or a query string. Workbox tests these against the path plus the query string.
export const NOT_THE_APP_PAGES: RegExp[] = [/\/privacy(?:\/(?:index\.html)?)?(?:\?.*)?$/]
