<template>
  <!-- the whole name, wrapping if needed; the swatch stays on the first line (GB-5) -->
  <div class="flex items-start gap-2 text-sm leading-6 text-gray-900">
    <span
      class="mt-1.5 size-3 shrink-0 rounded-full"
      :style="{ backgroundColor: player.color }"
    ></span>
    <span class="min-w-0 grow wrap-break-word">{{ displayName(player.name) }}</span>
    <span class="font-semibold tabular-nums">{{ score }}</span>
  </div>
</template>

<script setup lang="ts">
import type { Player } from '@/models'
import { useDisplayName } from '@/shared/composables/useDisplayName'

defineProps<{
  player: Player
  score: number
}>()

const displayName = useDisplayName()
</script>
