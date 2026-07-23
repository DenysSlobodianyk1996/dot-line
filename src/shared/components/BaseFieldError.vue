<template>
  <span v-if="errorMessage" class="text-sm text-red-600">{{ errorMessage }}</span>
</template>

<script setup lang="ts">
defineProps<{
  errorMessage?: string
}>()
</script>
