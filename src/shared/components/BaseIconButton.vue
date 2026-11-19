<template>
  <!-- a round header button around an icon: 44 px below sm (VR-9); never shrinks, so it stays a circle in a crowded header (NG-2); give it an aria-label -->
  <button
    ref="button"
    type="button"
    class="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border bg-surface text-ink-soft shadow-sm transition-colors hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-accent sm:size-9"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { useTemplateRef } from 'vue'

// the <button> itself, e.g. to return focus to it
const element = useTemplateRef<HTMLButtonElement>('button')
defineExpose({ element })
</script>
