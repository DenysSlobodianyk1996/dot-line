<template>
  <div>
    <p>Game:</p>
    <pre>{{ dotLineGame }}</pre>
  </div>
</template>

<script setup lang="ts">
import type { DotLineGame } from '@/models'

defineProps<{
  dotLineGame: DotLineGame
}>()
</script>

<style lang="scss" scoped></style>
