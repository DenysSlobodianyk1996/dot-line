<template>
  <div class="min-h-screen p-2 overflow-y-auto">
    <header class="mb-2 flex justify-end">
      <LanguageToggle />
    </header>
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import LanguageToggle from '@/shared/components/LanguageToggle.vue'
</script>
