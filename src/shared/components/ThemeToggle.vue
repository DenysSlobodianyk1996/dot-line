<template>
  <!-- names what it switches to, not the current theme (VR-16) -->
  <button
    type="button"
    data-theme-toggle
    :aria-label="theme === 'dark' ? t('theme.light') : t('theme.dark')"
    class="flex size-11 cursor-pointer items-center justify-center rounded-full border border-border bg-surface text-ink-soft shadow-sm transition-colors hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-accent sm:size-9"
    @click="toggle"
  >
    <LightModeIcon v-if="theme === 'dark'" :size="20" />
    <DarkModeIcon v-else :size="20" />
  </button>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useTheme } from '@/shared/composables/useTheme'
import DarkModeIcon from '@/shared/icons/DarkModeIcon.vue'
import LightModeIcon from '@/shared/icons/LightModeIcon.vue'

const { t } = useI18n()
const { theme, toggle } = useTheme()
</script>
