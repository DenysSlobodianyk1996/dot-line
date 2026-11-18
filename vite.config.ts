import { fileURLToPath, URL } from 'node:url'

import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA, type ManifestOptions } from 'vite-plugin-pwa'
import { MANIFEST_FILES } from './src/static/manifests'
import en from './src/i18n/locales/en'
import uk from './src/i18n/locales/uk'

// The Android app's build (`vite build --mode capacitor`): Capacitor serves the bundled files from
// the root and they ship inside the app, so there is no service worker and no install manifest
// (AR-1, AR-2)
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
    },
    plugins: [vue(), vueDevTools(), tailwindcss(), ...(isCapacitor ? [] : pwaPlugins())],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: 4200,
    },
  }
})
