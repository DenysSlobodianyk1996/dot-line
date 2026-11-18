<template>
  <label class="block text-sm font-medium text-ink-soft cursor-pointer">
    <slot></slot>
    <!-- the required marker is for sighted users only; the input itself is announced as
         required (aria-required) (GS-1, GS-2) -->
    <span v-if="required" aria-hidden="true" class="text-danger"> *</span>
  </label>
</template>

<script setup lang="ts">
defineProps<{
  required?: boolean
}>()
</script>

<style lang="scss" scoped></style>
