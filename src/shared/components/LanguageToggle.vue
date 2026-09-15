<template>
  <div
    role="group"
    :aria-label="t('language.label')"
    class="inline-flex rounded-md border border-gray-300 bg-white p-0.5 shadow-sm"
  >
    <button
      v-for="option in SUPPORTED_LOCALES"
      :key="option"
      type="button"
      :lang="option"
      :aria-label="t(`language.${option}`)"
      :aria-pressed="locale === option"
      class="min-h-11 min-w-11 cursor-pointer rounded px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 sm:min-h-8 sm:min-w-0"
      :class="locale === option ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'"
      @click="setLocale(option)"
    >
      {{ SHORT_LABELS[option] }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { SUPPORTED_LOCALES, setLocale, type AppLocale } from '@/i18n'

const { t, locale } = useI18n()

// short labels are the same in every language (I18N-3)
const SHORT_LABELS: Record<AppLocale, string> = {
  uk: 'UA',
  en: 'EN',
}
</script>
