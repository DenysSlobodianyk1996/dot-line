<template>
  <!-- the header's brand: logo and game name on the left, the tools on the right (VR-18). The app
       fills the tools (App.vue); the static privacy page shows the brand alone: no script (PV-4) -->
  <header class="mb-4 flex items-center gap-2">
    <AppLogo />
    <span data-app-title class="mr-auto text-lg font-extrabold text-ink">{{
      t('app.shortName')
    }}</span>
    <slot />
  </header>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import AppLogo from '@/shared/components/AppLogo.vue'

const { t } = useI18n()
</script>
