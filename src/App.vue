<template>
  <div class="min-h-screen overflow-y-auto p-2">
    <!-- every screen: game name on the left; theme, rules and language on the right (VR-18, VR-21, VR-23) -->
    <header class="mb-4 flex items-center gap-2">
      <AppLogo />
      <span data-app-title class="mr-auto text-lg font-extrabold text-ink">{{
        t('app.title')
      }}</span>
      <ThemeToggle />
      <BaseIconButton
        ref="rulesButton"
        data-rules-button
        :aria-label="t('rules.open')"
        aria-haspopup="dialog"
        :aria-expanded="rulesPanel.isOpen.value"
        @click="rulesPanel.open"
      >
        <InfoIcon :size="20" />
      </BaseIconButton>
      <LanguageToggle />
    </header>
    <RouterView />
    <RulesPanel :return-focus-to="rulesButton?.element ?? null" />
  </div>
</template>

<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import AppLogo from '@/shared/components/AppLogo.vue'
import BaseIconButton from '@/shared/components/BaseIconButton.vue'
import LanguageToggle from '@/shared/components/LanguageToggle.vue'
import RulesPanel from '@/shared/components/RulesPanel.vue'
import ThemeToggle from '@/shared/components/ThemeToggle.vue'
import { useRulesPanel } from '@/shared/composables/useRulesPanel'
import InfoIcon from '@/shared/icons/InfoIcon.vue'

const { t } = useI18n()
const rulesPanel = useRulesPanel()
const rulesButton = useTemplateRef('rulesButton')
</script>
