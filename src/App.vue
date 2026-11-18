<template>
  <div class="min-h-screen overflow-y-auto p-2">
    <!-- every screen: game name on the left, theme and language on the right (VR-18, VR-21) -->
    <header class="mb-4 flex items-center gap-2">
      <span data-app-title class="mr-auto text-lg font-extrabold text-ink">{{
        t('app.title')
      }}</span>
      <ThemeToggle />
      <LanguageToggle />
    </header>
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import LanguageToggle from '@/shared/components/LanguageToggle.vue'
import ThemeToggle from '@/shared/components/ThemeToggle.vue'

const { t } = useI18n()
</script>
