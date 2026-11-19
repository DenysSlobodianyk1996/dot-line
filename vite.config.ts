import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'

import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA, type ManifestOptions } from 'vite-plugin-pwa'
import { lowerForOldWebView } from './scripts/css-floor'
import { MANIFEST_FILES } from './src/static/manifests'
import { OLDEST_CHROME } from './src/static/oldest-chrome'
import { NOT_THE_APP_PAGES } from './src/static/service-worker'
import en from './src/i18n/locales/en'
import uk from './src/i18n/locales/uk'
import { fillPrivacyPage, privacyUpdated } from './scripts/privacy-updated'

// The Android app's build (`vite build --mode capacitor`): Capacitor serves the bundled files from
// the root and they ship inside the app, so there is no service worker and no install manifest
// (AR-1, AR-2). The app reads it as __CAPACITOR_BUILD__ (defined below), a literal the build
// folds, so the web build drops the native-only code and Capacitor itself.
const CAPACITOR_MODE = 'capacitor'

// GitHub Pages serves the app under /<repo>/; the deploy workflow sets BASE_PATH
const base = process.env.BASE_PATH ?? '/'

// splash and status bar: the light --wc-paper from styles.css; index.html's theme-color metas
// add the dark (cocoa) one (VR-46)
const CREAM = '#fbf5ec'

// Install manifest shared by both languages; only the names differ (VR-44..VR-46, VR-50, VR-51).
// short_name is the shorter launcher label, because launchers truncate the full name (UP-15).
// Icon paths are relative to the manifest, which sits at the base, so they work under any base.
function manifestFor(
  lang: keyof typeof MANIFEST_FILES,
  { title, shortName }: { title: string; shortName: string },
): Partial<ManifestOptions> {
  return {
    id: base,
    lang,
    name: title,
    short_name: shortName,
    start_url: base,
    scope: base,
    display: 'standalone',
    orientation: 'any',
    background_color: CREAM,
    theme_color: CREAM,
    icons: [
      { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
      {
        src: 'maskable-icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}

// The PWA plugin emits the Ukrainian manifest (the default the page links); this adds the English
// one and a 404.html copy of the page (GitHub Pages' deep-link fallback) so both get precached.
function extraPwaFiles(): Plugin {
  return {
    name: 'dots-and-boxes:extra-pwa-files',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      this.emitFile({
        type: 'asset',
        fileName: MANIFEST_FILES.en,
        source: JSON.stringify(manifestFor('en', en.app)),
      })
      const page = bundle['index.html']
      if (page?.type === 'asset') {
        this.emitFile({ type: 'asset', fileName: '404.html', source: page.source })
      }
    },
  }
}

// The privacy policy (AR-15) lives outside public/ so every build can stamp its "Updated" date:
// the built commit's date, or VITE_PRIVACY_UPDATED when set (scripts/privacy-updated.ts). Both
// the Pages build (where Workbox precaches it) and the Android build get privacy/index.html.
const PRIVACY_SOURCE = fileURLToPath(new URL('./src/static/privacy.html', import.meta.url))

function privacyPage(): Plugin {
  const render = () =>
    fillPrivacyPage(
      readFileSync(PRIVACY_SOURCE, 'utf8'),
      privacyUpdated({ given: process.env.VITE_PRIVACY_UPDATED }),
    )
  return {
    name: 'dots-and-boxes:privacy-page',
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'privacy/index.html', source: render() })
    },
    // dev: the same addresses the service worker leaves to the page (NOT_THE_APP_PAGES)
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url ?? ''
        if (!NOT_THE_APP_PAGES.some((page) => page.test(url))) return next()
        const path = url.split('?')[0] ?? ''
        if (path.endsWith('/privacy')) {
          res.writeHead(302, { Location: `${path}/` }).end()
          return
        }
        res.setHeader('Content-Type', 'text/html; charset=utf-8')
        res.end(render())
      })
    },
  }
}

// An old system WebView, such as a never-updated Samsung S8's (AR-21). Tailwind v4 puts its CSS in
// @layer (Chrome 99), which an older browser drops whole, leaving the app unstyled; and its
// var(--x,) empty fallbacks void the ring before Chrome ~105. This runs on the final, minified CSS
// files (so the minifier can't undo it), before Workbox hashes them for the precache.
function oldWebViewCss(): Plugin {
  return {
    name: 'dots-and-boxes:old-webview-css',
    apply: 'build',
    enforce: 'post',
    async generateBundle(_options, bundle) {
      for (const file of Object.values(bundle)) {
        if (file.type === 'asset' && file.fileName.endsWith('.css')) {
          file.source = await lowerForOldWebView(String(file.source))
        }
      }
    },
  }
}

// installable and offline (VR-44..VR-52): updates install silently and apply on the next
// launch; the game lives in localStorage, so an update never loses it (VR-48, VR-49)
function pwaPlugins() {
  return [
    VitePWA({
      registerType: 'autoUpdate',
      manifestFilename: MANIFEST_FILES.uk,
      manifest: manifestFor('uk', uk.app),
      // the icons are already matched by globPatterns, and the plugin precaches its own manifest
      includeManifestIcons: false,
      workbox: {
        // every built asset, incl. 404.html, the font and the icons, so it all works offline (VR-47)
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}', MANIFEST_FILES.en],
        navigateFallback: 'index.html',
        // the privacy policy is its own page (precached through privacy/index.html), not the app (AR-15)
        navigateFallbackDenylist: NOT_THE_APP_PAGES,
      },
    }),
    extraPwaFiles(),
  ]
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isCapacitor = mode === CAPACITOR_MODE
  return {
    base: isCapacitor ? '/' : base,
    // vue-i18n esm-bundler feature flags: Composition API only, no devtools in production
    define: {
      __VUE_I18N_FULL_INSTALL__: true,
      __VUE_I18N_LEGACY_API__: false,
      __INTLIFY_PROD_DEVTOOLS__: false,
      // true only in the Android app's build (see CAPACITOR_MODE)
      __CAPACITOR_BUILD__: isCapacitor,
    },
    plugins: [
      vue(),
      vueDevTools(),
      tailwindcss(),
      privacyPage(),
      oldWebViewCss(),
      ...(isCapacitor ? [] : pwaPlugins()),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    // An old system WebView (AR-21): build the JS and CSS for OLDEST_CHROME; oldWebViewCss() then
    // lowers what the CSS minifier leaves too new
    build: {
      target: [`chrome${OLDEST_CHROME}`, 'edge107', 'firefox104', 'safari16'],
      cssTarget: [`chrome${OLDEST_CHROME}`, 'edge107', 'firefox104', 'safari16'],
    },
    server: {
      port: 4200,
    },
  }
})
