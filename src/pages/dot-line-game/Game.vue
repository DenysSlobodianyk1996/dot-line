<template>
  <div>
    <BaseButton color="secondary" @click="goBack">Back</BaseButton>
    <p>Game:</p>
    <pre>{{ dotLineGame }}</pre>
  </div>
</template>

<script setup lang="ts">
import type { DotLineGame } from '@/models'
import { StorageService } from '@/services'
import { CURRENT_GAME } from '@/static'
import { watchEffect } from 'vue'
import BaseButton from '@/shared/components/BaseButton.vue'

const props = defineProps<{
  dotLineGame: DotLineGame
}>()

watchEffect(() => {
  StorageService.setItem(CURRENT_GAME, props.dotLineGame)
})

function goBack() {
  StorageService.removeItem(CURRENT_GAME)
  props.dotLineGame.reset()
}
</script>

<style lang="scss" scoped></style>
