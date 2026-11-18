<template>
  <button :class="btnClass"><slot></slot></button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  color: 'primary' | 'secondary'
}>()

const btnClass = computed(() => {
  return props.color === 'primary'
    ? 'inline-flex items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-on-accent shadow-sm transition-colors hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-paper disabled:cursor-not-allowed disabled:opacity-50'
    : 'rounded-md bg-surface-strong px-4 py-2 text-ink shadow-sm transition-colors hover:bg-border'
})
</script>

<style lang="scss" scoped></style>
