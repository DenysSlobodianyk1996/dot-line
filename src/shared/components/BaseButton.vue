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
    ? 'inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
    : 'rounded-md bg-gray-200 px-4 py-2 text-gray-900 hover:bg-gray-300'
})
</script>

<style lang="scss" scoped></style>
