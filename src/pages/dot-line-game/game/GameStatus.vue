<template>
  <div class="flex w-50 flex-col gap-4">
    <div class="flex flex-col gap-1">
      <div class="text-sm font-medium text-gray-700">Turn</div>
      <div class="flex items-center gap-2 font-semibold text-gray-900">
        <span
          class="size-3 shrink-0 rounded-full"
          :style="{ backgroundColor: dotLineGame.currentPlayer?.color }"
        ></span>
        <span class="min-w-0 truncate">{{ dotLineGame.currentPlayer?.name }}</span>
      </div>
    </div>

    <div class="flex flex-col gap-1">
      <div class="text-sm font-medium text-gray-700">Score</div>
      <PlayerScore
        v-for="player in dotLineGame.players"
        :key="player.name"
        :player
        :score="dotLineGame.scoreOf(player.name)"
      />
    </div>

    <p class="text-sm text-gray-500">{{ hint }}</p>

    <div class="flex">
      <BaseButton color="secondary" @click="isConfirmOpen = true">Stop</BaseButton>
    </div>

    <div
      v-if="isConfirmOpen"
      class="fixed inset-0 z-10 flex items-center justify-center bg-gray-900/40 p-4"
      @click.self="isConfirmOpen = false"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="stop-game-title"
        class="flex w-75 flex-col gap-4 rounded-lg border border-gray-300 bg-white p-6 shadow-lg"
      >
        <h3 id="stop-game-title" class="text-xl font-bold text-gray-900">Stop the game?</h3>
        <p class="text-sm text-gray-700">Whoever owns more squares now wins.</p>
        <div class="flex flex-col">
          <PlayerScore
            v-for="player in dotLineGame.players"
            :key="player.name"
            :player
            :score="dotLineGame.scoreOf(player.name)"
          />
        </div>
        <div class="flex justify-end gap-2">
          <BaseButton color="secondary" @click="isConfirmOpen = false">Cancel</BaseButton>
          <BaseButton color="primary" @click="confirmStop">Stop game</BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DotLineGame } from '@/models'
import { ref } from 'vue'
import BaseButton from '@/shared/components/BaseButton.vue'
import PlayerScore from './PlayerScore.vue'

defineProps<{
  dotLineGame: DotLineGame
  hint: string
}>()

const emit = defineEmits<{
  stop: []
}>()

const isConfirmOpen = ref(false)

function confirmStop() {
  isConfirmOpen.value = false
  emit('stop')
}
</script>
