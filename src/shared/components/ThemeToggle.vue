<template>
  <!-- names what it switches to, not the current theme (VR-16) -->
  <BaseIconButton
    data-theme-toggle
    :aria-label="theme === 'dark' ? t('theme.light') : t('theme.dark')"
    @click="toggle"
  >
    <LightModeIcon v-if="theme === 'dark'" :size="20" />
    <DarkModeIcon v-else :size="20" />
  </BaseIconButton>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import BaseIconButton from '@/shared/components/BaseIconButton.vue'
import { useTheme } from '@/shared/composables/useTheme'
import DarkModeIcon from '@/shared/icons/DarkModeIcon.vue'
import LightModeIcon from '@/shared/icons/LightModeIcon.vue'

const { t } = useI18n()
const { theme, toggle } = useTheme()
</script>
