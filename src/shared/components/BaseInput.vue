<template>
  <input
    v-bind="$attrs"
    ref="input"
    class="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink shadow-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent"
  />
</template>

<script setup lang="ts">
import { useTemplateRef } from 'vue'

const input = useTemplateRef('input')

defineExpose({
  input,
})
</script>

<style lang="scss" scoped>
::-webkit-color-swatch-wrapper {
  width: 100%;
  height: 100%;
  padding: 4px;
}
::-webkit-color-swatch {
  border-radius: 5px;
}
</style>
