import { configure } from 'vee-validate'
import { createI18n } from 'vue-i18n'
import { StorageService } from '@/services'
import { LOCALE } from '@/static'
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

function applyDocumentLocale(locale: AppLocale) {
  document.documentElement.lang = locale
  document.title = i18n.global.t('app.title')
}

export function setLocale(locale: AppLocale) {
  i18n.global.locale.value = locale
  StorageService.setItem(LOCALE, locale)
  applyDocumentLocale(locale)
}

// validation messages are generated in the current language when a field validates (GS-1, I18N-6)
configure({
  generateMessage: ({ field, rule }) =>
    rule?.name === 'differentFromAll'
      ? i18n.global.t('validation.differentNames')
      : i18n.global.t('validation.invalid', { field }),
})

applyDocumentLocale(i18n.global.locale.value as AppLocale)
