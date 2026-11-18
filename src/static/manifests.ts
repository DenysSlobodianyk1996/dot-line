// One install manifest per language, so the installed app's name follows the language
// (VR-50, VR-51). vite.config.ts emits both under Vite's base; the page links the current one.
export const MANIFEST_FILES = {
  uk: 'manifest.uk.webmanifest',
  en: 'manifest.en.webmanifest',
} as const
