import { configure } from 'vee-validate'
import { createI18n } from 'vue-i18n'
import { StorageService } from '@/services'
import { LOCALE, MANIFEST_FILES } from '@/static'
import en from './locales/en'
import uk from './locales/uk'

export const SUPPORTED_LOCALES = ['uk', 'en'] as const
export type AppLocale = (typeof SUPPORTED_LOCALES)[number]
export const DEFAULT_LOCALE: AppLocale = 'uk'

function isAppLocale(value: unknown): value is AppLocale {
  return SUPPORTED_LOCALES.includes(value as AppLocale)
}

// a saved choice wins; Ukrainian only on the first visit (I18N-2, I18N-4)
const savedLocale = StorageService.getItem(LOCALE)

export const i18n = createI18n({
  legacy: false,
  locale: isAppLocale(savedLocale) ? savedLocale : DEFAULT_LOCALE,
  fallbackLocale: 'en',
  messages: { uk, en },
})

// the manifest link decides the installed app's name, so it follows the language (VR-50, VR-51)
// The Android app's build has no install manifest, so it links none (AR-1)
function linkManifest(locale: AppLocale) {
  if (import.meta.env.MODE === 'capacitor') return
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="manifest"]')
  if (!link) {
    link = document.createElement('link')
    link.rel = 'manifest'
    document.head.append(link)
  }
  link.setAttribute('href', `${import.meta.env.BASE_URL}${MANIFEST_FILES[locale]}`)
}

function applyDocumentLocale(locale: AppLocale) {
  document.documentElement.lang = locale
  document.title = i18n.global.t('app.title')
  linkManifest(locale)
}

export function setLocale(locale: AppLocale) {
  i18n.global.locale.value = locale
  StorageService.setItem(LOCALE, locale)
  applyDocumentLocale(locale)
}

// validation messages are generated in the current language when a field validates (GS-1, I18N-6)
configure({
  generateMessage: ({ field, rule }) => {
    if (rule?.name === 'differentFromAll') return i18n.global.t('validation.differentNames')
    if (rule?.name === 'differentColor') return i18n.global.t('colors.taken')
    if (rule?.name === 'notComputerName') return i18n.global.t('validation.computerName')
    if (rule?.name === 'max') {
      // string rules pass params as a list: `max:15` → ['15']
      const [length] = Array.isArray(rule.params) ? rule.params : []
      return i18n.global.t('validation.maxLength', { field, length })
    }
    return i18n.global.t('validation.invalid', { field })
  },
})

applyDocumentLocale(i18n.global.locale.value as AppLocale)
