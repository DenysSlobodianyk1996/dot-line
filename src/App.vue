<template>
  <div class="min-h-screen overflow-y-auto p-2">
    <!-- every screen: game name on the left; theme, rules and language on the right (VR-18, VR-21, VR-23) -->
    <header class="mb-4 flex items-center gap-2">
      <AppLogo />
      <span data-app-title class="mr-auto text-lg font-extrabold text-ink">{{
        t('app.title')
      }}</span>
      <ThemeToggle />
      <button
        ref="rulesButton"
        type="button"
        data-rules-button
        :aria-label="t('rules.open')"
        aria-haspopup="dialog"
        :aria-expanded="rulesPanel.isOpen.value"
        class="flex size-11 cursor-pointer items-center justify-center rounded-full border border-border bg-surface text-ink-soft shadow-sm transition-colors hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-accent sm:size-9"
        @click="rulesPanel.open"
      >
        <InfoIcon :size="20" />
      </button>
      <LanguageToggle />
    </header>
    <RouterView />
    <RulesPanel :return-focus-to="rulesButton" />
  </div>
</template>

<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import RulesPanel from '@/pages/dot-line-game/rules/RulesPanel.vue'
import AppLogo from '@/shared/components/AppLogo.vue'
import LanguageToggle from '@/shared/components/LanguageToggle.vue'
import ThemeToggle from '@/shared/components/ThemeToggle.vue'
import { useRulesPanel } from '@/shared/composables/useRulesPanel'
import InfoIcon from '@/shared/icons/InfoIcon.vue'

const { t } = useI18n()
const rulesPanel = useRulesPanel()
const rulesButton = useTemplateRef<HTMLButtonElement>('rulesButton')
</script>
