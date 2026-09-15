<template>
  <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
    <GameBoard v-model:selected-dot="selectedDot" :dot-line-game="dotLineGame" />
    <GameResult
      v-if="dotLineGame.isFinished"
      :dot-line-game="dotLineGame"
      @new-game="newGame"
      @rematch="rematch"
    />
    <GameStatus v-else :dot-line-game="dotLineGame" :hint="hint" @stop="stop" />
  </div>
</template>

<script setup lang="ts">
import type { Dot, DotLineGame } from '@/models'
import { StorageService } from '@/services'
import { CURRENT_GAME } from '@/static'
import { computed, ref, watchEffect } from 'vue'
import GameBoard from './game/GameBoard.vue'
import GameResult from './game/GameResult.vue'
import GameStatus from './game/GameStatus.vue'

const props = defineProps<{
  dotLineGame: DotLineGame
}>()

const selectedDot = ref<Dot | null>(null)

const hint = computed(() => {
  if (selectedDot.value) {
    return 'Pick a highlighted neighbor to draw the line. Pick the selected dot again to cancel.'
  }
  if (props.dotLineGame.lines.length === 0) {
    return 'Pick any dot to start the first line.'
  }
  return 'Pick a highlighted dot to start a line.'
})

watchEffect(() => {
  StorageService.setItem(CURRENT_GAME, props.dotLineGame)
})

function stop() {
  selectedDot.value = null
  props.dotLineGame.stop()
}

function rematch() {
  selectedDot.value = null
  props.dotLineGame.start()
}

function newGame() {
  StorageService.removeItem(CURRENT_GAME)
  props.dotLineGame.reset()
}
</script>

<style lang="scss" scoped></style>
