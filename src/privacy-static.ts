/**
 * Server-side entry for the static privacy page, privacy/index.html: the privacy policy URL in
 * Google Play's listing (AR-15, PV-4). It must work without the app and without JavaScript, so
 * the same PrivacyContent the in-app screen uses is rendered to HTML here. vite.config.ts loads
 * this module through Vite (ssrLoadModule) for the build and for the dev server.
 */
import { createSSRApp } from 'vue'
import { createI18n } from 'vue-i18n'
import { renderToString } from 'vue/server-renderer'
import en from '@/i18n/locales/en'
import uk from '@/i18n/locales/uk'
import PrivacyStaticPage from '@/pages/privacy/PrivacyStaticPage.vue'

/**
 * The dark theme without JavaScript: the page can't run the theme script, so the dark values
 * (`:root[data-theme='dark']` in styles.css, passed in as `darkVars`) apply when the device
 * prefers dark.
 */
function darkThemeStyle(darkVars: string): string {
  return `@media (prefers-color-scheme: dark) { :root { color-scheme: dark !important; ${darkVars} } }`
}

/** The whole page. `stylesheet` is the app's CSS file, relative to the page. */
export async function renderPrivacyPage({
  stylesheet,
  darkVars,
}: {
  stylesheet: string
  darkVars: string
}): Promise<string> {
  // its own i18n: the app's (src/i18n) reads the device and localStorage, which a build has not
  const i18n = createI18n({ legacy: false, locale: 'en', fallbackLocale: 'en', messages: { en, uk } })
  const body = await renderToString(createSSRApp(PrivacyStaticPage).use(i18n))
  const title = `${en.privacy.title} · ${en.app.title}`
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="color-scheme" content="light dark" />
    <title>${title}</title>
    <link rel="icon" href="../favicon.svg" type="image/svg+xml" />
    <link rel="stylesheet" href="${stylesheet}" />
    <style>${darkThemeStyle(darkVars)}</style>
  </head>
  <body class="bg-paper p-safe-4 pb-12 text-ink">${body}</body>
</html>
`
}
