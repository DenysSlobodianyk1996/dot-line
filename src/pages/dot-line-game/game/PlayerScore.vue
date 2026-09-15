<template>
  <div class="flex items-center gap-2 text-sm leading-6 text-gray-900">
    <span class="size-3 shrink-0 rounded-full" :style="{ backgroundColor: player.color }"></span>
    <span class="min-w-0 grow truncate">{{ player.name }}</span>
    <span class="font-semibold tabular-nums">{{ score }}</span>
  </div>
</template>

<script setup lang="ts">
import type { Player } from '@/models'

defineProps<{
  player: Player
  score: number
}>()
</script>
