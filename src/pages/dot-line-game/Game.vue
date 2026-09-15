<template>
  <div class="flex flex-col gap-4">
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

    <RulesToggle class="w-full sm:max-w-130" />
  </div>
</template>

<script setup lang="ts">
import type { Dot, DotLineGame } from '@/models'
import { StorageService } from '@/services'
import { CURRENT_GAME } from '@/static'
import { computed, ref, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import GameBoard from './game/GameBoard.vue'
import GameResult from './game/GameResult.vue'
import GameStatus from './game/GameStatus.vue'
import RulesToggle from './rules/RulesToggle.vue'

const props = defineProps<{
  dotLineGame: DotLineGame
}>()

const selectedDot = ref<Dot | null>(null)

const { t } = useI18n()

const hint = computed(() => {
  if (selectedDot.value) {
    return t('game.hintSelected')
  }
  if (props.dotLineGame.lines.length === 0) {
    return t('game.hintFirstLine')
  }
  return t('game.hintStart')
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
