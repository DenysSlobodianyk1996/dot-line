<template>
  <!-- read-only: the computer player's name and automatic color (CM-4, CM-9) -->
  <fieldset class="flex min-w-0 flex-1 gap-2 rounded-lg border border-border p-4">
    <legend class="px-2 text-sm font-semibold text-ink-soft">{{ t('setup.opponent') }}</legend>
    <div class="flex min-w-0 flex-1 flex-col gap-2">
      <div class="block text-sm font-medium text-ink-soft">{{ t('setup.name') }}</div>
      <div
        class="flex min-h-9.5 items-center gap-1.5 rounded-md border border-border bg-surface-muted px-3 py-2 text-sm text-ink-soft"
      >
        <RobotIcon :size="18" />
        <span data-name>{{ displayName(COMPUTER_NAME) }}</span>
      </div>
    </div>
    <div class="flex flex-col gap-2">
      <div class="block text-sm font-medium text-ink-soft">{{ t('setup.color') }}</div>
      <div class="h-9.5 w-10 shrink-0 rounded-md border border-border bg-surface-muted p-1">
        <div data-color class="size-full rounded-[5px]" :style="{ backgroundColor: color }"></div>
      </div>
    </div>
  </fieldset>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { COMPUTER_NAME } from '@/models'
import { useDisplayName } from '@/shared/composables/useDisplayName'
import RobotIcon from '@/shared/components/RobotIcon.vue'

defineProps<{
  color: string
}>()

const { t } = useI18n()
const displayName = useDisplayName()
</script>
