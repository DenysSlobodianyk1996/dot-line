<template>
  <span v-if="errorMessage" data-field-error class="text-sm text-danger">{{ errorMessage }}</span>
</template>

<script setup lang="ts">
defineProps<{
  errorMessage?: string
}>()
</script>
