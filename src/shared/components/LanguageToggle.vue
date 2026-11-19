<template>
  <!-- one round button: shows the current language, a tap switches to the other one (I18N-3, I18N-5).
       Its accessible name is the switch, in the target language and marked with it (NG-3, NG-4) -->
  <BaseIconButton
    data-language-toggle
    :lang="target"
    :aria-label="t('language.switchTo', {}, { locale: target })"
    @click="setLocale(target)"
  >
    <span aria-hidden="true" :lang="current" class="text-sm font-bold">{{
      SHORT_LABELS[current]
    }}</span>
  </BaseIconButton>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { setLocale, type AppLocale } from '@/i18n'
import BaseIconButton from './BaseIconButton.vue'

const { t, locale } = useI18n()

// short labels are the same in every language (I18N-3)
const SHORT_LABELS: Record<AppLocale, string> = {
  uk: 'UA',
  en: 'EN',
}

// two languages only: the button always offers the other one (a third would need a menu)
const current = computed<AppLocale>(() => (locale.value === 'uk' ? 'uk' : 'en'))
const target = computed<AppLocale>(() => (current.value === 'uk' ? 'en' : 'uk'))
</script>
