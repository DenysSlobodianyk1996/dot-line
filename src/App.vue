<template>
  <!-- the screen's height and never scrolls: the header stays on top and each screen scrolls
       inside its own <main> (AppScreen.vue, MB-11) -->
  <div data-app-shell class="flex h-app flex-col overflow-hidden p-safe-2">
    <!-- every screen: game name on the left; theme, rules and language on the right (VR-18, VR-21, VR-23) -->
    <AppHeader>
      <ThemeToggle />
      <BaseIconButton
        ref="rulesButton"
        data-rules-button
        :aria-label="t('rules.open')"
        aria-haspopup="dialog"
        :aria-expanded="rulesPanel.isOpenedBy(rulesButton?.element)"
        @click="rulesPanel.open($event.currentTarget)"
      >
        <InfoIcon :size="20" />
      </BaseIconButton>
      <LanguageToggle />
    </AppHeader>
    <RouterView />
    <RulesPanel :return-focus-to="rulesButton?.element ?? null" />
  </div>
</template>

<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import AppHeader from '@/shared/components/AppHeader.vue'
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
