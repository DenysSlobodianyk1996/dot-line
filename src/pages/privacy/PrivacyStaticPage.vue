<template>
  <!-- the static store page (privacy/index.html, PV-4): both languages, no script -->
  <main class="mx-auto flex max-w-2xl flex-col gap-6">
    <nav aria-label="Language / Мова" class="flex gap-3">
      <a href="#en" hreflang="en" :class="LINK_CLASS">English</a>
      <a href="#uk" hreflang="uk" :class="LINK_CLASS">Українська</a>
    </nav>
    <div id="en"><PrivacyContent locale="en" /></div>
    <div id="uk"><PrivacyContent locale="uk" :heading-level="2" /></div>
    <!-- the app sits one level up: <pages>/dots-and-boxes/ (the router opens the game) -->
    <a data-open-game href="../" :class="LINK_CLASS" class="self-start">
      {{ t('privacy.openGame', {}, { locale: 'en' }) }} ·
      {{ t('privacy.openGame', {}, { locale: 'uk' }) }}
    </a>
  </main>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import PrivacyContent from '@/shared/components/PrivacyContent.vue'

const { t } = useI18n()

const LINK_CLASS = 'font-bold text-accent underline underline-offset-3 hover:text-accent-hover'
</script>
